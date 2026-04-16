import * as PIXI from 'pixi.js';
import { Wheel } from './Wheel.js';
import { Controller } from './Controller.js';
import { ScoreBoard } from './Scoreboard.js';

const style = document.createElement('style');
style.innerHTML = `body { margin: 0; padding: 0; overflow: hidden; background-color: #000; } canvas { display: block; margin: 0 auto; }`;
document.head.appendChild(style);

const app = new PIXI.Application();

async function init() {
    await app.init({ width: 1920, height: 1080, backgroundColor: 0x050505, antialias: true });
    document.body.appendChild(app.canvas);

    const WEDGE_LIST = ['2500', '3500', '500-Green', '500-Pink', '500-Purple', '5000', '550-Blue', '600-Blue', '600-Pink', '600-Red', '600-Yellow', '650-Orange', '650-Pink', '650-Purple', '700-Blue', '700-Red', '700-Yellow', '800-Red', '900-Orange', '900-Yellow', 'Bankrupt', 'Express', 'Free-Play', 'Lose-a-Turn-White', 'Mystery', 'MDW-Front', 'Power', 'Wild-Card', 'bouns round'];
    await PIXI.Assets.load([
        { alias: 'HelveticaNeueCondensedBlack', src: '/src/assets/font/10 HelveticaNeue/HelveticaNeueCondensedBlack.ttf' }
    ]);

    const textures = {};
    for (const name of WEDGE_LIST) {
        const folder = name === 'bouns round' ? 'wheel' : 'wedge';
        textures[name] = await PIXI.Assets.load(`/src/assets/${folder}/${name}.png`);
    }

    const wheel = new Wheel(app, textures);
    const tickers = setupTickers(app, wheel);
    const scoreBoard = new ScoreBoard(app); // Khởi tạo ScoreBoard
    const controller = new Controller(wheel, scoreBoard, tickers);

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Digit6') wheel.currentRound = 1;
        if (e.code === 'Digit7') wheel.currentRound = 2;
        if (e.code === 'Digit8') wheel.currentRound = 3;
        if (e.code === 'Digit9') wheel.currentRound = 4;
    });

    app.ticker.add((time) => {
        controller.update(time.deltaTime);
        wheel.update(time.deltaTime, tickers);
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