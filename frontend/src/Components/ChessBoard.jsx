import React, {memo} from 'react';
import Square from './Square';
import { useSelector } from 'react-redux';

const ChessBoard = ({owner, isBlackChecked, isWhiteChecked, previousMove}) => {
  const boards = useSelector((state)=>state.board.board)
  const isCheck = useSelector((state)=>state.board.isCheck);
  const isWhiteTurn = useSelector((state)=>state.board.isWhitesTurn);

  const handleCheck = (piece) => {
    if (!isCheck || !piece || (piece !== 'k' && piece !== 'K')) return false;
    return (isWhiteTurn && piece === 'K') || (!isWhiteTurn && piece === 'k');
  };  
  
  return (
    <div className={`sm:h-[600px] sm:w-[600px] grid grid-cols-8 grid-rows-8 rounded-sm ${owner=='b'?'rotate-180':''}`}>
      {boards.map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <Square key={`${rowIndex+colIndex}`} colIndex={colIndex} rowIndex={rowIndex} piece={piece} owner={owner} isCheckedSquare={handleCheck(piece)}/>
        ))
      )}
    </div>
  );
};

export default memo(ChessBoard)