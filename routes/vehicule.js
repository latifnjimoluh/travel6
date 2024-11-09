const express = require('express');
const router = express.Router();
const vehiculeController = require('../controllers/vehiculeController');

// Route pour obtenir tous les véhicules
router.get('/', vehiculeController.getAllVehicules);

// Route pour obtenir un véhicule par ID
router.get('/:id', vehiculeController.getVehiculeById);

// Route pour créer un véhicule
router.post('/', vehiculeController.createVehicule);

// Route pour mettre à jour un véhicule
router.put('/:id', vehiculeController.updateVehicule);

// Route pour supprimer un véhicule
router.delete('/:id', vehiculeController.deleteVehicule);

module.exports = router;
