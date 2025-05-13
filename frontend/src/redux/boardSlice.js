import { createSlice } from "@reduxjs/toolkit";
import { getPossibleMoves } from "../utils/Validation.js";

const initialState = {
    board: [
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
    ],
    previousMoves: ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"],
    isWhitesTurn: true,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    activeCell: null,
    possibleMoves: []
};
const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        movePiece: (state, action) => {
            const {fromRow,toRow,fromCol,toCol} = action.payload;
            const newBoard = state.board.map((row) => [...row]);
            if(fromRow==toRow && fromCol==toCol) return state;
            newBoard[toRow][toCol] = newBoard[fromRow][fromCol];
            newBoard[fromRow][fromCol] = null;
            state.board = newBoard;
            state.activeCell = null;
            state.possibleMoves = [];
            return state;
        },
        setBoard: (state, action) => {
            state.board = action.payload;
            state.activeCell = null;
            state.possibleMoves = [];
            return state;
        },
        setPreviousMoves: (state, action) => {
            state.previousMoves.push(action.payload.FEN);
            return state;
        },
        setCheck: (state,action) => {
            state.isCheck = action.payload;
            return state;
        },
        toggleTurn: (state) => {
            state.isWhitesTurn = !(state.isWhitesTurn);
            state.activeCell = null;
            state.possibleMoves = [];
            return state;
        },
        setActiveCell: (state, action) => {
            const { row, col } = action.payload;
            
            // If clicking on the same square, clear selection
            if (state.activeCell && state.activeCell.row === row && state.activeCell.col === col) {
                state.activeCell = null;
                state.possibleMoves = [];
                return;
            }
            
            const piece = state.board[row][col];
            
            // Only allow selecting pieces of the current player's color
            if (piece) {
                const isPieceWhite = piece === piece.toUpperCase();
                if (isPieceWhite === state.isWhitesTurn) {
                    state.activeCell = { row, col };
                    // Calculate possible moves for the selected piece
                    state.possibleMoves = getPossibleMoves(row, col, state.board);
                } else {
                    state.activeCell = null;
                    state.possibleMoves = [];
                }
            } else {
                state.activeCell = null;
                state.possibleMoves = [];
            }
        },
        clearSelection: (state) => {
            state.activeCell = null;
            state.possibleMoves = [];
        }
    }
});

export const { movePiece, setBoard, setPreviousMoves, setCheck, toggleTurn, setActiveCell, clearSelection } = boardSlice.actions;
export default boardSlice.reducer;