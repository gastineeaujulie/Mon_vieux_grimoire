const path = require('path');
const sharp = require('sharp'); //optimiser et covertir les images en WebP
const fs = require('fs');
const Book = require('../models/Book');

exports.createBook = async (req, res, next) => {
  try {
    // Vérifier que le fichier existe
    if (!req.file) {
      return res.status(400).json({ message: 'Image requise' });
    }

    const bookObject = JSON.parse(req.body.book); // transforme objet string en Object javascript exploitable
    delete bookObject._id; // car id généré par la base de données
    delete bookObject._userId; // ne pas utiliser celui du client mais utilisé celui du token

    // Création d'un nom unique pour l'image
    const filename = `book_${Date.now()}_${Math.round(Math.random() * 1e9)}.webp`;
    const filepath = path.join('images', filename);

    // Optimisation et conversion de l'image
    await sharp(req.file.buffer)
      .resize(800, 1200, {
        // largeur max 800px, hauteur max 1200px
        fit: 'inside', // garde les proportions
        withoutEnlargement: true, // agrandit pas les petites images
      })
      .webp({ quality: 80 }) // conversion en WebP à 80% de qualité
      .toFile(filepath);

    // Création du livre
    const book = new Book({
      ...bookObject, // spread operator qui prend toutes les propriétés contenues dans bookObject et les copie ici
      userId: req.auth.userId, // extrait de l'objet req grâce au middleware auth
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`, // génère url de l'image avec protocole (http), nom d'hôte (localhost:3000), nom de fichier donné par multer
    });
    await book.save(); // enregistre un livre
    res.status(201).json({ message: 'Livre enregistré !' });
  } catch (error) {
    console.error('Erreur createBook:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.rateBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé !' });
    }

    // vérifie si le user a déjà noté le livre
    const alreadyRated = book.ratings.find(
      (rating) => rating.userId === req.auth.userId
    );

    if (alreadyRated) {
      return res
        .status(403)
        .json({ message: 'Vous avez déjà noté ce livre !' });
    }

    const ratingObject = {
      userId: req.auth.userId, // Id du token
      grade: req.body.rating,
    };

    // On ajoute la note au tableau ratings
    book.ratings.push(ratingObject);

    // On calcul la moyenne de la note du livre (somme en cours + note)
    const total = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = total / book.ratings.length;

    // On sauvegarde le livre avec la nouvelle note et la moyenne
    await book.save();

    res.status(200).json({ message: 'Note ajoutée !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    let bookObject;

    // Si nouvelle image uploadée
    if (req.file) {
      const filename = `book_${Date.now()}_${Math.round(Math.random() * 1e9)}.webp`;
      const filepath = path.join('images', filename);

      // Optimise la nouvelle image avec Sharp
      await sharp(req.file.buffer)
        .resize(800, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      bookObject = {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
      };
    } else {
      bookObject = { ...req.body };
    }

    delete bookObject._userId;

    const book = await Book.findOne({ _id: req.params.id }); //permet de modifier un objet avec verification de l'utilisateur

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Requête non autorisée' });
    }

    // Supprime l'ancienne image si nouvelle uploadée
    if (req.file && book.imageUrl) {
      const oldFilename = book.imageUrl.split('/images/')[1];
      const oldFilepath = path.join('images', oldFilename);

      fs.unlink(oldFilepath, (err) => {
        if (err) {
          console.error('Erreur suppression ancienne image:', err);
        }
      });
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );

    res.status(200).json({ message: 'Livre modifié !' });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non-autorisé' }); // 403 = authentifié mais mauvais userId, pas autorisé
      }

      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch((error) => res.status(500).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.topRatingBook = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // classe en ordre décroissant
    .limit(3) // garde 3 résultats
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBook = (req, res, next) => {
  Book.find() //retourne tous les livres
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id }) //retourne un seul livre basé sur son id
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};
