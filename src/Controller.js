export class Controller {
    constructor(wheel) {
        this.wheel = wheel;
        this.isCharging = false;
        this.chargePower = 0;
        this.chargeDir = 1;

        this.menuSound = new Audio('/src/assets/sound/menu.mp3');
        this.menuSound.loop = true;
        this.spinSound = new Audio('/src/assets/sound/spin.mp3');
        this.bonusSpinSound = new Audio('/src/assets/sound/bonusspin.mp3');

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';
        this.targetIdx = 1;

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space': if (this.wheel.rotationSpeed === 0) this.isCharging = true; break;
                case 'KeyQ': this.wheel.nudge(-1); break;
                case 'KeyW': this.wheel.nudge(1); break;
                case 'KeyC': this.toggleMenu(); break;
                // Intro phím I đã bị loại bỏ ở đây
                case 'Digit6': this.wheel.loadWheelConfig(1); break;
                case 'Digit7': this.wheel.loadWheelConfig(2); break;
                case 'Digit8': this.wheel.loadWheelConfig(3); break;
                case 'Digit9': this.wheel.loadWheelConfig(4); break;
                case 'Digit0': this.wheel.loadBonusWheel(); break;
                case 'Digit5': this.openFileExplorer(); break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isCharging) {
                this.isCharging = false;
                this.wheel.spin(this.chargePower);
                const sound = this.wheel.isBonus ? this.bonusSpinSound : this.spinSound;
                sound.currentTime = 0; sound.play();
                this.chargePower = 0;
            }
        });

        this.fileInput.onchange = (e) => this.handleFile(e);
    }

    toggleMenu() {
        this.menuSound.paused ? this.menuSound.play() : this.menuSound.pause();
    }

    openFileExplorer() {
        const input = prompt("Bạn muốn nạp cho vòng nào? (1-4):", "1");
        if (input >= 1 && input <= 4) { this.targetIdx = parseInt(input); this.fileInput.click(); }
    }

    handleFile(e) {
        const r = new FileReader();
        r.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                this.wheel.configs[this.targetIdx] = data;
                this.wheel.loadWheelConfig(this.targetIdx);
            } catch (err) { alert("Lỗi JSON!"); }
        };
        r.readAsText(e.target.files[0]);
    }

    update(delta) {
        if (this.isCharging) {
            this.chargePower += 0.02 * this.chargeDir * delta;
            if (this.chargePower >= 1 || this.chargePower <= 0) this.chargeDir *= -1;
        }
    }
}