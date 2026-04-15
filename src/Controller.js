export class Controller {
    constructor(wheel) {
        this.wheel = wheel;
        this.isCharging = false;
        this.chargePower = 0;
        this.chargeDir = 1;

        // Tạo sẵn Input ẩn để chọn file
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';
        this.targetWheelIndex = 1;

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            const code = e.code;
            if (code === 'Space' && this.wheel.rotationSpeed === 0) this.isCharging = true;
            if (code === 'KeyQ') this.wheel.nudge(-1);
            if (code === 'KeyW') this.wheel.nudge(1);

            // Chuyển vòng 6, 7, 8, 9
            if (code === 'Digit6') this.wheel.loadWheelConfig(1);
            if (code === 'Digit7') this.wheel.loadWheelConfig(2);
            if (code === 'Digit8') this.wheel.loadWheelConfig(3);
            if (code === 'Digit9') this.wheel.loadWheelConfig(4);

            // Phím 5: Nạp nón từ file
            if (code === 'Digit5') {
                const choice = prompt("Bạn muốn nạp file cho vòng nào? (Nhập 1, 2, 3 hoặc 4):", "1");
                if (choice && [1, 2, 3, 4].includes(Number(choice))) {
                    this.targetWheelIndex = Number(choice);
                    this.fileInput.click(); // Mở File Explorer
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isCharging) {
                this.isCharging = false;
                this.wheel.spin(this.chargePower);
                this.chargePower = 0;
            }
        });

        // Xử lý khi chọn file xong
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    // Cập nhật cấu hình và nạp luôn
                    this.wheel.configs[this.targetWheelIndex] = data;
                    this.wheel.loadWheelConfig(this.targetWheelIndex);
                    console.log(`Đã nạp thành công Wheel ${this.targetWheelIndex}`);
                } catch (err) {
                    alert("Lỗi: File JSON không đúng định dạng!");
                }
            };
            reader.readAsText(file);
        });
    }

    update(delta) {
        if (this.isCharging) {
            this.chargePower += 0.02 * this.chargeDir * delta;
            if (this.chargePower >= 1 || this.chargePower <= 0) this.chargeDir *= -1;
            // Meter đã bị ẩn, không gọi vẽ UI nữa
        }
    }
}