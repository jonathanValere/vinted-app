// Fichier functions.js
// On y retrouve toutes les fonctions de mon projet
// Module pour créer le salt "uid2"
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// Importation models
const Offer = require("../models/Offer");

// Générer le hash
const generateHash = (password, salt) => {
  const hash = SHA256(password + salt).toString(encBase64);
  return hash;
};

// Générer un salt
const generateSalt = (num) => {
  const salt = uid2(num);
  return salt;
};

// Générer un token
const generateToken = (num) => {
  const token = uid2(num);
  return token;
};

// Fonction permettant de convertir notre buffer de l'image en Base64
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

module.exports = {
  generateHash,
  generateSalt,
  generateToken,
  convertToBase64,
};
