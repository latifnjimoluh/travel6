require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db'); // Import de la configuration de la base de données

// Middleware pour analyser les requêtes JSON
app.use(bodyParser.json());

// Import des fichiers de routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const voyageRoutes = require('./routes/voyages');
const reservationRoutes = require('./routes/reservations');
const paiementRoutes = require('./routes/paiements');
const billetRoutes = require('./routes/billets');
const administrationRoutes = require('./routes/administration');

// Utilisation des routes avec le préfixe /api
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/voyages', voyageRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/paiements', paiementRoutes);
app.use('/api/billets', billetRoutes);
app.use('/api/admin', administrationRoutes);

// Route d'accueil par défaut
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API de Travel6');
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
