//require all modules
let express = require("express");
let index = require("./routes/index");
let session = require("express-session"); //allowing user sessions
let cors = require("cors");
//require created modules
let app = express();

//app.use(cookieParser());
app.use(
  session({
    secret: "Shh, its a secret!",
    resave: true,
    saveUninitialized: true,
  })
);
//require node module for the spotify api
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use("/", index);

app.use(express.static("./public"));

//set up listening on local host
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => console.log(`app listening on port ${port}`)); //app is now listening on port
