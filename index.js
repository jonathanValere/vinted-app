const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cloudinary = require("cloudinary").v2;
const nameDatabase = "vinted-app";
const {
  apiKeyCloudinary,
  apiSecretCloudinary,
  cloudNameCloudinary,
} = require("./keys");

app.use(express.json());

// Confuguration de cloudinary ----
cloudinary.config({
  cloud_name: cloudNameCloudinary,
  api_key: apiKeyCloudinary,
  api_secret: apiSecretCloudinary,
});

// Connection à la DB --------------
const connectToDatabase = async (DB) => {
  try {
    await mongoose.connect(`mongodb://localhost:27017/${DB}`);
    console.log(`Connexion à la base de données ${DB}`);
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error.message);
  }
};

connectToDatabase(nameDatabase);

// Importer et utiliser mes routes
const routesUser = require("./routes/user");
app.use(routesUser);
const routeOffer = require("./routes/offer");
app.use(routeOffer);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found 😱" });
});

app.listen(3000, () => {
  console.log("Server on fire 🔥");
});
