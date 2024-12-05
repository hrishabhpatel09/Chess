const io =  require("socket.io-client")

const sokcet = io("http://localhost:3000");

sokcet.on("connect",()=>{
    console.log("Sockect connected successfully")
    sokcet.emit("start_game",{move: "start"})
})