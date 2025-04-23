Candy.Game = function(game) {
    this._player = null;
    this._candyGroup = null;
    this._spawnCandyTimer = 0;
    this._fontStyle = null;
    Candy._scoreText = null;
    Candy._score = 0;
    Candy._health = 0;
    this._gameOverShown = false;
};

Candy.Game.prototype = {
    create: function() {
        // start the physics engine
        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 200;
        // display images
        this.add.sprite(0, 0, 'background');
        this.add.sprite(-30, Candy.GAME_HEIGHT - 160, 'floor');
        this.add.sprite(10, 5, 'score-bg');
        // add pause button
        this.add.button(Candy.GAME_WIDTH - 96 - 10, 5, 'button-pause', this.managePause, this);
        // create the player
        this._player = this.add.sprite(5, 760, 'monster-idle');
        this._player.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10, true);
        this._player.animations.play('idle');
        // set font style
        this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
        // initialize the spawn timer
        this._spawnCandyTimer = 0;
        // initialize the score text with 0
        Candy._scoreText = this.add.text(120, 20, "0", this._fontStyle);
        // set health of the player
        Candy._health = 10;
        // create new group for candy
        this._candyGroup = this.add.group();
        // spawn first candy
        Candy.item.spawnCandy(this);
    },

    managePause: function() {
        this.game.paused = true;
        var pausedText = this.add.text(100, 250, "Game paused.\nTap anywhere to continue.", this._fontStyle);
        this.input.onDown.add(function() {
            pausedText.destroy();
            this.game.paused = false;
        }, this);
    },

    update: function() {
        this._spawnCandyTimer += this.time.elapsed;

        if (this._spawnCandyTimer > 1000) {
            this._spawnCandyTimer = 0;
            Candy.item.spawnCandy(this);
        }

        this._candyGroup.forEach(function(candy) {
            candy.angle += candy.rotateMe;
        });

        if (!Candy._health && !this._gameOverShown) {
            this._gameOverShown = true;

            // show game over screen
            this.add.sprite((Candy.GAME_WIDTH - 594) / 2, (Candy.GAME_HEIGHT - 271) / 2, 'game-over');

            // add the play again button
            var playButton = this.add.button(
                Candy.GAME_WIDTH - 401 - 10,
                Candy.GAME_HEIGHT - 143 - 10,
                'button-start',
                function () {
                    this.game.paused = false; // unpause the game
                    this.state.start('Game'); // restart the game
                },
                this,
                1, 0, 2
            );
            playButton.inputEnabled = true;
            playButton.events.onInputDown.add(function() {
                this.game.paused = false;
                this.state.start('Game');
            }, this);

            this.game.paused = true;
        }
    }
};
