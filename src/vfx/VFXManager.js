/**
 * VFXManager - Particle Engine and Visual Juice System
 * Renders steam smoke, celebratory confetti, floating score popups, and camera shakes.
 */
export class VFXManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.floaters = []; // Floating text popups: { text, x, y, vy, color, alpha, scale }
        this.shakeTime = 0;
        this.shakeIntensity = 0;
        this.gameContainer = null;
    }

    /**
     * Mount particle canvas onto container
     * @param {HTMLElement} container 
     */
    init(container) {
        this.gameContainer = container;

        this.canvas = document.createElement('canvas');
        this.canvas.className = 'vfx-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '50';

        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas || !this.gameContainer) return;
        const rect = this.gameContainer.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    /**
     * Trigger camera shake on intense events
     * @param {number} durationSeconds 
     * @param {number} intensityPixels 
     */
    shake(durationSeconds = 0.25, intensityPixels = 6) {
        this.shakeTime = durationSeconds;
        this.shakeIntensity = intensityPixels;
    }

    /**
     * Spawn floating score / tip text popup
     * @param {string} text 
     * @param {number} x 
     * @param {number} y 
     * @param {string} [color] 
     * @param {number} [scale] 
     */
    spawnFloatingText(text, x, y, color = '#FFD166', scale = 1.0) {
        if (this.floaters.length > 8) {
            this.floaters.shift();
        }
        const posX = typeof x === 'number' && !isNaN(x) ? x : 300;
        const posY = typeof y === 'number' && !isNaN(y) ? y : 200;
        this.floaters.push({
            text,
            x: posX,
            y: posY,
            vy: -45, // Pixels per second upwards
            color,
            alpha: 1.0,
            scale,
            life: 1.0 // 1 second duration
        });
    }

    /**
     * Spawn smoke / steam sizzle particle
     * @param {number} x 
     * @param {number} y 
     */
    spawnSizzleSteam(x, y) {
        if (this.particles.length > 30) return;
        this.particles.push({
            type: 'steam',
            x: x + (Math.random() * 20 - 10),
            y: y + (Math.random() * 8 - 4),
            vx: (Math.random() - 0.5) * 15,
            vy: -30 - Math.random() * 25,
            radius: 4 + Math.random() * 6,
            maxRadius: 18 + Math.random() * 10,
            alpha: 0.6,
            color: 'rgba(255, 255, 255, ',
            life: 0.8
        });
    }

    /**
     * Spawn celebration confetti explosion
     * @param {number} [x] 
     * @param {number} [y] 
     */
    spawnConfetti(x, y) {
        const posX = x !== undefined ? x : (this.canvas ? this.canvas.width / 2 : 200);
        const posY = y !== undefined ? y : (this.canvas ? this.canvas.height / 3 : 150);
        const colors = ['#FF5E36', '#FFD166', '#2EC4B6', '#E63946', '#9D4EDD', '#48CAE4'];

        for (let i = 0; i < 24; i++) {

            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 160;
            this.particles.push({
                type: 'confetti',
                x: posX,
                y: posY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60, // bias upward
                gravity: 140,
                color: colors[Math.floor(Math.random() * colors.length)],
                width: 6 + Math.random() * 4,
                height: 10 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 10,
                alpha: 1.0,
                life: 1.5 + Math.random() * 0.8
            });
        }
    }

    /**
     * Update and render VFX frame
     * @param {number} dt Delta time in seconds
     */
    update(dt) {
        if (!this.ctx || !this.canvas) return;

        // Apply shake
        if (this.shakeTime > 0) {
            this.shakeTime -= dt;
            const ox = (Math.random() - 0.5) * this.shakeIntensity * 2;
            const oy = (Math.random() - 0.5) * this.shakeIntensity * 2;
            if (this.gameContainer) {
                this.gameContainer.style.transform = `translate(${ox}px, ${oy}px)`;
            }
            if (this.shakeTime <= 0 && this.gameContainer) {
                this.gameContainer.style.transform = 'translate(0, 0)';
            }
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update & draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.type === 'steam') {
                p.radius += (p.maxRadius - p.radius) * (dt * 2.0);
                p.alpha = Math.max(0, p.life / 0.8 * 0.5);

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `${p.color}${p.alpha})`;
                this.ctx.fill();
            } else if (p.type === 'confetti') {
                p.vy += p.gravity * dt;
                p.rotation += p.rotSpeed * dt;
                p.alpha = Math.max(0, p.life / 1.5);

                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.globalAlpha = p.alpha;
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                this.ctx.restore();
            }
        }

        // Update & draw floating popups
        for (let i = this.floaters.length - 1; i >= 0; i--) {
            const f = this.floaters[i];
            f.life -= dt;
            if (f.life <= 0) {
                this.floaters.splice(i, 1);
                continue;
            }

            f.y += f.vy * dt;
            f.alpha = Math.min(1.0, f.life / 0.4);

            this.ctx.save();
            this.ctx.globalAlpha = f.alpha;
            this.ctx.font = `bold ${Math.round(20 * f.scale)}px 'Segoe UI', system-ui, sans-serif`;
            this.ctx.textAlign = 'center';

            // Glow / drop shadow
            this.ctx.shadowColor = 'rgba(0,0,0,0.7)';
            this.ctx.shadowBlur = 6;
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = '#1A1E29';
            this.ctx.strokeText(f.text, f.x, f.y);

            this.ctx.fillStyle = f.color;
            this.ctx.fillText(f.text, f.x, f.y);
            this.ctx.restore();
        }
    }
}

export const globalVFXManager = new VFXManager();
