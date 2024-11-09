const express = require('express');
const router = express.Router();
const chauffeurController = require('../controllers/chauffeurController');

// Route pour obtenir tous les chauffeurs
router.get('/', chauffeurController.getAllChauffeurs);

// Route pour obtenir un chauffeur par ID
router.get('/:id', chauffeurController.getChauffeurById);

// Route pour créer un chauffeur
router.post('/', chauffeurController.createChauffeur);

// Route pour mettre à jour un chauffeur
router.put('/:id', chauffeurController.updateChauffeur);

// Route pour supprimer un chauffeur
router.delete('/:id', chauffeurController.deleteChauffeur);

module.exports = router;
