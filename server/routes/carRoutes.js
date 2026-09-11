// const express = require('express')
// const { isAdmin, requireLogin } = require('../middleware/authMiddleware');
// const {upload,createCar,getAllCar, getCarById,deleteCar,relatedCar,updatecar,braintreeTokenController,brainTreePaymentController} = require('../controllers/carController');
// const formidable = require('express-formidable')

// const router = express.Router()

// router.get('/getAll-car',getAllCar);
// router.get('/getCarById-car/:slug',getCarById);
// router.post('/create-car',requireLogin,isAdmin,upload.array('productPictures',50),createCar);
// router.put('/update-car/:pid',requireLogin,isAdmin,formidable(),updatecar);
// router.delete('/delete-car/:pid',requireLogin,isAdmin,deleteCar);
// router.get('/related-car/:cid/:bid',relatedCar)
// router.get("/braintree/token", braintreeTokenController);
// router.post("/braintree/payment", requireLogin, brainTreePaymentController);

// module.exports = router

// server/routes/carRoutes.js
const express = require("express");
const { requireLogin, isAdmin } = require("../middleware/authMiddleware");
const {
  upload, // Correctly imported
  createCar,
  getAllCar,
  getCarById,
  deleteCar,
  updatecar,
  relatedCar,
} = require("../controllers/carController");

const router = express.Router();

router.post(
  "/create-car",
  requireLogin,
  isAdmin,
  upload.array("productPictures", 10), // <--- CHANGED FROM 'photos' to 'productPictures'
  createCar
);
router.put(
  "/update-car/:pid",
  requireLogin,
  isAdmin,
  upload.array("productPictures", 10), // <--- CHANGED FROM 'photos' to 'productPictures'
  updatecar
);

router.get("/get-car", getAllCar);
router.get("/get-car/:slug", getCarById);
router.delete("/delete-car/:pid", requireLogin, isAdmin, deleteCar);
router.get("/related-car/:cid/:bid", relatedCar);

// COMMENT OUT THESE BRAINTREE ROUTES - Correct
// router.get('/braintree/token', braintreeTokenController);
// router.post('/braintree/payment', requireLogin, brainTreePaymentController);

module.exports = router;
