const isValidMove = (fromRow, toRow, fromCol, toCol,board) => {
    //TODO: Implement the logic to validate the move
    const peice = board[fromRow][fromCol];
    if(peice === null){
        return false;
    }
    peice.toLowerCase();
    if(peice === 'p'){
        return isValidQueenMove(fromRow, toRow, fromCol, toCol, board);
    }
    return true;
}