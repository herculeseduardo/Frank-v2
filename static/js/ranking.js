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
        const showRankingButton = document.getElementById('show-ranking-button');

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

        showRankingButton.addEventListener('click', () => {
            this.showRanking();
        });
    }

    startGame(nickname) {
        this.currentPlayer = {
            nickname,
            score: 0,
            date: new Date().toISOString()
        };

        document.getElementById('welcome-screen').style.display = 'none';
        // Iniciar o jogo aqui
        startGame();
    }

    updateScore(score) {
        if (this.currentPlayer) {
            this.currentPlayer.score = score;
        }
    }

    saveScore() {
        if (!this.currentPlayer) return;

        // Verificar se já existe um score para este nickname
        const existingPlayerIndex = this.ranking.findIndex(
            player => player.nickname === this.currentPlayer.nickname
        );

        if (existingPlayerIndex !== -1) {
            // Se o novo score for maior, atualiza
            if (this.currentPlayer.score > this.ranking[existingPlayerIndex].score) {
                this.ranking[existingPlayerIndex] = this.currentPlayer;
            }
        } else {
            // Adiciona novo jogador ao ranking
            this.ranking.push(this.currentPlayer);
        }

        // Ordena o ranking por score
        this.ranking.sort((a, b) => b.score - a.score);
        
        // Mantém apenas os 10 melhores
        this.ranking = this.ranking.slice(0, 10);

        // Salva no localStorage
        localStorage.setItem('ranking', JSON.stringify(this.ranking));

        this.showRanking();
    }

    showRanking() {
        const rankingModal = document.getElementById('ranking-modal');
        const rankingItems = document.getElementById('ranking-items');
        
        rankingItems.innerHTML = '';

        if (this.ranking.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'ranking-item empty-message';
            emptyMessage.innerHTML = `
                <div class="empty-message-content">
                    <i class="star-icon">⭐</i>
                    <p>Nenhuma pontuação registrada ainda.</p>
                    <p>Jogue e seja o primeiro no ranking!</p>
                </div>
            `;
            rankingItems.appendChild(emptyMessage);
        } else {
            this.ranking.forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'ranking-item';
                
                // Adiciona classes diferentes para os três primeiros colocados
                if (index === 0) {
                    item.classList.add('first-place');
                } else if (index === 1) {
                    item.classList.add('second-place');
                } else if (index === 2) {
                    item.classList.add('third-place');
                }

                const date = new Date(player.date);
                const formattedDate = date.toLocaleDateString('pt-BR');
                
                item.innerHTML = `
                    <div class="ranking-position">
                        <span class="position-number">${index + 1}º</span>
                        <div class="player-info">
                            <span class="player-name">${player.nickname}</span>
                            <span class="player-date">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="player-score">
                        <span class="score-value">${player.score}</span>
                        <span class="score-label">pontos</span>
                    </div>
                `;
                rankingItems.appendChild(item);
            });
        }

        rankingModal.style.display = 'flex';
    }

    hideRanking() {
        document.getElementById('ranking-modal').style.display = 'none';
    }
}

// Inicializar o sistema de ranking
const rankingSystem = new RankingSystem();

// Função para ser chamada quando o jogo terminar
function gameOver(score) {
    rankingSystem.updateScore(score);
    rankingSystem.saveScore();
} 