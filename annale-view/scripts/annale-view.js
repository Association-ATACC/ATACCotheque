const iframe = document.getElementById('iframe-pdf');
const dl_btn = document.getElementById('download-pdf');
const year_pdf = document.getElementById('year-pdf');
const title_pdf = document.getElementById('title-pdf');
const date_pdf = document.getElementById('date-publi');
const name_pdf = document.getElementById('pdf-name');
const size = document.getElementById('taille-pdf');
const share_btn = document.querySelector('.btn-share');

const related = document.getElementById('template-related');
const related_contain = document.querySelector('.related-grid');

const url = new URL(window.location.href);
const option = url.searchParams.get('path');
if (option) {
  iframe.src = `../content/${option}`;
  dl_btn.href = `../content/${option}`;
  year_pdf.appendChild(document.createTextNode(option.split('/')[4]));
  title_pdf.appendChild(document.createTextNode(`${option.split('/')[3]} ${option.split('/')[2]} ${option.split('/')[1]}`));

  getPdfInfo(`../content/${option}`)
    .then(info => {
      date_pdf.appendChild(document.createTextNode(info.lastModified));
      size.appendChild(document.createTextNode(info.fileSizeMb + ' Mo'));
      name_pdf.appendChild(document.createTextNode(option.split('/')[5]));
    })
    .catch(console.error);

  fetch(`${window.location.origin}/auxilary-documents?path=${option.split('/').slice(0, -1).join('/')}`)
    .then(res => res.json())
    .then(data => {
      if (data.files && data.files.length > 0) {
        data.files.forEach(file => {
          const copy_related = related.cloneNode(true);
          copy_related.style.display = 'block';
          copy_related.querySelector('.related-link').href = `../content/${file}`;
          copy_related.querySelector('.related-title').appendChild(
            document.createTextNode(file.split('/').pop()));
          copy_related.querySelector('.related-desc').appendChild(
            document.createTextNode('Autre document auxiliaire'));
          related_contain.appendChild(copy_related);
        });
      } else {
        related_contain.appendChild(document.createElement('p'))
          .appendChild(
            document.createTextNode('Aucun document auxiliaire trouvé.')); 
      }
    })
    .catch(console.error);
}

share_btn.addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      text: 'Consultez ce document sur ATACCothèque',
      url: window.location.href
    }).catch(console.error);
  } else {
    alert('Le partage n\'est pas supporté par votre navigateur.');
  }
});

async function getPdfInfo(url) {
  const response = await fetch(url, { method: 'HEAD' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const lastModifiedHeader = response.headers.get('last-modified');
  const contentLengthHeader = response.headers.get('content-length');

  const info = {
    lastModified: null,
    fileSizeMb: null
  };

  if (lastModifiedHeader) {
    const dateObj = new Date(lastModifiedHeader);
    // Format : "jeudi 13 janvier 2023"
    info.lastModified = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (contentLengthHeader) {
    const sizeInBytes = Number(contentLengthHeader);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    info.fileSizeMb = sizeInMB.toFixed(2); 
  }

  return info;
}