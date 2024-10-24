// src/scenes/Boot.js
export class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // No assets to load in the boot scene
    }

    create() {
        this.scene.start('Preloader'); // Go to Preloader scene
    }
}
