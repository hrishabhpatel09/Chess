class Response{
    constructor(success,message,isCheck,checkmate,isDraw,FEN){
        this.success = success;
        this.message = message;
        this.body = {
            isCheck: isCheck,
            isCheckmate: checkmate,
            isDraw: isDraw,
            FEN: FEN
        }
    }
};

export {Response}