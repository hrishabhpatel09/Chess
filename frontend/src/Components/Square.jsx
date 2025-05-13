import { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { movePiece, setActiveCell } from "../redux/boardSlice.js"
import { socket } from "../App.jsx"
import { isValidMove } from "../utils/Validation.js"

//TODO: we can save it in assets also
function getPiecesImage(piece) {
    if (!piece) return null; // No piece for empty squares
    const color = piece === piece.toLowerCase() ? 'b' : 'w'; // Lowercase for black, uppercase for white
    const type = piece.toLowerCase(); // Get the piece type
    return `https://assets-themes.chess.com/image/ejgfv/150/${color}${type}.png`;
}

function getSquareColor(row, col) {
    return (row + col) % 2 === 0 ? 'bg-[#EEEED2]' : 'bg-[#729551]';
}

const ExecuteMove = (fromRow, fromCol, toRow, toCol) => {
  let fromFile = String.fromCharCode('a'.charCodeAt(0) + fromCol);
  let fromNumber = 8 - fromRow;
  let toFile = String.fromCharCode('a'.charCodeAt(0) + toCol);
  let toNumber = 8 - toRow;
  let from = fromFile + fromNumber;
  let to = toFile + toNumber;
  socket.emit('move', { from: from, to: to });
};

const Square = ({piece, rowIndex, colIndex, owner, isCheckedSquare}) => {
  const dispatch = useDispatch();
  const board = useSelector((state) => state.board.board);
  const activeCell = useSelector((state) => state.board.activeCell);
  const possibleMoves = useSelector((state) => state.board.possibleMoves);
  const isWhitesTurn = useSelector((state) => state.board.isWhitesTurn);

  // Check if this square is a possible move
  const isPossibleMove = possibleMoves.some(move => move.row === rowIndex && move.col === colIndex);
  
  // Check if this is the active cell
  const isActiveCell = activeCell && activeCell.row === rowIndex && activeCell.col === colIndex;

  const makeMove = (fromRow, toRow, fromCol, toCol) => {
    if (isValidMove(fromRow, toRow, fromCol, toCol, board)) {
      dispatch(movePiece({fromRow, toRow, fromCol, toCol}));
      ExecuteMove(fromRow, fromCol, toRow, toCol);
    }
  }

  const handleClick = () => {
    // If we have an active cell and this square is a possible move, make the move
    if (activeCell && isPossibleMove) {
      makeMove(activeCell.row, rowIndex, activeCell.col, colIndex);
      return;
    }
    
    // Otherwise, select the piece (if it's the right color for this turn)
    if (piece) {
      const isPieceWhite = piece === piece.toUpperCase();
      if (isPieceWhite === isWhitesTurn) {
        dispatch(setActiveCell({ row: rowIndex, col: colIndex }));
      }
    } else {
      // Clicking on an empty square that's not a possible move clears the selection
      dispatch(setActiveCell({ row: rowIndex, col: colIndex }));
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, rowIndex, colIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({rowIndex, colIndex}));
    // Also select this piece to show possible moves while dragging
    dispatch(setActiveCell({ row: rowIndex, col: colIndex }));
  }
  
  const handleDropEnd = (e, rowIndex, colIndex) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    makeMove(data.rowIndex, rowIndex, data.colIndex, colIndex);
  }
  
  const handleDragOver = (e) => {
    e.preventDefault();
  }

  // Determine square background color
  let squareStyle = getSquareColor(rowIndex, colIndex);
  if (isCheckedSquare) {
    squareStyle = "bg-red-400";
  } else if (isActiveCell) {
    squareStyle = "bg-blue-300"; // Highlight selected piece
  } else if (isPossibleMove) {
    squareStyle = "bg-yellow-300"; // Highlight possible moves
  }

  return (
    <div 
      className={`w-full h-full ${squareStyle} relative cursor-pointer`}
      onClick={handleClick}
      onDrop={(e) => handleDropEnd(e, rowIndex, colIndex)}
      onDragOver={handleDragOver}
    >
      {/* Overlay for possible moves */}
      {isPossibleMove && !piece && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 opacity-60 rounded-full w-1/3 h-1/3"></div>
      )}
      
      {/* Piece image */}
      {piece && (
        <img
          src={getPiecesImage(piece)}
          alt={piece}
          className={`w-full h-full ${owner === 'b' ? 'rotate-180' : ''}`}
          style={{
            objectFit: 'contain',
            pointerEvents: 'auto',
          }}
          draggable={!((owner=="b" ^ (piece.toLowerCase() === piece)))?true:false}
          onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
        />
      )}
      
      {/* Capture highlight for possible moves on pieces */}
      {isPossibleMove && piece && (
        <div className="absolute inset-0 border-4 border-yellow-300 rounded-full"></div>
      )}
    </div>
  )
}
export default memo(Square);
