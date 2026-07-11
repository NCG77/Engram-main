import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const [isVisible, setIsVisible] = React.useState(false);
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!containerRef.current || !isVisible) return;
        const pixelCanvas = document.createElement('pixel-canvas');
        if (isMobile || !isVisible) {
            pixelCanvas.dataset.speed = '0';
        } else {
            if (gap) pixelCanvas.dataset.gap = gap;
            if (speed) pixelCanvas.dataset.speed = speed;
        }
        if (colors) pixelCanvas.dataset.colors = colors;
        if (noFocus) pixelCanvas.dataset.noFocus = '';
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(pixelCanvas);
    }, [gap, speed, colors, noFocus, isMobile, isVisible]);
    return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}></div>;
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
                const value = this.dataset.gap || 12; 
                const min = 6; 
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
                const value = this.dataset.speed || 20; 
                const min = 0;
                const max = 100;
                const throttle = 0.0008; 
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
                this.ctx = this.canvas.getContext("2d", { willReadFrequently: false });
                this.timeInterval = 1000 / 30; 
                this.timePrevious = performance.now();
                this.reducedMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;
                this._animationActive = false;
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
                const timeNow = performance.now();
                const timePassed = timeNow - this.timePrevious;
                if (timePassed < this.timeInterval) {
                    this.animation = requestAnimationFrame(() => this.animate(fnName));
                    return;
                }
                this.timePrevious = timeNow - (timePassed % this.timeInterval);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                if (!this.pixels || this.pixels.length === 0) {
                    this.createPixels();
                    return;
                }
                let allIdle = true;
                const pixelCount = this.pixels.length;
                for (let i = 0; i < pixelCount; i++) {
                    this.pixels[i][fnName]();
                    if (!this.pixels[i].isIdle) {
                        allIdle = false;
                    }
                }
                if (allIdle && fnName === "disappear") {
                    cancelAnimationFrame(this.animation);
                    this._animationActive = false;
                    return;
                }
                this.animation = requestAnimationFrame(() => this.animate(fnName));
            }
        }
        customElements.define('pixel-canvas', PixelCanvasElement);
    }
}
const Moon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const Sun = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const NewPage = () => {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem("engram-theme");
        if (savedTheme === "light") {
            setIsDarkMode(false);
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode");
        } else {
            setIsDarkMode(true);
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            localStorage.setItem("engram-theme", "light");
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode");
        } else {
            localStorage.setItem("engram-theme", "dark");
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        navigate("/");
    };
    return (
        <div className={`new-page-container ${isDarkMode ? "dark" : "light"}`}>
            <div className="top-actions" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDarkMode ? 'white' : 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ff475600',
                        color: isDarkMode ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ff3838'; e.currentTarget.style.color = 'white'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ff475600'; e.currentTarget.style.color = isDarkMode ? 'white' : 'black'; }}
                >
                    Logout
                </button>
            </div>
            <div className="main">
                <div style={{ textAlign: 'left', marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
                    <h1>Engram</h1>
                    <h2 style={{ opacity: 0.8 }}>Store your digital self Online.</h2>
                </div>
                <Link to="/chat" style={{ textDecoration: 'none', color: 'inherit', position: 'relative', zIndex: 2 }}>
                    <div className="card" style={{ "--active-color": "#fef08a", position: "relative", overflow: "hidden" }}>
                        <PixelCanvasDOM
                            gap="12"
                            speed="15"
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
                            gap="12"
                            speed="12"
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
