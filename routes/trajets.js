const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajetController');

// Route pour obtenir tous les trajets
router.get('/', trajetController.getAllTrajets);

// Route pour obtenir un trajet par ID
router.get('/:id', trajetController.getTrajetById);

// Route pour créer un trajet
router.post('/', trajetController.createTrajet);

// Route pour mettre à jour un trajet
router.put('/:id', trajetController.updateTrajet);

// Route pour supprimer un trajet
router.delete('/:id', trajetController.deleteTrajet);

// Exporter le routeur
module.exports = router;
