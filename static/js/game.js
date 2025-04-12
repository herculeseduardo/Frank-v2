class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.player = null;
    this.enemies = [];
    this.bullets = [];
    this.enemyBombs = [];
    this.explosions = [];
    this.score = 0;
    this.power = 0; // Acumulador de poder
    this.maxPower = 100; // Poder máximo
    this.gameState = "paused"; // Estado inicial como pausado
    this.stars = null;
    this.difficultyLevel = 1;
    this.lastDifficultyIncrease = 0;
    this.gameArea = {
      width: 100,
      height: 100
    };
    this.controls = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
    };
    this.settings = {
      playerSpeed: 0.2,
      bulletSpeed: 0.5,
      enemySpeed: 0.1,
      spawnInterval: 2000,
    };

    // Inicializar sistema de áudio
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {
      explosion: null,
      enemyExplosion: null,
      bombExplosion: null,
      shoot: null,
      enemyShoot: null,
      engine: null
    };
    this.activeSounds = []; // Array para controlar sons ativos
    this.loadSounds();

    // Remover sistema de dificuldade progressiva
    this.enemyTypes = [
      {
        name: "Caça",
        color: 0xff0000,
        bombColor: 0xff3333,
        speed: 0.15,
        pointsRequired: 0,
        health: 1,
        scoreValue: 1,
        createGeometry: () => {
          const group = new THREE.Group();
          const body = new THREE.Mesh(
            new THREE.ConeGeometry(1, 2, 4),
            new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 })
          );
          body.rotation.x = Math.PI / 2;
          group.add(body);

          const wingGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
          const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, shininess: 100 });
          
          const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
          leftWing.position.set(-1.5, 0, 0);
          group.add(leftWing);

          const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
          rightWing.position.set(1.5, 0, 0);
          group.add(rightWing);

          return group;
        }
      },
      {
        name: "Bombardeiro",
        color: 0xff9900,
        bombColor: 0xffcc00,
        speed: 0.08,
        pointsRequired: 10,
        health: 2,
        scoreValue: 2,
        createGeometry: () => {
          const group = new THREE.Group();
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 1),
            new THREE.MeshPhongMaterial({ color: 0xff9900, shininess: 100 })
          );
          group.add(body);

          const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
          const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xff9900, shininess: 100 });
          
          const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
          leftWing.position.set(-2, 0, 0);
          group.add(leftWing);

          const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
          rightWing.position.set(2, 0, 0);
          group.add(rightWing);

          return group;
        }
      },
      {
        name: "Interceptor",
        color: 0x00ff00,
        bombColor: 0x33ff33,
        speed: 0.2,
        pointsRequired: 20,
        health: 1,
        scoreValue: 3,
        createGeometry: () => {
          const group = new THREE.Group();
          const body = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.5),
            new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 100 })
          );
          group.add(body);

          const wingGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
          const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, shininess: 100 });
          
          const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
          leftWing.position.set(-1.5, 0, 0);
          group.add(leftWing);

          const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
          rightWing.position.set(1.5, 0, 0);
          group.add(rightWing);

          return group;
        }
      },
      {
        name: "Nave Mãe",
        color: 0x9900ff,
        bombColor: 0xcc33ff,
        speed: 0.05,
        pointsRequired: 30,
        health: 3,
        scoreValue: 5,
        createGeometry: () => {
          const group = new THREE.Group();
          const body = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 16),
            new THREE.MeshPhongMaterial({ color: 0x9900ff, shininess: 100 })
          );
          group.add(body);

          const ringGeometry = new THREE.TorusGeometry(3, 0.3, 16, 32);
          const ringMaterial = new THREE.MeshPhongMaterial({ color: 0x9900ff, shininess: 100 });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2;
          group.add(ring);

          return group;
        }
      }
    ];
  }

  init() {
    // Configurar renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Adicionar fundo estelar
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xFFFFFF,
      size: 0.1,
      transparent: true
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);

    // Configurar câmera com zoom menor
    this.camera.position.z = 80; // Aumentado de 30 para 80
    this.camera.position.y = 0;
    this.camera.lookAt(0, 0, 0);

    // Ajustar área do jogo para o novo zoom
    this.gameArea = {
      width: 100, // Aumentado de 60 para 100
      height: 100  // Aumentado de 60 para 100
    };

    // Criar jogador
    this.createPlayer();

    // Configurar controles
    this.setupControls();

    // Configurar iluminação
    this.setupLighting();

    // Iniciar loop do jogo
    this.gameLoop();

    // Iniciar spawn de inimigos
    this.startEnemySpawn();
  }

  createPlayer() {
    // Criar grupo para a nave
    const ship = new THREE.Group();

    // Corpo principal da nave
    const bodyGeometry = new THREE.ConeGeometry(1, 3, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4169E1, // Azul Royal
      shininess: 100,
      specular: 0xffffff
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    ship.add(body);

    // Asas da nave
    const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4169E1,
      shininess: 100,
      specular: 0xffffff
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-1.5, 0, 0);
    ship.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(1.5, 0, 0);
    ship.add(rightWing);

    // Motor da nave
    const engineGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 8);
    const engineMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(0, -1.5, 0);
    ship.add(engine);

    this.player = ship;
    this.player.position.set(0, -15, 0);
    this.scene.add(this.player);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }

  setupControls() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    document.addEventListener("keyup", (e) => this.handleKeyUp(e));
    window.addEventListener("resize", () => this.handleResize());
  }

  handleKeyDown(e) {
    switch (e.key) {
      case "ArrowLeft":
        this.controls.left = true;
        break;
      case "ArrowRight":
        this.controls.right = true;
        break;
      case "ArrowUp":
        this.controls.up = true;
        break;
      case "ArrowDown":
        this.controls.down = true;
        break;
      case "z":
        this.controls.shoot = true;
        break;
      case "x":
        this.createAtomicBomb(); // Tecla X para ativar a bomba atômica
        break;
      case " ": // Barra de espaço
        if (this.gameState === "paused") {
          this.gameState = "playing";
          const pauseMessage = document.getElementById('pause-message');
          if (pauseMessage) {
            pauseMessage.remove();
          }
        }
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.key) {
      case "ArrowLeft":
        this.controls.left = false;
        break;
      case "ArrowRight":
        this.controls.right = false;
        break;
      case "ArrowUp":
        this.controls.up = false;
        break;
      case "ArrowDown":
        this.controls.down = false;
        break;
      case "z":
        this.controls.shoot = false;
        break;
    }
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  loadSounds() {
    // Carregar sons
    const loadSound = async (url) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    };

    // Criar sons básicos programaticamente
    this.createEngineSound();
    this.createExplosionSound();
    this.createShootSound();
    this.createEnemyShootSound();
  }

  createEngineSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    this.sounds.engine = { oscillator, gainNode };
  }

  createExplosionSound() {
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.sounds.explosion = buffer;
  }

  createShootSound() {
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.sin(i * 0.1) * 0.5;
    }

    this.sounds.shoot = buffer;
  }

  createEnemyShootSound() {
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.sin(i * 0.05) * 0.3;
    }

    this.sounds.enemyShoot = buffer;
  }

  createEnemyExplosionSound() {
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.sin(i * 0.1) * Math.random() * 0.5;
    }

    this.sounds.enemyExplosion = buffer;
  }

  createBombExplosionSound() {
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.sin(i * 0.05) * Math.random() * 0.3;
    }

    this.sounds.bombExplosion = buffer;
  }

  playSound(soundBuffer, volume = 1) {
    if (this.gameState !== "playing") return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = soundBuffer;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start(0);
    
    // Adicionar à lista de sons ativos
    this.activeSounds.push({ source, gainNode });
    
    // Remover da lista quando terminar
    source.onended = () => {
      const index = this.activeSounds.findIndex(s => s.source === source);
      if (index !== -1) {
        this.activeSounds.splice(index, 1);
      }
    };
  }

  stopAllSounds() {
    this.activeSounds.forEach(sound => {
      sound.source.stop();
      sound.gainNode.disconnect();
    });
    this.activeSounds = [];
  }

  createEnemyGroup() {
    // Filtrar tipos de inimigos disponíveis baseado na pontuação
    const availableTypes = this.enemyTypes.filter(type => this.score >= type.pointsRequired);
    if (availableTypes.length === 0) return;

    // Determinar quantos inimigos criar (1 a 3)
    const enemyCount = Math.floor(Math.random() * 3) + 1;
    
    // Criar inimigos
    for (let i = 0; i < enemyCount; i++) {
      // Escolher um tipo aleatório dos disponíveis
      const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const enemyShip = enemyType.createGeometry();
      
      // Posicionar o inimigo aleatoriamente na largura da tela
      const xPosition = (Math.random() - 0.5) * this.gameArea.width;
      const heightOffset = (Math.random() - 0.5) * 5;
      
      enemyShip.position.set(
        xPosition,
        20 + heightOffset,
        0
      );

      enemyShip.enemyType = enemyType;
      enemyShip.health = enemyType.health;
      enemyShip.lastBombTime = 0;
      enemyShip.bombInterval = 3000 + Math.random() * 2000;
      enemyShip.speed = enemyType.speed;

      this.scene.add(enemyShip);
      this.enemies.push(enemyShip);
    }
  }

  createEnemyBomb(x, y, color) {
    // Criar a bomba
    const bombGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
    const bombMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x000000,
      emissive: 0x000000,
      emissiveIntensity: 0.5
    });
    const bomb = new THREE.Mesh(bombGeometry, bombMaterial);
    bomb.rotation.x = Math.PI / 2;
    bomb.position.set(x, y, 0);
    bomb.velocity = new THREE.Vector3(0, -0.1, 0); // Aumentada a velocidade de queda
    bomb.lifetime = 100; // Tempo de vida da bomba em frames

    // Criar rastro de fogo
    const fireTrail = new THREE.Group();
    const particleCount = 10;
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    
    for (let i = 0; i < particleCount; i++) {
      const particleMaterial = new THREE.MeshPhongMaterial({
        color: 0xff6600,
        emissive: 0xff3300,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.8
      });
      
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.2 + Math.random() * 0.3;
      particle.position.set(
        Math.cos(angle) * radius,
        -0.5 - (i * 0.2),
        Math.sin(angle) * radius
      );
      particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        -0.05,
        (Math.random() - 0.5) * 0.02
      );
      fireTrail.add(particle);
    }
    
    bomb.add(fireTrail);
    this.scene.add(bomb);
    this.enemyBombs.push(bomb);
    this.playSound(this.sounds.enemyShoot, 0.3);
  }

  createBullet() {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const bullet = new THREE.Mesh(geometry, material);

    bullet.position.copy(this.player.position);
    bullet.position.y += 2;

    this.scene.add(bullet);
    this.bullets.push(bullet);
    this.playSound(this.sounds.shoot, 0.2);
  }

  createExplosion(x, y, color = 0xff0000, type = 'enemy') {
    const explosion = new THREE.Group();
    const particleCount = 20;
    const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const particleMaterial = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 0.1 + Math.random() * 0.2;
      particle.velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0
      );
      particle.position.set(x, y, 0);
      explosion.add(particle);
    }

    explosion.lifetime = 30;
    this.scene.add(explosion);
    this.explosions.push(explosion);

    // Tocar som apropriado para o tipo de explosão
    switch(type) {
      case 'enemy':
        this.playSound(this.sounds.enemyExplosion, 0.5);
        break;
      case 'bomb':
        this.playSound(this.sounds.bombExplosion, 0.3);
        break;
      case 'player':
        this.playSound(this.sounds.explosion, 0.7);
        break;
    }
  }

  updateExplosions() {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.lifetime--;

      explosion.children.forEach(particle => {
        particle.position.add(particle.velocity);
        particle.material.opacity = explosion.lifetime / 30;
      });

      if (explosion.lifetime <= 0) {
        this.scene.remove(explosion);
        this.explosions.splice(i, 1);
      }
    }
  }

  updatePlayer() {
    if (this.controls.left) this.player.position.x -= this.settings.playerSpeed;
    if (this.controls.right) this.player.position.x += this.settings.playerSpeed;
    if (this.controls.up) this.player.position.y += this.settings.playerSpeed;
    if (this.controls.down) this.player.position.y -= this.settings.playerSpeed;

    // Limitar movimento dentro da nova área do jogo
    this.player.position.x = Math.max(
      -this.gameArea.width/2,
      Math.min(this.gameArea.width/2, this.player.position.x)
    );
    this.player.position.y = Math.max(
      -this.gameArea.height/2,
      Math.min(this.gameArea.height/2, this.player.position.y)
    );

    if (this.controls.shoot) {
      this.createBullet();
      this.controls.shoot = false;
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position.y += this.settings.bulletSpeed;

      // Remover balas fora da tela
      if (bullet.position.y > 25) {
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }

  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.position.y -= enemy.speed;

      const currentTime = Date.now();
      if (currentTime - enemy.lastBombTime > enemy.bombInterval) {
        this.createEnemyBomb(enemy.position.x, enemy.position.y, enemy.enemyType.bombColor);
        enemy.lastBombTime = currentTime;
      }

      if (enemy.position.y < -this.gameArea.height/2) {
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);
      }
    }
  }

  updateEnemyBombs() {
    for (let i = this.enemyBombs.length - 1; i >= 0; i--) {
      const bomb = this.enemyBombs[i];
      bomb.position.add(bomb.velocity);
      bomb.lifetime--;

      // Atualizar partículas do fogo
      bomb.children[0].children.forEach(particle => {
        particle.position.add(particle.velocity);
        particle.material.opacity = bomb.lifetime / 100;
      });

      // Remover bombas fora da tela ou com tempo expirado
      if (bomb.position.y < -25 || bomb.lifetime <= 0) {
        this.scene.remove(bomb);
        this.enemyBombs.splice(i, 1);
      }
    }
  }

  createAtomicBomb() {
    if (this.power >= this.maxPower) {
      // Criar explosão atômica
      const atomicExplosion = new THREE.Group();
      const particleCount = 100;
      const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const particleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.8
      });

      for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = Math.random() * 30;
        const speed = 0.2 + Math.random() * 0.3;
        particle.velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0
        );
        particle.position.set(
          this.player.position.x + Math.cos(angle) * radius,
          this.player.position.y + Math.sin(angle) * radius,
          0
        );
        atomicExplosion.add(particle);
      }

      atomicExplosion.lifetime = 60;
      this.scene.add(atomicExplosion);
      this.explosions.push(atomicExplosion);

      // Destruir todos os inimigos na tela
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        this.createExplosion(enemy.position.x, enemy.position.y, enemy.enemyType.color, 'enemy');
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);
        this.score += 2;
      }

      // Destruir todas as bombas inimigas
      for (let i = this.enemyBombs.length - 1; i >= 0; i--) {
        const bomb = this.enemyBombs[i];
        this.createExplosion(bomb.position.x, bomb.position.y, bomb.material.color.getHex(), 'bomb');
        this.scene.remove(bomb);
        this.enemyBombs.splice(i, 1);
        this.score += 0.5;
      }

      // Resetar o poder
      this.power = 0;
      this.updatePowerDisplay();
      this.playSound(this.sounds.explosion, 1.0);
    }
  }

  updatePowerDisplay() {
    const powerBar = document.getElementById('power-bar');
    if (powerBar) {
      powerBar.style.width = `${(this.power / this.maxPower) * 100}%`;
    }
  }

  checkCollisions() {
    // Colisão entre balas e inimigos
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (bullet.position.distanceTo(enemy.position) < 2) {
          enemy.health--;
          
          if (enemy.health <= 0) {
            this.createExplosion(enemy.position.x, enemy.position.y, enemy.enemyType.color, 'enemy');
            this.scene.remove(enemy);
            this.enemies.splice(j, 1);
            this.score += enemy.enemyType.scoreValue;
            document.getElementById("score").textContent = Math.floor(this.score);
            this.power += 5;
            this.updatePowerDisplay();
            this.playSound(this.sounds.explosion, 0.5);
          }
          
          this.scene.remove(bullet);
          this.bullets.splice(i, 1);
          break;
        }
      }
    }

    // Colisão entre balas e bombas
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      for (let j = this.enemyBombs.length - 1; j >= 0; j--) {
        const bomb = this.enemyBombs[j];
        if (bullet.position.distanceTo(bomb.position) < 1.5) {
          this.createExplosion(bomb.position.x, bomb.position.y, bomb.material.color.getHex(), 'bomb');
          this.scene.remove(bullet);
          this.scene.remove(bomb);
          this.bullets.splice(i, 1);
          this.enemyBombs.splice(j, 1);
          this.score += 0.5;
          document.getElementById("score").textContent = Math.floor(this.score);
          this.power += 2;
          this.updatePowerDisplay();
          break;
        }
      }
    }

    // Colisão entre jogador e inimigos
    for (const enemy of this.enemies) {
      if (this.player.position.distanceTo(enemy.position) < 2) {
        this.createExplosion(this.player.position.x, this.player.position.y, 0x00ff00, 'player');
        this.gameOver();
        break;
      }
    }

    // Colisão entre jogador e bombas
    for (let i = this.enemyBombs.length - 1; i >= 0; i--) {
      const bomb = this.enemyBombs[i];
      if (this.player.position.distanceTo(bomb.position) < 2) {
        this.createExplosion(this.player.position.x, this.player.position.y, 0x00ff00, 'player');
        this.scene.remove(bomb);
        this.enemyBombs.splice(i, 1);
        this.gameOver();
        break;
      }
    }
  }

  gameOver() {
    this.gameState = "gameOver";
    this.stopAllSounds(); // Parar todos os sons ao finalizar o jogo
    
    // Salvar pontuação no ranking
    gameOver(Math.floor(this.score));
    
    // Mostrar o hall da fama diretamente
    rankingSystem.showRanking();
  }

  startEnemySpawn() {
    setInterval(() => {
      if (this.gameState === "playing") {
        // 80% de chance de criar um grupo de inimigos
        if (Math.random() < 0.8) {
          this.createEnemyGroup();
        }
      }
    }, this.settings.spawnInterval);
  }

  gameLoop() {
    if (this.gameState === "playing") {
      this.updatePlayer();
      this.updateBullets();
      this.updateEnemies();
      this.updateEnemyBombs();
      this.updateExplosions();
      this.checkCollisions();

      // Animar as estrelas
      if (this.stars) {
        this.stars.rotation.y += 0.0001;
      }
    } else if (this.gameState === "paused") {
      // Mostrar mensagem de pausa
      if (!document.getElementById('pause-message')) {
        const pauseMessage = document.createElement('div');
        pauseMessage.id = 'pause-message';
        pauseMessage.style.position = 'absolute';
        pauseMessage.style.top = '50%';
        pauseMessage.style.left = '50%';
        pauseMessage.style.transform = 'translate(-50%, -50%)';
        pauseMessage.style.color = 'white';
        pauseMessage.style.fontSize = '24px';
        pauseMessage.style.textAlign = 'center';
        pauseMessage.style.zIndex = '1000';
        pauseMessage.innerHTML = 'Pressione ESPAÇO para começar';
        document.body.appendChild(pauseMessage);
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Inicializar o jogo quando a página carregar
window.addEventListener("load", () => {
  const game = new Game();
  game.init();
});
