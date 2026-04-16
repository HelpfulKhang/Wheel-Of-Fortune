import * as PIXI from 'pixi.js';

export class PuzzleBoard {
    constructor(app, textures) {
        this.app = app;
        this.textures = textures;
        this.group = new PIXI.Container();
        this.group.visible = false;

        // Cấu hình thông số (Bạn có thể điều chỉnh boardX, boardY tùy ý)
        this.config = {
            boardX: 325,      
            boardY: 135,      
            tileW: 88,        
            tileH: 120,       
            gapX: 4,          
            gapY: 5,          
            rows: [12, 14, 14, 12],
            gridColor: 0x006400, // Màu xanh lá đậm (Forest Green) cho sang
            gridThickness: 4     // Độ dày viền lưới
        };

        this.tiles = [];
        this.init();
        this.app.stage.addChild(this.group);
    }

    init() {
        // 1. Nền gỗ (1.jpg)
        const bg = new PIXI.Sprite(this.textures['pb-back']);
        bg.width = 1920; 
        bg.height = 1080;
        this.group.addChild(bg);

        // 2. Tự vẽ lưới (Thay thế cho a1.gif)
        const gridGraphics = new PIXI.Graphics();
        this.group.addChild(gridGraphics);

        // 3. Container chứa các ô tile (Nằm trên lưới)
        const tileContainer = new PIXI.Container();
        this.group.addChild(tileContainer);

        this.config.rows.forEach((count, rowIndex) => {
            // Cân giữa hàng 12 so với hàng 14
            const rowOffsetX = (rowIndex === 0 || rowIndex === 3) ? (this.config.tileW + this.config.gapX) : 0;
            
            for (let i = 0; i < count; i++) {
                const x = this.config.boardX + rowOffsetX + i * (this.config.tileW + this.config.gapX);
                const y = this.config.boardY + rowIndex * (this.config.tileH + this.config.gapY);

                // --- Vẽ viền lưới xung quanh vị trí ô này ---
                // Vẽ một hình chữ nhật lớn hơn ô tile một chút để tạo cảm giác lưới bao quanh
                gridGraphics.poly([
                    x - 2, y - 2, 
                    x + this.config.tileW + 2, y - 2, 
                    x + this.config.tileW + 2, y + this.config.tileH + 2, 
                    x - 2, y + this.config.tileH + 2
                ])
                .stroke({ width: this.config.gridThickness, color: this.config.gridColor });

                // --- Tạo ô nắp (Tile) ---
                const tile = new PIXI.Sprite(this.textures['tile-dark']);
                tile.width = this.config.tileW;
                tile.height = this.config.tileH;
                tile.position.set(x, y);

                tileContainer.addChild(tile);
                this.tiles.push(tile);
            }
        });
    }
}