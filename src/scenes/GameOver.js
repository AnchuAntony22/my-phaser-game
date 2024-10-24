// src/scenes/GameOver.js
export class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOver' });
    }

    init(data) {
        this.finalScore = data.score;
        console.log('Final Score:', this.finalScore); // Debugging log
    }

    create() {
        this.add.text(400, 300, 'Game Over', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, 'Score: ' + this.finalScore, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 500, 'Press SPACE to Restart', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        // Restart the game when the spacebar is pressed
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game'); // Restart the Game scene
        });
    }
}
