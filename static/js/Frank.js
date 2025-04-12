class Frank {
	constructor() {
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.hero = null;
		this.blocks = [];
		this.bullets = [];
		this.score = 0;
		this.gameOver = false;
		this.controls = {
			left: false,
			right: false,
			up: false,
			down: false,
			actionZ: false,
			actionX: false
		};
		this.settings = {
			heroSpeed: 5,
			bulletSpeed: 5,
			bulletSize: 5
		};
	}

	init(canvas, config = {}) {
		// Inicialização do Three.js
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ canvas });
		this.renderer.setSize(canvas.width, canvas.height);

		// Configuração da câmera
		this.camera.position.z = 50;
		this.camera.position.y = 0;
		this.camera.lookAt(0, 0, 0);

		// Configurações do jogo
		Object.assign(this.settings, config);

		// Criar herói
		this.createHero();

		// Configurar controles
		this.setupControls();

		// Configurar loop de renderização
		this.animate();

		if (config.onInit) {
			config.onInit();
		}
	}

	createHero() {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
		this.hero = new THREE.Mesh(geometry, material);
		this.hero.position.set(0, -10, 0);
		this.scene.add(this.hero);
	}

	setupControls() {
		document.addEventListener('keydown', (e) => this.handleKeyDown(e));
		document.addEventListener('keyup', (e) => this.handleKeyUp(e));
	}

	handleKeyDown(e) {
		switch(e.keyCode) {
			case 37: this.controls.left = true; break;
			case 38: this.controls.up = true; break;
			case 39: this.controls.right = true; break;
			case 40: this.controls.down = true; break;
			case 90: this.controls.actionZ = true; break;
			case 88: this.controls.actionX = true; break;
		}
	}

	handleKeyUp(e) {
		switch(e.keyCode) {
			case 37: this.controls.left = false; break;
			case 38: this.controls.up = false; break;
			case 39: this.controls.right = false; break;
			case 40: this.controls.down = false; break;
			case 90: this.controls.actionZ = false; break;
			case 88: this.controls.actionX = false; break;
		}
	}

	createBlock(x, y, width, height, color) {
		const geometry = new THREE.BoxGeometry(width, height, 1);
		const material = new THREE.MeshBasicMaterial({ color });
		const block = new THREE.Mesh(geometry, material);
		block.position.set(x, y, 0);
		block.isCollidable = true;
		this.scene.add(block);
		this.blocks.push(block);
		return block;
	}

	createBullet(x, y) {
		const geometry = new THREE.SphereGeometry(this.settings.bulletSize / 10, 16, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
		const bullet = new THREE.Mesh(geometry, material);
		bullet.position.set(x, y, 0);
		this.scene.add(bullet);
		this.bullets.push(bullet);
		return bullet;
	}

	update() {
		if (this.gameOver) return;

		// Movimento do herói
		if (this.controls.left) this.hero.position.x -= this.settings.heroSpeed * 0.1;
		if (this.controls.right) this.hero.position.x += this.settings.heroSpeed * 0.1;
		if (this.controls.up) this.hero.position.y += this.settings.heroSpeed * 0.1;
		if (this.controls.down) this.hero.position.y -= this.settings.heroSpeed * 0.1;

		// Limitar movimento do herói
		this.hero.position.x = Math.max(-20, Math.min(20, this.hero.position.x));
		this.hero.position.y = Math.max(-20, Math.min(20, this.hero.position.y));

		// Atirar
		if (this.controls.actionZ) {
			this.shoot();
		}

		// Atualizar posição das balas
		this.updateBullets();

		// Atualizar posição dos blocos
		this.updateBlocks();

		// Verificar colisões
		this.checkCollisions();
	}

	shoot() {
		if (!this.controls.actionZ) return;
		const bullet = this.createBullet(
			this.hero.position.x,
			this.hero.position.y + 1
		);
		bullet.velocity = new THREE.Vector3(0, this.settings.bulletSpeed * 0.1, 0);
	}

	updateBullets() {
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			bullet.position.add(bullet.velocity);

			// Remover balas fora da tela
			if (bullet.position.y > 20) {
				this.scene.remove(bullet);
				this.bullets.splice(i, 1);
			}
		}
	}

	updateBlocks() {
		for (const block of this.blocks) {
			block.position.y -= 0.1;
			if (block.position.y < -20) {
				this.scene.remove(block);
				this.blocks.splice(this.blocks.indexOf(block), 1);
			}
		}
	}

	checkCollisions() {
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			const bullet = this.bullets[i];
			for (let j = this.blocks.length - 1; j >= 0; j--) {
				const block = this.blocks[j];
				if (this.checkCollision(bullet, block)) {
					this.scene.remove(bullet);
					this.scene.remove(block);
					this.bullets.splice(i, 1);
					this.blocks.splice(j, 1);
					this.score++;
					break;
				}
			}
		}
	}

	checkCollision(obj1, obj2) {
		const distance = obj1.position.distanceTo(obj2.position);
		return distance < 1;
	}

	animate() {
		requestAnimationFrame(() => this.animate());
		this.update();
		this.renderer.render(this.scene, this.camera);
	}
}

// Exportar a classe para uso global
window.Frank = new Frank();