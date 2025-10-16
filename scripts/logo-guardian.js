#!/usr/bin/env node

/**
 * 🎨 LOGO GUARDIAN AGENT
 *
 * Автоматический агент для мониторинга единообразия логотипа HypeAI
 * во всех файлах проекта.
 *
 * Функции:
 * - Сканирует все файлы проекта на наличие логотипов
 * - Проверяет соответствие утверждённым версиям
 * - Находит использование устаревших логотипов
 * - Генерирует отчёты о соответствии
 * - Может автоматически исправлять неправильные ссылки
 * - Работает в фоновом режиме (24/7)
 *
 * Usage:
 *   node logo-guardian.js --scan      # Сканировать проект
 *   node logo-guardian.js --fix       # Автоматически исправить
 *   node logo-guardian.js --watch     # Постоянный мониторинг
 *   node logo-guardian.js --report    # Показать отчёт
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфигурация
const CONFIG = {
  projectRoot: path.join(__dirname, '..'),
  reportPath: path.join(__dirname, '..', 'data', 'project-coordination', 'logo-compliance-report.json'),

  // ✅ УТВЕРЖДЁННЫЕ логотипы (использовать ТОЛЬКО эти)
  approvedLogos: [
    'logo-official.svg',          // Полный логотип с текстом
    'logo-icon-only.svg',         // Только иконка
    'logo-premium-animated.html'  // Анимированная версия
  ],

  // 🚫 ЗАПРЕЩЁННЫЕ логотипы (старые версии)
  deprecatedLogos: [
    'logo-hypeai.svg',                    // Старая версия с infinity
    'logo-hypeai-compact.svg',            // Старая компактная версия
    'logo-hypeai-lightning.svg',          // Старая версия с молниями
    'logo-brain-lightning.html',          // Отклонено - "детский сад"
    'logo-animated.html',                 // Старая анимация
    'logo-premium-lightning.svg',         // Исходная версия (заменена на official)
    'logo-ultra-premium.svg'              // Альтернативная версия (не выбрана)
  ],

  // Директории для сканирования
  scanDirs: [
    'website',
    'public',
    'docs',
    'src',
    'scripts',
    'data'
  ],

  // Расширения файлов для проверки
  fileExtensions: ['.html', '.md', '.json', '.js', '.jsx', '.tsx', '.css', '.svg'],

  // Исключения (не проверять эти файлы)
  excludePaths: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'logo-guardian.js',  // Сам скрипт
    'logo-compliance-report.json'  // Отчёт
  ]
};

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Класс Logo Guardian Agent
class LogoGuardian {
  constructor() {
    this.violations = [];
    this.compliantFiles = [];
    this.scannedFiles = 0;
    this.startTime = Date.now();
  }

  // Основная функция сканирования
  async scan() {
    log('\n🎨 LOGO GUARDIAN AGENT - Starting scan...', 'cyan');
    log(`📁 Project root: ${CONFIG.projectRoot}`, 'blue');
    log(`✅ Approved logos: ${CONFIG.approvedLogos.join(', ')}`, 'green');
    log(`🚫 Deprecated logos: ${CONFIG.deprecatedLogos.join(', ')}`, 'red');
    log('');

    for (const dir of CONFIG.scanDirs) {
      const fullPath = path.join(CONFIG.projectRoot, dir);
      if (fs.existsSync(fullPath)) {
        await this.scanDirectory(fullPath);
      }
    }

    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    log(`\n✅ Scan completed in ${elapsed}s`, 'green');
    log(`📊 Files scanned: ${this.scannedFiles}`, 'blue');
    log(`✅ Compliant files: ${this.compliantFiles.length}`, 'green');
    log(`🚫 Violations found: ${this.violations.length}`, this.violations.length > 0 ? 'red' : 'green');

    return this.generateReport();
  }

  // Рекурсивное сканирование директории
  async scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(CONFIG.projectRoot, fullPath);

      // Пропускаем исключения
      if (CONFIG.excludePaths.some(exclude => relativePath.includes(exclude))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (CONFIG.fileExtensions.includes(ext)) {
          await this.scanFile(fullPath);
        }
      }
    }
  }

  // Сканирование отдельного файла
  async scanFile(filePath) {
    this.scannedFiles++;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(CONFIG.projectRoot, filePath);

      const violations = this.checkContent(content, filePath);

      if (violations.length > 0) {
        this.violations.push({
          file: relativePath,
          violations: violations,
          timestamp: new Date().toISOString()
        });

        log(`🚫 ${relativePath}`, 'red');
        violations.forEach(v => {
          log(`   Line ${v.line}: ${v.type} - "${v.match}"`, 'yellow');
        });
      } else if (this.hasLogoReferences(content)) {
        this.compliantFiles.push(relativePath);
        log(`✅ ${relativePath}`, 'green');
      }
    } catch (error) {
      // Игнорируем ошибки чтения бинарных файлов
    }
  }

  // Проверка содержимого файла
  checkContent(content, filePath) {
    const violations = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Проверяем использование запрещённых логотипов
      CONFIG.deprecatedLogos.forEach(deprecatedLogo => {
        if (line.includes(deprecatedLogo)) {
          violations.push({
            line: index + 1,
            type: 'DEPRECATED_LOGO',
            match: deprecatedLogo,
            suggestion: this.getSuggestion(deprecatedLogo)
          });
        }
      });

      // Проверяем старые символы
      if (line.includes('∞') && !filePath.includes('OFFICIAL_LOGO.md')) {
        violations.push({
          line: index + 1,
          type: 'OLD_SYMBOL',
          match: '∞',
          suggestion: 'Replace with ⚡ (lightning bolt)'
        });
      }
    });

    return violations;
  }

  // Есть ли в файле ссылки на логотипы
  hasLogoReferences(content) {
    return CONFIG.approvedLogos.some(logo => content.includes(logo));
  }

  // Получить рекомендацию по замене
  getSuggestion(deprecatedLogo) {
    const suggestions = {
      'logo-hypeai.svg': 'logo-official.svg',
      'logo-hypeai-compact.svg': 'logo-icon-only.svg',
      'logo-hypeai-lightning.svg': 'logo-official.svg',
      'logo-brain-lightning.html': 'logo-premium-animated.html',
      'logo-animated.html': 'logo-premium-animated.html',
      'logo-premium-lightning.svg': 'logo-official.svg',
      'logo-ultra-premium.svg': 'logo-official.svg'
    };
    return suggestions[deprecatedLogo] || 'logo-official.svg';
  }

  // Генерация отчёта
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      scan: {
        duration: ((Date.now() - this.startTime) / 1000).toFixed(2) + 's',
        filesScanned: this.scannedFiles,
        compliantFiles: this.compliantFiles.length,
        violationsFound: this.violations.length
      },
      status: this.violations.length === 0 ? 'COMPLIANT' : 'VIOLATIONS_FOUND',
      compliance: {
        score: Math.round((this.compliantFiles.length / (this.compliantFiles.length + this.violations.length)) * 100) || 100,
        approved: CONFIG.approvedLogos,
        deprecated: CONFIG.deprecatedLogos
      },
      violations: this.violations,
      compliantFiles: this.compliantFiles,
      recommendations: this.getRecommendations()
    };

    // Сохраняем отчёт
    fs.writeFileSync(CONFIG.reportPath, JSON.stringify(report, null, 2));
    log(`\n📊 Report saved to: ${CONFIG.reportPath}`, 'blue');

    return report;
  }

  // Получить рекомендации
  getRecommendations() {
    const recommendations = [];

    if (this.violations.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Run auto-fix to replace deprecated logos',
        command: 'node scripts/logo-guardian.js --fix'
      });

      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review violations manually',
        command: 'node scripts/logo-guardian.js --report'
      });
    }

    if (this.violations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        action: 'Enable continuous monitoring',
        command: 'node scripts/logo-guardian.js --watch'
      });
    }

    return recommendations;
  }

  // Автоматическое исправление
  async autoFix() {
    log('\n🔧 LOGO GUARDIAN - Auto-fixing violations...', 'cyan');

    let fixedFiles = 0;
    let fixedViolations = 0;

    for (const violation of this.violations) {
      const filePath = path.join(CONFIG.projectRoot, violation.file);

      try {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        violation.violations.forEach(v => {
          if (v.type === 'DEPRECATED_LOGO') {
            const oldLogo = v.match;
            const newLogo = v.suggestion;

            if (content.includes(oldLogo)) {
              content = content.replace(new RegExp(oldLogo, 'g'), newLogo);
              modified = true;
              fixedViolations++;
              log(`✅ ${violation.file}: ${oldLogo} → ${newLogo}`, 'green');
            }
          }

          if (v.type === 'OLD_SYMBOL' && v.match === '∞') {
            content = content.replace(/∞/g, '⚡');
            modified = true;
            fixedViolations++;
            log(`✅ ${violation.file}: ∞ → ⚡`, 'green');
          }
        });

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf-8');
          fixedFiles++;
        }
      } catch (error) {
        log(`❌ Error fixing ${violation.file}: ${error.message}`, 'red');
      }
    }

    log(`\n✅ Auto-fix completed`, 'green');
    log(`📁 Files fixed: ${fixedFiles}`, 'blue');
    log(`🔧 Violations fixed: ${fixedViolations}`, 'blue');

    // Пересканируем проект
    log('\n🔄 Re-scanning project...', 'cyan');
    this.violations = [];
    this.compliantFiles = [];
    this.scannedFiles = 0;
    this.startTime = Date.now();

    return await this.scan();
  }

  // Показать отчёт
  showReport() {
    if (!fs.existsSync(CONFIG.reportPath)) {
      log('❌ No report found. Run scan first: node logo-guardian.js --scan', 'red');
      return;
    }

    const report = JSON.parse(fs.readFileSync(CONFIG.reportPath, 'utf-8'));

    log('\n📊 LOGO COMPLIANCE REPORT', 'cyan');
    log('═══════════════════════════════════════', 'cyan');
    log(`\n⏰ Last scan: ${new Date(report.timestamp).toLocaleString()}`, 'blue');
    log(`⚡ Duration: ${report.scan.duration}`, 'blue');
    log(`📁 Files scanned: ${report.scan.filesScanned}`, 'blue');
    log(`\n🎯 Status: ${report.status}`, report.status === 'COMPLIANT' ? 'green' : 'yellow');
    log(`📊 Compliance score: ${report.compliance.score}%`, report.compliance.score === 100 ? 'green' : 'yellow');
    log(`\n✅ Compliant files: ${report.scan.compliantFiles}`, 'green');
    log(`🚫 Violations: ${report.scan.violationsFound}`, report.scan.violationsFound === 0 ? 'green' : 'red');

    if (report.violations.length > 0) {
      log('\n🚫 VIOLATIONS:', 'red');
      report.violations.forEach(v => {
        log(`\n  📄 ${v.file}`, 'yellow');
        v.violations.forEach(vio => {
          log(`     Line ${vio.line}: ${vio.type} - "${vio.match}"`, 'red');
          log(`     Suggestion: ${vio.suggestion}`, 'green');
        });
      });
    }

    if (report.recommendations.length > 0) {
      log('\n💡 RECOMMENDATIONS:', 'cyan');
      report.recommendations.forEach(rec => {
        log(`\n  [${rec.priority}] ${rec.action}`, 'yellow');
        log(`  Command: ${rec.command}`, 'blue');
      });
    }

    log('\n═══════════════════════════════════════\n', 'cyan');
  }

  // Постоянный мониторинг (watch mode)
  async watch() {
    log('👁️  LOGO GUARDIAN - Watch mode enabled', 'cyan');
    log('Monitoring project for logo changes...', 'blue');
    log('Press Ctrl+C to stop\n', 'yellow');

    // Первое сканирование
    await this.scan();

    // Мониторим каждые 60 секунд
    setInterval(async () => {
      log('\n🔄 Running periodic scan...', 'cyan');
      this.violations = [];
      this.compliantFiles = [];
      this.scannedFiles = 0;
      this.startTime = Date.now();
      await this.scan();
    }, 60000);
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const guardian = new LogoGuardian();

  if (args.includes('--scan')) {
    await guardian.scan();
  } else if (args.includes('--fix')) {
    await guardian.scan();
    if (guardian.violations.length > 0) {
      await guardian.autoFix();
    } else {
      log('✅ No violations found. Project is compliant!', 'green');
    }
  } else if (args.includes('--report')) {
    guardian.showReport();
  } else if (args.includes('--watch')) {
    await guardian.watch();
  } else {
    log('\n🎨 LOGO GUARDIAN AGENT', 'cyan');
    log('═══════════════════════════════════════', 'cyan');
    log('\nUsage:', 'blue');
    log('  node logo-guardian.js --scan      # Scan project for logo compliance', 'yellow');
    log('  node logo-guardian.js --fix       # Auto-fix violations', 'yellow');
    log('  node logo-guardian.js --report    # Show compliance report', 'yellow');
    log('  node logo-guardian.js --watch     # Continuous monitoring', 'yellow');
    log('\n═══════════════════════════════════════\n', 'cyan');
  }
}

// Запуск
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = LogoGuardian;
