// Seleciona todas as células do tabuleiro
const cells = document.querySelectorAll('.cell');
// Elemento para mostrar o status do jogo (vez, vitória, empate)
const statusText = document.querySelector('.status');
// Botão para resetar o jogo
const resetButton = document.querySelector('.reset');
// Botão para voltar ao menu de escolha de modo
const backToMenuButton = document.querySelector('.back-to-menu');
// Botão para modo 2 jogadores
const twoPlayerButton = document.querySelector('.two-player');
// Botão para modo jogador contra IA
const playerVsAiButton = document.querySelector('.player-vs-ai');
// Container do jogo (tabuleiro)
const gameContainer = document.querySelector('.game-container');
// Container do menu de seleção de modo
const gameModeContainer = document.querySelector('.game-mode');
// Sons para vitória e empate
const winSound = new Audio('../sons/ganhou.mp3');
const drawSound = new Audio('../sons/perdeu.mp3');

// Jogador atual (X começa)
let currentPlayer = 'X';
// Estado atual do tabuleiro (array com 9 posições)
let gameState = ['', '', '', '', '', '', '', '', ''];
// Flag para indicar se o jogo está ativo
let isGameActive = true;
// Flag para modo dois jogadores
let isTwoPlayerGame = false;
// Flag para controlar vez da IA
let isAiTurn = false;  

// Combinações vencedoras possíveis
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],   // linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8],   // colunas
    [0, 4, 8], [2, 4, 6]               // diagonais
];

// Verifica se alguém venceu ou deu empate
function checkWinner() {
    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        // Verifica se as três posições têm o mesmo jogador
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            statusText.textContent = `Jogador ${currentPlayer} venceu!`;
            isGameActive = false;
            winSound.play(); // toca som de vitória
            return;
        }
    }

    // Se não há espaços vazios, deu empate
    if (!gameState.includes('')) {
        statusText.textContent = 'Empate!';
        isGameActive = false;
        drawSound.play();  // toca som de empate
    }
}

// Função chamada ao clicar em uma célula
function handleCellClick(event) {
    // Se jogo acabou, célula já preenchida ou é vez da IA (modo jogador único), não faz nada
    if (!isGameActive || gameState[event.target.getAttribute('data-index')] !== '' || (isAiTurn && !isTwoPlayerGame)) {
        return;
    }

    const cell = event.target;
    const index = cell.getAttribute('data-index');
    gameState[index] = currentPlayer;      // Atualiza estado do tabuleiro
    cell.textContent = currentPlayer;      // Mostra o símbolo na célula
    cell.classList.add('taken');           

    checkWinner(); // Verifica se alguém venceu

    if (isGameActive) {
        // Alterna o jogador atual
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusText.textContent = `Vez do jogador ${currentPlayer}`;

        // Se for modo 2 jogadores, apenas retorna para próxima jogada
        if (isTwoPlayerGame) {
            return;
        }

        // Se for vez da IA (jogador O), chama a função da IA com atraso
        if (currentPlayer === 'O') {
            isAiTurn = true;
            setTimeout(aiMove, 500);
        }
    }
}

// Reseta o jogo para o estado inicial
function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    isAiTurn = false;  
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
    });
}

// Seleciona o modo de jogo (dois jogadores ou contra IA)
function selectGameMode(mode) {
    isTwoPlayerGame = mode === 'twoPlayer';
    gameModeContainer.style.display = 'none';  // Esconde o menu
    gameContainer.style.display = 'block';      // Mostra o jogo
    statusText.textContent = `Vez do jogador ${currentPlayer}`;
    gameState = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    isAiTurn = false;  
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
    });
}

// Volta para o menu de seleção de modo
function backToMenu() {
    gameModeContainer.style.display = 'block';  
    gameContainer.style.display = 'none';  
}

// Função que executa a jogada da IA usando Minimax
function aiMove() {
    const bestMove = minimax(gameState, 0, true);
    const bestMoveIndex = bestMove.index;

    gameState[bestMoveIndex] = 'O';
    cells[bestMoveIndex].textContent = 'O';
    cells[bestMoveIndex].classList.add('taken');
    
    checkWinner();

    if (isGameActive) {
        currentPlayer = 'X';
        statusText.textContent = `Vez do jogador ${currentPlayer}`;
    }

    isAiTurn = false;  
}

// Algoritmo Minimax para escolher a melhor jogada para a IA
function minimax(board, depth, isMaximizing) {
    const scores = {
        'X': -10,  
        'O': 10,  
        'tie': 0   
    };

    const winner = checkGameState(board);
    if (winner !== null) {
        return { score: scores[winner] };
    }

    const availableMoves = getAvailableMoves(board);
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            board[move] = 'O';  // IA joga O
            const result = minimax(board, depth + 1, false);
            board[move] = '';  // desfaz jogada
            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = { index: move, score: bestScore };
            }
        }
        return bestMove;
    } else {
        let bestScore = Infinity;
        let bestMove = null;
        
        for (let i = 0; i < availableMoves.length; i++) {
            const move = availableMoves[i];
            board[move] = 'X';  // Jogador joga X
            const result = minimax(board, depth + 1, true);
            board[move] = '';   // desfaz jogada
            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = { index: move, score: bestScore };
            }
        }
        return bestMove;
    }
}

// Verifica o estado atual do tabuleiro: vencedor, empate ou jogo em andamento
function checkGameState(board) {
    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];  // Retorna o vencedor ('X' ou 'O')
        }
    }

    if (board.includes('')) {
        return null;  // Jogo ainda não terminou
    }

    return 'tie';  // Empate
}

// Retorna os índices das células vazias no tabuleiro
function getAvailableMoves(board) {
    return board.map((value, index) => value === '' ? index : null).filter(val => val !== null);
}

// Adiciona eventos de clique para cada célula do tabuleiro
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
// Evento para resetar o jogo
resetButton.addEventListener('click', resetGame);
// Evento para voltar ao menu
backToMenuButton.addEventListener('click', backToMenu);
// Evento para selecionar modo dois jogadores
twoPlayerButton.addEventListener('click', () => selectGameMode('twoPlayer'));
// Evento para selecionar modo jogador vs IA
playerVsAiButton.addEventListener('click', () => selectGameMode('ai'));
