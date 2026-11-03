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
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
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
        this.attachShadow({ mode: 'open' });
      }

      get colors() {
        return (
          this.dataset.colors?.split(',') || ['#ffffff', '#e4e4e7', '#a1a1aa']
        );
      }

      get gap() {
        const value = this.dataset.gap || 12;
        const min = 6;
        const max = 50;
        if (Number(value) <= min) return min;
        if (Number(value) >= max) return max;
        return parseInt(value);
      }

      get speed() {
        const value = this.dataset.speed || 15;
        const min = 0;
        const max = 100;
        const throttle = 0.0008;
        if (Number(value) <= min || this.reducedMotion) return min;
        if (Number(value) >= max) return max * throttle;
        return parseInt(value) * throttle;
      }

      get noFocus() {
        return this.hasAttribute('data-no-focus');
      }

      connectedCallback() {
        const canvas = document.createElement('canvas');
        const sheet = new CSSStyleSheet();
        this._parent = this.parentNode;
        sheet.replaceSync(PixelCanvasElement.css);
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.shadowRoot.append(canvas);
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });
        this.timeInterval = 1000 / 30;
        this.timePrevious = performance.now();
        this.reducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;
        this._animationActive = false;
        setTimeout(() => this.init(), 10);
        this.resizeObserver = new ResizeObserver(() => {
          this.init();
          this.handleAnimation('appear');
        });
        this.resizeObserver.observe(this);
        if (this._parent) {
          this._parent.addEventListener('mouseenter', this);
          this._parent.addEventListener('mouseleave', this);
          if (!this.noFocus) {
            this._parent.addEventListener('focusin', this);
            this._parent.addEventListener('focusout', this);
          }
          setTimeout(() => this.handleAnimation('disappear'), 10);
        }
      }

      disconnectedCallback() {
        if (this.resizeObserver) this.resizeObserver.disconnect();
        if (this._parent) {
          this._parent.removeEventListener('mouseenter', this);
          this._parent.removeEventListener('mouseleave', this);
          if (!this.noFocus) {
            this._parent.removeEventListener('focusin', this);
            this._parent.removeEventListener('focusout', this);
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
        this.handleAnimation('appear');
      }

      onmouseleave() {
        this.handleAnimation('disappear');
      }

      onfocusin(e) {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        this.handleAnimation('appear');
      }

      onfocusout(e) {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        this.handleAnimation('disappear');
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
        return Math.sqrt(dx * dx + dy * dy);
      }

      createPixels() {
        const actualGap = this.gap;
        for (let x = 0; x < this.canvas.width; x += actualGap) {
          for (let y = 0; y < this.canvas.height; y += actualGap) {
            const color =
              this.colors[Math.floor(Math.random() * this.colors.length)];
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

        if (allIdle && fnName === 'disappear') {
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

const NewPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/');
  };

  return (
    <div className="new-page-container">
      {/* Top Monochrome Navigation */}
      <header className="new-page-nav">
        <Link to="/new_page" className="new-page-logo" title="Engram Workspace">
          Engram
        </Link>

        <div className="new-page-nav-right">
          {userName && (
            <div className="user-pill">
              <span className="user-dot"></span>
              <span className="user-name">{userName}</span>
            </div>
          )}
          <button className="nav-logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="new-page-content">
        <div className="hero-header">
          <h1 className="hero-title">
            {userName ? `Welcome back, ${userName}` : 'Store Your Digital Self Online'}
          </h1>
          <p className="hero-subtitle">
            Select an environment below to chronicle your private reflections or
            engage in dialogue with your evolving AI companion.
          </p>
        </div>

        {/* The Hub Cards */}
        <div className="cards-grid">
          {/* Card 1: Replica */}
          <Link to="/chat" className="workspace-card-link">
            <div className="workspace-card" style={{ '--active-color': '#ffffff' }}>
              <PixelCanvasDOM
                gap="14"
                speed="14"
                colors="#ffffff, #e4e4e7, #a1a1aa, #52525b"
                noFocus={false}
              />
              <div className="card-inner">
                <div className="card-top">
                  <span className="card-badge">AI Companion</span>
                  <span className="card-status-dot" title="Ready to converse"></span>
                </div>

                <div className="card-icon-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    className="card-svg"
                  >
                    <path d="M180,146H158V110h22a34,34,0,1,0-34-34V98H110V76a34,34,0,1,0-34,34H98v36H76a34,34,0,1,0,34,34V158h36v22a34,34,0,1,0,34-34ZM158,76a22,22,0,1,1,22,22H158ZM54,76a22,22,0,0,1,44,0V98H76A22,22,0,0,1,54,76ZM98,180a22,22,0,1,1-22-22H98Zm12-70h36v36H110Zm70,92a22,22,0,0,1-22-22V158h22a22,22,0,0,1,0,44Z" />
                  </svg>
                </div>

                <div className="card-body">
                  <h2 className="card-title">Replica</h2>
                  <p className="card-desc">
                    Converse with your AI replica trained on your personal OCEAN
                    profile. Test its memory of past reflections and witness your
                    authentic digital voice.
                  </p>
                </div>

                <div className="card-footer">
                  <span className="card-action-text">Launch Replica</span>
                  <span className="card-arrow">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Diary */}
          <Link to="/diary" className="workspace-card-link">
            <div className="workspace-card" style={{ '--active-color': '#ffffff' }}>
              <PixelCanvasDOM
                gap="14"
                speed="14"
                colors="#ffffff, #e4e4e7, #a1a1aa, #52525b"
                noFocus={false}
              />
              <div className="card-inner">
                <div className="card-top">
                  <span className="card-badge">Daily Journal</span>
                  <span className="card-status-dot" title="Encrypted storage"></span>
                </div>

                <div className="card-icon-container">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    className="card-svg"
                  >
                    <path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,8,8H192a8,8,0,0,0,0-16H56a16,16,0,0,1,16-16H208a8,8,0,0,0,8-8V32A8,8,0,0,0,208,24Zm-8,160H72a31.82,31.82,0,0,0-16,4.29V56A16,16,0,0,1,72,40H200Z" />
                  </svg>
                </div>

                <div className="card-body">
                  <h2 className="card-title">Diary</h2>
                  <p className="card-desc">
                    Record your thoughts, emotions, and life milestones. Every
                    entry is securely processed to fine-tune your cognitive model
                    and preserve your narrative.
                  </p>
                </div>

                <div className="card-footer">
                  <span className="card-action-text">Open Diary</span>
                  <span className="card-arrow">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NewPage;
