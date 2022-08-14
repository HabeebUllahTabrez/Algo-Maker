require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser("MY SECRET"));
app.use(express.json());

//DATABASE
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  });

app.get("/", (req, res) => {
  res.send("Live-feed working");
});

///////////////////////////////////////////////models///////////////////////////////////////////////
require("./models/admin");
require("./models/userModel");
require("./models/futures");
require("./models/simpleStockNames");
require("./models/futureTables");
require("./models/futureData");
require("./models/optionStockNames");
require("./models/optionExpiryTable");
require("./models/options");
require("./models/optionData");

///////////////////////////////////////////////

const port = 88;

const server = app.listen(port, () => {
  console.log(`server started at port ${port}`);
});

let io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket) => {
  console.log("connected at ", socket.id);
});
// console.log("ok")
// app.set("io", io)

require("./controllers/ticks/candles");
require("./controllers/ticks/ticks")(io);
