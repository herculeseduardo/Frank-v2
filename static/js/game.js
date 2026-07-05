class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    // Corredor de voo (estilo Star Fox): x/y limitam a nave, z é a profundidade
    this.gameArea = {
      width: 56,
      height: 32,
      depth: 320 // distância do horizonte onde os inimigos nascem
    };
    this.lastShotTime = 0;
    this.reticle = null;
    this.ground = null;
    this.groundOffset = 0;
    this.controls = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
    };
    this.settings = {
      playerSpeed: 0.5,
      bulletSpeed: 4,
      enemySpeed: 0.1,
      shotCooldown: 180, // cadência do tiro contínuo (ms)
      spawnInterval: 2000,
      baseSpeed: 0.1, // Velocidade base
      speedIncrease: 0.01, // Incremento de velocidade
      speedInterval: 10000, // Intervalo para aumentar velocidade (10 segundos)
    };

    // Novas propriedades para a estrela brilhante
    this.powerStar = null;
    this.powerStarSpawnTime = 0;
    this.powerStarSpawnInterval = 30000; // 30 segundos
    this.currentBulletType = 0; // Tipo de tiro atual (0-4)
    this.bulletTypes = [
      {
        name: "Normal",
        color: 0xffff00,
        size: 0.5,
        speed: 0.5,
        damage: 1,
        create: (position) => this.createNormalBullet(position)
      },
      {
        name: "Laser",
        color: 0xff0000,
        size: 0.3,
        speed: 0.8,
        damage: 2,
        create: (position) => this.createLaserBullet(position)
      },
      {
        name: "Plasma",
        color: 0x00ff00,
        size: 0.7,
        speed: 0.4,
        damage: 3,
        create: (position) => this.createPlasmaBullet(position)
      },
      {
        name: "Raios",
        color: 0x00ffff,
        size: 0.4,
        speed: 0.6,
        damage: 2,
        create: (position) => this.createLightningBullet(position)
      },
      {
        name: "Explosivo",
        color: 0xff9900,
        size: 0.6,
        speed: 0.3,
        damage: 4,
        create: (position) => this.createExplosiveBullet(position)
      }
    ];

    // Inicializar sistema de áudio
    this.audioSystem = Frank.audio.createAudioContext();
    this.sounds = this.audioSystem.sounds;
    this.activeSounds = []; // Array para controlar sons ativos

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
    // Configurar renderer (fundo transparente para deixar a nebulosa CSS aparecer)
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    document.body.appendChild(this.renderer.domElement);

    // Usar o utilitário de UI do Frank para criar a interface do jogo
    this.ui = Frank.ui.createGameUI();

    // Adicionar fundo estelar usando o utilitário de geometria do Frank
    this.stars = Frank.geometry.createStarfield(this.scene, {
      count: 10000,
      depth: 2000
    });

    // Câmera atrás da nave (estilo Star Fox), olhando para o horizonte
    this.camera.position.set(0, 6, 20);
    this.camera.lookAt(0, 0, -80);

    // Criar jogador usando utilitários do Frank
    this.createPlayer();

    // Retícula de mira à frente da nave
    this.createReticle();

    // Chão em grade estilo synthwave
    this.createSynthwaveGround();

    // Configurar controles
    this.setupControls();

    // Configurar iluminação
    this.setupLighting();

    // Iniciar loop do jogo
    this.gameLoop();

    // Iniciar spawn de inimigos
    this.startEnemySpawn();

    // Iniciar aumento progressivo de velocidade
    this.startSpeedIncrease();
  }

  createPlayer() {
    // Usar o utilitário de geometria do Frank para criar a nave do jogador
    this.player = Frank.geometry.createPlayerShip(this.scene, {
      color: 0x4169E1, // Azul Royal
      position: { x: 0, y: 0, z: 0 },
      scale: 1
    });
    // Virar o nariz da nave para dentro da tela (direção -z)
    this.player.rotation.y = Math.PI;
  }

  createReticle() {
    this.reticle = new THREE.Group();

    const makeMaterial = () => new THREE.MeshBasicMaterial({
      color: 0x6ef3ff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthTest: false
    });

    // Anel próximo
    const nearRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.3, 32), makeMaterial());
    nearRing.position.z = -20;
    nearRing.renderOrder = 999;
    this.reticle.add(nearRing);

    // Anel distante (menor, marca a linha de tiro no fundo)
    const farRing = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 32), makeMaterial());
    farRing.position.z = -60;
    farRing.renderOrder = 999;
    this.reticle.add(farRing);

    // Ponto central
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), makeMaterial());
    dot.position.z = -60;
    dot.renderOrder = 999;
    this.reticle.add(dot);

    this.scene.add(this.reticle);
  }

  updateReticle() {
    if (!this.reticle) return;

    // A retícula acompanha a nave, projetada à frente na linha de tiro
    this.reticle.position.copy(this.player.position);

    // Trava de mira: magenta quando há inimigo alinhado com a linha de tiro
    let locked = false;
    for (const enemy of this.enemies) {
      const dx = enemy.position.x - this.player.position.x;
      const dy = enemy.position.y - this.player.position.y;
      if (enemy.position.z < this.player.position.z && Math.sqrt(dx * dx + dy * dy) < 3.5) {
        locked = true;
        break;
      }
    }

    const color = locked ? 0xff3d81 : 0x6ef3ff;
    this.reticle.children.forEach(part => part.material.color.setHex(color));

    const pulse = locked ? 1 + Math.sin(Date.now() * 0.02) * 0.1 : 1;
    this.reticle.scale.set(pulse, pulse, 1);
  }

  createSynthwaveGround() {
    this.ground = new THREE.Group();

    const size = 800;
    const divisions = 40;
    this.groundCell = size / divisions;

    // Grade magenta estilo synthwave
    const grid = new THREE.GridHelper(size, divisions, 0xff3d81, 0xff3d81);
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    this.ground.add(grid);

    // Plano escuro por baixo da grade para dar corpo ao chão
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ color: 0x0a0a24, transparent: true, opacity: 0.75 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.3;
    this.ground.add(plane);

    this.ground.position.set(0, -18, -200);
    this.scene.add(this.ground);
  }

  updateGround() {
    if (!this.ground) return;

    // Rolagem contínua em direção à câmera (sensação de velocidade)
    this.groundOffset += 0.9 + (this.settings.baseSpeed - 0.1) * 4;
    this.ground.position.z = -200 + (this.groundOffset % this.groundCell);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    // Luzes de contorno neon (ciano por baixo, magenta por cima)
    const cyanLight = new THREE.PointLight(0x6ef3ff, 0.7, 250);
    cyanLight.position.set(0, -40, 40);
    this.scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff3d81, 0.5, 300);
    magentaLight.position.set(0, 60, 30);
    this.scene.add(magentaLight);
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
    // Esta função pode ser simplificada usando o Frank.js
    // Os sons já foram criados pelo audioSystem
  }

  playSound(soundBuffer, volume = 1) {
    if (this.gameState !== "playing") return;
    
    // Usar o sistema de áudio do Frank
    const soundInfo = this.audioSystem.playSound(soundBuffer, volume * 2);
    
    // Adicionar à lista de sons ativos
    this.activeSounds.push(soundInfo);
    
    // Remover da lista quando terminar
    soundInfo.source.onended = () => {
      const index = this.activeSounds.findIndex(s => s.source === soundInfo.source);
      if (index !== -1) {
        this.activeSounds.splice(index, 1);
      }
    };
  }

  stopAllSounds() {
    // Parar todos os sons ativos
    this.activeSounds.forEach(sound => {
      sound.source.stop();
      sound.gainNode.disconnect();
    });
    this.activeSounds = [];

    // Parar o som do motor
    if (this.sounds.engine) {
      this.sounds.engine.oscillator.stop();
      this.sounds.engine.gainNode.disconnect();
    }
  }

  createEnemyGroup() {
    // Filtrar tipos de inimigos disponíveis baseado na pontuação
    const availableTypes = this.enemyTypes.filter(type => this.score >= type.pointsRequired);
    if (availableTypes.length === 0) return;

    // Determinar quantos inimigos criar (1 a 3)
    const enemyCount = Math.floor(Math.random() * 3) + 1;
    
    // Criar inimigos usando utilitários do Frank
    for (let i = 0; i < enemyCount; i++) {
      // Escolher um tipo aleatório dos disponíveis
      const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      let enemyTypeStr = 'fighter'; // tipo padrão
      
      // Mapear o tipo de inimigo do jogo para o tipo de inimigo do Frank
      switch(enemyType.name) {
        case 'Caça': enemyTypeStr = 'fighter'; break;
        case 'Bombardeiro': enemyTypeStr = 'bomber'; break;
        case 'Interceptor': enemyTypeStr = 'interceptor'; break;
        case 'Nave Mãe': enemyTypeStr = 'mothership'; break;
      }
      
      // Nascer sempre no horizonte (fundo do corredor), nunca no meio da tela
      const xPosition = (Math.random() - 0.5) * this.gameArea.width;
      const yPosition = (Math.random() - 0.3) * this.gameArea.height * 0.6;
      const zPosition = -this.gameArea.depth + (Math.random() - 0.5) * 60;

      // Criar o inimigo usando o Frank.js
      const enemyShip = Frank.geometry.createEnemyShip(this.scene, enemyTypeStr, {
        color: enemyType.color,
        position: {
          x: xPosition,
          y: yPosition,
          z: zPosition
        }
      });

      // Adicionar propriedades necessárias para a lógica do jogo
      enemyShip.enemyType = enemyType;
      enemyShip.health = enemyType.health;
      enemyShip.lastBombTime = 0;
      enemyShip.bombInterval = 4000 + Math.random() * 3000;
      enemyShip.speed = enemyType.speed;

      this.enemies.push(enemyShip);
    }
  }

  createEnemyBomb(enemy) {
    // Mirar a bomba na posição atual do jogador
    // (mais lenta que os inimigos para dar tempo de desviar)
    const direction = this.player.position.clone()
      .sub(enemy.position)
      .normalize()
      .multiplyScalar(0.55 + this.settings.baseSpeed);

    const bomb = Frank.geometry.createProjectile(this.scene, 'mine', {
      color: enemy.enemyType.bombColor,
      position: { x: enemy.position.x, y: enemy.position.y, z: enemy.position.z },
      velocity: { x: direction.x, y: direction.y, z: direction.z }
    });

    bomb.lifetime = 400;
    this.enemyBombs.push(bomb);
    this.playSound(this.sounds.enemyShoot, 0.4);
  }

  createBullet() {
    const bulletType = this.bulletTypes[this.currentBulletType];
    const bullet = bulletType.create(this.player.position);
    this.scene.add(bullet);
    this.bullets.push(bullet);
    this.playSound(this.sounds.shoot, 0.2);
  }

  createExplosion(x, y, color = 0xff0000, type = 'enemy') {
    // Usar o utilitário do Frank para criar explosões
    const explosion = Frank.geometry.createExplosion(this.scene, {
      color: color,
      position: { x: x, y: y, z: 0 },
      particleCount: 20,
      lifetime: 30,
      scale: 1
    });

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

    // Inclinar a nave ao manobrar (rolagem lateral e arfagem)
    const targetRoll = (this.controls.left ? -0.55 : 0) + (this.controls.right ? 0.55 : 0);
    const targetPitch = (this.controls.up ? -0.3 : 0) + (this.controls.down ? 0.3 : 0);
    this.player.rotation.z += (targetRoll - this.player.rotation.z) * 0.15;
    this.player.rotation.x += (targetPitch - this.player.rotation.x) * 0.15;

    // Usar o utilitário do Frank para limitar o movimento
    Frank.physics.constrainToGameArea(this.player, this.gameArea);

    // Tiro contínuo: segurar Z dispara com cadência fixa
    if (this.controls.shoot) {
      const now = Date.now();
      if (now - this.lastShotTime >= this.settings.shotCooldown) {
        this.createBullet();
        this.lastShotTime = now;
      }
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.position.z -= this.settings.bulletSpeed;

      // Remover balas que passaram do horizonte
      if (bullet.position.z < -this.gameArea.depth - 50) {
        this.scene.remove(bullet);
        this.bullets.splice(i, 1);
      }
    }
  }

  updateEnemies() {
    // Fator de dificuldade progressiva (cresce junto com baseSpeed)
    const speedFactor = 6 * (this.settings.baseSpeed / 0.1);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Avançar na profundidade em direção ao jogador
      enemy.position.z += enemy.speed * speedFactor;

      // Adicionar deslocamento lateral para alguns inimigos
      if (!enemy.hasDiagonalMovement) {
        // 30% de chance de ter deslocamento lateral
        if (Math.random() < 0.3) {
          enemy.hasDiagonalMovement = true;
          enemy.direction = Math.random() < 0.5 ? 1 : -1; // Direção aleatória
          enemy.diagonalSpeed = enemy.speed * 0.8; // Velocidade lateral
        }
      }

      // Balanço 3D suave para dar vida às naves inimigas
      if (enemy.wobblePhase === undefined) {
        enemy.wobblePhase = Math.random() * Math.PI * 2;
      }
      enemy.rotation.y = Math.sin(Date.now() * 0.002 + enemy.wobblePhase) * 0.25;

      // Aplicar deslocamento lateral se o inimigo tiver
      if (enemy.hasDiagonalMovement) {
        enemy.position.x += enemy.diagonalSpeed * enemy.direction;

        // Inverter direção se atingir os limites do corredor
        if (enemy.position.x > this.gameArea.width/2 || enemy.position.x < -this.gameArea.width/2) {
          enemy.direction *= -1;
        }
      }

      // Só atirar quando visível/próximo e ainda à frente do jogador
      // (evita bombas vindas do nada ou pelas costas)
      const currentTime = Date.now();
      const isInFront = enemy.position.z < this.player.position.z - 20;
      if (enemy.position.z > -260 && isInFront && currentTime - enemy.lastBombTime > enemy.bombInterval) {
        this.createEnemyBomb(enemy);
        enemy.lastBombTime = currentTime;
      }

      // Remover inimigos que passaram pela câmera
      if (enemy.position.z > 30) {
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

      // Girar a mina e pulsar o brilho dos espinhos para destacá-la na tela
      bomb.rotation.x += 0.05;
      bomb.rotation.y += 0.08;
      if (bomb.userData.blinkMaterial) {
        bomb.userData.blinkMaterial.emissiveIntensity = 0.6 + 0.4 * Math.sin(bomb.lifetime * 0.3);
      }

      // Remover bombas que passaram pela câmera ou com tempo expirado
      if (bomb.position.z > 30 || bomb.lifetime <= 0) {
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

      // Destruir todos os inimigos na tela e pontuar
      let totalScore = 0;
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        this.createExplosion(enemy.position.x, enemy.position.y, enemy.enemyType.color, 'enemy');
        this.scene.remove(enemy);
        this.enemies.splice(i, 1);
        totalScore += enemy.enemyType.scoreValue * 2; // Dobrando a pontuação para cada inimigo
      }

      // Destruir todas as bombas inimigas e pontuar
      for (let i = this.enemyBombs.length - 1; i >= 0; i--) {
        const bomb = this.enemyBombs[i];
        this.createExplosion(bomb.position.x, bomb.position.y, bomb.userData.color || 0xff9900, 'bomb');
        this.scene.remove(bomb);
        this.enemyBombs.splice(i, 1);
        totalScore += 1; // 1 ponto por bomba
      }

      // Adicionar pontuação total
      this.score += totalScore;
      this.ui.updateScore(this.score);

      // Resetar o poder
      this.power = 0;
      this.updatePowerDisplay();
      this.playSound(this.sounds.explosion, 1.0);
    }
  }

  updatePowerDisplay() {
    // Usar o método do Frank para atualizar a barra de poder
    this.ui.updatePowerBar(this.power, this.maxPower);
  }

  checkCollisions() {
    // Colisão entre balas e inimigos
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        // Colisão em corredor: alinhou lateralmente com o inimigo = acertou
        // (tolerância de profundidade maior compensa a velocidade dos tiros)
        if (Frank.physics.checkCorridorCollision(bullet, enemy, 3.5, 6)) {
          enemy.health -= bullet.userData.damage;
          
          if (enemy.health <= 0) {
            this.createExplosion(enemy.position.x, enemy.position.y, enemy.enemyType.color, 'enemy');
            this.scene.remove(enemy);
            this.enemies.splice(j, 1);
            this.score += enemy.enemyType.scoreValue;
            this.ui.updateScore(this.score);
            this.power += 5;
            this.updatePowerDisplay();
            this.playSound(this.sounds.explosion, 0.5);
          }
          
          // Se for um tiro explosivo, criar uma explosão adicional
          if (bullet.userData.type === 'explosive') {
            this.createExplosion(bullet.position.x, bullet.position.y, 0xff9900, 'bomb');
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
        // Colisão em corredor também para as bombas inimigas
        if (Frank.physics.checkCorridorCollision(bullet, bomb, 2.2, 5)) {
          this.createExplosion(bomb.position.x, bomb.position.y, bomb.userData.color || 0xff9900, 'bomb');
          this.scene.remove(bullet);
          this.scene.remove(bomb);
          this.bullets.splice(i, 1);
          this.enemyBombs.splice(j, 1);
          this.score += 0.5;
          this.ui.updateScore(this.score);
          this.power += 2;
          this.updatePowerDisplay();
          break;
        }
      }
    }

    // Colisão entre jogador e inimigos
    for (const enemy of this.enemies) {
      // Usar o utilitário do Frank para verificar colisões
      if (Frank.physics.checkCollision(this.player, enemy, 3)) {
        this.createExplosion(this.player.position.x, this.player.position.y, 0x00ff00, 'player');
        this.gameOver();
        break;
      }
    }

    // Colisão entre jogador e bombas
    for (let i = this.enemyBombs.length - 1; i >= 0; i--) {
      const bomb = this.enemyBombs[i];
      // Usar o utilitário do Frank para verificar colisões
      if (Frank.physics.checkCollision(this.player, bomb, 2.5)) {
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

  startSpeedIncrease() {
    setInterval(() => {
      if (this.gameState === "playing") {
        // Aumentar a velocidade base (updateEnemies e createEnemyBomb usam baseSpeed)
        this.settings.baseSpeed += this.settings.speedIncrease;

        // Aplicar o aumento de velocidade para todos os elementos
        this.settings.bulletSpeed = 4 + (this.settings.baseSpeed - 0.1) * 10;
        this.settings.playerSpeed = 0.5 + (this.settings.baseSpeed - 0.1) * 2;

        // Aumentar velocidade da estrela de poder
        if (this.powerStar) {
          this.powerStar.userData.speed = 0.8 + (this.settings.baseSpeed - 0.1) * 2;
        }

        // Aumentar velocidade de spawn dos inimigos
        this.settings.spawnInterval = Math.max(500, 2000 - (this.settings.baseSpeed * 1000));
      }
    }, this.settings.speedInterval);
  }

  gameLoop() {
    if (this.gameState === "playing") {
      this.updatePlayer();
      this.updateBullets();
      this.updateEnemies();
      this.updateEnemyBombs();
      this.updateExplosions();
      this.updatePowerStar();
      this.checkCollisions();
      this.checkPowerStarCollision();
      this.updateReticle();
      this.updateGround();

      // Câmera segue a nave suavemente (estilo Star Fox)
      this.camera.position.x += (this.player.position.x * 0.6 - this.camera.position.x) * 0.08;
      this.camera.position.y += (6 + this.player.position.y * 0.6 - this.camera.position.y) * 0.08;
      this.camera.lookAt(
        this.player.position.x * 0.4,
        this.player.position.y * 0.4,
        -80
      );

      // Animar as estrelas
      if (this.stars) {
        this.stars.rotation.y += 0.0001;
      }
    } else if (this.gameState === "paused") {
      // Mostrar mensagem de pausa
      if (!document.getElementById('pause-message')) {
        const pauseMessage = document.createElement('div');
        pauseMessage.id = 'pause-message';
        pauseMessage.className = 'game-message';
        pauseMessage.textContent = 'Pressione espaço para começar';
        document.body.appendChild(pauseMessage);
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.gameLoop());
  }

  createPowerStar() {
    if (this.powerStar) return; // Já existe uma estrela

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
      shininess: 100
    });

    const star = new THREE.Mesh(geometry, material);

    // Posicionar a estrela aleatoriamente no horizonte do corredor
    star.position.set(
      (Math.random() - 0.5) * this.gameArea.width,
      (Math.random() - 0.5) * this.gameArea.height * 0.6,
      -this.gameArea.depth
    );

    // Adicionar efeito de pulsação
    star.userData.pulseSpeed = 0.05;
    star.userData.pulseScale = 1;
    star.userData.speed = 0.8; // Velocidade de aproximação
    star.userData.trail = []; // Array para armazenar o rastro

    this.powerStar = star;
    this.scene.add(star);

    // Criar rastro
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.2,
      transparent: true,
      opacity: 0.5
    });
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    star.add(trail);
    star.userData.trailObject = trail;
  }

  updatePowerStar() {
    if (!this.powerStar) {
      const currentTime = Date.now();
      if (currentTime - this.powerStarSpawnTime > this.powerStarSpawnInterval) {
        this.createPowerStar();
        this.powerStarSpawnTime = currentTime;
      }
      return;
    }

    // Efeito de pulsação
    this.powerStar.userData.pulseScale += this.powerStar.userData.pulseSpeed;
    if (this.powerStar.userData.pulseScale > 1.2 || this.powerStar.userData.pulseScale < 0.8) {
      this.powerStar.userData.pulseSpeed *= -1;
    }
    this.powerStar.scale.set(
      this.powerStar.userData.pulseScale,
      this.powerStar.userData.pulseScale,
      this.powerStar.userData.pulseScale
    );

    // Aproximação na profundidade
    this.powerStar.position.z += this.powerStar.userData.speed;

    // Atualizar rastro
    this.powerStar.userData.trail.push(this.powerStar.position.clone());
    if (this.powerStar.userData.trail.length > 20) {
      this.powerStar.userData.trail.shift();
    }

    // Atualizar geometria do rastro
    const positions = new Float32Array(this.powerStar.userData.trail.length * 3);
    for (let i = 0; i < this.powerStar.userData.trail.length; i++) {
      positions[i * 3] = this.powerStar.userData.trail[i].x;
      positions[i * 3 + 1] = this.powerStar.userData.trail[i].y;
      positions[i * 3 + 2] = this.powerStar.userData.trail[i].z;
    }
    this.powerStar.userData.trailObject.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Remover estrela se passar pela câmera
    if (this.powerStar.position.z > 30) {
      this.scene.remove(this.powerStar);
      this.powerStar = null;
    }
  }

  createNormalBullet(position) {
    // Usar o utilitário do Frank para criar projéteis (à frente do nariz da nave)
    return Frank.geometry.createProjectile(this.scene, 'normal', {
      color: 0xffff00,
      position: {
        x: position.x,
        y: position.y,
        z: position.z - 3
      },
      damage: 1
    });
  }

  createLaserBullet(position) {
    return Frank.geometry.createProjectile(this.scene, 'laser', {
      color: 0xff0000,
      position: {
        x: position.x,
        y: position.y,
        z: position.z - 3
      },
      damage: 2
    });
  }

  createPlasmaBullet(position) {
    return Frank.geometry.createProjectile(this.scene, 'plasma', {
      color: 0x00ff00,
      position: {
        x: position.x,
        y: position.y,
        z: position.z - 3
      },
      damage: 3
    });
  }

  createLightningBullet(position) {
    // Para o lightning bullet vamos continuar usando a implementação existente
    // já que o Frank.js não tem um tipo específico para isso
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8
    });
    
    for (let i = 0; i < 3; i++) {
      const bolt = new THREE.Mesh(geometry, material);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.x = (i - 1) * 0.5;
      group.add(bolt);
    }
    
    group.position.copy(position);
    group.position.z -= 3;
    group.userData = { type: 'lightning', damage: 2 };
    return group;
  }

  createExplosiveBullet(position) {
    return Frank.geometry.createProjectile(this.scene, 'explosive', {
      color: 0xff9900,
      position: {
        x: position.x,
        y: position.y,
        z: position.z - 3
      },
      damage: 4
    });
  }

  checkPowerStarCollision() {
    if (!this.powerStar) return;

    if (this.player.position.distanceTo(this.powerStar.position) < 3) {
      // Colisão detectada
      this.scene.remove(this.powerStar);
      this.powerStar = null;
      
      // Mudar para o próximo tipo de tiro
      this.currentBulletType = (this.currentBulletType + 1) % this.bulletTypes.length;
      
      // Mostrar mensagem de power-up
      const message = document.createElement('div');
      message.className = 'game-toast';
      message.textContent = `Power-up: ${this.bulletTypes[this.currentBulletType].name}`;
      document.body.appendChild(message);
      
      setTimeout(() => {
        document.body.removeChild(message);
      }, 2000);
    }
  }
}

// O jogo é inicializado pela função startGame() (ranking.js)
// quando o jogador clica em "Começar jogo" — evita instâncias duplicadas.
