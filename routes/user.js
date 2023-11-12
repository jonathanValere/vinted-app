const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const { convertToBase64 } = require("../utils/functions");
const router = express.Router();
const {
  generateHash,
  generateSalt,
  generateToken,
} = require("../utils/functions");
// Module pour créer le salt "uid2"
// const uid2 = require("uid2");

// Importation du modèle User
const User = require("../models/User");

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    //Récupération des éléments du body
    const { username, email, password, newsletter } = req.body;
    const image = req.files;
    // Gestion de l'avatar
    let fileUploaded;
    if (image.avatar.length === undefined) {
      const fileConverted = convertToBase64(image.avatar);
      fileUploaded = await cloudinary.uploader.upload(fileConverted, {
        folder: "/vinted/users/",
      });
    }
    // Vérification que le champs username est renseigné
    if (!username) {
      return res.status(404).json({ message: "Username missing" });
    }

    // Vérification de l'existence dans la DB du mail renseigné
    const accountExist = await User.findOne({ email: email });
    if (accountExist) {
      return res.status(404).json({ message: "This email already exists" });
    } else {
      // lancement de la création du compte utilisateur
      // Création de mon salt
      const salt = generateSalt(16);
      // Création du hash
      const hash = generateHash(password, salt);
      // Création du token
      const token = generateToken(16);

      // Création d'un compte utilisateur
      const newUser = new User({
        email: email,
        account: {
          username: username,
          avatar: fileUploaded.secure_url,
        },
        newsletter: newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      await newUser.save();
      return res.status(200).json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour se logger
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const accountExist = await User.findOne({ email: email });
    if (accountExist) {
      const newHash = generateHash(password, accountExist.salt);
      if (newHash === accountExist.hash) {
        console.log(accountExist);
        return res.status(200).json({
          message: `Bon retour parmi nous, ${accountExist.account.username}!`,
        });
      } else {
        return res.status(400).json({ message: "WRONG" });
      }
    } else {
      return res.status(404).json({ message: "You must have an account" });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

module.exports = router;
