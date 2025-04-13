/**
 * Frank.js - Biblioteca de utilidades para jogos Three.js
 * Funções auxiliares para criar elementos 3D, manipular áudio e verificar colisões
 */

// Objeto global que contém as funções utilitárias
const Frank = {
  /**
   * Funções para criação de geometrias e objetos 3D
   */
  geometry: {
    /**
     * Cria uma nave do jogador com aparência personalizada
     * @param {THREE.Scene} scene - A cena onde adicionar a nave
     * @param {Object} options - Opções de personalização
     * @returns {THREE.Group} O objeto 3D da nave
     */
    createPlayerShip: function(scene, options = {}) {
      const defaults = {
        color: 0x4169E1,
        position: { x: 0, y: -15, z: 0 },
        scale: 1
      };
      
      const config = {...defaults, ...options};
      const ship = new THREE.Group();

      // Corpo principal da nave
      const bodyGeometry = new THREE.ConeGeometry(1, 3, 4);
      const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: config.color,
        shininess: 100,
        specular: 0xffffff
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.rotation.x = Math.PI / 2;
      ship.add(body);

      // Asas da nave
      const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
      const wingMaterial = new THREE.MeshPhongMaterial({ 
        color: config.color,
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

      // Posicionar e adicionar à cena
      ship.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );
      
      ship.scale.set(config.scale, config.scale, config.scale);
      
      if (scene) {
        scene.add(ship);
      }
      
      return ship;
    },
    
    /**
     * Cria um inimigo com geometria personalizada
     * @param {THREE.Scene} scene - A cena onde adicionar o inimigo
     * @param {String} type - Tipo de inimigo (fighter, bomber, interceptor, mothership)
     * @param {Object} options - Opções de personalização
     * @returns {THREE.Group} O objeto 3D do inimigo
     */
    createEnemyShip: function(scene, type = 'fighter', options = {}) {
      const defaults = {
        color: 0xff0000,
        position: { x: 0, y: 30, z: 0 },
        scale: 1
      };
      
      const config = {...defaults, ...options};
      const ship = new THREE.Group();
      
      switch(type) {
        case 'fighter':
          // Caça básico
          const body = new THREE.Mesh(
            new THREE.ConeGeometry(1, 2, 4),
            new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 })
          );
          body.rotation.x = Math.PI / 2;
          ship.add(body);

          const wingGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
          const wingMaterial = new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 });
          
          const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
          leftWing.position.set(-1.5, 0, 0);
          ship.add(leftWing);

          const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
          rightWing.position.set(1.5, 0, 0);
          ship.add(rightWing);
          break;
          
        case 'bomber':
          // Bombardeiro
          const bomberBody = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 1),
            new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 })
          );
          ship.add(bomberBody);

          const bomberWingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
          const bomberWingMaterial = new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 });
          
          const bomberLeftWing = new THREE.Mesh(bomberWingGeometry, bomberWingMaterial);
          bomberLeftWing.position.set(-2, 0, 0);
          ship.add(bomberLeftWing);

          const bomberRightWing = new THREE.Mesh(bomberWingGeometry, bomberWingMaterial);
          bomberRightWing.position.set(2, 0, 0);
          ship.add(bomberRightWing);
          break;
          
        case 'interceptor':
          // Interceptor
          const interceptorBody = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.5),
            new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 })
          );
          ship.add(interceptorBody);

          const interceptorWingGeometry = new THREE.BoxGeometry(2, 0.2, 0.5);
          const interceptorWingMaterial = new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 });
          
          const interceptorLeftWing = new THREE.Mesh(interceptorWingGeometry, interceptorWingMaterial);
          interceptorLeftWing.position.set(-1.5, 0, 0);
          ship.add(interceptorLeftWing);

          const interceptorRightWing = new THREE.Mesh(interceptorWingGeometry, interceptorWingMaterial);
          interceptorRightWing.position.set(1.5, 0, 0);
          ship.add(interceptorRightWing);
          break;
          
        case 'mothership':
          // Nave Mãe
          const mothershipBody = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 16),
            new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 })
          );
          ship.add(mothershipBody);

          const ringGeometry = new THREE.TorusGeometry(3, 0.3, 16, 32);
          const ringMaterial = new THREE.MeshPhongMaterial({ color: config.color, shininess: 100 });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2;
          ship.add(ring);
          break;
      }
      
      // Posicionar e adicionar à cena
      ship.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );
      
      ship.scale.set(config.scale, config.scale, config.scale);
      
      if (scene) {
        scene.add(ship);
      }
      
      return ship;
    },
    
    /**
     * Cria um projétil (bala, laser, etc)
     * @param {THREE.Scene} scene - A cena onde adicionar o projétil
     * @param {String} type - Tipo de projétil (normal, laser, plasma, etc)
     * @param {Object} options - Opções de personalização
     * @returns {THREE.Mesh} O objeto 3D do projétil
     */
    createProjectile: function(scene, type = 'normal', options = {}) {
      const defaults = {
        color: 0xffff00,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0.5, z: 0 },
        damage: 1
      };
      
      const config = {...defaults, ...options};
      let projectile;
      
      switch(type) {
        case 'normal':
          projectile = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshPhongMaterial({ color: config.color })
          );
          projectile.userData = { type: 'normal', damage: config.damage || 1 };
          break;
          
        case 'laser':
          projectile = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 2, 8),
            new THREE.MeshPhongMaterial({ 
              color: config.color || 0xff0000,
              emissive: config.color || 0xff0000,
              emissiveIntensity: 0.5
            })
          );
          projectile.rotation.x = Math.PI / 2;
          projectile.userData = { type: 'laser', damage: config.damage || 2 };
          break;
          
        case 'plasma':
          projectile = new THREE.Mesh(
            new THREE.SphereGeometry(0.7, 32, 32),
            new THREE.MeshPhongMaterial({ 
              color: config.color || 0x00ff00,
              emissive: config.color || 0x00ff00,
              emissiveIntensity: 0.5
            })
          );
          projectile.userData = { type: 'plasma', damage: config.damage || 3 };
          break;
          
        case 'explosive':
          projectile = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 32, 32),
            new THREE.MeshPhongMaterial({ 
              color: config.color || 0xff9900,
              emissive: config.color || 0xff9900,
              emissiveIntensity: 0.5
            })
          );
          projectile.userData = { type: 'explosive', damage: config.damage || 4 };
          break;
      }
      
      // Posicionar o projétil
      projectile.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );
      
      // Adicionar velocidade
      projectile.velocity = new THREE.Vector3(
        config.velocity.x,
        config.velocity.y,
        config.velocity.z
      );
      
      if (scene) {
        scene.add(projectile);
      }
      
      return projectile;
    },
    
    /**
     * Cria um efeito de explosão
     * @param {THREE.Scene} scene - A cena onde adicionar a explosão
     * @param {Object} options - Opções de personalização
     * @returns {THREE.Group} O objeto 3D da explosão
     */
    createExplosion: function(scene, options = {}) {
      const defaults = {
        color: 0xff0000,
        position: { x: 0, y: 0, z: 0 },
        particleCount: 20,
        lifetime: 30,
        scale: 1
      };
      
      const config = {...defaults, ...options};
      
      const explosion = new THREE.Group();
      const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const particleMaterial = new THREE.MeshPhongMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 1
      });

      for (let i = 0; i < config.particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        const angle = (i / config.particleCount) * Math.PI * 2;
        const speed = 0.1 + Math.random() * 0.2;
        
        particle.velocity = new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          0
        );
        
        particle.position.set(0, 0, 0);
        explosion.add(particle);
      }

      explosion.position.set(config.position.x, config.position.y, config.position.z);
      explosion.scale.set(config.scale, config.scale, config.scale);
      explosion.lifetime = config.lifetime;
      
      if (scene) {
        scene.add(explosion);
      }
      
      return explosion;
    },
    
    /**
     * Cria um fundo estelar
     * @param {THREE.Scene} scene - A cena onde adicionar o fundo
     * @param {Object} options - Opções de personalização
     * @returns {THREE.Points} O objeto 3D do fundo estelar
     */
    createStarfield: function(scene, options = {}) {
      const defaults = {
        count: 10000,
        color: 0xFFFFFF,
        size: 0.1,
        depth: 2000
      };
      
      const config = {...defaults, ...options};
      
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: config.color,
        size: config.size,
        transparent: true
      });

      const starVertices = [];
      for (let i = 0; i < config.count; i++) {
        const x = (Math.random() - 0.5) * config.depth;
        const y = (Math.random() - 0.5) * config.depth;
        const z = (Math.random() - 0.5) * config.depth;
        starVertices.push(x, y, z);
      }

      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      
      if (scene) {
        scene.add(stars);
      }
      
      return stars;
    }
  },
  
  /**
   * Funções para áudio
   */
  audio: {
    /**
     * Cria um contexto de áudio e carrega sons básicos
     * @returns {Object} Objeto contendo o contexto de áudio e sons básicos
     */
    createAudioContext: function() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sounds = {
        explosion: null,
        shoot: null,
        engineSound: null
      };
      
      // Criar som de explosão
      const explosionBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
      const explosionData = explosionBuffer.getChannelData(0);
      for (let i = 0; i < explosionBuffer.length; i++) {
        const t = i / explosionBuffer.length;
        const envelope = Math.exp(-t * 5);
        explosionData[i] = Math.sin(i * 0.1) * envelope * 0.8;
      }
      sounds.explosion = explosionBuffer;
      
      // Criar som de tiro
      const shootBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      const shootData = shootBuffer.getChannelData(0);
      for (let i = 0; i < shootBuffer.length; i++) {
        shootData[i] = Math.sin(i * 0.1) * 0.5;
      }
      sounds.shoot = shootBuffer;
      
      // Criar função para tocar os sons
      const playSound = function(buffer, volume = 1) {
        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer;
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        source.start(0);
        return { source, gainNode };
      };
      
      return {
        context: audioContext,
        sounds: sounds,
        playSound: playSound
      };
    },
    
    /**
     * Carrega arquivos de áudio externos
     * @param {AudioContext} audioContext - O contexto de áudio
     * @param {Object} urls - Objeto com urls dos arquivos de áudio
     * @returns {Promise} Promise que resolve para um objeto com os buffers de áudio
     */
    loadSounds: async function(audioContext, urls) {
      const buffers = {};
      
      const loadSound = async (url) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
      };
      
      const promises = Object.entries(urls).map(async ([name, url]) => {
        try {
          buffers[name] = await loadSound(url);
        } catch (error) {
          console.error(`Erro ao carregar som: ${url}`, error);
        }
      });
      
      await Promise.all(promises);
      return buffers;
    }
  },
  
  /**
   * Funções para física e colisões
   */
  physics: {
    /**
     * Verifica colisão entre dois objetos 3D
     * @param {THREE.Object3D} obj1 - Primeiro objeto
     * @param {THREE.Object3D} obj2 - Segundo objeto
     * @param {Number} threshold - Distância mínima para colisão
     * @returns {Boolean} Se há colisão
     */
    checkCollision: function(obj1, obj2, threshold = 2) {
      if (!obj1 || !obj2) return false;
      const distance = obj1.position.distanceTo(obj2.position);
      return distance < threshold;
    },
    
    /**
     * Verifica se um objeto está dentro dos limites da área de jogo
     * @param {THREE.Object3D} obj - O objeto a verificar
     * @param {Object} gameArea - Dimensões da área do jogo
     * @returns {Boolean} Se o objeto está dentro dos limites
     */
    isInBounds: function(obj, gameArea = { width: 150, height: 150 }) {
      return (
        obj.position.x >= -gameArea.width/2 &&
        obj.position.x <= gameArea.width/2 &&
        obj.position.y >= -gameArea.height/2 &&
        obj.position.y <= gameArea.height/2
      );
    },
    
    /**
     * Limita a posição de um objeto para dentro dos limites da área de jogo
     * @param {THREE.Object3D} obj - O objeto a limitar
     * @param {Object} gameArea - Dimensões da área do jogo
     */
    constrainToGameArea: function(obj, gameArea = { width: 150, height: 150 }) {
      obj.position.x = Math.max(
        -gameArea.width/2,
        Math.min(gameArea.width/2, obj.position.x)
      );
      obj.position.y = Math.max(
        -gameArea.height/2,
        Math.min(gameArea.height/2, obj.position.y)
      );
    }
  },
  
  /**
   * Funções para interface de usuário
   */
  ui: {
    /**
     * Cria elementos básicos de UI para o jogo
     * @returns {Object} Objeto com referências aos elementos criados
     */
    createGameUI: function() {
      // Elemento de pontuação
      const scoreElement = document.createElement('div');
      scoreElement.id = 'score';
      scoreElement.style.position = 'absolute';
      scoreElement.style.top = '20px';
      scoreElement.style.left = '50%';
      scoreElement.style.transform = 'translateX(-50%)';
      scoreElement.style.color = 'white';
      scoreElement.style.fontSize = '24px';
      scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
      scoreElement.style.zIndex = '100';
      document.body.appendChild(scoreElement);

      // Container da barra de poder
      const powerContainer = document.createElement('div');
      powerContainer.id = 'power-container';
      powerContainer.style.position = 'absolute';
      powerContainer.style.top = '60px';
      powerContainer.style.left = '50%';
      powerContainer.style.transform = 'translateX(-50%)';
      powerContainer.style.width = '200px';
      powerContainer.style.height = '20px';
      powerContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      powerContainer.style.borderRadius = '10px';
      powerContainer.style.overflow = 'hidden';
      powerContainer.style.zIndex = '100';
      document.body.appendChild(powerContainer);

      // Barra de poder
      const powerBar = document.createElement('div');
      powerBar.id = 'power-bar';
      powerBar.style.width = '0%';
      powerBar.style.height = '100%';
      powerBar.style.backgroundColor = '#ff0000';
      powerBar.style.transition = 'width 0.3s';
      powerContainer.appendChild(powerBar);

      // Texto para bomba atômica
      const atomicText = document.createElement('div');
      atomicText.id = 'atomic-text';
      atomicText.style.position = 'absolute';
      atomicText.style.top = '90px';
      atomicText.style.left = '50%';
      atomicText.style.transform = 'translateX(-50%)';
      atomicText.style.color = 'white';
      atomicText.style.fontSize = '18px';
      atomicText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
      atomicText.style.zIndex = '100';
      atomicText.style.opacity = '0';
      atomicText.style.transition = 'opacity 0.5s';
      atomicText.textContent = 'Atomic Bomb';
      document.body.appendChild(atomicText);
      
      return {
        score: scoreElement,
        powerContainer: powerContainer,
        powerBar: powerBar,
        atomicText: atomicText,
        
        /**
         * Atualiza a barra de poder
         * @param {Number} power - Valor atual do poder
         * @param {Number} maxPower - Valor máximo do poder
         */
        updatePowerBar: function(power, maxPower) {
          const powerPercentage = (power / maxPower) * 100;
          powerBar.style.width = `${powerPercentage}%`;
          
          if (powerPercentage > 0) {
            atomicText.style.opacity = (powerPercentage / 100).toString();
          } else {
            atomicText.style.opacity = '0';
          }
        },
        
        /**
         * Atualiza o placar
         * @param {Number} score - Pontuação atual
         */
        updateScore: function(score) {
          scoreElement.textContent = Math.floor(score);
        },
        
        /**
         * Mostra uma mensagem na tela
         * @param {String} text - Texto da mensagem
         * @param {Object} options - Opções de estilo e duração
         */
        showMessage: function(text, options = {}) {
          const defaults = {
            duration: 2000,
            fontSize: '24px',
            color: 'white'
          };
          
          const config = {...defaults, ...options};
          
          const message = document.createElement('div');
          message.style.position = 'absolute';
          message.style.top = '50%';
          message.style.left = '50%';
          message.style.transform = 'translate(-50%, -50%)';
          message.style.color = config.color;
          message.style.fontSize = config.fontSize;
          message.style.textAlign = 'center';
          message.style.zIndex = '1000';
          message.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
          message.textContent = text;
          document.body.appendChild(message);
          
          setTimeout(() => {
            document.body.removeChild(message);
          }, config.duration);
        }
      };
    }
  }
};

// Exportar o objeto Frank para uso global
window.Frank = Frank;