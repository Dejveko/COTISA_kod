/**
 * ChessEngine - Kompletna implementacija šahovske logike
 * Validacija poteza, detekcija šaha, mata, pata, itd.
 */

export class ChessEngine {
    constructor(fen = null) {
        this.board = [];
        this.turn = 'w'; // 'w' ili 'b'
        this.castling = { K: true, Q: true, k: true, q: true };
        this.enPassant = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveHistory = [];
        this.positionHistory = [];
        
        if (fen) {
            this.loadFEN(fen);
        } else {
            this.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }
    }
    
    // ========== FEN Parser ==========
    loadFEN(fen) {
        const parts = fen.split(' ');
        const position = parts[0];
        
        this.board = [];
        const rows = position.split('/');
        
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            let col = 0;
            for (const char of rows[row]) {
                if (/\d/.test(char)) {
                    const empty = parseInt(char);
                    for (let i = 0; i < empty; i++) {
                        this.board[row][col++] = null;
                    }
                } else {
                    this.board[row][col++] = char;
                }
            }
        }
        
        this.turn = parts[1] || 'w';
        
        // Rokade
        const castling = parts[2] || '-';
        this.castling = {
            K: castling.includes('K'),
            Q: castling.includes('Q'),
            k: castling.includes('k'),
            q: castling.includes('q')
        };
        
        // En passant
        this.enPassant = parts[3] !== '-' ? parts[3] : null;
        
        this.halfMoveClock = parseInt(parts[4]) || 0;
        this.fullMoveNumber = parseInt(parts[5]) || 1;
        
        this.positionHistory = [this.getFEN()];
    }
    
    getFEN() {
        let fen = '';
        
        for (let row = 0; row < 8; row++) {
            let empty = 0;
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    fen += piece;
                } else {
                    empty++;
                }
            }
            if (empty > 0) fen += empty;
            if (row < 7) fen += '/';
        }
        
        fen += ` ${this.turn}`;
        
        let castling = '';
        if (this.castling.K) castling += 'K';
        if (this.castling.Q) castling += 'Q';
        if (this.castling.k) castling += 'k';
        if (this.castling.q) castling += 'q';
        fen += ` ${castling || '-'}`;
        
        fen += ` ${this.enPassant || '-'}`;
        fen += ` ${this.halfMoveClock}`;
        fen += ` ${this.fullMoveNumber}`;
        
        return fen;
    }
    
    // ========== Koordinate ==========
    squareToCoords(square) {
        const col = square.charCodeAt(0) - 97; // 'a' = 0
        const row = 8 - parseInt(square[1]);   // '8' = 0
        return { row, col };
    }
    
    coordsToSquare(row, col) {
        return String.fromCharCode(97 + col) + (8 - row);
    }
    
    getPiece(square) {
        const { row, col } = this.squareToCoords(square);
        return this.board[row][col];
    }
    
    setPiece(square, piece) {
        const { row, col } = this.squareToCoords(square);
        this.board[row][col] = piece;
    }
    
    // ========== Boja figure ==========
    getPieceColor(piece) {
        if (!piece) return null;
        return piece === piece.toUpperCase() ? 'w' : 'b';
    }
    
    isWhitePiece(piece) {
        return piece && piece === piece.toUpperCase();
    }
    
    isBlackPiece(piece) {
        return piece && piece === piece.toLowerCase();
    }
    
    // ========== Generiranje poteza ==========
    getLegalMoves(square) {
        const piece = this.getPiece(square);
        if (!piece) return [];
        
        const pieceColor = this.getPieceColor(piece);
        if (pieceColor !== this.turn) return [];
        
        const pseudoLegal = this.getPseudoLegalMoves(square);
        const legal = [];
        
        for (const target of pseudoLegal) {
            if (this.isMoveLegal(square, target)) {
                legal.push(target);
            }
        }
        
        return legal;
    }
    
    getPseudoLegalMoves(square) {
        const piece = this.getPiece(square);
        if (!piece) return [];
        
        const type = piece.toLowerCase();
        const { row, col } = this.squareToCoords(square);
        const moves = [];
        
        switch (type) {
            case 'p': this.getPawnMoves(row, col, piece, moves); break;
            case 'n': this.getKnightMoves(row, col, piece, moves); break;
            case 'b': this.getBishopMoves(row, col, piece, moves); break;
            case 'r': this.getRookMoves(row, col, piece, moves); break;
            case 'q': this.getQueenMoves(row, col, piece, moves); break;
            case 'k': this.getKingMoves(row, col, piece, moves); break;
        }
        
        return moves;
    }
    
    getPawnMoves(row, col, piece, moves) {
        const isWhite = this.isWhitePiece(piece);
        const direction = isWhite ? -1 : 1;
        const startRow = isWhite ? 6 : 1;
        
        // Naprijed za 1
        if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
            moves.push(this.coordsToSquare(row + direction, col));
            
            // Naprijed za 2 s početne pozicije
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push(this.coordsToSquare(row + 2 * direction, col));
            }
        }
        
        // Jedenje dijagonalno
        for (const dc of [-1, 1]) {
            const newCol = col + dc;
            if (this.isValidSquare(row + direction, newCol)) {
                const target = this.board[row + direction][newCol];
                const targetSquare = this.coordsToSquare(row + direction, newCol);
                
                if (target && this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push(targetSquare);
                }
                
                // En passant
                if (this.enPassant === targetSquare) {
                    moves.push(targetSquare);
                }
            }
        }
        
        return moves;
    }
    
    getKnightMoves(row, col, piece, moves) {
        const jumps = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dr, dc] of jumps) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push(this.coordsToSquare(newRow, newCol));
                }
            }
        }
    }
    
    getBishopMoves(row, col, piece, moves) {
        this.getSlidingMoves(row, col, piece, moves, [[-1,-1], [-1,1], [1,-1], [1,1]]);
    }
    
    getRookMoves(row, col, piece, moves) {
        this.getSlidingMoves(row, col, piece, moves, [[-1,0], [1,0], [0,-1], [0,1]]);
    }
    
    getQueenMoves(row, col, piece, moves) {
        this.getSlidingMoves(row, col, piece, moves, [
            [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
        ]);
    }
    
    getSlidingMoves(row, col, piece, moves, directions) {
        for (const [dr, dc] of directions) {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                
                if (!target) {
                    moves.push(this.coordsToSquare(newRow, newCol));
                } else {
                    if (this.getPieceColor(target) !== this.getPieceColor(piece)) {
                        moves.push(this.coordsToSquare(newRow, newCol));
                    }
                    break;
                }
                
                newRow += dr;
                newCol += dc;
            }
        }
    }
    
    getKingMoves(row, col, piece, moves) {
        const directions = [
            [-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]
        ];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || this.getPieceColor(target) !== this.getPieceColor(piece)) {
                    moves.push(this.coordsToSquare(newRow, newCol));
                }
            }
        }
        
        // Rokade
        const isWhite = this.isWhitePiece(piece);
        if (isWhite && row === 7 && col === 4) {
            // Mala rokada (kingside)
            if (this.castling.K && !this.board[7][5] && !this.board[7][6] && this.board[7][7] === 'R') {
                if (!this.isSquareAttacked('e1', 'b') && !this.isSquareAttacked('f1', 'b') && !this.isSquareAttacked('g1', 'b')) {
                    moves.push('g1');
                }
            }
            // Velika rokada (queenside)
            if (this.castling.Q && !this.board[7][3] && !this.board[7][2] && !this.board[7][1] && this.board[7][0] === 'R') {
                if (!this.isSquareAttacked('e1', 'b') && !this.isSquareAttacked('d1', 'b') && !this.isSquareAttacked('c1', 'b')) {
                    moves.push('c1');
                }
            }
        } else if (!isWhite && row === 0 && col === 4) {
            // Mala rokada crnog
            if (this.castling.k && !this.board[0][5] && !this.board[0][6] && this.board[0][7] === 'r') {
                if (!this.isSquareAttacked('e8', 'w') && !this.isSquareAttacked('f8', 'w') && !this.isSquareAttacked('g8', 'w')) {
                    moves.push('g8');
                }
            }
            // Velika rokada crnog
            if (this.castling.q && !this.board[0][3] && !this.board[0][2] && !this.board[0][1] && this.board[0][0] === 'r') {
                if (!this.isSquareAttacked('e8', 'w') && !this.isSquareAttacked('d8', 'w') && !this.isSquareAttacked('c8', 'w')) {
                    moves.push('c8');
                }
            }
        }
    }
    
    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    // ========== Šah i legalni potezi ==========
    findKing(color) {
        const king = color === 'w' ? 'K' : 'k';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === king) {
                    return this.coordsToSquare(row, col);
                }
            }
        }
        return null;
    }
    
    isSquareAttacked(square, byColor) {
        const { row: targetRow, col: targetCol } = this.squareToCoords(square);
        
        // Provjera svih figura protivnika
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece || this.getPieceColor(piece) !== byColor) continue;
                
                const type = piece.toLowerCase();
                
                switch (type) {
                    case 'p': {
                        const dir = byColor === 'w' ? -1 : 1;
                        if (targetRow === row + dir && Math.abs(targetCol - col) === 1) {
                            return true;
                        }
                        break;
                    }
                    case 'n': {
                        const dr = Math.abs(targetRow - row);
                        const dc = Math.abs(targetCol - col);
                        if ((dr === 2 && dc === 1) || (dr === 1 && dc === 2)) {
                            return true;
                        }
                        break;
                    }
                    case 'b': {
                        if (Math.abs(targetRow - row) === Math.abs(targetCol - col)) {
                            if (this.isClearPath(row, col, targetRow, targetCol)) {
                                return true;
                            }
                        }
                        break;
                    }
                    case 'r': {
                        if (targetRow === row || targetCol === col) {
                            if (this.isClearPath(row, col, targetRow, targetCol)) {
                                return true;
                            }
                        }
                        break;
                    }
                    case 'q': {
                        if (targetRow === row || targetCol === col || 
                            Math.abs(targetRow - row) === Math.abs(targetCol - col)) {
                            if (this.isClearPath(row, col, targetRow, targetCol)) {
                                return true;
                            }
                        }
                        break;
                    }
                    case 'k': {
                        if (Math.abs(targetRow - row) <= 1 && Math.abs(targetCol - col) <= 1) {
                            return true;
                        }
                        break;
                    }
                }
            }
        }
        
        return false;
    }
    
    isClearPath(fromRow, fromCol, toRow, toCol) {
        const dr = Math.sign(toRow - fromRow);
        const dc = Math.sign(toCol - fromCol);
        
        let row = fromRow + dr;
        let col = fromCol + dc;
        
        while (row !== toRow || col !== toCol) {
            if (this.board[row][col]) return false;
            row += dr;
            col += dc;
        }
        
        return true;
    }
    
    isInCheck(color) {
        const kingSquare = this.findKing(color);
        if (!kingSquare) return false;
        
        const enemyColor = color === 'w' ? 'b' : 'w';
        return this.isSquareAttacked(kingSquare, enemyColor);
    }
    
    isMoveLegal(from, to) {
        // Napravi potez privremeno
        const piece = this.getPiece(from);
        const captured = this.getPiece(to);
        const pieceColor = this.getPieceColor(piece);
        
        // Spremi stanje
        const savedEnPassant = this.enPassant;
        const { row: fromRow, col: fromCol } = this.squareToCoords(from);
        const { row: toRow, col: toCol } = this.squareToCoords(to);
        
        // Izvrši potez
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // En passant jedenje
        let enPassantCapture = null;
        if (piece.toLowerCase() === 'p' && to === savedEnPassant) {
            const captureRow = pieceColor === 'w' ? toRow + 1 : toRow - 1;
            enPassantCapture = this.board[captureRow][toCol];
            this.board[captureRow][toCol] = null;
        }
        
        // Provjeri je li kralj još uvijek u šahu
        const legal = !this.isInCheck(pieceColor);
        
        // Vrati sve nazad
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = captured;
        
        if (enPassantCapture !== null) {
            const captureRow = pieceColor === 'w' ? toRow + 1 : toRow - 1;
            this.board[captureRow][toCol] = enPassantCapture;
        }
        
        return legal;
    }
    
    // ========== Odigravanje poteza ==========
    makeMove(from, to, promotion = 'q') {
        const piece = this.getPiece(from);
        if (!piece) return null;
        
        const pieceColor = this.getPieceColor(piece);
        if (pieceColor !== this.turn) return null;
        
        const legalMoves = this.getLegalMoves(from);
        if (!legalMoves.includes(to)) return null;
        
        const captured = this.getPiece(to);
        const { row: fromRow, col: fromCol } = this.squareToCoords(from);
        const { row: toRow, col: toCol } = this.squareToCoords(to);
        
        // SAN notacija
        let san = this.generateSAN(from, to, piece, captured, promotion);
        
        // Napravi potez
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Promocija pijuna
        if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            const promotionPiece = pieceColor === 'w' ? promotion.toUpperCase() : promotion.toLowerCase();
            this.board[toRow][toCol] = promotionPiece;
        }
        
        // En passant jedenje
        if (piece.toLowerCase() === 'p' && to === this.enPassant) {
            const captureRow = pieceColor === 'w' ? toRow + 1 : toRow - 1;
            this.board[captureRow][toCol] = null;
        }
        
        // Rokada
        if (piece.toLowerCase() === 'k' && Math.abs(toCol - fromCol) === 2) {
            if (toCol > fromCol) {
                // Mala rokada
                this.board[toRow][5] = this.board[toRow][7];
                this.board[toRow][7] = null;
            } else {
                // Velika rokada
                this.board[toRow][3] = this.board[toRow][0];
                this.board[toRow][0] = null;
            }
        }
        
        // Update en passant
        if (piece.toLowerCase() === 'p' && Math.abs(toRow - fromRow) === 2) {
            const enPassantRow = (fromRow + toRow) / 2;
            this.enPassant = this.coordsToSquare(enPassantRow, fromCol);
        } else {
            this.enPassant = null;
        }
        
        // Update castling prava
        if (piece === 'K') {
            this.castling.K = false;
            this.castling.Q = false;
        } else if (piece === 'k') {
            this.castling.k = false;
            this.castling.q = false;
        } else if (piece === 'R') {
            if (from === 'h1') this.castling.K = false;
            if (from === 'a1') this.castling.Q = false;
        } else if (piece === 'r') {
            if (from === 'h8') this.castling.k = false;
            if (from === 'a8') this.castling.q = false;
        }
        
        // Ako je top pojeden, ukloni rokadu
        if (to === 'h1') this.castling.K = false;
        if (to === 'a1') this.castling.Q = false;
        if (to === 'h8') this.castling.k = false;
        if (to === 'a8') this.castling.q = false;
        
        // Half move clock
        if (piece.toLowerCase() === 'p' || captured) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }
        
        // Full move number
        if (this.turn === 'b') {
            this.fullMoveNumber++;
        }
        
        // Promijeni turu
        this.turn = this.turn === 'w' ? 'b' : 'w';
        
        // Dodaj u povijest
        const move = {
            from,
            to,
            piece,
            captured,
            san,
            fen: this.getFEN()
        };
        
        this.moveHistory.push(move);
        this.positionHistory.push(this.getFEN().split(' ')[0]);
        
        // Ažuriraj SAN za šah/mat
        if (this.isInCheck(this.turn)) {
            if (this.isCheckmate()) {
                move.san += '#';
            } else {
                move.san += '+';
            }
        }
        
        return move;
    }
    
    generateSAN(from, to, piece, captured, promotion) {
        const pieceType = piece.toLowerCase();
        const { col: fromCol } = this.squareToCoords(from);
        
        // Rokada
        if (pieceType === 'k') {
            const { col: toCol } = this.squareToCoords(to);
            if (Math.abs(toCol - fromCol) === 2) {
                return toCol > fromCol ? 'O-O' : 'O-O-O';
            }
        }
        
        let san = '';
        
        if (pieceType !== 'p') {
            san += piece.toUpperCase();
            
            // Disambiguation - pronađi druge figure istog tipa koje mogu ići na isto polje
            const sameTypeMoves = this.findSameTypeMoves(piece, from, to);
            if (sameTypeMoves.length > 0) {
                const { col: fc, row: fr } = this.squareToCoords(from);
                const sameCol = sameTypeMoves.some(sq => this.squareToCoords(sq).col === fc);
                const sameRow = sameTypeMoves.some(sq => this.squareToCoords(sq).row === fr);
                
                if (!sameCol) {
                    san += String.fromCharCode(97 + fc);
                } else if (!sameRow) {
                    san += (8 - fr);
                } else {
                    san += String.fromCharCode(97 + fc) + (8 - fr);
                }
            }
        }
        
        // Jedenje
        if (captured || (pieceType === 'p' && to === this.enPassant)) {
            if (pieceType === 'p') {
                san += String.fromCharCode(97 + fromCol);
            }
            san += 'x';
        }
        
        san += to;
        
        // Promocija
        if (pieceType === 'p') {
            const { row: toRow } = this.squareToCoords(to);
            if (toRow === 0 || toRow === 7) {
                san += '=' + promotion.toUpperCase();
            }
        }
        
        return san;
    }
    
    findSameTypeMoves(piece, excludeFrom, targetTo) {
        const result = [];
        const pieceType = piece.toLowerCase();
        const pieceColor = this.getPieceColor(piece);
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const p = this.board[row][col];
                if (!p) continue;
                
                const square = this.coordsToSquare(row, col);
                if (square === excludeFrom) continue;
                
                if (p.toLowerCase() === pieceType && this.getPieceColor(p) === pieceColor) {
                    const moves = this.getLegalMoves(square);
                    if (moves.includes(targetTo)) {
                        result.push(square);
                    }
                }
            }
        }
        
        return result;
    }
    
    // ========== Game over detekcija ==========
    isCheckmate() {
        if (!this.isInCheck(this.turn)) return false;
        return this.getAllLegalMoves().length === 0;
    }
    
    isStalemate() {
        if (this.isInCheck(this.turn)) return false;
        return this.getAllLegalMoves().length === 0;
    }
    
    isDraw() {
        return this.isStalemate() || 
               this.isInsufficientMaterial() || 
               this.isFiftyMoveRule() || 
               this.isThreefoldRepetition();
    }
    
    isInsufficientMaterial() {
        const pieces = { w: [], b: [] };
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const color = this.getPieceColor(piece);
                    pieces[color].push(piece.toLowerCase());
                }
            }
        }
        
        // Kralj vs Kralj
        if (pieces.w.length === 1 && pieces.b.length === 1) return true;
        
        // Kralj + lovac/konj vs Kralj
        if ((pieces.w.length === 1 && pieces.b.length === 2 && (pieces.b.includes('b') || pieces.b.includes('n'))) ||
            (pieces.b.length === 1 && pieces.w.length === 2 && (pieces.w.includes('b') || pieces.w.includes('n')))) {
            return true;
        }
        
        return false;
    }
    
    isFiftyMoveRule() {
        return this.halfMoveClock >= 100;
    }
    
    isThreefoldRepetition() {
        const currentPosition = this.getFEN().split(' ')[0];
        let count = 0;
        
        for (const pos of this.positionHistory) {
            if (pos === currentPosition) count++;
        }
        
        return count >= 3;
    }
    
    isGameOver() {
        return this.isCheckmate() || this.isDraw();
    }
    
    getGameResult() {
        if (this.isCheckmate()) {
            return this.turn === 'w' ? 'black_win' : 'white_win';
        }
        if (this.isDraw()) {
            return 'draw';
        }
        return null;
    }
    
    getAllLegalMoves() {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                if (this.getPieceColor(piece) === this.turn) {
                    const from = this.coordsToSquare(row, col);
                    const legalMoves = this.getLegalMoves(from);
                    
                    for (const to of legalMoves) {
                        moves.push({ from, to });
                    }
                }
            }
        }
        
        return moves;
    }
    
    // ========== Pomoćne metode ==========
    getHistory() {
        return this.moveHistory.map(m => m.san);
    }
    
    getPGN() {
        let pgn = '';
        for (let i = 0; i < this.moveHistory.length; i++) {
            if (i % 2 === 0) {
                pgn += `${Math.floor(i / 2) + 1}. `;
            }
            pgn += this.moveHistory[i].san + ' ';
        }
        return pgn.trim();
    }
    
    undo() {
        if (this.moveHistory.length === 0) return null;
        
        const lastMove = this.moveHistory.pop();
        this.positionHistory.pop();
        
        // Vrati na prethodni FEN
        if (this.moveHistory.length > 0) {
            this.loadFEN(this.moveHistory[this.moveHistory.length - 1].fen);
        } else {
            this.loadFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        }
        
        return lastMove;
    }
    
    getCurrentTurn() {
        return this.turn;
    }
    
    clone() {
        const copy = new ChessEngine();
        copy.loadFEN(this.getFEN());
        copy.moveHistory = [...this.moveHistory];
        copy.positionHistory = [...this.positionHistory];
        return copy;
    }
}

export default ChessEngine;
