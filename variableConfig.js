const dotenv = require("dotenv");

dotenv.config({ path: __dirname + "/.env" });
if (dotenv.error) {
  throw dotenv.error;
} else {
  console.log("hi");
  console.log(__dirname);
}

module.exports = {
  clientID: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  password: process.env.PASSWORD,
};
