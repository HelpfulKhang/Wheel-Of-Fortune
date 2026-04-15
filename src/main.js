import * as PIXI from 'pixi.js';

// --- XỬ LÝ CSS ĐỂ XÓA VIỀN TRẮNG ---
const style = document.createElement('style');
style.innerHTML = `
    body { margin: 0; padding: 0; overflow: hidden; background-color: #000; }
    canvas { display: block; }
`;
document.head.appendChild(style);

const app = new PIXI.Application();

const WEDGE_NAMES = [
    '500-Green', '600-Pink', '700-Red', 'Bankrupt', 
    '650-Orange', '500-Purple', '800-Red', 'Lose-a-Turn-White',
    '700-Yellow', '900-Orange', '2500', 'Bankrupt',
    '600-Blue', '700-Red', '600-Pink', '550-Blue',
    '500-Pink', 'Mystery', '700-Yellow', 'Bankrupt',
    '650-Purple', 'Free-Play', '650-Pink', 'Bankrupt'
];

async function init() {
    // 1. Khởi tạo với độ phân giải Full HD
    await app.init({ 
        width: 1920, 
        height: 1080,
        backgroundColor: 0x0c0c0c,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    document.body.appendChild(app.canvas);

    // Tự động scale canvas để vừa với màn hình trình duyệt mà vẫn giữ tỷ lệ 16:9
    const resizeCanvas = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const scale = Math.min(screenWidth / 1920, screenHeight / 1080);
        app.canvas.style.width = `${1920 * scale}px`;
        app.canvas.style.height = `${1080 * scale}px`;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // 2. Tải Texture
    const textures = {};
    for (const name of [...new Set(WEDGE_NAMES)]) {
        textures[name] = await PIXI.Assets.load(`/src/assets/wedge/${name}.png`);
    }

    // 3. Thông số
    const hubRadius = 333;      
    const wedgeHeight = 455;    
    const totalWedges = 24;
    const angleStep = (Math.PI * 2) / totalWedges; // 15 độ
    const wheelScale = 0.6; // Điều chỉnh scale để nón 1576px lọt thỏm trong 1080px chiều cao

    const wheelGroup = new PIXI.Container();
    wheelGroup.x = 1920 / 2;
    wheelGroup.y = 1080 / 2 + 50; // Đẩy xuống một chút để nhường chỗ cho kim
    wheelGroup.scale.set(wheelScale);
    app.stage.addChild(wheelGroup);

    const wheelSpin = new PIXI.Container();
    wheelGroup.addChild(wheelSpin);

    // Vẽ nón
    WEDGE_NAMES.forEach((name, i) => {
        const wedgeWrapper = new PIXI.Container();
        wedgeWrapper.rotation = i * angleStep;
        const sprite = new PIXI.Sprite(textures[name]);
        sprite.anchor.set(0.5, 1); 
        sprite.y = -hubRadius; 
        wedgeWrapper.addChild(sprite);
        wheelSpin.addChild(wedgeWrapper);
    });

    // Trục giữa
    const hub = new PIXI.Graphics()
        .circle(0, 0, hubRadius)
        .fill({ color: 0xffd700 })
        .stroke({ width: 10, color: 0xffffff, alpha: 0.5 });
    wheelGroup.addChild(hub);

    // 4. TẠO 3 CÂY KIM (TICKERS)
    const createTicker = (color) => {
        const container = new PIXI.Container();
        const g = new PIXI.Graphics()
            .poly([
                -15, 0,  // Cạnh trái
                15, 0,   // Cạnh phải
                0, 50    // Mũi nhọn (chỉ xuống)
            ])
            .fill(color)
            .stroke({ width: 3, color: 0xffffff });
        container.addChild(g);
        return container;
    };

    const redTicker = createTicker(0xff0000);    // Đỏ (Trái)
    const yellowTicker = createTicker(0xffff00); // Vàng (Giữa)
    const blueTicker = createTicker(0x0000ff);   // Xanh dương (Phải)

    const tickers = [redTicker, yellowTicker, blueTicker];
    const tickerAngles = [-angleStep, 0, angleStep]; // -15, 0, 15 độ

    const totalRadius = (wedgeHeight + hubRadius) * wheelScale;

    tickers.forEach((ticker, index) => {
        const angle = tickerAngles[index];
        
        // Tính toán vị trí để đầu kim vừa chạm vào nón
        // Dùng lượng giác để tính tọa độ x, y dựa trên góc
        ticker.x = wheelGroup.x + Math.sin(angle) * totalRadius;
        ticker.y = wheelGroup.y - Math.cos(angle) * totalRadius - 50; // -5 để chừa khe hở cực nhỏ
        
        // Xoay kim hướng về tâm vòng quay
        ticker.rotation = angle;
        
        app.stage.addChild(ticker);
    });

    // Game Loop test xoay
    app.ticker.add((time) => {
        wheelSpin.rotation += 0.005 * time.deltaTime;
    });
}

init();