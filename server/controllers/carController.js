const { default: slugify } = require("slugify");
const carModel = require("../models/carModel");
const orderModel = require("../models/orderModel");
const fs = require("fs");
// const dotenv = require("dotenv");
const brandModel = require("../models/carBrand");
const multer = require("multer");
const path = require("path");

// Remove Google Drive API import
// const { google } = require('googleapis'); // DELETE THIS LINE

// Cloudinary Imports and Configuration
const cloudinary = require("cloudinary").v2; // Import Cloudinary v2
// dotenv.config(); // Ensure dotenv is configured BEFORE Cloudinary config

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true, // Use HTTPS URLs
});

// Remove Google Drive related constants
// const KEYFILEPATH = path.join(__dirname, 'cred.json'); // DELETE THIS LINE
// const SCOPES = ['https://www.googleapis.com/auth/drive']; // DELETE THIS LINE
// const auth = new google.auth.GoogleAuth({ // DELETE THIS LINE
//     keyFile: KEYFILEPATH, // DELETE THIS LINE
//     scopes: SCOPES, // DELETE THIS LINE
// }); // DELETE THIS LINE
// const drive = google.drive({ version: 'v3', auth }); // DELETE THIS LINE
// const FOLDER_ID = "1LbbwJK78fjf_ZWYc1HZF5SwwU6reXomQ"; // DELETE THIS LINE

// Multer setup remains mostly the same, but we'll use it to save temporarily
// before uploading to Cloudinary, then delete the local file.
// Ensure your 'uploads/' directory exists in the server root.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Function to upload file to Cloudinary
const uploadFileToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "carwale_cars", // Optional: specify a folder in Cloudinary
      resource_type: "image", // Specify resource type
    });
    // After successful upload, delete the local file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting local file:", err);
      } else {
        console.log("Local file deleted:", filePath);
      }
    });
    return result.secure_url; // Return the secure Cloudinary URL
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

// Function to delete file from Cloudinary
const deleteFileFromCloudinary = async (publicId) => {
  try {
    // Cloudinary public_id is typically derived from the file name or folder/file name
    // We need to parse the public ID from the Cloudinary URL if we store URLs in DB.
    // A common practice is to store the publicId directly in the DB.
    // For now, let's assume the publicId is what we stored.
    // If you stored the full URL, you'll need a helper to extract publicId.
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary deletion result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

const createCar = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      price,
      fuelType,
      transmission,
      engineSize,
      mileage,
      safetyrating,
      warranty,
      seater,
      size,
      fuelTank,
    } = req.body;

    const requiredFields = [
      "name",
      "description",
      "brand",
      "price",
      "fuelType",
      "transmission",
      "engineSize",
      "mileage",
      "safetyrating",
      "warranty",
      "seater",
      "size",
      "fuelTank",
    ];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .send({ success: false, message: `${field} is Required` });
      }
    }

    // Upload files to Cloudinary
    const uploadedImageUrls = await Promise.all(
      req.files.map(async (file) => {
        const url = await uploadFileToCloudinary(file.path);
        return url;
      })
    );

    const slug = slugify(name);

    const car = new carModel({
      name,
      slug,
      description,
      brand,
      productPictures: uploadedImageUrls, // Store Cloudinary URLs
      price,
      fuelType,
      transmission,
      engineSize,
      mileage,
      safetyrating,
      fuelTank,
      warranty,
      seater,
      size,
    });

    await car.save();

    const category = await brandModel.findById(brand);
    if (category) {
      category.carInvoleInThisBrand.push(car);
      await category.save();
    }

    res.status(201).send({
      success: true,
      message: "Car Created Successfully",
      car,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Error in creating Car",
      error: err.message,
    });
  }
};

// The getDriveFileId function is no longer needed
// const getDriveFileId = (url) => { // DELETE THIS FUNCTION
//     const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
//     const match = url.match(regex);
//     return match ? match[1] : null;
// };

const getAllCar = async (req, res) => {
  try {
    // No need to transform URLs as Cloudinary URLs are directly usable
    const cars = await carModel.find({}).populate("brand");

    // You might still need to adjust the brandPictures if they are Google Drive links
    // If brandPictures are also moving to Cloudinary, this section will change.
    const updatedCars = cars.map((car) => {
      // car.productPictures are already Cloudinary URLs, no transformation needed here unless you want specific sizes/formats.
      // If you want to use Cloudinary transformations, you can modify the URL here.
      // Example: car.productPictures = car.productPictures.map(url => cloudinary.url(extractPublicId(url), { width: 400, height: 300, crop: "fill" }));

      // Check if brandPictures are still Google Drive links and need updating
      if (
        car.brand &&
        car.brand.brandPictures &&
        car.brand.brandPictures.includes("googleusercontent.com")
      ) {
        // This implies brand pictures are *still* Google Drive.
        // You will eventually update brandModel and brandController to use Cloudinary for brand pictures too.
        // For now, if you want them to display, you might need the original Google Drive method or move them to Cloudinary.
        // Assuming for now they *might* still be GD links if not migrated yet.
        // If they are to be Cloudinary, no conversion needed.
        // If they were meant to be displayed, you'd keep the old getDriveFileId or move them.
        // For now, let's assume they might be Cloudinary URLs directly or handled by frontend.
        // If your brand pictures are NOT migrated yet, and this causes issues, we'll address `brandController.js` next.
        // For demonstration, let's remove the GD specific transformation here for `brandPictures` as well if they are to be migrated.
        // If brand pictures are staying on GD for now, you'd retain the old logic for them.
        // For now, assuming they should either be Cloudinary URLs or direct paths.
        // REMOVE this if brandPictures are moved to Cloudinary:
        // const fileId = getDriveFileId(car.brand.brandPictures);
        // car.brand.brandPictures = fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w1000?authuser=0` : car.brand.brandPictures;
      }
      return car;
    });

    res.status(200).send({
      success: true,
      totalCar: updatedCars.length,
      message: "All cars",
      cars: updatedCars,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error in Getting Car",
      error: err.message,
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const car = await carModel
      .findOne({ slug: req.params.slug })
      .populate("brand");

    if (car) {
      // car.productPictures are already Cloudinary URLs, no transformation needed here.
      // If you want to apply transformations for display, do it on the frontend or here:
      // car.productPictures = car.productPictures.map(url => cloudinary.url(extractPublicId(url), { width: 600, height: 400, crop: "fill" }));

      // Similar to getAllCar, adjust brandPictures if they are still Google Drive links.
      if (
        car.brand &&
        car.brand.brandPictures &&
        car.brand.brandPictures.includes("googleusercontent.com")
      ) {
        // REMOVE this if brandPictures are moved to Cloudinary:
        // const fileId = getDriveFileId(car.brand.brandPictures);
        // car.brand.brandPictures = fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w1000?authuser=0` : car.brand.brandPictures;
      }
    }

    res.status(200).send({
      success: true,
      message: "Car By this Id",
      car,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error in Finding Car Id",
      err,
    });
  }
};

// Helper to extract Cloudinary public ID from a URL (if you stored full URLs)
// You might need this for deletion if your DB stores full Cloudinary URLs and not just public IDs.
function extractPublicId(cloudinaryUrl) {
  // Example Cloudinary URL: https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/folder_name/image_name.jpg
  const parts = cloudinaryUrl.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex > -1 && parts.length > uploadIndex + 1) {
    // The public ID starts after 'upload/v<timestamp>/'
    const publicIdWithVersion = parts.slice(uploadIndex + 2).join("/");
    // Remove file extension if present
    const lastDotIndex = publicIdWithVersion.lastIndexOf(".");
    return lastDotIndex !== -1
      ? publicIdWithVersion.substring(0, lastDotIndex)
      : publicIdWithVersion;
  }
  return null;
}

const deleteCar = async (req, res) => {
  try {
    const carToDelete = await carModel.findById(req.params.pid);

    if (!carToDelete) {
      return res.status(404).send({ success: false, message: "Car not found" });
    }

    // Delete images from Cloudinary
    for (const imageUrl of carToDelete.productPictures) {
      const publicId = extractPublicId(imageUrl); // Extract public ID from the stored URL
      if (publicId) {
        await deleteFileFromCloudinary(publicId);
      } else {
        console.warn(`Could not extract public ID from URL: ${imageUrl}`);
      }
    }

    // Remove the car from the database
    await carModel.findByIdAndDelete(req.params.pid);

    res.status(200).send({
      success: true,
      message: "Car Deleted Successfully",
    });
  } catch (err) {
    console.error("Error in Deleting Car:", err); // More detailed error log
    res.status(500).send({
      success: false,
      message: "Error in Deleting Car",
      err: err.message, // Send the error message for better debugging
    });
  }
};

const updatecar = async (req, res) => {
  try {
    // For updates, if you're allowing new images, you'll need to handle
    // deleting old images from Cloudinary and uploading new ones.
    // This example assumes you're not changing images during a regular updatecar call,
    // or that image updates are handled via a separate route.
    // If images ARE part of this update, you'd need logic similar to createCar,
    // plus logic to identify and delete old images from Cloudinary.

    const {
      name,
      description,
      fuelType,
      transmission,
      engineSize,
      mileage,
      safetyrating,
      warranty,
      seater,
      size,
      fuelTank,
      price,
    } = req.body; // Assuming req.body now for regular fields

    // If you are using `multer` for image updates on this route, `req.files` will be available.
    // If you are using `express-formidable` (req.fields), it won't be `req.body` directly.
    // I'll keep the `req.body` for simplicity for non-file fields for now.
    // If you are sending files with this update endpoint, you need to adjust this.

    switch (true) {
      case !name:
        return res.send({ message: "Name is required" });
      case !description:
        return res.send({ message: "Description is required" });
      case !price:
        return res.send({ message: "Price is required" });
      case !fuelType:
        return res.send({ message: "FuelType is required" });
      case !transmission:
        return res.send({ message: "Transmission is required" });
      case !engineSize:
        return res.send({ message: "EngineSize is required" });
      case !mileage:
        return res.send({ message: "Mileage is required" });
      case !safetyrating:
        return res.send({ message: "Safetyrating is required" });
      case !warranty:
        return res.send({ message: "Warranty is required" });
      case !seater:
        return res.send({ message: "Seater is required" });
      case !size:
        return res.send({ message: "Size is required" });
      case !fuelTank:
        return res.send({ message: "Fuel Tank is required" });
    }

    const updatedFields = {
      name,
      slug: slugify(name),
      description,
      fuelType,
      transmission,
      engineSize,
      mileage,
      safetyrating,
      warranty,
      seater,
      size,
      fuelTank,
      price,
    };

    // If you're allowing image updates via this route and using multer:
    if (req.files && req.files.length > 0) {
      const oldCar = await carModel.findById(req.params.pid);
      // Delete old images from Cloudinary first
      for (const imageUrl of oldCar.productPictures) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          await deleteFileFromCloudinary(publicId);
        }
      }
      // Upload new images
      const newImageUrls = await Promise.all(
        req.files.map(async (file) => {
          const url = await uploadFileToCloudinary(file.path);
          return url;
        })
      );
      updatedFields.productPictures = newImageUrls;
    }

    const car = await carModel.findByIdAndUpdate(
      req.params.pid,
      updatedFields,
      { new: true }
    );

    res.status(201).send({
      success: true,
      message: "Car Updated Successfully",
      car,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error in Updating Car",
      err,
    });
  }
};

const relatedCar = async (req, res) => {
  try {
    const { cid, bid } = req.params;
    const cars = await carModel
      .find({
        brand: bid,
        _id: { $ne: cid },
      })
      .populate("brand");

    // No image URL transformations needed as they are Cloudinary URLs directly.
    // Adjust for brandPictures if they are also moved to Cloudinary.

    res.status(200).send({
      success: true,
      message: "Related Cars for this Brand",
      cars,
    });
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error While Fetching Related Cars",
      err,
    });
  }
};

module.exports = {
  upload,
  createCar,
  getAllCar,
  getCarById,
  deleteCar,
  updatecar,
  relatedCar,
};
