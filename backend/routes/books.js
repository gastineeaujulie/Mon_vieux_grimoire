const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const booksCtrl = require('../controllers/books');

router.get('/', auth, booksCtrl.getAllBook);
router.post('/:id/rating', auth, booksCtrl.createBook);
router.get('/:id', auth, booksCtrl.getOneBook);
router.get('/bestrating', auth, booksCtrl.topRatingBook);
router.put('/:id', auth, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;
