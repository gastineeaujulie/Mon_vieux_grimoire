const express = require('express');
const router = express.Router();

const booksCtrl = require('../controllers/books');

router.post('/:id/rating', booksCtrl.createBook);

router.put('/:id', booksCtrl.modifyBook);

router.delete('/:id', booksCtrl.deleteBook);

// router.get('/', (req, res, next) => {
//   const books = [
//     {
//       _id: '9',
//       userId: 'clc4wj5lh3gyi0ak4eq4n8syr',
//       title: 'The Kinfolk Table',
//       author: 'Nathan Williams',
//       imageUrl: 'https://via.placeholder.com/206x260',
//       year: 2022,
//       genre: 'Cuisine',
//       ratings: [
//         { userId: '1', grade: 5 },
//         { userId: '1', grade: 5 },
//         { userId: '1', grade: 5 },
//         { userId: 'clc4wj5lh3gyi0ak4eq4n8syr', grade: 1 },
//       ],
//       averageRating: 3,
//     },
//     // Tu peux ajouter d'autres livres ici
//   ];

//   res.status(200).json(books);
// });

router.get('/', booksCtrl.getAllBook);

router.get('/:id', booksCtrl.getOneBook);

router.get('/bestrating', (req, res, next) => {});

module.exports = router;
