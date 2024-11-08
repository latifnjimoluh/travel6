const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription d'un nouveau client
exports.registerClient = (req, res) => {
  const { nom_client, prenom_client, telephone_client, num_cni_client, date_nais } = req.body;
  const password = req.body.password; // Mot de passe reçu de la requête
  
  // Hashage du mot de passe
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: err.message });

    const sql = 'INSERT INTO client (nom_client, prenom_client, telephone_client, num_cni_client, date_nais, password) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nom_client, prenom_client, telephone_client, num_cni_client, date_nais, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Client inscrit avec succès', id_client: result.insertId });
    });
  });
};

// Connexion d'un client
exports.loginClient = (req, res) => {
  const { num_cni_client, password } = req.body;
  const sql = 'SELECT * FROM client WHERE num_cni_client = ?';
  db.query(sql, [num_cni_client], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Comparaison du mot de passe hashé
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

      // Création du token JWT
      const token = jwt.sign({ id_client: result[0].id_client, num_cni_client: result[0].num_cni_client }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token });
    });
  });
};

// Inscription d'un employé
exports.registerEmployee = (req, res) => {
  const { nom_personnel, prenom_personnel, adresse_personnel, poste, password } = req.body;
  
  // Hashage du mot de passe
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

    // Comparaison du mot de passe hashé
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

      // Création du token JWT
      const token = jwt.sign({ id_personnel: result[0].id_personnel, poste: result[0].poste }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Connexion réussie', token });
    });
  });
};

// Middleware pour vérifier le token JWT
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Aucun token fourni' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token invalide' });
    req.user = decoded; // Attacher les informations de l'utilisateur dans la requête
    next();
  });
};

// Middleware pour vérifier si l'utilisateur est un administrateur
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.poste === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès refusé, administrateur requis' });
};
