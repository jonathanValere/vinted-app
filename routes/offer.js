const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;
const { convertToBase64 } = require("../utils/functions");
const isAuthenticated = require("../middlewares/isAuthenticated");

const Offer = require("../models/Offer");

// GET Afficher les annonces selon un filtre ------------------------
router.get("/offers", async (req, res) => {
  try {
    const filter = {};
    let result = "";
    const limit = 3;
    const { title, priceMin, priceMax, sort, page } = req.query;
    // Filtrage par titre
    if (title) filter.product_name = new RegExp(title, "i");

    // Filtrage par prix
    if (priceMin && priceMax) {
      const convertPriceMin = Number(priceMin);
      const convertPriceMax = Number(priceMax);
      filter.product_price = { $lte: convertPriceMin, $gte: convertPriceMax };
    } else if (priceMin) {
      const convertPriceMin = Number(priceMin);
      filter.product_price = { $lte: convertPriceMin };
    } else if (priceMax) {
      const convertPriceMax = Number(priceMax);
      filter.product_price = { $gte: convertPriceMax };
    }

    // Filtrage ordre croissant/décroissant du prix
    if (!page) {
      if (!sort) {
        result = await Offer.find(filter).limit(limit);
      } else {
        result =
          sort === "price-asc"
            ? await Offer.find(filter).sort({ product_price: 1 }).limit(limit)
            : await Offer.find(filter).sort({ product_price: -1 }).limit(limit);
      }
    } else {
      if (!sort) {
        result = await Offer.find(filter)
          .limit(limit)
          .skip((page - 1) * limit);
      } else {
        result =
          sort === "price-asc"
            ? await Offer.find(filter)
                .sort({ product_price: 1 })
                .limit(limit)
                .skip((page - 1) * limit)
            : await Offer.find(filter)
                .sort({ product_price: -1 })
                .limit(limit)
                .skip((page - 1) * limit);
      }
    }

    // Le nombre d'offres trouvées
    const counter = result.length;

    res.status(200).json({ count: counter, offers: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// CREATE Créer une offre ---------------------------------
router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      if (title.length < 50 && description.length < 500 && price < 100000) {
        // Gestion des images -------
        const images = req.files;
        // Conversion du fichier "buffer" en élément pouvant être importé dans cloudinary
        const listImages = [];
        let resultUploadImage = "";
        if (images) {
          if (images.picture.length === undefined) {
            const fileConverted = convertToBase64(images.picture);
            const fileUploaded = await cloudinary.uploader.upload(
              fileConverted,
              {
                folder: "/vinted/offers/",
              }
            );
            resultUploadImage = fileUploaded;
          } else {
            for (const image of images.picture) {
              const fileConverted = convertToBase64(image);
              const fileUploaded = await cloudinary.uploader.upload(
                fileConverted,
                {
                  folder: "/vinted/offers/",
                }
              );
              listImages.push(fileUploaded);
              resultUploadImage = listImages;
            }
          }
        }
        // owner provient du middleware isAuthenticated
        const owner = req.owner;
        // Créer une nouvelle offre
        const newOffer = new Offer({
          product_name: title,
          product_description: description,
          product_price: price,
          product_details: [
            {
              MARQUE: brand,
            },
            {
              TAILLE: size.toString(),
            },
            {
              ÉTAT: condition,
            },
            {
              COULEUR: color,
            },
            {
              EMPLACEMENT: city,
            },
          ],
          product_image: resultUploadImage, // Type Object
          owner: owner,
        });
        // Sauvegarder dans la DB
        await newOffer.save();
        return res.status(200).json(newOffer);
      } else {
        return res.status(400).json({ message: "fields errors" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

router
  .route("/offers/:id")
  .get(async (req, res) => {
    // GET Afficher une annonce ------------------------
    try {
      const { id } = req.params;
      const offerFound = await Offer.findById(id).populate("owner");
      res.status(200).json(offerFound);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  })
  .put(isAuthenticated, fileUpload(), async (req, res) => {
    // Modifier une annonce ----------------------------
    try {
      const offerToModify = await Offer.findById(req.params.id).populate(
        "owner"
      );
      if (offerToModify) {
        // récupérer les éléments du body
        const {
          title,
          description,
          price,
          condition,
          city,
          brand,
          size,
          color,
        } = req.body;
        if (title) offerToModify.product_name = title;
        if (description) offerToModify.product_description = description;
        if (price) offerToModify.product_price = price;
        for (const detail of offerToModify.product_details) {
          if (detail.MARQUE && brand) detail.MARQUE = brand;
          if (detail.EMPLACEMENT && city) detail.EMPLACEMENT = city;
          if (detail.ÉTAT && condition) detail.ÉTAT = condition;
          if (detail.TAILLE && size) detail.TAILLE = size;
          if (detail.COULEUR && color) detail.COULEUR = color;
        }
        // Partie concernant l'ajout d'une/des image(s) ----------
        const images = req.files;
        // vérifie si le champs picture est renseigné
        if (images) {
          // Vérifie si le champs contient uniquement une image
          if (images.picture.length === undefined) {
            const fileConverted = convertToBase64(images.picture);
            // const fileUploaded = await cloudinary.uploader.upload(
            //   fileConverted,
            //   {
            //     folder: "/vinted/offers/",
            //   }
            // );
            // offerToModify.product_image += fileUploaded;
            console.log(offerToModify);
            // await offerToModify.save();
          } else {
            // Partie concernant plusieurs images
            // for (const image of images.picture) {
            //   const fileConverted = convertToBase64(images.picture.image);
            // }
          }
        }
        // await offerToModify.save();
        return res.status(200).json(offerToModify);
      } else {
        return res.status(404).json({ message: "Offer not found" });
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  })
  .delete((req, res) => {
    try {
      res.status(200).json({ message: "offer deleted" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  });

module.exports = router;
