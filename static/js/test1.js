(function(window, $, undefined){
	var document = window.document,
		canvas1 = document.getElementById("canvas"),
		context1 = canvas1.getContext("2d"),
		hero = null,
		tiro = null,
		sizeBullet = null,
		linux = new Image(),
		background = null,
		arrastarHeroi = true,
		fimDeJogo = false,
		bulletSpeed = -5,
		config = {
			background: background, 
			arrastar: arrastarHeroi, 
			fnCallBack: function() {
				hero = Frank.create(100, 100, 30, 36,[], 'blue', 5, null);
				sizeBullet = Frank.getData(Frank.sizeBullet) || 5;
				tiro = Frank.createBullet(hero.x, hero.y, parseInt(sizeBullet, 10), parseInt(sizeBullet, 10), 'black');
				createEnemy();
			}
		}

	Frank.init(context1, canvas1, config);

	function draw() {
		Frank.show(function() {

			if(fimDeJogo) {
				clearInterval(t);
			}
			
			Frank.drawMain();
			// Fixar o heroi (horiz.)
			hero.y = canvas1.height - hero.h;
			Frank.drawBlocks();
			Frank.moveBlocks(.5, 0, true);

			if(Frank.checkBullet(tiro, bulletSpeed, 1, createEnemy)) {
				fimDeJogo = true;
			}

		}, true);
	}

	Frank.executeZ = function() {
		Frank.atirar(hero, tiro);
	}

	var t = setInterval(function() {
		draw();
	}, 10);

	function createEnemy() {
		var block = Frank.createBlock(Frank.random(0, canvas1.width - 40), 10, 40, 40, 'black', null);
			block.isColide = true;
			block.speed = 0;
			Frank.add(block);
	}

})(window, jQuery);
