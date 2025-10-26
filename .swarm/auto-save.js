/**
 * Auto-Save System
 * Automatically commits and saves all changes with agent attribution
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AgentLogger = require('./agent-logger');

class AutoSaveSystem {
    constructor(repoPath = process.cwd()) {
        this.repoPath = repoPath;
        this.logger = new AgentLogger();
        this.saveInterval = 5 * 60 * 1000; // 5 minutes
        this.isActive = false;
    }

    start() {
        if (this.isActive) return;

        this.isActive = true;
        console.log('🔄 Auto-save system started');

        // Initial save
        this.saveProgress('Initial auto-save checkpoint');

        // Periodic saves
        this.intervalId = setInterval(() => {
            this.saveProgress('Auto-save checkpoint');
        }, this.saveInterval);

        // Save on process exit
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
    }

    stop() {
        if (!this.isActive) return;

        this.isActive = false;
        clearInterval(this.intervalId);
        console.log('⏸️  Auto-save system stopped');
    }

    async saveProgress(message = 'Auto-save') {
        try {
            // Generate agent report
            const report = this.logger.generateReport();

            // Check for changes
            const hasChanges = await this.hasGitChanges();
            if (!hasChanges) {
                console.log('📭 No changes to save');
                return;
            }

            // Create commit message with agent info
            const commitMessage = this.generateCommitMessage(message, report);

            // Git operations
            await this.execCommand('git add .');
            await this.execCommand(`git commit -m "${commitMessage}"`);

            console.log('✅ Progress saved:', message);
            console.log('📊 Agent activity:', Object.keys(report.agents).length, 'agents');

            return true;
        } catch (error) {
            console.error('❌ Auto-save error:', error.message);
            return false;
        }
    }

    generateCommitMessage(message, report) {
        const agentList = Object.keys(report.agents).join(', ');
        const totalActions = Object.values(report.agents).reduce((sum, agent) => sum + agent.totalActions, 0);

        return `${message}

🤖 Agents active: ${Object.keys(report.agents).length}
📝 Total actions: ${totalActions}
🔧 Agents: ${agentList}

Co-Authored-By: Claude <noreply@anthropic.com>`;
    }

    async hasGitChanges() {
        try {
            const output = await this.execCommand('git status --porcelain');
            return output.trim().length > 0;
        } catch (error) {
            return false;
        }
    }

    execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, { cwd: this.repoPath }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    async pushToRemote(branch = 'main') {
        try {
            await this.execCommand(`git push origin ${branch}`);
            console.log('📤 Changes pushed to GitHub');
            return true;
        } catch (error) {
            console.error('❌ Push error:', error.message);
            return false;
        }
    }

    async createBackup() {
        const backupDir = path.join(this.repoPath, '.backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.tar.gz`);

        try {
            await this.execCommand(`tar -czf "${backupPath}" --exclude=node_modules --exclude=.git --exclude=.backups .`);
            console.log('💾 Backup created:', backupPath);
            return backupPath;
        } catch (error) {
            console.error('❌ Backup error:', error.message);
            return null;
        }
    }

    async shutdown() {
        console.log('\n🛑 Shutting down auto-save system...');
        this.stop();

        await this.saveProgress('Final save before shutdown');

        const report = this.logger.generateReport();
        console.log('\n📊 Session Summary:');
        console.log('   Agents:', Object.keys(report.agents).length);
        console.log('   Duration:', this.getSessionDuration(report));
        console.log('   Report:', path.basename(this.logger.sessionDir));

        process.exit(0);
    }

    getSessionDuration(report) {
        const duration = new Date(report.endTime) - new Date(report.startTime);
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
}

// Export singleton instance
const autoSave = new AutoSaveSystem();

if (require.main === module) {
    // Run as standalone script
    autoSave.start();

    console.log('Press Ctrl+C to stop and save');
}

module.exports = AutoSaveSystem;
