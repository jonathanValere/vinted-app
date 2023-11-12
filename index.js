const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cloudinary = require("cloudinary").v2;
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

mongoose.connect("mongodb://localhost:27017/vinted-app");

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
