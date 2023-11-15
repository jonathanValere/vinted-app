require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier .env
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cloudinary = require("cloudinary").v2;

app.use(express.json());

// Confuguration de cloudinary ----
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});
// ceci est un test
// Connection à la DB --------------
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connexion à la base de données`);
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error.message);
  }
};

connectToDatabase();

// Importer et utiliser mes routes
const routesUser = require("./routes/user");
app.use(routesUser);
const routeOffer = require("./routes/offer");
app.use(routeOffer);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found 😱" });
});

app.listen(process.env.PORT, () => {
  console.log("Server on fire 🔥");
});
