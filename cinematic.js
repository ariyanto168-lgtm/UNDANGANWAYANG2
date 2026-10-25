/**
 * MASTER LOCK: Cinematic Engine Module
 * Versi: v1.0.0
 * Powered by Ari GPM
 */

class CinematicEngine {
    constructor(options = {}) {
        this.version = "v1.0.0";
        this.author = "Powered by Ari GPM";
        
        this.config = {
            speed: options.speed || 'sedang',
            customSpeedPx: options.customSpeedPx || 1,
            autoStart: options.autoStart !== undefined ? options.autoStart : true,
            pauseOnTouch: options.pauseOnTouch !== undefined ? options.pauseOnTouch : true,
            sectionPauseTime: options.sectionPauseTime || 2500,
            animationsEnabled: options.animationsEnabled !== undefined ? options.animationsEnabled : true,
            perfMode: options.perfMode || false,
            selectedAnimation: options.selectedAnimation || 'rise-up',
            isJavaneseTheme: options.isJavaneseTheme || false
        };

        this.isScrolling = false;
        this.scrollTimer = null;
        this.sections = [];
        this.pausedByTouch = false;

        this.init();
    }

    init() {
        console.log(`CinematicEngine ${this.version} - ${this.author}`);

        if (this.config.perfMode) {
            document.body.classList.add('perf-mode');
        }

        const flowSelectors = [
            '#cover', '#pembukaan', '#profil', '#cerita', 
            '#countdown', '#lokasi', '#rundown', '#galeri', 
            '#rsvp', '#hadiah', '#penutup'
        ];
        this.sections = flowSelectors.map(sel => document.querySelector(sel)).filter(el => el !== null);

        this.setupObservers();
        this.setupTouchListeners();
        this.setupControlsUI();

        if (this.config.isJavaneseTheme) {
            this.initJavaneseCurtain();
        }

        if (this.config.autoStart) {
            window.addEventListener('load', () => {
                setTimeout(() => this.startAutoScroll(), 1500);
            }, { once: true });
        }
    }

    getScrollStep() {
        switch (this.config.speed) {
            case 'lambat': return 0.5;
            case 'sedang': return 1.0;
            case 'cepat': return 2.0;
            case 'kustom': return this.config.customSpeedPx;
            default: return 1.0;
        }
    }

    startAutoScroll() {
        if (!this.isScrolling && !this.pausedByTouch) {
            this.isScrolling = true;
            this.stepScroll();
        }
    }

    stopAutoScroll() {
        this.isScrolling = false;
        if (this.scrollTimer) {
            cancelAnimationFrame(this.scrollTimer);
        }
    }

    stepScroll() {
        if (!this.isScrolling) return;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll) {
            this.stopAutoScroll();
            return;
        }

        window.scrollBy(0, this.getScrollStep());
        this.scrollTimer = requestAnimationFrame(() => this.stepScroll());
    }

    setupObservers() {
        if (!this.config.animationsEnabled) return;

        const observerOptions = { root: null, threshold: 0.3 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    if (this.isScrolling && this.config.sectionPauseTime > 0) {
                        this.stopAutoScroll();
                        setTimeout(() => {
                            if (!this.pausedByTouch) {
                                this.startAutoScroll();
                            }
                        }, this.config.sectionPauseTime);
                    }
                }
            });
        }, observerOptions);

        this.sections.forEach(sec => observer.observe(sec));
    }

    setupTouchListeners() {
        if (!this.config.pauseOnTouch) return;

        const pauseAction = () => {
            if (this.isScrolling) {
                this.pausedByTouch = true;
                this.stopAutoScroll();
            }
        };

        window.addEventListener('touchstart', pauseAction, { passive: true });
        window.addEventListener('mousedown', pauseAction);
    }

    initJavaneseCurtain() {
        const curtainHTML = `
            <div class="javanese-curtain" id="javaneseCurtain">
                <div class="curtain-left"></div>
                <div class="curtain-right"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', curtainHTML);
    }

    openJavaneseCurtain() {
        const curtain = document.getElementById('javaneseCurtain');
        if (curtain) {
            curtain.classList.add('cinematic-open');
            setTimeout(() => curtain.remove(), 1200);
        }
    }

    setupControlsUI() {
        const controlsHTML = `
            <div class="cinematic-controls" id="cinematicControls" title="Powered by Ari GPM">
                <button id="btnToggleScroll" title="Lanjutkan/Hentikan">⏸️</button>
                <button id="btnSpeed" title="Kecepatan">⚡</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', controlsHTML);

        document.getElementById('btnToggleScroll').addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isScrolling) {
                this.stopAutoScroll();
                this.pausedByTouch = true;
                e.target.innerText = '▶️';
            } else {
                this.pausedByTouch = false;
                this.startAutoScroll();
                e.target.innerText = '⏸️';
            }
        });

        document.getElementById('btnSpeed').addEventListener('click', (e) => {
            e.stopPropagation();
            const speeds = ['lambat', 'sedang', 'cepat'];
            let nextIdx = (speeds.indexOf(this.config.speed) + 1) % speeds.length;
            this.config.speed = speeds[nextIdx];
            e.target.innerText = `⚡(${this.config.speed[0].toUpperCase()})`;
        });
    }
}
