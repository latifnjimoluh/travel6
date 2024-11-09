require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db'); // Import de la configuration de la base de données
const cors = require('cors'); // Import de CORS
const bcrypt = require('bcrypt'); // Importation de bcrypt pour le hachage des mots de passe

// Middleware pour analyser les requêtes JSON
app.use(bodyParser.json());

// Utilisation de CORS pour autoriser les requêtes depuis n'importe quelle origine
app.use(cors());

// Middleware de validation des entrées (facultatif)
app.use((req, res, next) => {
  // Par exemple, vous pouvez ajouter une validation ici pour vérifier les entrées de la requête
  // Comme vérifier si le mot de passe respecte une certaine longueur, etc.
  next();
});

// Import des fichiers de routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const voyageRoutes = require('./routes/voyages');
const reservationRoutes = require('./routes/reservations');
const paiementRoutes = require('./routes/paiements');
const billetRoutes = require('./routes/billets');
const administrationRoutes = require('./routes/administration');
const trajetRoutes = require('./routes/trajets');
const vehiculeRoutes = require('./routes/vehicule');
const chauffeurRoutes = require('./routes/chauffeur');
const classeRoutes = require('./routes/classe');

// Utilisation des routes avec le préfixe /api
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/voyages', voyageRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/billets', billetRoutes);
app.use('/api/admin', administrationRoutes);
app.use('/api/trajets', trajetRoutes); 
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/classes', classeRoutes);

// Route d'accueil par défaut
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API de Travel6');
});

// Middleware pour gérer les erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack); // Log de l'erreur pour aider au débogage
  res.status(500).json({ error: err.message || 'Une erreur est survenue' });
});

// Gestion des erreurs de route non trouvée
app.use((req, res) => {
  res.status(404).send({ message: 'Route non trouvée' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
