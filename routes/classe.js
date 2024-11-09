const express = require('express');
const router = express.Router();
const classeController = require('../controllers/classeController');

// Route pour obtenir toutes les classes
router.get('/', classeController.getAllClasses);

// Route pour obtenir une classe par ID
router.get('/:id', classeController.getClasseById);

// Route pour créer une classe
router.post('/', classeController.createClasse);

// Route pour mettre à jour une classe
router.put('/:id', classeController.updateClasse);

// Route pour supprimer une classe
router.delete('/:id', classeController.deleteClasse);

module.exports = router;
