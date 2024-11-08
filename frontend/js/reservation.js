// Fonction pour envoyer la requête de création de réservation
document.getElementById('reservationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const reservationData = {
        statut_reservation: document.getElementById('statut_reservation').value,
        datereservation: document.getElementById('datereservation').value,
        heurereservation: document.getElementById('heurereservation').value,
        id_client: document.getElementById('clientId').value,
        id_voyage: document.getElementById('voyageId').value,
        id_paiement: document.getElementById('paiementId').value,
        nombrePlaces: document.getElementById('nombrePlaces').value,  // Vérifier que cette ligne prend bien la valeur du champ
        classe: document.getElementById('classe').value,  // Vérifier que cette ligne prend bien la valeur du champ
    };
    

    // Envoi de la requête POST au backend pour créer la réservation
    fetch('http://localhost:3000/api/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Réservation créée avec succès') {
            alert('Réservation créée avec succès');
            // Optionnel : Réinitialiser le formulaire
            document.getElementById('reservationForm').reset();
            getAllReservations(); // Recharger la liste des réservations
        } else {
            alert('Erreur lors de la création de la réservation');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    });
});

// Fonction pour consulter toutes les réservations et les afficher dans un tableau
// Fonction pour consulter toutes les réservations et les afficher dans un tableau
function getAllReservations() {
    fetch('http://localhost:3000/api/reservations')
    .then(response => response.json())
    .then(data => {
        const reservationsList = document.getElementById('reservationsList');
        reservationsList.innerHTML = ''; // Réinitialiser la liste des réservations

        // Vérifier si les données sont bien un tableau
        if (Array.isArray(data)) {
            data.forEach(reservation => {
                // Vérifiez si les propriétés sont présentes dans la réponse
                const nombrePlaces = reservation.nombrePlaces || 'Non spécifié';
                const classe = reservation.classe || 'Non spécifié';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${reservation.id_reservation}</td>
                    <td>${reservation.statut_reservation}</td>
                    <td>${reservation.datereservation}</td>
                    <td>${reservation.heurereservation}</td>
                    <td>${reservation.id_client}</td>
                    <td>${reservation.id_voyage}</td>
                    <td>${reservation.id_paiement}</td>
                    <td>${nombrePlaces}</td>
                    <td>${classe}</td>
                `;
                reservationsList.appendChild(tr);
            });
        } else {
            console.error('Les données reçues ne sont pas un tableau:', data);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
    });
}

// Appel de la fonction pour afficher toutes les réservations au chargement de la page
window.onload = getAllReservations;
