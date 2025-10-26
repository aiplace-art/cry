# 🚀 3D Agent Visualization - Quick Start

## Instant Demo

**Open in browser:**
```
/public/variant-2/agent-visualization.html
```

That's it! The visualization auto-initializes with 27 AI agents.

## 🎯 What You'll See

### Visual Elements
- **3D Sphere Agents**: Color-coded by category, pulsing with activity
- **Connection Lines**: Network connections with flowing data particles
- **Cosmic Particles**: 500+ floating particles in space
- **Glowing Effects**: Bloom post-processing for magical glow

### Colors
- 🟡 **Yellow** = Trading Agents
- 🔵 **Cyan** = Analysis Agents
- 🔵 **Blue** = Community Agents
- 🟣 **Purple** = Development Agents

## 🎮 Controls

### Mouse
- **Drag**: Rotate camera (orbit view)
- **Right-Click Drag**: Pan camera
- **Scroll**: Zoom in/out
- **Move**: Subtle camera shift

### Buttons
- ⏸️ **Pause/Resume**: Toggle auto-rotation
- 🎥 **Reset Camera**: Return to default view
- ✨ **Toggle Particles**: Show/hide cosmic particles

## 📦 Add to Your Page

### Method 1: Standalone HTML
```html
<div id="agent-3d-visualization" style="width: 100%; height: 600px;"></div>

<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  new AgentVisualization3D('agent-3d-visualization');
</script>
```

### Method 2: With Custom Agents
```html
<!-- Define agents first -->
<script src="/public/variant-2/js/live-agents.js"></script>

<!-- Then load visualization -->
<div id="agent-3d-visualization"></div>
<script type="module">
  import { AgentVisualization3D } from '/public/variant-2/js/agent-visualization-3d.js';

  // Uses window.AGENTS automatically
  const viz = new AgentVisualization3D('agent-3d-visualization');
</script>
```

## 🔧 Customization

### Change Colors
Edit `colors` object in `agent-visualization-3d.js`:
```javascript
this.colors = {
  purple: 0x9333ea,  // Your color
  blue: 0x3b82f6,    // Your color
  cyan: 0x00E5FF,    // Your color
  yellow: 0xFFE900,  // Your color
};
```

### Change Particle Count
```javascript
createCosmicParticles() {
  const particleCount = 300; // Lower for mobile
  // ... rest of code
}
```

### Disable Auto-Rotate
```javascript
this.controls.autoRotate = false;
this.controls.autoRotateSpeed = 0;
```

## 📱 Performance Tips

### For Mobile
Reduce particles for better FPS:
```javascript
const particleCount = window.innerWidth < 768 ? 200 : 500;
```

### For Low-End Devices
Disable bloom:
```javascript
// Comment out in setupPostProcessing()
// const bloomPass = new UnrealBloomPass(...);
// this.composer.addPass(bloomPass);
```

## 🐛 Troubleshooting

### Blank Screen
- Check browser console for errors
- Ensure Three.js CDN is accessible
- Verify container element exists

### Low FPS
- Reduce particle count (500 → 200)
- Lower pixel ratio (2 → 1)
- Disable bloom post-processing

### Agents Not Showing
- Check `window.AGENTS` is defined
- Verify category colors are set
- Check console for initialization errors

## 📊 Browser Support

✅ **Fully Supported**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Partial Support**
- Mobile Safari (reduce particles)
- Older browsers (no modules)

## 🎨 Integration Examples

### In Dashboard Page
```html
<section class="agents-section">
  <h2>Live Agent Network</h2>
  <div id="agent-3d-visualization" style="height: 700px;"></div>
</section>
```

### In Modal/Popup
```javascript
function showAgentViz() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="modal-backdrop">
      <div id="viz-container" style="width: 80vw; height: 80vh;"></div>
      <button onclick="closeViz()">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Initialize after DOM ready
  setTimeout(() => {
    new AgentVisualization3D('viz-container');
  }, 100);
}
```

## 🚀 Next Steps

1. **Test the Demo**: Open `agent-visualization.html`
2. **Customize Colors**: Match your brand palette
3. **Integrate**: Add to your dashboard/landing page
4. **Optimize**: Adjust particles/quality for your audience

## 📖 Full Documentation

See `/docs/3D_AGENT_VISUALIZATION_GUIDE.md` for:
- Complete technical details
- Performance optimization
- Advanced customization
- API reference

---

**Questions?** Check the full guide or inspect the code comments!
