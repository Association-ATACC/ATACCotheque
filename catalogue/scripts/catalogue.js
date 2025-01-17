var filiereMatiereMap = {};

const loadingIndicator = document.getElementById('loading');
const filters = document.querySelector('.filters');
const api_path = window.location.origin;

loadingIndicator.style.display = 'block';
filters.style.display = 'none';

fetch(api_path + '/contents')
    .then(response => response.json())
    .then(data => {
        filiereMatiereMap = data;
        loadingIndicator.style.display = 'none';
        filters.style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        loadingIndicator.textContent = 'Erreur de chargement des données.';
    });

const niveauSelect = document.getElementById('filter-niveau');
const filiereGroup = document.getElementById('filiere-group');
const filiereSelect = document.getElementById('filter-filiere');
const matiereGroup = document.getElementById('matiere-group');
const matiereSelect = document.getElementById('filter-matiere');
const typeGroup = document.getElementById('filter-type-group');
const typeSelect = document.getElementById('filter-type');
const dateGroup = document.getElementById('date-group');
const dateSelect = document.getElementById('filter-date');

const searchButton = document.getElementById('searchBtn');
const count = document.getElementById('count');
const container = document.getElementById('catalogueGrid');
const template = document.getElementById('template-annale');

const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageNumbersContainer = document.querySelector('.page-numbers');
const sortSelect = document.getElementById('sort');

let currentPage = 1;
const itemsPerPage = 10;
const maxPageNumbersToShow = 5;
let currentFiles = [];

searchButton.addEventListener('click', function () {
    const niveau = niveauSelect.value;
    const filiere = filiereSelect.value;
    const matiere = matiereSelect.value;
    const type = typeSelect.value;
    const date = dateSelect.value;

    let url = api_path + '/search?';
    if (niveau) url += `niveau=${niveau}&`;
    if (filiere) url += `filiere=${filiere}&`;
    if (matiere) url += `matiere=${matiere}&`;
    if (type) url += `type=${type}&`;
    if (date) url += `annee=${date}&`;

    url = url.slice(-1) === '&' ? url.slice(0, -1) : url;
    changeCatalogue(url, 1);
});

niveauSelect.addEventListener('change', function () {
    const niveau = niveauSelect.value;
    updateFiliereOptions(niveau);
});

filiereSelect.addEventListener('change', function () {
    const niveau = niveauSelect.value;
    const filiere = filiereSelect.value;
    updateMatiereOptions(niveau, filiere);
});

matiereSelect.addEventListener('change', function () {
    const niveau = niveauSelect.value;
    const filiere = filiereSelect.value;
    const matiere = matiereSelect.value;
    updateTypeOptions(niveau, filiere, matiere);
});

typeSelect.addEventListener('change', function () {
    const niveau = niveauSelect.value;
    const filiere = filiereSelect.value;
    const matiere = matiereSelect.value;
    const type = typeSelect.value;
    updateDateOptions(niveau, filiere, matiere, type);
});

sortSelect.addEventListener('change', function () {
    updateCatalogue();
});

prevPageButton.addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        updateCatalogue();
    }
});

nextPageButton.addEventListener('click', function () {
    currentPage++;
    updateCatalogue();
});

function sortFiles(files, sortBy) {
    return files.sort((a, b) => {
        const aContent = a.split('/');
        const bContent = b.split('/');
        
        switch (sortBy) {
            case 'date-desc':
                return bContent[4] - aContent[4];
            case 'date-asc':
                return aContent[4] - bContent[4];
            case 'titre':
                return aContent[2].localeCompare(bContent[2]);
            default:
                return 0;
        }
    });
}

function changeCatalogue(url, page) {
    loadingIndicator.style.display = 'block';
    container.innerHTML = ''; // Clear previous results

    fetch(url)
        .then(response => response.json())
        .then(data => {
            currentFiles = data.files;
            sortFiles(currentFiles, sortSelect.value);
            count.textContent = currentFiles.length;
            const totalPages = Math.ceil(currentFiles.length / itemsPerPage);
            currentPage = page;
            updatePagination(totalPages);
            displayPage(currentFiles, currentPage, itemsPerPage);
            loadingIndicator.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            loadingIndicator.textContent = 'Erreur de chargement des données.';
        });
}

function displayPage(files, page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageFiles = files.slice(start, end);

    for (const file of pageFiles) {
        const content = file.split('/');
        const cpy = template.cloneNode(true);
        cpy.style = '';
        
        cpy.querySelector('.document-type')
            .appendChild(document.createTextNode(content[3]));
        cpy.querySelector('.title-annale')
            .appendChild(document.createTextNode(`${content[0]} ${content[1]} ${content[2]}`));
        cpy.querySelector('.year')
            .appendChild(document.createTextNode(content[4]));
        cpy.querySelector('.semester').appendChild(document.createTextNode(content[3]));
        cpy.querySelector('.btn-view').href = `../annale-view?path=${file}`;
        container.appendChild(cpy);
    }
}

function updatePagination(totalPages) {
    pageNumbersContainer.innerHTML = '';

    const startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
        const pageNumberButton = document.createElement('button');
        pageNumberButton.classList.add('page-number');
        if (i === currentPage) {
            pageNumberButton.classList.add('active');
        }
        pageNumberButton.textContent = i;
        pageNumberButton.addEventListener('click', function () {
            currentPage = i;
            updateCatalogue();
        });
        pageNumbersContainer.appendChild(pageNumberButton);
    }

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

function updateCatalogue() {
    const niveau = niveauSelect.value;
    const filiere = filiereSelect.value;
    const matiere = matiereSelect.value;
    const type = typeSelect.value;
    const date = dateSelect.value;

    let url = api_path + '/search?';
    if (niveau) url += `niveau=${niveau}&`;
    if (filiere) url += `filiere=${filiere}&`;
    if (matiere) url += `matiere=${matiere}&`;
    if (type) url += `type=${type}&`;
    if (date) url += `annee=${date}&`;

    url = url.slice(-1) === '&' ? url.slice(0, -1) : url;
    changeCatalogue(url, currentPage);
}

// Initial request to load all data
changeCatalogue(api_path + '/search', 1);

function clearSelectExceptDefault(selectElement) {
    for (let i = selectElement.options.length - 1; i > 0; i--) {
        selectElement.remove(i);
    }
}

function removeAllExceptTemplate(container) {
    const children = Array.from(container.children);
    children.forEach(child => {
      if (child.id !== 'template') {
        container.removeChild(child);
      }
    });
  }
  

function updateFiliereOptions(niveau) {
    clearSelectExceptDefault(filiereSelect);
    
    const v = filiereMatiereMap.find(item => item.name === niveau);
    if (v) {
        for (const elt of v.children) {
            const option = document.createElement('option');
            option.value = elt.name;
            option.appendChild(document.createTextNode(elt.name));
                
            filiereSelect.appendChild(option);
        }
        filiereGroup.classList.remove('disabled');
        filiereSelect.disabled = false;
        return;
    }
    filiereGroup.classList.add('disabled');
    filiereSelect.disabled = true;
    matiereGroup.classList.add('disabled');
    matiereSelect.disabled = true;
    typeGroup.classList.add('disabled');
    typeSelect.disabled = true;
    dateGroup.classList.add('disabled');
    dateSelect.disabled = true;
}

function updateMatiereOptions(niveau, filiere) {
    clearSelectExceptDefault(matiereSelect);
    if (!filiereSelect.disabled) {
        const v = filiereMatiereMap.find(item => item.name === niveau).children
            .find(item => item.name === filiere);
        if (v) {
            for (const elt of v.children) {
                const option = document.createElement('option');
                option.value = elt.name;
                option.appendChild(document.createTextNode(elt.name));
                    
                matiereSelect.appendChild(option);
            }
    
            matiereGroup.classList.remove('disabled');
            matiereSelect.disabled = false;
            return;
        }
    }
    matiereGroup.classList.add('disabled');
    matiereSelect.disabled = true;
    typeGroup.classList.add('disabled');
    typeSelect.disabled = true;
    dateGroup.classList.add('disabled');
    dateSelect.disabled = true;
}

function updateTypeOptions(niveau, filiere, matiere) {
    clearSelectExceptDefault(typeSelect);
    if (!matiereSelect.disabled) {
        const v = filiereMatiereMap.find(item => item.name === niveau).children
            .find(item => item.name === filiere).children
            .find(item => item.name === matiere);
        if (v) {
            for (const elt of v.children) {
                const option = document.createElement('option');
                option.value = elt.name;
                option.appendChild(document.createTextNode(elt.name));
                    
                typeSelect.appendChild(option);
            }
    
            typeGroup.classList.remove('disabled');
            typeSelect.disabled = false;
            return;
        }
    }
    typeGroup.classList.add('disabled');
    typeSelect.disabled = true;
    dateGroup.classList.add('disabled');
    dateSelect.disabled = true;
}

function updateDateOptions(niveau, filiere, matiere, type) {
    clearSelectExceptDefault(dateSelect);
    if (!typeSelect.disabled) {
        const v = filiereMatiereMap.find(item => item.name === niveau).children
            .find(item => item.name === filiere).children
            .find(item => item.name === matiere).children
            .find(item => item.name === type);
        if (v) {
            for (const elt of v.children) {
                const option = document.createElement('option');
                option.value = elt.name;
                option.appendChild(document.createTextNode(elt.name));
                    
                dateSelect.appendChild(option);
            }
    
            dateGroup.classList.remove('disabled');
            dateSelect.disabled = false;
            return;
        }
    }
    dateGroup.classList.add('disabled');
    dateSelect.disabled = true;
}