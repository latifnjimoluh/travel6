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
  const { login, password } = req.body;  // 'login' peut être un numéro de téléphone ou un CNI
  let sql = '';
  let queryParams = [];

  // Vérifier si l'utilisateur a entré un numéro de téléphone ou un CNI
  if (login.includes('@')) {
    // Si le login contient '@', c'est probablement un email ou numéro de téléphone
    sql = 'SELECT * FROM client WHERE telephone_client = ?';
    queryParams = [login];
  } else {
    // Sinon, on assume que c'est un numéro de CNI
    sql = 'SELECT * FROM client WHERE num_cni_client = ?';
    queryParams = [login];
  }

  // Requête pour chercher le client dans la base de données
  db.query(sql, queryParams, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Comparaison du mot de passe haché
    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

      // Création du token JWT après la vérification du mot de passe
      const token = createToken({
        login: result[0].num_cni_client, // Identifiant unique pour le client (ici, on utilise le CNI)
        role: 'client'                  // Définition du rôle comme client
      });

      // Ajouter l'ID du client à la réponse
      const clientId = result[0].id_client; // Supposons que l'ID du client est dans la colonne `id_client`
      
      res.json({
        message: 'Connexion réussie',
        token,
        clientId  // Retourner également l'ID du client
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
