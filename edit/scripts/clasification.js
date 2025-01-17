var filiereMatiereMap = {};

const api_path = window.location.origin;

fetch(api_path + '/contents')
    .then(response => response.json())
    .then(data => {
        filiereMatiereMap = data;
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

niveauSelect.addEventListener('change', function () {
  updateFiliereOptions(niveauSelect.value);
});

filiereSelect.addEventListener('change', function () {
  if (filiereSelect.value === 'add-new') {
    document.getElementById('new-filiere').style.display = 'block';
    matiereSelect.value = 'add-new';
    matiereSelect.disabled = false;
    document.getElementById('new-matiere').style.display = 'block';
    typeSelect.value = 'add-new';
    typeSelect.disabled = false;
    document.getElementById('new-type').style.display = 'block';
    dateSelect.value = 'add-new';
    dateSelect.disabled = false;
    document.getElementById('new-date').style.display = 'block';
  } else {
    document.getElementById('new-filiere').style.display = 'none';
    document.getElementById('new-matiere').style.display = 'none';
    document.getElementById('new-type').style.display = 'none';
    document.getElementById('new-date').style.display = 'none';
    updateMatiereOptions(niveauSelect.value, filiereSelect.value);
  }
});

matiereSelect.addEventListener('change', function () {
  if (matiereSelect.value === 'add-new') {
    document.getElementById('new-matiere').style.display = 'block';
    typeSelect.value = 'add-new';
    typeSelect.disabled = false;
    document.getElementById('new-type').style.display = 'block';
    dateSelect.value = 'add-new';
    dateSelect.disabled = false;
    document.getElementById('new-date').style.display = 'block';
  } else {
    document.getElementById('new-matiere').style.display = 'none';
    document.getElementById('new-type').style.display = 'none';
    document.getElementById('new-date').style.display = 'none';
    updateTypeOptions(niveauSelect.value, filiereSelect.value, matiereSelect.value);
  }
});

typeSelect.addEventListener('change', function () {
  if (typeSelect.value === 'add-new') {
    document.getElementById('new-type').style.display = 'block';
    dateSelect.value = 'add-new';
    dateSelect.disabled = false;
    document.getElementById('new-date').style.display = 'block';
  } else {
    document.getElementById('new-type').style.display = 'none';
    document.getElementById('new-date').style.display = 'none';
    updateDateOptions(niveauSelect.value, filiereSelect.value, matiereSelect.value, typeSelect.value);
  }
});

dateSelect.addEventListener('change', function () {
  if (dateSelect.value === 'add-new') {
    document.getElementById('new-date').style.display = 'block';
  } else {
    document.getElementById('new-date').style.display = 'none';
  }
});

function clearSelectExceptDefault(selectElement) {
  for (let i = selectElement.options.length - 1; i > 0; i--) {
    if (selectElement.options[i].value !== 'add-new') {
      selectElement.remove(i);
    }
  }
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
  if (!filiereSelect.disabled && filiereSelect.value !== '') {
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
  if (!matiereSelect.disabled && filiereSelect.value !== '' && matiereSelect.value !== '') {
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
  if (!typeSelect.disabled && filiereSelect.value !== '' && matiereSelect.value !== '' && typeSelect.value !== '') {
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