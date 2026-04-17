import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class ScoreBoard {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        this.players = [
            { name: "PLAYER 1", color: 0xff0000, score: 0, total: 0, inventory: [], toss3Solves: 0 },
            { name: "PLAYER 2", color: 0xffff00, score: 0, total: 0, inventory: [], toss3Solves: 0 },
            { name: "PLAYER 3", color: 0x0000ff, score: 0, total: 0, inventory: [], toss3Solves: 0 }
        ];

        this.boxes = [];
        this.displayMode = 1; // 1: Round, 2: Total, 3: Wedge, 4: Inventory
        this.currentPlayerIndex = 0;
        this.init();
        this.setActivePlayer(0);
    }

    init() {
        const boxWidth = 350;
        const boxHeight = 120;
        const spacing = 50;
        const startX = (1920 - (boxWidth * 3 + spacing * 2)) / 2;
        const startY = 900;

        this.players.forEach((p, i) => {
            const playerBox = new PIXI.Container();
            playerBox.x = startX + i * (boxWidth + spacing);
            playerBox.y = startY;
            playerBox.eventMode = 'static'; // Cho phép tương tác
            playerBox.cursor = 'pointer';
            playerBox.on('pointerdown', () => this.setActivePlayer(i));

            // Thanh xám tên
            const header = new PIXI.Graphics().rect(0, 0, boxWidth, 40).fill(0x444444).stroke({ width: 2, color: 0xffffff });
            const nameText = new PIXI.Text({ text: p.name, style: { fontFamily: 'HelveticaNeueCondensedBlack', fontSize: 28, fill: 0xffffff } });
            nameText.anchor.set(0.5); nameText.position.set(boxWidth / 2, 20);

            // Box màu
            const body = new PIXI.Graphics().rect(0, 40, boxWidth, boxHeight - 40).fill(p.color).stroke({ width: 2, color: 0xffffff });

            // Nội dung hiển thị
            const contentText = new PIXI.Text({ text: "0", style: { fontFamily: 'Chesterfield Regular', fontSize: 45, fill: (p.color === 0xffff00) ? 0x000000 : 0xffffff, align: 'center' } });
            contentText.anchor.set(0.5); contentText.position.set(boxWidth / 2, 80);

            playerBox.addChild(header, body, nameText, contentText);
            this.container.addChild(playerBox);
            this.boxes.push({ container: playerBox, text: contentText, header: header, nameText: nameText });
        });
    }

    // Đưa điểm vòng (score) của cả 3 người chơi về 0
    resetRoundScores() {
        this.players.forEach(p => p.score = 0);
    }

    // Cộng điểm vòng vào điểm tích lũy (total) cho người thắng, rồi reset vòng
    bankScore(playerIndex, isRegularRound = false) {
        let currentScore = this.players[playerIndex].score;
        
        // LUẬT HOUSE MINIMUM: Nếu là vòng thường và điểm < 1000, mặc định cộng 1000
        if (isRegularRound && currentScore < 1000) {
            currentScore = 1000;
        }

        this.players[playerIndex].total += currentScore;
        this.resetRoundScores();
    }

    setActivePlayer(index) {
        this.currentPlayerIndex = index;
        this.boxes.forEach((box, i) => {
            gsap.killTweensOf(box.container);
            if (i === index) {
                // Hiệu ứng nhấp nháy cho người đang tới lượt
                box.header.clear().rect(0, 0, 350, 40).fill(0xeeeeee).stroke({ width: 2, color: 0x000000 });
                box.nameText.style.fill = 0x000000;
                gsap.to(box.container, { alpha: 0.6, duration: 0.4, repeat: -1, yoyo: true });
            } else {
                box.header.clear().rect(0, 0, 350, 40).fill(0x444444).stroke({ width: 2, color: 0xffffff });
                box.nameText.style.fill = 0xffffff;
                box.container.alpha = 1;
            }
        });
    }

    update(wheel, tickers) {
        this.boxes.forEach((box, i) => {
            if (this.displayMode === 1) box.text.text = this.players[i].score.toLocaleString();
            else if (this.displayMode === 2) box.text.text = this.players[i].total.toLocaleString();
            else if (this.displayMode === 3) box.text.text = wheel.getWedgeAtAngle(tickers[i].baseAngle);
            else if (this.displayMode === 4) box.text.text = this.players[i].inventory.join(", ") || "EMPTY";
            
            box.text.style.fontSize = (this.displayMode >= 3) ? 22 : 45;
        });
    }

    toggleMode() { this.displayMode = (this.displayMode % 4) + 1; }
    
    addScore(pts) { this.players[this.currentPlayerIndex].score += pts; }
    
    bankrupt() {
        this.players[this.currentPlayerIndex].score = 0;
        this.players[this.currentPlayerIndex].inventory = [];
    }

    addInventory(item) {
        if (!this.players[this.currentPlayerIndex].inventory.includes(item)) {
            this.players[this.currentPlayerIndex].inventory.push(item);
        }
    }

    addTossupScore(type) {
        const p = this.players[this.currentPlayerIndex];
        if (type === 'Toss1') p.score += 1000;
        else if (type === 'Toss2') p.score += 2000;
        else if (type.startsWith('Toss3')) {
            p.score += 2000;
            p.toss3Solves++;
            if (p.toss3Solves === 3) p.score += 4000; // Thưởng nếu giải đúng cả 3
        }
    }

    resetToss3Streaks() {
        this.players.forEach(p => p.toss3Solves = 0);
    }
}