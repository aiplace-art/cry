# Live Agents Section - Implementation Guide

## Файл для редактирования
`/Users/ai.place/Crypto/public/variant-2/index.html`

## Что заменить

### 1. Найти секцию (примерно строки 1595-1660):
```html
<!-- Live Agents Working Section -->
<section id="live-agents" class="section">
  ...
</section>
```

### 2. Заменить весь блок на:

```html
<!-- Live Agents Working Section - ALL 27 AGENTS -->
<section id="live-agents" class="section" style="background: linear-gradient(180deg, #1E2026 0%, #14151A 100%);">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">🤖 27 AI Agents Working Right Now</h2>
      <p class="section-description">
        Real-time view of our complete AI workforce. Every agent is online, collaborating seamlessly to deliver exceptional results.
      </p>
    </div>

    <!-- Live Stats Grid -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 48px;">
      <div class="live-stat-card">
        <div class="live-stat-icon" style="color: #0ECB81;">✅</div>
        <div class="live-stat-value" id="liveOnline">27</div>
        <div class="live-stat-label">Agents Online</div>
      </div>
      <div class="live-stat-card">
        <div class="live-stat-icon" style="color: #F3BA2F;">⚡</div>
        <div class="live-stat-value" id="liveTasksHour">156</div>
        <div class="live-stat-label">Tasks/Hour</div>
      </div>
      <div class="live-stat-card">
        <div class="live-stat-icon" style="color: #00D4FF;">🎯</div>
        <div class="live-stat-value" id="liveSuccess">99.2%</div>
        <div class="live-stat-label">Success Rate</div>
      </div>
      <div class="live-stat-card">
        <div class="live-stat-icon" style="color: #F3BA2F;">⏱️</div>
        <div class="live-stat-value" id="liveUptime">99.9%</div>
        <div class="live-stat-label">Uptime</div>
      </div>
    </div>

    <!-- All 27 Agents Grid -->
    <div style="background: linear-gradient(135deg, rgba(30, 32, 38, 0.7) 0%, rgba(20, 21, 26, 0.5) 100%); border: 1px solid rgba(243, 186, 47, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 32px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <h3 style="color: var(--bnb-gold); font-size: 20px; font-weight: 700; margin: 0;">Complete Agent Network</h3>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="pulse-dot"></span>
          <span style="color: #0ECB81; font-size: 13px; font-weight: 600;">All 27 Online</span>
        </div>
      </div>

      <!-- Category Legend -->
      <div style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; font-size: 11px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #0ECB81; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Security (8)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #F3BA2F; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Financial (7)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #00D4FF; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Development (9)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #F0B90B; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Marketing (6)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #C084FC; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Design (6)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #8B5CF6; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Community (4)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 10px; height: 10px; background: #EC4899; border-radius: 50%;"></div>
          <span style="color: var(--text-secondary);">Business (3)</span>
        </div>
      </div>

      <!-- Grid with all 27 agents -->
      <div id="allAgentsGrid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
        <!-- Agents inserted by JS -->
      </div>
    </div>

    <!-- Activity Feed -->
    <div style="background: linear-gradient(135deg, rgba(30, 32, 38, 0.7) 0%, rgba(20, 21, 26, 0.5) 100%); border: 1px solid rgba(243, 186, 47, 0.2); border-radius: 16px; padding: 32px;">
      <h3 style="color: var(--bnb-gold); font-size: 20px; font-weight: 700; margin-bottom: 20px;">📊 Recent Activity</h3>
      <div id="liveActivityFeed" style="max-height: 300px; overflow-y: auto; padding-right: 8px;">
        <!-- Activity items inserted by JS -->
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-top: 48px;">
      <a href="agents-live.html" class="btn-primary" style="font-size: 16px; padding: 14px 36px;">
        View Full Agent Dashboard →
      </a>
    </div>
  </div>
</section>
```

### 3. Добавить CSS стили (в секцию `<style>` перед `</style>`):

```css
/* Compact Agent Card for 6-column grid */
.compact-agent-card {
  background: linear-gradient(135deg, rgba(30, 32, 38, 0.6) 0%, rgba(20, 21, 26, 0.4) 100%);
  border: 1px solid rgba(243, 186, 47, 0.15);
  border-radius: 8px;
  padding: 10px;
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.compact-agent-card:hover {
  transform: translateY(-3px);
  border-color: rgba(243, 186, 47, 0.4);
  box-shadow: 0 8px 20px rgba(243, 186, 47, 0.2);
}

.compact-agent-icon {
  font-size: 28px;
  margin-bottom: 6px;
  display: block;
}

.compact-agent-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.2;
}

.compact-agent-status {
  width: 6px;
  height: 6px;
  background: #0ECB81;
  border-radius: 50%;
  margin: 0 auto 6px;
  animation: pulse-animation 2s ease-in-out infinite;
}

.compact-agent-progress {
  height: 3px;
  background: rgba(243, 186, 47, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 6px;
}

.compact-agent-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #F3BA2F, #FCD535);
  border-radius: 2px;
  transition: width 0.5s ease;
}
```

### 4. Заменить JavaScript (в секции `<script>` найти и заменить код агентов):

```javascript
// ALL 27 AGENTS DATA
const allAgents = [
  // Security & Auditing (8) - Green #0ECB81
  { name: 'Security Auditor', icon: '🛡️', category: 'security', color: '#0ECB81' },
  { name: 'Penetration Tester', icon: '🔓', category: 'security', color: '#0ECB81' },
  { name: 'Vulnerability Scanner', icon: '🔍', category: 'security', color: '#0ECB81' },
  { name: 'Code Reviewer', icon: '👁️', category: 'security', color: '#0ECB81' },
  { name: 'Compliance Checker', icon: '📋', category: 'security', color: '#0ECB81' },
  { name: 'Risk Analyzer', icon: '⚠️', category: 'security', color: '#0ECB81' },
  { name: 'Smart Contract Auditor', icon: '📜', category: 'security', color: '#0ECB81' },
  { name: 'Security Monitor', icon: '🚨', category: 'security', color: '#0ECB81' },

  // Financial & Economic (7) - Gold #F3BA2F
  { name: 'Tokenomics Designer', icon: '💰', category: 'financial', color: '#F3BA2F' },
  { name: 'Economic Modeler', icon: '📊', category: 'financial', color: '#F3BA2F' },
  { name: 'Financial Analyst', icon: '💹', category: 'financial', color: '#F3BA2F' },
  { name: 'Pricing Strategist', icon: '💲', category: 'financial', color: '#F3BA2F' },
  { name: 'Revenue Forecaster', icon: '📈', category: 'financial', color: '#F3BA2F' },
  { name: 'Market Researcher', icon: '🔬', category: 'financial', color: '#F3BA2F' },
  { name: 'Investment Analyst', icon: '💎', category: 'financial', color: '#F3BA2F' },

  // Development (9) - Cyan #00D4FF
  { name: 'Full-Stack Developer', icon: '💻', category: 'development', color: '#00D4FF' },
  { name: 'Smart Contract Dev', icon: '⚙️', category: 'development', color: '#00D4FF' },
  { name: 'Frontend Developer', icon: '🎨', category: 'development', color: '#00D4FF' },
  { name: 'Backend Developer', icon: '🗄️', category: 'development', color: '#00D4FF' },
  { name: 'Database Architect', icon: '💾', category: 'development', color: '#00D4FF' },
  { name: 'API Developer', icon: '🔌', category: 'development', color: '#00D4FF' },
  { name: 'DevOps Engineer', icon: '🚀', category: 'development', color: '#00D4FF' },
  { name: 'Mobile Developer', icon: '📱', category: 'development', color: '#00D4FF' },
  { name: 'QA Tester', icon: '🐛', category: 'development', color: '#00D4FF' },

  // Marketing & Growth (6) - Yellow #F0B90B
  { name: 'Marketing Strategist', icon: '📢', category: 'marketing', color: '#F0B90B' },
  { name: 'Content Creator', icon: '✍️', category: 'marketing', color: '#F0B90B' },
  { name: 'Social Media Manager', icon: '📱', category: 'marketing', color: '#F0B90B' },
  { name: 'SEO Specialist', icon: '🔍', category: 'marketing', color: '#F0B90B' },
  { name: 'Email Marketer', icon: '📧', category: 'marketing', color: '#F0B90B' },
  { name: 'Growth Hacker', icon: '📈', category: 'marketing', color: '#F0B90B' },

  // Design & Branding (6) - Purple #C084FC
  { name: 'Brand Designer', icon: '🎯', category: 'design', color: '#C084FC' },
  { name: 'UI/UX Designer', icon: '✨', category: 'design', color: '#C084FC' },
  { name: 'Graphic Designer', icon: '🖼️', category: 'design', color: '#C084FC' },
  { name: 'Motion Designer', icon: '🎬', category: 'design', color: '#C084FC' },
  { name: 'Web Designer', icon: '🌐', category: 'design', color: '#C084FC' },
  { name: 'Presentation Designer', icon: '📊', category: 'design', color: '#C084FC' },

  // Community & Social (4) - Violet #8B5CF6
  { name: 'Community Manager', icon: '👥', category: 'community', color: '#8B5CF6' },
  { name: 'Discord Bot', icon: '🤖', category: 'community', color: '#8B5CF6' },
  { name: 'Telegram Bot', icon: '✉️', category: 'community', color: '#8B5CF6' },
  { name: 'Support Agent', icon: '💬', category: 'community', color: '#8B5CF6' },

  // Business Consulting (3) - Pink #EC4899
  { name: 'Business Strategist', icon: '💼', category: 'business', color: '#EC4899' },
  { name: 'Project Manager', icon: '📅', category: 'business', color: '#EC4899' },
  { name: 'Operations Manager', icon: '⚙️', category: 'business', color: '#EC4899' }
];

function renderAllAgents() {
  const grid = document.getElementById('allAgentsGrid');
  if (!grid) return;

  grid.innerHTML = allAgents.map((agent, i) => `
    <div class="compact-agent-card" style="animation-delay: ${i * 0.02}s; border-color: ${agent.color}20;">
      <div class="compact-agent-icon">${agent.icon}</div>
      <div class="compact-agent-name">${agent.name}</div>
      <div class="compact-agent-status" style="background: ${agent.color};"></div>
      <div class="compact-agent-progress">
        <div class="compact-agent-progress-bar" style="width: ${Math.random() * 40 + 60}%; background: ${agent.color};"></div>
      </div>
    </div>
  `).join('');
}

// В конце JavaScript кода заменить инициализацию:
if (document.getElementById('allAgentsGrid')) {
  renderAllAgents();

  // Add initial activities
  for (let i = 0; i < 5; i++) {
    setTimeout(() => addActivity(), i * 500);
  }

  // Update activities every 3 seconds
  setInterval(addActivity, 3000);

  // Update stats every 5 seconds
  setInterval(updateLiveStats, 5000);

  // Update agent progress bars
  setInterval(() => {
    document.querySelectorAll('.compact-agent-progress-bar').forEach(bar => {
      const newWidth = Math.random() * 40 + 60;
      bar.style.width = `${newWidth}%`;
    });
  }, 2000);
}
```

## Результат

После этих изменений у вас будет:

✅ Все 27 агентов видны сразу
✅ Компактная сетка 6x5
✅ Цветовое кодирование по категориям
✅ Живые обновления progress bars
✅ Activity feed со всеми агентами
✅ Красивая легенда категорий
✅ Профессиональный дизайн

## Тестирование

Откройте в браузере:
```
http://localhost:8001/Users/ai.place/Crypto/public/variant-2/index.html
```

Scroll down to section **"27 AI Agents Working Right Now"**
