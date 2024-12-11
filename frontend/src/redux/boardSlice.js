import { createSlice } from "@reduxjs/toolkit";

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
            return state;
        },
        setBoard: (state, action) => {
            state.board = action.payload;
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
            return state;
        }
    }
});

export const { movePiece, setBoard, setPreviousMoves, setCheck, toggleTurn} = boardSlice.actions;
export default boardSlice.reducer;