const db = require('../db');

// Rechercher des voyages par date et destination
exports.searchVoyages = (req, res) => {
  const { date, destination } = req.query;

  // Construction de la requête SQL de base
  let sql = `
    SELECT voyage.*, trajet.*, vehicule.*, classe.nom_classe, classe.prix_classe AS prix_classe, trajet.ville_depart, trajet.ville_arrivee
    FROM voyage 
    JOIN trajet ON voyage.id_trajet = trajet.id_trajet
    JOIN vehicule ON voyage.id_vehicule = vehicule.id_vehicule
    JOIN classe ON voyage.id_classe = classe.id_classe
    WHERE 1=1
  `;

  const queryParams = [];

  // Ajouter un filtre pour la date si elle est fournie
  if (date) {
    sql += ' AND DATE(voyage.heure_depart) = ?';  // Utilisation de DATE pour comparer uniquement la date
    queryParams.push(date);
  }

  // Ajouter un filtre pour la destination si elle est fournie
  if (destination) {
    sql += ' AND trajet.ville_arrivee LIKE ?';  // Recherche la destination partiellement
    queryParams.push(`%${destination}%`);
  }

  // Debug: Affichage de la requête SQL et des paramètres pour vérifier leur contenu
  console.log('SQL:', sql);
  console.log('Params:', queryParams);

  // Exécution de la requête SQL
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err.message);  // Si une erreur SQL se produit, l'afficher dans la console
      return res.status(500).json({ error: err.message });
    }
    // Vérification si aucun voyage n'est trouvé
    if (results.length === 0) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }
    // Si des voyages sont trouvés, renvoyer les résultats
    res.json(results);
  });
};

// Obtenir tous les voyages avec options de tri
exports.getAllVoyages = (req, res) => {
  let { sort_by, order } = req.query;

  sort_by = sort_by || 'heure_depart';  // Par défaut, trier par heure de départ
  order = order || 'ASC';  // Par défaut, ordre croissant

  let sql = `
    SELECT voyage.*, trajet.*, vehicule.*, classe.nom_classe, classe.prix_classe AS prix_classe, trajet.ville_depart, trajet.ville_arrivee
    FROM voyage 
    JOIN trajet ON voyage.id_trajet = trajet.id_trajet
    JOIN vehicule ON voyage.id_vehicule = vehicule.id_vehicule
    JOIN classe ON voyage.id_classe = classe.id_classe
  `;
  
  // Ajout du critère de tri selon la colonne spécifiée
  if (sort_by === 'classe') {
    sql += ' ORDER BY id_classe ' + order;
  } else if (sort_by === 'proche') {
    sql += ' ORDER BY heure_depart ' + order;
  } else {
    sql += ' ORDER BY ' + sort_by + ' ' + order;
  }

  // Exécution de la requête SQL
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });  // En cas d'erreur SQL
    res.json(results);  // Retourner les résultats
  });
};

// Créer un nouveau voyage
exports.createVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut } = req.body;

  // Obtenir le nombre de places du véhicule sélectionné
  const getVehicleSeatsSql = 'SELECT nombreplaces FROM vehicule WHERE id_vehicule = ?';
  db.query(getVehicleSeatsSql, [id_vehicule], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la requête pour obtenir le nombre de places
    if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });  // Si aucun véhicule n'est trouvé

    const nombre_de_places = result[0].nombreplaces;

    // Insertion du voyage
    const sql = `
      INSERT INTO voyage (heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut, nombre_de_places) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut || 'actif', nombre_de_places], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });  // Erreur lors de l'insertion du voyage
      res.status(201).json({ message: 'Voyage créé avec succès', id_voyage: result.insertId });  // Succès
    });
  });
};

// Obtenir un voyage par ID
exports.getVoyageById = (req, res) => {
  const sql = 'SELECT * FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la requête pour obtenir le voyage par ID
    if (result.length === 0) return res.status(404).json({ message: 'Voyage non trouvé' });  // Si aucun voyage n'est trouvé
    res.json(result[0]);  // Retourner le voyage trouvé
  });
};

// Mettre à jour un voyage
exports.updateVoyage = (req, res) => {
  const { heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut } = req.body;
  
  // Vérifier si id_vehicule a changé pour ajuster les places disponibles
  if (id_vehicule) {
    const checkVehicleSeats = 'SELECT nombreplaces FROM vehicule WHERE id_vehicule = ?';
    db.query(checkVehicleSeats, [id_vehicule], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la requête pour vérifier les places du véhicule
      if (result.length === 0) return res.status(404).json({ message: 'Véhicule non trouvé' });  // Si le véhicule n'est pas trouvé

      const nombre_de_places = result[0].nombreplaces;
      executeUpdate(nombre_de_places);  // Exécuter la mise à jour du voyage avec les nouvelles places
    });
  } else {
    executeUpdate();  // Si id_vehicule n'a pas changé, mettre à jour sans ajuster les places
  }

  // Fonction pour exécuter la mise à jour du voyage
  function executeUpdate(nombre_de_places) {
    const updateSql = `
      UPDATE voyage 
      SET heure_depart = ?, heure_arrive = ?, id_client = ?, id_vehicule = ?, id_chauffeur = ?, id_classe = ?, id_trajet = ?, statut = ?, nombre_de_places = COALESCE(?, nombre_de_places) 
      WHERE id_voyage = ?
    `;
    db.query(updateSql, [heure_depart, heure_arrive, id_client, id_vehicule, id_chauffeur, id_classe, id_trajet, statut || 'actif', nombre_de_places, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la mise à jour
      res.json({ message: 'Voyage mis à jour avec succès' });  // Succès
    });
  }
};

// Annuler un voyage
exports.cancelVoyage = (req, res) => {
  const sql = 'UPDATE voyage SET statut = "annule" WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de l'annulation
    res.json({ message: 'Voyage annulé avec succès' });  // Succès
  });
};

// Supprimer un voyage
exports.deleteVoyage = (req, res) => {
  const sql = 'DELETE FROM voyage WHERE id_voyage = ?';
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la suppression
    res.json({ message: 'Voyage supprimé avec succès' });  // Succès
  });
};

// Mise à jour du statut d'un voyage
exports.updateStatutVoyage = (req, res) => {
  const { statut } = req.body;
  const sql = 'UPDATE voyage SET statut = ? WHERE id_voyage = ?';
  db.query(sql, [statut, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });  // Erreur lors de la mise à jour du statut
    res.json({ message: 'Statut du voyage mis à jour avec succès' });  // Succès
  });
};
