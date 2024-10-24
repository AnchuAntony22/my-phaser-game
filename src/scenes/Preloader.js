// src/scenes/Preloader.js
export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        // No assets to preload since we're working with simple shapes
        this.load.image('background', 'src/assets/background_forest.png');
        // Load the character sprite sheet with frame dimensions
        this.load.spritesheet('player', 'src/assets/spritesheet_Player.png', { 
            frameWidth: 26, // Set this to the width of each frame
            frameHeight: 61 // Set this to the height of each frame
        });
         // Load the obstacle sprite sheet
        this.load.spritesheet('obstacles', 'src/assets/log_spritesheet(2).png', {
            frameWidth: 200, 
            frameHeight: 80 
        });

        this.load.image('heart', 'src/assets/heart(1).png');
        // Load your audio files here
        this.load.audio('start', 'src/assets/game_says_start.mp3');     
        this.load.audio('gameOver', 'src/assets/game_over.mp3'); 
        this.load.audio('running', 'src/assets/running_movements.mp3');  
        this.load.audio('biting', 'src/assets/body_hit_or_kick.mp3');  

    
    }

    create() {
        this.scene.start('MainMenu'); // Go to MainMenu scene
    }
}
