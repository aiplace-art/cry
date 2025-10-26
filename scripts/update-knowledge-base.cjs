#!/usr/bin/env node

/**
 * Автоматическое обновление базы знаний проекта
 * Сканирует проект и обновляет PROJECT_KNOWLEDGE_BASE.md
 *
 * Запуск: node scripts/update-knowledge-base.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const KNOWLEDGE_BASE_PATH = path.join(PROJECT_ROOT, 'docs/PROJECT_KNOWLEDGE_BASE.md');

console.log('🔄 Автоматическое обновление базы знаний...\n');

// 1. Сканируем документы в /docs/
function scanDocs() {
  const docsDir = path.join(PROJECT_ROOT, 'docs');
  const docs = {};

  function scanDirectory(dir, category) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, item);
      } else if (item.endsWith('.md') && item !== 'PROJECT_KNOWLEDGE_BASE.md') {
        if (!docs[category]) docs[category] = [];
        docs[category].push({
          name: item,
          path: fullPath.replace(PROJECT_ROOT, ''),
          size: stat.size,
          modified: stat.mtime
        });
      }
    });
  }

  scanDirectory(docsDir, 'root');
  return docs;
}

// 2. Сканируем смарт-контракты
function scanContracts() {
  const contractsDir = path.join(PROJECT_ROOT, 'src/contracts');
  if (!fs.existsSync(contractsDir)) return [];

  const contracts = fs.readdirSync(contractsDir)
    .filter(file => file.endsWith('.sol'))
    .map(file => ({
      name: file,
      path: `/src/contracts/${file}`
    }));

  return contracts;
}

// 3. Сканируем компоненты frontend
function scanComponents() {
  const componentsDir = path.join(PROJECT_ROOT, 'src/frontend/components');
  if (!fs.existsSync(componentsDir)) return {};

  const components = {};

  function scanDir(dir, category) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!components[item]) components[item] = 0;
        const files = fs.readdirSync(fullPath).filter(f =>
          f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')
        );
        components[item] = files.length;
      }
    });
  }

  scanDir(componentsDir, 'components');
  return components;
}

// 4. Получаем текущую дату
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 5. Считаем версию (увеличиваем patch)
function incrementVersion(currentVersion) {
  const match = currentVersion.match(/v(\d+)\.(\d+)/);
  if (!match) return 'v1.1';

  const major = parseInt(match[1]);
  const minor = parseInt(match[2]);

  return `v${major}.${minor + 1}`;
}

// 6. Читаем текущую базу знаний
let currentKB = '';
let currentVersion = 'v1.0';

if (fs.existsSync(KNOWLEDGE_BASE_PATH)) {
  currentKB = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8');
  const versionMatch = currentKB.match(/\*\*Версия:\*\* (v\d+\.\d+)/);
  if (versionMatch) {
    currentVersion = versionMatch[1];
  }
}

// 7. Собираем данные
const docs = scanDocs();
const contracts = scanContracts();
const components = scanComponents();
const newDate = getCurrentDate();
const newVersion = incrementVersion(currentVersion);

console.log('📊 Собрана информация:');
console.log(`   - Документов: ${Object.values(docs).flat().length}`);
console.log(`   - Контрактов: ${contracts.length}`);
console.log(`   - Компонентов: ${Object.keys(components).length} категорий`);
console.log(`   - Новая версия: ${newVersion}`);
console.log(`   - Дата обновления: ${newDate}\n`);

// 8. Обновляем секцию с документами
function updateDocsSection(content) {
  const docsSection = Object.entries(docs).map(([category, files]) => {
    if (files.length === 0) return '';

    const categoryName = category === 'root' ? 'Общие' :
                        category === 'marketing' ? 'Маркетинг' :
                        category === 'architecture' ? 'Архитектура' :
                        category === 'private-sale' ? 'Private Sale' :
                        category === 'testing' ? 'Тестирование' :
                        category.charAt(0).toUpperCase() + category.slice(1);

    return `### ${categoryName}\n${files.map(f => `- \`${f.path}\``).join('\n')}`;
  }).filter(Boolean).join('\n\n');

  // Заменяем секцию документации
  const startMarker = '### 1️⃣ Маркетинг';
  const endMarker = '### 2️⃣ Техническая документация';

  if (content.includes(startMarker)) {
    const before = content.substring(0, content.indexOf('## 📁 СТРУКТУРА ДОКУМЕНТАЦИИ'));
    const after = content.substring(content.indexOf('## 🤖 ДОСТУПНЫЕ АГЕНТЫ'));

    return before +
           `## 📁 СТРУКТУРА ДОКУМЕНТАЦИИ\n\n**ВСЕ документы находятся в \`/Users/ai.place/Crypto/docs/\`**\n\n${docsSection}\n\n` +
           after;
  }

  return content;
}

// 9. Обновляем метаданные
function updateMetadata(content) {
  content = content.replace(/\*\*Дата обновления:\*\* \d{4}-\d{2}-\d{2}/, `**Дата обновления:** ${newDate}`);
  content = content.replace(/\*\*Версия:\*\* v\d+\.\d+/, `**Версия:** ${newVersion}`);
  return content;
}

// 10. Добавляем запись в историю изменений
function updateHistory(content) {
  const historyMarker = '## 📝 ИСТОРИЯ ИЗМЕНЕНИЙ';

  if (content.includes(historyMarker)) {
    const newEntry = `### ${newVersion} - ${newDate}\n- ✅ Автоматическое обновление базы знаний\n- 📊 Обновлена структура документации\n- 🔄 Синхронизация с текущим состоянием проекта\n\n`;

    const historyIndex = content.indexOf(historyMarker) + historyMarker.length + 1;

    return content.substring(0, historyIndex) + '\n' + newEntry + content.substring(historyIndex);
  }

  return content;
}

// 11. Обновляем статистику
function updateStats(content) {
  const statsSection = `
**Текущая статистика проекта:**
- 📄 Документов: ${Object.values(docs).flat().length}
- 📜 Смарт-контрактов: ${contracts.length}
- 🧩 Категорий компонентов: ${Object.keys(components).length}
- 📦 Всего компонентов: ${Object.values(components).reduce((a, b) => a + b, 0)}
- 🤖 Доступных агентов: 54
`;

  // Добавляем после раздела "ГЛАВНАЯ ИНФОРМАЦИЯ О ПРОЕКТЕ"
  const marker = '### Ключевые характеристики:';
  if (content.includes(marker)) {
    const index = content.indexOf(marker);
    const nextSection = content.indexOf('---', index);

    return content.substring(0, nextSection) + '\n' + statsSection + '\n' + content.substring(nextSection);
  }

  return content;
}

// 12. Применяем все обновления
let updatedContent = currentKB;
updatedContent = updateMetadata(updatedContent);
updatedContent = updateDocsSection(updatedContent);
updatedContent = updateHistory(updatedContent);
updatedContent = updateStats(updatedContent);

// 13. Сохраняем обновлённую базу знаний
fs.writeFileSync(KNOWLEDGE_BASE_PATH, updatedContent, 'utf-8');

console.log('✅ База знаний успешно обновлена!');
console.log(`   Файл: ${KNOWLEDGE_BASE_PATH}`);
console.log(`   Версия: ${currentVersion} → ${newVersion}`);
console.log(`   Дата: ${newDate}\n`);

console.log('📋 Что обновлено:');
console.log('   ✅ Дата и версия');
console.log('   ✅ Структура документации');
console.log('   ✅ Статистика проекта');
console.log('   ✅ История изменений\n');

console.log('🎉 Готово! База знаний актуальна.');
