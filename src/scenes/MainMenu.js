// src/scenes/MainMenu.js
export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        // Add the background image
        this.add.image(400, 300, 'background').setOrigin(0.5).setDisplaySize(800, 600);

        this.add.text(400, 300, 'Main Menu', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, 'Press Space to Start', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('Game'); // Start the game when space is pressed
        });
    }
}
