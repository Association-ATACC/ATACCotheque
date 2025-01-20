const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const glob = require('glob');
const fs = require('fs');
const multer = require('multer');
const dotenv = require('dotenv');
const session = require('express-session');

const { isValidEmail, buildTree, getAllFilesFromPath, creatUrl } = require('./bibliotheque');

const app = express();

const envPath = path.join(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Environment variables loaded from .env file');
} else {
  console.error('Error: .env file not found');
  process.exit();
}

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 99999999999
  }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', (req, res, next) => {
  res.status(403).send('Access denied');
});

app.use('/cache', (req, res, next) => {
  res.status(403).send('Access denied');
});

app.use((req, res, next) => {
  const rootDir = path.join(__dirname, '../../../');
  const requestedPath = path.join(rootDir, req.path);
  if (!requestedPath.startsWith(rootDir)) {
    return res.status(403).send('Access denied');
  }
  next();
});

app.use(
  "/",
  function (req, res, next) {
    if ((req.path === '/admin/' || req.path === '/edit/') &&
      !req.session.isAuthenticated) {
      res.redirect('/login');
    } else {
      next();
    }
  },
  express.static(path.join(__dirname, '../../../')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../cache');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

function isAuthenticated(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  } else {
    res.redirect('/login');
  }
}


app.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  const allowedSubjects = ['question', 'suggestion', 'probleme', 'autre'];

  if (!name || !email || !subject || !message) {
    return res.status(400).send(
      'Erreur: Tous les champs (nom, email, sujet, message) sont requis.');
  }

  if (!allowedSubjects.includes(subject)) {
    return res.status(400).send(
      'Erreur: Le sujet sélectionné est invalide.');
  }

  if (!isValidEmail(email)) {
    return res.status(400).send('Erreur: L\'email envoyé n\'est pas valide.');
  }

  res.send('Merci pour votre message, nous vous répondrons bientôt!');
});

app.get('/contents', async (req, res) => {
  try {
    const tree = buildTree(fs, path, glob, '../../content');
    return res.status(200).json(tree);
  } catch (error) {
    return res.status(500).send('Erreur: Impossible de récupérer le contenu.');
  }
});

app.get('/search', async (req, res) => {
  const { niveau, filiere, matiere, type, annee } = req.query;

  const url = creatUrl(niveau, filiere, matiere, type, annee);

  try {
    const tree = getAllFilesFromPath(fs, path, glob, '../../content' + url, '../../content');
    return res.status(200).json(tree);
  } catch (error) {
    return res.status(500).send(`Erreur: ${error.message}.`);
  }
});

app.get('/auxilary-documents', async (req, res) => {
  const { path: dirPath } = req.query;
  const fullPath = '../../content/' + dirPath;

  try {
    const files = fs.readdirSync(fullPath);
    const auxFiles = files.filter(file => file !== 'CC.pdf');

    if (auxFiles.length > 0) {
      return res.status(200).json({ files: auxFiles.map(file => path.join(dirPath, file)) });
    } else {
      return res.status(200).json({ message: 'Aucun document auxiliaire trouvé.' });
    }
  } catch (error) {
    return res.status(500).send(`Erreur: ${error.message}.`);
  }
});

app.post('/add-annale', upload.array('files', 3), (req, res) => {
  const { title, year, type, description } = req.body;
  const files = req.files;

  if (!title || !year || !type || !description || !files || files.length === 0) {
    files.forEach(f => fs.unlinkSync(f.path));
    return res.redirect('/ajouter-annale?message=Erreur: Tous les champs (titre, année, type, description) et au moins un fichier PDF sont requis.&type=error');
  }

  if (isNaN(year) || year < 2010 || year > 2030) {
    files.forEach(f => fs.unlinkSync(f.path));
    return res.redirect('/ajouter-annale?message=Erreur: L\'année doit être comprise entre 2010 et 2030.&type=error');
  }

  const allowedTypes = ['CC1', 'CC2', 'CC3', 'Examen', 'ESC', 'TP'];
  if (!allowedTypes.includes(type)) {
    files.forEach(f => fs.unlinkSync(f.path));
    return res.redirect('/ajouter-annale?message=Erreur: Le type de document est invalide.&type=error');
  }

  for (const file of files) {
    if (file.mimetype !== 'application/pdf') {
      files.forEach(f => fs.unlinkSync(f.path));
      return res.redirect('/ajouter-annale?message=Erreur: Seuls les fichiers PDF sont acceptés.&type=error');
    }
    if (file.size > 20 * 1024 * 1024) {
      files.forEach(f => fs.unlinkSync(f.path));
      return res.redirect('/ajouter-annale?message=Erreur: La taille maximale du fichier est de 20MB.&type=error');
    }
  }

  const annaleData = {
    title,
    year,
    type,
    description,
    files: files.map(file => file.filename),
    status: 'pending'
  };

  let annaleDir = path.join(__dirname, '../../../uploads/temp', `${Date.now()}`);

  while (fs.existsSync(annaleDir)) {
    annaleDir = path.join(__dirname, '../../../uploads/temp', `${Date.now()}`);
  }

  fs.mkdirSync(annaleDir, { recursive: true });

  const annalePath = path.join(annaleDir, 'annale.json');
  fs.writeFileSync(annalePath, JSON.stringify(annaleData, null, 2));

  files.forEach(file => {
    const newPath = path.join(annaleDir, file.filename);
    fs.renameSync(file.path, newPath);
  });

  res.redirect('/ajouter-annale?message=Votre annale a été soumise avec succès et sera examinée par un administrateur.&type=success');
});

app.delete('/delete-file', isAuthenticated, (req, res) => {
  const filePath = path.join(__dirname, '../../../', req.query.file.replace('http://localhost:3000/', ''));
  const folderPath = filePath.split('/').slice(0, -1).join('/');

  if (filePath.startsWith(path.join(__dirname, '../../..//uploads/temp')) && fs.existsSync(folderPath)) {
    fs.rmdirSync(folderPath, { recursive: true });
    return res.status(200).send('Fichier supprimé avec succès.');
  } else {
    return res.status(404).send('Erreur: Fichier non trouvé.');
  }
});

app.post('/save-annale', isAuthenticated, (req, res) => {
  const { title, description, niveau, filiere, matiere, type, date, pdfFilePath } = req.body;

  if (!title || !description || !niveau || !filiere || !matiere || !type || !date || !pdfFilePath) {
    return res.status(400).send('Tous les champs sont requis.');
  }

  const annaleDir = path.join(__dirname, '../../../content/', niveau, filiere, matiere, type, date);
  const pdfPath = path.join(annaleDir, 'CC.pdf');

  if (fs.existsSync(pdfPath)) {
    return res.status(400).send('Une annale existe déjà à cet emplacement.');
  }

  fs.mkdirSync(annaleDir, { recursive: true });

  const oldPath = path.join(__dirname, '../../../', pdfFilePath);
  fs.renameSync(oldPath, pdfPath);

  const annaleData = {
    title,
    description,
    niveau,
    filiere,
    matiere,
    type,
    date,
    files: ['CC.pdf']
  };

  const annalePath = path.join(annaleDir, 'annale.json');
  fs.writeFileSync(annalePath, JSON.stringify(annaleData, null, 2));

  const parentDir = path.dirname(oldPath);
  // supprime tous les fichiers restants dans le dossier temp
  const remainingFiles = fs.readdirSync(parentDir);
  remainingFiles.forEach(file => {
    const filePath = path.join(parentDir, file);
    fs.unlinkSync(filePath);
  });
  fs.rmdirSync(parentDir);

  res.status(200).send(JSON.stringify({ 200: 'Annale sauvegardée avec succès.' }));
});

app.get('/pending-annales', isAuthenticated, (_, res) => {
  const pendingAnnalesDir = path.join(__dirname, '../../../uploads/temp');
  const pendingAnnales = [];

  if (fs.existsSync(pendingAnnalesDir)) {
    const annaleDirs = fs.readdirSync(pendingAnnalesDir);
    annaleDirs.forEach(dir => {
      const annalePath = path.join(pendingAnnalesDir, dir, 'annale.json');
      if (fs.existsSync(annalePath)) {
        const annaleData = JSON.parse(fs.readFileSync(annalePath, 'utf8'));
        if (annaleData.status === 'pending') {
          annaleData.files = annaleData.files.map(file => path.relative(path.join(__dirname, '../../../'), path.join(pendingAnnalesDir, dir, file)));
          pendingAnnales.push(annaleData);
        }
      }
    });
  }

  res.status(200).json(pendingAnnales);
});

app.get('/pending-annale/:file', isAuthenticated, (req, res) => {
  const file = req.params.file.split('=')[1]; // Retrieve the file parameter
  const filePath = path.join(__dirname, '../../../uploads/temp', file, 'annale.json');

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Erreur: Fichier non trouvé.');
  }

  res.sendFile(filePath);
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;
    return res.status(200).send('Connexion réussie.');
  } else {
    return res.status(401).send('Erreur: Nom d\'utilisateur ou mot de passe incorrect.');
  }
});

app.use((_, res) => {
  res.status(404).sendFile(path.join(__dirname, '../../../404.html'));
});

app.listen(process.env.PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${process.env.PORT}`);
});