// ==========================================================================
// ARNE — PREMIUM CREATIVE STUDIO ENGINE & BOOKING SYSTEM
// ==========================================================================

(function () {
    'use strict';

    // ----------------------------------------------------------------------
    // SUPABASE CLOUD DATABASE CONNECTION
    // ----------------------------------------------------------------------
    const SUPABASE_URL = 'https://xrrhzjabhfnbbblfwyko.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_rIkNV4jmbx5NDH96yRoviw_w1AGwuZD';
    let supabaseClient = null;

    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('[ARNE Supabase] Connected to project: xrrhzjabhfnbbblfwyko');
        }
    } catch (e) {
        console.warn('[ARNE Supabase Notice] Initialization error:', e);
    }

    // ----------------------------------------------------------------------
    // LENIS HARDWARE-ACCELERATED SMOOTH SCROLL ENGINE
    // ----------------------------------------------------------------------
    let lenisInstance = null;

    function initLenis() {
        if (typeof Lenis === 'undefined') return;
        if (lenisInstance) return;

        try {
            lenisInstance = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential decay curve for buttery momentum
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1.0,
                touchMultiplier: 1.6,
                infinite: false
            });

            window.lenis = lenisInstance;

            function raf(time) {
                if (lenisInstance) {
                    lenisInstance.raf(time);
                }
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            // Sync with window scroll events for hero canvas scrubbing and navigation spies
            lenisInstance.on('scroll', () => {
                window.dispatchEvent(new Event('scroll'));
            });

            // Smooth scroll for all anchor navigation links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const targetId = this.getAttribute('href');
                    if (targetId && targetId !== '#') {
                        const targetEl = document.querySelector(targetId);
                        if (targetEl) {
                            e.preventDefault();
                            lenisInstance.scrollTo(targetEl, { offset: -80, duration: 1.3 });
                        }
                    }
                });
            });
        } catch (err) {
            console.warn('[Lenis Smooth Scroll Engine Notice]', err);
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initLenis();
    } else {
        document.addEventListener('DOMContentLoaded', initLenis);
    }

    // ----------------------------------------------------------------------
    // TINTED GLASS THEME SYSTEM
    // ----------------------------------------------------------------------
    window.setGlassTheme = function (themeName) {
        const validThemes = ['emerald', 'sapphire', 'amethyst', 'rosegold', 'cyan'];
        if (!validThemes.includes(themeName)) themeName = 'emerald';

        document.documentElement.setAttribute('data-glass-theme', themeName);
        try {
            localStorage.setItem('arne_glass_theme', themeName);
        } catch (e) {}

        const buttons = document.querySelectorAll('.tint-dot-btn');
        buttons.forEach(btn => {
            if (btn.getAttribute('data-tint') === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    function initGlassTheme() {
        let savedTheme = 'emerald';
        try {
            savedTheme = localStorage.getItem('arne_glass_theme') || 'emerald';
        } catch (e) {}
        window.setGlassTheme(savedTheme);
    }

    // ----------------------------------------------------------------------
    // INITIAL SERVICES DATA STORE
    // ----------------------------------------------------------------------
    const DEFAULT_SERVICES = [
        {
            id: 'srv-1',
            num: 'SERVICE 01',
            name: 'Video Editing',
            price: 999,
            unit: 'STARTING FROM',
            desc: 'Professional video editing for reels & Shorts, YouTube videos, social media and personal projects.',
            category: 'core'
        },
        {
            id: 'srv-2',
            num: 'SERVICE 02',
            name: 'Photo Editing',
            price: 599,
            unit: 'STARTING FROM',
            desc: 'Creative posters, Thumbnail Designs, Color Grading and retouching etc.',
            category: 'core'
        },
        {
            id: 'srv-3',
            num: 'SERVICE 03',
            name: 'Indoor or Outdoor Shooting',
            price: 3999,
            unit: 'STARTING FROM',
            desc: 'Professional cinematic shooting for events, products, brands, personal projects and social media.',
            category: 'core'
        },
        {
            id: 'srv-4',
            num: 'SERVICE 04',
            name: 'Website Design',
            price: 4999,
            unit: 'STARTING FROM',
            desc: 'Landing page, Business websites, Portfolio website, E-Commerce Website, 3D Websites etc.',
            category: 'core'
        },
        {
            id: 'srv-5',
            num: 'SERVICE 05',
            name: 'Shooting + Editing',
            price: 2499,
            unit: 'STARTING FROM',
            desc: 'Complete package with cinematic indoor/outdoor shooting and professional post-production editing.',
            category: 'core'
        },
        {
            id: 'srv-6',
            num: 'SERVICE 06',
            name: 'Custom Requirements',
            price: 0,
            unit: 'direct',
            desc: 'Need a custom production package, enterprise shoot, or tailored editing brief? Connect directly with Chandu via WhatsApp or Gmail.',
            category: 'core',
            isCustomContact: true
        }
    ];

    const ADDITIONAL_SERVICES = [
        { name: 'Photo Editing', price: 499 },
        { name: 'Color Grading', price: 599 },
        { name: 'Reel Editing', price: 999 },
        { name: 'YouTube Editing', price: 999 },
        { name: 'Thumbnail Design', price: 499 },
        { name: 'Social Media Creatives', price: 499 },
        { name: 'Product Editing', price: 699 },
        { name: 'Business Web Dev', price: 7999 },
        { name: 'Landing Page Design', price: 3999 },
        { name: 'Brand Design System', price: 2499 },
        { name: '3D Website Development', price: 14999 }
    ];

    const PORTFOLIO_ITEMS = [
        {
            id: 'work-1',
            title: 'CINEMATIC SHOOTS',
            category: 'cinematic',
            catLabel: 'WORK 1',
            desc: '4K Commercial fashion shoot with dynamic color grading.',
            visual: '🎬'
        },
        {
            id: 'work-2',
            title: 'VIDEO EDITING',
            category: 'editing',
            catLabel: 'WORK 2',
            desc: 'High-velocity fast-cut reel with custom SFX and transition physics.',
            visual: '⚡'
        },
        {
            id: 'work-3',
            title: 'POSTER DESIGNS',
            category: 'poster',
            catLabel: 'WORK 3',
            desc: 'Neon-infused promotional poster for music festival release.',
            visual: '🎨'
        },
        {
            id: 'work-4',
            title: 'COLOR GRADING',
            category: 'grading',
            catLabel: 'WORK 4',
            desc: 'Feature film log-to-Rec709 color transformation pipeline with stable toggle.',
            visual: '🎞️'
        },
        {
            id: 'work-5',
            title: 'WEBSITE DESIGN',
            category: 'website',
            catLabel: 'WORK 5',
            desc: 'High-performance interactive 3D web application.',
            visual: '🌐'
        },
        {
            id: 'work-6',
            title: 'BRAND DESIGN SYSTEM',
            category: 'website',
            catLabel: 'WORK 6',
            desc: 'We can create a unique identity for your brand like logo, visiting cards, posters, Banners etc',
            visual: '🌐'
        },
    ];

    // Sync savedServices with updated default services and prices
    let savedServices = JSON.parse(localStorage.getItem('arne_services'));
    if (savedServices) {
        savedServices.forEach(s => {
            const def = DEFAULT_SERVICES.find(d => d.id === s.id);
            if (def && !s.isCustomContact) {
                s.price = def.price;
                s.name = def.name;
                s.num = def.num;
                s.desc = def.desc;
            }
        });
        DEFAULT_SERVICES.forEach(def => {
            if (!savedServices.some(s => s.id === def.id)) {
                savedServices.push(def);
            }
        });
        savedServices.sort((a, b) => {
            const idxA = DEFAULT_SERVICES.findIndex(d => d.id === a.id);
            const idxB = DEFAULT_SERVICES.findIndex(d => d.id === b.id);
            return idxA - idxB;
        });
        localStorage.setItem('arne_services', JSON.stringify(savedServices));
    }
    let servicesStore = savedServices || DEFAULT_SERVICES;

    let bookingsStore = JSON.parse(localStorage.getItem('arne_bookings')) || [
        {
            id: 'ARNE-2026-000101',
            customerName: 'Chandu',
            customerEmail: 'chandu@gmail.com',
            customerPhone: '+91 98765 43210',
            serviceName: 'Video Editing',
            totalPrice: 1049,
            prepaid30: 314.70,
            postpaid70: 734.30,
            date: '2026-08-25',
            timeSlot: '05:00 PM',
            status: 'Prepaid Paid',
            postpaidStatus: 'Pending',
            createdAt: new Date().toISOString()
        }
    ];
    let blockedSlotsStore = JSON.parse(localStorage.getItem('arne_blocked_slots')) || [
        { date: '2026-08-25', time: '10:00 AM' }
    ];
    let currentUser = {
        name: '',
        email: '',
        phone: '',
        isLoggedIn: false
    };
    let isAdminActive = JSON.parse(localStorage.getItem('arne_admin_active')) || false;

    // Active Selection State during Booking Flow
    let draftBooking = {
        serviceId: 'srv-1',
        serviceName: 'Video Editing',
        totalPrice: 1049,
        date: formatYMD(new Date()),
        timeSlot: '05:00 PM'
    };

    let calendarCurrentMonth = new Date().getMonth();
    let calendarCurrentYear = new Date().getFullYear();

    // ----------------------------------------------------------------------
    // MATH ENGINE FOR 50% PREPAID + 50% POSTPAID
    // ----------------------------------------------------------------------
    function calcPrepaid(total) {
        return Math.round(total * 0.5 * 100) / 100;
    }

    function calcPostpaid(total) {
        return Math.round(total * 0.5 * 100) / 100;
    }

    function formatYMD(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Save helpers
    function saveServices() {
        localStorage.setItem('arne_services', JSON.stringify(servicesStore));
    }

    function saveBookings() {
        localStorage.setItem('arne_bookings', JSON.stringify(bookingsStore));
    }

    function saveBlockedSlots() {
        localStorage.setItem('arne_blocked_slots', JSON.stringify(blockedSlotsStore));
    }

    function saveUser() {
        localStorage.setItem('arne_user', JSON.stringify(currentUser));
    }

    // ----------------------------------------------------------------------
    // UI INITIALIZATION & RENDERERS
    // ----------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        initGlassTheme();
        renderCoreServices();
        renderAdditionalServices();
        renderPortfolioGrid(PORTFOLIO_ITEMS);
        updateUserNavUI();
        initHeroCanvas();
        setupPortfolioAutoScrollListeners();
        startPortfolioAutoScroll();

        // Attach navbar scroll listener & active light bar spy
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        function highlightNavOnScroll() {
            let scrollY = window.pageYOffset;
            const nav = document.getElementById('navbar');

            if (scrollY > 40) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            sections.forEach(current => {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 150;
                const sectionId = current.getAttribute('id');
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Smooth internal anchor links scrolling with navbar offset
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#' || targetId.startsWith('#!')) return;
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    const nav = document.getElementById('navbar');
                    const offset = (nav ? nav.offsetHeight : 70) + 16;
                    const elementPosition = targetEl.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        window.addEventListener('scroll', highlightNavOnScroll);
        highlightNavOnScroll();
    });

    // RENDER CORE SERVICES
    function renderCoreServices() {
        const grid = document.getElementById('core-services-grid');
        if (!grid) return;

        grid.innerHTML = servicesStore.map((s) => {
            if (s.isCustomContact) {
                return `
                    <div class="service-card" style="border-color: rgba(37, 211, 102, 0.4); background: linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(13, 19, 16, 0.85) 100%);">
                        <div>
                            <span class="service-card-num" style="color:#25D366;">${s.num}</span>
                            <h3 class="service-card-title">${s.name}</h3>
                            <span class="service-card-price" style="font-size:24px; color:#25D366;">
                                Direct Consultation
                                <span class="price-note">/ ${s.unit}</span>
                            </span>
                            <p class="service-card-desc">${s.desc}</p>
                        </div>

                        <div>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <a href="https://wa.me/919390662637?text=Hi%20Chandu%20(ARNE%20Stories),%20I%20have%20a%20custom%20project%20requirement." target="_blank" class="btn-primary btn-full" style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color:#fff; text-decoration:none;">
                                    <span>CONNECT ON WHATSAPP 💬</span>
                                </a>
                                <a href="mailto:arnestories26@gmail.com" class="btn-outline btn-full" style="text-align:center; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                                    <span>GMAIL: arnestories26@gmail.com 📧</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }

            const prepaid = calcPrepaid(s.price);
            const postpaid = calcPostpaid(s.price);

            return `
                <div class="service-card">
                    <div>
                        <span class="service-card-num">${s.num}</span>
                        <h3 class="service-card-title">${s.name}</h3>
                        <span class="service-card-price">
                            ₹${s.price.toLocaleString('en-IN')}
                            <span class="price-note">/ ${s.unit}</span>
                        </span>
                        <p class="service-card-desc">${s.desc}</p>
                    </div>

                    <div>
                        <div class="service-payment-split">
                            <span class="split-prepaid">50% Prepaid: ₹${prepaid}</span>
                            <span class="split-postpaid">50% Postpaid: ₹${postpaid}</span>
                        </div>
                        <button class="btn-primary btn-full" onclick="startBookingService('${s.id}')">
                            <span>BOOK ${s.name.toUpperCase()} →</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // RENDER ADDITIONAL SERVICES
    function renderAdditionalServices() {
        const grid = document.getElementById('additional-services-grid');
        if (!grid) return;

        grid.innerHTML = ADDITIONAL_SERVICES.map(as => `
            <div class="add-service-item">
                <span class="add-service-name">${as.name}</span>
                <button class="add-service-btn" onclick="startCustomBooking('${as.name}', ${as.price})">₹${as.price} +</button>
            </div>
        `).join('');
    }

    function getPortfolioComponentHTML(id) {
        if (id === 'work-1') {
            return `
                <div class="comp-card comp-film" style="background: url('images/nocturnal-visions.jpg') center/cover no-repeat; position: relative;">
                    <div class="comp-ambient-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,6,0.3) 0%, rgba(5,7,6,0.85) 100%); pointer-events: none;"></div>
                    <div class="comp-overlay-top" style="position: relative; z-index: 2;">
                        <span class="rec-badge">● REC</span>
                        <span class="time-badge">00:04:18:22</span>
                        <span class="res-badge">4K HDR</span>
                    </div>
                    <div class="comp-overlay-bottom" style="position: relative; z-index: 2;">
                        <div class="waveform-mini">
                            <span style="height:40%"></span>
                            <span style="height:80%"></span>
                            <span style="height:50%"></span>
                            <span style="height:90%"></span>
                            <span style="height:65%"></span>
                            <span style="height:35%"></span>
                            <span style="height:75%"></span>
                        </div>
                        <span class="fps-badge">60 FPS DCI</span>
                    </div>
                </div>
            `;
        } else if (id === 'work-2') {
            return `
                <div class="comp-card comp-timeline" style="background: url('images/urban-rhythm.jpg') center/cover no-repeat; position: relative;">
                    <div class="comp-ambient-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,6,0.4) 0%, rgba(5,7,6,0.85) 100%); pointer-events: none;"></div>
                    <div class="tl-header-bar" style="position: relative; z-index: 2;">
                        <span>STUDIO_EDITING_SUITE.proj</span>
                        <span class="fx-tag">FX: PREMIERE PRO</span>
                    </div>
                    <div class="tl-track-container" style="position: relative; z-index: 2;">
                        <div class="tl-track track-v2"><span class="tl-clip clip-purple">EDIT_WORKSTATION_4K.mov</span></div>
                        <div class="tl-track track-v1"><span class="tl-clip clip-cyan">TIMELINE_TIMECODE_SYNC.mov</span></div>
                        <div class="tl-track track-a1"><span class="tl-clip clip-green">♫ MASTER_STEREO_AUDIO.wav</span></div>
                        <div class="tl-scrubber"></div>
                    </div>
                </div>
            `;
        } else if (id === 'work-3') {
            return `
                <div class="comp-card comp-poster" style="background: url('images/cyberpunk-poster.jpg') center/cover no-repeat; position: relative;">
                    <div class="comp-ambient-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,6,0.3) 0%, rgba(5,7,6,0.85) 100%); pointer-events: none;"></div>
                    <div class="poster-art-canvas" style="position: relative; z-index: 2; background: transparent; border: none;">
                        <div class="crop-mark cm-tl"></div>
                        <div class="crop-mark cm-tr"></div>
                        <div class="crop-mark cm-bl"></div>
                        <div class="crop-mark cm-br"></div>
                        <div class="poster-art-title" style="font-size:22px;">THE RULER</div>
                        <div class="poster-art-sub">POSTER ART & GRAPHICS</div>
                        <div class="poster-art-swatches">
                            <span style="background:#00ff88"></span>
                            <span style="background:#ff0055"></span>
                            <span style="background:#7b2cbf"></span>
                            <span style="background:#ffb703"></span>
                        </div>
                    </div>
                </div>
            `;
        } else if (id === 'work-4') {
            return `
                <div class="comp-card comp-grading" style="background: url('images/color-grading-split.jpg') center/cover no-repeat; position: relative;">
                    <div class="comp-ambient-overlay" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,6,0.15) 0%, rgba(5,7,6,0.85) 100%); pointer-events: none;"></div>
                    <div class="comp-overlay-top" style="position: relative; z-index: 2;">
                        <span class="rec-badge" style="background:rgba(0,255,136,0.15); color:var(--primary-emerald);">COLOR GRADING</span>
                        <span class="res-badge">RAW ❘ GRADED</span>
                    </div>
                    <div class="comp-overlay-bottom" style="position: relative; z-index: 2; margin-top: auto; display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-size:10px; font-weight:800; color:#fff; background:rgba(0,0,0,0.65); padding:4px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.15);">BEFORE (RAW)</span>
                        <span style="font-size:10px; font-weight:800; color:var(--primary-emerald); background:rgba(0,255,136,0.2); padding:4px 10px; border-radius:6px; border:1px solid rgba(0,255,136,0.4);">AFTER (GRADED)</span>
                    </div>
                </div>
            `;
        } else if (id === 'work-5') {
            return `
                <div class="comp-card" style="background: url('images/website-design-showcase.jpg') center/cover no-repeat; position: relative; min-height:220px; border-radius: 16px; overflow: hidden; height: 100%;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,6,0.1) 0%, rgba(5,7,6,0.85) 100%);"></div>
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:10px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">WEBSITE DESIGN • LIVE PREVIEW</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (id === 'work-6') {
            return `
                <div class="comp-card" style="background: url('images/brand-design-system.jpg') center/cover no-repeat; position: relative; min-height:220px; border-radius: 16px; overflow: hidden; height: 100%;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(5,7,6,0.1) 0%, rgba(5,7,6,0.85) 100%);"></div>
                    <div style="position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:10px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">BRAND DESIGN SYSTEM</span>
                        </div>
                    </div>
                </div>
            `;
        }
        return `<div class="portfolio-dummy-visual">✦</div>`;
    }

    // RENDER PORTFOLIO GRID
    function renderPortfolioGrid(items) {
        const grid = document.getElementById('portfolio-grid');
        if (!grid) return;

        grid.innerHTML = items.map(p => `
            <div class="portfolio-card" onclick="openCaseStudyModal('${p.id}')">
                <div class="portfolio-img-box">
                    ${getPortfolioComponentHTML(p.id)}
                </div>
                <div class="portfolio-info">
                    <span class="portfolio-cat">${p.catLabel}</span>
                    <h3 class="portfolio-title">${p.title}</h3>
                    <p class="portfolio-desc">${p.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // ----------------------------------------------------------------------
    // BUTTERY SMOOTH AUTOMATIC PORTFOLIO GLIDE & DRAG SCROLL ENGINE
    // ----------------------------------------------------------------------
    let portfolioAnimFrame = null;
    let isPortfolioPaused = false;
    let autoScrollSpeed = 0.75; // Silky smooth sub-pixel gliding speed
    let resumeTimeout = null;
    let isDraggingTrack = false;

    function autoScrollPortfolioLoop() {
        const track = document.getElementById('portfolio-grid');
        if (track && !isPortfolioPaused && !isDraggingTrack) {
            track.scrollLeft += autoScrollSpeed;
            const maxScroll = track.scrollWidth - track.clientWidth;

            // When reaching the right edge, seamlessly wrap back to start
            if (track.scrollLeft >= maxScroll - 1) {
                track.scrollLeft = 0;
            }
        }
        portfolioAnimFrame = requestAnimationFrame(autoScrollPortfolioLoop);
    }

    function startPortfolioAutoScroll() {
        if (!portfolioAnimFrame) {
            isPortfolioPaused = false;
            portfolioAnimFrame = requestAnimationFrame(autoScrollPortfolioLoop);
        }
    }

    function pausePortfolioGlide(duration = 0) {
        isPortfolioPaused = true;
        if (resumeTimeout) clearTimeout(resumeTimeout);
        if (duration > 0) {
            resumeTimeout = setTimeout(() => {
                isPortfolioPaused = false;
            }, duration);
        }
    }

    function resumePortfolioGlide() {
        if (resumeTimeout) clearTimeout(resumeTimeout);
        isPortfolioPaused = false;
    }

    function setupPortfolioAutoScrollListeners() {
        const wrapper = document.querySelector('.portfolio-carousel-wrapper');
        const track = document.getElementById('portfolio-grid');
        const target = wrapper || track;
        if (!target || !track) return;

        // Hover listeners to pause/resume glide
        target.addEventListener('mouseenter', () => {
            pausePortfolioGlide();
        }, { passive: true });

        target.addEventListener('mouseleave', () => {
            if (!isDraggingTrack) resumePortfolioGlide();
        }, { passive: true });

        // Touch listeners
        target.addEventListener('touchstart', () => {
            pausePortfolioGlide();
        }, { passive: true });

        target.addEventListener('touchend', () => {
            pausePortfolioGlide(2500);
        }, { passive: true });

        // Smooth Mouse Drag-to-Scroll support
        let startX = 0;
        let scrollLeftPos = 0;
        let dragDistance = 0;

        track.addEventListener('mousedown', (e) => {
            isDraggingTrack = true;
            dragDistance = 0;
            pausePortfolioGlide();
            track.classList.add('active-dragging');
            startX = e.pageX - track.offsetLeft;
            scrollLeftPos = track.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingTrack) {
                isDraggingTrack = false;
                track.classList.remove('active-dragging');
                pausePortfolioGlide(2000);
            }
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDraggingTrack) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            dragDistance += Math.abs(walk);
            track.scrollLeft = scrollLeftPos - walk;
        });
    }

    // Smooth horizontal scroll navigation for arrows
    window.scrollPortfolio = function (direction) {
        const track = document.getElementById('portfolio-grid');
        if (!track) return;
        pausePortfolioGlide(3000);
        const card = track.querySelector('.portfolio-card');
        const scrollAmount = (card ? card.offsetWidth + 28 : 380) * (direction === 'left' ? -1 : 1);
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    window.filterPortfolio = function (cat) {
        const tabs = document.querySelectorAll('.portfolio-tabs .tab-btn');
        tabs.forEach(t => t.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');

        if (cat === 'all') {
            renderPortfolioGrid(PORTFOLIO_ITEMS);
        } else {
            const filtered = PORTFOLIO_ITEMS.filter(p => p.category === cat);
            renderPortfolioGrid(filtered);
        }
        pausePortfolioGlide(2000);
    };

    // ----------------------------------------------------------------------
    // BOOKING SYSTEM FLOW (STEP 01, 02, 03)
    // ----------------------------------------------------------------------
    // ----------------------------------------------------------------------
    // CUSTOMER DETAILS & SERVICE BOOKING FORM LOGIC
    // ----------------------------------------------------------------------
    let uploadedRefFiles = [];

    window.openBookingModal = function () {
        const modal = document.getElementById('booking-modal');
        if (!modal) return;

        // Set min date to today
        const dateInput = document.getElementById('pref-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // Reset input fields to keep them empty for user entry
        const nameEl = document.getElementById('cust-full-name');
        const mobileEl = document.getElementById('cust-mobile');
        const emailEl = document.getElementById('cust-email');
        const companyEl = document.getElementById('cust-company');
        const locationEl = document.getElementById('cust-location');

        if (nameEl) nameEl.value = '';
        if (mobileEl) mobileEl.value = '';
        if (emailEl) emailEl.value = '';
        if (companyEl) companyEl.value = '';
        if (locationEl) locationEl.value = '';

        // Reset views and error states
        document.getElementById('booking-form-content')?.classList.remove('hidden');
        document.getElementById('booking-success-view')?.classList.add('hidden');
        document.getElementById('booking-form-alert')?.classList.add('hidden');
        clearFormErrors();

        updateBookingSummaryLive();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (window.lenis) window.lenis.stop();
    };

    window.closeBookingModal = function () {
        const modal = document.getElementById('booking-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        if (window.lenis) window.lenis.start();
    };

    window.startBookingService = function (serviceName) {
        openBookingModal();
        const selectEl = document.getElementById('service-select');
        if (selectEl) {
            const options = Array.from(selectEl.options);
            const match = options.find(o => o.value.toLowerCase().includes(serviceName.toLowerCase()) || serviceName.toLowerCase().includes(o.value.toLowerCase()));
            if (match) {
                selectEl.value = match.value;
            } else {
                selectEl.value = 'Other';
            }
            updateBookingSummaryLive();
        }
    };

    window.startCustomBooking = function (name) {
        startBookingService(name);
    };

    // Live Booking Summary Updater
    window.updateBookingSummaryLive = function () {
        const nameVal = document.getElementById('cust-full-name')?.value.trim() || '-- Not entered --';
        const serviceVal = document.getElementById('service-select')?.value || '-- Not selected --';
        const dateVal = document.getElementById('pref-date')?.value || 'Flexible';
        const slotVal = document.getElementById('pref-slot')?.value || 'Flexible';
        // Auto calculate prepaid 50%
        let prepaidNum = 12500;

        const manualPrepaid = document.getElementById('prepaid-amount')?.value;
        if (manualPrepaid && parseFloat(manualPrepaid) > 0) {
            prepaidNum = parseFloat(manualPrepaid);
        } else {
            const prepInput = document.getElementById('prepaid-amount');
            if (prepInput && !prepInput.value) {
                prepInput.placeholder = `₹${prepaidNum.toLocaleString('en-IN')}`;
            }
        }

        const remInput = document.getElementById('remaining-amount');
        if (remInput) {
            remInput.value = prepaidNum;
        }

        // Update Summary Elements
        if (document.getElementById('sum-name')) document.getElementById('sum-name').textContent = nameVal;
        if (document.getElementById('sum-service')) document.getElementById('sum-service').textContent = serviceVal;
        if (document.getElementById('sum-date')) document.getElementById('sum-date').textContent = dateVal;
        if (document.getElementById('sum-slot')) document.getElementById('sum-slot').textContent = slotVal;
        if (document.getElementById('sum-prepaid')) document.getElementById('sum-prepaid').textContent = `₹${prepaidNum.toLocaleString('en-IN')}`;
    };

    // File Drag & Drop Handling
    window.triggerFileInput = function () {
        document.getElementById('ref-files-input')?.click();
    };

    window.handleFileSelect = function (e) {
        const files = Array.from(e.target.files || []);
        processFiles(files);
    };

    function processFiles(files) {
        const errEl = document.getElementById('err-file');
        if (errEl) errEl.style.display = 'none';

        files.forEach(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB
                if (errEl) errEl.style.display = 'block';
                return;
            }
            if (!uploadedRefFiles.some(f => f.name === file.name && f.size === file.size)) {
                uploadedRefFiles.push(file);
            }
        });

        renderFileListPreview();
    }

    function renderFileListPreview() {
        const container = document.getElementById('file-list-preview');
        if (!container) return;

        container.innerHTML = uploadedRefFiles.map((file, idx) => `
            <div class="file-chip">
                <span>📄 ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                <span class="remove-file-btn" onclick="removeRefFile(${idx}, event)">✕</span>
            </div>
        `).join('');
    }

    window.removeRefFile = function (idx, e) {
        if (e) e.stopPropagation();
        uploadedRefFiles.splice(idx, 1);
        renderFileListPreview();
    };

    // Drag & Drop event listeners initialization
    document.addEventListener('DOMContentLoaded', () => {
        const dropZone = document.getElementById('drag-drop-area');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            processFiles(Array.from(files));
        }, false);
    });

    // Validation Engine
    function clearFormErrors() {
        document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
        document.querySelectorAll('.field-error-msg').forEach(el => el.style.display = 'none');
    }

    // Validation Engine
    function clearFormErrors() {
        document.querySelectorAll('.form-group.has-error').forEach(el => el.classList.remove('has-error'));
        document.querySelectorAll('.field-error-msg').forEach(el => el.style.display = 'none');
    }

    function validateBookingForm() {
        clearFormErrors();
        let isValid = true;

        // Full Name Validation *
        const fullName = document.getElementById('cust-full-name')?.value.trim();
        if (!fullName) {
            showFieldError('cust-full-name', 'err-full-name');
            isValid = false;
        }

        // Mobile Number Validation *
        const mobile = document.getElementById('cust-mobile')?.value.trim();
        const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]{8,15}$/;
        if (!mobile || !phoneRegex.test(mobile.replace(/\s+/g, ''))) {
            showFieldError('cust-mobile', 'err-mobile');
            isValid = false;
        }

        // Email Address Validation * (Required)
        const email = document.getElementById('cust-email')?.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError('cust-email', 'err-email');
            isValid = false;
        }

        // Service Select Validation *
        const service = document.getElementById('service-select')?.value;
        if (!service) {
            showFieldError('service-select', 'err-service');
            isValid = false;
        }

        // Preferred Date Validation *
        const prefDate = document.getElementById('pref-date')?.value;
        if (!prefDate) {
            showFieldError('pref-date', 'err-date');
            isValid = false;
        }

        // Preferred Time / Slot Validation *
        const prefSlot = document.getElementById('pref-slot')?.value;
        if (!prefSlot) {
            showFieldError('pref-slot', 'err-slot');
            isValid = false;
        }

        // Project Requirements Validation * (Required per Antigravity Prompt)
        const projectDesc = document.getElementById('project-description')?.value.trim();
        if (!projectDesc) {
            showFieldError('project-description', 'err-description');
            isValid = false;
        }

        // Estimated Budget Validation *
        const estBudget = document.getElementById('est-budget')?.value.trim();
        if (!estBudget) {
            showFieldError('est-budget', 'err-budget');
            isValid = false;
        }

        // URL Validation (Optional field)
        const link = document.getElementById('ref-link')?.value.trim();
        if (link && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(link)) {
            showFieldError('ref-link', 'err-link');
            isValid = false;
        }

        const alertEl = document.getElementById('booking-form-alert');
        if (!isValid && alertEl) {
            const alertMsg = document.getElementById('booking-alert-msg');
            if (alertMsg) alertMsg.textContent = 'Please fill in all required fields marked with * correctly.';
            alertEl.classList.remove('hidden');
        } else if (alertEl) {
            alertEl.classList.add('hidden');
        }

        return isValid;
    }

    function showFieldError(inputId, errMsgId) {
        const input = document.getElementById(inputId);
        const group = input?.closest('.form-group');
        const errEl = document.getElementById(errMsgId);

        if (group) group.classList.add('has-error');
        if (errEl) errEl.style.display = 'block';
    }

    // Submit Handling
    window.handleSecondarySubmit = function () {
        const form = document.getElementById('arne-booking-form');
        if (form) handleBookingFormSubmit(new Event('submit', { cancelable: true }));
    };

    window.handleBookingFormSubmit = async function (e) {
        if (e) e.preventDefault();

        if (!validateBookingForm()) {
            const card = document.querySelector('.booking-modal-card');
            if (card) card.scrollTop = 0;
            return;
        }

        // 1. Loading State: "Booking Slot..." with Spinner
        const btn = document.getElementById('btn-book-slot-primary');
        const btnText = document.getElementById('btn-book-text');
        const originalBtnHTML = btnText ? btnText.innerHTML : 'PROCEED TO SECURE PAYMENT ↗';

        if (btn) btn.disabled = true;
        if (btnText) {
            btnText.innerHTML = '<span style="display:inline-block; width:14px; height:14px; border:2px solid #00ff88; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span> Booking Slot & Sending Confirmation...';
        }

        // Generate Unique Booking ID (e.g. ARNE-2026-849201)
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        const bookingId = `ARNE-2026-${randomCode}`;

        const fullName = document.getElementById('cust-full-name')?.value.trim() || '';
        const mobile = document.getElementById('cust-mobile')?.value.trim() || '';
        const whatsapp = document.getElementById('cust-whatsapp')?.value.trim() || mobile;
        const email = document.getElementById('cust-email')?.value.trim() || '';
        const company = document.getElementById('cust-company')?.value.trim() || '';
        const location = document.getElementById('cust-location')?.value.trim() || '';
        const serviceName = document.getElementById('service-select')?.value || 'Creative Service';
        const projectDesc = document.getElementById('project-description')?.value.trim() || 'No additional requirements.';
        const prefDate = document.getElementById('pref-date')?.value || '';
        const prefSlot = document.getElementById('pref-slot')?.value || '';
        const estBudget = document.getElementById('est-budget')?.value.trim() || 'Flexible';
        const refLink = document.getElementById('ref-link')?.value.trim() || 'None';
        const paymentPref = document.getElementById('pay-method')?.value || 'UPI / Card';

        // Calculate pricing split (50% Prepaid Deposit + 50% Postpaid)
        const priceNum = Number((estBudget || '').replace(/\D/g, '')) || 999;
        const prepaidVal = Math.round(priceNum * 0.5 * 100) / 100;
        const postpaidVal = Math.round(priceNum * 0.5 * 100) / 100;

        const bookingData = {
            id: bookingId,
            name: fullName,
            email: email,
            phone: mobile,
            whatsapp: whatsapp,
            company: company,
            location: location,
            service: serviceName,
            desc: projectDesc,
            date: prefDate,
            slot: prefSlot,
            total: priceNum,
            prepaid: prepaidVal,
            postpaid: postpaidVal,
            refLink: refLink,
            paymentPref: paymentPref
        };

        // Store pending payment in sessionStorage
        sessionStorage.setItem('arne_pending_payment', JSON.stringify(bookingData));

        // Direct Supabase Cloud Database Insertion (Stores Patient / Customer Form Data)
        if (supabaseClient) {
            try {
                await supabaseClient.from('bookings').insert([{
                    id: bookingId,
                    client_name: fullName,
                    client_email: email,
                    client_phone: mobile,
                    customer_name: fullName,
                    customer_phone: mobile,
                    customer_whatsapp: whatsapp,
                    customer_email: email,
                    company: company,
                    location: location,
                    service_type: serviceName,
                    service_name: serviceName,
                    project_desc: projectDesc,
                    booking_date: prefDate,
                    booking_time: prefSlot,
                    time_slot: prefSlot,
                    total_price: priceNum,
                    prepaid_amount: prepaidVal,
                    postpaid_amount: postpaidVal,
                    amount_paid: 0,
                    amount_remaining: priceNum,
                    status: 'Pending Payment',
                    booking_status: 'Pending Payment',
                    payment_status: 'Pending',
                    ref_link: refLink
                }]);
                console.log('[ARNE Supabase] Booking & patient form record saved to Supabase:', bookingId);
            } catch (err) {
                console.warn('[ARNE Supabase Notice] Client-side booking save notice:', err);
            }

            try {
                await supabaseClient.from('customers').insert([{
                    full_name: fullName,
                    mobile: mobile,
                    whatsapp: whatsapp,
                    email: email,
                    company: company,
                    location: location
                }]);
            } catch (cErr) {
                console.warn('[ARNE Supabase Notice] Client-side customer save notice:', cErr);
            }
        }

        // Construct checkout URL pointing to payment.html
        const paymentUrl = `payment.html?id=${encodeURIComponent(bookingId)}&name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(mobile)}&service=${encodeURIComponent(serviceName)}&date=${encodeURIComponent(prefDate)}&slot=${encodeURIComponent(prefSlot)}&desc=${encodeURIComponent(projectDesc)}&total=${priceNum}&prepaid=${prepaidVal}&postpaid=${postpaidVal}`;

        // Redirect directly to the Mobile OTP & Razorpay Gateway Checkout page
        window.location.href = paymentUrl;
    };

    function showBookingSuccessNotification(info) {
        let toast = document.getElementById('arne-booking-success-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'arne-booking-success-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 999999;
                background: linear-gradient(135deg, rgba(14, 24, 18, 0.96) 0%, rgba(6, 10, 8, 0.98) 100%);
                border: 1px solid #00ff88;
                border-radius: 20px;
                padding: 24px 28px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0,255,136,0.35);
                backdrop-filter: blur(24px);
                color: #ffffff;
                max-width: 440px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                transform: translateY(120px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:24px; color:#00ff88;">✓</span>
                    <strong style="color:#00ff88; font-size:17px; font-family:'Syne',sans-serif; letter-spacing:0.5px;">Slot Booked Successfully!</strong>
                </div>
                <button onclick="document.getElementById('arne-booking-success-toast').style.opacity='0'; document.getElementById('arne-booking-success-toast').style.transform='translateY(120px)';" style="background:none; border:none; color:#71717a; font-size:18px; cursor:pointer; padding:0 4px;">✕</button>
            </div>
            <p style="font-size:13.5px; color:#e4e4e7; margin:0 0 14px 0; line-height:1.6;">
                A confirmation email has been sent directly to <strong>${info.customerEmail || 'your inbox'}</strong>.
            </p>
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(0,255,136,0.2); border-radius:12px; padding:12px 16px; margin-bottom:14px; font-size:12.5px; line-height:1.6;">
                <div><span style="color:#a1a1aa;">Booking ID:</span> <strong style="color:#00ff88;">${info.bookingId}</strong></div>
                <div><span style="color:#a1a1aa;">Service:</span> <strong>${info.serviceName}</strong></div>
                <div><span style="color:#a1a1aa;">Slot:</span> 📅 <strong>${info.bookingDate}</strong> @ ⏰ <strong>${info.bookingTime}</strong></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11px; color:#00ff88; font-weight:700; background:rgba(0,255,136,0.12); padding:4px 10px; border-radius:99px;">CONFIRMED & EMAILED 📧</span>
                <a href="https://wa.me/919390662637?text=Hi%20Chandu,%20I%20just%20booked%20slot%20${info.bookingId}%20for%20${encodeURIComponent(info.serviceName)}." target="_blank" style="color:#ffffff; font-size:11.5px; font-weight:700; text-decoration:none; background:#25D366; padding:6px 12px; border-radius:8px;">WhatsApp Lead 💬</a>
            </div>
        `;

        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 50);

        setTimeout(() => {
            if (toast) {
                toast.style.transform = 'translateY(120px)';
                toast.style.opacity = '0';
            }
        }, 9000);
    }

    // ----------------------------------------------------------------------
    // CUSTOMER AUTH & LOGIN MODAL
    // ----------------------------------------------------------------------
    window.openAuthModal = function () {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (window.lenis) window.lenis.stop();
        }
    };

    window.closeAuthModal = function () {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (window.lenis) window.lenis.start();
        }
    };

    window.loginWithGoogle = function () {
        currentUser = {
            name: '',
            email: '',
            phone: '',
            isLoggedIn: true
        };
        saveUser();
        updateUserNavUI();
        closeAuthModal();
        openBookingModal();
        goToStep(3);
    };

    window.sendPhoneOTP = function () {
        const phone = document.getElementById('auth-phone').value;
        if (!phone) {
            alert('Please enter a valid phone number.');
            return;
        }
        document.getElementById('phone-input-group').classList.add('hidden');
        document.getElementById('otp-input-group').classList.remove('hidden');
    };

    window.verifyOTP = function () {
        const otp = document.getElementById('auth-otp').value;
        const phone = document.getElementById('auth-phone').value;
        if (otp.length !== 6) {
            alert('Please enter valid 6-digit OTP (e.g. 123456).');
            return;
        }
        currentUser = {
            name: '',
            email: '',
            phone: phone || '',
            isLoggedIn: true
        };
        saveUser();
        updateUserNavUI();
        closeAuthModal();
        openBookingModal();
        goToStep(3);
    };

    function updateUserNavUI() {
        const userText = document.getElementById('nav-user-text');
        const custAvatar = document.getElementById('cust-avatar');
        const custName = document.getElementById('cust-name-display');
        const custEmail = document.getElementById('cust-email-display');

        if (currentUser && currentUser.isLoggedIn) {
            if (userText) userText.textContent = currentUser.name.split(' ')[0];
            if (custAvatar) custAvatar.textContent = currentUser.name.charAt(0);
            if (custName) custName.textContent = currentUser.name;
            if (custEmail) custEmail.textContent = currentUser.email;
        } else {
            if (userText) userText.textContent = 'Account';
        }
    }

    window.handleContactSubmit = function (e) {
        if (e) e.preventDefault();
        const name = document.getElementById('c-name')?.value.trim();
        const email = document.getElementById('c-email')?.value.trim();
        const phone = document.getElementById('c-phone')?.value.trim();

        if (!name || !email || !phone) {
            alert('Please fill in your Name, Email Address, and Phone Number.');
            return;
        }

        // Insert into Supabase 'contact_messages' table
        if (supabaseClient) {
            try {
                supabaseClient.from('contact_messages').insert([{
                    name: name,
                    email: email,
                    phone: phone
                }]).then(res => {
                    console.log('[ARNE Supabase] Contact info inserted into contact_messages table:', res);
                }).catch(err => {
                    console.warn('[ARNE Supabase Notice] contact_messages table insert notice:', err.message);
                });
            } catch (supErr) {
                console.warn('[ARNE Supabase Notice] contact_messages table insert error:', supErr);
            }
        }

        // Trigger /api/contact for Nodemailer email notification to arneworks26@gmail.com
        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone })
        }).then(r => r.json()).then(data => {
            console.log('[ARNE Contact API Response]', data);
        }).catch(err => {
            console.warn('[ARNE Contact API Notice]', err);
        });

        alert(`✓ Thank you ${name}! Your details have been submitted. We will contact you at ${phone} / ${email} shortly.`);
        if (e && e.target && typeof e.target.reset === 'function') e.target.reset();
    };

    // ----------------------------------------------------------------------
    // RAZORPAY PAYMENT SIMULATOR
    // ----------------------------------------------------------------------
    window.openPaymentModal = function () {
        const total = draftBooking.totalPrice;
        const prepaid = calcPrepaid(total);

        document.getElementById('rzp-service-title').textContent = `${draftBooking.serviceName} Order`;
        document.getElementById('rzp-prepaid-amount').textContent = `₹${prepaid}`;
        setRzpMethod('upi');
        document.getElementById('payment-modal').classList.add('active');
    };

    window.closePaymentModal = function () {
        document.getElementById('payment-modal').classList.remove('active');
    };

    window.setRzpMethod = function (method) {
        const tabs = document.querySelectorAll('.rzp-tab');
        tabs.forEach(t => t.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');

        const content = document.getElementById('rzp-content');
        if (!content) return;

        if (method === 'upi') {
            content.innerHTML = `
                <div class="card-box" style="text-align:center;">
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">Enter your UPI ID (Google Pay, PhonePe, Paytm, BHIM) or Scan QR:</p>
                    <input type="text" placeholder="e.g. mobileNumber@upi / username@okaxis" class="rzp-input" style="margin-bottom:12px; text-align:center;">
                    <div style="padding:16px; background:rgba(0,255,136,0.05); border:1px dashed var(--primary-emerald); border-radius:12px; display:inline-block; width:100%;">
                        <div style="font-size:32px; margin-bottom:4px;">📲</div>
                        <span style="font-size:12px; color:var(--primary-emerald); font-weight:700;">INSTANT UPI AUTO-TRANSFER</span>
                        <p style="font-size:11px; color:var(--text-muted); margin-top:4px;">Supports Google Pay, PhonePe, Paytm & all UPI Apps</p>
                    </div>
                </div>
            `;
        } else if (method === 'netbanking') {
            content.innerHTML = `
                <div class="card-box">
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">Select your Bank for Netbanking Transfer:</p>
                    <select class="form-select rzp-input" style="margin-bottom:8px; width:100%; background:rgba(0,0,0,0.5); color:#fff; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.15);">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                    </select>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="card-box">
                    <p style="font-size:13px; color:var(--text-secondary); margin-bottom:12px;">Enter your Credit / Debit Card details:</p>
                    <input type="text" placeholder="Card Number (4000 1234 5678 9010)" class="rzp-input" style="margin-bottom:8px;">
                    <div style="display:flex; gap:8px;">
                        <input type="text" placeholder="MM/YY" class="rzp-input">
                        <input type="password" placeholder="CVV" class="rzp-input">
                    </div>
                </div>
            `;
        }
    };

    window.completePaymentSimulation = function () {
        const randomId = 'ARNE-2026-' + String(Math.floor(100000 + Math.random() * 900000));
        const total = draftBooking.totalPrice;
        const prepaid = calcPrepaid(total);
        const postpaid = calcPostpaid(total);
        const todayStr = formatYMD(new Date());

        const newBooking = {
            id: randomId,
            customerName: currentUser.name,
            customerEmail: currentUser.email,
            customerPhone: currentUser.phone,
            serviceName: draftBooking.serviceName,
            totalPrice: total,
            prepaid30: prepaid,
            postpaid70: postpaid,
            date: todayStr,
            timeSlot: 'Direct Order',
            status: 'Prepaid Paid',
            postpaidStatus: 'Pending',
            createdAt: new Date().toISOString()
        };

        bookingsStore.unshift(newBooking);
        saveBookings();

        closePaymentModal();
        alert(`🎉 ORDER CONFIRMED!\n\nOrder ID: ${randomId}\nPlan: ${draftBooking.serviceName}\n50% Prepaid Paid: ₹${prepaid}\n50% Postpaid Remaining: ₹${postpaid}\nOrder Date: ${todayStr}`);

        openCustomerPortal();
    };

    // ----------------------------------------------------------------------
    // CUSTOMER DASHBOARD DRAWER
    // ----------------------------------------------------------------------
    window.openCustomerPortal = function () {
        if (!currentUser || !currentUser.isLoggedIn) {
            openAuthModal();
            return;
        }
        renderCustomerDashboard();
        const modal = document.getElementById('customer-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (window.lenis) window.lenis.stop();
        }
    };

    window.closeCustomerPortal = function () {
        const modal = document.getElementById('customer-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            if (window.lenis) window.lenis.start();
        }
    };

    window.logoutCustomer = function () {
        currentUser = { isLoggedIn: false };
        saveUser();
        updateUserNavUI();
        closeCustomerPortal();
    };

    function renderCustomerDashboard() {
        const userBookings = bookingsStore.filter(b => b.customerEmail === currentUser.email || b.customerName === currentUser.name);

        document.getElementById('d-total-bookings').textContent = userBookings.length;

        const activeCount = userBookings.filter(b => b.status !== 'Completed' && b.status !== 'Fully Paid').length;
        document.getElementById('d-active-projects').textContent = activeCount;

        const pendingPostpaidSum = userBookings
            .filter(b => b.postpaidStatus === 'Pending')
            .reduce((sum, b) => sum + b.postpaid70, 0);
        document.getElementById('d-pending-postpaid').textContent = `₹${pendingPostpaidSum.toLocaleString('en-IN')}`;

        const listEl = document.getElementById('customer-bookings-list');
        if (!listEl) return;

        if (userBookings.length === 0) {
            listEl.innerHTML = `<p style="color: var(--text-muted);">No bookings found yet. Click "Book a Slot" to start your first project!</p>`;
            return;
        }

        listEl.innerHTML = userBookings.map(b => `
            <div class="booking-item-card">
                <div class="bic-top">
                    <strong>${b.id}</strong>
                    <span class="status-tag ${b.postpaidStatus === 'Paid' ? 'tag-fullpaid' : 'tag-prepaid'}">${b.status}</span>
                </div>
                <div style="font-size:16px; font-weight:800; margin-bottom:6px;">${b.serviceName}</div>
                <div style="font-size:13px; color: var(--text-secondary); margin-bottom:12px;">📅 ${b.date} @ ${b.timeSlot}</div>
                <div class="service-payment-split">
                    <span>50% Prepaid: ₹${b.prepaid30} (Paid ✓)</span>
                    <span>50% Postpaid: ₹${b.postpaid70} (${b.postpaidStatus})</span>
                </div>
            </div>
        `).join('');
    }

    // ----------------------------------------------------------------------
    // DATA PERSISTENCE HELPERS
    // ----------------------------------------------------------------------
    function saveBookings() {
        try {
            localStorage.setItem('arne_bookings', JSON.stringify(bookingsStore));
        } catch (e) {}
    }

    function saveBlockedSlots() {
        try {
            localStorage.setItem('arne_blocked_slots', JSON.stringify(blockedSlotsStore));
        } catch (e) {}
    }

    function saveServices() {
        try {
            localStorage.setItem('arne_services', JSON.stringify(servicesStore));
        } catch (e) {}
    }

    // ----------------------------------------------------------------------
    // ADMIN AUTHENTICATION & BACKEND PORTAL
    // ----------------------------------------------------------------------
    const ADMIN_CREDENTIALS = {
        email: 'arneworks26@gmail.com',
        password: '9398123529'
    };

    window.openAdminPortalTrigger = function () {
        const isLoggedIn = JSON.parse(localStorage.getItem('arne_admin_active')) || false;
        if (isLoggedIn) {
            window.openAdminPortal();
        } else {
            window.openAdminLoginModal();
        }
    };

    window.openAdminLoginModal = function () {
        const errorEl = document.getElementById('admin-login-error');
        if (errorEl) errorEl.classList.add('hidden');
        const modal = document.getElementById('admin-login-modal');
        if (modal) modal.classList.add('active');
    };

    window.closeAdminLoginModal = function () {
        const modal = document.getElementById('admin-login-modal');
        if (modal) modal.classList.remove('active');
    };

    window.handleAdminLogin = function (e) {
        if (e) e.preventDefault();
        const emailInput = document.getElementById('admin-email-input').value.trim();
        const passwordInput = document.getElementById('admin-password-input').value.trim();
        const errorEl = document.getElementById('admin-login-error');

        if (emailInput.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && passwordInput === ADMIN_CREDENTIALS.password) {
            isAdminActive = true;
            try {
                localStorage.setItem('arne_admin_active', 'true');
                localStorage.setItem('arne_admin_email', ADMIN_CREDENTIALS.email);
            } catch (err) {}

            closeAdminLoginModal();
            window.openAdminPortal();
        } else {
            if (errorEl) errorEl.classList.remove('hidden');
        }
    };

    window.openAdminPortal = function () {
        renderAdminStats();
        renderAdminBookingsTable();
        renderAdminBlockedSlotsList();
        renderAdminServicesGrid();
        const modal = document.getElementById('admin-modal');
        if (modal) modal.classList.add('active');
    };

    window.closeAdminPortal = function () {
        const modal = document.getElementById('admin-modal');
        if (modal) modal.classList.remove('active');
    };

    window.logoutAdmin = function () {
        isAdminActive = false;
        try {
            localStorage.setItem('arne_admin_active', 'false');
            localStorage.removeItem('arne_admin_email');
        } catch (e) {}
        closeAdminPortal();
    };

    window.switchAdminTab = function (tabName) {
        ['bookings', 'add-booking', 'slots', 'services'].forEach(t => {
            const btn = document.getElementById(`adm-tab-btn-${t}`);
            const content = document.getElementById(`admin-tab-${t}`);
            if (btn) {
                if (t === tabName) btn.classList.add('active');
                else btn.classList.remove('active');
            }
            if (content) {
                if (t === tabName) content.classList.remove('hidden');
                else content.classList.add('hidden');
            }
        });
    };

    // RENDER ADMIN STATS
    function renderAdminStats() {
        const totalBookingsEl = document.getElementById('adm-stat-total');
        const revenueEl = document.getElementById('adm-stat-revenue');
        const pendingEl = document.getElementById('adm-stat-pending');
        const activeEl = document.getElementById('adm-stat-active');

        let totalBookings = bookingsStore.length;
        let totalRevenue = 0;
        let pendingPostpaid = 0;
        let activeCount = 0;

        bookingsStore.forEach(b => {
            totalRevenue += Number(b.totalPrice || 0);
            if (b.postpaidStatus === 'Pending') {
                pendingPostpaid += Number(b.postpaid70 || 0);
            }
            if (b.status !== 'Completed' && b.status !== 'Fully Paid' && b.status !== 'Cancelled') {
                activeCount++;
            }
        });

        if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
        if (revenueEl) revenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
        if (pendingEl) pendingEl.textContent = `₹${pendingPostpaid.toLocaleString()}`;
        if (activeEl) activeEl.textContent = activeCount;
    }

    // RENDER ADMIN BOOKINGS TABLE
    function renderAdminBookingsTable(filteredList) {
        const tbody = document.getElementById('admin-bookings-tbody');
        if (!tbody) return;

        const list = filteredList || bookingsStore;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:30px; color: var(--text-muted);">No bookings found.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(b => `
            <tr>
                <td>
                    <strong style="color:var(--text-primary); font-size:13px;">${b.id}</strong><br>
                    <small style="color:var(--text-muted); font-size:10px;">${b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Manual'}</small>
                </td>
                <td>
                    <div style="font-weight:700;">${b.customerName || 'N/A'}</div>
                    <small style="color:var(--text-secondary); display:block;">📞 ${b.customerPhone || 'N/A'}</small>
                    <small style="color:var(--text-muted); display:block;">✉️ ${b.customerEmail || 'N/A'}</small>
                </td>
                <td><span style="font-weight:600;">${b.serviceName}</span></td>
                <td>
                    <span>📅 ${b.date}</span><br>
                    <small style="color:var(--text-muted);">⏰ ${b.timeSlot}</small>
                </td>
                <td><strong style="font-size:14px;">₹${b.totalPrice}</strong></td>
                <td>
                    <span style="color:var(--primary-emerald); font-weight:700;">₹${b.prepaid30}</span><br>
                    <small style="color:var(--primary-emerald); font-size:10px;">✓ Paid</small>
                </td>
                <td>
                    <span>₹${b.postpaid70}</span><br>
                    <small style="color:${b.postpaidStatus === 'Paid' ? '#10b981' : '#ef4444'}; font-weight:700; font-size:10px;">
                        ${b.postpaidStatus === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                    </small>
                </td>
                <td>
                    <select onchange="updateBookingStage('${b.id}', this.value)" style="padding:6px 10px; border-radius:8px; background:rgba(255,255,255,0.06); color:#fff; border:1px solid var(--border-card); font-size:12px; outline:none; cursor:pointer;">
                        <option value="Prepaid Paid" ${b.status === 'Prepaid Paid' ? 'selected' : ''}>Prepaid Paid (50%)</option>
                        <option value="In Progress" ${b.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Review" ${b.status === 'Review' ? 'selected' : ''}>In Review</option>
                        <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Fully Paid" ${b.status === 'Fully Paid' ? 'selected' : ''}>Fully Paid (100%)</option>
                        <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <button class="btn-outline btn-sm" onclick="viewBookingDetails('${b.id}')" title="View Full Details">👁️ Details</button>
                        ${b.postpaidStatus === 'Pending' ? `
                            <button class="btn-primary btn-sm" onclick="markPostpaidReceived('${b.id}')">Mark 50% Paid</button>
                        ` : ''}
                        <button class="btn-outline btn-sm" onclick="deleteAdminBooking('${b.id}')" style="border-color:rgba(239, 68, 68, 0.4); color:#ef4444;" title="Delete Booking">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

        renderAdminStats();
    }

    window.filterAdminBookings = function () {
        const query = document.getElementById('admin-search-input').value.toLowerCase().trim();
        const statusFilter = document.getElementById('admin-status-filter').value;

        const filtered = bookingsStore.filter(b => {
            const matchesQuery = (b.id && b.id.toLowerCase().includes(query)) ||
                (b.customerName && b.customerName.toLowerCase().includes(query)) ||
                (b.customerEmail && b.customerEmail.toLowerCase().includes(query)) ||
                (b.customerPhone && b.customerPhone.toLowerCase().includes(query)) ||
                (b.serviceName && b.serviceName.toLowerCase().includes(query));

            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

            return matchesQuery && matchesStatus;
        });

        renderAdminBookingsTable(filtered);
    };

    window.updateBookingStage = function (id, newStage) {
        const b = bookingsStore.find(x => x.id === id);
        if (b) {
            b.status = newStage;
            if (newStage === 'Fully Paid') {
                b.postpaidStatus = 'Paid';
            }
            saveBookings();
            renderAdminBookingsTable();
        }
    };

    window.markPostpaidReceived = function (id) {
        const b = bookingsStore.find(x => x.id === id);
        if (b) {
            b.postpaidStatus = 'Paid';
            b.status = 'Fully Paid';
            saveBookings();
            renderAdminBookingsTable();
            alert(`✓ Marked 50% postpaid (₹${b.postpaid70}) as RECEIVED for ${b.id}`);
        }
    };

    window.deleteAdminBooking = function (id) {
        if (confirm(`Are you sure you want to delete booking ${id}? This action cannot be undone.`)) {
            bookingsStore = bookingsStore.filter(b => b.id !== id);
            saveBookings();
            renderAdminBookingsTable();
            alert(`✓ Booking ${id} has been deleted.`);
        }
    };

    // ADMIN VIEW BOOKING DETAILS MODAL
    window.viewBookingDetails = function (id) {
        const b = bookingsStore.find(x => x.id === id);
        if (!b) return;

        document.getElementById('adm-det-id').textContent = b.id;
        document.getElementById('adm-det-service').textContent = b.serviceName;

        const bodyEl = document.getElementById('admin-details-body');
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); padding:20px; border-radius:18px; margin-bottom:16px;">
                    <h4 style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--primary-emerald); margin-bottom:12px;">Customer Profile</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">
                        <div><strong>Full Name:</strong> ${b.customerName || 'N/A'}</div>
                        <div><strong>Mobile:</strong> ${b.customerPhone || 'N/A'}</div>
                        <div><strong>Email:</strong> ${b.customerEmail || 'N/A'}</div>
                        <div><strong>WhatsApp:</strong> ${b.customerWhatsapp || 'N/A'}</div>
                        <div><strong>Company:</strong> ${b.company || 'N/A'}</div>
                        <div><strong>Location:</strong> ${b.location || 'N/A'}</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); padding:20px; border-radius:18px; margin-bottom:16px;">
                    <h4 style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--primary-emerald); margin-bottom:12px;">Booking & Financial Breakdown</h4>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px;">
                        <div><strong>Date:</strong> ${b.date}</div>
                        <div><strong>Time Slot:</strong> ${b.timeSlot}</div>
                        <div><strong>Total Price:</strong> ₹${b.totalPrice}</div>
                        <div><strong>Current Status:</strong> ${b.status}</div>
                        <div><strong>Prepaid 50%:</strong> ₹${b.prepaid30} (Paid)</div>
                        <div><strong>Postpaid 50%:</strong> ₹${b.postpaid70} (${b.postpaidStatus})</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); padding:20px; border-radius:18px;">
                    <h4 style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px; color:var(--primary-emerald); margin-bottom:12px;">Project Requirements & Brief</h4>
                    <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; white-space:pre-wrap;">${b.projectDesc || b.desc || 'No additional requirements provided.'}</p>
                </div>
            `;
        }

        const modal = document.getElementById('admin-details-modal');
        if (modal) modal.classList.add('active');
    };

    window.closeAdminDetailsModal = function () {
        const modal = document.getElementById('admin-details-modal');
        if (modal) modal.classList.remove('active');
    };

    // ADMIN ADD NEW BOOKING HANDLER
    window.handleAdminServiceChange = function () {
        const select = document.getElementById('adm-add-service');
        const priceInput = document.getElementById('adm-add-price');
        if (select && priceInput) {
            const selectedOpt = select.options[select.selectedIndex];
            const price = selectedOpt.getAttribute('data-price');
            if (price) priceInput.value = price;
        }
    };

    window.handleAdminAddBooking = function (e) {
        if (e) e.preventDefault();

        const name = document.getElementById('adm-add-name').value.trim();
        const mobile = document.getElementById('adm-add-mobile').value.trim();
        const email = document.getElementById('adm-add-email').value.trim();
        const whatsapp = document.getElementById('adm-add-whatsapp').value.trim() || 'N/A';
        const company = document.getElementById('adm-add-company').value.trim() || 'N/A';
        const location = document.getElementById('adm-add-location').value.trim() || 'N/A';
        const serviceSelect = document.getElementById('adm-add-service');
        const serviceName = serviceSelect ? serviceSelect.value : 'Custom Service';
        const date = document.getElementById('adm-add-date').value;
        const timeSlot = document.getElementById('adm-add-slot').value;
        const totalPrice = Number(document.getElementById('adm-add-price').value) || 999;
        const status = document.getElementById('adm-add-status').value;
        const projectDesc = document.getElementById('adm-add-desc').value.trim();

        if (!name || !mobile || !email || !date) {
            alert('Please fill in all required fields (*)');
            return;
        }

        const prepaid = calcPrepaid(totalPrice);
        const postpaid = calcPostpaid(totalPrice);
        const postpaidStatus = status === 'Fully Paid' ? 'Paid' : 'Pending';

        const randomId = Math.floor(100000 + Math.random() * 900000);
        const newBooking = {
            id: `ARNE-2026-${randomId}`,
            customerName: name,
            customerPhone: mobile,
            customerEmail: email,
            customerWhatsapp: whatsapp,
            company: company,
            location: location,
            serviceName: serviceName,
            totalPrice: totalPrice,
            prepaid30: prepaid,
            postpaid70: postpaid,
            date: date,
            timeSlot: timeSlot,
            status: status,
            postpaidStatus: postpaidStatus,
            projectDesc: projectDesc,
            createdAt: new Date().toISOString()
        };

        bookingsStore.unshift(newBooking);
        saveBookings();

        // Reset form
        document.getElementById('admin-add-booking-form').reset();
        window.switchAdminTab('bookings');
        renderAdminBookingsTable();

        alert(`✓ Success! New booking ${newBooking.id} created for ${name}.`);
    };

    // ADMIN SLOT MANAGER
    window.adminBlockSlot = function () {
        const dateInput = document.getElementById('sm-date-input').value;
        const timeSelect = document.getElementById('sm-time-select').value;

        if (!dateInput) {
            alert('Please select a target date to block.');
            return;
        }

        blockedSlotsStore.push({ date: dateInput, time: timeSelect });
        saveBlockedSlots();
        renderAdminBlockedSlotsList();
        alert(`✓ Blocked ${timeSelect} on ${dateInput}`);
    };

    function renderAdminBlockedSlotsList() {
        const ul = document.getElementById('admin-blocked-slots-list');
        if (!ul) return;

        if (blockedSlotsStore.length === 0) {
            ul.innerHTML = `<li style="color:var(--text-muted);">No slots blocked.</li>`;
            return;
        }

        ul.innerHTML = blockedSlotsStore.map((b, idx) => `
            <li style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #222;">
                <span>📅 ${b.date} — ${b.time}</span>
                <button onclick="unblockAdminSlot(${idx})" style="background:none; border:none; color:#ef4444; cursor:pointer;">Unblock ✕</button>
            </li>
        `).join('');
    }

    window.unblockAdminSlot = function (idx) {
        blockedSlotsStore.splice(idx, 1);
        saveBlockedSlots();
        renderAdminBlockedSlotsList();
    };

    // ADMIN SERVICE MANAGER
    function renderAdminServicesGrid() {
        const grid = document.getElementById('admin-services-grid');
        if (!grid) return;

        grid.innerHTML = servicesStore.map(s => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); padding:18px; border-radius:14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${s.name}</strong><br>
                    <small style="color:var(--text-muted);">${s.unit}</small>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <span>₹</span>
                    <input type="number" value="${s.price}" id="edit-srv-price-${s.id}" style="width:100px; padding:6px; border-radius:6px; background:#111; color:#fff; border:1px solid #333;">
                    <button class="btn-primary btn-sm" onclick="saveAdminServicePrice('${s.id}')">Update</button>
                </div>
            </div>
        `).join('');
    }

    window.saveAdminServicePrice = function (id) {
        const val = parseFloat(document.getElementById(`edit-srv-price-${id}`).value);
        const s = servicesStore.find(x => x.id === id);
        if (s && !isNaN(val)) {
            s.price = val;
            saveServices();
            renderCoreServices();
            alert(`✓ Updated price for ${s.name} to ₹${val}`);
        }
    };

    // ----------------------------------------------------------------------
    // CONTACT FORM HANDLER & CASE STUDY MODAL
    // ----------------------------------------------------------------------
    window.handleContactSubmit = async function (e) {
        e.preventDefault();
        const name = document.getElementById('c-name')?.value.trim() || '';
        const email = document.getElementById('c-email')?.value.trim() || '';
        const phone = document.getElementById('c-phone')?.value.trim() || '';

        // Save contact message directly to Supabase
        if (supabaseClient) {
            try {
                await supabaseClient.from('contact_messages').insert([{
                    name: name,
                    email: email,
                    phone: phone
                }]);
                console.log('[ARNE Supabase] Contact message saved to Supabase');
            } catch (supErr) {
                console.warn('[ARNE Supabase Notice] Contact message save notice:', supErr);
            }
        }

        alert(`✨ Thank you ${name}! Your inquiry has been received. We will contact you at ${email} / ${phone} shortly.`);
        e.target.reset();
    };

    window.handleGradingMouseMove = function (e, container) {
        const rect = container.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        const rightInset = 100 - percent;

        const beforeLayer = container.querySelector('.ba-before');
        const handle = container.querySelector('.ba-handle');
        if (beforeLayer) beforeLayer.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
        if (handle) handle.style.left = percent + '%';
    };

    window.toggleGradingView = function (mode) {
        const card = document.getElementById('grading-card-4');
        if (!card) return;
        const beforeLayer = card.querySelector('.ba-before');
        const handle = card.querySelector('.ba-handle');

        let percent = 50;
        if (mode === 'before') percent = 100;
        else if (mode === 'after') percent = 0;

        const rightInset = 100 - percent;
        if (beforeLayer) beforeLayer.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
        if (handle) handle.style.left = percent + '%';
    };

    window.openCaseStudyModal = function (id) {
        const modal = document.getElementById('case-study-modal');
        const content = document.getElementById('case-study-content');
        const item = PORTFOLIO_ITEMS.find(p => p.id === id);

        if (item && content) {
            let visualHtml = '';
            if (item.id === 'work-1') {
                visualHtml = `<div style="height:280px; border-radius:20px; background: url('images/nocturnal-visions.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">BEHIND THE SCENES • CINEMATIC SHOOT</span>
                </div>`;
            } else if (item.id === 'work-2') {
                visualHtml = `<div style="height:280px; border-radius:20px; background: url('images/urban-rhythm.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">TIMELINE WORKSTATION • VIDEO EDITING</span>
                </div>`;
            } else if (item.id === 'work-3') {
                visualHtml = `<div style="height:280px; border-radius:20px; background: url('images/cyberpunk-poster.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">GRAPHICS SUITE • POSTER DESIGNS</span>
                </div>`;
            } else if (item.id === 'work-4') {
                visualHtml = `<div style="height:320px; border-radius:20px; background: url('images/color-grading-split.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">COLOR PIPELINE • RAW TO RECT709</span>
                </div>`;
            } else if (item.id === 'work-5') {
                visualHtml = `<div style="height:320px; border-radius:20px; background: url('images/website-design-showcase.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">3D WEB ARCHITECTURE • LIVE SHOWCASE</span>
                </div>`;
            } else if (item.id === 'work-6') {
                visualHtml = `<div style="height:320px; border-radius:20px; background: url('images/brand-design-system.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">BRAND DESIGN SYSTEM • YOUR BRAND DESERVES BETTER</span>
                </div>`;
            } else {
                visualHtml = `<div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); padding:32px; border-radius:24px; text-align:center; font-size:64px; margin-bottom:24px;">${item.visual}</div>`;
            }

            content.innerHTML = `
                <span class="section-tag">${item.catLabel}</span>
                <h2 style="font-family: var(--font-headline); font-size:32px; margin-bottom:16px;">${item.title}</h2>
                <p style="font-size:16px; color: var(--text-secondary); margin-bottom:24px;">${item.desc}</p>
                ${visualHtml}
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px; font-size:12px;">
                    <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px;">
                        <span style="color:var(--text-muted); display:block;">Director</span>
                        <strong>Chandu</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px;">
                        <span style="color:var(--text-muted); display:block;">Resolution</span>
                        <strong>4K DCI</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px;">
                        <span style="color:var(--text-muted); display:block;">Client Status</span>
                        <strong style="color:var(--primary-emerald);">Completed ✓</strong>
                    </div>
                </div>
                <button class="btn-primary btn-full" onclick="startBookingService('srv-1'); closeCaseStudyModal();">BOOK SIMILAR PROJECT ↗</button>
            `;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (window.lenis) window.lenis.stop();
        }
    };

    window.closeCaseStudyModal = function () {
        const modal = document.getElementById('case-study-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        if (window.lenis) window.lenis.start();
    };

    // Global keyboard listener for ESC key to close any active modal
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.style.overflow = '';
                if (window.lenis) window.lenis.start();
            }
        }
    });

    // Close modal when clicking on the overlay backdrop
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                if (window.lenis) window.lenis.start();
            }
        });
    });

    // ----------------------------------------------------------------------
    // CANVAS HERO ENGINE (240 FRAMES SEQUENCE INTEGRATION FROM frame1/)
    // ----------------------------------------------------------------------
    function initHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });

        const TOTAL_FRAMES = 240;
        const images = new Array(TOTAL_FRAMES);
        let currentFrameIndex = 0;
        let targetFrameIndex = 0;
        let lastDrawnFrame = -1;

        function getFramePaths(idx) {
            const num = String(idx + 1).padStart(3, '0');
            return [
                `frame1/ezgif-frame-${num}.png`,
                `public/frame1/ezgif-frame-${num}.png`,
                `./frame1/ezgif-frame-${num}.png`,
                `./public/frame1/ezgif-frame-${num}.png`,
                `https://xrrhzjabhfnbbblfwyko.supabase.co/storage/v1/object/public/hero-frames/ezgif-frame-${num}.png`
            ];
        }

        function loadFrame(idx, callback) {
            if (images[idx] && images[idx].complete && images[idx].naturalWidth > 0) {
                if (callback) callback(images[idx]);
                return;
            }

            const paths = getFramePaths(idx);
            let pIdx = 0;
            const img = new Image();

            function tryNextPath() {
                if (pIdx < paths.length) {
                    img.src = paths[pIdx++];
                } else if (callback) {
                    callback(null);
                }
            }

            img.onload = () => {
                images[idx] = img;
                if (callback) callback(img);
            };

            img.onerror = () => {
                tryNextPath();
            };

            tryNextPath();
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            lastDrawnFrame = -1;
            draw(currentFrameIndex);
        }

        function draw(idx) {
            if (!ctx || canvas.width === 0 || canvas.height === 0) return;
            const safeIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(idx)));

            // Find target image or nearest loaded fallback frame
            let img = images[safeIdx];
            if (!img || !img.complete || img.naturalWidth === 0) {
                for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
                    const prev = safeIdx - offset;
                    const next = safeIdx + offset;
                    if (prev >= 0 && images[prev] && images[prev].complete && images[prev].naturalWidth > 0) {
                        img = images[prev];
                        break;
                    }
                    if (next < TOTAL_FRAMES && images[next] && images[next].complete && images[next].naturalWidth > 0) {
                        img = images[next];
                        break;
                    }
                }
            }

            const cw = canvas.width;
            const ch = canvas.height;
            ctx.clearRect(0, 0, cw, ch);

            if (img && img.complete && img.naturalWidth > 0) {
                const iw = img.naturalWidth;
                const ih = img.naturalHeight;

                const scale = Math.max(cw / iw, ch / ih);
                const dw = iw * scale;
                const dh = ih * scale;
                const ox = (cw - dw) / 2;
                const oy = (ch - dh) / 2;

                ctx.drawImage(img, ox, oy, dw, dh);
            }
        }

        function updateScroll() {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
                const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
                targetFrameIndex = progress * (TOTAL_FRAMES - 1);
            } else {
                targetFrameIndex = 0;
            }
        }

        function loop() {
            const delta = targetFrameIndex - currentFrameIndex;
            if (Math.abs(delta) > 0.001) {
                currentFrameIndex += delta * 0.15;
            } else {
                currentFrameIndex = targetFrameIndex;
            }

            const frameToDraw = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameIndex)));
            if (frameToDraw !== lastDrawnFrame) {
                draw(frameToDraw);
                lastDrawnFrame = frameToDraw;
            }

            requestAnimationFrame(loop);
        }

        // Initialize sizing
        resize();

        // 1. Immediately load frame 0 for zero-delay instant render
        loadFrame(0, (firstImg) => {
            if (firstImg) {
                draw(0);
                lastDrawnFrame = 0;
            }
            hidePreloader();
        });
        setTimeout(hidePreloader, 600);

        // 2. Background queue: Preload keyframes first, then remaining frames in non-blocking batches
        const loadQueue = [];
        for (let i = 0; i < TOTAL_FRAMES; i += 4) {
            if (i !== 0) loadQueue.push(i);
        }
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            if (i % 4 !== 0) loadQueue.push(i);
        }

        function processBatch() {
            if (loadQueue.length === 0) return;
            const BATCH_SIZE = 4;
            const batch = loadQueue.splice(0, BATCH_SIZE);
            let batchLoaded = 0;

            batch.forEach(idx => {
                loadFrame(idx, () => {
                    batchLoaded++;
                    if (batchLoaded === batch.length) {
                        setTimeout(processBatch, 16);
                    }
                });
            });
        }

        setTimeout(processBatch, 50);

        window.addEventListener('scroll', updateScroll, { passive: true });
        window.addEventListener('resize', resize, { passive: true });
        updateScroll();
        requestAnimationFrame(loop);
    }

    // Auto-initialize Hero Canvas on ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initHeroCanvas();
    } else {
        document.addEventListener('DOMContentLoaded', initHeroCanvas);
    }

    // ----------------------------------------------------------------------
    // PRELOADER ENGINE & FAST FADE OUT
    // ----------------------------------------------------------------------
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader && !preloader.classList.contains('preloader-hidden')) {
            preloader.classList.add('preloader-hidden');
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(hidePreloader, 200);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(hidePreloader, 200);
        });
        window.addEventListener('load', function () {
            setTimeout(hidePreloader, 200);
        });
        setTimeout(hidePreloader, 300);
    }
    // ----------------------------------------------------------------------
    // CONTACT FORM & AUTOMATED WEBSITE SUBSCRIPTION WITH LOVE SYMBOL ❤️
    // ----------------------------------------------------------------------
    window.handleContactSubmit = async function (e) {
        if (e) e.preventDefault();

        const nameInput = document.getElementById('c-name');
        const emailInput = document.getElementById('c-email');
        const phoneInput = document.getElementById('c-phone');

        const name = nameInput?.value.trim();
        const email = emailInput?.value.trim();
        const phone = phoneInput?.value.trim();

        if (!name || !email || !phone) {
            alert('Please fill in your Name, Email Address, and Phone Number.');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>SUBSCRIBING & SENDING... ❤️</span>';
        }

        try {
            await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone })
            });
        } catch (err) {
            console.warn('[ARNE Contact Notice] Server API notice:', err);
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }

        // Show Heart-filled Thank You & Subscription alert toast
        showThankYouToast(name);

        // Reset Form
        e.target.reset();
    };

    function showThankYouToast(customerName) {
        let toast = document.getElementById('arne-thankyou-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'arne-thankyou-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 99999;
                background: rgba(10, 20, 15, 0.95);
                border: 1px solid #00ff88;
                border-radius: 20px;
                padding: 20px 26px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 25px rgba(0,255,136,0.3);
                backdrop-filter: blur(20px);
                color: #ffffff;
                max-width: 380px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                <span style="font-size:24px;">❤️</span>
                <strong style="color:#00ff88; font-size:16px; font-family:'Syne',sans-serif;">Thank You, ${customerName}!</strong>
            </div>
            <p style="font-size:13px; color:#d1d5db; margin:0 0 10px 0; line-height:1.5;">
                You are officially subscribed to ARNE Works! We've sent a Thank You email with love to your inbox. 💕✨
            </p>
            <span style="font-size:11px; color:#00ff88; font-weight:700; background:rgba(0,255,136,0.12); padding:4px 10px; border-radius:99px;">WE LOVE HAVING YOU WITH US! 💖</span>
        `;

        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        }, 50);

        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            toast.style.opacity = '0';
        }, 6000);
    }

})();
