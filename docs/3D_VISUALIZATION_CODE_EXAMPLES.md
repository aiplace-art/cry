# 💻 3D Agent Visualization - Code Examples

## Quick Integration Examples

### Example 1: Minimal Setup (1 Minute)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #0a0118; }
    #viz { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="viz"></div>

  <script type="module">
    import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';
    new AgentVisualization3D('viz');
  </script>
</body>
</html>
```

**Result**: Full-screen 3D visualization with all effects

---

### Example 2: Dashboard Integration

```html
<!-- Your dashboard page -->
<section class="dashboard-section">
  <h2>Live AI Agent Network</h2>

  <div class="viz-container" style="
    width: 100%;
    height: 600px;
    border-radius: 24px;
    overflow: hidden;
    background: rgba(30, 32, 38, 0.4);
    border: 1px solid rgba(147, 51, 234, 0.3);
  ">
    <div id="agent-network-3d"></div>
  </div>
</section>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  // Initialize when section is visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      new AgentVisualization3D('agent-network-3d');
      observer.disconnect();
    }
  });

  observer.observe(document.querySelector('.viz-container'));
</script>
```

**Result**: Visualization loads only when scrolled into view (performance optimization)

---

### Example 3: With Custom Controls

```html
<div id="viz-container" style="height: 700px;"></div>

<div class="controls">
  <button id="pauseBtn">⏸️ Pause</button>
  <button id="resetBtn">🎥 Reset</button>
  <button id="particlesBtn">✨ Particles</button>
  <button id="screenshotBtn">📸 Screenshot</button>
</div>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  const viz = new AgentVisualization3D('viz-container');

  // Pause/Resume
  let isPaused = false;
  document.getElementById('pauseBtn').onclick = () => {
    isPaused = !isPaused;
    if (isPaused) viz.pause();
    else viz.resume();
  };

  // Reset camera
  document.getElementById('resetBtn').onclick = () => {
    viz.camera.position.set(0, 30, 80);
    viz.controls.reset();
  };

  // Toggle particles
  let particlesVisible = true;
  document.getElementById('particlesBtn').onclick = () => {
    particlesVisible = !particlesVisible;
    viz.particles.visible = particlesVisible;
  };

  // Screenshot (bonus!)
  document.getElementById('screenshotBtn').onclick = () => {
    viz.renderer.render(viz.scene, viz.camera);
    const dataURL = viz.renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'agent-network.png';
    link.href = dataURL;
    link.click();
  };
</script>
```

**Result**: Full control panel with screenshot export

---

### Example 4: Mobile-Optimized

```html
<div id="viz"></div>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  // Detect mobile
  const isMobile = window.innerWidth < 768;

  // Create visualization
  const viz = new AgentVisualization3D('viz');

  // Optimize for mobile
  if (isMobile) {
    // Reduce particles
    viz.particles.geometry.setDrawRange(0, 200); // Show only 200

    // Disable auto-rotate (save battery)
    viz.controls.autoRotate = false;

    // Lower quality
    viz.renderer.setPixelRatio(1);

    // Disable bloom on low-end
    if (navigator.hardwareConcurrency < 4) {
      viz.composer = viz.renderer; // Skip post-processing
    }
  }
</script>
```

**Result**: Optimized performance for mobile devices

---

### Example 5: Modal/Popup

```html
<button id="showVizBtn">🌌 Show Agent Network</button>

<div id="modal" style="
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
">
  <button id="closeBtn" style="
    position: absolute;
    top: 20px; right: 20px;
    z-index: 10000;
    padding: 10px 20px;
    background: #9333ea;
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
  ">✕ Close</button>

  <div id="modal-viz" style="
    width: 90vw;
    height: 90vh;
    margin: 5vh auto;
  "></div>
</div>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  let viz = null;

  // Show modal
  document.getElementById('showVizBtn').onclick = () => {
    document.getElementById('modal').style.display = 'block';

    // Initialize visualization
    setTimeout(() => {
      viz = new AgentVisualization3D('modal-viz');
    }, 100);
  };

  // Close modal
  document.getElementById('closeBtn').onclick = () => {
    document.getElementById('modal').style.display = 'none';

    // Cleanup
    if (viz) {
      viz.destroy();
      viz = null;
    }
  };
</script>
```

**Result**: Popup visualization with proper cleanup

---

### Example 6: React Component

```jsx
import { useEffect, useRef } from 'react';

function AgentNetworkViz() {
  const containerRef = useRef(null);
  const vizRef = useRef(null);

  useEffect(() => {
    // Dynamic import
    import('/public/variant-2/js/agent-visualization-3d.js').then((module) => {
      const { AgentVisualization3D } = module;

      // Initialize
      vizRef.current = new AgentVisualization3D(containerRef.current.id);
    });

    // Cleanup
    return () => {
      if (vizRef.current) {
        vizRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="agent-viz-wrapper">
      <h2>AI Agent Network</h2>
      <div
        id="agent-3d-viz"
        ref={containerRef}
        style={{
          width: '100%',
          height: '700px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'rgba(30, 32, 38, 0.4)',
        }}
      />
    </div>
  );
}

export default AgentNetworkViz;
```

**Result**: React component with cleanup on unmount

---

### Example 7: Vue Component

```vue
<template>
  <div class="agent-viz">
    <h2>AI Agent Network</h2>
    <div
      id="agent-3d-viz"
      ref="vizContainer"
      :style="containerStyle"
    ></div>

    <div class="controls">
      <button @click="toggleRotation">
        {{ isRotating ? '⏸️ Pause' : '▶️ Resume' }}
      </button>
      <button @click="resetCamera">🎥 Reset</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgentNetworkViz',

  data() {
    return {
      viz: null,
      isRotating: true,
      containerStyle: {
        width: '100%',
        height: '700px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'rgba(30, 32, 38, 0.4)',
      },
    };
  },

  async mounted() {
    // Dynamic import
    const module = await import('/public/variant-2/js/agent-visualization-3d.js');
    const { AgentVisualization3D } = module;

    // Initialize
    this.viz = new AgentVisualization3D('agent-3d-viz');
  },

  beforeUnmount() {
    // Cleanup
    if (this.viz) {
      this.viz.destroy();
    }
  },

  methods: {
    toggleRotation() {
      this.isRotating = !this.isRotating;
      this.viz.controls.autoRotate = this.isRotating;
    },

    resetCamera() {
      this.viz.camera.position.set(0, 30, 80);
      this.viz.controls.reset();
    },
  },
};
</script>
```

**Result**: Vue component with reactive controls

---

### Example 8: Custom Agent Data

```html
<div id="viz"></div>

<script>
  // Define custom agents
  window.AGENTS = [
    {
      id: 1,
      name: 'Custom Agent 1',
      category: 'trading',
      status: 'online'
    },
    {
      id: 2,
      name: 'Custom Agent 2',
      category: 'analysis',
      status: 'working'
    },
    // ... more agents
  ];
</script>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  // Will use window.AGENTS automatically
  const viz = new AgentVisualization3D('viz');
</script>
```

**Result**: Visualization with your custom agent data

---

### Example 9: Real-time Updates

```html
<div id="viz"></div>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  const viz = new AgentVisualization3D('viz');

  // Simulate real-time agent status updates
  setInterval(() => {
    // Pick random agent
    const randomAgent = viz.agentNodes[
      Math.floor(Math.random() * viz.agentNodes.length)
    ];

    // Make it pulse faster (working state)
    randomAgent.pulseSpeed = 2;

    // Reset after 3 seconds
    setTimeout(() => {
      randomAgent.pulseSpeed = 0.5 + Math.random() * 0.5;
    }, 3000);
  }, 5000);

  // Listen to custom events
  window.addEventListener('agentStatusChange', (e) => {
    const { agentId, status } = e.detail;

    const node = viz.agentNodes.find(n => n.agent.id === agentId);
    if (node && status === 'working') {
      node.pulseSpeed *= 2; // Faster pulse
    }
  });
</script>
```

**Result**: Dynamic updates based on real agent status

---

### Example 10: Full-Featured Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HypeAI - Agent Network</title>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Space Grotesk', sans-serif;
      background: #0a0118;
      color: white;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 3rem;
      background: linear-gradient(135deg, #9333ea, #3b82f6, #00E5FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .viz-wrapper {
      height: 700px;
      border-radius: 24px;
      overflow: hidden;
      background: rgba(30, 32, 38, 0.4);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(147, 51, 234, 0.3);
      box-shadow: 0 20px 60px rgba(147, 51, 234, 0.3);
      margin-bottom: 30px;
    }

    .controls {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      background: rgba(147, 51, 234, 0.1);
      border: 1px solid #9333ea;
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn:hover {
      background: rgba(147, 51, 234, 0.2);
      border-color: #00E5FF;
      transform: translateY(-2px);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }

    .stat-card {
      padding: 24px;
      background: rgba(30, 32, 38, 0.4);
      border-radius: 16px;
      border: 1px solid rgba(147, 51, 234, 0.2);
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00E5FF, #9333ea);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      color: #A0A3B1;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>🌌 AI Agent Network</h1>
      <p>Real-time 3D visualization of 27 AI agents</p>
    </header>

    <div class="viz-wrapper">
      <div id="agent-viz"></div>
    </div>

    <div class="controls">
      <button class="btn" id="pauseBtn">⏸️ Pause</button>
      <button class="btn" id="resetBtn">🎥 Reset</button>
      <button class="btn" id="particlesBtn">✨ Particles</button>
      <button class="btn" id="fullscreenBtn">🖥️ Fullscreen</button>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value" id="agentCount">27</div>
        <div class="stat-label">Active Agents</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="connectionCount">45</div>
        <div class="stat-label">Active Connections</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="particleCount">500</div>
        <div class="stat-label">Cosmic Particles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="fpsCount">60</div>
        <div class="stat-label">FPS</div>
      </div>
    </div>
  </div>

  <script type="module">
    import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

    // Initialize
    const viz = new AgentVisualization3D('agent-viz');

    // Update stats
    document.getElementById('agentCount').textContent = viz.agentNodes.length;
    document.getElementById('connectionCount').textContent = viz.connections.length;

    // Controls
    let isPaused = false;
    document.getElementById('pauseBtn').onclick = () => {
      isPaused = !isPaused;
      isPaused ? viz.pause() : viz.resume();
    };

    document.getElementById('resetBtn').onclick = () => {
      viz.camera.position.set(0, 30, 80);
      viz.controls.reset();
    };

    let particlesVisible = true;
    document.getElementById('particlesBtn').onclick = () => {
      particlesVisible = !particlesVisible;
      viz.particles.visible = particlesVisible;
    };

    document.getElementById('fullscreenBtn').onclick = () => {
      viz.renderer.domElement.requestFullscreen();
    };

    // FPS counter
    let frameCount = 0;
    let lastTime = performance.now();
    setInterval(() => {
      const now = performance.now();
      const fps = Math.round(frameCount / ((now - lastTime) / 1000));
      document.getElementById('fpsCount').textContent = fps;
      frameCount = 0;
      lastTime = now;
    }, 1000);

    // Count frames
    function countFrames() {
      frameCount++;
      requestAnimationFrame(countFrames);
    }
    countFrames();
  </script>
</body>
</html>
```

**Result**: Complete production-ready page with stats and controls

---

## 🎨 Styling Examples

### Variant-2 Theme
```css
.viz-container {
  background: rgba(30, 32, 38, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(147, 51, 234, 0.3);
  box-shadow: 0 20px 60px rgba(147, 51, 234, 0.3);
}
```

### Glassmorphism
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Cosmic Gradients
```css
.cosmic-text {
  background: linear-gradient(135deg, #9333ea, #3b82f6, #00E5FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cosmic-bg {
  background: radial-gradient(ellipse at bottom, #1e1b4b 0%, #0a0118 100%);
}
```

---

## 🚀 Performance Tips

### Lazy Load
```javascript
// Load only when needed
document.getElementById('showVizBtn').onclick = async () => {
  const module = await import('./agent-visualization-3d.js');
  const viz = new module.AgentVisualization3D('viz');
};
```

### Intersection Observer
```javascript
// Load when scrolled into view
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    import('./agent-visualization-3d.js').then(module => {
      new module.AgentVisualization3D('viz');
    });
    observer.disconnect();
  }
});
observer.observe(document.getElementById('viz-section'));
```

### Mobile Detection
```javascript
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  // Reduce quality
  viz.particles.geometry.setDrawRange(0, 200);
  viz.renderer.setPixelRatio(1);
}
```

---

**More examples in the full documentation!**
