import { config } from '@core/config.js';
import { Logger } from '@core/logger.js';
import { redis } from '@database/client.js';
import { claudeClient, StreamChunk } from './claude-client.js';

const logger = new Logger('AgentOrchestrator');

export interface AgentTask {
  id: string;
  type: string;
  sessionId: string;
  userId: string;
  input: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface AgentExecutor {
  execute(task: AgentTask): AsyncGenerator<StreamChunk>;
}

export class AgentOrchestrator {
  private agents: Map<string, AgentExecutor> = new Map();
  private runningTasks: Map<string, AgentTask> = new Map();
  private taskQueue: AgentTask[] = [];
  private concurrentLimit = config.agentMaxConcurrent;
  private processing = false;

  constructor() {
    this.registerDefaultAgents();
    this.startProcessing();
    logger.info('Agent orchestrator initialized', { concurrentLimit: this.concurrentLimit });
  }

  /**
   * Register default agent executors
   */
  private registerDefaultAgents(): void {
    // Chat assistant agent
    this.registerAgent('chat-assistant', {
      execute: async function* (task: AgentTask): AsyncGenerator<StreamChunk> {
        const { messages, systemPrompt } = task.input;

        for await (const chunk of claudeClient.chat(messages, {
          systemPrompt,
          stream: true,
        })) {
          yield chunk;
        }
      },
    });

    // Code generation agent
    this.registerAgent('code-generator', {
      execute: async function* (task: AgentTask): AsyncGenerator<StreamChunk> {
        const systemPrompt = `You are an expert code generator. Generate clean, efficient, and well-documented code based on user requirements.`;

        for await (const chunk of claudeClient.chat(task.input.messages, {
          systemPrompt,
          stream: true,
        })) {
          yield chunk;
        }
      },
    });

    // Data analysis agent
    this.registerAgent('data-analyst', {
      execute: async function* (task: AgentTask): AsyncGenerator<StreamChunk> {
        const systemPrompt = `You are a data analysis expert. Analyze data, identify patterns, and provide actionable insights.`;

        for await (const chunk of claudeClient.chat(task.input.messages, {
          systemPrompt,
          stream: true,
        })) {
          yield chunk;
        }
      },
    });

    // Research agent
    this.registerAgent('researcher', {
      execute: async function* (task: AgentTask): AsyncGenerator<StreamChunk> {
        const systemPrompt = `You are a research specialist. Conduct thorough research, verify facts, and provide comprehensive information.`;

        for await (const chunk of claudeClient.chat(task.input.messages, {
          systemPrompt,
          stream: true,
        })) {
          yield chunk;
        }
      },
    });

    logger.info('Default agents registered', { count: this.agents.size });
  }

  /**
   * Register custom agent executor
   */
  registerAgent(type: string, executor: AgentExecutor): void {
    this.agents.set(type, executor);
    logger.debug('Agent registered', { type });
  }

  /**
   * Create and queue a new task
   */
  async createTask(
    type: string,
    sessionId: string,
    userId: string,
    input: any,
    priority: AgentTask['priority'] = 'medium'
  ): Promise<string> {
    const task: AgentTask = {
      id: crypto.randomUUID(),
      type,
      sessionId,
      userId,
      input,
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    // Store in Redis
    await redis.setHash(`task:${task.id}`, {
      id: task.id,
      type: task.type,
      sessionId: task.sessionId,
      userId: task.userId,
      input: JSON.stringify(task.input),
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
    });

    // Add to queue based on priority
    this.enqueueTask(task);

    logger.info('Task created', { taskId: task.id, type: task.type, priority: task.priority });
    return task.id;
  }

  /**
   * Execute task and stream results
   */
  async *executeTask(taskId: string): AsyncGenerator<StreamChunk> {
    const taskData = await redis.getHash(`task:${taskId}`);
    if (!taskData || !taskData.id) {
      throw new Error(`Task ${taskId} not found`);
    }

    const task: AgentTask = {
      id: taskData.id,
      type: taskData.type,
      sessionId: taskData.sessionId,
      userId: taskData.userId,
      input: JSON.parse(taskData.input),
      priority: taskData.priority as AgentTask['priority'],
      status: taskData.status as AgentTask['status'],
      createdAt: new Date(taskData.createdAt),
    };

    const executor = this.agents.get(task.type);
    if (!executor) {
      throw new Error(`No executor found for agent type: ${task.type}`);
    }

    try {
      // Update status to running
      task.status = 'running';
      task.startedAt = new Date();
      this.runningTasks.set(taskId, task);
      await this.updateTaskStatus(taskId, 'running');

      logger.info('Task execution started', { taskId, type: task.type });

      // Execute and stream results
      for await (const chunk of executor.execute(task)) {
        yield chunk;

        // Store intermediate results
        if (chunk.type === 'text') {
          task.result = (task.result || '') + chunk.content;
        }
      }

      // Mark as completed
      task.status = 'completed';
      task.completedAt = new Date();
      await this.updateTaskStatus(taskId, 'completed');

      logger.info('Task execution completed', {
        taskId,
        duration: task.completedAt.getTime() - task.startedAt.getTime(),
      });
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      await this.updateTaskStatus(taskId, 'failed');

      logger.error('Task execution failed', { taskId, error });
      throw error;
    } finally {
      this.runningTasks.delete(taskId);
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<AgentTask | null> {
    const taskData = await redis.getHash(`task:${taskId}`);
    if (!taskData || !taskData.id) {
      return null;
    }

    return {
      id: taskData.id,
      type: taskData.type,
      sessionId: taskData.sessionId,
      userId: taskData.userId,
      input: JSON.parse(taskData.input),
      priority: taskData.priority as AgentTask['priority'],
      status: taskData.status as AgentTask['status'],
      createdAt: new Date(taskData.createdAt),
      startedAt: taskData.startedAt ? new Date(taskData.startedAt) : undefined,
      completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
      result: taskData.result,
      error: taskData.error,
    };
  }

  /**
   * List all agents
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Get system statistics
   */
  getStats(): {
    totalAgents: number;
    runningTasks: number;
    queuedTasks: number;
    concurrentLimit: number;
  } {
    return {
      totalAgents: this.agents.size,
      runningTasks: this.runningTasks.size,
      queuedTasks: this.taskQueue.length,
      concurrentLimit: this.concurrentLimit,
    };
  }

  /**
   * Private: Enqueue task based on priority
   */
  private enqueueTask(task: AgentTask): void {
    // Insert based on priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = this.taskQueue.findIndex(
      t => priorityOrder[t.priority] > priorityOrder[task.priority]
    );

    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
  }

  /**
   * Private: Process task queue
   */
  private async startProcessing(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.processing) {
      try {
        // Process tasks if under concurrent limit
        while (
          this.runningTasks.size < this.concurrentLimit &&
          this.taskQueue.length > 0
        ) {
          const task = this.taskQueue.shift();
          if (task) {
            this.processTask(task).catch(error => {
              logger.error('Task processing error', { taskId: task.id, error });
            });
          }
        }

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error('Queue processing error', error);
      }
    }
  }

  /**
   * Private: Process individual task
   */
  private async processTask(task: AgentTask): Promise<void> {
    try {
      for await (const chunk of this.executeTask(task.id)) {
        // Chunks are already being streamed to clients via WebSocket
        // This loop just ensures execution completes
      }
    } catch (error) {
      logger.error('Task execution error', { taskId: task.id, error });
    }
  }

  /**
   * Private: Update task status in Redis
   */
  private async updateTaskStatus(
    taskId: string,
    status: AgentTask['status']
  ): Promise<void> {
    const updates: Record<string, string> = { status };

    if (status === 'running') {
      updates.startedAt = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date().toISOString();
    }

    await redis.setHash(`task:${taskId}`, updates);
  }

  /**
   * Stop processing (graceful shutdown)
   */
  async stop(): Promise<void> {
    this.processing = false;
    logger.info('Agent orchestrator stopped');
  }
}

export const agentOrchestrator = new AgentOrchestrator();
