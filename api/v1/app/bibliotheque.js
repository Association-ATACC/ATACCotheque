function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function buildTree(fs, path, glob, rootDir) {
    const allPaths = glob.sync('**/*', {
        cwd: rootDir,
        nodir: false,
        dot: true,
    });
    const root = { name: path.basename(rootDir), children: [] };
    const lookup = { '': root };
    allPaths.forEach((relativePath) => {
        const absolutePath = path.join(rootDir, relativePath);
        const stats = fs.statSync(absolutePath);
        if (stats.isDirectory()) {
        const parts = relativePath.split(path.sep);
        let currentNode = root;
        let currentPath = '';
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath = currentPath ? path.join(currentPath, part) : part;
            if (!lookup[currentPath]) {
                const node = { name: part, children: [] };
                lookup[currentPath] = node;
                currentNode.children.push(node);
            }
            currentNode = lookup[currentPath];
        }
        }
    });
    return root.children;
}

function getAllFilesFromPath(fs, path, glob, subPath, rootDir) {
    const absoluteRoot = path.resolve(rootDir);
    const absoluteSubPath = path.resolve(subPath);

    if (!absoluteSubPath.startsWith(absoluteRoot)) {
        throw new Error("Le chemin indiqué est en dehors du dossier racine autorisé");
    }

    if (!fs.existsSync(absoluteSubPath)) {
        throw new Error("Le chemin indiqué n'existe pas, bien qu'il soit dans le dossier racine");
    }

    const allFiles = glob.sync("**/CC.pdf", {
        cwd: absoluteSubPath,
        nodir: true,
        dot: true
    });

    const relativeFiles = allFiles.map(file => path.relative(rootDir, path.join(absoluteSubPath, file)));

    return {
        path: absoluteSubPath,
        files: relativeFiles
    };
}

function creatUrl(niv, fil, mat, type, year) {
    let url = '/';
    if (!niv) {
        return url;
    }
    url += niv;
    if (!fil) {
        return url;
    }
    url += '/' + fil;
    if (!mat) {
        return url;
    }
    url += '/' + mat;
    if (!type) {
        return url;
    }
    url += '/' + type;
    if (!year) {
        return url;
    }
    url += '/' + year;
    return url;
}

module.exports = {
  isValidEmail,
  buildTree,
  getAllFilesFromPath,
  creatUrl
};