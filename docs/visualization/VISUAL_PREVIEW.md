# 🎨 Agent Graph Visualization - Visual Preview

## Visual Design Examples

### 1. Simple Agent Network

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    👑 OMEGA                             │
│              [Coordinator - Active]                     │
│                    #00E5FF                              │
│                       ⬇️                                │
│            ┌──────────┼──────────┐                     │
│            ⬇️          ⬇️          ⬇️                   │
│         🤖         🤖         🤖                        │
│     [Researcher] [Coder]  [Tester]                     │
│      #00AAFF    #00E5FF   #666666                      │
│      Working     Active     Idle                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Visual Features:**
- OMEGA coordinator pulsates with cyan glow
- Researcher has blue working status
- Coder actively processing with cyan pulse
- Tester idle with gray color
- Animated lines between all nodes
- Particle effects flowing from coordinator

---

### 2. SPARC Workflow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  📋           📋          📋          📋         📋          │
│ [Spec]  →  [Pseudo]  → [Arch]   →  [Refine] → [Complete]  │
│ #00FF88    #00FF88    #00AAFF    #666666    #666666        │
│  100%       100%       75%         0%          0%           │
│ Success    Success   Working     Idle        Idle          │
│                                                              │
│ [██████]  [██████]  [███████░]  [░░░░░░]  [░░░░░░]         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Completed phases show green (#00FF88)
- Current phase working in blue (#00AAFF)
- Progress bars under each task
- Animated arrows between completed phases
- Pending phases in gray

---

### 3. Full-Stack Team

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                      👑 Coordinator                          │
│                     [Active - #00E5FF]                       │
│                            │                                 │
│         ┌──────┬───────┬───┴───┬───────┬──────┐             │
│         ⬇️      ⬇️       ⬇️       ⬇️       ⬇️      ⬇️           │
│      🤖     🤖      🤖      🤖      🤖     🤖              │
│   Backend Frontend  DB    QA   DevOps Security           │
│   #00AAFF #00AAFF #00E5FF #00AAFF #666666 #00E5FF        │
│    80%     70%     50%     60%     20%     40%            │
│                                                              │
│   Backend ←→ Database                                       │
│   Frontend ←→ Backend                                       │
│   QA → Backend & Frontend                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Central coordinator with star topology
- Load percentage shown for each agent
- Cross-agent communication lines
- Color-coded by activity level
- Bidirectional data flow indicators

---

### 4. Data Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  📊         📊          📊         📊         📊             │
│ Source → Transform → Filter → Aggregate → Sink            │
│ #00E5FF   #00AAFF    #00E5FF  #00AAFF   #00FF88          │
│  5k/s      4.8k/s     3.2k/s    1.5k/s    1.5k/s          │
│ 10 MB      9.5 MB      6 MB      3 MB      3 MB           │
│                                                              │
│ ═════>   ═════>    ═════>    ═════>                       │
│ 100MB/s   95MB/s    60MB/s    30MB/s                      │
│  5ms       8ms      12ms      10ms                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Throughput displayed above nodes
- Data size shown below nodes
- Thick edges represent bandwidth
- Bandwidth/latency metrics on edges
- Green sink indicates success
- Animated data flow particles

---

### 5. Real-Time Updates

```
┌──────────────────────────────────────────────────────────────┐
│                Time: 10:30:45                                │
│                                                              │
│              👑 Coordinator [Active]                         │
│                     ⚡ 12 tasks                              │
│                                                              │
│    🤖      🤖      🤖      🤖      🤖                       │
│  Agent1  Agent2  Agent3  Agent4  Agent5                    │
│  #00E5FF #00AAFF #00FF88 #666666 #FF4444                   │
│  Active Working Success  Idle    Error                     │
│   75%     82%     100%     0%     45%                       │
│                                                              │
│  [New Agent Spawning... 🔄]                                 │
│                                                              │
│  Recent Activity:                                           │
│  • Agent3 completed task "Build API"                       │
│  • Agent5 encountered error                                │
│  • Agent1 started "Data Analysis"                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Visual Features:**
- Live timestamp updates
- Status changes with transitions
- Error highlighting in red
- Success celebration in green
- New agent spawn animation
- Activity feed sidebar

---

## Color Palette Reference

### Status Colors

```css
┌─────────────┬─────────┬──────────────────────────┐
│ Status      │ Color   │ Hex                      │
├─────────────┼─────────┼──────────────────────────┤
│ Active      │ █████   │ #00E5FF (Cyan)          │
│ Working     │ █████   │ #00AAFF (Blue)          │
│ Idle        │ █████   │ #666666 (Gray)          │
│ Success     │ █████   │ #00FF88 (Green)         │
│ Error       │ █████   │ #FF4444 (Red)           │
└─────────────┴─────────┴──────────────────────────┘
```

### UI Elements

```css
┌─────────────┬─────────┬──────────────────────────┐
│ Element     │ Color   │ Hex                      │
├─────────────┼─────────┼──────────────────────────┤
│ Background  │ █████   │ #0a0a0a (Very Dark)     │
│ Panels      │ █████   │ #1a1a1a (Dark)          │
│ Border      │ █████   │ #00E5FF (Cyan)          │
│ Text        │ █████   │ #ffffff (White)         │
│ Muted Text  │ █████   │ #888888 (Light Gray)    │
└─────────────┴─────────┴──────────────────────────┘
```

---

## Animation Examples

### 1. Node Pulsation (Active State)

```
Frame 1: ⚪ (scale: 1.0, glow: 0px)
Frame 2: 🔵 (scale: 1.05, glow: 5px)
Frame 3: 🔵 (scale: 1.1, glow: 10px)
Frame 4: 🔵 (scale: 1.05, glow: 5px)
Frame 5: ⚪ (scale: 1.0, glow: 0px)

Loop: 2 seconds
Effect: Breathing animation with cyan glow
```

### 2. Data Flow Particles

```
Edge: Node A ────────────> Node B

Particle Flow:
T=0.0s: ⚡Node A
T=0.5s:    ⚡
T=1.0s:       ⚡
T=1.5s:          ⚡
T=2.0s:             ⚡Node B

Speed: 2 seconds per edge
Color: Cyan (#00E5FF)
Size: 4px radius
Effect: Smooth linear motion
```

### 3. Status Change Transition

```
Idle → Active:

T=0.0s: ⚪ Gray (#666666)
T=0.1s: 🌑 Fade out (opacity: 0.5)
T=0.2s: 🔵 Fade in Cyan (#00E5FF)
T=0.3s: 💙 Full active (opacity: 1.0, glow: 10px)

Duration: 300ms
Easing: ease-in-out
```

### 4. Node Spawn Animation

```
T=0.0s: (not visible)
T=0.1s: ⚪ (opacity: 0, scale: 0.8)
T=0.2s: 🔵 (opacity: 0.5, scale: 0.9)
T=0.3s: 🔵 (opacity: 0.8, scale: 1.0)
T=0.4s: 💙 (opacity: 1.0, scale: 1.0, glow: 10px)

Duration: 400ms
Easing: spring (300, 30)
Effect: Elastic bounce
```

---

## Interactive Elements

### 1. Node Click → Detail Panel

```
┌─────────────────┐      ┌───────────────────────────┐
│                 │      │  ✕ Close                  │
│   🤖 Agent     │ ───> │                           │
│   [Working]    │      │  Worker Agent             │
│   #00AAFF      │      │  Status: Working          │
│                 │      │  Load: 75%                │
└─────────────────┘      │  Type: Researcher         │
   Node                  │                           │
                         │  [Activate] [Idle] [×]    │
                         └───────────────────────────┘
                         Detail Panel (slide in)
```

### 2. Hover Effects

```
Normal:        Hover:
┌─────┐       ┌─────┐
│     │       │ ⚡  │  ← Tooltip appears
│ 🤖  │  →    │ 🤖  │  ← Scale: 1.05
│     │       │     │  ← Shadow: 0 8px 30px
└─────┘       └─────┘
```

### 3. Drag & Drop

```
Start:           Dragging:          End:
┌─────┐         ┌─────┐           ┌─────┐
│ 🤖  │   →     │ 🤖  │ (cursor)  │ 🤖  │
└─────┘         └─────┘           └─────┘
Position A      Moving...         Position B
                (opacity: 0.8)
```

---

## Control Panel Preview

```
┌─────────────────────────────┐
│ Graph Controls          [−] │
├─────────────────────────────┤
│                             │
│ [+ Add Node]                │
│                             │
│ Node Type:                  │
│ [👑] [🤖] [📋] [📊]         │
│                             │
│ Filter: [All Nodes  ▼]      │
│                             │
│ Layout:                     │
│ [Circular] [Grid]           │
│ [Force] [Hierarchical]      │
│                             │
│ View:                       │
│ [✓ Particles] [✓ Animate]   │
│                             │
│ [⬇ Export] [⬆ Import]       │
│                             │
│ Stats:                      │
│ Nodes: 5  Active: 3         │
│ Edges: 8  Tasks: 12         │
│                             │
└─────────────────────────────┘
```

---

## Mini-Map Preview

```
┌─────────────────────┐
│  Graph Overview     │
├─────────────────────┤
│     ⬤               │
│    ⬤⬤⬤             │
│   ⬤   ⬤            │
│  ⬤⬤⬤⬤⬤            │
│                     │
│  [Viewport Box]     │
└─────────────────────┘

Colors:
⬤ Active   - Cyan
⬤ Working  - Blue
⬤ Idle     - Gray
```

---

## Responsive Design

### Desktop View (1920x1080)

```
┌──────────────────────────────────────────────┐
│ Controls              Graph            Legend│
│ [Panel]           [Full Size]         [Info] │
│                                               │
│ 280px                1360px            280px │
└──────────────────────────────────────────────┘
```

### Tablet View (768x1024)

```
┌───────────────────────┐
│     Controls [−]      │
├───────────────────────┤
│                       │
│      Graph            │
│    [Full Width]       │
│                       │
│   Legend (Bottom)     │
└───────────────────────┘
```

### Mobile View (375x667)

```
┌─────────────┐
│  [☰] Menu   │
├─────────────┤
│             │
│   Graph     │
│  [Mobile]   │
│             │
│ [Controls]  │
└─────────────┘
```

---

## Performance Visualizations

### Load Meter

```
Agent Load: 75%
[████████████████░░░░░]

0%   25%   50%   75%   100%
│    │     │     │     │
Low        Medium    High
```

### Throughput Graph

```
5k/s ┃   ╱╲
     ┃  ╱  ╲
     ┃ ╱    ╲
     ┃╱      ╲
0    ┗━━━━━━━━━━> time
     0s  1s  2s
```

### Status Distribution

```
┌────────────────┐
│ Agent Status   │
├────────────────┤
│ ████ Active 40%│
│ ███ Working 30%│
│ ██ Success 20% │
│ █ Idle 10%     │
└────────────────┘
```

---

## Theme Variations

### Dark Theme (Default)

```
Background: #0a0a0a (Very Dark)
Panels:     #1a1a1a (Dark)
Text:       #ffffff (White)
Accent:     #00E5FF (Cyan)
```

### Light Theme (Optional)

```
Background: #f5f5f5 (Light Gray)
Panels:     #ffffff (White)
Text:       #000000 (Black)
Accent:     #0077FF (Blue)
```

### Glassmorphism Theme (Optional)

```
Background: rgba(255, 255, 255, 0.05)
Backdrop:   blur(20px)
Border:     1px solid rgba(255, 255, 255, 0.1)
Shadow:     0 8px 32px rgba(0, 0, 0, 0.37)
```

---

## Export Preview

### PNG Export

```
┌────────────────────────────┐
│  📸 Graph Screenshot       │
│                            │
│  Resolution: 1920x1080     │
│  Format: PNG               │
│  Quality: High             │
│  Transparency: Yes         │
│                            │
│  [Download PNG]            │
└────────────────────────────┘
```

### JSON Export

```json
{
  "nodes": [
    {
      "id": "1",
      "type": "coordinator",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "OMEGA",
        "status": "active"
      }
    }
  ],
  "edges": [...]
}
```

---

**Ready to build stunning visualizations! 🎨**

See `/src/components/visualization/demo.html` for live preview.
