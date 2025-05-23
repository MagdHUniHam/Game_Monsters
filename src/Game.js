Candy.Game = function(game){
	// define needed variables for the Candy.Game
	this._player = null;
	this._candyGroup = null;
	this._spawnCandyTimer = 0;
	this._fontStyle = null;
	// define Candy variables to reuse them in Candy.item functions
	Candy._scoreText = null;
	Candy._score = 0;
	Candy._health = 30;
	// NEW: track if password is shown
	this._passwordShown = false;
};

Candy.Game.prototype = {
	create: function(){
		// Reset game over flag
		this._gameOverShown = false; 
		this._passwordShown = false; // reset password shown

		// start the physics engine
		this.physics.startSystem(Phaser.Physics.ARCADE);

		// set the global gravity
		this.physics.arcade.gravity.y = 300;

		// display images: background, floor and score
		this.add.sprite(0, 0, 'background');
		this.add.sprite(-30, Candy.GAME_HEIGHT-160, 'floor');
		this.add.sprite(10, 5, 'score-bg');

		// add pause button
		this.add.button(Candy.GAME_WIDTH-96-10, 5, 'button-pause', this.managePause, this);

		// create the player
		this._player = this.add.sprite(5, 760, 'monster-idle');

		// add player animation
		this._player.animations.add('idle', [0,1,2,3,4,5,6,7,8,9,10,11,12], 10, true);

		// play the animation
		this._player.animations.play('idle');

		// set font style
		this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };

		// initialize the spawn timer
		this._spawnCandyTimer = 0;

		// reset and initialize the score text
		Candy._score = 0;
		Candy._health = 30;
		Candy._scoreText = this.add.text(120, 20, "0", this._fontStyle);

		// create new group for candy
		this._candyGroup = this.add.group();

		// spawn first candy
		Candy.item.spawnCandy(this);
	},

	managePause: function(){
		// pause the game
		this.game.paused = true;

		// add proper informational text
		var pausedText = this.add.text(100, 250, "Game paused.\nTap anywhere to continue.", this._fontStyle);

		// set event listener for the user's click/tap the screen
		this.input.onDown.add(function(){
			// remove the pause text
			pausedText.destroy();
			// unpause the game
			this.game.paused = false;
		}, this);
	},

	update: function(){
		// update timer every frame
		this._spawnCandyTimer += this.time.elapsed;

		// spawn new candy every second
		if(this._spawnCandyTimer > 1000) {
			this._spawnCandyTimer = 0;
			Candy.item.spawnCandy(this);
		}

		// rotate all candy
		this._candyGroup.forEach(function(candy){
			candy.angle += candy.rotateMe;
		});

		// If score reaches 30, set health to 0 to trigger game over
		if (Candy._score >= 30 && Candy._health > 0) {
			Candy._health = 0;
		}

		// trigger game over only once
		if(!Candy._health && !this._gameOverShown) {
			this._gameOverShown = true;

			

			// if the player won by reaching 30 points
			if (Candy._score >= 30) {
				// show password image
				const passwordImage = this.add.sprite((Candy.GAME_WIDTH-400)/2, (Candy.GAME_HEIGHT-400)/2 + 100, 'password');
				passwordImage.scale.setTo(0.5, 0.5);
				this._passwordShown = true;

				// PAUSE the game but DO NOT go back to main menu
				this.game.paused = true;
			}
			else {
				// normal lose: missed candies -> go back to main menu
				this.game.paused = true;
				// show game over message
				this.add.sprite((Candy.GAME_WIDTH-594)/2, (Candy.GAME_HEIGHT-271)/2, 'game-over');
				setTimeout(() => {
					this.game.paused = false;
					this.state.start('MainMenu');
				}, 4000);
			}
		}
	}
};

Candy.item = {
	spawnCandy: function(game){
		// calculate drop position (from 0 to game width) on the x axis
		var dropPos = Math.floor(Math.random() * Candy.GAME_WIDTH);

		// define the offset for every candy
		var dropOffset = [-20, -20, -20];

		// randomize candy type
		var candyType = Math.floor(Math.random() * 3);

		// create new candy
		var candy = game.add.sprite(dropPos, dropOffset[candyType], 'candy');

		// add new animation frame
		candy.animations.add('anim', [candyType], 10, true);

		// play the newly created animation
		candy.animations.play('anim');

		// enable candy body for physics engine
		game.physics.enable(candy, Phaser.Physics.ARCADE);

		// enable candy to be clicked/tapped
		candy.inputEnabled = true;

		// add event listener to click/tap
		candy.events.onInputDown.add(this.clickCandy, this);

		// fire event when it goes out of the screen
		candy.checkWorldBounds = true;

		// reset candy when it goes out of screen
		candy.events.onOutOfBounds.add(this.removeCandy, this);

		// set the anchor to the center
		candy.anchor.setTo(0.5, 0.5);

		// set the random rotation value
		candy.rotateMe = (Math.random()*4) - 2;

		// add candy to the group
		game._candyGroup.add(candy);
	},

	clickCandy: function(candy){
		// kill the candy when it's clicked
		candy.kill();

		// add points to the score
		Candy._score += 1;

		// update score text
		Candy._scoreText.setText(Candy._score);
	},

	removeCandy: function(candy){
		// kill the candy
		candy.kill();

		// decrease player's health
		Candy._health -= 10;
	}
};
