import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { parseFEN } from "./Components/ChessBoard";
import ChessBoard from "./Components/ChessBoard";
import Button from "./Components/Button";
import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "./socketEvents";
import onlineDot from "../public/online.png"

let gameEndSound = new Audio("/game-end.webm");
const playGameEnd = () =>{
  gameEndSound.play();
}
const App = () => {
  //! Socket configuration
  let socket = useMemo(() => {
    let socket = io(import.meta.env.VITE_BACKEND_URL);

    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Socket connected Successfully');
    });
    socket.on(SOCKET_EVENTS.MESSAGE, (payload) => {
      console.log(payload);
    });
    socket.on(SOCKET_EVENTS.CHANGE, ({response, previousMove}) => {
      const { FEN } = response.body;
      console.log(response);
      if (FEN === "") {
        // Use the previous FEN from useRef to set the board
        console.log(fenRef.current);
        setBoard(parseFEN(fenRef.current));
        return;
      }
      if(response.body.isCheckmate){
        playGameEnd();
      }
      if(response.body.isCheck) {
        let activePlayer = whoseMoveIsThere(FEN);
        if (activePlayer === 'b') {
          setIsBlackChecked(true);
        } else {
          setIsWhiteChecked(true);
        }
      } else {
        setIsBlackChecked(false);
        setIsWhiteChecked(false);
      }
      setFEN(FEN);
      console.log(previousMove)
      setPreviousMove(previousMove)
      setBoard(parseFEN(FEN));
    });

    socket.on(SOCKET_EVENTS.GAME_INITIATED, (response) => {
      console.log(response);
      setWaitingForAnotherPlayer(false);
      setOwner(response.message.color);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.warn('Socket disconnected. Attempting to reconnect...');
    });
    socket.on(SOCKET_EVENTS.ONLINE_PLAYERS, (count)=>{
      setOnlinePlayersCount(count);
    })

    return socket;
  }, []);

  //Cleanup of Sockets
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.disconnect();
      console.log("Socket disconnected on window close.");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.disconnect();
      console.log("Socket disconnected on component unmount.");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket]);

  //* This function fetches FEN and derives whose player move is this
  const whoseMoveIsThere = (FEN) => {
    let move = FEN.split(' ')[1];
    return move;
  };

  //* States Variables
  const initialFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 2';
  const [fen, setFEN] = useState(initialFEN);  // Corrected: useState directly
  const [board, setBoard] = useState(parseFEN(initialFEN));
  const [owner, setOwner] = useState("");
  const [isWhiteChecked, setIsWhiteChecked] = useState(false);
  const [isBlackChecked, setIsBlackChecked] = useState(false);
  const [previousMove, setPreviousMove] = useState({fromRow: -1,fromCol: -1,toRow: -1, toCol: -1});
  const [onlinePlayersCount, setOnlinePlayersCount] = useState(0);
  const [waitingForAnotherPlayer, setWaitingForAnotherPlayer] = useState(false);

  // Create a ref to persist the previous `fen` value
  const fenRef = useRef(fen);

  // Update `fenRef` when `fen` state changes
  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  const handleFENChange = (event) => {
    const newFEN = event.target.value;
    setFEN(newFEN);
    setBoard(parseFEN(newFEN)); // Update only the board state
  };

  const ExecuteMove = (fromRow, fromCol, toRow, toCol) => {
    let fromFile = String.fromCharCode('a'.charCodeAt(0) + fromCol);
    let fromNumber = 8 - fromRow;
    let toFile = String.fromCharCode('a'.charCodeAt(0) + toCol);
    let toNumber = 8 - toRow;
    let from = fromFile + fromNumber;
    let to = toFile + toNumber;
    socket.emit('move', { from: from, to: to });
  };

  const handlePieceMove = (fromRow, fromCol, toRow, toCol) => {
    ExecuteMove(fromRow, fromCol, toRow, toCol);
    const newBoard = board.map((row) => [...row]); // Create a deep copy
    const piece = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = null; // Clear the original square
    newBoard[toRow][toCol] = piece; // Move the piece to the new square
    setBoard(newBoard);
  };

  const startGame = useCallback(() => {
    try {
      socket.emit('start_game', {});
      setWaitingForAnotherPlayer(true);
    } catch (error) {
      setWaitingForAnotherPlayer(false);
      console.log('Error Starting the game');
    }
  },[]);

  return (
    <div className="flex flex-col sm:flex-row sm:mt-0 sm:justify-evenly justify-center items-center w-screen h-screen space-y-4">
      <ChessBoard
        owner={owner}
        board={board}
        setBoard={setBoard}
        isBlackChecked={isBlackChecked}
        isWhiteChecked={isWhiteChecked}
        onPieceMove={handlePieceMove}
        previousMove={previousMove}
      />
      <GameControllers online={onlinePlayersCount} isWaiting={waitingForAnotherPlayer} onStart={startGame}/>
    </div>
  );
};

function GameControllers({online,isWaiting,onStart}){
  return (
    <div className="h-[600px] w-[380px] bg-[#262521] rounded-sm flex flex-col mt-0 p-4 gap-6 items-center justify-between">
      <OnlineCouner online={online}/>
      <Button text={isWaiting?"Waiting...":"Start game"} disabled={isWaiting?true:false} onClick={onStart} />
    </div>
  )
}

function OnlineCouner({online}){
  return (
    <div className="flex justify-center gap-1">
      <img src={onlineDot} alt="online-logo" className="h-6 w-6"/>
      <span className="text-center ">Online : {online}</span>
    </div>
  )
}
export default App;
