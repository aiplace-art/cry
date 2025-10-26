/**
 * Agent Activity Logger
 * Saves all agent actions, decisions, and outputs
 */

const fs = require('fs');
const path = require('path');

class AgentLogger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.sessionDir = path.join(this.logDir, `session-${Date.now()}`);
        this.agentLogs = new Map();

        this.ensureDirectories();
    }

    ensureDirectories() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        if (!fs.existsSync(this.sessionDir)) {
            fs.mkdirSync(this.sessionDir, { recursive: true });
        }
    }

    logAgentAction(agentName, action, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            agent: agentName,
            action,
            data,
        };

        // Store in memory
        if (!this.agentLogs.has(agentName)) {
            this.agentLogs.set(agentName, []);
        }
        this.agentLogs.get(agentName).push(logEntry);

        // Write to file
        const logFile = path.join(this.sessionDir, `${agentName}.jsonl`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

        // Also write to master log
        const masterLog = path.join(this.sessionDir, 'master.jsonl');
        fs.appendFileSync(masterLog, JSON.stringify(logEntry) + '\n');

        return logEntry;
    }

    logFileCreation(agentName, filePath, content) {
        this.logAgentAction(agentName, 'file_created', {
            file: filePath,
            size: content.length,
            lines: content.split('\n').length,
        });

        // Save file snapshot
        const snapshotDir = path.join(this.sessionDir, 'snapshots');
        if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir, { recursive: true });
        }

        const sanitizedPath = filePath.replace(/[/\\]/g, '_');
        const snapshotFile = path.join(snapshotDir, `${sanitizedPath}.${Date.now()}.snapshot`);
        fs.writeFileSync(snapshotFile, content);
    }

    logDecision(agentName, decision, reasoning, result) {
        this.logAgentAction(agentName, 'decision', {
            decision,
            reasoning,
            result,
        });
    }

    logError(agentName, error, context) {
        this.logAgentAction(agentName, 'error', {
            error: error.message,
            stack: error.stack,
            context,
        });
    }

    logCompletion(agentName, task, metrics) {
        this.logAgentAction(agentName, 'task_completed', {
            task,
            metrics,
        });
    }

    generateReport() {
        const report = {
            session: this.sessionDir,
            startTime: fs.statSync(this.sessionDir).birthtime,
            endTime: new Date(),
            agents: {},
        };

        for (const [agentName, logs] of this.agentLogs.entries()) {
            report.agents[agentName] = {
                totalActions: logs.length,
                actions: logs.reduce((acc, log) => {
                    acc[log.action] = (acc[log.action] || 0) + 1;
                    return acc;
                }, {}),
                firstAction: logs[0].timestamp,
                lastAction: logs[logs.length - 1].timestamp,
            };
        }

        const reportFile = path.join(this.sessionDir, 'SESSION_REPORT.json');
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        return report;
    }

    getAgentHistory(agentName) {
        return this.agentLogs.get(agentName) || [];
    }

    getAllLogs() {
        const allLogs = [];
        for (const logs of this.agentLogs.values()) {
            allLogs.push(...logs);
        }
        return allLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
}

module.exports = AgentLogger;
