import * as PIXI from 'pixi.js';

const app = new PIXI.Application();

async function init() {
    await app.init({ 
        width: window.innerWidth, 
        height: window.innerHeight,
        backgroundColor: 0x1a1a1a, // Màu nền tối cho chuyên nghiệp
        antialias: true 
    });
    document.body.appendChild(app.canvas);

    // 1. Tạo Container chứa toàn bộ vòng quay
    const wheelContainer = new PIXI.Container();
    wheelContainer.x = app.screen.width / 2;
    wheelContainer.y = app.screen.height / 2;
    app.stage.addChild(wheelContainer);

    const totalWedges = 24; // Số ô trên nón
    const radius = 250;     // Bán kính nón
    const angleStep = (Math.PI * 2) / totalWedges; // Góc của mỗi ô (tính bằng radian)

    // 2. Vẽ các ô (Wedges)
    for (let i = 0; i < totalWedges; i++) {
        const wedge = new PIXI.Graphics();
        
        // Chọn màu xen kẽ cho đẹp
        const color = i % 2 === 0 ? 0xffcc00 : 0xff3300; 

        wedge.context
            .moveTo(0, 0)
            .arc(0, 0, radius, i * angleStep, (i + 1) * angleStep)
            .lineTo(0, 0)
            .fill(color)
            .stroke({ width: 2, color: 0xffffff });

        wheelContainer.addChild(wedge);

        // Tạm thời thêm số thứ tự vào mỗi ô để dễ nhìn
        const label = new PIXI.Text({
            text: i + 1,
            style: { fill: 0xffffff, fontSize: 18 }
        });
        // Tính toán vị trí text nằm giữa ô
        const textAngle = i * angleStep + angleStep / 2;
        label.x = Math.cos(textAngle) * (radius * 0.7);
        label.y = Math.sin(textAngle) * (radius * 0.7);
        label.anchor.set(0.5);
        wheelContainer.addChild(label);
    }

    // 3. Tạo cái Kim (Ticker) chỉ hướng 12 giờ
    const ticker = new PIXI.Graphics()
        .poly([-20, 0, 20, 0, 0, 40])
        .fill(0xffffff)
        .stroke({width: 2, color: 0x000000});
    ticker.x = app.screen.width / 2;
    ticker.y = app.screen.height / 2 - radius - 10;
    ticker.rotation = Math.PI; // Quay ngược mũi tên xuống
    app.stage.addChild(ticker);

    console.log("Đã vẽ xong vòng quay!");
}

init();