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

// Route pour mettre à jour uniquement le statut d'un voyage
router.put('/:id/statut', voyageController.updateStatutVoyage);

router.get('/:voyageId/seats', voyageController.getSeatInfo);  

// Nouvelles routes pour la gestion des places
router.get('/:id_voyage/total-places', voyageController.getTotalPlaces);
router.get('/:id_voyage/booked-places', voyageController.getBookedPlaces);
router.get('/:id_voyage/available-places', voyageController.getAvailablePlaces);
router.get('/:id_voyage/places-with-location', voyageController.getPlacesWithLocation);

module.exports = router;
