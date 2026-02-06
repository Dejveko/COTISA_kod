/**
 * ChessBoard - Interaktivna šahovska ploča
 * Čista CSS/JS implementacija bez vanjskih library-a
 */

import ChessEngine from './ChessEngine.js';

export class ChessBoard {
    constructor(containerId, options = {}) {
        // Accept both string ID and Element
        if (typeof containerId === 'string') {
            this.container = document.getElementById(containerId);
        } else if (containerId instanceof Element) {
            this.container = containerId;
        } else {
            throw new Error(`Invalid container: expected string ID or Element`);
        }
        
        if (!this.container) {
            throw new Error(`Container element '${containerId}' not found`);
        }
        
        this.engine = options.engine || new ChessEngine();
        this.orientation = options.orientation || 'white';
        this.draggable = options.draggable !== false;
        this.onMove = options.onMove || null;
        this.onGameEnd = options.onGameEnd || null;
        
        this.selectedSquare = null;
        this.legalMoves = [];
        this.lastMove = null;
        this.isFlipped = this.orientation === 'black';
        
        // Unicod figure
        this.pieces = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'chess-board-container';
        
        // Koordinate - stupci (a-h)
        const topCoords = document.createElement('div');
        topCoords.className = 'board-coords board-coords-top';
        const bottomCoords = document.createElement('div');
        bottomCoords.className = 'board-coords board-coords-bottom';
        
        const files = this.isFlipped ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'];
        files.forEach(f => {
            const t = document.createElement('span');
            t.textContent = f;
            topCoords.appendChild(t);
            
            const b = document.createElement('span');
            b.textContent = f;
            bottomCoords.appendChild(b);
        });
        
        // Glavni board wrapper
        const boardWrapper = document.createElement('div');
        boardWrapper.className = 'board-wrapper';
        
        // Koordinate - redovi (1-8)
        const leftCoords = document.createElement('div');
        leftCoords.className = 'board-coords board-coords-left';
        const rightCoords = document.createElement('div');
        rightCoords.className = 'board-coords board-coords-right';
        
        const ranks = this.isFlipped ? ['1','2','3','4','5','6','7','8'] : ['8','7','6','5','4','3','2','1'];
        ranks.forEach(r => {
            const l = document.createElement('span');
            l.textContent = r;
            leftCoords.appendChild(l);
            
            const ri = document.createElement('span');
            ri.textContent = r;
            rightCoords.appendChild(ri);
        });
        
        // Ploča
        this.boardElement = document.createElement('div');
        this.boardElement.className = 'chess-board';
        
        // Kreiraj polja
        this.squares = {};
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const actualRow = this.isFlipped ? 7 - row : row;
                const actualCol = this.isFlipped ? 7 - col : col;
                
                const square = document.createElement('div');
                const squareName = String.fromCharCode(97 + actualCol) + (8 - actualRow);
                const isLight = (actualRow + actualCol) % 2 === 0;
                
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.square = squareName;
                
                // Click handler
                square.addEventListener('click', (e) => this.handleSquareClick(squareName, e));
                
                // Drag & Drop
                if (this.draggable) {
                    square.addEventListener('dragover', (e) => e.preventDefault());
                    square.addEventListener('drop', (e) => this.handleDrop(squareName, e));
                }
                
                this.squares[squareName] = square;
                this.boardElement.appendChild(square);
            }
        }
        
        // Sastavi sve
        boardWrapper.appendChild(leftCoords);
        boardWrapper.appendChild(this.boardElement);
        boardWrapper.appendChild(rightCoords);
        
        this.container.appendChild(topCoords);
        this.container.appendChild(boardWrapper);
        this.container.appendChild(bottomCoords);
        
        // Renderaj figure
        this.renderPieces();
    }
    
    renderPieces() {
        // Makni sve figure
        Object.values(this.squares).forEach(sq => {
            const existingPiece = sq.querySelector('.piece');
            if (existingPiece) existingPiece.remove();
        });
        
        // Dodaj figure
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.engine.board[row][col];
                if (piece) {
                    const squareName = String.fromCharCode(97 + col) + (8 - row);
                    this.addPiece(squareName, piece);
                }
            }
        }
        
        // Highlight zadnjeg poteza
        this.highlightLastMove();
    }
    
    addPiece(square, piece) {
        const squareEl = this.squares[square];
        if (!squareEl) return;
        
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${this.engine.isWhitePiece(piece) ? 'white' : 'black'}`;
        pieceEl.textContent = this.pieces[piece];
        pieceEl.draggable = this.draggable;
        pieceEl.dataset.piece = piece;
        
        if (this.draggable) {
            pieceEl.addEventListener('dragstart', (e) => this.handleDragStart(square, e));
            pieceEl.addEventListener('dragend', (e) => this.handleDragEnd(e));
        }
        
        squareEl.appendChild(pieceEl);
    }
    
    handleSquareClick(square) {
        if (!this.draggable) return;
        
        const piece = this.engine.getPiece(square);
        
        console.log('[ChessBoard.handleSquareClick]', {
            square,
            piece,
            pieceColor: piece ? this.engine.getPieceColor(piece) : null,
            engineTurn: this.engine.turn,
            draggable: this.draggable
        });
        
        // Ako imamo selektirano polje i kliknemo na legalan potez
        if (this.selectedSquare && this.legalMoves.includes(square)) {
            this.makeMove(this.selectedSquare, square);
            return;
        }
        
        // Deselektiraj ako kliknemo na isto polje
        if (this.selectedSquare === square) {
            this.clearSelection();
            return;
        }
        
        // Selektiraj novu figuru ako je naša
        if (piece && this.engine.getPieceColor(piece) === this.engine.turn) {
            this.selectSquare(square);
        } else {
            console.log('[ChessBoard] Figura nije odabrana jer:', piece ? 'nije tvoj red' : 'prazno polje');
            this.clearSelection();
        }
    }
    
    selectSquare(square) {
        this.clearSelection();
        
        this.selectedSquare = square;
        this.legalMoves = this.engine.getLegalMoves(square);
        
        // Highlight selektiranog polja
        this.squares[square].classList.add('selected');
        
        // Highlight legalnih poteza
        this.legalMoves.forEach(move => {
            const sq = this.squares[move];
            if (sq) {
                const hasPiece = this.engine.getPiece(move);
                sq.classList.add(hasPiece ? 'capture-hint' : 'move-hint');
            }
        });
    }
    
    clearSelection() {
        if (this.selectedSquare) {
            this.squares[this.selectedSquare].classList.remove('selected');
        }
        
        this.legalMoves.forEach(move => {
            const sq = this.squares[move];
            if (sq) {
                sq.classList.remove('move-hint', 'capture-hint');
            }
        });
        
        this.selectedSquare = null;
        this.legalMoves = [];
    }
    
    handleDragStart(square, e) {
        const piece = this.engine.getPiece(square);
        if (!piece || this.engine.getPieceColor(piece) !== this.engine.turn) {
            e.preventDefault();
            return;
        }
        
        this.selectSquare(square);
        e.dataTransfer.setData('text/plain', square);
        e.target.classList.add('dragging');
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    handleDrop(targetSquare, e) {
        e.preventDefault();
        const sourceSquare = e.dataTransfer.getData('text/plain');
        
        if (sourceSquare && this.legalMoves.includes(targetSquare)) {
            this.makeMove(sourceSquare, targetSquare);
        } else {
            this.clearSelection();
        }
    }
    
    makeMove(from, to) {
        // Provjeri za promociju
        const piece = this.engine.getPiece(from);
        const { row: toRow } = this.engine.squareToCoords(to);
        
        let promotion = 'q';
        if (piece && piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            promotion = this.showPromotionDialog();
        }
        
        const move = this.engine.makeMove(from, to, promotion);
        
        if (move) {
            this.lastMove = { from, to };
            this.clearSelection();
            this.renderPieces();
            
            // Play sound
            this.playMoveSound(move.captured);
            
            // Callback
            if (this.onMove) {
                this.onMove(move);
            }
            
            // Game end check
            if (this.engine.isGameOver()) {
                const result = this.engine.getGameResult();
                if (this.onGameEnd) {
                    this.onGameEnd(result);
                }
            }
            
            return move;
        }
        
        return null;
    }
    
    showPromotionDialog() {
        // Za sada uvijek kraljica, može se dodati modal
        return 'q';
    }
    
    playMoveSound(captured) {
        // Jednostavan zvuk poteza
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = captured ? 300 : 400;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            // Ignore audio errors
        }
    }
    
    highlightLastMove() {
        // Makni prethodne highlight-e
        Object.values(this.squares).forEach(sq => {
            sq.classList.remove('last-move-from', 'last-move-to');
        });
        
        if (this.lastMove) {
            const fromSq = this.squares[this.lastMove.from];
            const toSq = this.squares[this.lastMove.to];
            
            if (fromSq) fromSq.classList.add('last-move-from');
            if (toSq) toSq.classList.add('last-move-to');
        }
        
        // Highlight šah
        if (this.engine.isInCheck(this.engine.turn)) {
            const kingSquare = this.engine.findKing(this.engine.turn);
            if (kingSquare && this.squares[kingSquare]) {
                this.squares[kingSquare].classList.add('in-check');
            }
        } else {
            Object.values(this.squares).forEach(sq => sq.classList.remove('in-check'));
        }
    }
    
    // Public API
    setPosition(fen) {
        this.engine.loadFEN(fen);
        this.clearSelection();
        this.lastMove = null;
        this.renderPieces();
    }
    
    getPosition() {
        return this.engine.getFEN();
    }
    
    flip() {
        this.isFlipped = !this.isFlipped;
        this.orientation = this.isFlipped ? 'black' : 'white';
        this.init();
    }
    
    setOrientation(color) {
        this.isFlipped = color === 'black';
        this.orientation = color;
        this.init();
    }
    
    setDraggable(draggable) {
        this.draggable = draggable;
    }
    
    getHistory() {
        return this.engine.getHistory();
    }
    
    getPGN() {
        return this.engine.getPGN();
    }
    
    getMoveHistory() {
        return this.engine.moveHistory;
    }
    
    getCurrentTurn() {
        return this.engine.getCurrentTurn();
    }
    
    isGameOver() {
        return this.engine.isGameOver();
    }
    
    getGameResult() {
        return this.engine.getGameResult();
    }
    
    updateFromFEN(fen) {
        // Spremi trenutni zadnji potez ako FEN ima promjenu
        const currentFEN = this.engine.getFEN().split(' ')[0];
        const newFEN = fen.split(' ')[0];
        
        if (currentFEN !== newFEN) {
            // Postavi novo stanje
            const oldBoard = JSON.stringify(this.engine.board);
            this.engine.loadFEN(fen);
            const newBoard = JSON.stringify(this.engine.board);
            
            if (oldBoard !== newBoard) {
                // Pronađi potez za highlight
                this.findAndSetLastMove(oldBoard, newBoard);
            }
            
            this.clearSelection();
            this.renderPieces();
        }
    }
    
    findAndSetLastMove(oldBoard, newBoard) {
        // Jednostavno: pronađi koja se figura pomaknula
        // Ovo je pojednostavljeno, za prave poteze treba povijest
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

export default ChessBoard;
