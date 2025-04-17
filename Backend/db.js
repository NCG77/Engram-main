const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://avaneshj2408:l22B7tgLR3RKKlUl@database.4gyrg.mongodb.net/?retryWrites=true&w=majority&appName=database";
const connectToMongo = () => {
  mongoose.connect(mongoURI);
  console.log("Connected Successfully");
};
module.exports = connectToMongo;
