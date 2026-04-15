import * as PIXI from 'pixi.js';
import { Wheel } from './Wheel.js';
import { Controller } from './Controller.js';

// CSS Reset
const style = document.createElement('style');
style.innerHTML = `body { margin: 0; padding: 0; overflow: hidden; background-color: #000; } canvas { display: block; margin: 0 auto; }`;
document.head.appendChild(style);

const app = new PIXI.Application();

const WEDGE_LIST = [
    '2500', '3500', '500-Green', '500-Pink', '500-Purple', '5000', 
    '550-Blue', '600-Blue', '600-Pink', '600-Red', '600-Yellow', 
    '650-Orange', '650-Pink', '650-Purple', '700-Blue', '700-Red', 
    '700-Yellow', '800-Red', '900-Orange', '900-Yellow', 'Bankrupt', 
    'Express', 'Free-Play', 'Lose-a-Turn-White', 'Mystery', 'MDW-Front', 'Power', 'Vault'
];

async function init() {
    await app.init({ 
        width: 1920, height: 1080, backgroundColor: 0x050505, antialias: true,
        resolution: window.devicePixelRatio || 1, autoDensity: true
    });
    document.body.appendChild(app.canvas);

    const handleResize = () => {
        const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
        app.canvas.style.width = `${1920 * scale}px`;
        app.canvas.style.height = `${1080 * scale}px`;
    };
    window.addEventListener('resize', handleResize); handleResize();

    // Load Textures
    const textures = {};
    for (const name of WEDGE_LIST) {
        textures[name] = await PIXI.Assets.load(`/src/assets/wedge/${name}.png`);
    }

    // 1. Khởi tạo Wheel
    const wheel = new Wheel(app, textures);

    // 2. Khởi tạo 3 Kim (Phải gọi sau khi wheel đã init để lấy tọa độ)
    const tickerObjects = setupTickers(app, wheel);

    // 3. Khởi tạo Meter (Sửa lại logic vẽ)
    const meterUI = setupMeterUI(app);

    // 4. Khởi tạo Controller (Phím 6, 7, 8, 9)
    const controller = new Controller(wheel, meterUI);

    app.ticker.add((time) => {
        const delta = time.deltaTime;
        controller.update(delta);
        wheel.update(delta, tickerObjects);
    });
}

function setupTickers(app, wheel) {
    const createTicker = (color) => {
        const g = new PIXI.Graphics()
            .poly([-15, 0, 15, 0, 0, 50])
            .fill(color)
            .stroke({ width: 3, color: 0xffffff });
        return g;
    };

    const colors = [0xff0000, 0xffff00, 0x0000ff];
    const tickerAngles = [-wheel.angleStep, 0, wheel.angleStep];
    const tickers = [];

    tickerAngles.forEach((angle, i) => {
        const t = createTicker(colors[i]);
        // Tọa độ tuyệt đối dựa trên wheel.group
        t.x = wheel.group.x + Math.sin(angle) * wheel.totalRadius;
        t.y = wheel.group.y - Math.cos(angle) * wheel.totalRadius - 50; 
        t.rotation = angle;
        
        // Đảm bảo kim nằm trên cùng
        t.zIndex = 100;
        app.stage.addChild(t);
        
        tickers.push({ container: t, baseAngle: angle, lastStep: 0 });
    });
    return tickers;
}

function setupMeterUI(app) {
    const graphics = new PIXI.Graphics();
    graphics.x = 100;
    graphics.y = 300;
    app.stage.addChild(graphics);

    return {
        draw: (power) => {
            graphics.clear()
                .rect(0, 0, 40, 400).fill(0x333333).stroke({ width: 2, color: 0xffffff }) // Khung
                .rect(2, 398, 36, -396 * power).fill(power > 0.8 ? 0xff3333 : 0x33ff33); // Thanh lực
        },
        clear: () => {
            graphics.clear().rect(0, 0, 40, 400).fill(0x333333).stroke({ width: 2, color: 0xffffff });
        }
    };
}

init();