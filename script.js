/**
 * Tic Tac Toe - Professional Game Logic & AI Engine
 * Full implementation supporting PvP, PvC (Minimax, Medium, Easy),
 * Web Audio sound synthesis, Canvas Confetti, SVG strike-through line,
 * and ARIA accessibility.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // Game State Variables
  // ==========================================================================
  
  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let gameActive = true;
  let gameMode = 'pvp'; // 'pvp' or 'pvc'
  let humanSymbol = 'X'; // Default symbol in PvC
  let computerSymbol = 'O'; // Opposite of humanSymbol
  let difficulty = 'hard'; // 'easy', 'medium', 'hard'
  let isComputerThinking = false;
  let soundEnabled = true;

  const WINNING_COMBINATIONS = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal 1
    [2, 4, 6]  // Diagonal 2
  ];

  let scores = {
    X: 0,
    O: 0,
    draws: 0
  };

  // ==========================================================================
  // DOM Element References
  // ==========================================================================
  
  const boardElement = document.getElementById('board');
  const cells = document.querySelectorAll('.cell');
  const statusBanner = document.getElementById('status-display');
  const statusText = document.getElementById('status-text');
  const boardWrapper = document.getElementById('board-wrapper');
  const strikeSvg = document.getElementById('strike-svg');
  const strikeLine = document.getElementById('strike-line');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // Scoreboard Elements
  const scoreXElement = document.getElementById('score-x');
  const scoreOElement = document.getElementById('score-o');
  const scoreDrawsElement = document.getElementById('score-draws');
  const labelXElement = document.getElementById('label-x');
  const labelOElement = document.getElementById('label-o');
  const cardX = document.querySelector('.player-x-card');
  const cardO = document.querySelector('.player-o-card');

  // Control Buttons
  const modePvpBtn = document.getElementById('mode-pvp');
  const modePvcBtn = document.getElementById('mode-pvc');
  const aiOptionsCard = document.getElementById('ai-options');
  
  const symbolXBtn = document.getElementById('symbol-x');
  const symbolOBtn = document.getElementById('symbol-o');
  
  const diffEasyBtn = document.getElementById('diff-easy');
  const diffMediumBtn = document.getElementById('diff-medium');
  const diffHardBtn = document.getElementById('diff-hard');

  const restartBtn = document.getElementById('restart-btn');
  const resetScoreBtn = document.getElementById('reset-score-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');

  // Modal Elements
  const modalOverlay = document.getElementById('modal-overlay');
  const modalIconContainer = document.getElementById('modal-icon-container');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalPlayAgainBtn = document.getElementById('modal-play-again-btn');

  // Icons for theme & sound
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  // ==========================================================================
  // Web Audio API Synthesizer (Zero External Dependencies)
  // ==========================================================================

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'win') {
        // Arpeggio chord C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const noteOsc = audioCtx.createOscillator();
          const noteGain = audioCtx.createGain();
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          noteGain.gain.setValueAtTime(0.2, now + idx * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
          noteOsc.connect(noteGain);
          noteGain.connect(audioCtx.destination);
          noteOsc.start(now + idx * 0.08);
          noteOsc.stop(now + idx * 0.08 + 0.25);
        });
      } else if (type === 'draw') {
        // Sad descending tones
        const notes = [400, 350, 300];
        notes.forEach((freq, idx) => {
          const noteOsc = audioCtx.createOscillator();
          const noteGain = audioCtx.createGain();
          noteOsc.type = 'sawtooth';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
          noteGain.gain.setValueAtTime(0.1, now + idx * 0.1);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
          noteOsc.connect(noteGain);
          noteGain.connect(audioCtx.destination);
          noteOsc.start(now + idx * 0.1);
          noteOsc.stop(now + idx * 0.1 + 0.15);
        });
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  // ==========================================================================
  // Initialization & Settings Setup
  // ==========================================================================

  function init() {
    loadScore();
    loadTheme();
    setupEventListeners();
    startGame();
  }

  function setupEventListeners() {
    // Cell clicks and keyboard
    cells.forEach((cell) => {
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('keydown', handleCellKeyDown);
    });

    // Game Mode Buttons
    modePvpBtn.addEventListener('click', () => setGameMode('pvp'));
    modePvcBtn.addEventListener('click', () => setGameMode('pvc'));

    // Symbol Selection Buttons
    symbolXBtn.addEventListener('click', () => setHumanSymbol('X'));
    symbolOBtn.addEventListener('click', () => setHumanSymbol('O'));

    // Difficulty Buttons
    diffEasyBtn.addEventListener('click', () => setDifficulty('easy'));
    diffMediumBtn.addEventListener('click', () => setDifficulty('medium'));
    diffHardBtn.addEventListener('click', () => setDifficulty('hard'));

    // Action Buttons
    restartBtn.addEventListener('click', () => resetGame());
    resetScoreBtn.addEventListener('click', () => resetScores());
    modalPlayAgainBtn.addEventListener('click', () => {
      hideModal();
      resetGame();
    });

    // Toggles
    themeToggleBtn.addEventListener('click', toggleTheme);
    soundToggleBtn.addEventListener('click', toggleSound);

    // Keyboard shortcut (R for restart)
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'r' || e.key === 'R') && !e.target.matches('input, button')) {
        resetGame();
      }
    });

    // Window resize - recalculate strike line position if visible
    window.addEventListener('resize', () => {
      const result = checkWinner(board);
      if (result) {
        drawWinningLine(result.combo);
      }
    });
  }

  // ==========================================================================
  // Game Flow & Core Operations
  // ==========================================================================

  function startGame() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    isComputerThinking = false;

    // Reset Cell DOM
    cells.forEach((cell, idx) => {
      cell.innerHTML = '';
      cell.className = 'cell';
      cell.removeAttribute('disabled');
      cell.setAttribute('aria-label', `Row ${Math.floor(idx / 3) + 1}, Column ${(idx % 3) + 1}, empty`);
    });

    // Clear SVG strike line
    strikeLine.classList.remove('active');
    strikeLine.setAttribute('x1', '0');
    strikeLine.setAttribute('y1', '0');
    strikeLine.setAttribute('x2', '0');
    strikeLine.setAttribute('y2', '0');

    // Hide Modal
    hideModal();

    // Update Player Labels on Scoreboard
    updatePlayerLabels();
    updateStatusDisplay();

    // If PvC and Computer plays first ('X')
    if (gameMode === 'pvc' && currentPlayer === computerSymbol) {
      triggerComputerTurn();
    }
  }

  function resetGame() {
    startGame();
  }

  function handleCellClick(e) {
    initAudio();
    const cell = e.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'), 10);

    if (!gameActive || isComputerThinking || board[index] !== '') {
      return;
    }

    // In PvC mode, ensure human is playing on their turn
    if (gameMode === 'pvc' && currentPlayer !== humanSymbol) {
      return;
    }

    makeMove(index, currentPlayer);
  }

  function handleCellKeyDown(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(e);
      return;
    }

    // Arrow Key Grid Navigation
    let targetIndex = null;
    if (e.key === 'ArrowRight') {
      targetIndex = (index + 1) % 9;
    } else if (e.key === 'ArrowLeft') {
      targetIndex = (index - 1 + 9) % 9;
    } else if (e.key === 'ArrowDown') {
      targetIndex = (index + 3) % 9;
    } else if (e.key === 'ArrowUp') {
      targetIndex = (index - 3 + 9) % 9;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      cells[targetIndex].focus();
    }
  }

  function makeMove(index, symbol) {
    if (board[index] !== '' || !gameActive) return;

    board[index] = symbol;
    renderCellSymbol(index, symbol);
    playSound('move');

    // Check Win/Draw
    const winResult = checkWinner(board);
    if (winResult) {
      handleWin(winResult);
      return;
    }

    if (checkDraw(board)) {
      handleDraw();
      return;
    }

    // Switch Player
    switchPlayer();
  }

  function renderCellSymbol(index, symbol) {
    const cell = cells[index];
    cell.classList.add('occupied');
    cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, occupied by ${symbol}`);

    if (symbol === 'X') {
      cell.innerHTML = `
        <svg class="symbol-x" viewBox="0 0 100 100">
          <path d="M 20,20 L 80,80 M 80,20 L 20,80" />
        </svg>
      `;
    } else {
      cell.innerHTML = `
        <svg class="symbol-o" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="35" />
        </svg>
      `;
    }
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusDisplay();

    // Check if Computer turn needed
    if (gameMode === 'pvc' && currentPlayer === computerSymbol && gameActive) {
      triggerComputerTurn();
    }
  }

  function triggerComputerTurn() {
    isComputerThinking = true;
    statusBanner.classList.add('thinking');
    statusText.textContent = `Computer (${computerSymbol}) is thinking...`;
    disableBoardInput(true);

    const delay = Math.floor(Math.random() * 200) + 400; // Natural 400-600ms thinking delay
    setTimeout(() => {
      if (!gameActive) return;
      computerMove();
      isComputerThinking = false;
      statusBanner.classList.remove('thinking');
      disableBoardInput(false);
    }, delay);
  }

  function disableBoardInput(disable) {
    cells.forEach((cell) => {
      if (disable) {
        cell.setAttribute('tabindex', '-1');
      } else if (cell.innerHTML === '') {
        cell.setAttribute('tabindex', '0');
      }
    });
  }

  // ==========================================================================
  // Computer AI Engine (Easy, Medium, Minimax Hard)
  // ==========================================================================

  function computerMove() {
    let moveIndex = null;

    if (difficulty === 'easy') {
      moveIndex = getRandomMove(board);
    } else if (difficulty === 'medium') {
      // 1. Can AI win right now?
      moveIndex = findWinningMove(board, computerSymbol);
      // 2. Can Human win right now? Block it!
      if (moveIndex === null) {
        moveIndex = findWinningMove(board, humanSymbol);
      }
      // 3. 50% Minimax optimal move, 50% Random move
      if (moveIndex === null) {
        if (Math.random() < 0.5) {
          moveIndex = getMinimaxMove(board);
        } else {
          moveIndex = getRandomMove(board);
        }
      }
    } else {
      // Hard (Unbeatable Minimax)
      moveIndex = getMinimaxMove(board);
    }

    if (moveIndex !== null && moveIndex !== undefined) {
      makeMove(moveIndex, computerSymbol);
    }
  }

  function getRandomMove(currentBoard) {
    const available = [];
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === '') available.push(i);
    }
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  function findWinningMove(currentBoard, symbol) {
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === '') {
        currentBoard[i] = symbol;
        const win = checkWinnerState(currentBoard);
        currentBoard[i] = '';
        if (win && win.winner === symbol) {
          return i;
        }
      }
    }
    return null;
  }

  function getMinimaxMove(currentBoard) {
    // If board is completely empty, pick center or corner for speed
    const emptyCount = currentBoard.filter(c => c === '').length;
    if (emptyCount === 9) {
      const firstMoves = [0, 2, 4, 6, 8];
      return firstMoves[Math.floor(Math.random() * firstMoves.length)];
    }

    const result = minimax(currentBoard, 0, true, computerSymbol, humanSymbol);
    return result.move;
  }

  /**
   * Minimax Recursive Algorithm
   * Scores: AI Win = +10 - depth, Human Win = depth - 10, Draw = 0
   */
  function minimax(tempBoard, depth, isMaximizing, aiSym, huSym) {
    const winState = checkWinnerState(tempBoard);
    if (winState) {
      if (winState.winner === aiSym) return { score: 10 - depth };
      if (winState.winner === huSym) return { score: depth - 10 };
      if (winState.winner === 'draw') return { score: 0 };
    }

    const available = [];
    for (let i = 0; i < 9; i++) {
      if (tempBoard[i] === '') available.push(i);
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      let bestMove = available[0];

      for (let i of available) {
        tempBoard[i] = aiSym;
        let result = minimax(tempBoard, depth + 1, false, aiSym, huSym);
        tempBoard[i] = '';

        if (result.score > bestScore) {
          bestScore = result.score;
          bestMove = i;
        }
      }
      return { score: bestScore, move: bestMove };
    } else {
      let bestScore = Infinity;
      let bestMove = available[0];

      for (let i of available) {
        tempBoard[i] = huSym;
        let result = minimax(tempBoard, depth + 1, true, aiSym, huSym);
        tempBoard[i] = '';

        if (result.score < bestScore) {
          bestScore = result.score;
          bestMove = i;
        }
      }
      return { score: bestScore, move: bestMove };
    }
  }

  // ==========================================================================
  // Win / Draw Evaluation & Visual FX
  // ==========================================================================

  function checkWinnerState(currentBoard) {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], combo };
      }
    }
    if (currentBoard.every(cell => cell !== '')) {
      return { winner: 'draw', combo: null };
    }
    return null;
  }

  function checkWinner(currentBoard) {
    const res = checkWinnerState(currentBoard);
    if (res && res.winner !== 'draw') return res;
    return null;
  }

  function checkDraw(currentBoard) {
    return currentBoard.every(cell => cell !== '') && !checkWinner(currentBoard);
  }

  function handleWin(winResult) {
    gameActive = false;
    const { winner, combo } = winResult;

    // Highlight winning cells
    combo.forEach(idx => cells[idx].classList.add('winning-cell'));

    // Draw Strike-through line
    drawWinningLine(combo);

    // Trigger Confetti
    triggerConfetti();

    // Sound FX
    playSound('win');

    // Update Score
    scores[winner]++;
    saveScore();
    updateScoreboard();

    // Status Banner
    const winnerName = getPlayerDisplayName(winner);
    statusText.textContent = `🎉 ${winnerName} Wins!`;

    // Show Modal
    setTimeout(() => {
      showModal(
        `<span style="color: ${winner === 'X' ? 'var(--color-x)' : 'var(--color-o)'}; font-weight:800;">${winner}</span>`,
        `${winnerName} Victory!`,
        `Congratulations on winning this round!`
      );
    }, 700);
  }

  function handleDraw() {
    gameActive = false;
    playSound('draw');

    scores.draws++;
    saveScore();
    updateScoreboard();

    statusText.textContent = `It's a Draw! 🤝`;

    setTimeout(() => {
      showModal(
        `<span style="color: var(--color-draw); font-weight:800;">=</span>`,
        `Game Draw!`,
        `Both players played brilliantly!`
      );
    }, 600);
  }

  function drawWinningLine(combo) {
    const startCell = cells[combo[0]];
    const endCell = cells[combo[2]];

    const wrapperRect = boardWrapper.getBoundingClientRect();
    const startRect = startCell.getBoundingClientRect();
    const endRect = endCell.getBoundingClientRect();

    // Calculate center coordinates relative to wrapper
    const x1 = (startRect.left + startRect.width / 2) - wrapperRect.left;
    const y1 = (startRect.top + startRect.height / 2) - wrapperRect.top;
    const x2 = (endRect.left + endRect.width / 2) - wrapperRect.left;
    const y2 = (endRect.top + endRect.height / 2) - wrapperRect.top;

    strikeSvg.setAttribute('viewBox', `0 0 ${wrapperRect.width} ${wrapperRect.height}`);
    strikeLine.setAttribute('x1', x1);
    strikeLine.setAttribute('y1', y1);
    strikeLine.setAttribute('x2', x2);
    strikeLine.setAttribute('y2', y2);

    // Trigger animation
    requestAnimationFrame(() => {
      strikeLine.classList.add('active');
    });
  }

  // ==========================================================================
  // Pure JS Canvas Confetti Particle System
  // ==========================================================================

  function triggerConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    const wrapperRect = boardWrapper.getBoundingClientRect();
    confettiCanvas.width = wrapperRect.width;
    confettiCanvas.height = wrapperRect.height;

    const particles = [];
    const colors = ['#38bdf8', '#ff3b69', '#a855f7', '#22c55e', '#eab308'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height / 2,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.8) * 12,
        gravity: 0.25,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let animationFrame;
    const startTime = performance.now();

    function renderConfetti(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.opacity = Math.max(0, 1 - elapsed / 2200);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 2200) {
        animationFrame = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    animationFrame = requestAnimationFrame(renderConfetti);
  }

  // ==========================================================================
  // Scoreboard & Settings Management
  // ==========================================================================

  function getPlayerDisplayName(symbol) {
    if (gameMode === 'pvp') {
      return `Player ${symbol}`;
    }
    return symbol === humanSymbol ? 'You' : 'Computer';
  }

  function updateStatusDisplay() {
    if (!gameActive) return;

    if (gameMode === 'pvp') {
      statusText.textContent = `Player ${currentPlayer}'s Turn`;
    } else {
      if (currentPlayer === humanSymbol) {
        statusText.textContent = `Your Turn (${humanSymbol})`;
      } else {
        statusText.textContent = `Computer's Turn (${computerSymbol})`;
      }
    }

    // Highlight scoreboard turn
    if (currentPlayer === 'X') {
      cardX.classList.add('active-turn');
      cardO.classList.remove('active-turn');
    } else {
      cardO.classList.add('active-turn');
      cardX.classList.remove('active-turn');
    }
  }

  function updatePlayerLabels() {
    if (gameMode === 'pvp') {
      labelXElement.textContent = 'Player X';
      labelOElement.textContent = 'Player O';
    } else {
      if (humanSymbol === 'X') {
        labelXElement.textContent = 'You (X)';
        labelOElement.textContent = 'Computer (O)';
      } else {
        labelXElement.textContent = 'Computer (X)';
        labelOElement.textContent = 'You (O)';
      }
    }
  }

  function updateScoreboard() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
    scoreDrawsElement.textContent = scores.draws;
  }

  function saveScore() {
    try {
      localStorage.setItem('ticTacToe_scores', JSON.stringify(scores));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function loadScore() {
    try {
      const saved = localStorage.getItem('ticTacToe_scores');
      if (saved) {
        scores = JSON.parse(saved);
        updateScoreboard();
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  function resetScores() {
    scores = { X: 0, O: 0, draws: 0 };
    saveScore();
    updateScoreboard();
  }

  // ==========================================================================
  // Controls Handlers (Mode, Symbol, Difficulty)
  // ==========================================================================

  function setGameMode(mode) {
    if (gameMode === mode) return;
    gameMode = mode;

    if (mode === 'pvp') {
      modePvpBtn.classList.add('active');
      modePvpBtn.setAttribute('aria-checked', 'true');
      modePvcBtn.classList.remove('active');
      modePvcBtn.setAttribute('aria-checked', 'false');
      aiOptionsCard.classList.add('hidden');
    } else {
      modePvcBtn.classList.add('active');
      modePvcBtn.setAttribute('aria-checked', 'true');
      modePvpBtn.classList.remove('active');
      modePvpBtn.setAttribute('aria-checked', 'false');
      aiOptionsCard.classList.remove('hidden');
    }

    resetGame();
  }

  function setHumanSymbol(symbol) {
    if (humanSymbol === symbol) return;
    humanSymbol = symbol;
    computerSymbol = symbol === 'X' ? 'O' : 'X';

    if (symbol === 'X') {
      symbolXBtn.classList.add('active');
      symbolXBtn.setAttribute('aria-checked', 'true');
      symbolOBtn.classList.remove('active');
      symbolOBtn.setAttribute('aria-checked', 'false');
    } else {
      symbolOBtn.classList.add('active');
      symbolOBtn.setAttribute('aria-checked', 'true');
      symbolXBtn.classList.remove('active');
      symbolXBtn.setAttribute('aria-checked', 'false');
    }

    resetGame();
  }

  function setDifficulty(diff) {
    if (difficulty === diff) return;
    difficulty = diff;

    [diffEasyBtn, diffMediumBtn, diffHardBtn].forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-checked', 'false');
    });

    if (diff === 'easy') {
      diffEasyBtn.classList.add('active');
      diffEasyBtn.setAttribute('aria-checked', 'true');
    } else if (diff === 'medium') {
      diffMediumBtn.classList.add('active');
      diffMediumBtn.setAttribute('aria-checked', 'true');
    } else {
      diffHardBtn.classList.add('active');
      diffHardBtn.setAttribute('aria-checked', 'true');
    }

    resetGame();
  }

  // ==========================================================================
  // Modal & Theme / Sound Toggles
  // ==========================================================================

  function showModal(iconHtml, titleText, subtitleText) {
    modalIconContainer.innerHTML = iconHtml;
    modalTitle.textContent = titleText;
    modalSubtitle.textContent = subtitleText;
    modalOverlay.classList.remove('hidden');
    modalPlayAgainBtn.focus();
  }

  function hideModal() {
    modalOverlay.classList.add('hidden');
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);

    if (newTheme === 'dark') {
      themeIconSun.classList.remove('hidden');
      themeIconMoon.classList.add('hidden');
    } else {
      themeIconSun.classList.add('hidden');
      themeIconMoon.classList.remove('hidden');
    }

    try {
      localStorage.setItem('ticTacToe_theme', newTheme);
    } catch (e) {}
  }

  function loadTheme() {
    try {
      const savedTheme = localStorage.getItem('ticTacToe_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (savedTheme === 'dark') {
        themeIconSun.classList.remove('hidden');
        themeIconMoon.classList.add('hidden');
      } else {
        themeIconSun.classList.add('hidden');
        themeIconMoon.classList.remove('hidden');
      }
    } catch (e) {}
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
    }
  }

  // Initialize the game
  init();
});
