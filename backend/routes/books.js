const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const booksCtrl = require('../controllers/books');

router.post('/', auth, multer, booksCtrl.createBook); // creer livre
router.post('/:id/rating', auth, booksCtrl.rateBook); // noter livre
router.put('/:id', auth, multer, booksCtrl.modifyBook); // modifier livre
router.delete('/:id', auth, booksCtrl.deleteBook); // supprimer livre

router.get('/bestrating', booksCtrl.topRatingBook); // top livres
router.get('/', booksCtrl.getAllBook); // tous les livres
router.get('/:id', booksCtrl.getOneBook); // trouver un livre

module.exports = router;
