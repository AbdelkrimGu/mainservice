const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');


//const allowedOrigins = ['http://127.0.0.1:5501', 'https://e87c-105-235-138-153.ngrok-free.app' , "http://172.20.10.2:4200"];
const requestLogger = (req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log(req.body);
  next();
};

/*app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials : true,
}));*/

app.use(cors());

// Middleware function to log requests

// Apply the middleware globally to log all requests
app.use(requestLogger);

port = 8050;

const courseRouter = require("./routes/courses");
const studentRouter = require("./routes/students");
const teacherRouter = require("./routes/teachers");
const exploreRouter = require("./routes/explore");
const paymentRouter = require("./routes/payments");

//mongoose.connect('mongodb://127.0.0.1:27017/courses', {
mongoose.connect('mongodb+srv://abdelkrim:abdelkrim31052001@saned.rgalgfx.mongodb.net/courses?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB', err));

app.use(express.json());

app.use("/api/courses" , courseRouter);
app.use("/api/students" , studentRouter);
app.use("/api/teachers" , teacherRouter);
app.use("/api/explore" , exploreRouter);

app.use(express.text());
app.use("/api/paiement" , paymentRouter);





app.listen(port, () => console.log("Server listening on port "+ port + "!"))