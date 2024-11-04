export class Game extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        
        this.lives = 3;
        this.horizontalBoundary = 150;
        this.topBoundary = 100;
        this.scrollSpeed = 0.5;
        this.obstacleSpeed = 1;
        this.score = 0;
        this.gameOver = false;
        this.playerSpeed = 200; 
        this.playerJumpSpeed = 400; 
        this.maxObstacles = 5;
        this.chasingBoxSpeed = 6.5;
        this.obstacles = []; 
        this.chasingBoxMoving = true; // Moved here for scope control
    }

    create() {
        const { width, height } = this.cameras.main; 
        this.bottomBoundary = height - 50;
        this.setupEventListeners();
        this.initializeBackgrounds();
        this.createSounds();
        this.startSound.play(); 
        this.createPlayer();
        this.createScoreText();
        this.createHeartIcons(this.lives);
        this.updateHeartIcons();
        this.createHitMessage();
        this.createRestartMessage();
        this.createChasingBox();
        this.setupInput();
        this.startObstacleSpawning();
        this.startMovementLoop();
    }

    initializeBackgrounds() {
        const bgWidth = 800;
        const bgHeight = 600;

        this.background1 = this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(bgWidth, bgHeight);
        this.background2 = this.add.image(0, bgHeight, 'background').setOrigin(0, 0).setDisplaySize(bgWidth, bgHeight);
    }
    

    createSounds() {
        this.startSound = this.sound.add('start');
        this.gameOverSound = this.sound.add('gameOver');
        this.runningSound = this.sound.add('running');
        this.bitingSound = this.sound.add('biting');
        this.bonusSound = this.sound.add('bonus');
    }
    
    

    createPlayer() {
        this.player = this.physics.add.sprite(this.cameras.main.width / 2, this.bottomBoundary, 'player');
        this.player.setScale(2);
        this.createPlayerAnimations(); 
    }

    createScoreText() {
        this.scoreText = this.add.text(20, 30, 'Score: 0', {
            fontSize: '20px',
            fill: '#000'
        });
    }

    createHeartIcons(lives) {
        // Check if heartIcons exists and clear it completely
        if (this.heartIcons) {
            this.heartIcons.clear(true, true); // Clear existing icons and destroy them
        } else {
            this.heartIcons = this.add.group(); // Initialize if it doesn't exist
        }
    
        // Add hearts based on the number of lives
        for (let i = 0; i < lives; i++) {
            let heart = this.add.image(30 + i * 40, 70, 'heart').setScale(0.5);
            this.heartIcons.add(heart);
        }
    
        console.log("Creating heart icons with lives:", lives);
    }
    
    
    
    createPlayerAnimations() {
        const animationManager = this.player.anims;
      
        // Define the walking animation using your provided frames
        animationManager.create({
          key: 'walk',
          frames: [
            { key: 'player', frame: 0 },
            { key: 'player', frame: 1 }
          ],
          frameRate: 10,
          repeat: -1
        });
      
        // Consider adding a running animation if needed (example provided)
        // animationManager.create({
        //   key: 'run',
        //   frames: this.anims.generateFrameNames('player', { start: 4, end: 7, prefix: 'run_', suffix: '.png' }), // Replace with your running animation frame details
        //   frameRate: 15,
        //   repeat: -1
        // });
      
        // Play the walking animation by default
        this.player.anims.play('walk', true);
      }
    createHitMessage() {
        this.hitMessage = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '', {
            fontSize: '24px',
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);
        this.hitMessage.visible = false;
    }

    createRestartMessage() {
        this.restartMessage = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, '', {
            fontSize: '24px',
            fill: '#0000ff',
            align: 'center'
        }).setOrigin(0.5);
        this.restartMessage.visible = false;
    }
    
    createChasingBox() {
       
        // Create the chasing box, positioned below the player
        this.chasingBox = this.add.rectangle(this.player.x, this.player.y + 100, 50, 50, 0xff0000); // Positioned 100 pixels below the player
        this.physics.add.existing(this.chasingBox);
        console.log(this.chasingBox);
        // Set initial properties for chasing box
        this.chasingBox.body.setImmovable(true);
        this.chasingBox.body.setAllowGravity(false);
        
    }
    
    setupEventListeners() {
        // Add the click event listener to ensure the canvas has focus
        window.addEventListener('click', () => {
            // Use this.sys.game.canvas to reference the canvas
            this.sys.game.canvas.focus(); // Ensure the canvas has focus
        });
    }
    
    setupInput() {
        // Add keyboard controls for player movement
        this.cursors = this.input.keyboard.createCursorKeys();
    
        // Add mouse input for clicking
        this.input.on('pointer', () => this.handleMouseClick());
    }
    startObstacleSpawning() {
        // Create a timer or event to spawn obstacles at regular intervals
        this.obstacleTimer = this.time.addEvent({
            delay: 1500,                // Time between obstacle spawns (adjust as needed)
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });
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
        if (!this.anims.exists('roll')) {
            this.anims.create({
                key: 'roll',
                frames: this.anims.generateFrameNumbers('obstacles', { start: 0, end: 1 }),
                frameRate: 5,
                repeat: -1
            });
        }
        
    
        // Play the 'roll' animation
        obstacle.play('roll');
    
        // Add the obstacle to the array
        this.obstacles.push(obstacle);
        this.lastObstacleY = obstacle.y; // Update last obstacle Y position
    
        // Fix the Y position of the obstacle so it appears to stay in place
        obstacle.setVelocityY(0); // Ensure no vertical movement
    }
    
    handlePlayerHitObstacle(player, obstacle) {
        if (this.gameOver) return;
    
        this.lives--; 
        this.updateHeartIcons(); // Update heart icons after losing a life
        this.hitMessage.setText('Ouch!');
        if (this.bitingSound) this.bitingSound.play();
    
        this.hitMessage.setVisible(true);
        this.time.addEvent({ delay: 1000, callback: () => this.hitMessage.setVisible(false), callbackScope: this });
        this.cameras.main.shake(300, 0.01);
        
        if (this.lives > 0) {
            this.player.y = this.bottomBoundary;
            this.time.delayedCall(200, () => this.player.clearTint(), [], this);
        } else {
            this.endGame();
        }
        
        obstacle.destroy();
    }
    startMovementLoop() {
        // Only start the movement loop if the game is not over
        if (!this.gameOver) {
            // Play the running sound in a loop
            if (this.runningSound) {
                this.runningSound.play({ loop: true });
            }
    
            // Continuously update player position, background scrolling, chasing box movement, etc.
            this.time.addEvent({
                delay: 10, // Update interval
                callback: this.update,
                callbackScope: this,
                loop: true
            });
        }
    }
    update() {
        if (this.gameOver) {
            return; // Stop all updates if the game is over
        }
        this.handlePlayerMovement();
        this.updateChasingBox();
        this.updateBackground();
        this.handleObstacles();
        this.updateScore();
    }
    
    handlePlayerMovement() {
        if (this.cursors.left.isDown && this.player.x > this.horizontalBoundary) {
            this.player.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown && this.player.x < this.cameras.main.width - this.horizontalBoundary) {
            this.player.setVelocityX(this.playerSpeed);
        } else {
            this.player.setVelocityX(0); // Stops horizontal movement when no key is pressed
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-this.playerJumpSpeed);
        }
    
        // Simulate forward movement
        this.player.y -= 0.5;
        if (this.player.y < 0) {
            this.player.y = this.bottomBoundary;
        }
        if (this.gameOver) {
            return; // Stop movement updates if game over
        }
    }
    
    updateScore() {
        this.score += 1; // Increment score
        this.scoreText.setText('Score: ' + this.score); // Update score display
    }
    updateChasingBox() {
        if (this.chasingBoxMoving) {
            const targetX = this.player.x; // Set the target X to the player's X position
            const targetY = this.player.y + 150; // Maintain the target Y for vertical movement
        
            // Update both X and Y positions with a smooth transition
            this.chasingBox.x += (targetX - this.chasingBox.x) * 0.1;
            this.chasingBox.y += (targetY - this.chasingBox.y) * 0.1;
          }
          if (this.chasingBox.y < 0) this.chasingBox.y = this.bottomBoundary;
      }
    
    updateBackground() {
        this.background1.y += this.scrollSpeed;
        this.background2.y += this.scrollSpeed;
    
        if (this.background1.y >= this.cameras.main.height) {
            this.background1.y = this.background2.y - this.cameras.main.height;
        }
        if (this.background2.y >= this.cameras.main.height) {
            this.background2.y = this.background1.y - this.cameras.main.height;
        }
    }
    
    handleObstacles() {
        this.obstacles.forEach(obstacle => {
            obstacle.y += this.obstacleSpeed;
            if (this.physics.overlap(this.player, obstacle)) {
                this.handlePlayerHitObstacle(this.player, obstacle);
            }
            if (obstacle.y > this.cameras.main.height) {
                obstacle.destroy(); // Remove off-screen obstacles
                this.obstacles = this.obstacles.filter(o => o !== obstacle); // Update array
            }
        });
    }
    
    
    
    
    handleCollision() {
        this.lives--; 
        this.bitingSound.play();
        this.cameras.main.shake(300, 0.01);

        this.createHeartIcons(this.lives); // Refresh heart icons to match current lives

        this.hitMessage.setText('Remaining lives: ' + this.lives);
        this.hitMessage.visible = true;
    }


    updateHeartIcons() {
        // Ensure heartIcons group exists before accessing it
        if (this.heartIcons) {
            // Clear existing heart icons if they exist
            this.heartIcons.clear(true, true);
    
            // Add hearts based on the current number of lives
            for (let i = 0; i < this.lives; i++) {
                let heart = this.add.image(30 + i * 40, 70, 'heart').setScale(0.5);
                this.heartIcons.add(heart);
            }
            console.log("Updating heart icons with lives:", this.lives);
        }
    }
    


    clearObstacles() {
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles.length = 0; // Clear the array
    }
    restartGame() {
        this.lives = 3;
        this.score = 0;
        this.gameOver = false;
        this.heartIcons.clear(true, true); // Clear heart icons
        this.obstacles.forEach(obstacle => obstacle.destroy()); // Remove all obstacles
        this.obstacles = []; // Reset obstacles array
        this.player.setVelocityX(0); // Reset horizontal velocity
        this.player.setVelocityY(0); // Reset vertical velocity
        this.player.setPosition(this.cameras.main.width / 2, this.bottomBoundary); // Reset player position
        this.createHeartIcons(this.lives); // Recreate heart icons
        this.updateScore();
        // Restart sounds and timers
        this.startSound.play(); // Play start sound
        this.startObstacleSpawning(); // Restart obstacle spawning
        this.startMovementLoop(); // Restart movement loop
    }

    endGame() {
        this.gameOver = true;
        this.gameOverSound.play();
        this.chasingBoxMoving = false; // Use this flag to stop movement updates in updateChasingBox
        // Stop sounds and animations if necessary
        if (this.runningSound) {
            this.runningSound.stop();
        }
        // Display restart message
        this.restartMessage.setText("Game Over! Click to Restart");
        this.restartMessage.visible = true;
    
        // Listen for a restart click
        this.input.once('pointerdown', () => {
            this.restartMessage.visible = false;
            this.restartGame(); // Reset the game state
        });
    }
    handlePlayerMovementOnClick(pointer) {
        if (this.gameOver) return;
    
        // Calculate the target X position based on the click location
        const targetX = pointer.x;
    
        // Set the player's velocity to move towards the target X position
        this.player.setVelocityX((targetX - this.player.x) * this.playerSpeed);
    
        // Additionally, you can implement a time-based stopping mechanism:
        this.time.delayedCall(200, () => {
            this.player.setVelocityX(0); // Stop player movement after 200ms
        }, [], this);
    }
    
    handleMouseClick(pointer) {
        if (this.gameOver) return;
      
        console.log('Mouse clicked at: ', pointer.x, pointer.y);
      
        // Check if the mouse click is within the jump zone (adjust y-axis as needed)
        if (pointer.y < this.cameras.main.height / 2) {
          this.player.setVelocityY(-this.playerSpeed); // Initiate Jump
        } else {
          // Handle click-based movement (not implemented in this code snippet)
          this.handlePlayerMovementOnClick(pointer);
        }
    }

}
