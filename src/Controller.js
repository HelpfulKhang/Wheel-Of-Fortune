import { gsap } from 'gsap';

export class Controller {
    constructor(wheel, scoreBoard, tickers) {
        this.wheel = wheel;
        this.scoreBoard = scoreBoard;
        this.tickers = tickers;
        this.isCharging = false;
        this.chargePower = 0;
        this.chargeDir = 1;
        
        // Trạng thái ô Mystery (0: reset, 1: nhạc, 2: lật ô hiện tại, 3: lật ô còn lại, 4: thay thế)
        this.mysteryState = 0; 

        // Khởi tạo âm thanh
        this.sounds = {
            menu: new Audio('/src/assets/sound/menu.mp3'),
            spin: new Audio('/src/assets/sound/spin.mp3'),
            bonusSpin: new Audio('/src/assets/sound/bonusspin.mp3'),
            bankrupt: new Audio('/src/assets/sound/bankrupt.mp3'),
            express: new Audio('/src/assets/sound/express.mp3'),
            mystery: new Audio('/src/assets/sound/mystery.mp3')
        };
        this.sounds.menu.loop = true;

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';
        this.targetIdx = 1;

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            const activePlayerIdx = this.scoreBoard.currentPlayerIndex;
            const currentWedge = this.wheel.getWedgeAtAngle(this.tickers[activePlayerIdx].baseAngle);
            const wedgeIdx = this.getCurrentWedgeIndex(activePlayerIdx);

            switch(e.code) {
                // --- VÒNG QUAY ---
                case 'Space': 
                    if (this.wheel.rotationSpeed === 0) {
                        this.isCharging = true;
                        this.mysteryState = 0; 
                    }
                    break;
                case 'KeyQ': 
                    if (!this.isCharging) this.wheel.nudge(-1); 
                    break;
                case 'KeyW': 
                    if (!this.isCharging) this.wheel.nudge(1); 
                    break;

                // --- ĐIỂM SỐ & LƯỢT CHƠI ---
                case 'Enter': 
                    this.handleScoreLogic(currentWedge);
                    break;
                case 'KeyB': // Bankrupt
                    this.sounds.bankrupt.play();
                    this.scoreBoard.bankrupt();
                    this.scoreBoard.setActivePlayer((activePlayerIdx + 1) % 3);
                    break;
                case 'ShiftLeft': 
                    this.scoreBoard.toggleMode(); 
                    break;

                // --- CÁC Ô ĐẶC BIỆT ---
                case 'KeyE': // Express
                    this.sounds.express.play();
                    break;

                case 'KeyD': // Million Dollar Wedge (MDW)
                    this.wheel.flipWedgeAnimation(wedgeIdx, 'MDW-Back', () => {
                        this.scoreBoard.addInventory("MDW");
                        setTimeout(() => {
                            this.wheel.updateWedge(wedgeIdx, this.wheel.replaceWedgeName);
                        }, 2000);
                    });
                    break;

                case 'KeyM': // Mystery
                    this.handleMysteryLogic(wedgeIdx);
                    break;

                case 'KeyP': // Power - Cướp điểm
                    const victim = prompt("Cướp điểm từ người chơi nào? (1, 2, hoặc 3):");
                    if (victim && victim != (activePlayerIdx + 1)) {
                        const vIdx = parseInt(victim) - 1;
                        if (vIdx >= 0 && vIdx < 3) {
                            this.scoreBoard.players[activePlayerIdx].score += this.scoreBoard.players[vIdx].score;
                            this.scoreBoard.players[vIdx].score = 0;
                        }
                    }
                    break;

                case 'KeyS': // Wild Card (Phím S theo yêu cầu)
                    this.scoreBoard.addInventory("WILD");
                    const wrapper = this.wheel.spinContainer.children[wedgeIdx];
                    if (wrapper && wrapper.children[1]) {
                        gsap.to(wrapper.children[1].scale, { x: 0, y: 0, duration: 0.5 });
                    }
                    break;

                // --- HỆ THỐNG & MEDIA ---
                case 'KeyC': this.toggleMenu(); break;
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
                const sound = this.wheel.isBonus ? this.sounds.bonusSpin : this.sounds.spin;
                sound.currentTime = 0;
                sound.play();
                this.chargePower = 0;
            }
        });

        this.fileInput.onchange = (e) => this.handleFile(e);
    }

    handleScoreLogic(wedgeName) {
        const name = wedgeName.toUpperCase();
        if (name.includes("EXPRESS") || name.includes("MYSTERY")) {
            this.scoreBoard.addScore(1000);
        } else if (name.includes("FREE PLAY")) {
            this.scoreBoard.addScore(500);
        } else {
            const pts = parseInt(name.replace(/[^0-9]/g, ''));
            if (!isNaN(pts)) this.scoreBoard.addScore(pts);
        }
    }

    handleMysteryLogic(currentTickerWedgeIdx) {
        this.mysteryState++;
    
        if (this.mysteryState === 1) {
            this.sounds.mystery.play();
            
            // 1. Tìm và lưu lại vị trí của TẤT CẢ các ô Mystery có trên vòng quay hiện tại
            this.mysteryIndices = [];
            const config = this.wheel.configs[this.wheel.currentRound];
            config.forEach((w, i) => {
                if (typeof w === 'string' && w === 'Mystery') {
                    this.mysteryIndices.push(i);
                }
            });
    
            // 2. Random kết quả 50/50
            const firstIs10k = Math.random() > 0.5;
            this.mysteryOutcomes = firstIs10k 
                ? ['Mystery-10000', 'Mystery-Bankrupt'] 
                : ['Mystery-Bankrupt', 'Mystery-10000'];
                
            console.log("Đã xác định vị trí Mystery tại các index:", this.mysteryIndices);
        } 
        else if (this.mysteryState === 2) {
            // Lật ô ngay dưới kim của người chơi
            // Chúng ta lưu lại index này để State 3 biết đường mà tránh
            this.firstFlippedIdx = currentTickerWedgeIdx;
            const result = this.mysteryOutcomes[0];
    
            this.wheel.flipWedgeAnimation(this.firstFlippedIdx, result, () => {
                if (result === 'Mystery-10000') {
                    this.scoreBoard.addScore(10000);
                } else {
                    this.sounds.bankrupt.play();
                    this.scoreBoard.bankrupt();
                    this.scoreBoard.setActivePlayer((this.scoreBoard.currentPlayerIndex + 1) % 3);
                }
            });
        } 
        else if (this.mysteryState === 3) {
            // Lật ô CÒN LẠI (Ô nằm trong danh sách mysteryIndices nhưng không phải ô vừa lật)
            const otherIdx = this.mysteryIndices.find(idx => idx !== this.firstFlippedIdx);
            
            if (otherIdx !== undefined) {
                this.wheel.flipWedgeAnimation(otherIdx, this.mysteryOutcomes[1]);
            } else {
                console.warn("Không tìm thấy ô Mystery thứ hai!");
            }
        } 
        else if (this.mysteryState === 4) {
            // Thay thế cả 2 ô bằng wedge mặc định (500 Green chẳng hạn)
            this.mysteryIndices.forEach(idx => {
                this.wheel.updateWedge(idx, this.wheel.replaceWedgeName);
            });
            
            // Reset trạng thái để dùng cho lần quay trúng Mystery tiếp theo
            this.mysteryState = 0;
            this.mysteryIndices = [];
            this.firstFlippedIdx = null;
        }
    }

    getCurrentWedgeIndex(playerIdx) {
        let angle = (this.tickers[playerIdx].baseAngle - this.wheel.spinContainer.rotation) % (Math.PI * 2);
        if (angle < 0) angle += Math.PI * 2;
        return Math.floor((angle / this.wheel.angleStep) + 0.5) % 24;
    }

    toggleMenu() {
        this.sounds.menu.paused ? this.sounds.menu.play() : this.sounds.menu.pause();
    }

    openFileExplorer() {
        const input = prompt("Bạn muốn nạp cho vòng nào? (1-4):", "1");
        if (input >= 1 && input <= 4) {
            this.targetIdx = parseInt(input);
            this.fileInput.click();
        }
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
        if (this.scoreBoard) {
            this.scoreBoard.update(this.wheel, this.tickers);
        }
    }
}