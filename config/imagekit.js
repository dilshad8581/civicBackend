const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Generate auth parameters for client-side uploads
const getAuthParams = () => {
  return imagekit.getAuthenticationParameters();
};

module.exports = { imagekit, getAuthParams };
