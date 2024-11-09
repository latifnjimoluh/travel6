const db = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Partie Administrateur

// Obtenir tous les clients
exports.getAllClients = (req, res) => {
  const sql = 'SELECT * FROM client';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Supprimer un client
exports.deleteClient = (req, res) => {
  const sql = 'DELETE FROM client WHERE id_client = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client supprimé avec succès' });
  });
};


// Obtenir un client par ID
exports.getClientById = (req, res) => {
  const sql = 'SELECT * FROM client WHERE id_client = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Créer un nouveau client (ajout du mot de passe et hachage)
exports.createClient = (req, res) => {
  const { nom_client, prenom_client, telephone_client, num_cni_client, date_nais, password } = req.body;

  // Hachage du mot de passe
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Erreur de hachage du mot de passe' });

    const sql = 'INSERT INTO client (nom_client, prenom_client, telephone_client, num_cni_client, date_nais, password) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nom_client, prenom_client, telephone_client, num_cni_client, date_nais, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Client créé avec succès', id: result.insertId });
    });
  });
};


// utilisateurs


// Mettre à jour les données
exports.updateClient = (req, res) => {
  const { nom_client, prenom_client, telephone_client, num_cni_client, date_nais, password } = req.body;

  // Préparer la requête SQL dynamique pour mettre à jour uniquement les champs envoyés
  let sql = 'UPDATE client SET ';
  let values = [];

  // Vérifier et ajouter les champs à mettre à jour
  if (nom_client) {
    sql += 'nom_client = ?, ';
    values.push(nom_client);
  }
  if (prenom_client) {
    sql += 'prenom_client = ?, ';
    values.push(prenom_client);
  }
  if (telephone_client) {
    sql += 'telephone_client = ?, ';
    values.push(telephone_client);
  }
  if (num_cni_client) {
    sql += 'num_cni_client = ?, ';
    values.push(num_cni_client);
  }
  if (date_nais) {
    sql += 'date_nais = ?, ';
    values.push(date_nais);
  }
  if (password) {
    // Si un mot de passe est fourni, le hacher
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) return res.status(500).json({ error: 'Erreur de hachage du mot de passe' });

      sql += 'password = ?, ';
      values.push(hashedPassword);

      // Retirer la dernière virgule et ajouter la condition WHERE
      sql = sql.slice(0, -2) + ' WHERE id_client = ?';
      values.push(req.params.id);

      db.query(sql, values, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Client mis à jour avec succès' });
      });
    });
    return; // Sortir de la fonction, car l'appel bcrypt est asynchrone
  }

  // Si aucun mot de passe, supprimer la dernière virgule et ajouter la condition WHERE
  sql = sql.slice(0, -2) + ' WHERE id_client = ?';
  values.push(req.params.id);

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client mis à jour avec succès' });
  });
};


