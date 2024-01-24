const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    account: {
      username: {
        type: String,
        required: true,
      },
      avatar: Object,
    },
    newsletter: Boolean,
    token: String,
    hash: String,
    salt: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
