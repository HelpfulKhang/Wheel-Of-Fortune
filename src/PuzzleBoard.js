import * as PIXI from 'pixi.js';

export class PuzzleBoard {
    constructor(app, textures) {
        this.app = app;
        this.textures = textures;
        this.container = new PIXI.Container();
        this.container.visible = false; // Mặc định ẩn

        // --- THÔNG SỐ HIỆU CHUẨN (Bạn hãy chỉnh các số này để vừa khít lưới) ---
        this.config = {
            boardX: 255,      // Vị trí X của cả bảng
            boardY: 135,      // Vị trí Y (để cao như bạn muốn)
            tileW: 88,        // Chiều rộng mỗi ô
            tileH: 120,       // Chiều cao mỗi ô
            gapX: 4,          // Khoảng cách giữa các ô theo chiều ngang
            gapY: 5,          // Khoảng cách giữa các ô theo chiều dọc
            rows: [12, 14, 14, 12] // Cấu trúc lưới
        };

        this.tiles = []; // Lưu trữ để sau này gọi lật chữ
        this.init();
        this.app.stage.addChild(this.container);
    }

    init() {
        // 1. Nền của Puzzle Board (1.jpg)
        const background = new PIXI.Sprite(this.textures['pb-back']);
        background.width = 1920;
        background.height = 1080;
        this.container.addChild(background);

        // 2. Lưới viền ô chữ (a1.gif)
        // Chúng ta đặt lưới này lên trước để canh tọa độ, 
        // nhưng thực tế các ô chữ sẽ nằm dưới hoặc trên tùy bạn.
        this.gridFrame = new PIXI.Sprite(this.textures['pb-grid']);
        this.gridFrame.position.set(this.config.boardX, this.config.boardY);
        // Lưu ý: Bạn có thể cần set width/height cho gridFrame nếu ảnh gốc không đúng 1920
        this.container.addChild(this.gridFrame);

        // 3. Tạo các ô (Tiles)
        this.createGrid();
    }

    createGrid() {
        this.tileContainer = new PIXI.Container();
        this.container.addChild(this.tileContainer);

        this.config.rows.forEach((count, rowIndex) => {
            // Tính toán để căn giữa hàng 12 so với hàng 14
            const rowOffsetX = (rowIndex === 0 || rowIndex === 3) ? (this.config.tileW + this.config.gapX) : 0;
            
            for (let i = 0; i < count; i++) {
                const tile = new PIXI.Container();
                
                // Vị trí X, Y của từng ô
                tile.x = this.config.boardX + rowOffsetX + i * (this.config.tileW + this.config.gapX) + 15; // +15 là lề trái
                tile.y = this.config.boardY + rowIndex * (this.config.tileH + this.config.gapY) + 15; // +15 là lề trên

                // Sprite nền ô (mặc định dùng dark.jpg)
                const sprite = new PIXI.Sprite(this.textures['tile-dark']);
                sprite.width = this.config.tileW;
                sprite.height = this.config.tileH;
                
                tile.addChild(sprite);
                this.tileContainer.addChild(tile);

                // Lưu vào mảng 2D để quản lý: tiles[hàng][cột]
                if (!this.tiles[rowIndex]) this.tiles[rowIndex] = [];
                this.tiles[rowIndex][i] = {
                    container: tile,
                    sprite: sprite,
                    state: 'dark' // 'dark' | 'lit' | 'letter'
                };
            }
        });
    }

    // Hàm để bạn test nhanh vị trí ô
    toggleTestMode() {
        this.tiles.flat().forEach(t => {
            t.sprite.texture = (t.state === 'dark') ? this.textures['tile-lit'] : this.textures['tile-dark'];
            t.state = (t.state === 'dark') ? 'lit' : 'dark';
        });
    }
}