const path = require('path'); // module natif Node.js, gérer les chemins de fichier
const sharp = require('sharp'); // optimiser et convertir les images en WebP
const fs = require('fs'); // module natif Node.js, lire, écrire, supprimer des fichiers
const Book = require('../models/Book'); // modèle Mongoose de la collection des livres en BD

exports.createBook = async (req, res, next) => {
  try {
    // vérifier que le fichier existe
    if (!req.file) {
      return res.status(400).json({ message: 'Image requise' });
    }

    const bookObject = JSON.parse(req.body.book); // transforme objet string en Object javascript exploitable
    delete bookObject._id; // car id généré par la base de données
    delete bookObject._userId; // ne pas utiliser celui du client mais utilisé celui du token

    // création d'un nom unique pour l'image
    const filename = `book_${Date.now()}_${Math.round(Math.random() * 1e9)}.webp`; // génère automatiquement un nom de fichier unique
    const filepath = path.join('images', filename);

    // optimisation et conversion de l'image
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
      (rating) => rating.userId.toString() === req.auth.userId
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

    // ajoute la note au tableau ratings
    book.ratings.push(ratingObject);

    // calcul la moyenne de la note du livre (somme en cours + note)
    const total = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
    book.averageRating = Math.round(total / book.ratings.length);

    // sauvegarde le livre avec la nouvelle note et la moyenne
    await book.save();

    res.status(200).json(book); // renvoie le livre mis a jour
  } catch (error) {
    res
      .status(400)
      .json({ message: "Une erreur est survenue lors de l'ajout de la note" });
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    let bookObject;

    // si nouvelle image uploadée
    if (req.file) {
      const filename = `book_${Date.now()}_${Math.round(Math.random() * 1e9)}.webp`;
      const filepath = path.join('images', filename);

      // optimise la nouvelle image avec Sharp
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

exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non-autorisé' }); // 403 = authentifié mais mauvais userId, pas autorisé
    }

    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) console.log('Erreur suppression image', err);
      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Objet supprimé !' });
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.topRatingBook = async (req, res, next) => {
  try {
    const books = await Book.find()
      .sort({ averageRating: -1 }) // classe en ordre décroissant
      .limit(3); // garde 3 résultats
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getAllBook = async (req, res, next) => {
  try {
    const books = await Book.find(); //retourne tous les livres
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id }); //retourne un seul livre basé sur son id
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error });
  }
};
