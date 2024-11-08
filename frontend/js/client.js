document.getElementById('clientForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const clientData = {
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        telephone: document.getElementById('telephone').value,
        cni: document.getElementById('cni').value
    };

    fetch('http://localhost:3000/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Client ajouté avec succès');
        } else {
            alert('Erreur lors de l\'ajout du client');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    });
});
