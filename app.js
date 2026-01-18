const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const { log } = require("console");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();

let players = {};
let currentPlayer = "W"; // Initialize currentPlayer

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
  // res.send("Hellow");
});

io.on("connection", function (uniquesocket) {
  console.log("connected"); // Fix typo

  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("SpectatorRole");
  }

  uniquesocket.on("disconnect", function () {
    if (players.white === uniquesocket.id) {
      delete players.white;
    } else if (players.black === uniquesocket.id) {
      delete players.black;
    }
  });

  uniquesocket.on("move", (move) => {
    try {
      if (uniquesocket.id && chess.turn() === 'w' && uniquesocket.id!== players.white) return;
      if (uniquesocket.id && chess.turn() === 'b' && uniquesocket.id!== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid move : ", move);
        uniquesocket.emit("InvalidMove", move); // Fix spelling
      }

    } catch (error) {
      console.log(error);
      uniquesocket.emit("InvalidMove", move); // Fix spelling
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
})