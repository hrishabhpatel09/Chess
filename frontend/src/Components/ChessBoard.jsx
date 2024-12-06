import React, { useEffect, useState } from 'react';


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

const ChessBoard = ({ board,setBoard, onPieceMove, owner, isBlackChecked, isWhiteChecked}) => {
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
    detectMove(fromRow, fromCol, toRow, toCol);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allows the drop event to occur
  };
  const [hasFlipped, setHasFlipped] = useState(false);

  useEffect(() => {
  if (owner === "b" && !hasFlipped) {
    const newBoard = board.map(row => [...row]);

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        newBoard[i][j] = board[7 - i][7 - j];
      }
    }

    setBoard(newBoard);
    setHasFlipped(true); // Mark flip as completed.
  }
}, [owner, hasFlipped, board]);

  return (
    <div className={`sm:h-[600px] sm:w-[600px] grid grid-cols-8 grid-rows-8 rounded-sm ${owner=='b'?'rotate-180':''}`}>
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`w-full h-full ${getSquareColor(rowIndex, colIndex)} ${isBlackChecked && piece==='k' ?'bg-red-400':''} ${isWhiteChecked && piece==='K'?'bg-red-400':''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
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

export default ChessBoard