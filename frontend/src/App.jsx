import { useState, useMemo, useRef, useEffect } from "react";
import { parseFEN } from "./Components/ChessBoard";
import ChessBoard from "./Components/ChessBoard";
import Button from "./Components/Button";
import {io} from "socket.io-client"
import { SOCKET_EVENTS } from "./socketEvents";

const App = () => {
  //! Sokcet configuration
  let socket = useMemo(()=>{
    let socket = io('http://localhost:8000');

    socket.on(SOCKET_EVENTS.CONNECT,()=>{
      console.log('Socket connected Successfully')
    })
    socket.on(SOCKET_EVENTS.MESSAGE,(payload)=>{
      console.log(payload)
    })
    socket.on(SOCKET_EVENTS.CHANGE,(response)=>{
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

    socket.on(SOCKET_EVENTS.GAME_INITIATED,(response)=>{
      console.log(response)
      setOwner(response.message.color)
    })

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.warn('Socket disconnected. Attempting to reconnect...');
    });
    return socket;
  },[]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      socket.disconnect();
      console.log('Socket disconnected on component unmount.');
    };
  }, [socket]);
  //* This function fetches FEN and derive whose player move is this
  const whoseMoveIsThere = (FEN) =>{
    let move = FEN.split(' ')[1];
    return move;
  }
  //* States Variables
  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2';
  const [fen, setFEN] = useState(initialFEN);
  const [board, setBoard] = useState(parseFEN(initialFEN));
  const [owner, setOwner] = useState("");
  const [isWhiteChecked,setIsWhiteChecked] =useState(false);
  const [isBlackChecked,setIsBlackChecked] =useState(false);

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
    let from = fromFile+fromNumber;
    let to = toFile+toNumber;
    socket.emit('move',{from: from,to: to});
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
      socket.emit('start_game',{});
    } catch (error) {
      console.log('Error Starting the game')
    }
  }
  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-4">
      <ChessBoard owner={owner} board={board} setBoard={setBoard} isBlackChecked={isBlackChecked} isWhiteChecked={isWhiteChecked} onPieceMove={handlePieceMove} />
      <Button text={"Start game"} onClick={startGame} />
    </div>
  );
};

export default App;
