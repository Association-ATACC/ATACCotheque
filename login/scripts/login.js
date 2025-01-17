const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');
const togglePassword = document.querySelector('.toggle-password');

// Gestion de l'affichage/masquage du mot de passe
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.querySelector('i').classList.toggle('fa-eye');
    this.querySelector('i').classList.toggle('fa-eye-slash');
});

// Gestion de la soumission du formulaire
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = passwordInput.value;

    try {
        const response = await fetch(window.location.origin + '/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const result = await response.text();
            alert(`Success: ${result}`);
            // Stockage du token (à remplacer par un vrai token)
            // localStorage.setItem('adminToken', 'fake-token');
            setTimeout(() => {
                window.location.href = '../admin';
            }, 500);
        } else {
            const error = await response.text();
            alert(error.message);
            // Animation d'erreur
            loginForm.querySelectorAll('input').forEach(input => {
                input.classList.add('error');
                setTimeout(() => input.classList.remove('error'), 500);
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
});