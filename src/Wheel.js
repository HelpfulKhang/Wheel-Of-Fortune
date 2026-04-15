import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class Wheel {
    constructor(app, textures) {
        this.app = app;
        this.textures = textures;
        this.hubRadius = 333;
        this.wedgeHeight = 455;
        this.totalWedges = 24;
        this.angleStep = (Math.PI * 2) / this.totalWedges;
        this.wheelScale = 0.6;
        this.friction = 0.988;
        this.rotationSpeed = 0;

        // 4 List mặc định
        this.configs = {
            1: ['Bankrupt', '2500', '500-Green', '600-Pink', '700-Red', 'Bankrupt', '650-Orange', '500-Purple', '800-Red', 'Lose-a-Turn-White', '700-Yellow', '900-Orange', 'Mystery', '700-Yellow', '500-Pink', '800-Red', '600-Blue', '700-Red', '600-Pink', '550-Blue', '500-Pink', 'Mystery', '700-Yellow', 'Bankrupt'],
            2: Array(24).fill('600-Pink'), // Demo vòng 2
            3: Array(24).fill('700-Red'),  // Demo vòng 3
            4: Array(24).fill('800-Red')   // Demo vòng 4
        };

        this.init();
        this.loadWheelConfig(1);
    }

    init() {
        this.group = new PIXI.Container();
        this.group.position.set(1920 / 2, 1080 / 2 + 20);
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

    buildWedges(names) {
        if (!names || names.length !== 24) {
            alert("Dữ liệu nón phải có đúng 24 ô!");
            return;
        }
        this.spinContainer.removeChildren();
        names.forEach((name, i) => {
            const wrapper = new PIXI.Container();
            wrapper.rotation = i * this.angleStep;
            const s = new PIXI.Sprite(this.textures[name] || this.textures['500-Green']);
            s.anchor.set(0.5, 1);
            s.y = -this.hubRadius;
            wrapper.addChild(s);
            this.spinContainer.addChild(wrapper);
        });
    }

    spin(power) { this.rotationSpeed = 0 + (power * 5); }
    
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
            // CÔNG THỨC MỚI: + 0.45 NHÌN MỚI ĐẸP
            const currentStep = Math.floor((this.spinContainer.rotation + obj.baseAngle) / this.angleStep + 0.45);
            if (currentStep !== obj.lastStep) {
                obj.lastStep = currentStep;
                gsap.fromTo(obj.container, 
                    { rotation: obj.baseAngle - 0.35 }, 
                    { rotation: obj.baseAngle, duration: 0.2, ease: "back.out(2.5)" }
                );
            }
        });
    }
    get totalRadius() { return (this.wedgeHeight + this.hubRadius) * this.wheelScale; }
}