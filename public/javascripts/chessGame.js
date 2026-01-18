const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggePiece = null;
let souceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerText = getpieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggePiece = pieceElement;
            souceSquare = {
              row: rowIndex,
              col: squareIndex,
            };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggePiece = null;
          souceSquare = null;
        });
        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggePiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(souceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion : "q",
  };
  socket.emit("move", move);
};

const getpieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♝",
    q: "♕",
    k: "♔",
    P: "♙",
    R: "♖",
    N: "♘",
    B: "♝",
    Q: "♕",
    K: "♔",
  };

  return unicodePieces[piece.type] || "";
};

socket.on("connection", function () {
  console.log("connected");
});

socket.on("playerRole", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("SpectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

renderBoard();
