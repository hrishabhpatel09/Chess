import express from 'express'
import { Server } from 'socket.io';
import {createServer} from 'http'
import { Chess } from 'chess.js';
import { Response } from "./src/utils.js";
import dotenv from "dotenv"
dotenv.config({path: './.env'});

const app = express();
const server = createServer(app);
const io = new Server(server, {cors: '*'});
let queue = []; // Waiting queue for players

// Game class
class Game {
    constructor(player1, player2) {
        this.player1 = player1;               // WebSocket of player 1
        this.player2 = player2;              // WebSocket of player 2
        this.time = Date.now();             // Game start time
        this.chess = new Chess();          // Chess board instance
        this.winner = null;
    }

    makeMove(from,to) {
        try {
            const result = this.chess.move({from,to});
            console.log(this.chess.ascii());
            if (!result) {
                return new Response(false, 'Invalid move', false, false,false,"");
            }
            // Check game state
            if (this.chess.isCheckmate()) {
                this.winner = ""; //who played the chekmate move
                return new Response(true,'Checkmate!',true,true,false,this.chess.fen());
            }
            if(this.chess.isCheck()){
                return new Response(true, 'Check!', true, false,false, this.chess.fen());
            }
            if (this.chess.isDraw()) {
                return new Response(true, 'Match Draw', false, false, true, this.chess.fen());
            }
            return new Response(true, 'Move Executed', false, false, false, this.chess.fen());
        } catch (error) {
            console.error(error);
            return new Response(false, 'Error occured', false ,false,false,"");
        }
    }
}

// GameManager class
class GameManager {
    constructor() {
        this.games = [];
    }

    initialize(player1, player2) {
        const game = new Game(player1, player2);
        this.games.push(game);
        return game;
    }

    findGameByPlayer(player) {
        return this.games.find(game => game.player1 === player || game.player2 === player);
    }
}

const gameManager = new GameManager();

io.on('connection', (socket)=>{
    console.log('new Socket connected ', socket.id);
    socket.on('start_game',(payload)=>{
        if (queue.length === 0) {
            queue.push(socket.id);
            socket.emit('start_game_response',new Response(true, 'Waiting for another player to join',false,false,false,""));
        } else {
            const opponent = queue.shift();
            const game = gameManager.initialize(socket.id, opponent);
            io.to(opponent).emit('game_initiated',new Response(true, {color: 'w'}, false, false, false, ""));
            socket.emit('game_initiated',new Response(true, {color: 'b'}, false,false, false, ""));
            console.log("Started")
        }
    })
    socket.on('move',async({from,to})=>{
        const game = gameManager.findGameByPlayer(socket.id);  //* find the match
        if (!game) {
            socket.emit('error',new Response(false,'No Active Game Found',false,false,false,""));
            return;
        }
        const response = await game.makeMove(from,to);
        let previousMove = {};
        previousMove = {fromRow: Number(from[1])-1, fromCol: from.charCodeAt(0)-97, toRow: Number(to[1])-1, toCol: to.charCodeAt(0)-97}
        io.emit('change',{response,previousMove})
    })
    
    socket.on('message', (msg)=>{
        console.log(msg);
    })
    socket.on('disconnect', ()=> {
        console.log(`Socket discoonnected ${socket.id}`);
    });
});

app.get('/',(req,res)=>res.send("hi"))
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>{
    console.log(`Server lsitening on port ${PORT}`);
})
