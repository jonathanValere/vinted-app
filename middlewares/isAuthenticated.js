const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // Récupération du Token
    const token = req.headers.authorization.replace("Bearer ", "");
    // Récupération de l'Utilisateur
    const user = await User.findOne({ token: token });

    if (user) {
      req.owner = user;
      return next();
    } else {
      return res.status(401).json({ error: "Access unauthorized" });
    }
  } else {
    return res.status(401).json({ error: "Access unauthorized" });
  }
};

module.exports = isAuthenticated;
