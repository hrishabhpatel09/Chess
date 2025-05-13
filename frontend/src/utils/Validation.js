
// Helper function to check if the position is within the board
const isInBoard = (row, col) => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Check if the destination square has a piece of the same color
const isSameColor = (board, fromRow, fromCol, toRow, toCol) => {
    const fromPiece = board[fromRow][fromCol];
    const toPiece = board[toRow][toCol];
    
    if (!toPiece) return false; // Destination square is empty
    
    // Check if both pieces are the same color
    return (fromPiece === fromPiece.toLowerCase()) === (toPiece === toPiece.toLowerCase());
};

// Pawn movement validation
const isValidPawnMove = (fromRow, toRow, fromCol, toCol, board) => {
    const piece = board[fromRow][fromCol];
    const isBlack = piece === piece.toLowerCase();
    const direction = isBlack ? 1 : -1; // Black pawns move down, white pawns move up
    
    // Regular forward move (one square)
    if (fromCol === toCol && toRow === fromRow + direction && !board[toRow][toCol]) {
        return true;
    }
    
    // Initial two-square move
    const startRow = isBlack ? 1 : 6;
    if (fromRow === startRow && fromCol === toCol && toRow === fromRow + 2 * direction &&
        !board[fromRow + direction][fromCol] && !board[toRow][toCol]) {
        return true;
    }
    
    // Capture diagonally
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && 
        board[toRow][toCol] && isSameColor(board, fromRow, fromCol, toRow, toCol) === false) {
        return true;
    }
    
    return false;
};

// Knight movement validation
const isValidKnightMove = (fromRow, toRow, fromCol, toCol, board) => {
    // Knights move in L-shape pattern
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Check for L shape movement (2 in one direction, 1 in other)
    if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
        // Check if destination has same color piece
        return !isSameColor(board, fromRow, fromCol, toRow, toCol);
    }
    
    return false;
};

// Bishop movement validation
const isValidBishopMove = (fromRow, toRow, fromCol, toCol, board) => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Bishop moves diagonally (equal row and column change)
    if (rowDiff !== colDiff) {
        return false;
    }
    
    // Check for pieces in the path
    const rowDir = toRow > fromRow ? 1 : -1;
    const colDir = toCol > fromCol ? 1 : -1;
    
    for (let i = 1; i < rowDiff; i++) {
        if (board[fromRow + i * rowDir][fromCol + i * colDir]) {
            return false; // Path is blocked
        }
    }
    
    // Check if destination has same color piece
    return !isSameColor(board, fromRow, fromCol, toRow, toCol);
};

// Rook movement validation
const isValidRookMove = (fromRow, toRow, fromCol, toCol, board) => {
    // Rook moves horizontally or vertically
    if (fromRow !== toRow && fromCol !== toCol) {
        return false;
    }
    
    // Check path for horizontal move
    if (fromRow === toRow) {
        const start = Math.min(fromCol, toCol) + 1;
        const end = Math.max(fromCol, toCol);
        
        for (let col = start; col < end; col++) {
            if (board[fromRow][col]) {
                return false; // Path is blocked
            }
        }
    } 
    // Check path for vertical move
    else {
        const start = Math.min(fromRow, toRow) + 1;
        const end = Math.max(fromRow, toRow);
        
        for (let row = start; row < end; row++) {
            if (board[row][fromCol]) {
                return false; // Path is blocked
            }
        }
    }
    
    // Check if destination has same color piece
    return !isSameColor(board, fromRow, fromCol, toRow, toCol);
};

// Queen movement validation (combination of rook and bishop)
const isValidQueenMove = (fromRow, toRow, fromCol, toCol, board) => {
    return isValidRookMove(fromRow, toRow, fromCol, toCol, board) || 
           isValidBishopMove(fromRow, toRow, fromCol, toCol, board);
};

// King movement validation
const isValidKingMove = (fromRow, toRow, fromCol, toCol, board) => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // King can move one square in any direction
    if (rowDiff <= 1 && colDiff <= 1) {
        // Check if destination has same color piece
        return !isSameColor(board, fromRow, fromCol, toRow, toCol);
    }
    
    return false;
};

// Main move validation function
const isValidMove = (fromRow, toRow, fromCol, toCol, board) => {
    if (!isInBoard(fromRow, fromCol) || !isInBoard(toRow, toCol)) {
        return false;
    }
    
    const piece = board[fromRow][fromCol];
    if (piece === null) {
        return false;
    }
    
    // Check if moving piece to the same position
    if (fromRow === toRow && fromCol === toCol) {
        return false;
    }
    
    // Get piece type (lowercase)
    const pieceType = piece.toLowerCase();
    
    switch (pieceType) {
        case 'p':
            return isValidPawnMove(fromRow, toRow, fromCol, toCol, board);
        case 'n':
            return isValidKnightMove(fromRow, toRow, fromCol, toCol, board);
        case 'b':
            return isValidBishopMove(fromRow, toRow, fromCol, toCol, board);
        case 'r':
            return isValidRookMove(fromRow, toRow, fromCol, toCol, board);
        case 'q':
            return isValidQueenMove(fromRow, toRow, fromCol, toCol, board);
        case 'k':
            return isValidKingMove(fromRow, toRow, fromCol, toCol, board);
        default:
            return false;
    }
};

// Get all possible moves for a piece
const getPossibleMoves = (row, col, board) => {
    const possibleMoves = [];
    
    // Check all positions on the board
    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(row, toRow, col, toCol, board)) {
                possibleMoves.push({ row: toRow, col: toCol });
            }
        }
    }
    
    return possibleMoves;
};

export { isValidMove, getPossibleMoves };