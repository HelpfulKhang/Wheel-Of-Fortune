import { gsap } from 'gsap';

// Hàm helper chuẩn hóa Tiếng Việt (Bỏ dấu để reveal không dấu)
const removeAccents = (str) => {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export class Controller {
    constructor(wheel, scoreBoard, tickers, puzzleBoard) {
        this.wheel = wheel;
        this.scoreBoard = scoreBoard;
        this.tickers = tickers;
        this.puzzleBoard = puzzleBoard;

        // --- States Wheel ---
        this.isCharging = false;
        this.chargePower = 0;
        this.chargeDir = 1;
        this.mysteryState = 0;
        this.mysteryIndices = [];
        this.firstFlippedIdx = null;

        // --- States Puzzle & Show ---
        this.allPuzzles = null;
        this.puzzleSequence = [];
        this.currentPuzzleIdx = -1;

        // Tossup State
        this.isTossupRunning = false;
        this.tossupTimer = null;
        this.tossupSfxPlayed = false;

        // Final Spin State (Phím F)
        this.finalSpinState = 0; // 0: off, 1: active, 2: set value, 3: reset
        this.finalValuePerLetter = 0;

        // Thinking Music State (Phím Right Shift)
        this.thinkState = 0; // 0: off, 1: think, 2: think1, 3: 20s

        // --- Hệ thống âm thanh ---
        this.sounds = {
            start: new Audio('/src/assets/sound/start.mp3'),
            showpuzzle: new Audio('/src/assets/sound/showpuzzle.mp3'),
            toss: new Audio('/src/assets/sound/toss.mp3'),
            tosssolve: new Audio('/src/assets/sound/tosssolve.mp3'),
            solve: new Audio('/src/assets/sound/solve.mp3'),
            ding: new Audio('/src/assets/sound/ding.mp3'),
            buzzer: new Audio('/src/assets/sound/buzzer.mp3'),
            bankrupt: new Audio('/src/assets/sound/bankrupt.mp3'),
            spin: new Audio('/src/assets/sound/spin.mp3'),
            bonusSpin: new Audio('/src/assets/sound/bonusspin.mp3'),
            mystery: new Audio('/src/assets/sound/mystery.mp3'),
            finalspin: new Audio('/src/assets/sound/finalspin.mp3'),
            final: new Audio('/src/assets/sound/final.mp3'),
            speedup: new Audio('/src/assets/sound/speedup.mp3'),
            think: new Audio('/src/assets/sound/think.mp3'),
            think1: new Audio('/src/assets/sound/think1.mp3'),
            '20s': new Audio('/src/assets/sound/20s.mp3'),
            menu: new Audio('/src/assets/sound/menu.mp3')
        };
        this.sounds.menu.loop = true;

        this.puzzleInput = document.createElement('input');
        this.puzzleInput.type = 'file';
        this.puzzleInput.accept = '.json';

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';

        this.initListeners();
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            const activeIdx = this.scoreBoard.currentPlayerIndex;
            const currentWedge = this.wheel.getWedgeAtAngle(this.tickers[activeIdx].baseAngle);
            const wedgeIdx = this.getCurrentWedgeIndex(activeIdx);

            switch(e.code) {
                // --- VIEW & SYSTEM ---
                case 'Digit1': this.switchView('puzzle'); break;
                case 'Digit2': this.switchView('wheel'); break;
                case 'KeyI': this.sounds.start.play(); break;
                case 'KeyC': this.toggleMenu(); break;

                // --- ĐIỀU HƯỚNG Ô CHỮ (ARROWS) ---
                case 'ArrowRight': this.navigatePuzzle(1); break;
                case 'ArrowLeft': this.navigatePuzzle(-1); break;
                case 'ArrowUp': this.triggerReveal(); break;
                case 'ArrowDown': this.puzzleBoard.hideCategory(); break;

                // --- TOSSUP (PHÍM T) ---
                case 'KeyT': this.handleTossup(); break;

                // --- FINAL SPIN (PHÍM F) ---
                case 'KeyF': this.handleFinalSpin(); break;

                // --- THINKING MUSIC (SHIFT PHẢI) ---
                case 'ShiftRight': this.handleThinkingMusic(); break;

                // --- ĐỔI CHẾ ĐỘ SCOREBOARD (SHIFT TRÁI) ---
                case 'ShiftLeft': this.scoreBoard.toggleMode(); break;

                // --- GIẢI ĐỀ & LẬT BẢNG (BACKSPACE / EQUAL) ---
                case 'Equal': 
                    this.puzzleBoard.revealAll(true); 
                    if (this.scoreBoard.resetRoundScores) this.scoreBoard.resetRoundScores();
                    break;
                case 'Backspace': 
                    this.handleSolve(); 
                    break;

                // --- ĐOÁN CHỮ (G / 3) ---
                case 'KeyG': this.guessLetter(); break;
                case 'Digit3': this.revealRSTLNEE(); break;

                // --- LOGIC VÒNG QUAY ---
                case 'Space': 
                    if (this.wheel.rotationSpeed === 0) { 
                        this.isCharging = true; 
                        this.mysteryState = 0; 
                    } 
                    break;
                case 'Enter': this.handleEnter(currentWedge); break;
                case 'KeyQ': if (!this.isCharging) this.wheel.nudge(-1); break;
                case 'KeyW': if (!this.isCharging) this.wheel.nudge(1); break;
                case 'KeyB': 
                    this.sounds.bankrupt.play();
                    this.scoreBoard.bankrupt();
                    this.scoreBoard.setActivePlayer((activeIdx + 1) % 3);
                    break;
                case 'KeyM': this.handleMysteryLogic(wedgeIdx); break;
                case 'KeyD': // MDW
                    this.wheel.flipWedgeAnimation(wedgeIdx, 'MDW-Back', () => {
                        this.scoreBoard.addInventory("MDW");
                        setTimeout(() => this.wheel.updateWedge(wedgeIdx, this.wheel.replaceWedgeName), 2000);
                    });
                    break;
                case 'KeyP': this.powerTheft(activeIdx); break;

                // --- PHÍM 6, 7, 8, 9, 0 (NẠP CẤU HÌNH NHANH) ---
                case 'Digit6': this.wheel.loadWheelConfig(1); break;
                case 'Digit7': this.wheel.loadWheelConfig(2); break;
                case 'Digit8': this.wheel.loadWheelConfig(3); break;
                case 'Digit9': this.wheel.loadWheelConfig(4); break;
                case 'Digit0': 
                    const hasMDW = this.scoreBoard.players[activeIdx].inventory.includes("MDW");
                    this.wheel.loadBonusWheel();
                    this.wheel.shuffleBonusPrizes(hasMDW);
                    break;
                
                // --- NẠP FILE (4 & 5) ---
                case 'Digit4': this.puzzleInput.click(); break;
                case 'Digit5': this.openFileExplorer(); break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isCharging) {
                this.isCharging = false;
                this.wheel.spin(this.chargePower);
                
                let sfx = this.sounds.spin;
                if (this.finalSpinState === 1) sfx = this.sounds.final;
                else if (this.wheel.isBonus) sfx = this.sounds.bonusSpin;
                
                sfx.currentTime = 0; sfx.play();
                this.chargePower = 0;
            }
        });

        this.puzzleInput.onchange = (e) => this.handlePuzzleFile(e);
        this.fileInput.onchange = (e) => this.handleWheelFile(e);
    }

    // --- LOGIC TOSSUP (PHÍM T) ---
    handleTossup() {
        if (this.isTossupRunning) {
            this.isTossupRunning = false;
            clearInterval(this.tossupTimer);
            this.sounds.ding.play();
        } else {
            this.isTossupRunning = true;
            if (!this.tossupSfxPlayed) {
                this.sounds.toss.currentTime = 0;
                this.sounds.toss.play();
                this.tossupSfxPlayed = true;
            } else {
                this.sounds.buzzer.play();
            }

            this.tossupTimer = setInterval(() => {
                const hidden = this.puzzleBoard.activeTiles.filter(t => !t.isRevealed);
                if (hidden.length > 0) {
                    const random = hidden[Math.floor(Math.random() * hidden.length)];
                    this.puzzleBoard.revealTile(random, false);
                } else {
                    this.stopTossup();
                }
            }, 1500);
        }
    }

    // --- LOGIC GIẢI (BACKSPACE) ---
    handleSolve() {
        const item = this.puzzleSequence[this.currentPuzzleIdx];
        if (!item) return;

        const id = item.id; 
        if (id.toLowerCase().includes('toss')) {
            this.sounds.tosssolve.play();
            this.sounds.toss.pause();
            if (this.scoreBoard.addTossupScore) this.scoreBoard.addTossupScore(id);
        } else {
            this.sounds.solve.play();
            if (this.scoreBoard.resetToss3Streaks) this.scoreBoard.resetToss3Streaks();
        }

        // CỘNG ĐIỂM VÀO TÍCH LŨY (TOTAL) VÀ RESET ĐIỂM VÒNG (SCORE)
        if (this.scoreBoard.bankScore) {
            this.scoreBoard.bankScore(this.scoreBoard.currentPlayerIndex);
        }

        this.puzzleBoard.revealAll(true);
        this.stopTossup();
    }

    // --- FINAL SPIN (PHÍM F) ---
    handleFinalSpin() {
        this.finalSpinState++;
        if (this.finalSpinState === 1) {
            this.sounds.finalspin.play();
        } else if (this.finalSpinState === 2) {
            const activeIdx = this.scoreBoard.currentPlayerIndex;
            const currentWedge = this.wheel.getWedgeAtAngle(this.tickers[activeIdx].baseAngle);
            const val = parseInt(currentWedge.replace(/[^0-9]/g, '')) || 0;
            this.finalValuePerLetter = 1000 + val;
            this.sounds.speedup.play();
        } else {
            this.finalSpinState = 0;
            this.sounds.speedup.pause();
        }
    }

    // --- THINKING MUSIC (SHIFT PHẢI) ---
    handleThinkingMusic() {
        this.sounds.think.pause(); this.sounds.think1.pause(); this.sounds['20s'].pause();
        this.sounds.think.currentTime = 0; this.sounds.think1.currentTime = 0; this.sounds['20s'].currentTime = 0;

        this.thinkState = (this.thinkState % 3) + 1;
        if (this.thinkState === 1) this.sounds.think.play();
        else if (this.thinkState === 2) this.sounds.think1.play();
        else if (this.thinkState === 3) this.sounds['20s'].play();
    }

    // --- LOGIC NHẬN ĐIỂM (ENTER) ---
    handleEnter(wedgeName) {
        if (this.wheel.isBonus) {
            this.revealBonusEnvelope();
        } else if (this.finalSpinState === 2) {
            this.scoreBoard.addScore(this.finalValuePerLetter);
            this.sounds.ding.play();
        } else {
            const pts = parseInt(wedgeName.replace(/[^0-9]/g, '')) || 500;
            this.scoreBoard.addScore(pts);
        }
    }

    // --- ĐOÁN CHỮ & HỖ TRỢ ---
    guessLetter() {
        const input = prompt("Nhập chữ cái (không dấu):");
        if (!input) return;
        const letter = removeAccents(input.toUpperCase().charAt(0));
        
        // matches tự động theo thứ tự từ trái sang phải
        const matches = this.puzzleBoard.activeTiles.filter(t => t.baseChar === letter && !t.isRevealed);
        
        if (matches.length > 0) {
            matches.forEach((t, index) => {
                // Delay 1 giây cho mỗi ô kế tiếp
                gsap.delayedCall(index * 1, () => {
                    this.sounds.ding.currentTime = 0; // Trả về 0 để tiếng ding vang lên đủ số lần
                    this.sounds.ding.play();
                    this.puzzleBoard.revealTile(t, false);
                });
            });
        } else {
            this.sounds.buzzer.play();
        }
    }

    revealRSTLNEE() {
        const list = ["R", "S", "T", "L", "N", "E", "Ê"];
        const matches = this.puzzleBoard.activeTiles.filter(t => list.includes(t.char) && !t.isRevealed);
        if (matches.length > 0) {
            this.sounds.ding.play();
            matches.forEach(t => this.puzzleBoard.revealTile(t, false));
        }
    }

    // --- NẠP & ĐIỀU HƯỚNG ---
    handlePuzzleFile(e) {
        const r = new FileReader();
        r.onload = (ev) => {
            try {
                this.allPuzzles = JSON.parse(ev.target.result);
                this.puzzleSequence = [];
                Object.keys(this.allPuzzles).forEach(k => {
                    const val = this.allPuzzles[k];
                    if (Array.isArray(val)) val.forEach(v => this.puzzleSequence.push({ id: k, data: v }));
                    else this.puzzleSequence.push({ id: k, data: val });
                });
                this.currentPuzzleIdx = 0;
                this.loadCurrentPuzzle();
            } catch (err) { alert("Lỗi JSON!"); }
        };
        r.readAsText(e.target.files[0]);
    }

    navigatePuzzle(dir) {
        if (!this.allPuzzles) return;
        const next = this.currentPuzzleIdx + dir;
        if (next >= 0 && next < this.puzzleSequence.length) {
            this.currentPuzzleIdx = next;
            this.resetTossupState();
            this.loadCurrentPuzzle();
        }
    }

    loadCurrentPuzzle() {
        const item = this.puzzleSequence[this.currentPuzzleIdx];
        if (item) {
            this.puzzleBoard.loadPuzzle(item.data.text);
            this.puzzleBoard.hideCategory();
            this.switchView('puzzle');
        }
    }

    triggerReveal() {
        const item = this.puzzleSequence[this.currentPuzzleIdx];
        if (item) {
            this.sounds.showpuzzle.play();
            this.puzzleBoard.showCategory(item.data.category);
            this.puzzleBoard.revealTiles();
        }
    }

    // --- WHEEL HELPERS ---
    handleMysteryLogic(idx) {
        this.mysteryState++;
        if (this.mysteryState === 1) {
            this.sounds.mystery.play();
            this.mysteryIndices = [];
            this.wheel.configs[this.wheel.currentRound].forEach((w, i) => { if (w === 'Mystery') this.mysteryIndices.push(i); });
            const is10 = Math.random() > 0.5;
            this.mysteryOutcomes = is10 ? ['Mystery-10000', 'Mystery-Bankrupt'] : ['Mystery-Bankrupt', 'Mystery-10000'];
        } else if (this.mysteryState === 2) {
            this.firstFlippedIdx = idx;
            const res = this.mysteryOutcomes[0];
            this.wheel.flipWedgeAnimation(idx, res, () => {
                if (res === 'Mystery-10000') this.scoreBoard.addScore(10000);
                else { this.sounds.bankrupt.play(); this.scoreBoard.bankrupt(); this.scoreBoard.setActivePlayer((this.scoreBoard.currentPlayerIndex + 1) % 3); }
            });
        } else if (this.mysteryState === 3) {
            const other = this.mysteryIndices.find(i => i !== this.firstFlippedIdx);
            if (other !== undefined) this.wheel.flipWedgeAnimation(other, this.mysteryOutcomes[1]);
        } else if (this.mysteryState === 4) {
            this.mysteryIndices.forEach(i => this.wheel.updateWedge(i, this.wheel.replaceWedgeName));
            this.mysteryState = 0;
        }
    }

    powerTheft(activeIdx) {
        const target = prompt("Cướp điểm từ người chơi nào? (1, 2, hoặc 3):");
        if (target && target != (activeIdx + 1)) {
            const tIdx = parseInt(target) - 1;
            if (tIdx >= 0 && tIdx < 3) {
                this.scoreBoard.players[activeIdx].score += this.scoreBoard.players[tIdx].score;
                this.scoreBoard.players[tIdx].score = 0;
            }
        }
    }

    revealBonusEnvelope() {
        const activeIdx = this.scoreBoard.currentPlayerIndex;
        const wedgeIdx = this.getCurrentWedgeIndex(activeIdx);
        const finalPrize = this.wheel.bonusPrizes[wedgeIdx];
        const pool = [25000, 30000, 35000, 40000, 45000, 50000, 100000, 1000000];
        let s = Date.now();
        this.scoreBoard.displayMode = 1;
        const interval = setInterval(() => {
            if (Date.now() - s < 10000) this.scoreBoard.players[activeIdx].score = pool[Math.floor(Math.random() * pool.length)];
            else { clearInterval(interval); this.scoreBoard.players[activeIdx].score = finalPrize; gsap.fromTo(this.scoreBoard.boxes[activeIdx].container, { alpha: 0.3 }, { alpha: 1, duration: 0.1, repeat: 10 }); }
        }, 80);
    }

    // --- HÀM HỖ TRỢ CHUNG ---
    stopTossup() { this.isTossupRunning = false; clearInterval(this.tossupTimer); }
    resetTossupState() { this.stopTossup(); this.tossupSfxPlayed = false; this.sounds.toss.pause(); }
    switchView(v) { const isP = v === 'puzzle'; this.wheel.group.visible = !isP; this.tickers.forEach(t => t.container.visible = !isP); this.puzzleBoard.group.visible = isP; }
    getCurrentWedgeIndex(pIdx) { let angle = (this.tickers[pIdx].baseAngle - this.wheel.spinContainer.rotation) % (Math.PI * 2); if (angle < 0) angle += Math.PI * 2; return Math.floor((angle / this.wheel.angleStep) + 0.5) % 24; }
    toggleMenu() { 
        if (this.sounds.menu.paused) {
            this.sounds.menu.play();
        } else {
            this.sounds.menu.pause();
            this.sounds.menu.currentTime = 0; // Chuyển về 0 để tạo hiệu ứng Stop
        }
    }
    openFileExplorer() {
        const i = prompt("Nạp cấu hình cho vòng quay nào? (1-4):", "1"); 
        if (i >= 1 && i <= 4) { this.targetIdx = parseInt(i); this.fileInput.click(); } 
    }
    handleWheelFile(e) { 
        const r = new FileReader(); 
        r.onload = (ev) => { 
            const d = JSON.parse(ev.target.result); 
            this.wheel.configs[this.targetIdx] = d; 
            this.wheel.loadWheelConfig(this.targetIdx); 
        }; 
        r.readAsText(e.target.files[0]); 
    }

    update(delta) {
        if (this.isCharging) {
            this.chargePower += 0.02 * this.chargeDir * delta;
            if (this.chargePower >= 1 || this.chargePower <= 0) this.chargeDir *= -1;
        }
        if (this.scoreBoard) this.scoreBoard.update(this.wheel, this.tickers);
    }
}