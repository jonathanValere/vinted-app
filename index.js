require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier .env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(cors());
const cloudinary = require("cloudinary").v2;

app.use(express.json());

// Confuguration de cloudinary ----
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.API_KEY_CLOUDINARY,
  api_secret: process.env.API_SECRET_CLOUDINARY,
});

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
const routesOffer = require("./routes/offer");
app.use(routesOffer);

app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to my website Vinted 🖐🏽" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found 😱" });
});

// Lancement du serveur
app.listen(process.env.PORT, () => {
  console.log("Server on fire 🔥");
});
