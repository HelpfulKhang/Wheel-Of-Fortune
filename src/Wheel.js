import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class Wheel {
    constructor(app, textures) {
        this.app = app;
        this.textures = textures;
        this.hubRadius = 303;
        this.wedgeHeight = 455;
        this.totalWedges = 24;
        this.angleStep = (Math.PI * 2) / this.totalWedges;
        this.wheelScale = 0.5;
        this.friction = 0.988;
        this.rotationSpeed = 0;

        // Cấu hình mặc định 4 vòng
        this.configs = {
            1: ['Bankrupt', '2500', {base: '500-Green', overlay: 'Wild-Card'}, '600-Pink', '700-Red', 'Bankrupt', {base: '650-Orange', overlay: 'Half-Car'}, '500-Purple', '800-Red', 'Lose-a-Turn-White', '700-Yellow', '900-Orange', 'Mystery', '700-Yellow', '500-Pink', '800-Red', '600-Blue', '700-Red', '600-Pink', '550-Blue', '500-Pink', 'Mystery', '700-Yellow', 'Bankrupt'],
            2: Array(24).fill('600-Pink'),
            3: Array(24).fill('700-Red'),
            4: Array(24).fill('800-Red')
        };

        this.init();
        this.loadWheelConfig(1);
    }

    init() {
        this.group = new PIXI.Container();
        this.group.position.set(1920 / 2, 1080 / 2 - 40);
        this.group.scale.set(this.wheelScale);

        this.spinContainer = new PIXI.Container();
        this.group.addChild(this.spinContainer);

        const hub = new PIXI.Graphics().circle(0, 0, this.hubRadius).fill(0xffd700).stroke({ width: 10, color: 0xffffff, alpha: 0.5 });
        this.group.addChild(hub);
        this.app.stage.addChild(this.group);
    }

    loadWheelConfig(index) {
        this.buildWedges(this.configs[index]);
    }

    buildWedges(items) {
        this.spinContainer.removeChildren();
        items.forEach((item, i) => {
            const wrapper = new PIXI.Container();
            // Xoay nón sao cho ô đầu tiên nằm chính giữa trục dọc
            wrapper.rotation = i * this.angleStep;

            const baseName = typeof item === 'string' ? item : item.base;
            const overlayName = typeof item === 'object' ? item.overlay : null;

            const base = new PIXI.Sprite(this.textures[baseName]);
            base.anchor.set(0.5, 1);
            base.y = -this.hubRadius;
            wrapper.addChild(base);

            if (overlayName && this.textures[overlayName]) {
                const overlay = new PIXI.Sprite(this.textures[overlayName]);
                overlay.anchor.set(0.5, 0.5);
                // Vị trí góc trên của wedge
                overlay.y = -(this.hubRadius + this.wedgeHeight - 80);

                if (overlayName === 'Wild-Card') {
                    overlay.scale.set(0.6); // Dọc
                } else if (overlayName === 'Half-Car') {
                    overlay.rotation = Math.PI / 2; // Ngang xoay dọc
                    overlay.scale.set(0.5);
                }
                wrapper.addChild(overlay);
            }
            this.spinContainer.addChild(wrapper);
        });
    }

    spin(power) { this.rotationSpeed = 0.05 + (power * 0.35); }

    nudge(dir) {
        const target = Math.round(this.spinContainer.rotation / this.angleStep) * this.angleStep + (this.angleStep * dir);
        gsap.to(this.spinContainer, { rotation: target, duration: 0.4, ease: "power2.out" });
    }

    update(delta, tickers) {
        if (this.rotationSpeed > 0) {
            this.spinContainer.rotation += this.rotationSpeed * delta;
            this.rotationSpeed *= Math.pow(this.friction, delta);
            if (this.rotationSpeed < 0.0005) this.rotationSpeed = 0;
        }

        tickers.forEach(obj => {
            // Tính bước dựa trên góc riêng của từng kim để nảy chính xác vách ngăn
            const currentStep = Math.floor((this.spinContainer.rotation - obj.baseAngle) / this.angleStep + 0.5);
            if (currentStep !== obj.lastStep) {
                obj.lastStep = currentStep;
                gsap.fromTo(obj.container, 
                    { rotation: obj.baseAngle - 0.3 }, 
                    { rotation: obj.baseAngle, duration: 0.2, ease: "back.out(2)" }
                );
            }
        });
    }

    get totalRadius() { return (this.wedgeHeight + this.hubRadius) * this.wheelScale; }
}