import React, { memo, useEffect, useState } from 'react';


/* 
*function to get image of chess piece
*/
function getPiecesImage(piece) {
  if (!piece) return null; // No piece for empty squares
  const color = piece === piece.toLowerCase() ? 'b' : 'w'; // Lowercase for black, uppercase for white
  const type = piece.toLowerCase(); // Get the piece type
  return `https://assets-themes.chess.com/image/ejgfv/150/${color}${type}.png`;
}

// Function to parse FEN and generate a board array
export const parseFEN = (fen) => {
  const rows = fen.split(' ')[0].split('/'); // ['rnbqk8','8','8']
  const board = rows.map((row) => {
    const parsedRow = [];
    for (const char of row) {
      if (char >= '1' && char <= '8') {
        // Empty squares
        parsedRow.push(...Array(Number(char)).fill(null));
      } else {
        // Chess pieces
        parsedRow.push(char);
      }
    }
    return parsedRow;
  });
  return board;
};
const moveSelfSound = new Audio("/move-self.mp3");
const captureAudo = new Audio("/capture.mp3");
const wrongMoveAudio = new Audio("/illegal.mp3");
const playMoveAudio = () =>{
  moveSelfSound.play();
}
const playCaptureAudio = () =>{
  captureAudo.play();
}
const ChessBoard = ({ board,setBoard, onPieceMove, owner, isBlackChecked, isWhiteChecked, previousMove}) => {
  const getSquareColor = (row, col) =>
    (row + col) % 2 === 0 ? 'bg-[#EEEED2]' : 'bg-[#769656]';

  const handleDragStart = (e, row, col) => {
    e.dataTransfer.setData('fromRow', row);
    e.dataTransfer.setData('fromCol', col);
  };
  const detectMove = (fromRow, fromCol, toRow, toCol) =>{
    let file = String.fromCharCode('a'.charCodeAt(0) + toCol);
    let row = 8-toRow;
    let piece = board[fromRow][fromCol];
    console.log(piece+file+row)
  }
  const handleDrop = (e, toRow, toCol) => {
    const fromRow = parseInt(e.dataTransfer.getData('fromRow'), 10);
    const fromCol = parseInt(e.dataTransfer.getData('fromCol'), 10);
    onPieceMove(fromRow, fromCol, toRow, toCol);
    console.log(board)
    if(board[toRow][toCol] == null)playMoveAudio();
    else playCaptureAudio();
    detectMove(fromRow, fromCol, toRow, toCol);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allows the drop event to occur
  };
  console.log("got rendered again chaess")
  let selectedSquare = null;
  const isUppercase = (word) =>{
    if(word>='A' && word<='Z')return true;
    else if(word>='a' && word<='z')false;
    else return false;
  }
  const isLowerCase = (word) =>{
    if(word>='a' && word<='z')return true;
    else return false;
  }
  const handleClick = (row,col) =>{
    if(selectedSquare == null){
      selectedSquare = {
        row: row,
        col: col
      }
    }else{
      if(isUppercase(board[row][col]) && isUppercase(board[selectedSquare.row][selectedSquare.col])||isLowerCase(board[row][col]) && isLowerCase(board[selectedSquare.row][selectedSquare.col])){
        selectedSquare = null;
        wrongMoveAudio.play();
        return;
      }
      else if(board[row][col] == null)playMoveAudio();
      else playCaptureAudio();
      onPieceMove(selectedSquare.row, selectedSquare.col, row,col)
    }
  }
  return (
    <div className={`sm:h-[600px] sm:w-[600px] grid grid-cols-8 grid-rows-8 rounded-sm ${owner=='b'?'rotate-180':''}`}>
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-full h-full ${getSquareColor(rowIndex, colIndex)} ${isBlackChecked && piece==='k' ?'bg-red-400':''} ${isWhiteChecked && piece==='K'?'bg-red-400':''} ${((rowIndex==7-previousMove.fromRow && colIndex==previousMove.fromCol)||(rowIndex==7-previousMove.toRow && colIndex==previousMove.toCol))?'bg-yellow-200':''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
            onClick={(e)=>{handleClick(rowIndex,colIndex)}}
          >
            {piece && (
              <img
                src={getPiecesImage(piece)}
                alt={piece}
                className={`w-full h-full ${owner=='b'?'rotate-180':''}`}
                draggable={(piece>='a' && piece<='z' && owner=="b")||(piece>='A' && piece<='Z' && owner=="w")?true:false}
                onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                style={{
                  objectFit: 'contain',
                  pointerEvents: 'auto',
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default memo(ChessBoard)