const express = require('express');
const router = express.Router();
const billetController = require('../controllers/billetController');

// Middleware pour analyser les requêtes JSON
router.use(express.json());

// Route pour obtenir tous les billets
router.get('/', billetController.getAllBillets);

// Route pour obtenir un billet par ID
router.get('/:id', billetController.getBilletById);

// Route pour créer un nouveau billet
router.post('/', billetController.createBillet);

// Route pour vérifier un billet via le code-barres
router.get('/verify/:code_barres', billetController.verifyBillet);

// Route pour réimprimer un billet
router.get('/reprint/:id_billet', billetController.reprintBillet);

// Route pour annuler un billet
router.put('/cancel/:id_billet', billetController.cancelBillet);

module.exports = router;
