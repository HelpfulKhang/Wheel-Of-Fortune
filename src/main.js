import * as PIXI from 'pixi.js';
import { Wheel } from './Wheel.js';
import { Controller } from './Controller.js';

const style = document.createElement('style');
style.innerHTML = `body { margin: 0; padding: 0; overflow: hidden; background-color: #000; } canvas { display: block; margin: 0 auto; }`;
document.head.appendChild(style);

const app = new PIXI.Application();

async function init() {
    await app.init({ width: 1920, height: 1080, backgroundColor: 0x050505, antialias: true });
    document.body.appendChild(app.canvas);

    // Load tất cả texture (bao gồm overlay)
    const textures = await loadTextures();

    const wheel = new Wheel(app, textures);
    const tickers = setupTickers(app, wheel);
    const controller = new Controller(wheel);

    app.ticker.add((time) => {
        controller.update(time.deltaTime);
        wheel.update(time.deltaTime, tickers);
    });
}

async function loadTextures() {
    const list = ['2500', '3500', '500-Green', '500-Pink', '500-Purple', '5000', '550-Blue', '600-Blue', '600-Pink', '600-Red', '600-Yellow', '650-Orange', '650-Pink', '650-Purple', '700-Blue', '700-Red', '700-Yellow', '800-Red', '900-Orange', '900-Yellow', 'Bankrupt', 'Express', 'Free-Play', 'Lose-a-Turn-White', 'Mystery', 'Wild-Card', 'Half-Car'];
    const texs = {};
    for (const name of list) {
        texs[name] = await PIXI.Assets.load(`/src/assets/wedge/${name}.png`);
    }
    return texs;
}

function setupTickers(app, wheel) {
    const colors = [0xff0000, 0xffff00, 0x0000ff];
    const tickerAngles = [-wheel.angleStep, 0, wheel.angleStep];
    const tickers = [];

    tickerAngles.forEach((angle, i) => {
        const g = new PIXI.Graphics().poly([-15, 0, 15, 0, 0, 50]).fill(colors[i]).stroke({ width: 3, color: 0xffffff });
        
        // SỬA LỖI LỆCH KIM: Tính tọa độ radial chuẩn
        // Gốc của kim phải ở khoảng cách (totalRadius + 50) để mũi kim (dài 50) vừa chạm rim
        const dist = wheel.totalRadius + 50;
        g.x = wheel.group.x + Math.sin(angle) * dist;
        g.y = wheel.group.y - Math.cos(angle) * dist;
        
        g.rotation = angle;
        g.zIndex = 100;
        app.stage.addChild(g);
        
        tickers.push({ container: g, baseAngle: angle, lastStep: 0 });
    });
    return tickers;
}

init();