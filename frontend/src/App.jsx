import { useState, useMemo, useRef } from "react";
import { parseFEN } from "./Components/ChessBoard";
import ChessBoard from "./Components/ChessBoard";
import Button from "./Components/Button";
import {io, Socket} from "socket.io-client"

const App = () => {
  // Sokcet configuration
  let sokcet = useMemo(()=>{
    return io('http://localhost:8000')
  },[]);
  sokcet.on('connect',()=>{
    console.log('Socket connected Successfully')
  })
  sokcet.on('message',(payload)=>{
    console.log(payload)
  })
  const whoseMoveIsThere = (FEN) =>{
    const move = FEN.split(' ')[1];
    console.log(move);
    return move;
  }
  sokcet.on('change',(response)=>{
    const {FEN} = response.body;
    if(FEN==""){
      setBoard(parseFEN(fen));
      return;
    }
    if(response.body.isCheck){
      let activePlayer = whoseMoveIsThere(FEN);
      if(activePlayer=='b'){
        setIsBlackChecked(true);
      }else{
        setIsWhiteChecked(true);
      }
    }else{
      setIsBlackChecked(false);
      setIsWhiteChecked(false);
    }
    setFEN(FEN);
    setBoard(parseFEN(FEN));
  })
  sokcet.on("game_initiated",(response)=>{
    console.log(response)
    setOwner(response.message.color)
  })


  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2';
  const [fen, setFEN] = useState(initialFEN);
  const [board, setBoard] = useState(parseFEN(initialFEN));
  const [owner, setOwner] = useState("");

  const handleFENChange = (event) => {
    const newFEN = event.target.value;
    setFEN(newFEN);
    setBoard(parseFEN(newFEN)); // Update only the board state
  };
  const ExecuteMove = (fromRow, fromCol, toRow, toCol) =>{
    let fromFile = String.fromCharCode('a'.charCodeAt(0) + fromCol);
    let fromNumber = 8 - fromRow;
    let toFile = String.fromCharCode('a'.charCodeAt(0) + toCol);
    let toNumber = 8 - toRow;
    let piece = board[fromRow][fromCol];
    let from = fromFile+fromNumber;
    let to = toFile+toNumber;

    sokcet.emit('move',{from: from,to: to});
  }
  const handlePieceMove = (fromRow, fromCol, toRow, toCol) => {
    ExecuteMove(fromRow,fromCol,toRow,toCol);
    const newBoard = board.map((row) => [...row]); // Create a deep copy
    const piece = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null; // Clear the original square
    newBoard[toRow][toCol] = piece; // Move the piece to the new square
    setBoard(newBoard);
  };

  const startGame = () =>{
    try {
      sokcet.emit('start_game',{});
    } catch (error) {
      console.log('Error Starting the game')
    }
  }

   const [count,setCount] = useState(0);
   const [isWhiteChecked,setIsWhiteChecked] =useState(false);
   const [isBlackChecked,setIsBlackChecked] =useState(false);
   
  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-4">
      {/* Chessboard */}
      <ChessBoard owner={owner} board={board} setBoard={setBoard} isBlackChecked={isBlackChecked} isWhiteChecked={isWhiteChecked} onPieceMove={handlePieceMove} />
      <h2>{count}</h2>
      <Button text={"Start game"} onClick={startGame} />
    </div>
  );
};

export default App;
