const express = require('express');
const router = express.Router();
const voyageController = require('../controllers/voyageController'); // Import du contrôleur

// Middleware pour analyser les requêtes JSON
router.use(express.json());

// Route pour obtenir tous les voyages
router.get('/', voyageController.getAllVoyages);

// Route pour obtenir un voyage par ID
router.get('/:id', voyageController.getVoyageById);

// Route pour créer un nouveau voyage
router.post('/', voyageController.createVoyage);

// Route pour mettre à jour un voyage
router.put('/:id', voyageController.updateVoyage);

// Route pour annuler un voyage
router.put('/:id/cancel', voyageController.cancelVoyage);

module.exports = router;
