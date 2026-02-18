const multer = require('multer'); // importe middelware multer qui gère les fichiers uploadés (multipart/form-data)

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}; // formats autorisés

const storage = multer.memoryStorage(); // stockage em mémoire(RAM) pour Sharp

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
  fileFilter: (req, file, callback) => {
    if (MIME_TYPES[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new Error('Format non supporté. Utilisez JPG ou PNG.'));
    }
  },
});

module.exports = upload.single('image');
