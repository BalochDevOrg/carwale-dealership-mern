const fs = require("fs");

const path = require("path");

const { execFileSync } = require("child_process");



const IMAGES_DIR = path.join(__dirname, "../public/car-images");



const pexelsUrl = (id) =>

  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop`;



const carCards = [

  { file: "sedan-red.jpg", title: "Red Sedan", pexelsId: 210019 },

  { file: "sedan-white.jpg", title: "White Sedan", pexelsId: 170811 },

  { file: "luxury-bmw.jpg", title: "BMW Luxury", pexelsId: 3802508 },

  { file: "luxury-mercedes.jpg", title: "Mercedes Luxury", pexelsId: 3597919 },

  { file: "suv-hyundai.jpg", title: "Hyundai SUV", pexelsId: 1545743 },

  { file: "compact-nissan.jpg", title: "Nissan Compact", pexelsId: 112460 },

  { file: "sedan-mazda.jpg", title: "Mazda Sedan", pexelsId: 919073 },

  { file: "electric-tesla.jpg", title: "Electric Car", pexelsId: 2449454 },

  { file: "suv-toyota.jpg", title: "Toyota SUV", pexelsId: 116675 },

  { file: "mpv-family.jpg", title: "Family MPV", pexelsId: 1035108 },

];



const escapePs = (value) => value.replace(/'/g, "''");



const downloadImage = (url, dest) => {

  const command = `Invoke-WebRequest -Uri '${escapePs(url)}' -OutFile '${escapePs(dest)}' -UseBasicParsing`;

  execFileSync("powershell", ["-NoProfile", "-Command", command], {

    stdio: "pipe",

  });

};



const ensureLocalCarImages = async ({ force = false } = {}) => {

  fs.mkdirSync(IMAGES_DIR, { recursive: true });



  for (const card of carCards) {

    const dest = path.join(IMAGES_DIR, card.file);

    const exists = fs.existsSync(dest);

    const size = exists ? fs.statSync(dest).size : 0;



    if (!force && exists && size > 10000) {

      console.log(`Exists: ${card.file}`);

      continue;

    }



    try {

      downloadImage(pexelsUrl(card.pexelsId), dest);

      const downloadedSize = fs.statSync(dest).size;

      console.log(

        `Downloaded: ${card.file} (${Math.round(downloadedSize / 1024)} KB)`

      );

    } catch (error) {

      console.error(`Failed ${card.file}: ${error.message}`);

      if (!exists) {

        throw error;

      }

      console.log(`Keeping existing: ${card.file}`);

    }

  }



  return carCards.map((card) => `car-images/${card.file}`);

};



module.exports = { ensureLocalCarImages, carCards };


