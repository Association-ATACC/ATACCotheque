const form = document.getElementById('contactForm');
const dialog = document.getElementById('messageDialog');
const closeBtn = dialog.querySelector('.close-dialog');
const dialogBtn = dialog.querySelector('.dialog-btn');

// Fonction pour afficher la modale
function showDialog(title, message, isError = false) {
    dialog.querySelector('h3').textContent = title;
    dialog.querySelector('.dialog-body p').textContent = message;
    
    dialog.removeAttribute('data-type');
    
    if (isError) {
        dialog.setAttribute('data-type', 'error');
        dialog.querySelector('.dialog-btn').style.backgroundColor = '#dc3545';
    } else {
        dialog.setAttribute('data-type', 'success');
        dialog.querySelector('.dialog-btn').style.backgroundColor = '#28a745';
    }
    
    dialog.showModal();
}

// Fonction pour fermer la modale
function closeDialog() {
    dialog.close();
}

// Gestion de la soumission du formulaire
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    showDialog("Envoi en cours", "Veuillez patienter pendant l'envoi de votre message...", false);

    fetch(form.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(message => {
        showDialog("Message envoyé !", message, false);
        form.reset();
    })
    .catch(error => {
        showDialog("Erreur", "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer plus tard.", true);
    });
});

// Gestionnaires d'événements pour la modale
closeBtn.addEventListener('click', closeDialog);
dialogBtn.addEventListener('click', closeDialog);
dialog.addEventListener('click', function(e) {
    if (e.target === dialog) closeDialog();
});