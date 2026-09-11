export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const FALLBACK = `${API_URL}/car-images/sedan-red.jpg`;

export const getImageUrl = (src) => {
  if (!src) return FALLBACK;
  if (typeof src !== "string") return FALLBACK;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return `${API_URL}/${src.replace(/^\/+/, "")}`;
};

const normalizePictures = (productPictures) => {
  if (!productPictures) return [];
  if (Array.isArray(productPictures)) return productPictures.filter(Boolean);
  if (typeof productPictures === "string") return [productPictures];
  return [];
};

export const getCarImage = (productPictures, index = 0) => {
  const pictures = normalizePictures(productPictures);
  if (!pictures.length) return FALLBACK;
  return getImageUrl(pictures[index] ?? pictures[0]);
};

export const getBrandImage = (brandPictures) => {
  if (!brandPictures) return FALLBACK;
  if (Array.isArray(brandPictures)) {
    return getImageUrl(brandPictures[0]);
  }
  return getImageUrl(brandPictures);
};
