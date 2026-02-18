# Mon vieux Grimoire

## Comment lancer le projet ?

### Avec npm

Faites la commande `npm install` pour installer les dépendances puis `npm start` pour lancer le projet.

Le projet a été testé sur node 19.

# BACKEND:

{ useNewUrlParser: true, useUnifiedTopology: true } inutiles car activées par défaut dans la version récente de Mongoose

Création d'un fichier .env ajouté au .gitignore pour stocker url et mdp de facon sécuriser

Utiliser async/await dans les controllers pour traiter Sharp de facon plus lisible qu'avec then et catch
