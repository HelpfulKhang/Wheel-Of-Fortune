import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

const removeAccents = (str) => {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

export class PuzzleBoard {
    constructor(app, textures) {
        this.app = app;
        this.textures = textures;
        this.group = new PIXI.Container();
        this.group.visible = false;

        this.config = {
            boardX: 325, boardY: 135,
            tileW: 88, tileH: 120,
            gapX: 4, gapY: 5,
            rows: [12, 14, 14, 12],
            gridColor: 0x006400,
            gridThickness: 4
        };

        this.tiles = []; 
        this.activeTiles = []; 
        this.init();
        this.app.stage.addChild(this.group);
    }

    init() {
        const bg = new PIXI.Sprite(this.textures['pb-back']);
        bg.width = 1920; bg.height = 1080;
        this.group.addChild(bg);

        const gridGraphics = new PIXI.Graphics();
        this.group.addChild(gridGraphics);

        const tileContainer = new PIXI.Container();
        this.group.addChild(tileContainer);

        this.config.rows.forEach((count, rowIndex) => {
            this.tiles[rowIndex] = [];
            const rowOffsetX = (rowIndex === 0 || rowIndex === 3) ? (this.config.tileW + this.config.gapX) : 0;
            
            for (let i = 0; i < count; i++) {
                const x = this.config.boardX + rowOffsetX + i * (this.config.tileW + this.config.gapX);
                const y = this.config.boardY + rowIndex * (this.config.tileH + this.config.gapY);

                gridGraphics.poly([x - 2, y - 2, x + this.config.tileW + 2, y - 2, x + this.config.tileW + 2, y + this.config.tileH + 2, x - 2, y + this.config.tileH + 2])
                           .stroke({ width: this.config.gridThickness, color: this.config.gridColor });

                const tileSprite = new PIXI.Sprite(this.textures['tile-dark']);
                tileSprite.width = this.config.tileW; tileSprite.height = this.config.tileH;
                tileSprite.position.set(x, y);

                // Lớp xanh blue.jpg để đè lên khi reveal
                const blueOverlay = new PIXI.Sprite(this.textures['tile-blue'] || this.textures['tile-dark']);
                blueOverlay.width = this.config.tileW; blueOverlay.height = this.config.tileH;
                blueOverlay.position.set(x, y);
                blueOverlay.visible = false;

                const letterText = new PIXI.Text({
                    text: "",
                    style: { fontFamily: 'HelveticaNeueCondensedBlack', fontSize: 85, fill: 0x000000 }
                });
                letterText.anchor.set(0.5);
                letterText.position.set(x + this.config.tileW / 2, y + this.config.tileH / 2);
                letterText.visible = false;

                tileContainer.addChild(tileSprite, blueOverlay, letterText);
                this.tiles[rowIndex][i] = { 
                    sprite: tileSprite, 
                    overlay: blueOverlay,
                    text: letterText, 
                    char: "",        // Chữ gốc (có dấu)
                    baseChar: "",    // Chữ đã bỏ dấu
                    isRevealed: false,
                    posX: x 
                };
            }
        });

        this.categoryGroup = new PIXI.Container();
        this.categoryGroup.position.set(1920 / 2, 800);
        this.categoryGroup.alpha = 0;
        this.group.addChild(this.categoryGroup);
    }

    loadPuzzle(text) {
        this.resetState();
        this.activeTiles = [];

        const words = text.toUpperCase().split(" ");
        const rowsLayout = [[], [], [], []];
        let currentRow = 1;

        words.forEach(word => {
            const currentLen = rowsLayout[currentRow].join(" ").length;
            const space = currentLen > 0 ? 1 : 0;
            if (currentLen + space + word.length <= this.config.rows[currentRow]) {
                rowsLayout[currentRow].push(word);
            } else {
                currentRow++;
                if (currentRow > 2) currentRow = 0;
                rowsLayout[currentRow].push(word);
            }
        });

        rowsLayout.forEach((rowWords, rowIndex) => {
            if (rowWords.length === 0) return;
            const rowStr = rowWords.join(" ");
            const startCol = Math.floor((this.config.rows[rowIndex] - rowStr.length) / 2);

            for (let i = 0; i < rowStr.length; i++) {
                const char = rowStr[i];
                if (char === " ") continue;
                const tile = this.tiles[rowIndex][startCol + i];
                tile.char = char;
                tile.baseChar = removeAccents(char); // Lưu bản không dấu
                tile.text.text = tile.baseChar;      // Mặc định hiện không dấu
                this.activeTiles.push(tile);
            }
        });
        this.activeTiles.sort((a, b) => a.posX - b.posX);
    }

    // HIỆU ỨNG REVEAL TILE (Overlay blue -> hiện chữ)
    revealTile(tile, showFullAccent = false) {
        if (tile.isRevealed && !showFullAccent) return;

        tile.isRevealed = true;
        tile.overlay.visible = true;
        tile.sprite.texture = this.textures['tile-lit'];

        gsap.delayedCall(1, () => {
            tile.overlay.visible = false;
            tile.text.text = showFullAccent ? tile.char : tile.baseChar;
            tile.text.visible = true;
        });
    }

    // Mở toàn bộ puzzle
    revealAll(isSolve = false) {
        this.activeTiles.forEach(tile => {
            tile.isRevealed = true;
            tile.sprite.texture = this.textures['tile-lit'];
            tile.text.text = isSolve ? tile.char : tile.baseChar;
            tile.text.visible = true;
            tile.overlay.visible = false;
        });
    }

    revealTiles() { // Hiệu ứng bừng sáng ô từ trái sang phải
        this.activeTiles.forEach((tile, index) => {
            gsap.delayedCall(index * 0.05, () => {
                tile.sprite.texture = this.textures['tile-lit'];
            });
        });
    }

    resetState() {
        this.tiles.flat().forEach(t => {
            t.sprite.texture = this.textures['tile-dark'];
            t.overlay.visible = false;
            t.text.text = ""; t.text.visible = false; 
            t.char = ""; t.baseChar = "";
            t.isRevealed = false;
        });
        this.categoryGroup.alpha = 0;
    }

    showCategory(categoryName) {
        this.categoryGroup.removeChildren();
        const boxWidth = 600; const boxHeight = 70;
        const box = new PIXI.Graphics().roundRect(-boxWidth/2, -boxHeight/2, boxWidth, boxHeight, 30).fill(0x00008B).stroke({width:3, color:0xf9f295});
        const catText = new PIXI.Text({ text: categoryName.toUpperCase(), style: {fontFamily:'HelveticaNeueCondensedBlack', fontSize:40, fill:0xffffff} });
        catText.anchor.set(0.5);
        this.categoryGroup.addChild(box, catText);
        gsap.to(this.categoryGroup, { alpha: 1, y: 780, duration: 0.5, ease: "back.out(1.7)" });
    }

    hideCategory() { gsap.to(this.categoryGroup, { alpha: 0, y: 800, duration: 0.3 }); }
}