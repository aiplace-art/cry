# 🎨 HYPEAI VISUAL DESIGN GUIDE - TWITTER CONTENT

**Версия:** 1.0
**Последнее обновление:** 2025-10-21
**Статус:** Production Ready

---

## 🎯 БРЕНД-ИДЕНТИЧНОСТЬ

### Основные принципы дизайна:
```
✨ Минимализм: Чистые линии, много пространства
🌌 Космическая тема: Звёзды, градиенты, глубина
⚡ Энергия: Молнии, свечение, динамика
🔷 Геометрия: Гексагоны как основная форма
🎨 Контраст: Яркие цвета на тёмном фоне
```

---

## 🎨 ЦВЕТОВАЯ ПАЛИТРА

### Primary Colors:
```css
/* Основной циан - для акцентов и важных элементов */
--primary-cyan: #00E5FF;
--primary-cyan-rgb: rgb(0, 229, 255);

/* Вторичный синий - для фонов и текста */
--secondary-blue: #00AAFF;
--secondary-blue-rgb: rgb(0, 170, 255);

/* Темный синий - для градиентов */
--accent-dark-blue: #0077FF;
--accent-dark-blue-rgb: rgb(0, 119, 255);
```

### Accent Colors:
```css
/* Золотой - для premium элементов */
--accent-gold: #FFD700;

/* Зелёный - для success/positive */
--accent-green: #00FF88;

/* Красный - для alerts/negative */
--accent-red: #FF0044;
```

### Neutral Colors:
```css
/* Фоны */
--background-black: #000000;
--background-dark: #0a0a0a;
--background-darker: #050505;

/* Текст */
--text-white: #FFFFFF;
--text-gray: #CCCCCC;
--text-light-gray: #888888;
```

### Gradients:
```css
/* Основной градиент (cyan → dark blue) */
.gradient-primary {
  background: linear-gradient(135deg, #00E5FF 0%, #0077FF 100%);
}

/* Космический градиент (для фонов) */
.gradient-cosmic {
  background: linear-gradient(180deg, #000000 0%, #001a33 50%, #000000 100%);
}

/* Энергия градиент (для акцентов) */
.gradient-energy {
  background: linear-gradient(90deg, #00E5FF 0%, #00AAFF 50%, #FFD700 100%);
}
```

---

## 🔤 ТИПОГРАФИКА

### Font Families:

```css
/* Headers - Futuristic, bold */
--font-header: 'Orbitron', 'Rajdhani', 'Exo 2', sans-serif;

/* Body - Readable, clean */
--font-body: 'Inter', 'Roboto', 'Open Sans', sans-serif;

/* Monospace - Technical, code */
--font-mono: 'Roboto Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Sizes (для 1200×675px визуалов):

```css
/* Titles */
--text-title: 48px;        /* Главный заголовок */
--text-subtitle: 36px;     /* Подзаголовок */

/* Body */
--text-large: 28px;        /* Крупный текст */
--text-medium: 24px;       /* Средний текст */
--text-small: 20px;        /* Мелкий текст */

/* Caption */
--text-caption: 16px;      /* Подписи */
--text-tiny: 14px;         /* Hashtags, credits */
```

### Font Weights:

```css
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### Text Styles:

**Headers:**
```
Font: Orbitron Bold
Size: 48px
Color: #FFFFFF
Letter-spacing: 2px
Text-transform: UPPERCASE (для коротких заголовков)
```

**Body:**
```
Font: Inter Regular
Size: 24px
Color: #CCCCCC
Line-height: 1.5
```

**Hashtags:**
```
Font: Inter Medium
Size: 16px
Color: #00AAFF
```

---

## 🖼️ ФОРМАТЫ И РАЗМЕРЫ

### Twitter Optimal Sizes:

**Single Image:**
```
Size: 1200×675px (16:9 ratio)
Format: PNG or JPG
Max file size: 5MB
DPI: 72 (web standard)
Color mode: RGB
```

**Animated GIF:**
```
Size: 1200×675px (16:9 ratio)
Format: GIF
Max file size: 15MB
Duration: 3-6 seconds
FPS: 30fps (smooth) or 15fps (file size optimization)
Loop: Yes (infinite)
```

**Video:**
```
Size: 1280×720px (720p) or 1920×1080px (1080p)
Format: MP4
Max file size: 512MB
Max duration: 2:20
Codec: H.264
Audio: AAC (optional)
```

**Carousel (multiple images):**
```
Each image: 1200×1200px (1:1 ratio)
Count: 2-4 images
Format: PNG or JPG
```

---

## 🎭 ВИЗУАЛЬНЫЕ ЭЛЕМЕНТЫ

### 1. Логотип (Hexagon + Lightning)

**Полный логотип (с текстом):**
```
Файл: /website/logo-official-BRIGHT.svg
Размеры:
- Large: 400×400px (для главных визуалов)
- Medium: 200×200px (для cards)
- Small: 100×100px (для углов)

Варианты:
- Full color (cyan + blue)
- White (монохром)
- Outline only (контур)
```

**Icon only (без текста):**
```
Файл: /website/logo-icon-only.svg
Использование:
- Avatars
- Watermarks
- Small spaces
```

### 2. Гексагоны (основная форма)

**Использование:**
- Рамки для контента
- Фоновые паттерны
- Иконки агентов
- Декоративные элементы

**Создание в CSS:**
```css
.hexagon {
  width: 100px;
  height: 115.47px; /* 100 * sqrt(3) */
  background: #00E5FF;
  position: relative;
  clip-path: polygon(
    50% 0%,
    100% 25%,
    100% 75%,
    50% 100%,
    0% 75%,
    0% 25%
  );
}
```

### 3. Молнии (символ энергии)

**Стили молний:**
```
Lightning 1: Прямая (vertical)
Lightning 2: Зигзаг (traditional)
Lightning 3: Curved (organic)

Цвет: #00AAFF с glow эффектом
Ширина: 4-8px
Glow: box-shadow: 0 0 20px #00AAFF;
```

**Позиционирование:**
```
- По углам гексагона (8 молний по часовой)
- Как разделители секций
- Как указатели направления
```

### 4. Свечение (Glow Effects)

**Неоновое свечение (для текста):**
```css
.neon-text {
  color: #00E5FF;
  text-shadow:
    0 0 10px #00E5FF,
    0 0 20px #00E5FF,
    0 0 30px #00E5FF,
    0 0 40px #00AAFF;
}
```

**Свечение вокруг элементов:**
```css
.glow-element {
  box-shadow:
    0 0 10px rgba(0, 229, 255, 0.5),
    0 0 20px rgba(0, 229, 255, 0.3),
    0 0 30px rgba(0, 229, 255, 0.1);
}
```

### 5. Космические текстуры

**Звёздное небо (background):**
```
- Чёрный фон (#000000)
- Белые точки разного размера (звёзды)
- Опционально: туманности (gradient overlays)
- Opacity: 0.3-0.7 (чтобы не перебивать контент)
```

**Создание в Figma:**
```
1. Create rectangle (1200×675px)
2. Fill: #000000
3. Add noise effect (10% opacity)
4. Add white dots (stars) layer
5. Add gradient overlay (cosmic colors, 20% opacity)
```

---

## 🎨 ШАБЛОНЫ ВИЗУАЛОВ

### Template 1: Agent Spotlight Card

```
Структура:
┌─────────────────────────────────────┐
│  [Agent Icon - 200×200px]           │ Top: 50px
│                                     │
│  AGENT NAME                         │ Font: 48px, Orbitron Bold
│  ────────────────                  │ Underline: cyan, 4px
│                                     │
│  Feature 1: Description             │ Font: 24px, Inter Regular
│  Feature 2: Description             │
│  Feature 3: Description             │
│  Feature 4: Description             │
│                                     │
│  #HypeAI #AgentName                 │ Bottom: 30px, 16px, cyan
└─────────────────────────────────────┘

Цвета:
- Background: Cosmic gradient
- Icon: Cyan with glow
- Text: White
- Hashtags: Cyan
```

**Figma/Photoshop слои:**
```
Layer 1: Background (cosmic texture)
Layer 2: Icon glow (blur effect)
Layer 3: Icon (agent visual)
Layer 4: Agent name (text)
Layer 5: Underline (shape)
Layer 6: Features (text group)
Layer 7: Hashtags (text)
Layer 8: Logo watermark (bottom right, small)
```

---

### Template 2: Infographic Layout

```
Структура:
┌─────────────────────────────────────┐
│  TITLE 📊                           │ Top: 40px
│  ═══════════════════════════════   │
│                                     │
│  [Section 1]                        │
│  Icon + Heading + Description       │
│                                     │
│  [Section 2]                        │
│  Icon + Heading + Description       │
│                                     │
│  [Section 3]                        │
│  Icon + Heading + Description       │
│                                     │
│  [Section 4]                        │
│  Icon + Heading + Description       │
│                                     │
│  [Logo]                             │ Bottom right
└─────────────────────────────────────┘

Layout grid:
- Padding: 60px all sides
- Section spacing: 40px vertical
- Icon size: 80×80px
- Icon-to-text gap: 20px
```

---

### Template 3: Countdown Timer

```
Структура:
┌─────────────────────────────────────┐
│                                     │
│        ⏰ [EMOJI]                   │
│                                     │
│        XX DAYS                      │ Font: 72px, Orbitron ExtraBold
│     UNTIL FAIR LAUNCH               │ Font: 36px, Orbitron Bold
│                                     │
│  ████████████░░░░░░░░░             │ Progress bar
│                                     │
│     Nov 15, 2025                    │ Font: 24px, Inter Medium
│     Be there. 🚀                    │
│                                     │
└─────────────────────────────────────┘

Анимация (для GIF версии):
- Pulsing glow на числе
- Progress bar заполняется
- Emoji мигает
```

---

### Template 4: Quote Card

```
Структура:
┌─────────────────────────────────────┐
│                                     │
│                                     │
│     "Quote text here,               │ Font: 48px, Orbitron Medium
│      centered and bold,             │ Max: 2-3 lines
│      memorable message"             │
│                                     │
│                                     │
│     ─────────────────               │ Divider line
│     Attribution                     │ Font: 24px, Inter Light
│                                     │
│     [Small logo]                    │ Bottom right corner
│                                     │
└─────────────────────────────────────┘

Цвета:
- Background: Solid dark (#0a0a0a) or minimal cosmic
- Quote marks: Subtle cyan (#00E5FF, 50% opacity)
- Text: White (#FFFFFF)
- Logo: Original colors
```

---

### Template 5: Statistics/Metrics Card

```
Структура:
┌─────────────────────────────────────┐
│  MILESTONE REACHED 🎉               │
│  ═══════════════════════════════   │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │ 📊 5,000│  │ ⭐ 500  │          │
│  │ Members │  │ Stars   │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │ 🧪 100  │  │ 🤖 15   │          │
│  │ Testers │  │ Agents  │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  Thanks for believing! 🚀           │
│                                     │
└─────────────────────────────────────┘

Layout:
- Grid: 2×2 metrics
- Each metric box: 280×150px
- Gap between boxes: 40px
- Numbers: 48px, bold
- Labels: 20px, regular
```

---

## 🎬 АНИМАЦИЯ (для GIF визуалов)

### Типы анимаций:

**1. Logo Reveal:**
```
Timeline:
0.0s: Black screen
0.5s: Particles gather (opacity 0→100%)
1.0s: Hexagon forms (scale 0→1)
1.5s: Lightning strikes (sequential, 8 flashes)
2.0s: Text fades in (opacity 0→100%)
2.5s: Hold
3.0s: Loop back to 2.5s
```

**2. Countdown Pulse:**
```
Timeline:
0.0s: Number normal size
0.3s: Number scale 1→1.1 (grow)
0.6s: Number scale 1.1→1 (shrink)
0.9s: Glow intensity 50%→100%
1.2s: Glow intensity 100%→50%
1.5s: Loop
```

**3. Progress Bar Fill:**
```
Timeline:
0.0s: Bar 0% filled
1.0s: Bar 25% filled
2.0s: Bar 50% filled
3.0s: Bar 75% filled
4.0s: Bar 100% filled
4.5s: Pause
5.0s: Loop back to 0s
```

### After Effects настройки:

```
Composition:
- Size: 1200×675px
- Duration: 3-6 seconds
- Frame rate: 30fps
- Background: Black (#000000)

Export settings:
- Format: GIF (via Media Encoder)
- Quality: High
- Dithering: Diffusion
- Colors: 256
- Loop: Forever
```

---

## 🖌️ ДИЗАЙН В FIGMA

### Project Setup:

```
File structure:
├── 🎨 Brand Assets
│   ├── Logo variations
│   ├── Color palette
│   ├── Typography styles
│   └── Icon library
├── 📐 Templates
│   ├── Agent Spotlight
│   ├── Infographic
│   ├── Countdown
│   ├── Quote Card
│   └── Statistics
└── 📅 Week 1-4 Visuals
    ├── Week 1 (Days 1-7)
    ├── Week 2 (Days 8-14)
    ├── Week 3 (Days 15-21)
    └── Week 4 (Days 22-30)
```

### Reusable Components:

**1. Logo Component:**
```
Variants:
- Full (icon + text)
- Icon only
- White version
- Outline version

Sizes:
- Large (400×400px)
- Medium (200×200px)
- Small (100×100px)
```

**2. Button Component:**
```
States:
- Default
- Hover
- Pressed
- Disabled

Colors:
- Primary (cyan)
- Secondary (blue)
- Success (green)
- Danger (red)
```

**3. Card Component:**
```
Variants:
- Agent spotlight
- Feature highlight
- Statistics
- Quote

Padding: 40px all sides
Border-radius: 16px
Background: Cosmic gradient or solid
```

### Styles:

**Colors:**
```
Save all brand colors as Figma styles:
- Primary/Cyan
- Secondary/Blue
- Accent/Dark Blue
- Accent/Gold
- Success/Green
- Danger/Red
- Neutral/Black
- Neutral/White
```

**Typography:**
```
Create text styles for all use cases:
- Title/Large (48px, Orbitron Bold)
- Title/Medium (36px, Orbitron Bold)
- Body/Large (28px, Inter Regular)
- Body/Medium (24px, Inter Regular)
- Body/Small (20px, Inter Regular)
- Caption (16px, Inter Medium)
```

**Effects:**
```
Save common effects:
- Neon glow (cyan)
- Soft shadow
- Inner glow
- Outer glow
```

---

## 🎯 PRODUCTION WORKFLOW

### Step 1: Design (Figma)
```
1. Create artboard (1200×675px)
2. Apply background (cosmic texture)
3. Add text elements (headers, body)
4. Add icons/images
5. Apply effects (glow, shadows)
6. Review spacing and alignment
```

### Step 2: Export
```
Settings:
- Format: PNG (24-bit)
- Scale: 2x (for retina)
- Naming: day1-logo-reveal.png

For animations:
- Export frames as PNG sequence
- Import to After Effects
- Add animation
- Export as GIF
```

### Step 3: Optimization
```
Tools:
- TinyPNG (compress PNG, -70% file size)
- Ezgif (compress GIF, -50% file size)
- ImageOptim (Mac, general optimization)

Target sizes:
- PNG: <2MB
- GIF: <5MB
- MP4: <10MB
```

### Step 4: Upload
```
Platforms:
- Twitter Media Library
- Buffer / Hootsuite (scheduler)
- Cloudflare R2 (backup storage)

Metadata:
- Alt text (accessibility)
- Caption/description
- Hashtags
- Posting time
```

---

## 🔍 QUALITY CHECKLIST

### Pre-publish review:
- [ ] Correct dimensions (1200×675px)
- [ ] File size optimized (<5MB)
- [ ] All text is readable (no typos)
- [ ] Brand colors used correctly
- [ ] Logo visible (watermark)
- [ ] Hashtags included
- [ ] Alt text written
- [ ] Tested on mobile view
- [ ] Tested on desktop view
- [ ] Contrast ratio checked (WCAG AA)

### Brand consistency:
- [ ] Uses official logo
- [ ] Uses brand colors
- [ ] Uses brand fonts
- [ ] Matches visual style
- [ ] Hexagon theme present
- [ ] Cosmic aesthetic maintained

---

## 🎨 ДИЗАЙН ВДОХНОВЕНИЕ

### Benchmark проекты:
```
1. Chainlink - Technical infographics
2. Polygon - Modern, clean aesthetics
3. Aave - Minimalist approach
4. The Graph - Data visualization
5. Uniswap - Playful gradients
```

### Design resources:
```
Icons:
- Heroicons (https://heroicons.com)
- Feather Icons (https://feathericons.com)
- Cryptocurrency icons (https://cryptoicons.co)

Textures:
- Space backgrounds (NASA images - public domain)
- Gradient generators (https://cssgradient.io)
- Noise textures (https://noisepng.com)

Inspiration:
- Dribbble (#crypto #blockchain #ai)
- Behance (crypto design projects)
- Twitter (top crypto projects)
```

---

## 📚 DESIGN SYSTEM DOCUMENTATION

### Файлы:
```
/docs/design/
├── brand-guidelines.pdf (общие правила бренда)
├── color-palette.ase (Adobe swatch файл)
├── typography-guide.pdf (гид по шрифтам)
├── icon-library.sketch (библиотека иконок)
├── figma-templates.fig (все шаблоны)
└── examples/ (примеры визуалов)
```

### Обновление дизайн-системы:
```
Frequency: Ежемесячно
Process:
1. Собрать feedback от команды
2. Проанализировать performance визуалов
3. Обновить best practices
4. Добавить новые компоненты
5. Версионировать изменения
```

---

**Контакты для вопросов:**
- Design lead: [TBD]
- Brand manager: [TBD]
- Marketing lead: [TBD]

**Ресурсы:**
- Figma workspace: [Link TBD]
- Asset library: `/public/variant-2/assets/`
- Documentation: `/docs/marketing/`

---

**Статус:** Production Ready ✅
**Последнее обновление:** 2025-10-21
**Версия:** 1.0
