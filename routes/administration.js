const express = require('express');
const router = express.Router();
const administrationController = require('../controllers/administrationController'); // Import du contrôleur

// Ajouter un employé
router.post('/addEmployee', administrationController.addEmployee);

// Mettre à jour les informations d'un employé
router.put('/updateEmployee', administrationController.updateEmployee);

// Supprimer un employé
router.delete('/deleteEmployee/:id_personnel', administrationController.deleteEmployee);

// Consulter l'historique des actions d'un employé
router.get('/getEmployeeActions/:id_personnel', administrationController.getEmployeeActions);

// Consulter tous les employés
router.get('/getAllEmployees', administrationController.getAllEmployees);

// Consulter un employé par ID
router.get('/getEmployeeById/:id_personnel', administrationController.getEmployeeById);

module.exports = router;
