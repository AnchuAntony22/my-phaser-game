export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        
        this.backgroundSpeed = 1; // Speed of background scrolling
        this.playerSpeed = 1; // Player upward speed
    }

    create() {
        // Initialize lives
        this.lives = 3;

        this.input.on('pointerdown', this.handleMouseClick, this);

        // Create the background images
        this.background1 = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        this.background1.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.background2 = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 - this.cameras.main.height, 'background');
        this.background2.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        console.log(this.background1.y, this.background2.y);

        // Create sound objects
        this.startSound = this.sound.add('start');
        this.gameOverSound = this.sound.add('gameOver');
        this.runningSound = this.sound.add('running');
        this.bitingSound = this.sound.add('biting');

        // Play the start sound when the game starts
        this.startSound.play();
        this.runningSound.play(); // Start playing running sound
        // Create the player sprite
        this.player = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height - 50, 'player');
        this.player.setScale(2);
        
        // Create the walking/running animation
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'player', frame: 0 },
                { key: 'player', frame: 1 }
            ],
            frameRate: 10,
            repeat: -1
        });

        // Play the running animation
        this.player.anims.play('walk', true);
        
        // Game variables
        this.obstacles = [];
        this.obstacleSpeed = 2;
        this.score = 0;
        this.gameOver = false;
        this.playerDx = 0;
        this.playerDy = -this.playerSpeed; // Set initial upward movement speed

        // Score Text
        this.scoreText = this.add.text(20, 30, 'Score: 0', {
            fontSize: '20px',
            fill: '#000'
        });

         // Create heart icons to represent lives
        this.heartIcons = this.add.group();
        for (let i = 0; i < this.lives; i++) {
            let heart = this.add.image(30 + i * 40, 70, 'heart').setScale(0.5);
            this.heartIcons.add(heart);
        }

        // Hit message (will be hidden initially)
        this.hitMessage = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', {
            fontSize: '24px',
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        this.hitMessage.visible = false; // Hide initially

        // Game Over / Restart Text (will be hidden initially)
        this.restartMessage = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, '', {
            fontSize: '24px',
            fill: '#0000ff',
            align: 'center'
        }).setOrigin(0.5);
        this.restartMessage.visible = false; // Hide initially

        // Mouse Input
        this.input.on('pointerdown', this.handleMouseClick, this);

        // Obstacle spawner
        this.obstacleTimer = this.time.addEvent({
            delay: 4000,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
        this.maxObstacles = 5;
        
        // Start the movement loop
        this.time.addEvent({
            delay: 1000 / 60,
            callback: this.movePlayer,
            callbackScope: this,
            loop: true
        });

        // Input for Restart
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) {
                this.scene.restart(); // Restart the game on pressing 'R'
            }
        });

        
    }

    update() {
        if (this.gameOver) {
            // Stop the player animation when the game is over
            this.player.anims.stop();
            this.player.setFrame(0); // Set to idle frame
            // Maintain the background when the game is over
            return;
        }
    
        // Update player position based on input
        this.player.x += this.playerDx;
    
        // Move the player upwards automatically
        this.player.y += this.playerDy; // Player moves upwards at playerSpeed
    
        // Check if the player is running
        if (this.playerDx !== 0 || this.playerDy < 0) { 
            // Play running sound if not already playing
            if (!this.runningSound.isPlaying) {
                this.runningSound.play(); // Play running sound
            }
        } else {
            // If the player is not moving horizontally or vertically, stop the running sound
            if (this.runningSound.isPlaying) {
                this.runningSound.stop();
            }
        }
    
        // Move the background down to create a scrolling effect
        this.background1.y += this.backgroundSpeed;
        this.background2.y += this.backgroundSpeed;
    
        // Reset backgrounds when they are off-screen
        if (this.background1.y >= this.cameras.main.height) {
            this.background1.y = this.background2.y - this.cameras.main.height;
        }
        if (this.background2.y >= this.cameras.main.height) {
            this.background2.y = this.background1.y - this.cameras.main.height;
        }
    
        console.log(`Background1 Y: ${this.background1.y}, Background2 Y: ${this.background2.y}`);
    
        // Prevent player from moving off-screen horizontally
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.cameras.main.width) this.player.x = this.cameras.main.width;
    
        // Check if the player has reached the top of the screen
        if (this.player.y < 0) {
            this.player.y = this.cameras.main.height - 50; // Reset to bottom
            this.obstacleSpeed += 0.5; // Increase obstacle speed as difficulty increases
        }
    
        // Manage obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.y += this.obstacleSpeed;
    
            // Check for collision with the player
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), obstacle.getBounds())) {
                this.handleCollision();
            }
    
            // Remove off-screen obstacles and increase score
            if (obstacle.y > this.cameras.main.height) {
                this.score += 10; 
                this.scoreText.setText('Score: ' + this.score); // Update score text
                obstacle.destroy();
                this.obstacles.splice(index, 1);
            }
        });
    
        // Handle player animation based on movement
        if (this.playerDx !== 0 || this.playerDy < 0) {
            this.player.anims.play('walk', true); // Play walking/running animation when moving
        } else {
            this.player.anims.stop(); // Stop the animation when stationary
            this.player.setFrame(0); // Set to idle frame
        }
    }
    
    
    spawnObstacle() {
        if (this.gameOver || this.obstacles.length >= this.maxObstacles) {
            return;
        }
    
        // Ensure obstacles are spaced at least 400px apart vertically
        if (this.obstacles.length > 0 && this.lastObstacleY + 400 > this.cameras.main.height) {
            return; // Wait until the previous obstacle has moved far enough
        }
    
        // Define the center range for obstacle spawning
        const centerX = this.cameras.main.width / 2;
        const spawnRange = 150; // The range around the center where obstacles will spawn
    
        // Limit the obstacle X position to be more centered
        const randomXPosition = Phaser.Math.Between(centerX - spawnRange, centerX + spawnRange);
    
        // Create the obstacle and add it to the scene using the spritesheet's key and frame index
        const obstacle = this.physics.add.sprite(randomXPosition, 0, 'obstacles', 0); // Start at frame 0
    
        // Set the origin of the obstacle sprite to the center (0.5, 0.5) to keep it visually centered
        obstacle.setOrigin(0.5, 0.5);
        
        // Create an animation for the obstacle using frame indices (e.g., frame 0 and 1)
        this.anims.create({
            key: 'roll',
            frames: this.anims.generateFrameNumbers('obstacles', { start: 0, end: 1 }), // Using frame indices
            frameRate: 5,  // Adjust frame rate to control the rolling speed
            repeat: -1      // Repeat infinitely for continuous rolling
        });
    
        // Play the 'roll' animation
        obstacle.play('roll');
    
        // Add the obstacle to the array
        this.obstacles.push(obstacle);
        this.lastObstacleY = obstacle.y; // Update last obstacle Y position
    
        // Fix the Y position of the obstacle so it appears to stay in place
        obstacle.setVelocityY(0); // Ensure no vertical movement
    }
    
    
    
    handleCollision() {
        this.lives--; // Reduce lives by 1
        // Play biting sound when colliding with an obstacle
        this.bitingSound.play();
        // Remove one heart icon from the group
        const lastHeart = this.heartIcons.getChildren()[this.lives];
        if (lastHeart) {
            lastHeart.destroy();
        }

        // Display "Remaining lives: X" message
        this.hitMessage.setText('Remaining lives: ' + this.lives);
        this.hitMessage.visible = true;

        // Hide the message after 1.5 seconds
        this.time.delayedCall(1500, () => {
            this.hitMessage.visible = false;
        }, [], this);

        // Check if no lives are left
        if (this.lives <= 0) {
            this.gameOver = true;
            this.runningSound.stop(); // Stop running sound on game over
            this.gameOverSound.play(); // Play game over sound
            
            // Stop obstacle generation
            this.obstacleTimer.paused = true; // Stop obstacle spawning

            // Display "Lives are finished" and restart prompt
            this.restartMessage.setText('Lives are finished. Press R to restart.');
            this.restartMessage.visible = true;

            // Stop player movement
            this.player.setVelocity(0, 0);
        } else {
            // Reset player to starting position
            this.player.y = this.cameras.main.height - 50;
        }
    }
    
    handleMouseClick(pointer) {
        if (this.gameOver) return;
    
        console.log('Mouse clicked at: ', pointer.x, pointer.y); // Add this line to log the mouse coordinates
    
        // Control left/right movement
        if (pointer.x < this.cameras.main.width / 2) {
            this.playerDx = -5; // Move left
        } else {
            this.playerDx = 5; // Move right
        }
    
        // Stop moving left or right after a short time
        this.time.delayedCall(200, () => {
            this.playerDx = 0; // Stop player movement
        }, [], this);
    }
    

    
}
