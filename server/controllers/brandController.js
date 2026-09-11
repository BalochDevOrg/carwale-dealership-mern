const { default: slugify } = require("slugify");
const brandModel = require("../models/carBrand");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
// const { google } = require('googleapis'); // REMOVED: Google Drive import
const dotenv = require("dotenv"); // Ensure dotenv is imported
const cloudinary = require("cloudinary").v2; // ADDED: Cloudinary import

dotenv.config(); // Ensure dotenv is configured to load environment variables

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true, // Use HTTPS URLs
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary local storage
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// REMOVED: Google Drive related constants and functions
// const KEYFILEPATH = path.join(__dirname, 'cred.json');
// const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const auth = new google.auth.GoogleAuth({
//     keyFile: KEYFILEPATH,
//     scopes: SCOPES,
// });
// const drive = google.drive({ version: 'v3', auth });
// const FOLDER_ID = "1QPzzSYvS6vm1rjLoi7vy51HuW8OrIL0t";
// const uploadFileToGoogleDrive = async (filePath, fileName) => { /* ... */ };

// ADDED: Cloudinary upload function
const uploadFileToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "carwale_brands", // Optional: specify a folder for brand images
      resource_type: "image",
    });
    // Delete the local file after successful upload
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(
          "Error deleting local file after Cloudinary upload:",
          err
        );
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

// ADDED: Cloudinary delete function
const deleteFileFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary deletion result for brand image:", result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

// ADDED: Helper to extract Cloudinary public ID from a URL
function extractPublicId(cloudinaryUrl) {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") {
    return null;
  }
  const parts = cloudinaryUrl.split("/");
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex > -1 && parts.length > uploadIndex + 1) {
    // The public ID starts after 'upload/v<timestamp>/' or 'upload/'
    const publicIdWithVersion = parts.slice(uploadIndex + 2).join("/");
    const lastDotIndex = publicIdWithVersion.lastIndexOf(".");
    return lastDotIndex !== -1
      ? publicIdWithVersion.substring(0, lastDotIndex)
      : publicIdWithVersion;
  }
  return null;
}

const createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    // req.file is used because multer is set up for single file upload on this route
    const brandPicturePath = req.file ? req.file.path : null;

    if (!name) {
      // No res.send here to keep consistent status code
      return res
        .status(400)
        .send({ success: false, message: "Brand Name is Required" });
    }
    if (!brandPicturePath) {
      return res
        .status(400)
        .send({ success: false, message: "Brand Image is Required" });
    }

    const existBrand = await brandModel.findOne({ name }); // Renamed from existCategory for clarity

    if (existBrand) {
      // Delete the locally uploaded file if brand already exists to prevent orphaned files
      if (brandPicturePath) {
        fs.unlink(brandPicturePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
      return res.status(200).send({
        success: true,
        message: "Brand Name Already Exists",
      });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadFileToCloudinary(brandPicturePath);

    const brand = new brandModel({
      name,
      brandPictures: cloudinaryUrl, // Store Cloudinary URL
      slug: slugify(name),
    });

    await brand.save();
    res.status(201).send({
      success: true,
      message: "Brand Created Successfully",
      brand,
    });
  } catch (err) {
    console.error("Error in creating Brand:", err); // More detailed error logging
    res.status(500).send({
      success: false,
      message: "Error in creating Brand",
      error: err.message, // Send error message for debugging
    });
  }
};

// REMOVED: Google Drive file ID extraction is no longer needed
// const getDriveFileId = (url) => { /* ... */ };

const getBrand = async (req, res) => {
  try {
    // No need for URL transformation here, Cloudinary URLs are directly usable
    const brands = await brandModel.find({}).populate("carInvoleInThisBrand");

    // Note: carInvoleInThisBrand will contain cars with Cloudinary URLs already,
    // assuming carController is updated. No transformation needed here.

    res.status(200).send({
      success: true,
      totalBrand: brands.length,
      message: "All Brands",
      brands: brands, // Send brands directly, no need for updatedBrands map here
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error in Getting Brand",
      error: err.message, // Send error message for debugging
    });
  }
};

const getBrandById = async (req, res) => {
  try {
    const brand = await brandModel
      .findOne({ slug: req.params.slug })
      .populate("carInvoleInThisBrand");

    if (!brand) {
      return res.status(404).send({
        success: false,
        message: "Brand not found",
      });
    }

    // REMOVED: Google Drive URL conversion for brandPictures and car productPictures
    // These are now Cloudinary URLs and don't need conversion.
    // const convertDriveUrl = (url) => { /* ... */ };
    // brand.brandPictures = convertDriveUrl(brand.brandPictures);
    // brand.carInvoleInThisBrand.forEach(car => {
    //     car.productPictures = car.productPictures.map(picture => convertDriveUrl(picture));
    // });

    res.status(200).send({
      success: true,
      message: "Brand By this Id",
      brand,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Error in Finding Brand Id",
      error: err.message, // Send error message for debugging
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const brandPictureFile = req.file ? req.file.path : null; // Check for new image file

    if (!name) {
      return res
        .status(400)
        .send({ success: false, message: "Brand Name is Required" });
    }

    const existingBrand = await brandModel.findById(id);
    if (!existingBrand) {
      return res
        .status(404)
        .send({ success: false, message: "Brand not found" });
    }

    let updatedBrandPictures = existingBrand.brandPictures;

    if (brandPictureFile) {
      // Delete old image from Cloudinary
      const oldPublicId = extractPublicId(existingBrand.brandPictures);
      if (oldPublicId) {
        await deleteFileFromCloudinary(oldPublicId);
      }

      // Upload new image to Cloudinary
      updatedBrandPictures = await uploadFileToCloudinary(brandPictureFile);
    }

    const brand = await brandModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name), brandPictures: updatedBrandPictures },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Brand Updated Successfully",
      brand,
    });
  } catch (err) {
    console.error("Error in Updating Brand:", err);
    res.status(500).send({
      success: false,
      message: "Error in Updating Brand",
      error: err.message,
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brandToDelete = await brandModel.findById(id);

    if (!brandToDelete) {
      return res
        .status(404)
        .send({ success: false, message: "Brand not found" });
    }

    // Delete image from Cloudinary
    const publicId = extractPublicId(brandToDelete.brandPictures);
    if (publicId) {
      await deleteFileFromCloudinary(publicId);
    } else {
      console.warn(
        `Could not extract public ID from Brand URL: ${brandToDelete.brandPictures}`
      );
    }

    await brandModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "Brand Deleted Successfully",
    });
  } catch (err) {
    console.error("Error in Deleting Brand:", err);
    res.status(500).send({
      success: false,
      message: "Error in Deleting Brand",
      error: err.message,
    });
  }
};

module.exports = {
  getBrand,
  getBrandById,
  createBrand,
  upload,
  updateBrand,
  deleteBrand,
};
