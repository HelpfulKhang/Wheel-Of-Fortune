import * as PIXI from 'pixi.js';

export class ScoreBoard {
    constructor(app) {
        this.app = app;
        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        this.players = [
            { name: "PLAYER 1", color: 0xff0000, score: 0, total: 0 },
            { name: "PLAYER 2", color: 0xffff00, score: 0, total: 0 },
            { name: "PLAYER 3", color: 0x0000ff, score: 0, total: 0 }
        ];

        this.boxes = [];
        this.displayMode = 1; // 1: Round, 2: Total, 3: Wedge
        this.init();
    }

    init() {
        const boxWidth = 350;
        const boxHeight = 120;
        const spacing = 50;
        const startX = (1920 - (boxWidth * 3 + spacing * 2)) / 2;
        const startY = 900; // Vị trí dưới vòng quay

        this.players.forEach((p, i) => {
            const playerBox = new PIXI.Container();
            playerBox.x = startX + i * (boxWidth + spacing);
            playerBox.y = startY;

            // 1. Thanh xám tên Player
            const header = new PIXI.Graphics()
                .rect(0, 0, boxWidth, 40)
                .fill(0x444444)
                .stroke({ width: 2, color: 0xffffff });
            
            const nameText = new PIXI.Text({
                text: p.name,
                style: {
                    fontFamily: 'HelveticaNeueCondensedBlack',
                    fontSize: 28,
                    fill: 0xffffff
                }
            });
            nameText.anchor.set(0.5);
            nameText.position.set(boxWidth / 2, 20);

            // 2. Box điểm màu tương ứng
            const body = new PIXI.Graphics()
                .rect(0, 40, boxWidth, boxHeight - 40)
                .fill(p.color)
                .stroke({ width: 2, color: 0xffffff });

            // 3. Văn bản hiển thị nội dung bên trong
            const contentText = new PIXI.Text({
                text: "0",
                style: {
                    fontFamily: 'HelveticaNeueCondensedBlack',
                    fontSize: 45,
                    fill: (p.color === 0xffff00) ? 0x000000 : 0xffffff, // Đổi màu chữ nếu nền vàng cho dễ đọc
                    align: 'center'
                }
            });
            contentText.anchor.set(0.5);
            contentText.position.set(boxWidth / 2, 80);

            playerBox.addChild(header, body, nameText, contentText);
            this.container.addChild(playerBox);

            this.boxes.push({ container: playerBox, text: contentText });
        });
    }

    update(wheel, tickers) {
        this.boxes.forEach((box, i) => {
            if (this.displayMode === 1) {
                box.text.text = this.players[i].score.toLocaleString();
            } else if (this.displayMode === 2) {
                box.text.text = this.players[i].total.toLocaleString();
            } else if (this.displayMode === 3) {
                // Lấy tên ô từ kim tương ứng
                box.text.text = wheel.getWedgeAtAngle(tickers[i].baseAngle);
                box.text.style.fontSize = 28; // Thu nhỏ font cho tên ô dài
            } else {
                box.text.style.fontSize = 45;
            }
        });
    }

    toggleMode() {
        this.displayMode = (this.displayMode % 3) + 1;
        // Reset cỡ chữ khi chuyển mode
        this.boxes.forEach(b => b.text.style.fontSize = (this.displayMode === 3) ? 28 : 45);
    }
}