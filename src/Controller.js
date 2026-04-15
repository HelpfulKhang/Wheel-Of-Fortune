export class Controller {
    constructor(wheel) {
        this.wheel = wheel;
        this.isCharging = false;
        this.chargePower = 0;
        this.chargeDir = 1;

        // Audio
        this.menuSound = new Audio('/src/assets/sound/menu.mp3');
        this.menuSound.loop = true;
        this.spinSound = new Audio('/src/assets/sound/spin.mp3');

        // File nạp
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space': 
                    if (this.wheel.rotationSpeed === 0) this.isCharging = true; 
                    break;
                case 'KeyQ': this.wheel.nudge(-1); break;
                case 'KeyW': this.wheel.nudge(1); break;
                case 'KeyC': 
                    this.menuSound.paused ? this.menuSound.play() : this.menuSound.pause(); 
                    break;
                case 'KeyI': this.playIntro(); break;
                case 'Digit5': this.handleFileUpload(); break;
                case 'Digit6': this.wheel.loadWheelConfig(1); break;
                case 'Digit7': this.wheel.loadWheelConfig(2); break;
                case 'Digit8': this.wheel.loadWheelConfig(3); break;
                case 'Digit9': this.wheel.loadWheelConfig(4); break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isCharging) {
                this.isCharging = false;
                this.wheel.spin(this.chargePower);
                this.spinSound.currentTime = 0;
                this.spinSound.play();
                this.chargePower = 0;
            }
        });

        this.fileInput.onchange = (e) => this.processFile(e);
    }

    handleFileUpload() {
        this.targetIdx = prompt("Nạp cho vòng nào? (1-4):", "1");
        if (this.targetIdx >= 1 && this.targetIdx <= 4) this.fileInput.click();
    }

    processFile(e) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            this.wheel.configs[this.targetIdx] = data;
            this.wheel.loadWheelConfig(this.targetIdx);
        };
        reader.readAsText(e.target.files[0]);
    }

    update(delta) {
        if (this.isCharging) {
            this.chargePower += 0.02 * this.chargeDir * delta;
            if (this.chargePower >= 1 || this.chargePower <= 0) this.chargeDir *= -1;
        }
    }
}