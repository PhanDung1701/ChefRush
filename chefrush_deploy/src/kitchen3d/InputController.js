/**
 * InputController.js - Multi-directional Virtual Joystick & Tactile Action Buttons
 * Supports Keyboard (WASD, Arrows, Space, J, K), Touch Joystick, and Action Buttons.
 */

export class InputController {
    constructor({ onInteract, onChopStart, onChopEnd, onDash }) {
        this.onInteract = onInteract || (() => {});
        this.onChopStart = onChopStart || (() => {});
        this.onChopEnd = onChopEnd || (() => {});
        this.onDash = onDash || (() => {});

        // Movement output (-1 to 1)
        this.moveX = 0;
        this.moveZ = 0;
        this.isChopping = false;

        // Keyboard State
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            chop: false
        };

        // Joystick DOM and touch tracking
        this.joystickBase = null;
        this.joystickThumb = null;
        this.joystickTouchId = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.maxRadius = 50;

        this.initKeyboard();
    }

    /**
     * Bind virtual joystick and on-screen action buttons
     * @param {HTMLElement} container 
     */
    bindVirtualControls(container) {
        this.joystickBase = container.querySelector('#joystick-base');
        this.joystickThumb = container.querySelector('#joystick-thumb');

        const btnInteract = container.querySelector('#btn-action-interact');
        const btnChop = container.querySelector('#btn-action-chop');
        const btnDash = container.querySelector('#btn-action-dash');

        if (this.joystickBase && this.joystickThumb) {
            this.bindJoystickEvents();
        }

        // 1. Action: CẦM / ĐẶT (Pick / Drop)
        if (btnInteract) {
            const handleInteract = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onInteract();
            };
            btnInteract.addEventListener('pointerdown', handleInteract);
        }

        // 2. Action: THÁI (Chop) - Hold or tap
        if (btnChop) {
            const handleChopDown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.isChopping = true;
                this.onChopStart();
            };
            const handleChopUp = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.isChopping = false;
                this.onChopEnd();
            };

            btnChop.addEventListener('pointerdown', handleChopDown);
            window.addEventListener('pointerup', handleChopUp);
            window.addEventListener('pointercancel', handleChopUp);
        }

        // 3. Action: LƯỚT (Dash)
        if (btnDash) {
            const handleDash = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onDash();
            };
            btnDash.addEventListener('pointerdown', handleDash);
        }
    }

    /**
     * Virtual Joystick Touch & Mouse Listeners
     */
    bindJoystickEvents() {
        const onStart = (clientX, clientY, identifier = null) => {
            const rect = this.joystickBase.getBoundingClientRect();
            this.joystickCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            this.joystickTouchId = identifier;
            onMove(clientX, clientY);
        };

        const onMove = (clientX, clientY) => {
            const dx = clientX - this.joystickCenter.x;
            const dy = clientY - this.joystickCenter.y;
            const dist = Math.hypot(dx, dy);

            const clampedDist = Math.min(this.maxRadius, dist);
            const angle = Math.atan2(dy, dx);

            const thumbX = Math.cos(angle) * clampedDist;
            const thumbY = Math.sin(angle) * clampedDist;

            this.joystickThumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

            // Deadzone
            if (dist < 8) {
                this.moveX = 0;
                this.moveZ = 0;
            } else {
                const normDist = clampedDist / this.maxRadius;
                this.moveX = (thumbX / this.maxRadius);
                this.moveZ = (thumbY / this.maxRadius);
            }
        };

        const onEnd = () => {
            this.joystickTouchId = null;
            this.joystickThumb.style.transform = 'translate(0px, 0px)';
            this.moveX = 0;
            this.moveZ = 0;
        };

        // Touch handling
        this.joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            onStart(touch.clientX, touch.clientY, touch.identifier);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.joystickTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                if (t.identifier === this.joystickTouchId) {
                    onMove(t.clientX, t.clientY);
                    break;
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (this.joystickTouchId === null) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystickTouchId) {
                    onEnd();
                    break;
                }
            }
        });

        // Mouse drag handling (for desktop testing with mouse)
        let isMouseDown = false;
        this.joystickBase.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            onStart(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                onMove(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isMouseDown) {
                isMouseDown = false;
                onEnd();
            }
        });
    }

    /**
     * Keyboard Listeners (WASD, Arrows, Space, J, C, K, Shift)
     */
    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            // Avoid triggering while typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const code = e.code;

            // Movement keys
            if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = true;
            if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = true;
            if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
            if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;

            // Action: CẦM / ĐẶT (Key E)
            if (code === 'KeyE') {
                e.preventDefault();
                this.onInteract();
            }

            // Action: THÁI CẮT / RỬA (Space or KeyJ)
            if (code === 'Space' || code === 'KeyJ' || code === 'KeyC') {
                e.preventDefault();
                if (!this.keys.chop) {
                    this.keys.chop = true;
                    this.isChopping = true;
                    this.onChopStart();
                }
            }

            // Action: TĂNG TỐC CHẠY / LƯỚT (Shift or KeyK)
            if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyK') {
                this.onDash();
            }
        });

        window.addEventListener('keyup', (e) => {
            const code = e.code;

            if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = false;
            if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
            if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
            if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;

            if (code === 'Space' || code === 'KeyJ' || code === 'KeyC') {
                this.keys.chop = false;
                this.isChopping = false;
                this.onChopEnd();
            }
        });
    }

    /**
     * Get combined normalized input vector
     * @returns {{ moveX: number, moveZ: number, isChopping: boolean }}
     */
    getInput() {
        // If joystick is actively moved, priority to joystick
        if (Math.abs(this.moveX) > 0.05 || Math.abs(this.moveZ) > 0.05) {
            return {
                moveX: this.moveX,
                moveZ: this.moveZ,
                isChopping: this.isChopping
            };
        }

        // Otherwise compute from keyboard keys
        let kx = 0;
        let kz = 0;

        if (this.keys.left) kx -= 1;
        if (this.keys.right) kx += 1;
        if (this.keys.up) kz -= 1;
        if (this.keys.down) kz += 1;

        // Diagonal normalization
        const len = Math.hypot(kx, kz);
        if (len > 0) {
            kx /= len;
            kz /= len;
        }

        return {
            moveX: kx,
            moveZ: kz,
            isChopping: this.isChopping
        };
    }
}
