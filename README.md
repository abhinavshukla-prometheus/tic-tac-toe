# 🎮 Tic Tac Toe - Ultimate Web Experience

A modern, polished, feature-packed Tic Tac Toe web game built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript** (Zero External Dependencies).

Features a responsive gaming aesthetic with dark/light themes, smooth SVG stroke animations, pure JavaScript canvas confetti, Web Audio API sound synthesis, persistent score tracking, and an unbeatable **Minimax AI** engine.

---

## ✨ Features

- **🎮 Game Modes**:
  - **Player vs Player (2 Players)**: Play locally with a friend on the same device.
  - **Player vs AI**: Play against the computer as **X** or **O**. If you choose O, the AI automatically takes the first turn as X.
- **🤖 3 AI Difficulty Levels**:
  - **Easy**: Random move selection.
  - **Medium**: Tactical AI that checks 1-move wins, blocks opponent winning moves, and makes strategic choices.
  - **Hard**: Optimal **Minimax Algorithm** with depth scoring — completely unbeatable!
- **🎨 Modern Gaming UI**:
  - **Dark & Light Mode**: Default dark theme with neon cyan (`#38bdf8`) and pink (`#ff3b69`) accents, plus a high-contrast light theme.
  - **SVG Stroke Animations**: Smooth drawing paths when placing X and O symbols.
  - **Animated Strike-Through Line**: SVG overlay dynamically draws a glowing line across the winning combination.
  - **Confetti Victory FX**: Lightweight pure JavaScript canvas particle explosion on wins.
- **🎵 Synthesized Web Audio**: Built-in sound effects (move pops, win chords, draw tones) powered by Web Audio API — works 100% offline with a built-in mute/unmute toggle.
- **📊 Persistent Scoreboard**: Tracks Player X Wins, Player O Wins, and Draws across rounds using `localStorage`. Includes a score reset button.
- **♿ Full Accessibility**:
  - **Keyboard Grid Navigation**: Arrow keys (`Up`, `Down`, `Left`, `Right`) to move across cells, `Enter`/`Space` to select, and `R` key to restart round.
  - **Screen Reader Friendly**: Proper ARIA roles (`grid`, `gridcell`, `radiogroup`) and `aria-live="polite"` status announcements.
- **📱 Fully Responsive**: Fluid CSS layout designed for mobile phones, tablets, and desktop displays.

---

## 📁 Project Structure

```
tic-tac-toe/
│
├── index.html   # Semantic HTML5 layout, ARIA markup, SVG line overlay & modal
├── style.css    # Responsive CSS3 styles, CSS custom variables & keyframe animations
├── script.js    # Game logic, Minimax AI engine, canvas confetti & Web Audio synthesis
└── README.md    # Documentation
```

---

## 🚀 Getting Started

No build system, npm install, or web server required! 

1. **Clone or Download** this repository.
2. Double-click **`index.html`** to open the game directly in any modern web browser (Chrome, Firefox, Edge, Safari).

---

## 🎮 How to Play

1. **Select Game Mode**:
   - Choose between **2 Players** or **Vs AI**.
2. **Configure AI Settings** (in Vs AI mode):
   - Choose your symbol (**Play as X** or **Play as O**).
   - Select difficulty: **Easy**, **Medium**, or **Hard**.
3. **Make Your Move**:
   - Click/tap any empty cell on the 3×3 grid (or navigate using Arrow keys and press `Enter`/`Space`).
4. **Winning the Game**:
   - Get 3 of your symbols in a row (horizontally, vertically, or diagonally) to win!

---

## ⌨️ Keyboard Shortcuts

| Shortcut Key | Action |
| :--- | :--- |
| `Arrow Keys` (`↑` `↓` `←` `→`) | Navigate between 3×3 grid cells |
| `Enter` / `Space` | Select current grid cell |
| `R` | Restart current round |

---

## 🛠️ Built With

- **HTML5**: Semantic tags, ARIA attributes, SVG graphics.
- **CSS3**: CSS Custom Variables, Flexbox, Grid, Glassmorphism, Keyframe animations.
- **Vanilla JavaScript (ES6+)**: Modular functions, Web Audio API, Canvas 2D Context, LocalStorage API.

---

## 📄 License

This project is licensed under the MIT License - free to use, modify, and distribute.
