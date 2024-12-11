import React, { memo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {movePiece} from "../redux/boardSlice.js"
import {socket} from "../App.jsx"

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



const Square = ({piece, rowIndex, colIndex,owner,isCheckedSquare}) => {
    console.log("Square rendered")
  const dispatch = useDispatch();

  const makeMove = (fromRow, toRow, fromCol, toCol)=>{
    //TODO: Implement the logic to validate the move  
    // if(isValidMove(fromRow, toRow, fromCol, toCol, board)) {
        dispatch(movePiece({fromRow, toRow, fromCol, toCol}));
        ExecuteMove(fromRow, fromCol, toRow, toCol);
    // }else{
      //Play error audio
      return;
    // }
  }
  const handleDragStart = (e,rowIndex,colIndex) =>{
     e.dataTransfer.setData('text/plain', JSON.stringify({rowIndex, colIndex}));
  }
  const handleDropEnd = (e,rowIndex,colIndex) =>{
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    makeMove(data.rowIndex, rowIndex, data.colIndex, colIndex);
  }
  const handleDragOver = (e) => {
    e.preventDefault();
  }
  return (
      <div 
        className={`w-full h-full ${getSquareColor(rowIndex, colIndex)} ${isCheckedSquare ? 'bg-red-400' : ''}`}
        onDrop={(e)=>handleDropEnd(e,rowIndex, colIndex)}
        onDragOver={handleDragOver}
      >
        {piece && <img
            src={getPiecesImage(piece)}
            alt={piece}
            className={`w-full h-full ${owner === 'b' ? 'rotate-180' : ''}`}
            style={{
                objectFit: 'contain',
                pointerEvents: 'auto',
            }}
            draggable={!((owner=="b" ^ (piece.toLowerCase() === piece)))?true:false}
            onDragStart={(e)=>handleDragStart(e,rowIndex, colIndex)}
        />}
    </div>
  )
}
export default memo(Square);
