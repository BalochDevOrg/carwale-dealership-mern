const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { ensureLocalCarImages } = require("./downloadCarImages");

const brandModel = require("../models/carBrand");
const carModel = require("../models/carModel");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO;

if (!MONGO_URI) {
  console.error(
    "Set MONGO_URI or MONGO in server/.env before running the seed script."
  );
  process.exit(1);
}

let imageSets = {
  suv: [],
  sedan: [],
  luxury: [],
  mpv: [],
  compact: [],
};

const setImageSets = (paths) => {
  imageSets = {
    compact: [paths[5], paths[0], paths[7], paths[1], paths[8]],
    suv: [paths[4], paths[8], paths[2], paths[3], paths[6]],
    luxury: [paths[2], paths[3], paths[7], paths[0], paths[1]],
    sedan: [paths[0], paths[1], paths[6], paths[7], paths[2]],
    mpv: [paths[9], paths[4], paths[8], paths[0], paths[5]],
  };
};

const carsByBrand = {
  nissan: [
    {
      name: "Nissan Magnite XV Premium",
      description:
        "Compact SUV with turbo-petrol engine, 360-degree camera, and wireless Android Auto.",
      price: "12",
      fuelType: "Petrol",
      transmission: "Manual",
      engineSize: "999 cc",
      mileage: "18 kmpl",
      safetyrating: "4 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Compact SUV",
      fuelTank: "40 L",
      imageType: "compact",
    },
    {
      name: "Nissan Kicks XV",
      description:
        "Stylish crossover with premium cabin, cruise control, and strong highway performance.",
      price: "18",
      fuelType: "Petrol",
      transmission: "CVT",
      engineSize: "1498 cc",
      mileage: "14 kmpl",
      safetyrating: "4 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Mid-size SUV",
      fuelTank: "50 L",
      imageType: "suv",
    },
  ],
  bmw: [
    {
      name: "BMW 3 Series 320d",
      description:
        "Luxury sedan with sporty handling, premium leather interior, and advanced driver aids.",
      price: "65",
      fuelType: "Diesel",
      transmission: "Automatic",
      engineSize: "1995 cc",
      mileage: "16 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Sedan",
      fuelTank: "59 L",
      imageType: "luxury",
    },
    {
      name: "BMW X1 sDrive20i",
      description:
        "Premium compact SUV with panoramic sunroof, digital cockpit, and refined ride quality.",
      price: "52",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "1998 cc",
      mileage: "14 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Compact SUV",
      fuelTank: "51 L",
      imageType: "compact",
    },
  ],
  hyundai: [
    {
      name: "Hyundai Creta SX(O)",
      description:
        "Popular mid-size SUV with ventilated seats, ADAS features, and smooth turbo engine.",
      price: "22",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "1497 cc",
      mileage: "17 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Mid-size SUV",
      fuelTank: "50 L",
      imageType: "suv",
    },
    {
      name: "Hyundai Verna SX Turbo",
      description:
        "Feature-rich sedan with connected car tech, sunroof, and strong safety package.",
      price: "18",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "1480 cc",
      mileage: "18 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Sedan",
      fuelTank: "45 L",
      imageType: "sedan",
    },
  ],
  mercedes: [
    {
      name: "Mercedes-Benz C 200",
      description:
        "Executive sedan with MBUX infotainment, ambient lighting, and refined comfort.",
      price: "78",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "1496 cc",
      mileage: "14 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Sedan",
      fuelTank: "66 L",
      imageType: "luxury",
    },
    {
      name: "Mercedes-Benz GLA 200",
      description:
        "Luxury compact SUV with premium cabin, smooth ride, and advanced safety systems.",
      price: "68",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "1332 cc",
      mileage: "15 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Compact SUV",
      fuelTank: "50 L",
      imageType: "suv",
    },
  ],
  mazda: [
    {
      name: "Mazda CX-5 Signature",
      description:
        "Driver-focused SUV with premium Bose audio, leather upholstery, and sharp handling.",
      price: "42",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "2488 cc",
      mileage: "13 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Mid-size SUV",
      fuelTank: "58 L",
      imageType: "suv",
    },
    {
      name: "Mazda 6 Skyactiv-G",
      description:
        "Elegant sedan with sporty dynamics, upscale interior, and efficient petrol engine.",
      price: "35",
      fuelType: "Petrol",
      transmission: "Automatic",
      engineSize: "2488 cc",
      mileage: "14 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "5",
      size: "Sedan",
      fuelTank: "62 L",
      imageType: "sedan",
    },
  ],
  toyota: [
    {
      name: "Toyota Fortuner Legender",
      description:
        "Full-size SUV with 4x4 capability, powerful diesel engine, and commanding road presence.",
      price: "48",
      fuelType: "Diesel",
      transmission: "Automatic",
      engineSize: "2755 cc",
      mileage: "12 kmpl",
      safetyrating: "5 Star",
      warranty: "3 Years",
      seater: "7",
      size: "Full-size SUV",
      fuelTank: "80 L",
      imageType: "suv",
    },
    {
      name: "Toyota Innova Crysta ZX",
      description:
        "Premium MPV with spacious cabin, reliable diesel performance, and family-friendly comfort.",
      price: "28",
      fuelType: "Diesel",
      transmission: "Manual",
      engineSize: "2393 cc",
      mileage: "15 kmpl",
      safetyrating: "4 Star",
      warranty: "3 Years",
      seater: "7",
      size: "MPV",
      fuelTank: "55 L",
      imageType: "mpv",
    },
  ],
};

const defaultCars = [
  {
    name: "City Cruiser Base",
    description: "Reliable daily driver with balanced comfort, safety, and fuel efficiency.",
    price: "15",
    fuelType: "Petrol",
    transmission: "Manual",
    engineSize: "1197 cc",
    mileage: "19 kmpl",
    safetyrating: "4 Star",
    warranty: "3 Years",
    seater: "5",
    size: "Hatchback",
    fuelTank: "42 L",
    imageType: "compact",
  },
  {
    name: "Highway Tourer Plus",
    description: "Comfort-focused car with spacious cabin and smooth long-distance performance.",
    price: "24",
    fuelType: "Diesel",
    transmission: "Automatic",
    engineSize: "1493 cc",
    mileage: "17 kmpl",
    safetyrating: "5 Star",
    warranty: "3 Years",
    seater: "5",
    size: "Sedan",
    fuelTank: "50 L",
    imageType: "sedan",
  },
];


const getBrandKey = (brandName) => brandName.trim().toLowerCase();

const buildTemplateMap = () => {
  const map = new Map();
  Object.values(carsByBrand)
    .flat()
    .concat(defaultCars)
    .forEach((template) => {
      map.set(template.name.toLowerCase(), {
        ...template,
        images: imageSets[template.imageType] || imageSets.suv,
      });
    });
  return map;
};

const seedCars = async () => {
  const localPaths = await ensureLocalCarImages({ force: true });
  setImageSets(localPaths);

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const templateMap = buildTemplateMap();
  const brands = await brandModel.find({});
  let createdCount = 0;
  let updatedCount = 0;

  for (const brand of brands) {
    const brandKey = getBrandKey(brand.name);
    const templates = carsByBrand[brandKey] || defaultCars;

    const existingCars = await carModel.find({ brand: brand._id });
    const existingByName = new Map(
      existingCars.map((car) => [car.name.toLowerCase(), car])
    );

    for (const template of templates) {
      const { imageType, ...carData } = template;
      const images = imageSets[imageType] || imageSets.suv;
      const existing = existingByName.get(template.name.toLowerCase());

      if (existing) {
        existing.productPictures = images;
        await existing.save();
        updatedCount += 1;
        console.log(`Updated images: ${template.name}`);
        continue;
      }

      const car = new carModel({
        ...carData,
        slug: slugify(template.name),
        brand: brand._id,
        productPictures: images,
        shipping: true,
      });

      await car.save();
      brand.carInvoleInThisBrand.push(car._id);
      createdCount += 1;
      console.log(`Created: ${template.name} (${brand.name.trim()})`);
    }

    await brand.save();
  }

  const allCars = await carModel.find({});
  for (const car of allCars) {
    const template = templateMap.get(car.name.toLowerCase());
    const images = template?.images || imageSets.suv;
    const needsUpdate =
      !car.productPictures?.length ||
      car.productPictures[0]?.includes("via.placeholder") ||
      car.productPictures[0]?.includes("unsplash.com") ||
      car.productPictures[0]?.includes("pexels.com") ||
      car.productPictures[0]?.includes("photo-1494976687768") ||
      car.productPictures[0]?.endsWith(".svg") ||
      !car.productPictures[0]?.endsWith(".jpg") ||
      !car.productPictures[0]?.includes("car-images/");

    if (needsUpdate) {
      car.productPictures = images;
      await car.save();
      updatedCount += 1;
      console.log(`Fixed images for: ${car.name}`);
    }
  }

  const totalCars = await carModel.countDocuments();
  console.log(
    `\nDone. Created ${createdCount}, updated ${updatedCount}. Total cars: ${totalCars}`
  );
  await mongoose.disconnect();
};

seedCars().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
