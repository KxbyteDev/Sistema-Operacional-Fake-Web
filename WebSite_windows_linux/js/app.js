// Aplicativos Específicos

// Calculadora
function initCalculator(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    const display = window.querySelector('.calculator-display');
    const buttons = window.querySelectorAll('.calc-btn');
    
    let currentValue = '0';
    let previousValue = '';
    let operation = null;
    let shouldResetDisplay = false;
    
    function updateDisplay() {
        display.textContent = currentValue;
    }
    
    function handleNumber(num) {
        if (shouldResetDisplay) {
            currentValue = num;
            shouldResetDisplay = false;
        } else {
            currentValue = currentValue === '0' ? num : currentValue + num;
        }
        updateDisplay();
    }
    
    function handleOperator(op) {
        if (operation !== null) {
            calculate();
        }
        
        previousValue = currentValue;
        operation = op;
        shouldResetDisplay = true;
    }
    
    function calculate() {
        let result = 0;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);
        
        switch(operation) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': 
                if (current === 0) {
                    result = 'Erro';
                } else {
                    result = prev / current;
                }
                break;
            case '%': result = prev % current; break;
            default: return;
        }
        
        currentValue = result.toString();
        operation = null;
        shouldResetDisplay = true;
        updateDisplay();
    }
    
    function clear() {
        currentValue = '0';
        previousValue = '';
        operation = null;
        updateDisplay();
    }
    
    function backspace() {
        if (currentValue.length > 1) {
            currentValue = currentValue.slice(0, -1);
        } else {
            currentValue = '0';
        }
        updateDisplay();
    }
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.textContent;
            
            if (value >= '0' && value <= '9' || value === '.') {
                handleNumber(value);
            } else if (value === 'C') {
                clear();
            } else if (value === '⌫') {
                backspace();
            } else if (value === '=') {
                calculate();
            } else {
                handleOperator(value);
            }
        });
    });
}

// Bloco de Notas
function initNotepad(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    const textarea = window.querySelector('.notepad-content');
    const status = window.querySelector('.notepad-status');
    
    textarea.addEventListener('input', function() {
        const lines = this.value.split('\n').length;
        const cursorPos = this.selectionStart;
        const lineCount = this.value.substr(0, cursorPos).split('\n').length;
        const colCount = cursorPos - this.value.lastIndexOf('\n', cursorPos - 1);
        
        status.textContent = `Linha ${lineCount}, Coluna ${colCount}`;
    });
    
    textarea.addEventListener('keyup', function(e) {
        const lines = this.value.split('\n').length;
        const cursorPos = this.selectionStart;
        const lineCount = this.value.substr(0, cursorPos).split('\n').length;
        const colCount = cursorPos - this.value.lastIndexOf('\n', cursorPos - 1);
        
        status.textContent = `Linha ${lineCount}, Coluna ${colCount}`;
    });
}

// Explorador de Arquivos
function initExplorer(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    const folders = window.querySelectorAll('.folder-item');
    const files = window.querySelectorAll('.file-item');
    
    folders.forEach(folder => {
        folder.addEventListener('dblclick', function() {
            addNotification('Explorador', 'Abrindo pasta...');
        });
    });
    
    files.forEach(file => {
        file.addEventListener('dblclick', function() {
            const fileName = this.querySelector('span').textContent;
            
            if (fileName.endsWith('.txt')) {
                const notepadId = createWindow('Bloco de Notas - ' + fileName, 'assets/icons/notepad.svg', 'notepad-app', 600, 400);
                setTimeout(() => initNotepad(notepadId), 100);
            } else {
                addNotification('Explorador', 'Abrindo arquivo: ' + fileName);
            }
        });
    });
}

// Configurações
function initSettings(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    const categories = window.querySelectorAll('.settings-category');
    const pages = window.querySelectorAll('.settings-page');
    
    categories.forEach(category => {
        category.addEventListener('click', function() {
            // Remover active de todas
            categories.forEach(c => c.classList.remove('active'));
            pages.forEach(p => p.classList.add('hidden'));
            
            // Ativar selecionada
            this.classList.add('active');
            const categoryName = this.getAttribute('data-category');
            document.getElementById('settings-' + categoryName).classList.remove('hidden');
        });
    });
}

// Terminal Linux
function initTerminal(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    const terminalBody = window.querySelector('#terminal-body');
    const input = window.querySelector('#terminal-input');
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.textContent.trim();
            executeTerminalCommand(command, terminalBody);
            this.textContent = '';
            
            // Nova linha
            const newLine = document.createElement('div');
            newLine.className = 'terminal-line';
            newLine.innerHTML = 'joão@hybrid-os:~$ <span contenteditable="true" class="terminal-input" id="terminal-input"></span>';
            terminalBody.appendChild(newLine);
            
            // Focar no novo input
            const newInput = terminalBody.querySelector('#terminal-input:last-child');
            if (newInput) newInput.focus();
        }
    });
}

function executeTerminalCommand(command, terminalBody) {
    const output = document.createElement('div');
    output.className = 'terminal-line';
    
    switch(command.toLowerCase()) {
        case 'help':
            output.innerHTML = 'Comandos disponíveis: help, ls, clear, date, whoami, sudo (fake)';
            break;
        case 'ls':
            output.innerHTML = 'Documentos  Downloads  Imagens  Músicas  Vídeos  Desktop';
            break;
        case 'clear':
            terminalBody.innerHTML = '';
            return;
        case 'date':
            output.innerHTML = new Date().toString();
            break;
        case 'whoami':
            output.innerHTML = 'joão';
            break;
        case 'sudo':
            output.innerHTML = 'sudo: comando não encontrado (modo simulação)';
            break;
        default:
            if (command.startsWith('echo ')) {
                output.innerHTML = command.substring(5);
            } else if (command) {
                output.innerHTML = `comando não encontrado: ${command}`;
            } else {
                return;
            }
    }
    
    terminalBody.appendChild(output);
}

// Inicializar apps quando as janelas forem criadas
document.addEventListener('windowCreated', function(e) {
    const windowId = e.detail.windowId;
    const appType = e.detail.appType;
    
    switch(appType) {
        case 'calculator-app':
            initCalculator(windowId);
            break;
        case 'notepad-app':
            initNotepad(windowId);
            break;
        case 'explorer-app':
            initExplorer(windowId);
            break;
        case 'settings-app':
            initSettings(windowId);
            break;
        case 'terminal-app':
            initTerminal(windowId);
            break;
    }
});

// Sobrescrever createWindow para disparar evento
const originalCreateWindow = createWindow;
createWindow = function(title, icon, content, width, height) {
    const windowId = originalCreateWindow(title, icon, content, width, height);
    
    // Disparar evento de criação
    const event = new CustomEvent('windowCreated', {
        detail: {
            windowId: windowId,
            appType: content
        }
    });
    document.dispatchEvent(event);
    
    return windowId;
};