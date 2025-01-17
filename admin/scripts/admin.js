fetch(window.location.origin + '/pending-annales')
    .then(response => response.json())
    .then(data => {
        const pendingSection = document.getElementById('pendingSection');
        const template = document.getElementById('template-card');
        data.forEach(item => {
            const cpy = template.cloneNode(true);
            cpy.style = '';

            // correspond a la date de soumission de l'annale
            const num = item.files[0].split('/')[2];

            const submissionDate = new Date(parseInt(num));
            cpy.querySelector('.soumision-date').appendChild(document.createTextNode(submissionDate.toLocaleDateString()));
            cpy.querySelector('.titre-annale').appendChild(document.createTextNode(item.title));
            cpy.querySelector('.date-annale').appendChild(document.createTextNode(item.year));
            cpy.querySelector('.desc-annale').appendChild(document.createTextNode(item.description));
            cpy.querySelector('.type-annale').appendChild(document.createTextNode(item.type));
            cpy.querySelector('.btn-accept').onclick = () => {
                // continu pour ce deplacer sur la page edit
                window.location.href = `/edit?file=${num}`;
            };
            cpy.querySelector('.preview-pdf').src = window.location.origin + '/' + item.files[0];
            pendingSection.appendChild(cpy);
        });
    })
    .catch(error => console.error('Error fetching pending annales:', error));