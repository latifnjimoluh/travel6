const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createToken} = require('../routes/authMiddleware');


// Inscription d'un client
exports.registerClient = (req, res) => {
  const { nom_client, prenom_client, telephone_client, num_cni_client, date_nais, password } = req.body;

  // Hachage du mot de passe
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err.message });

    const sql = 'INSERT INTO client (nom_client, prenom_client, telephone_client, num_cni_client, date_nais, password) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nom_client, prenom_client, telephone_client, num_cni_client, date_nais, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      // Générer un token JWT pour l'utilisateur après l'inscription
      const token = createToken({
        login: num_cni_client,  // Utiliser le CNI comme identifiant unique
        role: 'client'          // Définir le rôle comme client
      });

      // Retourner le token et l'ID du client
      const clientId = result.insertId;
      res.json({
        message: 'Client inscrit avec succès',
        token,
        clientId
      });
    });
  });
};


// Connexion d'un client
exports.loginClient = (req, res) => {
  const { login, password } = req.body;  // 'login' peut être un numéro de téléphone ou un CNI

  // Requête SQL pour chercher l'utilisateur par téléphone ou par CNI
  const sql = 'SELECT * FROM client WHERE telephone_client = ? OR num_cni_client = ?';
  const queryParams = [login, login]; // Utiliser `login` pour les deux colonnes

  // Exécuter la requête
  db.query(sql, queryParams, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparaison du mot de passe
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

      // Création du token JWT après la vérification du mot de passe
      const token = createToken({
        login: result[0].num_cni_client, // Utiliser le CNI comme identifiant unique
        role: 'client'                  // Définir le rôle comme client
      });

      // Retourner le token et l'ID du client
      const clientId = result[0].id_client;
      res.json({
        message: 'Connexion réussie',
        token,
        clientId
      });
    });
  });
};



// Inscription d'un employé
exports.registerEmployee = (req, res) => {
  const { nom_personnel, prenom_personnel, adresse_personnel, poste, password } = req.body;

  // Hachage du mot de passe
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err.message });

    const sql = 'INSERT INTO personnel (nom_personnel, prenom_personnel, adresse_personnel, poste, password) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nom_personnel, prenom_personnel, adresse_personnel, poste, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Employé inscrit avec succès', id_personnel: result.insertId });
    });
  });
};

// Connexion d'un employé
exports.loginEmployee = (req, res) => {
  const { poste, password } = req.body;
  const sql = 'SELECT * FROM personnel WHERE poste = ?';

  db.query(sql, [poste], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }

    // Comparaison du mot de passe haché
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

      // Création du token JWT avec les données de l'employé
      const token = createToken({
        login: result[0].poste,  // Identifiant unique de l'employé (ici le poste)
        password: result[0].password, // Mot de passe (pas envoyé en clair)
        role: 'employee'         // Rôle de l'utilisateur : employé
      });

      res.json({ message: 'Connexion réussie', token }); // Retourner le token dans la réponse
    });
  });
};

// Dans auth.js ou un autre fichier de routes
exports.logoutClient = (req, res) => {
  const token = req.headers['authorization']?.slice(7); // Extraire le token de l'en-tête Authorization
  if (token) {
      revokedTokens.add(token); // Ajouter le token à la liste des tokens révoqués
      res.json({ message: 'Déconnexion réussie' });
  } else {
      res.status(400).json({ message: 'Token manquant pour la déconnexion' });
  }
};
