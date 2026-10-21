/**
 * Ultimate Tic-Tac-Toe AI Engine
 * Supports Easy, Medium, and Hard (Minimax + Heuristic Evaluation)
 */

class UltimateTicTacToeAI {
  constructor() {
    this.WIN_LINES = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diags
    ];

    this.BOARD_WEIGHTS = [
      3, 2, 3,
      2, 4, 2,
      3, 2, 3
    ]; // Center and corners are more valuable
  }

  // Get all valid moves for current state
  getValidMoves(board, miniBoardStatus, activeBoard) {
    const moves = [];
    if (activeBoard !== -1 && miniBoardStatus[activeBoard] === null) {
      for (let c = 0; c < 9; c++) {
        if (board[activeBoard][c] === null) {
          moves.push({ b: activeBoard, c: c });
        }
      }
    } else {
      // Free choice: can play in any mini-board that is not yet completed
      for (let b = 0; b < 9; b++) {
        if (miniBoardStatus[b] === null) {
          for (let c = 0; c < 9; c++) {
            if (board[b][c] === null) {
              moves.push({ b: b, c: c });
            }
          }
        }
      }
    }
    return moves;
  }

  // Check if a mini-board is won or tied
  checkMiniBoard(cells) {
    for (const [a, b, c] of this.WIN_LINES) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        return cells[a]; // 'X' or 'O'
      }
    }
    // Check if full (tie)
    if (cells.every(cell => cell !== null)) {
      return 'TIE';
    }
    return null;
  }

  // Check if a player has won the main board
  // Note: TIE mini-board counts as BOTH X and O
  checkMainWin(miniBoardStatus, player) {
    for (const [a, b, c] of this.WIN_LINES) {
      const sa = miniBoardStatus[a];
      const sb = miniBoardStatus[b];
      const sc = miniBoardStatus[c];

      const matchA = sa === player || sa === 'TIE';
      const matchB = sb === player || sb === 'TIE';
      const matchC = sc === player || sc === 'TIE';

      if (matchA && matchB && matchC) {
        return true;
      }
    }
    return false;
  }

  // Choose move based on selected difficulty
  getBestMove(board, miniBoardStatus, activeBoard, aiPlayer, difficulty) {
    const validMoves = this.getValidMoves(board, miniBoardStatus, activeBoard);
    if (validMoves.length === 0) return null;

    if (difficulty === 'easy') {
      return this.getRandomMove(validMoves);
    } else if (difficulty === 'medium') {
      return this.getMediumMove(board, miniBoardStatus, activeBoard, aiPlayer, validMoves);
    } else {
      return this.getHardMove(board, miniBoardStatus, activeBoard, aiPlayer, validMoves);
    }
  }

  getRandomMove(validMoves) {
    const idx = Math.floor(Math.random() * validMoves.length);
    return validMoves[idx];
  }

  getMediumMove(board, miniBoardStatus, activeBoard, aiPlayer, validMoves) {
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

    // 1. Can we immediately win the whole game?
    for (const move of validMoves) {
      const nextState = this.simulateMove(board, miniBoardStatus, move, aiPlayer);
      if (this.checkMainWin(nextState.miniBoardStatus, aiPlayer)) {
        return move;
      }
    }

    // 2. Can opponent win next turn on the main board? Block if possible
    for (const move of validMoves) {
      const oppState = this.simulateMove(board, miniBoardStatus, move, humanPlayer);
      if (this.checkMainWin(oppState.miniBoardStatus, humanPlayer)) {
        return move;
      }
    }

    // 3. Can we win this mini-board?
    const miniWinMoves = [];
    for (const move of validMoves) {
      const simulatedCells = [...board[move.b]];
      simulatedCells[move.c] = aiPlayer;
      if (this.checkMiniBoard(simulatedCells) === aiPlayer) {
        miniWinMoves.push(move);
      }
    }
    if (miniWinMoves.length > 0) {
      // Pick one that doesn't give opponent an easy win
      return this.pickSafestMove(board, miniBoardStatus, miniWinMoves, humanPlayer);
    }

    // 4. Block opponent from winning this mini-board
    const blockMiniMoves = [];
    for (const move of validMoves) {
      const simulatedCells = [...board[move.b]];
      simulatedCells[move.c] = humanPlayer;
      if (this.checkMiniBoard(simulatedCells) === humanPlayer) {
        blockMiniMoves.push(move);
      }
    }
    if (blockMiniMoves.length > 0) {
      return blockMiniMoves[0];
    }

    // 5. Score moves by position & safety
    return this.pickSafestMove(board, miniBoardStatus, validMoves, humanPlayer);
  }

  pickSafestMove(board, miniBoardStatus, moves, opponent) {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      let score = 0;
      // Prefer center of mini-board
      if (move.c === 4) score += 3;
      // Prefer corners of mini-board
      else if ([0, 2, 6, 8].includes(move.c)) score += 2;
      else score += 1;

      // Prefer center and corner mini-boards
      score += this.BOARD_WEIGHTS[move.b];

      // Check destination safety
      const targetBoard = move.c;
      if (miniBoardStatus[targetBoard] !== null) {
        // Sending opponent to free choice is slightly risky
        score -= 2;
      } else {
        // Check if opponent can immediately win in target board
        const oppCanWinTarget = this.canPlayerWinBoard(board[targetBoard], opponent);
        if (oppCanWinTarget) {
          score -= 5;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  canPlayerWinBoard(cells, player) {
    for (let c = 0; c < 9; c++) {
      if (cells[c] === null) {
        const testCells = [...cells];
        testCells[c] = player;
        if (this.checkMiniBoard(testCells) === player) {
          return true;
        }
      }
    }
    return false;
  }

  simulateMove(board, miniBoardStatus, move, player) {
    const newBoard = board.map(b => [...b]);
    const newStatus = [...miniBoardStatus];

    newBoard[move.b][move.c] = player;
    const mbResult = this.checkMiniBoard(newBoard[move.b]);
    if (mbResult) {
      newStatus[move.b] = mbResult;
    }

    let nextActive = move.c;
    if (newStatus[nextActive] !== null) {
      nextActive = -1;
    }

    return {
      board: newBoard,
      miniBoardStatus: newStatus,
      activeBoard: nextActive
    };
  }

  // Hard AI: Minimax with Alpha-Beta Pruning and Heuristic Evaluation
  getHardMove(board, miniBoardStatus, activeBoard, aiPlayer, validMoves) {
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

    // 1. Immediate win check
    for (const move of validMoves) {
      const nextState = this.simulateMove(board, miniBoardStatus, move, aiPlayer);
      if (this.checkMainWin(nextState.miniBoardStatus, aiPlayer)) {
        return move;
      }
    }

    // 2. Immediate block main win check
    for (const move of validMoves) {
      const oppState = this.simulateMove(board, miniBoardStatus, move, humanPlayer);
      if (this.checkMainWin(oppState.miniBoardStatus, humanPlayer)) {
        return move;
      }
    }

    // Dynamic depth search
    // If free choice (many moves), depth 2 or 3 to keep it snappy; if single board, depth 4.
    const depth = validMoves.length > 25 ? 2 : (validMoves.length > 12 ? 3 : 4);

    let bestScore = -Infinity;
    let bestMove = validMoves[0];
    let alpha = -Infinity;
    let beta = Infinity;

    // Sort moves with a quick heuristic to improve alpha-beta pruning speed
    const scoredMoves = validMoves.map(m => ({
      move: m,
      quickScore: this.quickEvalMove(board, miniBoardStatus, m, aiPlayer, humanPlayer)
    })).sort((a, b) => b.quickScore - a.quickScore);

    for (const item of scoredMoves) {
      const move = item.move;
      const nextState = this.simulateMove(board, miniBoardStatus, move, aiPlayer);
      
      const score = this.minimax(
        nextState.board,
        nextState.miniBoardStatus,
        nextState.activeBoard,
        depth - 1,
        alpha,
        beta,
        false,
        aiPlayer,
        humanPlayer
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }

    return bestMove;
  }

  quickEvalMove(board, miniBoardStatus, move, aiPlayer, humanPlayer) {
    let score = this.BOARD_WEIGHTS[move.b] * 2 + (move.c === 4 ? 4 : [0,2,6,8].includes(move.c) ? 2 : 1);
    
    // Check if move wins this mini-board
    const testBoard = [...board[move.b]];
    testBoard[move.c] = aiPlayer;
    if (this.checkMiniBoard(testBoard) === aiPlayer) {
      score += 20;
    }

    // Check if destination is free choice or dangerous
    const dest = move.c;
    if (miniBoardStatus[dest] !== null) {
      score -= 5;
    } else if (this.canPlayerWinBoard(board[dest], humanPlayer)) {
      score -= 10;
    }

    return score;
  }

  minimax(board, miniBoardStatus, activeBoard, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer) {
    // Check game termination
    if (this.checkMainWin(miniBoardStatus, aiPlayer)) {
      return 100000 + depth;
    }
    if (this.checkMainWin(miniBoardStatus, humanPlayer)) {
      return -100000 - depth;
    }

    const validMoves = this.getValidMoves(board, miniBoardStatus, activeBoard);
    if (validMoves.length === 0 || depth <= 0) {
      return this.evaluateState(board, miniBoardStatus, activeBoard, aiPlayer, humanPlayer);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const nextState = this.simulateMove(board, miniBoardStatus, move, aiPlayer);
        const evalScore = this.minimax(
          nextState.board,
          nextState.miniBoardStatus,
          nextState.activeBoard,
          depth - 1,
          alpha,
          beta,
          false,
          aiPlayer,
          humanPlayer
        );
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of validMoves) {
        const nextState = this.simulateMove(board, miniBoardStatus, move, humanPlayer);
        const evalScore = this.minimax(
          nextState.board,
          nextState.miniBoardStatus,
          nextState.activeBoard,
          depth - 1,
          alpha,
          beta,
          true,
          aiPlayer,
          humanPlayer
        );
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  evaluateState(board, miniBoardStatus, activeBoard, aiPlayer, humanPlayer) {
    let score = 0;

    // 1. Main board lines analysis
    for (const [a, b, c] of this.WIN_LINES) {
      const line = [miniBoardStatus[a], miniBoardStatus[b], miniBoardStatus[c]];
      
      const aiCount = line.filter(s => s === aiPlayer || s === 'TIE').length;
      const humanCount = line.filter(s => s === humanPlayer || s === 'TIE').length;
      const emptyCount = line.filter(s => s === null).length;

      if (aiCount === 3) score += 50000;
      else if (humanCount === 3) score -= 50000;
      else if (aiCount === 2 && emptyCount === 1) score += 600;
      else if (humanCount === 2 && emptyCount === 1) score -= 750; // urgent block
      else if (aiCount === 1 && emptyCount === 2) score += 80;
      else if (humanCount === 1 && emptyCount === 2) score -= 90;
    }

    // 2. Controlled mini-boards weighting
    for (let b = 0; b < 9; b++) {
      const status = miniBoardStatus[b];
      const weight = this.BOARD_WEIGHTS[b];

      if (status === aiPlayer) {
        score += weight * 80;
      } else if (status === humanPlayer) {
        score -= weight * 85;
      } else if (status === 'TIE') {
        // Shared benefit
        score += weight * 30;
      } else {
        // Open mini-board threat evaluation
        score += this.evalLocalBoard(board[b], aiPlayer, humanPlayer) * (weight * 0.5);
      }
    }

    // 3. Active board initiative penalty/bonus
    if (activeBoard === -1) {
      // Free choice given to next mover
      score -= 60;
    }

    return score;
  }

  evalLocalBoard(cells, aiPlayer, humanPlayer) {
    let localScore = 0;
    for (const [a, b, c] of this.WIN_LINES) {
      const line = [cells[a], cells[b], cells[c]];
      const aiCount = line.filter(v => v === aiPlayer).length;
      const humCount = line.filter(v => v === humanPlayer).length;
      const emptyCount = line.filter(v => v === null).length;

      if (aiCount === 2 && emptyCount === 1) localScore += 15;
      if (humCount === 2 && emptyCount === 1) localScore -= 18;
    }
    return localScore;
  }
}

window.ultimateAI = new UltimateTicTacToeAI();
