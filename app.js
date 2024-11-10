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
// const corsOptions = {
//   origin: 'http://example.com', // Origine autorisée
//   methods: 'GET,POST,PUT,DELETE', // Méthodes HTTP autorisées
//   allowedHeaders: 'Content-Type,Authorization'
// };
// app.use(cors(corsOptions));
app.use(cors());
// Middleware pour valider les entrées (facultatif)
app.use((req, res, next) => {
  next();
});

// Import des fichiers de routes
const {   } = require('./routes/authMiddleware'); // Importez   de manière destructurée
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

// Protection des routes avec le middleware  

app.use('/api/auth' , authRoutes);
app.use('/api/auth' ,  authRoutes);
app.use('/api/clients' ,   clientRoutes); 
app.use('/api/voyages' ,   voyageRoutes);
app.use('/api/reservations' ,   reservationRoutes);
app.use('/api/paiements' ,   paiementRoutes);
app.use('/api/admin' ,   administrationRoutes);
app.use('/api/trajets' ,   trajetRoutes);
app.use('/api/vehicules' ,   vehiculeRoutes);
app.use('/api/chauffeurs' ,   chauffeurRoutes);
app.use('/api/classes' ,   classeRoutes);

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
