const parseFEN = (fen) => {
    let FEN = fen.split(' ')[0];
    let board = [];
    let rows = FEN.split('/');
    rows.forEach(row => {
        let r = [];
        for (let i = 0; i < row.length; i++) {
            if (!isNaN(row[i])) {
                for (let j = 0; j < parseInt(row[i]); j++) {
                    r.push(null);
                }
            } else {
                r.push(row[i]);
            }
        }
        board.push(r);
    });
    return board;
}
export {parseFEN};