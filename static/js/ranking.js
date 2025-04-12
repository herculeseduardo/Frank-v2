class RankingSystem {
    constructor() {
        this.ranking = JSON.parse(localStorage.getItem('ranking')) || [];
        this.currentPlayer = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        const startButton = document.getElementById('start-button');
        const nicknameInput = document.getElementById('nickname-input');
        const closeRanking = document.getElementById('close-ranking');

        startButton.addEventListener('click', () => {
            const nickname = nicknameInput.value.trim();
            if (nickname) {
                this.startGame(nickname);
            } else {
                alert('Por favor, digite um nickname válido!');
            }
        });

        closeRanking.addEventListener('click', () => {
            this.hideRanking();
        });
    }

    async startGame(nickname) {
        try {
            // Verificar se o nickname já existe para este IP
            const response = await fetch('/check-nickname', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nickname })
            });

            const data = await response.json();
            
            if (data.exists) {
                alert('Este nickname já está em uso. Por favor, escolha outro.');
                return;
            }

            this.currentPlayer = {
                nickname,
                score: 0,
                date: new Date().toISOString()
            };

            document.getElementById('welcome-screen').style.display = 'none';
            // Iniciar o jogo aqui
            startGame();
        } catch (error) {
            console.error('Erro ao verificar nickname:', error);
            alert('Erro ao verificar nickname. Tente novamente.');
        }
    }

    updateScore(score) {
        if (this.currentPlayer) {
            this.currentPlayer.score = score;
        }
    }

    async saveScore() {
        if (!this.currentPlayer) return;

        try {
            const response = await fetch('/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentPlayer)
            });

            if (response.ok) {
                this.showRanking();
            }
        } catch (error) {
            console.error('Erro ao salvar pontuação:', error);
        }
    }

    showRanking() {
        const rankingModal = document.getElementById('ranking-modal');
        const rankingItems = document.getElementById('ranking-items');
        
        // Buscar ranking atualizado do servidor
        this.fetchRanking().then(ranking => {
            rankingItems.innerHTML = '';
            ranking.forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                item.innerHTML = `
                    <span>${index + 1}. ${player.nickname}</span>
                    <span>${player.score} pontos</span>
                `;
                rankingItems.appendChild(item);
            });
        });

        rankingModal.style.display = 'flex';
    }

    hideRanking() {
        document.getElementById('ranking-modal').style.display = 'none';
    }

    async fetchRanking() {
        try {
            const response = await fetch('/get-ranking');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            return [];
        }
    }
}

// Inicializar o sistema de ranking
const rankingSystem = new RankingSystem();

// Função para ser chamada quando o jogo terminar
function gameOver(score) {
    rankingSystem.updateScore(score);
    rankingSystem.saveScore();
} 