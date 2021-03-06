// require all modules
const express = require('express');
const session = require('express-session'); // allowing user sessions
const path = require('path');
const cors = require('cors');
const index = require('./routes/index');

// require created modules
const app = express();

// app.use(cookieParser());
app.use(
  session({
    secret: 'Shh, its a secret!',
    resave: true,
    saveUninitialized: true,
  }),
);
// express use static build for client...
app.use(express.static(path.join(`${__dirname}/client/build`)));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use('/', index);

// set up listening on local host
let port = process.env.PORT;
if (port == null || port === '') {
  port = 8000;
}
app.listen(port, () => console.log(`app listening on port ${port}`)); // app is now listening on port
module.exports = app;
