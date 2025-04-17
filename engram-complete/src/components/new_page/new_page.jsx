import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './new_page.css';


class Pixel {
    constructor(canvas, context, x, y, color, speed, delay) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = context;
        this.x = x;
        this.y = y;
        this.color = color;
        this.speed = this.getRandomValue(0.1, 0.9) * speed;
        this.size = 0;
        this.sizeStep = Math.random() * 0.4;
        this.minSize = 0.5;
        this.maxSizeInteger = 2;
        this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
        this.delay = delay;
        this.counter = 0;
        this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
        this.isIdle = false;
        this.isReverse = false;
        this.isShimmer = false;
    }

    getRandomValue(min, max) {
        return Math.random() * (max - min) + min;
    }

    draw() {
        const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(
            this.x + centerOffset,
            this.y + centerOffset,
            this.size,
            this.size
        );
    }

    appear() {
        this.isIdle = false;
        if (this.counter <= this.delay) {
            this.counter += this.counterStep;
            return;
        }
        if (this.size >= this.maxSize) {
            this.isShimmer = true;
        }
        if (this.isShimmer) {
            this.shimmer();
        } else {
            this.size += this.sizeStep;
        }
        this.draw();
    }

    disappear() {
        this.isShimmer = false;
        this.counter = 0;
        if (this.size <= 0) {
            this.isIdle = true;
            return;
        } else {
            this.size -= 0.1;
        }
        this.draw();
    }

    shimmer() {
        if (this.size >= this.maxSize) {
            this.isReverse = true;
        } else if (this.size <= this.minSize) {
            this.isReverse = false;
        }
        if (this.isReverse) {
            this.size -= this.speed;
        } else {
            this.size += this.speed;
        }
    }
}

const PixelCanvasDOM = ({ gap, speed, colors, noFocus }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const pixelCanvas = document.createElement('pixel-canvas');
        if (gap) pixelCanvas.dataset.gap = gap;
        if (speed) pixelCanvas.dataset.speed = speed;
        if (colors) pixelCanvas.dataset.colors = colors;
        if (noFocus) pixelCanvas.dataset.noFocus = '';
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(pixelCanvas);
    }, [gap, speed, colors, noFocus]);

    return <div ref={containerRef} style={{ width: '100%', height: '300%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}></div>;
};

if (typeof window !== 'undefined') {
    if (!customElements.get('pixel-canvas')) {
        class PixelCanvasElement extends HTMLElement {
            static css = `
                :host {
                    display: grid;
                    inline-size: 100%;
                    block-size: 100%;
                    overflow: hidden;
                }
            `;

            constructor() {
                super();
                this.attachShadow({ mode: "open" });
            }

            get colors() {
                return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"];
            }

            get gap() {
                const value = this.dataset.gap || 5;
                const min = 4;
                const max = 50;
                if (Number(value) <= min) {
                    return min;
                } else if (Number(value) >= max) {
                    return max;
                } else {
                    return parseInt(value);
                }
            }

            get speed() {
                const value = this.dataset.speed || 35;
                const min = 0;
                const max = 100;
                const throttle = 0.001;
                if (Number(value) <= min || this.reducedMotion) {
                    return min;
                } else if (Number(value) >= max) {
                    return max * throttle;
                } else {
                    return parseInt(value) * throttle;
                }
            }

            get noFocus() {
                return this.hasAttribute("data-no-focus");
            }

            connectedCallback() {
                const canvas = document.createElement("canvas");
                const sheet = new CSSStyleSheet();
                this._parent = this.parentNode;
                sheet.replaceSync(PixelCanvasElement.css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.shadowRoot.append(canvas);
                this.canvas = this.shadowRoot.querySelector("canvas");
                this.ctx = this.canvas.getContext("2d");
                this.timeInterval = 1000 / 60;
                this.timePrevious = performance.now();
                this.reducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;
                setTimeout(() => this.init(), 10);
                this.resizeObserver = new ResizeObserver(() => {
                    this.init();
                    this.handleAnimation("appear");
                });
                this.resizeObserver.observe(this);
                if (this._parent) {
                    this._parent.addEventListener("mouseenter", this);
                    this._parent.addEventListener("mouseleave", this);
                    if (!this.noFocus) {
                        this._parent.addEventListener("focusin", this);
                        this._parent.addEventListener("focusout", this);
                    }
                    setTimeout(() => this.handleAnimation("disappear"), 10);
                }
            }

            disconnectedCallback() {
                if (this.resizeObserver) this.resizeObserver.disconnect();
                if (this._parent) {
                    this._parent.removeEventListener("mouseenter", this);
                    this._parent.removeEventListener("mouseleave", this);
                    if (!this.noFocus) {
                        this._parent.removeEventListener("focusin", this);
                        this._parent.removeEventListener("focusout", this);
                    }
                }
                if (this.animation) cancelAnimationFrame(this.animation);
                delete this._parent;
            }

            handleEvent(event) {
                const handler = `on${event.type}`;
                if (typeof this[handler] === 'function') {
                    this[handler](event);
                }
            }

            onmouseenter() {
                this.handleAnimation("appear");
            }

            onmouseleave() {
                this.handleAnimation("disappear");
            }

            onfocusin(e) {
                if (e.currentTarget.contains(e.relatedTarget)) return;
                this.handleAnimation("appear");
            }

            onfocusout(e) {
                if (e.currentTarget.contains(e.relatedTarget)) return;
                this.handleAnimation("disappear");
            }

            handleAnimation(name) {
                if (this.animation) cancelAnimationFrame(this.animation);
                this.animation = requestAnimationFrame(() => this.animate(name));
            }

            init() {
                const rect = this.getBoundingClientRect();
                const width = Math.floor(rect.width) || 300;
                const height = Math.floor(rect.height) || 400;
                this.pixels = [];
                this.canvas.width = width;
                this.canvas.height = height;
                this.canvas.style.width = `${width}px`;
                this.canvas.style.height = `${height}px`;
                this.createPixels();
            }

            getDistanceToCanvasCenter(x, y) {
                const dx = x - this.canvas.width / 2;
                const dy = y - this.canvas.height / 2;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance;
            }

            createPixels() {
                const actualGap = this.gap;
                for (let x = 0; x < this.canvas.width; x += actualGap) {
                    for (let y = 0; y < this.canvas.height; y += actualGap) {
                        const color = this.colors[
                            Math.floor(Math.random() * this.colors.length)
                        ];
                        const delay = this.reducedMotion
                            ? 0
                            : this.getDistanceToCanvasCenter(x, y);
                        this.pixels.push(
                            new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay)
                        );
                    }
                }
            }

            animate(fnName) {
                this.animation = requestAnimationFrame(() => this.animate(fnName));
                const timeNow = performance.now();
                const timePassed = timeNow - this.timePrevious;
                if (timePassed < this.timeInterval) return;
                this.timePrevious = timeNow - (timePassed % this.timeInterval);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (!this.pixels || this.pixels.length === 0) {
                    this.createPixels();
                    return;
                }
                let allIdle = true;
                for (let i = 0; i < this.pixels.length; i++) {
                    this.pixels[i][fnName]();
                    if (!this.pixels[i].isIdle) {
                        allIdle = false;
                    }
                }
                if (allIdle && fnName === "disappear") {
                    cancelAnimationFrame(this.animation);
                }
            }
        }

        customElements.define('pixel-canvas', PixelCanvasElement);
    }
}

const NewPage = () => {
    return (
        <div className="new-page-container">
            <div className="main">
                <div style={{ textAlign: 'left', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
                    <h1>Engram</h1>
                    <h2>Store your digital self Online.</h2>
                </div>
                <Link to="/chat" style={{ textDecoration: 'none', color: 'inherit', position: 'relative', zIndex: 2 }}>
                    <div className="card" style={{ "--active-color": "#fef08a", position: "relative", overflow: "hidden" }}>
                        <PixelCanvasDOM
                            gap="1"
                            speed="100"
                            colors="#fef08a, #fde047, #eab308"
                            noFocus={false}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentcolor" viewBox="0 0 256 256" style={{ position: "relative", zIndex: 2 }}>
                            <path d="M180,146H158V110h22a34,34,0,1,0-34-34V98H110V76a34,34,0,1,0-34,34H98v36H76a34,34,0,1,0,34,34V158h36v22a34,34,0,1,0,34-34ZM158,76a22,22,0,1,1,22,22H158ZM54,76a22,22,0,0,1,44,0V98H76A22,22,0,0,1,54,76ZM98,180a22,22,0,1,1-22-22H98Zm12-70h36v36H110Zm70,92a22,22,0,0,1-22-22V158h22a22,22,0,0,1,0,44Z"></path>
                        </svg>
                        <span className="card-text">Replica</span>
                    </div>
                </Link>

                <Link to="/diary" style={{ textDecoration: 'none', color: 'inherit', position: 'relative', zIndex: 2 }}>
                    <div className="card" style={{ "--active-color": "#672026", position: "relative", overflow: "hidden" }}>
                        <PixelCanvasDOM
                            gap="1"
                            speed="100"
                            colors="rgb(142, 0, 0),rgb(255, 15, 15), #ff0000"
                            noFocus={false}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentcolor" viewBox="0 0 256 256" style={{ position: "relative", zIndex: 2 }}>
                            <path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24Zm-8,160H72a31.82,31.82,0,0,0-16,4.29V56A16,16,0,0,1,72,40H200Z" />
                        </svg>
                        <span className="card-text">Diary</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default NewPage; 
