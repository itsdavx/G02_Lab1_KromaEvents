const mongoose = require("mongoose");

// Mongoose 9: connect devuelve una promesa (sin callback ni useNewUrlParser)
const connectMongo = async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta la variable MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);
};

module.exports = { connectMongo };
