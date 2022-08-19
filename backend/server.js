const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
require("./scripts/strategy/strategy")
//bring routes
const authRoutes = require("./routes/authRoutes");

const userRouters = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountsRoutes");
// const tradeRoutes = require("./routes/tradeRoutes");
const strategyRoutes = require("./routes/strategyRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

//database connect
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connected")).catch = (err) => {
    console.log(err.message);
  };

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

//cors
if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

//routes middleware

app.use("/api", authRoutes);
app.use("/api", userRouters);
app.use("/api/accounts", accountRoutes);
app.use("/api/strategies", strategyRoutes);
// app.use("/api/trades", tradeRoutes);
app.use("/api/orders", orderRoutes);

//port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});

