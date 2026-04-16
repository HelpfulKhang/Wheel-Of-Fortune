import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class Wheel {
    constructor(app, textures) {
        this.app = app;
        this.textures = textures;
        
        // CÁC THÔNG SỐ CỐ ĐỊNH CỦA BẠN (KHÔNG ĐỔI)
        this.hubRadius = 303;
        this.wedgeHeight = 455;
        this.totalWedges = 24;
        this.angleStep = (Math.PI * 2) / this.totalWedges;
        this.wheelScale = 0.5;
        this.friction = 0.988;
        this.rotationSpeed = 0;
        this.isBonus = false;

        // THÊM HỆ SỐ SCALE RIÊNG CHO BONUS WHEEL
        this.bonusWheelScale = 0.68; 

        this.configs = {
            1: [
                "Bankrupt",
                "2500",
                "500-Green",
                "900-Yellow",
                "700-Red",
                "600-Blue",
                "650-Orange",
                "500-Purple",
                "700-Yellow",
                "MDM-Front",
                "600-Red",
                "550-Blue",
                "500-Green",
                "600-Pink",
                "Bankrupt",
                "650-Purple",
                "500-Blue",
                "700-Blue",
                "Lose-a-Turn-White",
                "800-Red",
                {"base": "900-Yellow", "overlay": "Wild-Card"},
                "650-Pink",
                "500-Green",
                "900-Orange"
              ],
            2: [
                "Bankrupt",
                "3500",
                "500-Green",
                "900-Yellow",
                "700-Red",
                "Mystery",
                "650-Orange",
                "500-Purple",
                "700-Yellow",
                "MDM-Front",
                "600-Red",
                "550-Blue",
                "500-Green",
                "600-Pink",
                "Bankrupt",
                "650-Purple",
                "500-Blue",
                "Mystery",
                "Lose-a-Turn-White",
                "800-Red",
                { "base": "900-Yellow", "overlay": "Wild-Card" },
                "650-Pink",
                "500-Green",
                "900-Orange"
              ],
            3: [
                "Bankrupt",
                "3500",
                "500-Green",
                "900-Yellow",
                "Express",
                "600-Blue",
                "650-Orange",
                "500-Purple",
                "700-Yellow",
                "MDM-Front",
                "600-Red",
                "550-Blue",
                "500-Green",
                "600-Pink",
                "Bankrupt",
                "650-Purple",
                "500-Blue",
                "700-Blue",
                "Lose-a-Turn-White",
                "800-Red",
                { "base": "900-Yellow", "overlay": "Wild-Card" },
                "650-Pink",
                "500-Green",
                "900-Orange"
              ],
            4: [
                "Bankrupt",
                "2500",
                "500-Green",
                "900-Yellow",
                "700-Red",
                "600-Blue",
                "650-Orange",
                "500-Purple",
                "700-Yellow",
                "500-Pink",
                "600-Red",
                "550-Blue",
                "500-Green",
                "600-Pink",
                "Bankrupt",
                "650-Purple",
                "500-Blue",
                "700-Blue",
                "Lose-a-Turn-White",
                "800-Red",
                "900-Yellow",
                "650-Pink",
                "500-Green",
                "900-Orange"
              ]
        };

        this.init();
        this.loadWheelConfig(1);
    }

    init() {
        this.group = new PIXI.Container();
        this.group.position.set(1920 / 2, 1080 / 2 - 70);
        this.group.scale.set(this.wheelScale);

        this.spinContainer = new PIXI.Container();
        this.group.addChild(this.spinContainer);

        this.hub = new PIXI.Graphics().circle(0, 0, this.hubRadius).fill(0xffd700).stroke({ width: 10, color: 0xffffff, alpha: 0.5 });
        this.group.addChild(this.hub);

        this.app.stage.addChild(this.group);
    }

    loadWheelConfig(index) {
        this.isBonus = false;
        this.hub.visible = true;
        
        // Reset về scale vòng thường
        this.group.scale.set(this.wheelScale);
        
        this.buildWedges(this.configs[index]);
    }

    loadBonusWheel() {
        this.isBonus = true;
        this.hub.visible = false;
        this.spinContainer.removeChildren();

        // Áp dụng scale riêng cho Bonus Wheel
        this.group.scale.set(this.bonusWheelScale);

        const bonusSprite = new PIXI.Sprite(this.textures['bouns round']);
        bonusSprite.anchor.set(0.5);
        this.spinContainer.addChild(bonusSprite);
    }

    buildWedges(items) {
        this.spinContainer.removeChildren();
        items.forEach((item, i) => {
            const wrapper = new PIXI.Container();
            wrapper.rotation = i * this.angleStep;

            const baseName = typeof item === 'string' ? item : item.base;
            const overlayName = typeof item === 'object' ? item.overlay : null;

            const base = new PIXI.Sprite(this.textures[baseName] || this.textures['500-Green']);
            base.anchor.set(0.5, 1);
            base.y = -this.hubRadius;
            wrapper.addChild(base);

            if (overlayName && this.textures[overlayName]) {
                const overlay = new PIXI.Sprite(this.textures[overlayName]);
                overlay.anchor.set(0.5, 0.5);
                overlay.y = -(this.hubRadius + this.wedgeHeight - 50);
                if (overlayName === 'Wild-Card') overlay.scale.set(0.5);
                else if (overlayName === 'Half-Car')  overlay.scale.set(0.6);
                wrapper.addChild(overlay);
            }
            this.spinContainer.addChild(wrapper);
        });
    }

    spin(power) { this.rotationSpeed = power * 10; }

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
            /** * SỬA LỖI NẢY KIM Ở VÁCH NGĂN:
             * Vòng thường: Ô chữ nằm chính giữa trục nên cần bù +0.5 để nảy ở vách.
             * Vòng Bonus: Ảnh nguyên khối có vách nằm sẵn ở trục nên không cần bù (dùng 0).
             */
            const bounceOffset = this.isBonus ? 0 : 0.5;
            const currentStep = Math.floor((this.spinContainer.rotation - obj.baseAngle) / this.angleStep + bounceOffset);
            
            if (currentStep !== obj.lastStep) {
                obj.lastStep = currentStep;
                gsap.fromTo(obj.container, { rotation: obj.baseAngle - 0.35 }, { rotation: obj.baseAngle, duration: 0.2, ease: "back.out(2.5)" });
            }
        });
    }

    // Cập nhật để 3 cây kim luôn bám sát rìa sau khi scale
    get totalRadius() { 
        const currentScale = this.isBonus ? this.bonusWheelScale : this.wheelScale;
        return (this.wedgeHeight + this.hubRadius) * currentScale; 
    }
}