const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const { convertToBase64 } = require("../utils/functions");
const { generateHash } = require("../utils/functions");
const router = express.Router();
const uid2 = require("uid2");

// Importation du modèle User
const User = require("../models/User");

// Création d'un compte -------------------------------------
router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    //Récupération des éléments du body
    const { username, email, password, newsletter } = req.body;

    // Vérification que les champs username ET email sont renseignés
    if (!username || !email) {
      return res
        .status(403)
        .json({ message: "You must enter a username and email" });
    }

    //Vérification qu'il y a un mot de passe
    if (!password) {
      return res.status(403).json({ message: "You must enter a password" });
    }

    // Vérification de l'existence dans la DB du mail renseigné
    const accountExist = await User.findOne({ email: email });
    if (accountExist) {
      return res.status(401).json({ message: "This email already exists" });
    } else {
      // lancement de la création du compte utilisateur
      // Création de mon salt
      const salt = uid2(16);
      // Création du hash (generateHash provient de utils/functions.js)
      const hash = generateHash(password, salt);
      // Création du token
      const token = uid2(16);

      // Création d'un compte utilisateur
      const newUser = new User({
        email: email,
        account: {
          username: username,
        },
        newsletter: newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      // // Gestion de l'avatar ------------------------

      const image = req.files;
      let fileAvatar = "";
      if (image !== null) {
        const fileConverted = convertToBase64(image.avatar);
        fileAvatar = await cloudinary.uploader.upload(fileConverted, {
          folder: `/vinted/users/${newUser._id}`,
        });
      } else {
        // Image par défaut en cas de non transmission d'une image avatar
        fileAvatar = await cloudinary.api.resource_by_asset_id(
          "719158748ce4531711ad1fa5719c2f96"
        );
      }
      newUser.account.avatar = fileAvatar;
      // ------------------------------------------

      // Permet de valider les données entrées en fonction de leur type
      await newUser.validate();
      // Sauvegarder dans la DB
      await newUser.save();
      return res.status(201).json({
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

    if (!email || !password) {
      return res.status(400).json({ message: "missing parameters" });
    }

    const user = await User.findOne({ email: email });

    if (user) {
      // Vérification que le mot de passe est bien renseigné
      const newHash = generateHash(password, user.salt);
      if (newHash === user.hash) {
        return res.status(200).json({
          token: user.token,
          // message: `Bon retour parmi nous, ${accountExist.account.username}!`,
        });
      } else {
        // Indiquer l'email et le password TOUJOURS !!!!!
        return res
          .status(401)
          .json({ message: "Email ou/et password incorrect" });
      }
    } else {
      return res.status(404).json({ message: "You must have an account" });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

module.exports = router;
