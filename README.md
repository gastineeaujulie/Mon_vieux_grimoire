# BACKEND:

# Mon Vieux Grimoire - Backend

Ce dépôt contient le backend du projet **Mon Vieux Grimoire**.
Le frontend n'a pas éte modifié, il contient un README pour son installation.

## Installation et lancement

Se placer dans le dossier backend `cd backend` puis `npm install` pour installer les dépendances et `npm start` pour lancer le server





## Précision 
{ useNewUrlParser: true, useUnifiedTopology: true } inutiles car activées par défaut dans la version récente de Mongoose

Création d'un fichier .env ajouté au .gitignore pour stocker url et mdp de facon sécuriser

Utiliser async/await dans les controllers pour traiter Sharp de facon plus lisible qu'avec then et catch