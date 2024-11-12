require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');

// Middleware pour analyser les requêtes JSON
app.use(express.json()); // Utilisation du middleware intégré d'Express

// Middleware CORS avec options spécifiques (si nécessaire)
app.use(cors());

// Import des fichiers de routes
const { createToken, verifyToken, checkRole } = require('./routes/authMiddleware'); // Importez les middlewares
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const voyageRoutes = require('./routes/voyages');
const reservationRoutes = require('./routes/reservations');
const paiementRoutes = require('./routes/paiements');
const administrationRoutes = require('./routes/administration');
const trajetRoutes = require('./routes/trajets');
const vehiculeRoutes = require('./routes/vehicule');
const chauffeurRoutes = require('./routes/chauffeur');
const classeRoutes = require('./routes/classe');

// Protection des routes avec le middleware `verifyToken`
// Routes protégées nécessitant un token valide
app.use('/api/clients', verifyToken, clientRoutes); 
app.use('/api/voyages', voyageRoutes);
app.use('/api/reservations', verifyToken, reservationRoutes);
app.use('/api/paiements', verifyToken, paiementRoutes);
app.use('/api/trajets', verifyToken, trajetRoutes);
app.use('/api/vehicules', verifyToken, vehiculeRoutes);
app.use('/api/chauffeurs', verifyToken, chauffeurRoutes);
app.use('/api/classes', verifyToken, classeRoutes);

// Routes d'authentification (création de token) - Pas besoin de `verifyToken`
app.use('/api/auth', authRoutes); // La route pour l'authentification est libre, elle appelle `createToken` dans le contrôleur

// Route d'administration (exemple de vérification du rôle)
app.use('/api/admin', verifyToken, checkRole('admin'), administrationRoutes);

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
