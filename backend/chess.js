import { Chess } from "chess.js";

//* Forsyth-Edward-notation
const chess = new Chess();
chess.move("e4");
// chess.move();
console.log(chess.ascii());
console.log(chess.board());
console.log(chess.isGameOver())