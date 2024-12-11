import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ChessBoard from "./Components/ChessBoard";
import Button from "./Components/Button";
import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "./socketEvents";
import onlineDot from "/online.png"
import { useDispatch, useSelector } from "react-redux";
import {setBoard, setPreviousMoves, toggleTurn, setCheck} from "./redux/boardSlice.js";
import {parseFEN} from "./utils/parseFEN.js"

let socket = null;
const App = () => {
  //* States Variables
  const [owner, setOwner] = useState("");
  const [isWhiteChecked, setIsWhiteChecked] = useState(false);
  const [isBlackChecked, setIsBlackChecked] = useState(false);
  const [onlinePlayersCount, setOnlinePlayersCount] = useState(0);
  const [waitingForAnotherPlayer, setWaitingForAnotherPlayer] = useState(false);
  const dispatch = useDispatch();
  const previousMoves = useSelector((state)=>state.board.previousMoves);

    //* Socket configuration
    socket = useMemo(() => {
      let socket = io(import.meta.env.VITE_BACKEND_URL);
      return socket;
    }, []);

  const attachListner = () =>{
    socket.on(SOCKET_EVENTS.CHANGE, ({response}) => {
      console.log('Recieved the feedback')
      console.log(response)
      let {FEN} = response.body
      let isEmpty = FEN === "";
      if(isEmpty){
        console.log(previousMoves)
        FEN = previousMoves[previousMoves.length-1];
      };
      const newBoard = parseFEN(FEN);
      if(!isEmpty){
        dispatch(setPreviousMoves({FEN}));
        dispatch(toggleTurn());
        dispatch(setCheck(response.body.isCheck));
      }
      dispatch(setBoard(newBoard));
    });
  }
    const handleConnect = () =>{console.log('Socket connected Successfully');}
    const handleDisconnect = () =>{console.log('Socket disconnected Successfully');}
    const handleMessage = (payload) =>{console.log(payload);}
    const handleGameStart = (response) => {
      console.log(response);
      setWaitingForAnotherPlayer(false);
      setOwner(response.message.color);
    }
    useEffect(()=>{
      socket.on(SOCKET_EVENTS.CONNECT, handleConnect);
      socket.on(SOCKET_EVENTS.MESSAGE, handleMessage);
      socket.on(SOCKET_EVENTS.GAME_INITIATED, handleGameStart);
      socket.on(SOCKET_EVENTS.DISCONNECT, handleDisconnect);
      socket.on(SOCKET_EVENTS.ONLINE_PLAYERS, (count)=>{
        setOnlinePlayersCount(count);
      })
    attachListner();
    return ()=>{
      socket.off(SOCKET_EVENTS.CHANGE);
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.MESSAGE);
      socket.off(SOCKET_EVENTS.GAME_INITIATED);
      socket.off(SOCKET_EVENTS.DISCONNECT);
      socket.off(SOCKET_EVENTS.ONLINE_PLAYERS);
    }
  },[previousMoves]);
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
        isBlackChecked={isBlackChecked}
        isWhiteChecked={isWhiteChecked}
      />
      <GameControllers online={onlinePlayersCount} isWaiting={waitingForAnotherPlayer} onStart={startGame}/>
    </div>
  );
};

function GameControllers({online,isWaiting,onStart}){
  const isWhitesTurn = useSelector((state)=>state.board.isWhitesTurn);
  return (
    <div className="h-[600px] w-[380px] bg-[#262521] rounded-sm flex flex-col mt-0 p-4 gap-6 items-center justify-between">
      <OnlineCouner online={online}/>
      <p>{`It's ${isWhitesTurn?'White':'Black'} turn`}</p>
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
export {socket};
export default App;
