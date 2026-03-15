// Sistema de Arquivos Virtual
const fileSystem = {
    root: {
        name: 'Este Computador',
        type: 'drive',
        children: {
            'Documentos': {
                name: 'Documentos',
                type: 'folder',
                children: {
                    'trabalho.docx': {
                        name: 'trabalho.docx',
                        type: 'file',
                        size: '24 KB',
                        modified: new Date(2026, 2, 10),
                        content: 'Conteúdo do documento...'
                    },
                    'relatorio.txt': {
                        name: 'relatorio.txt',
                        type: 'file',
                        size: '5 KB',
                        modified: new Date(2026, 2, 15),
                        content: 'Relatório mensal...'
                    }
                }
            },
            'Downloads': {
                name: 'Downloads',
                type: 'folder',
                children: {
                    'instalador.exe': {
                        name: 'instalador.exe',
                        type: 'file',
                        size: '2.5 MB',
                        modified: new Date(2026, 2, 12)
                    }
                }
            },
            'Imagens': {
                name: 'Imagens',
                type: 'folder',
                children: {
                    'foto.jpg': {
                        name: 'foto.jpg',
                        type: 'file',
                        size: '1.2 MB',
                        modified: new Date(2026, 2, 5)
                    }
                }
            },
            'Músicas': {
                name: 'Músicas',
                type: 'folder',
                children: {
                    'musica.mp3': {
                        name: 'musica.mp3',
                        type: 'file',
                        size: '3.8 MB',
                        modified: new Date(2026, 2, 8)
                    }
                }
            },
            'Vídeos': {
                name: 'Vídeos',
                type: 'folder',
                children: {}
            },
            'Desktop': {
                name: 'Desktop',
                type: 'folder',
                children: {}
            }
        }
    },
    
    // Estatísticas de disco
    diskInfo: {
        total: '2 TB',
        used: '187 GB',
        free: '1.8 TB',
        usedPercent: 9
    },
    
    // Métodos do sistema de arquivos
    getFolderContents: function(path) {
        let current = this.root;
        const parts = path.split('/').filter(p => p);
        
        for (const part of parts) {
            if (current.children && current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }
        
        return current.children || {};
    },
    
    createFolder: function(path, folderName) {
        const parent = this.getFolderContents(path);
        if (parent && !parent[folderName]) {
            parent[folderName] = {
                name: folderName,
                type: 'folder',
                children: {},
                created: new Date()
            };
            return true;
        }
        return false;
    },
    
    createFile: function(path, fileName, content = '') {
        const parent = this.getFolderContents(path);
        if (parent && !parent[fileName]) {
            parent[fileName] = {
                name: fileName,
                type: 'file',
                size: content.length + ' bytes',
                modified: new Date(),
                content: content
            };
            return true;
        }
        return false;
    },
    
    deleteItem: function(path, itemName) {
        const parent = this.getFolderContents(path);
        if (parent && parent[itemName]) {
            // Mover para lixeira em vez de deletar permanentemente
            this.moveToRecycleBin(path, itemName, parent[itemName]);
            delete parent[itemName];
            return true;
        }
        return false;
    },
    
    // Lixeira
    recycleBin: {
        items: [],
        
        add: function(item, originalPath) {
            this.items.push({
                ...item,
                originalPath: originalPath,
                deletedAt: new Date()
            });
        },
        
        restore: function(itemName) {
            const index = this.items.findIndex(i => i.name === itemName);
            if (index !== -1) {
                const item = this.items[index];
                // Restaurar ao caminho original
                const parent = fileSystem.getFolderContents(item.originalPath);
                if (parent) {
                    parent[item.name] = item;
                    this.items.splice(index, 1);
                }
            }
        },
        
        empty: function() {
            this.items = [];
        }
    },
    
    moveToRecycleBin: function(path, itemName, item) {
        this.recycleBin.add(item, path);
    },
    
    // Formatar tamanho de arquivo
    formatSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Carregar do localStorage se disponível
function loadFileSystem() {
    const saved = localStorage.getItem('hybridos_filesystem');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(fileSystem.root, parsed.root);
            Object.assign(fileSystem.recycleBin, parsed.recycleBin);
        } catch (e) {
            console.error('Erro ao carregar sistema de arquivos:', e);
        }
    }
}

// Salvar no localStorage
function saveFileSystem() {
    const toSave = {
        root: fileSystem.root,
        recycleBin: fileSystem.recycleBin
    };
    localStorage.setItem('hybridos_filesystem', JSON.stringify(toSave));
}

// Inicializar
loadFileSystem();

// Salvar a cada 30 segundos
setInterval(saveFileSystem, 30000);

// Salvar ao fechar a página
window.addEventListener('beforeunload', saveFileSystem);

// Exportar funções para uso global
window.fileSystem = fileSystem;
window.saveFileSystem = saveFileSystem;