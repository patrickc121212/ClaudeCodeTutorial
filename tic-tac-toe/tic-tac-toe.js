class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0, tie: 0 };

        this.initializeGame();
    }

    initializeGame() {
        this.boardElement = document.getElementById('board');
        this.gameInfoElement = document.getElementById('game-info');
        this.resetButton = document.getElementById('reset-btn');
        this.scoreXElement = document.getElementById('score-x');
        this.scoreTieElement = document.getElementById('score-tie');
        this.scoreOElement = document.getElementById('score-o');

        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));
        this.resetButton.addEventListener('click', () => this.resetGame());

        this.updateDisplay();
    }

    handleCellClick(e) {
        const cell = e.target;
        if (!cell.classList.contains('cell') || !this.gameActive) return;

        const index = parseInt(cell.getAttribute('data-index'));
        if (this.board[index] !== '') return;

        this.makeMove(index);
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateDisplay();

        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
            return;
        }

        if (this.board.every(cell => cell !== '')) {
            this.endGame('tie');
            return;
        }

        this.switchPlayer();
    }

    checkWinner() {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }

        return null;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateGameInfo();
    }

    endGame(winner) {
        this.gameActive = false;

        if (winner === 'tie') {
            this.gameInfoElement.textContent = "It's a tie!";
            this.scores.tie++;
        } else {
            const winnerLabel = winner === 'X' ? '⚔️ Swords' : '🛡️ Shields';
            this.gameInfoElement.textContent = `${winnerLabel} win!`;
            this.scores[winner]++;
            this.highlightWinningCells(winner);
        }

        this.updateScores();
    }

    highlightWinningCells(winner) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const combo of winningCombinations) {
            const [a, b, c] = combo;
            if (this.board[a] === winner && this.board[b] === winner && this.board[c] === winner) {
                const cells = this.boardElement.children;
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                break;
            }
        }
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;

        // Remove winner highlighting
        const cells = this.boardElement.children;
        for (let i = 0; i < cells.length; i++) {
            cells[i].classList.remove('winner', 'x', 'o');
        }

        this.updateDisplay();
    }

    updateDisplay() {
        const cells = this.boardElement.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            cell.textContent = ''; // Clear text content since we're using CSS
            cell.classList.remove('x', 'o');

            if (this.board[i] === 'X') {
                cell.classList.add('x');
            } else if (this.board[i] === 'O') {
                cell.classList.add('o');
            }
        }

        this.updateGameInfo();
    }

    updateGameInfo() {
        if (this.gameActive) {
            const playerLabel = this.currentPlayer === 'X' ? '⚔️ Swords' : '🛡️ Shields';
            this.gameInfoElement.textContent = `${playerLabel}'s turn`;
        }
    }

    updateScores() {
        this.scoreXElement.textContent = this.scores.X;
        this.scoreTieElement.textContent = this.scores.tie;
        this.scoreOElement.textContent = this.scores.O;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});