const db = require('../db');

// Obtenir tous les clients
exports.getAllClients = (req, res) => {
  const sql = 'SELECT * FROM client';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
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

// Créer un nouveau client
exports.createClient = (req, res) => {
  const { nom_client, prenom_client, telephone_client, num_cni_client, date_nais } = req.body;
  const sql = 'INSERT INTO client (nom_client, prenom_client, telephone_client, num_cni_client, date_nais) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [nom_client, prenom_client, telephone_client, num_cni_client, date_nais], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client créé avec succès', id: result.insertId });
  });
};

// Mettre à jour un client
exports.updateClient = (req, res) => {
  const { nom_client, prenom_client, telephone_client, num_cni_client, date_nais } = req.body;
  const sql = 'UPDATE client SET nom_client = ?, prenom_client = ?, telephone_client = ?, num_cni_client = ?, date_nais = ? WHERE id_client = ?';
  db.query(sql, [nom_client, prenom_client, telephone_client, num_cni_client, date_nais, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Client mis à jour avec succès' });
  });
};
