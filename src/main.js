import * as PIXI from 'pixi.js';
import { Wheel } from './Wheel.js';
import { PuzzleBoard } from './PuzzleBoard.js';
import { Controller } from './Controller.js';
import { ScoreBoard } from './Scoreboard.js';

const style = document.createElement('style');
style.innerHTML = `body { margin: 0; padding: 0; overflow: hidden; background-color: #000; } canvas { display: block; margin: 0 auto; }`;
document.head.appendChild(style);

const app = new PIXI.Application();

async function init() {
    // 1. Khởi tạo App
    await app.init({ width: 1920, height: 1080, backgroundColor: 0x050505, antialias: true });
    document.body.appendChild(app.canvas);

    // 2. Định nghĩa hàm load tài nguyên (Nên để trong hoặc ngoài init đều được)
    async function loadTextures() {
        const textures = {};
    
        // Danh sách Wedges & Bonus Wheel
        const WEDGE_LIST = [
            '2500', '3500', '500-Green', '500-Pink', '500-Purple', '5000', '550-Blue', 
            '600-Blue', '600-Pink', '600-Red', '600-Yellow', '650-Orange', '650-Pink', 
            '650-Purple', '700-Blue', '700-Red', '700-Yellow', '800-Red', '900-Orange', 
            '900-Yellow', 'Bankrupt', 'Express', 'Free-Play', 'Lose-a-Turn-White', 
            'Mystery', 'Wild-Card', 'MDW-Front', 'MDW-Back', 
            'Mystery-10000', 'Mystery-Bankrupt', 'Vault', 'Power', 
            'bonus round'
        ];
    
        for (const name of WEDGE_LIST) {
            const folder = (name === 'bonus round') ? 'wheel' : 'wedge';
            textures[name] = await PIXI.Assets.load(`/src/assets/${folder}/${name}.png`);
        }
    
        // Danh sách Puzzleboard Assets
        const pbAssets = [
            { alias: 'pb-back', src: '/src/assets/Puzzleboard/backs/1.jpg' },
            { alias: 'pb-grid', src: '/src/assets/Puzzleboard/backs/a1.jpg' },
            { alias: 'tile-dark', src: '/src/assets/Puzzleboard/images/dark.jpg' },
            { alias: 'tile-lit', src: '/src/assets/Puzzleboard/images/lit.jpg' }
        ];
    
        const loadedPb = await PIXI.Assets.load(pbAssets);
        Object.assign(textures, loadedPb);
    
        return textures;
    }

    // 3. Nạp Font và Textures (BẮT BUỘC PHẢI CÓ AWAIT)
    await PIXI.Assets.load([
        { alias: 'HelveticaNeueCondensedBlack', src: '/src/assets/font/10 HelveticaNeue/HelveticaNeueCondensedBlack.ttf' },
    ]);

    // LỖI QUAN TRỌNG: Phải có await ở đây
    const textures = await loadTextures(); 
    
    // 4. Khởi tạo các thành phần
    const wheel = new Wheel(app, textures);
    const puzzleBoard = new PuzzleBoard(app, textures); 
    const tickers = setupTickers(app, wheel);
    const scoreBoard = new ScoreBoard(app);
    
    // Truyền đủ các tham chiếu vào Controller
    const controller = new Controller(wheel, scoreBoard, tickers, puzzleBoard);

    // 5. Lắng nghe phím đổi vòng (Để Wheel biết đang ở vòng mấy mà check ô nón)
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Digit6') wheel.currentRound = 1;
        if (e.code === 'Digit7') wheel.currentRound = 2;
        if (e.code === 'Digit8') wheel.currentRound = 3;
        if (e.code === 'Digit9') wheel.currentRound = 4;
    });

    // 6. Game Loop
    app.ticker.add((time) => {
        controller.update(time.deltaTime);
        wheel.update(time.deltaTime, tickers);
        scoreBoard.update(wheel, tickers);
    });
}

function setupTickers(app, wheel) {
    const colors = [0xff0000, 0xffff00, 0x0000ff];
    const angles = [-wheel.angleStep, 0, wheel.angleStep];
    return angles.map((angle, i) => {
        const g = new PIXI.Graphics().poly([-15, 0, 15, 0, 0, 50]).fill(colors[i]).stroke({ width: 3, color: 0xffffff });
        // RADIAL MATH FIX: Tính X, Y dựa trên góc để kim hướng thẳng vào tâm
        const dist = wheel.totalRadius + 50;
        g.x = wheel.group.x + Math.sin(angle) * dist;
        g.y = wheel.group.y - Math.cos(angle) * dist;
        g.rotation = angle;
        g.zIndex = 100;
        app.stage.addChild(g);
        return { container: g, baseAngle: angle, lastStep: 0 };
    });
}

init();