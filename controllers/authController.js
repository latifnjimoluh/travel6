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

        // Comparaison du mot de passe haché
        bcrypt.compare(password, result[0].password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

            // Création du token JWT
            const token = createToken({
                login: result[0].num_cni_client,
                password: result[0].password,
                role: 'client' // Role de client
            });

            res.json({ message: 'Connexion réussie', token });
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
        login: result[0].poste,
        password: result[0].password,
        role: 'employee' // Assigner un rôle d'employé
      });

      res.json({ message: 'Connexion réussie', token });
    });
  });
};