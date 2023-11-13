const mongoose = require("mongoose");

const offerSchema = mongoose.Schema(
  {
    product_name: {
      type: String,
      // maxlength:50,
      validate: {
        validator: function (value) {
          // Le titre de l'offre doit contenir moins de 50 caractères
          return value.length <= 50;
        },
        message: `Votre titre doit comporter moins de 50 caractères.`,
      },
    },
    product_description: {
      type: String,
      maxlength: 500,
    },
    product_price: {
      type: Number,
      max: 100000,
    },
    product_details: Array,
    product_image: Object,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
