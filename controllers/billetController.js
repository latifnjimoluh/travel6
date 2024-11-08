const db = require('../db');

// Obtenir tous les billets
exports.getAllBillets = (req, res) => {
  const sql = 'SELECT * FROM billet';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir un billet par ID
exports.getBilletById = (req, res) => {
  const sql = 'SELECT * FROM billet WHERE id_billet = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }
    res.json(result[0]);
  });
};

// Créer un nouveau billet
exports.createBillet = (req, res) => {
  const { code_barres, id_reservation, id_voyage, date_emission } = req.body;
  const sql = 'INSERT INTO billet (code_barres, id_reservation, id_voyage, date_emission) VALUES (?, ?, ?, ?)';
  db.query(sql, [code_barres, id_reservation, id_voyage, date_emission], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Billet créé avec succès', id_billet: result.insertId });
  });
};

// Vérifier l'authenticité d'un billet via le code-barres
exports.verifyBillet = (req, res) => {
  const { code_barres } = req.params;
  const sql = 'SELECT * FROM billet WHERE code_barres = ?';
  db.query(sql, [code_barres], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Billet non valide' });
    }
    res.json({ message: 'Billet valide', billet: result[0] });
  });
};

// Réimpression d'un billet
exports.reprintBillet = (req, res) => {
  const { id_billet } = req.params;
  const sql = 'SELECT * FROM billet WHERE id_billet = ?';
  db.query(sql, [id_billet], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }
    res.json({ message: 'Billet à réimprimer', billet: result[0] });
  });
};

// Annuler un billet
exports.cancelBillet = (req, res) => {
  const { id_billet } = req.params;
  const sql = 'UPDATE billet SET statut = "annulé" WHERE id_billet = ?';
  db.query(sql, [id_billet], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Billet annulé avec succès' });
  });
};
