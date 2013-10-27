window.Frank = window.Frank || {};

(function(window, undefined) {

	var 
		_contexto = null,
		_canvas = null,
		pow = new Audio('./static/audio/shot.ogg'),
		document = window.document;
	
		Frank = {
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			speed: 0,
			image: null,
			image2: null,
			imageSprite: null,
			blocks: [],
			bullets: [],
			leftP: false,
			rightP: false,
			topP: false,
			downP: false,
			actionZ: false,
			actionX: false,
			control: false,
			controleOk: true,
			counter: 0,
			score: 0,
			dificult: 0,
			countSprite: 1,
			lastP: 0,
			image_block: null,
			bg: null,
			sizeBullet: 'sizeBullet'
		};

	Frank.init = function(contexto, canvas, config) {
		_contexto = contexto;
		_canvas = canvas;
		if(config.arrastar) {
			_canvas.onmousedown = function(e) {
				myDown(e);
				Frank.onmousedown(e);
			}
			_canvas.onmouseup = function(e) {
				myUp(e);
				Frank.onmouseup(e);
			}
		}
		if(config.background) Frank.bg = config.background;
		if(Frank.blocks.length > 0) {
			Frank.counter = Frank.blocks.length;
		}
		if(config.fnCallBack) config.fnCallBack();
	}

	var rect = function(x, y, w, h, cor) {
	    _contexto.fillStyle = cor;
	    _contexto.fillRect(x, y, w, h);
	}

	var clear = function() {
		_contexto.clearRect(0,0,_canvas.width,_canvas.height);
	}

	var drawBullets = function() {
		for(var i in Frank.bullets) {
			Frank.bullets[i].id = i;
			rect(Frank.bullets[i].x,Frank.bullets[i].y,Frank.bullets[i].w,Frank.bullets[i].h,Frank.bullets[i].cor);
		}
	}

	var addBullet = function(_Obj) {
		Frank.bullets.push(_Obj);
	}

	var desenhaImg = function(obj, imagem) {
		_contexto.drawImage(imagem, 0, 0, obj.w, obj.h, obj.x, obj.y, obj.w, obj.h);
	}

	var checkDireita = function(b) {
		if(Frank.x + Frank.w >= b.x && Frank.x < b.x + b.w) {
			return true;
		}
		return false;
	}

	var checkEsquerda = function(b) {
		if(Frank.x <= b.x + b.w && Frank.x + Frank.w > b.x) {
			return true;
		}
		return false;
	}

	var checkCima = function(b) {
		if(Frank.y <= b.y + b.h && Frank.y + Frank.h > b.y) {
			return true;
		}
		return false;
	}

	var checkBaixo = function(b) {
		if(Frank.y + Frank.h >= b.y && Frank.y < b.y + b.h) {
			return true;
		}
		return false;
	}

	var getKeyDirection = function(e, b) {
		var k = e.keyCode;
		switch(k) {
			case 37: Frank.leftP = b; break;
			case 38: Frank.topP = b; break;
			case 39: Frank.rightP = b; break;
			case 40: Frank.downP = b; break;
			case 90: Frank.actionZ = b; break;
			case 88: Frank.actionX = b; break;
		}
	}

	var move = function(val, sentido) {
		if(sentido == 0) {
			Frank.x = Frank.x + val;
		}else{
			Frank.y = Frank.y + val;
		}
		if(Frank.x > _canvas.width - Frank.w) {
			Frank.x = _canvas.width - Frank.w;
		}else if(Frank.x <= 0) {
			Frank.x = 0;
		}
		if(Frank.y <= 0) {
			Frank.y = 0;
		}else if(Frank.y > _canvas.height - Frank.h) {
			Frank.y = _canvas.height - Frank.h;
		}
	}

	var moveBullets = function(val, sentido) {
		for(var j in Frank.bullets) {
			if(sentido == 0) {
				Frank.bullets[j].x = Frank.bullets[j].x + val;
			}else{
				Frank.bullets[j].y = Frank.bullets[j].y + val;
			}
			if(Frank.bullets[j].x > _canvas.width - Frank.bullets[j].w) {
				Frank.bullets[j].x = _canvas.width - Frank.bullets[j].w;
			}else if(Frank.bullets[j].x <= 0) {
				Frank.bullets[j].x = 0;
			}
			if(Frank.bullets[j].y <= 0) {
				Frank.bullets[j].y = 0;
			}else if(Frank.bullets[j].y > _canvas.height - Frank.bullets[j].h) {
				Frank.bullets[j].y = _canvas.height - Frank.bullets[j].h;
			}
		}
	}

	var checkLimitVertDown = function(corp, fnCallBack) {
		if(corp.y >= _canvas.height - corp.h) {
			corp.y = 0;
			if(fnCallBack) {
				fnCallBack();
			}
		}
	}
	var checkLimitVertUp = function(corp, fnCallBack) {
		if(corp.y <= 0) {
			corp.y = _canvas.height;
			if(fnCallBack) {
				fnCallBack();
			}
		}
	}
	var checkLimitHorDir = function(corp, fnCallBack) {
		if(corp.x+corp.w+3 >= _canvas.width) {
			corp.x = 0;
			if(fnCallBack) {
				fnCallBack();
			}
		}
	}
	var checkLimitHorEsq = function(corp, fnCallBack) {
		if(corp.x <= 0) {
			corp.x = _canvas.width - corp.w;
			if(fnCallBack) {
				fnCallBack();
			}
		}
	}

	var desenharBitmap = function(bitmap, pos_x, pos_y, tamanho) {
		for (var y in bitmap) {
			for (var x in bitmap[y]) {
				var valor = bitmap[y][x]
				if (valor != 0) {
					switch (valor) {
						case 1: _contexto.fillStyle = "black"; break;
						case 2: _contexto.fillStyle = "#aa0000"; break;
						case 3: _contexto.fillStyle = "white"; break;
						case 4: _contexto.fillStyle = "blue"; break;
					}
					_contexto.fillRect(pos_x + (tamanho * x), pos_y + (tamanho * y), tamanho, tamanho);
				}
			}
		}
	}

	var balear = function(a, b) {
		if((a.x+a.w < b.x) || (a.x > b.x+b.w) || (a.y > (b.y+b.h)) || (a.x+a.w < b.x) || (a.x > b.x+b.w) || (a.y+a.h < b.y)) {
			return false;
		}
		return true;
	}

	var limitblocks = function() {
		for(var b in Frank.blocks) {
			checkLimitHorDir(Frank.blocks[b],function() {
				Frank.blocks[b].x = 1;
			});
			checkLimitVertDown(Frank.blocks[b],function() {
				Frank.blocks[b].y = 1;
			});
			checkLimitHorEsq(Frank.blocks[b],function() {
				Frank.blocks[b].x = _canvas.width - Frank.blocks[b].w;
			});
			checkLimitVertUp(Frank.blocks[b],function() {
				Frank.blocks[b].y = _canvas.height - Frank.blocks[b].h;
			});
		}
	}

	var sprite = function(img, fnCallBack) {
		Frank.imageSprite = img;
		if(fnCallBack) {
			fnCallBack();
		}
	}

	var up = function(p) {
		if(!Frank.colideU()) {
			move(-(Frank.speed),1);
		}
	}

	var down = function(p) {
		if(!Frank.colideD()) {
			move(Frank.speed,1);
		}
	}

	var left = function(p) {
		if(!Frank.colideL()) {
			move(-(Frank.speed),0);
		}
	}

	var right = function(p) {
		if(!Frank.colideR()) {
			move(Frank.speed,0);
		}
	}

	var myMove = function(e) {
		if (Frank.drag) {
			Frank.x = e.pageX - _canvas.offsetLeft - Frank.w/2;
			Frank.y = e.pageY - _canvas.offsetTop - Frank.h/2;
		}
	}

	var myDown = function(e) {
		if (e.pageX < Frank.x + Frank.w + _canvas.offsetLeft && e.pageX > Frank.x - Frank.w +
			_canvas.offsetLeft && e.pageY < Frank.y + Frank.h + _canvas.offsetTop &&
			e.pageY > Frank.y - Frank.h + _canvas.offsetTop) {
			Frank.x = e.pageX - _canvas.offsetLeft - Frank.w/2;
			Frank.y = e.pageY - _canvas.offsetTop - Frank.h/2;
			Frank.drag = true;
			_canvas.onmousemove = myMove;
		}
	}

	var myUp = function() {
		Frank.drag = false;
		_canvas.onmousemove = null;
	}

	Frank.add = function(_Obj) {
		Frank.blocks.push(_Obj);
		Frank.counter++;
	}

	Frank.create = function(x, y, w, h, array, cor, speed, img) {
		Frank.x = x || 0;
		Frank.y = y || 0;
		Frank.w = w || 10;
		Frank.h = h || 10;
		Frank.cor = cor || 'black';
		Frank.speed = speed || 1;
		if(array && array.length > 0) {
			Frank.image = array[0];
			if(array[1]) {
				Frank.image2 = array[1];
			}
		}
		return Frank;
	}

	Frank.createBlock = function(x, y, w, h, cor, image) {
		var blk = Object.create(null);
		blk.id = '';
		blk.x = x || 0;
		blk.y = y || 0;
		blk.w = w || 10;
		blk.h = h || 10;
		blk.speed = null;
		blk.cor = cor || 'red';
		blk.isColide = false;
		blk.isColideBlock = true;
		if(image) {
			blk.image = Frank.image_block = image;
		}
		return blk;
	}

	Frank.createBullet = function(x, y, w, h, cor) {
		var blt = Object.create(null);
		blt.x = x || 0;
		blt.y = y || 0;
		blt.w = w || 5;
		blt.h = h || 5;
		blt.cor = cor || 'gray';
		return blt;
	}

	Frank.drawMain = function() {
		if(!Frank.imageSprite) {
			if(Frank.image) {
				desenhaImg(Frank, Frank.image);
			}else{
				rect(Frank.x, Frank.y, Frank.w, Frank.h, Frank.cor);
			}
		}
	}

	Frank.drawBlocks = function() {
		for(var i in Frank.blocks) {
			Frank.blocks[i].id = i;
			rect(Frank.blocks[i].x,Frank.blocks[i].y,Frank.blocks[i].w,Frank.blocks[i].h,Frank.blocks[i].cor);
		}
	}

	

	Frank.drawImgBlocks = function() {
		for(var i in Frank.blocks) {
			Frank.blocks[i].id = i;
			if(Frank.blocks[i].image) {
				desenhaImg(Frank.blocks[i],Frank.blocks[i].image);
			}
		}
	}

	Frank.show = function(fnCallBack, okPressed) {
		var anyArrowIsPressed = false;
		if(okPressed) {
			anyArrowIsPressed = Frank.leftP || Frank.rightP || Frank.downP || Frank.topP;
		}
		var anyArrowActIsPressed = Frank.actionZ || Frank.actionX;
		if(anyArrowIsPressed) {
			if(Frank.leftP) left();
			if(Frank.rightP) right();
			if(Frank.topP) up();
			if(Frank.downP) down();
		}
		clear();
		if(Frank.bg) {
			_contexto.drawImage(Frank.bg, 0,0,_canvas.width,_canvas.height);
		}
		if(anyArrowActIsPressed) {
			var old = Frank.image;
			if(Frank.actionZ) {
				Frank.executeZ();
				Frank.image = Frank.image2;
			}
			if(Frank.actionX) Frank.executeX();
		}
		fnCallBack();
		if(old) Frank.image = old;
	}

	Frank.colideR = function() {
		for(var i in Frank.blocks) {
			if(Frank.blocks[i].isColideBlock) {
				if(checkDireita(Frank.blocks[i]) && checkCima(Frank.blocks[i]) && checkBaixo(Frank.blocks[i])) {
					return true;
				}
			}
		}
		return false;
	}

	Frank.colideL = function() {
		for(var i in Frank.blocks) {
			if(checkEsquerda(Frank.blocks[i]) && checkCima(Frank.blocks[i]) && checkBaixo(Frank.blocks[i])) {
				return true;
			}
		}
		return false;
	}

	Frank.colideU = function() {
		for(var i in Frank.blocks) {
			if(checkDireita(Frank.blocks[i]) && checkEsquerda(Frank.blocks[i]) && checkCima(Frank.blocks[i])) {
				return true;
			}
		}
		return false;
	}

	Frank.colideD = function() {
		for(var i in Frank.blocks) {
			if(checkDireita(Frank.blocks[i]) && checkEsquerda(Frank.blocks[i]) && checkBaixo(Frank.blocks[i])) {
				return true;
			}
		}
		return false;
	}

	Frank.executeZ = function() {};
	Frank.executeX = function() {};

	

	document.onkeydown = function(e) {
		getKeyDirection(e, true);
		Frank.onkeydown(e);
	};

	document.onkeyup = function(e) {
		getKeyDirection(e, false);
		Frank.onkeyup(e);
	};

	Frank.moveBlocks = function(val, sentido, transportar) {
		for(var j in Frank.blocks) {
			if(Frank.blocks[j].speed) {
				val = Frank.blocks[j].speed;
			}
			if(sentido == 0) {
				Frank.blocks[j].x = Frank.blocks[j].x + val;
			}else{
				Frank.blocks[j].y = Frank.blocks[j].y + val + Frank.blocks[j].h / 100;
			}
			if(Frank.blocks[j].x > _canvas.width - Frank.blocks[j].w) {
				Frank.blocks[j].x = _canvas.width - Frank.blocks[j].w;
			}else if(Frank.blocks[j].x <= 0) {
				Frank.blocks[j].x = 0;
			}
			if(Frank.blocks[j].y <= 0) {
				Frank.blocks[j].y = 0;
			}else if(Frank.blocks[j].y > _canvas.height - Frank.blocks[j].h) {
				Frank.blocks[j].y = _canvas.height - Frank.blocks[j].h;
			}
			if(Frank.blocks[j].speed > 4) {
				Frank.blocks[j].speed = 2;//Frank.random(1,9);
				sentido = 1;
				//Frank.blocks[j].speed = Frank.blocks[j].speed * (-1);
			}else{
				sentido = 0;
			}
			Frank.blocks[j].speed += .5;
			Frank.lastP = Frank.blocks[j].y;
		}
		if(transportar) {
			limitblocks();
		}
	}

	Frank.onkeydown = function(e) {};
	Frank.onkeyup = function(e) {};
	Frank.onmousemove = function(e) {};
	Frank.onmousedown = function(e) {};
	Frank.onmouseup = function(e) {};

	Frank.random = function(i, f) {
		if (i > f) {
			numI = f;
			numF = i+1;
		}else{
			numI = i;
			numF = f+1;
		}
		nRdm = Math.floor((Math.random()*(numF-numI))+numI);
		return nRdm;
	}

	Frank.atirar = function(main, tiro, fnCallBack) {
		if(Frank.controleOk) {
			tiro.x = main.x;// + main.w/2;
			tiro.y = main.y;
			addBullet(tiro);
			Frank.control = true;
		}
		if(fnCallBack) {
			fnCallBack();
		}
	}

	Frank.checkBullet = function(tiro, val, sentido, fnCallBack) {
		if(Frank.control) {
			Frank.controleOk = false;
			drawBullets();
			moveBullets(val, sentido);
			for(var j in Frank.bullets) {
				var dir = Frank.bullets[j].x + Frank.bullets[j].w >= _canvas.width,
					esq = Frank.bullets[j].x <= 0,
					cima = Frank.bullets[j].y <= 0,
					baixo = Frank.bullets[j].y + Frank.bullets[j].h >= _canvas.height;
				if(dir || esq || baixo || cima) {
					Frank.bullets.splice(j, 1);
					Frank.controleOk = true;
					Frank.control = false;
				}
			}
			for(var i in Frank.blocks) {
				if(Frank.blocks[i].isColide) {
					if(balear(Frank.blocks[i],tiro)) {
						try {
							if(pow != undefined) {
								pow.pause();
							}
							pow.pause();
							pow.currentTime = 0;
						   	pow.play();
						  
						  } catch(v) {
							alert(v.message);
						  }
						
						Frank.blocks.splice(i, 1);
						
						for(var j in Frank.bullets) {
							Frank.bullets[j].x = -10;
							Frank.bullets[j].y = -10;
							Frank.score++;
						}
						Frank.counter--;
						if(Frank.counter < 1) {
							if(fnCallBack) fnCallBack();
						}
					}
				}
			}
		}
		return false;
	}

	Frank.setBullet = function(bullet, val) {
		var value = parseInt(val, 10);
		if(value < 5) {
			value = 5;
		}
		if(value > 20) {
			value = 15;
		}
		bullet.w = value;
		bullet.h = value;

		setData(Frank.sizeBullet, value);
	}

	Frank.getData = function(key) {
		return window.localStorage.getItem(key);
	}

	Frank.setData = function(key, val) {
		window.localStorage.setItem(key, val);
	}

})(window);