const editForm = document.getElementById('editForm');
const cancelBtn = document.getElementById('cancelBtn');
const deleteBtn = document.getElementById('deleteBtn');
const confirmDialog = document.getElementById('confirmDialog');
const closeDialog = confirmDialog.querySelector('.close-dialog');
const cancelDialogBtn = confirmDialog.querySelector('.cancel');
const confirmDialogBtn = confirmDialog.querySelector('.confirm');
const downloadPdfBtn = document.getElementById('downloadPdf');
const responseDialog = document.getElementById('responseDialog');
const responseDialogMessage = responseDialog.querySelector('.dialog-body p');
const responseDialogCloseBtn = responseDialog.querySelector('.close-dialog');
let pdfFilePath = '';

// Charger les données de l'annale (simulation)
loadAnnaleData();

// Gestion du formulaire
editForm.addEventListener('submit', function(e) {
    e.preventDefault();
    showConfirmDialog(
        'Voulez-vous enregistrer les modifications ?',
        function() {
            const data = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                niveau: document.getElementById('filter-niveau').value === 'add-new' ? document.getElementById('new-niveau').value : document.getElementById('filter-niveau').value,
                filiere: document.getElementById('filter-filiere').value === 'add-new' ? document.getElementById('new-filiere').value : document.getElementById('filter-filiere').value,
                matiere: document.getElementById('filter-matiere').value === 'add-new' ? document.getElementById('new-matiere').value : document.getElementById('filter-matiere').value,
                type: document.getElementById('filter-type').value === 'add-new' ? document.getElementById('new-type').value : document.getElementById('filter-type').value,
                date: document.getElementById('filter-date').value === 'add-new' ? document.getElementById('new-date').value : document.getElementById('filter-date').value,
                pdfFilePath: pdfFilePath
            };

            fetch(window.location.origin + '/save-annale', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(async response => {
                if (!response.ok) {                    
                    throw new Error(await response.text());
                }
                return response.json();
            })
            .then(_ => {
                showResponseDialog('Modifications sauvegardées avec succès');
            })
            .catch(error => {
                showResponseDialog('Erreur: ' + error);
            });
        }
    );
});

// Bouton Annuler
cancelBtn.addEventListener('click', function() {
    showConfirmDialog(
        'Voulez-vous annuler les modifications ?',
        function() {
            window.location.href = '../';
        }
    );
});

// Bouton Supprimer
deleteBtn.addEventListener('click', function() {
    const pdfViewer = document.getElementById('pdfViewer');
    showConfirmDialog(
        'Voulez-vous vraiment supprimer cette annale ?',
        function() {
            // Simulation de suppression
            console.log('Annale supprimée');
            pdfFilePath = pdfViewer.src;
            if (pdfFilePath) {
                
                fetch(window.location.origin + `/delete-file?file=${encodeURIComponent(pdfFilePath)}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur lors de la suppression du fichier');
                    }
                    console.log('Fichier supprimé du serveur:', pdfViewer.src);
                    window.location.href = '../';
                })
                .catch(error => {
                    console.error(error.message);
                    alert(error.message);
                });
            } else {
                window.location.href = '../';
            }
        }
    );
});

// Bouton Télécharger
downloadPdfBtn.addEventListener('click', function() {
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfUrl = pdfViewer.src;
    if (pdfUrl) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'document.pdf';
        link.click();
    }
});

// Gestion de la boîte de dialogue
function showConfirmDialog(message, onConfirm) {
    confirmDialog.querySelector('.dialog-body p').textContent = message;
    confirmDialog.showModal();

    confirmDialogBtn.onclick = function() {
        onConfirm();
        confirmDialog.close();
    };
}

[closeDialog, cancelDialogBtn].forEach(btn => {
    btn.addEventListener('click', () => confirmDialog.close());
});

responseDialogCloseBtn.addEventListener('click', () => responseDialog.close());

function showResponseDialog(message) {
    responseDialogMessage.textContent = message;
    responseDialog.showModal();
}

// Simulation de chargement des données
function loadAnnaleData() {
    // récupére le lien le path de l'annale pending dans l'url
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has('file')) {
        window.location.href = '../';
    }
    const file = searchParams.get('file');
    fetch(window.location.origin + '/pending-annale/file=' + file)
        .then(response => response.json())
        .then(response => {
            const annaleData = response;
            document.getElementById('title').value = annaleData.title;
            document.getElementById('description').value = annaleData.description;
            document.getElementById('pdfViewer').src = `${window.location.origin}/uploads/temp/${file}/` + response.files[0];
            loadAuxiliaryDocs(annaleData.files.slice(1));
        })
        .catch(error => console.error('Error fetching data:', error))
}

function loadAuxiliaryDocs(files) {
    const auxiliaryDocsContainer = document.getElementById('auxiliaryDocs');
    auxiliaryDocsContainer.innerHTML = '';

    files.forEach(file => {
        const docItem = document.createElement('div');
        docItem.classList.add('auxiliary-doc-item');

        const docInfo = document.createElement('div');
        docInfo.classList.add('doc-info');

        const formGroupTitle = document.createElement('div');
        formGroupTitle.classList.add('form-group');
        const labelTitle = document.createElement('label');
        labelTitle.textContent = 'Titre du document';
        const inputTitle = document.createElement('input');
        inputTitle.type = 'text';
        inputTitle.classList.add('doc-title');
        inputTitle.name = 'auxiliary_title[]';
        inputTitle.required = true;
        formGroupTitle.appendChild(labelTitle);
        formGroupTitle.appendChild(inputTitle);

        const formGroupFile = document.createElement('div');
        formGroupFile.classList.add('form-group');
        const labelFile = document.createElement('label');
        labelFile.textContent = 'Fichier PDF';
        const fileInputWrapper = document.createElement('div');
        fileInputWrapper.classList.add('file-input-wrapper');
        const inputFile = document.createElement('input');
        inputFile.type = 'file';
        inputFile.classList.add('doc-file');
        inputFile.name = 'auxiliary_file[]';
        inputFile.accept = 'application/pdf';
        const fileNameSpan = document.createElement('span');
        fileNameSpan.classList.add('file-name');
        fileNameSpan.textContent = file.split('/').pop();
        fileInputWrapper.appendChild(inputFile);
        fileInputWrapper.appendChild(fileNameSpan);
        formGroupFile.appendChild(labelFile);
        formGroupFile.appendChild(fileInputWrapper);

        docInfo.appendChild(formGroupTitle);
        docInfo.appendChild(formGroupFile);

        const docPreview = document.createElement('div');
        docPreview.classList.add('doc-preview');
        const iframe = document.createElement('iframe');
        iframe.src = window.location.origin + file;
        iframe.title = 'Aperçu du document auxiliaire';
        docPreview.appendChild(iframe);

        const docActions = document.createElement('div');
        docActions.classList.add('doc-actions');
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('btn-remove');
        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Supprimer';
        removeBtn.addEventListener('click', function() {
            showConfirmDialog(
                'Voulez-vous vraiment supprimer ce document auxiliaire ?',
                function() {
                    // Simulation de suppression
                    console.log('Document auxiliaire supprimé:', file);
                    docItem.remove();
                    // Envoyer une requête pour supprimer le fichier du serveur
                    fetch(`${window.location.origin}/delete-file?file=${encodeURIComponent(file)}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Erreur lors de la suppression du fichier');
                        }
                        console.log('Fichier supprimé du serveur:', file);
                    })
                    .catch(error => console.error('Erreur:', error));
                }
            );
        });
        docActions.appendChild(removeBtn);

        docItem.appendChild(docInfo);
        docItem.appendChild(docPreview);
        docItem.appendChild(docActions);

        auxiliaryDocsContainer.appendChild(docItem);
    });
}