const express = require("express");
const app = express();
const mongoose = require("mongoose");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUIExpress = require('swagger-ui-express');
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require('path');
const multer = require('multer');

dotenv.config();
app.use('/uploads', express.static('uploads'));
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
const conferenceRouter = require('./routes/conference');
const userRouter = require('./routes/user');
const reviewerRouter = require('./routes/reviewer');
const adminRoute = require('./routes/admin');
const authorRouter = require('./routes/author');
const notificationRouter = require('./routes/notification');
const managerRouter = require('./routes/manager');
const subreviewerRouter = require('./routes/subreviewer');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

app.use('/conference', conferenceRouter);
app.use('/user', userRouter);
app.use('/reviewer', reviewerRouter);
app.use('/admin', adminRoute);
app.use('/author', authorRouter);
app.use('/notifications', notificationRouter);
app.use('/manager', managerRouter);
app.use('/subreviewer', subreviewerRouter);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).json(error);
});

mongoose.connect(process.env.CONNECTION_URL).then(() => {
  app.listen(3000, () => {
    console.log("connected");
  });
});
