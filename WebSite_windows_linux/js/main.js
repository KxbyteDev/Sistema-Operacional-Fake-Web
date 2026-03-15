// Sistema Principal
let currentUser = null;
let windows = [];
let selectedDesktopItem = null;
let contextMenuVisible = false;
let startMenuVisible = false;
let loginAttempts = 0;
let shutdownMenuVisible = false;
let notificationCenterVisible = false;
let networkPopupVisible = false;
let volumePopupVisible = false;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Elementos da tela de login
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    
    // Event listeners
    passwordInput.addEventListener('input', function() {
        loginBtn.disabled = this.value.length === 0;
    });
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loginBtn.disabled) {
            attemptLogin();
        }
    });
    
    loginBtn.addEventListener('click', attemptLogin);
    
    // Desktop event listeners
    document.addEventListener('click', function(e) {
        // Fechar menus quando clicar fora
        if (!e.target.closest('#start-btn') && !e.target.closest('#start-menu')) {
            closeStartMenu();
        }
        
        if (!e.target.closest('.shutdown-btn') && !e.target.closest('#shutdown-menu')) {
            closeShutdownMenu();
        }
        
        if (!e.target.closest('.notifications') && !e.target.closest('#notification-center')) {
            closeNotificationCenter();
        }
        
        if (!e.target.closest('.network') && !e.target.closest('#network-popup')) {
            closeNetworkPopup();
        }
        
        if (!e.target.closest('.volume') && !e.target.closest('#volume-popup')) {
            closeVolumePopup();
        }
        
        // Deselecionar ícone se clicar fora
        if (!e.target.closest('.desktop-icon')) {
            if (selectedDesktopItem) {
                selectedDesktopItem.classList.remove('selected');
                selectedDesktopItem = null;
            }
        }
    });
    
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        // Se clicou com direito na área de trabalho
        if (e.target.closest('#desktop-screen') && !e.target.closest('.window')) {
            showContextMenu(e.clientX, e.clientY);
        } else {
            closeContextMenu();
        }
    });
    
    // Botão Iniciar
    document.getElementById('start-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        toggleStartMenu();
    });
    
    // Atualizar relógio
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Mostrar desktop por padrão (para testes)
    // Em produção, começa com tela de login
    // showDesktop();
});

// Funções de Login
function attemptLogin() {
    const password = document.getElementById('password-input').value;
    
    if (password === '12345') {
        // Login bem-sucedido
        loginAttempts = 0;
        showDesktop();
        addNotification('Sistema', 'Bem-vindo ao Hybrid OS');
    } else {
        // Login falhou
        loginAttempts++;
        const input = document.getElementById('password-input');
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 300);
        
        if (loginAttempts >= 3) {
            alert('Muitas tentativas. Tente novamente em 30 segundos.');
            document.getElementById('login-btn').disabled = true;
            setTimeout(() => {
                document.getElementById('login-btn').disabled = false;
                loginAttempts = 0;
            }, 30000);
        }
    }
}

// Navegação entre telas
function showDesktop() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('desktop-screen').classList.add('active');
    
    // Adicionar alguns arquivos iniciais
    setTimeout(() => {
        addNotification('Sistema', 'Desktop carregado com sucesso');
    }, 1000);
}

function showLogin() {
    document.getElementById('desktop-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('password-input').value = '';
    document.getElementById('login-btn').disabled = true;
}

// Funções do Menu Iniciar
function toggleStartMenu() {
    if (startMenuVisible) {
        closeStartMenu();
    } else {
        openStartMenu();
    }
}

function openStartMenu() {
    document.getElementById('start-menu').classList.remove('hidden');
    startMenuVisible = true;
}

function closeStartMenu() {
    document.getElementById('start-menu').classList.add('hidden');
    startMenuVisible = false;
}

// Funções de Data/Hora
function updateDateTime() {
    const now = new Date();
    
    const timeStr = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const dateStr = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    document.getElementById('current-time').textContent = timeStr;
    document.getElementById('current-date').textContent = dateStr;
}

// Funções de Janelas
function createWindow(title, icon, content, width = 600, height = 400) {
    const windowId = 'window-' + Date.now();
    const template = document.getElementById('window-template').cloneNode(true);
    template.id = windowId;
    template.style.width = width + 'px';
    template.style.height = height + 'px';
    template.style.left = (Math.random() * 200 + 100) + 'px';
    template.style.top = (Math.random() * 100 + 50) + 'px';
    
    // Configurar cabeçalho
    template.querySelector('.window-title-text').textContent = title;
    const iconImg = template.querySelector('.window-icon');
    iconImg.src = icon || 'assets/icons/default.svg';
    
    // Configurar conteúdo
    const contentDiv = template.querySelector('.window-content');
    contentDiv.innerHTML = '';
    
    if (typeof content === 'string') {
        // Se é um seletor de template
        const contentTemplate = document.getElementById(content);
        if (contentTemplate) {
            contentDiv.appendChild(contentTemplate.cloneNode(true));
        }
    } else if (content instanceof HTMLElement) {
        contentDiv.appendChild(content);
    }
    
    // Configurar controles
    template.querySelector('.minimize-btn').addEventListener('click', function() {
        minimizeWindow(windowId);
    });
    
    template.querySelector('.maximize-btn').addEventListener('click', function() {
        maximizeWindow(windowId);
    });
    
    template.querySelector('.close-btn').addEventListener('click', function() {
        closeWindow(windowId);
    });
    
    // Tornar arrastável
    makeDraggable(template);
    
    // Adicionar ao container
    document.getElementById('windows-container').appendChild(template);
    
    // Adicionar à lista de janelas
    windows.push({
        id: windowId,
        title: title,
        element: template,
        minimized: false,
        maximized: false
    });
    
    // Adicionar à barra de tarefas
    addToTaskbar(windowId, title, icon);
    
    return windowId;
}

function makeDraggable(element) {
    const header = element.querySelector('.window-header');
    let isDragging = false;
    let offsetX, offsetY;
    
    header.addEventListener('mousedown', function(e) {
        if (e.target.closest('.window-controls')) return;
        
        isDragging = true;
        
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        element.style.cursor = 'grabbing';
        element.style.zIndex = getMaxZIndex() + 1;
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        
        // Limitar à tela
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight - 48; // 48px da taskbar
        
        element.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        element.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'default';
        }
    });
}

function getMaxZIndex() {
    let max = 0;
    document.querySelectorAll('.window').forEach(win => {
        const z = parseInt(win.style.zIndex) || 0;
        max = Math.max(max, z);
    });
    return max;
}

function minimizeWindow(windowId) {
    const window = windows.find(w => w.id === windowId);
    if (window) {
        window.minimized = !window.minimized;
        window.element.style.display = window.minimized ? 'none' : 'flex';
    }
}

function maximizeWindow(windowId) {
    const window = windows.find(w => w.id === windowId);
    if (window) {
        window.maximized = !window.maximized;
        
        if (window.maximized) {
            window.previousStyle = {
                width: window.element.style.width,
                height: window.element.style.height,
                left: window.element.style.left,
                top: window.element.style.top
            };
            
            window.element.style.width = '100%';
            window.element.style.height = 'calc(100% - 48px)';
            window.element.style.left = '0';
            window.element.style.top = '0';
            window.element.classList.add('maximized');
        } else {
            window.element.style.width = window.previousStyle.width;
            window.element.style.height = window.previousStyle.height;
            window.element.style.left = window.previousStyle.left;
            window.element.style.top = window.previousStyle.top;
            window.element.classList.remove('maximized');
        }
    }
}

function closeWindow(windowId) {
    const index = windows.findIndex(w => w.id === windowId);
    if (index !== -1) {
        // Remover da barra de tarefas
        const taskbarIcon = document.getElementById(`taskbar-${windowId}`);
        if (taskbarIcon) taskbarIcon.remove();
        
        // Remover elemento
        windows[index].element.remove();
        windows.splice(index, 1);
    }
}

function addToTaskbar(windowId, title, icon) {
    const taskbarIcons = document.getElementById('taskbar-icons');
    
    const iconElement = document.createElement('div');
    iconElement.id = `taskbar-${windowId}`;
    iconElement.className = 'taskbar-icon';
    iconElement.setAttribute('data-window', windowId);
    iconElement.innerHTML = `<img src="${icon}" alt="${title}" width="24" height="24">`;
    
    iconElement.addEventListener('click', function() {
        const window = windows.find(w => w.id === windowId);
        if (window) {
            if (window.minimized) {
                window.minimized = false;
                window.element.style.display = 'flex';
            } else {
                minimizeWindow(windowId);
            }
        }
    });
    
    taskbarIcons.appendChild(iconElement);
}

// Funções de Aplicativos
function openApp(appName) {
    closeStartMenu();
    
    switch(appName) {
        case 'calculator':
            createWindow('Calculadora', 'assets/icons/calculator.svg', 'calculator-app', 320, 480);
            break;
        case 'notepad':
            createWindow('Bloco de Notas', 'assets/icons/notepad.svg', 'notepad-app', 600, 400);
            break;
        case 'explorer':
        case 'computer':
        case 'documents':
            createWindow('Explorador de Arquivos', 'assets/icons/folder.svg', 'explorer-app', 800, 500);
            break;
        case 'settings':
            createWindow('Configurações', 'assets/icons/settings.svg', 'settings-app', 800, 500);
            break;
        case 'terminal':
            createWindow('Terminal Linux', 'assets/icons/terminal.svg', 'terminal-app', 700, 450);
            break;
        case 'recycle':
            createWindow('Lixeira', 'assets/icons/recycle.svg', 'explorer-app', 700, 450);
            break;
        default:
            addNotification('Sistema', `Aplicativo ${appName} não encontrado`);
    }
}

// Funções do Desktop
function showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
    contextMenuVisible = true;
}

function closeContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
    contextMenuVisible = false;
}

function createNewFolder() {
    const desktop = document.getElementById('desktop-icons');
    
    const folder = document.createElement('div');
    folder.className = 'desktop-icon';
    folder.setAttribute('data-name', 'Nova Pasta');
    folder.setAttribute('data-type', 'folder');
    folder.ondblclick = function() { openApp('explorer'); };
    
    folder.innerHTML = `
        <div class="icon">
            <svg width="48" height="48" viewBox="0 0 24 24">
                <path d="M20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill="#FFD966"/>
            </svg>
        </div>
        <span>Nova Pasta</span>
    `;
    
    desktop.appendChild(folder);
    closeContextMenu();
}

function createNewFile() {
    const desktop = document.getElementById('desktop-icons');
    
    const file = document.createElement('div');
    file.className = 'desktop-icon';
    file.setAttribute('data-name', 'Novo Arquivo.txt');
    file.setAttribute('data-type', 'file');
    file.ondblclick = function() { openApp('notepad'); };
    
    file.innerHTML = `
        <div class="icon">
            <svg width="48" height="48" viewBox="0 0 24 24">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#E6E6E6"/>
                <path d="M14 2V8H20" fill="#C0C0C0"/>
            </svg>
        </div>
        <span>Novo Arquivo.txt</span>
    `;
    
    desktop.appendChild(file);
    closeContextMenu();
}

function refreshDesktop() {
    // Recarregar ícones? Por enquanto só fecha menu
    closeContextMenu();
}

function openProperties() {
    addNotification('Sistema', 'Propriedades da área de trabalho');
    closeContextMenu();
}

// Funções de Sistema
function showShutdownMenu() {
    const menu = document.getElementById('shutdown-menu');
    menu.classList.toggle('hidden');
    shutdownMenuVisible = !shutdownMenuVisible;
}

function closeShutdownMenu() {
    document.getElementById('shutdown-menu').classList.add('hidden');
    shutdownMenuVisible = false;
}

function shutdown() {
    closeShutdownMenu();
    showLogin();
}

function restart() {
    closeShutdownMenu();
    setTimeout(() => {
        showLogin();
    }, 2000);
    
    // Efeito visual de restart
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 2000);
}

function sleep() {
    closeShutdownMenu();
    document.getElementById('desktop-screen').style.filter = 'brightness(0.5)';
    setTimeout(() => {
        document.getElementById('desktop-screen').style.filter = 'brightness(1)';
    }, 3000);
}

// Funções de Notificação
function addNotification(title, message) {
    const notificationsList = document.getElementById('notifications-list');
    const badge = document.querySelector('.notification-badge');
    
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#0078D4">
            <circle cx="12" cy="12" r="10" fill="#0078D4"/>
            <path d="M10 8L16 12L10 16V8Z" fill="white"/>
        </svg>
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
            <small>Agora mesmo</small>
        </div>
    `;
    
    notificationsList.prepend(notification);
    
    // Atualizar badge
    const count = notificationsList.children.length;
    badge.textContent = count;
    badge.classList.remove('hidden');
}

function openNotificationCenter() {
    document.getElementById('notification-center').classList.toggle('hidden');
    notificationCenterVisible = !notificationCenterVisible;
    
    if (notificationCenterVisible) {
        // Resetar badge ao abrir
        document.querySelector('.notification-badge').classList.add('hidden');
    }
}

function closeNotificationCenter() {
    document.getElementById('notification-center').classList.add('hidden');
    notificationCenterVisible = false;
}

function clearNotifications() {
    document.getElementById('notifications-list').innerHTML = '';
    document.querySelector('.notification-badge').classList.add('hidden');
}

// Funções de Rede/Volume
function openNetworkPopup() {
    document.getElementById('network-popup').classList.toggle('hidden');
    networkPopupVisible = !networkPopupVisible;
}

function closeNetworkPopup() {
    document.getElementById('network-popup').classList.add('hidden');
    networkPopupVisible = false;
}

function openVolumePopup() {
    document.getElementById('volume-popup').classList.toggle('hidden');
    volumePopupVisible = !volumePopupVisible;
    
    // Configurar slider
    const slider = document.getElementById('volume-slider');
    const value = document.getElementById('volume-value');
    
    slider.addEventListener('input', function() {
        value.textContent = this.value + '%';
    });
}

function closeVolumePopup() {
    document.getElementById('volume-popup').classList.add('hidden');
    volumePopupVisible = false;
}

function openCalendar() {
    addNotification('Calendário', 'Março 2026');
}

function showDesktop() {
    // Minimizar todas as janelas
    windows.forEach(w => {
        if (!w.minimized) {
            w.minimized = true;
            w.element.style.display = 'none';
        }
    });
}