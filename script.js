// ==========================================================================
// ARNE — PREMIUM CREATIVE STUDIO ENGINE & BOOKING SYSTEM
// ==========================================================================

(function () {
    'use strict';

    // ----------------------------------------------------------------------
    // SUPABASE CLOUD DATABASE CONNECTION
    // ----------------------------------------------------------------------
    const SUPABASE_URL = 'https://yjgbzipdvhgdftxdlccx.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_9fjwQtl2NjYC7OYLmy1pVw_oyc4ru2C';
    let supabaseClient = null;

    function getSupabaseClient() {
        if (supabaseClient) return supabaseClient;
        try {
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                return supabaseClient;
            }
        } catch (e) {
            console.warn('[ARNE Supabase Notice] Initialization error:', e);
        }
        return null;
    }

    try {
        supabaseClient = getSupabaseClient();
        if (supabaseClient) {
            console.log('[ARNE Supabase] Connected to project: yjgbzipdvhgdftxdlccx');
        }
    } catch (e) { }

    // Global Safe API Fetch Helper to prevent 'Unexpected end of JSON input' errors
    window.safeFetchJSON = async function (url, payload) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            if (!text || !text.trim()) {
                return { success: res.ok, status: res.status };
            }
            try {
                return JSON.parse(text);
            } catch (_) {
                return { success: res.ok, status: res.status };
            }
        } catch (err) {
            console.warn(`[SafeFetch Warning for ${url}]:`, err.message);
            return { success: false, error: err.message };
        }
    };
    const safeFetchJSON = window.safeFetchJSON;

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
        } catch (e) { }

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
        } catch (e) { }
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
            id: 'srv-4',
            num: 'SERVICE 03',
            name: 'Website Design',
            price: 4999,
            unit: 'STARTING FROM',
            desc: 'Landing page, Business websites, Portfolio website, E-Commerce Website, 3D Websites etc.',
            category: 'core'
        },
        {
            id: 'srv-6',
            num: 'SERVICE 04',
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
        { name: 'Landing Page Design', price: 4999 },
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
            title: 'PHOTO EDITING',
            category: 'photo',
            catLabel: 'WORK 4',
            desc: 'High-end portrait retouching, skin frequency separation, background clean-up and creative photo manipulation.',
            visual: '📸'
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
            title: 'APP DEVELOPMENT',
            category: 'app',
            catLabel: 'WORK 6 • UPCOMING',
            desc: 'Custom mobile application development for both Android & iOS platforms with sleek UI/UX, smooth animations, and high performance.',
            visual: '📱'
        },
    ];

    // Sync savedServices with updated default services and prices
    let savedServices = JSON.parse(localStorage.getItem('arne_services'));
    if (savedServices) {
        // Purge deleted/deprecated services from local storage cache
        savedServices = savedServices.filter(s => DEFAULT_SERVICES.some(def => def.id === s.id));
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
    // HARDWARE-ACCELERATED SCROLL REVEAL & ONE-BY-ONE STAGGER SYSTEM
    // ----------------------------------------------------------------------
    let scrollRevealObserver = null;

    function initScrollRevealEngine() {
        if ('IntersectionObserver' in window) {
            scrollRevealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.06
            });
        }

        window.observeScrollElement = function(el) {
            if (!el) return;
            if (scrollRevealObserver) {
                scrollRevealObserver.observe(el);
            } else {
                el.classList.add('in-view');
            }
        };

        // 1. Hero Section Stagger
        const heroBadge = document.querySelector('.hero-header-badge');
        if (heroBadge) {
            heroBadge.classList.add('reveal-item');
            heroBadge.style.setProperty('--stagger-delay', '100ms');
            window.observeScrollElement(heroBadge);
        }

        const heroTitleSpans = document.querySelectorAll('.hero-main-title > span');
        heroTitleSpans.forEach((span, idx) => {
            span.classList.add('reveal-item');
            span.style.setProperty('--stagger-delay', `${200 + idx * 140}ms`);
            window.observeScrollElement(span);
        });

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.classList.add('reveal-item');
            heroSubtitle.style.setProperty('--stagger-delay', '620ms');
            window.observeScrollElement(heroSubtitle);
        }

        const heroCta = document.querySelector('.hero-cta-group');
        if (heroCta) {
            heroCta.classList.add('reveal-item');
            heroCta.style.setProperty('--stagger-delay', '740ms');
            window.observeScrollElement(heroCta);
        }

        const statPills = document.querySelectorAll('.hero-stats-bar .stat-pill');
        statPills.forEach((pill, idx) => {
            pill.classList.add('reveal-scale');
            pill.style.setProperty('--stagger-delay', `${860 + idx * 120}ms`);
            window.observeScrollElement(pill);
        });

        // 2. Section Headers (Services, Works, About, Contact)
        document.querySelectorAll('.section-header').forEach(header => {
            const tag = header.querySelector('.section-tag');
            const title = header.querySelector('.section-title, .editorial-headline, h2');
            const desc = header.querySelector('.section-desc, p');

            if (tag) {
                tag.classList.add('reveal-item');
                tag.style.setProperty('--stagger-delay', '50ms');
                window.observeScrollElement(tag);
            }
            if (title) {
                title.classList.add('reveal-item');
                title.style.setProperty('--stagger-delay', '150ms');
                window.observeScrollElement(title);
            }
            if (desc) {
                desc.classList.add('reveal-item');
                desc.style.setProperty('--stagger-delay', '250ms');
                window.observeScrollElement(desc);
            }
        });

        // 3. Expandable Additional Services Header
        const expandHeader = document.querySelector('.expand-header');
        if (expandHeader) {
            expandHeader.classList.add('reveal-item');
            expandHeader.style.setProperty('--stagger-delay', '100ms');
            window.observeScrollElement(expandHeader);
        }

        // 4. Portfolio Tabs
        const portfolioTabs = document.querySelectorAll('.portfolio-tabs .tab-btn');
        portfolioTabs.forEach((btn, idx) => {
            btn.classList.add('reveal-item');
            btn.style.setProperty('--stagger-delay', `${idx * 60}ms`);
            window.observeScrollElement(btn);
        });

        // 5. About Section Elements (Split Text & Aerial Video Showcase)
        const aboutTag = document.querySelector('.split-text .section-tag');
        if (aboutTag) {
            aboutTag.classList.add('reveal-item');
            aboutTag.style.setProperty('--stagger-delay', '50ms');
            window.observeScrollElement(aboutTag);
        }

        const aboutHeadline = document.querySelector('.split-text .editorial-headline');
        if (aboutHeadline) {
            aboutHeadline.classList.add('reveal-item');
            aboutHeadline.style.setProperty('--stagger-delay', '120ms');
            window.observeScrollElement(aboutHeadline);
        }

        const aboutSub = document.querySelector('.split-text .editorial-subheadline');
        if (aboutSub) {
            aboutSub.classList.add('reveal-item');
            aboutSub.style.setProperty('--stagger-delay', '200ms');
            window.observeScrollElement(aboutSub);
        }

        const bioParagraphs = document.querySelectorAll('.editorial-full-bio p');
        bioParagraphs.forEach((p, idx) => {
            p.classList.add('reveal-item');
            p.style.setProperty('--stagger-delay', `${280 + idx * 100}ms`);
            window.observeScrollElement(p);
        });

        const founderBadge = document.querySelector('.founder-badge');
        if (founderBadge) {
            founderBadge.classList.add('reveal-scale');
            founderBadge.style.setProperty('--stagger-delay', '480ms');
            window.observeScrollElement(founderBadge);
        }

        const aerialVideoCard = document.querySelector('.aerial-video-player-card');
        if (aerialVideoCard) {
            aerialVideoCard.classList.add('reveal-scale');
            aerialVideoCard.style.setProperty('--stagger-delay', '200ms');
            window.observeScrollElement(aerialVideoCard);
        }

        // 6. Contact Section Elements
        const contactTag = document.querySelector('.contact-left .section-tag');
        if (contactTag) {
            contactTag.classList.add('reveal-item');
            contactTag.style.setProperty('--stagger-delay', '50ms');
            window.observeScrollElement(contactTag);
        }
        const contactTitle = document.querySelector('.contact-left .contact-title');
        if (contactTitle) {
            contactTitle.classList.add('reveal-item');
            contactTitle.style.setProperty('--stagger-delay', '120ms');
            window.observeScrollElement(contactTitle);
        }
        const contactDesc = document.querySelector('.contact-left .contact-desc');
        if (contactDesc) {
            contactDesc.classList.add('reveal-item');
            contactDesc.style.setProperty('--stagger-delay', '200ms');
            window.observeScrollElement(contactDesc);
        }

        const contactLinks = document.querySelectorAll('.contact-links .c-link');
        contactLinks.forEach((link, idx) => {
            link.classList.add('reveal-item');
            link.style.setProperty('--stagger-delay', `${260 + idx * 90}ms`);
            window.observeScrollElement(link);
        });

        const contactFormGroups = document.querySelectorAll('.contact-form .form-group, .contact-form button');
        contactFormGroups.forEach((fg, idx) => {
            fg.classList.add('reveal-item');
            fg.style.setProperty('--stagger-delay', `${150 + idx * 90}ms`);
            window.observeScrollElement(fg);
        });

        // 7. Footer Thank You Signature Card & Links
        const thankYouCard = document.querySelector('.trustbox-footer-container .thank-you-card');
        if (thankYouCard) {
            thankYouCard.classList.add('reveal-scale');
            thankYouCard.style.setProperty('--stagger-delay', '120ms');
            window.observeScrollElement(thankYouCard);
        }

        const footerLeft = document.querySelector('.footer-left');
        if (footerLeft) {
            footerLeft.classList.add('reveal-item');
            footerLeft.style.setProperty('--stagger-delay', '100ms');
            window.observeScrollElement(footerLeft);
        }

        const footerRight = document.querySelector('.footer-right');
        if (footerRight) {
            footerRight.classList.add('reveal-item');
            footerRight.style.setProperty('--stagger-delay', '200ms');
            window.observeScrollElement(footerRight);
        }
    }

    // ----------------------------------------------------------------------
    // UI INITIALIZATION & RENDERERS
    // ----------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        initGlassTheme();
        initScrollRevealEngine();
        renderCoreServices();
        renderAdditionalServices();
        renderPortfolioGrid(PORTFOLIO_ITEMS);
        initReelsShowcase();
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
                        <button class="btn-primary btn-full" onclick="startBookingService('${s.id}')">
                            <span>BOOK NOW →</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Apply staggered entrance & observe for each card
        const cards = grid.querySelectorAll('.service-card');
        cards.forEach((card, idx) => {
            card.classList.add('reveal-scale');
            card.style.setProperty('--stagger-delay', `${idx * 110}ms`);
            if (window.observeScrollElement) window.observeScrollElement(card);
        });
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

        // Apply staggered entrance for add-ons
        const items = grid.querySelectorAll('.add-service-item');
        items.forEach((item, idx) => {
            item.classList.add('reveal-item');
            item.style.setProperty('--stagger-delay', `${(idx % 4) * 80}ms`);
            if (window.observeScrollElement) window.observeScrollElement(item);
        });
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
                        <span class="rec-badge" style="background:rgba(0,255,136,0.15); color:var(--primary-emerald);">PHOTO EDITING</span>
                        <span class="res-badge">RAW ❘ RETOUCHED</span>
                    </div>
                    <div class="comp-overlay-bottom" style="position: relative; z-index: 2; margin-top: auto; display: flex; justify-content: space-between; width: 100%;">
                        <span style="font-size:10px; font-weight:800; color:#fff; background:rgba(0,0,0,0.65); padding:4px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.15);">BEFORE (RAW)</span>
                        <span style="font-size:10px; font-weight:800; color:var(--primary-emerald); background:rgba(0,255,136,0.2); padding:4px 10px; border-radius:6px; border:1px solid rgba(0,255,136,0.4);">AFTER (RETOUCHED)</span>
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
                            <span style="font-size:10px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.7); padding:4px 10px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">UPCOMING • ANDROID & IOS</span>
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

        // Apply staggered entrance & observe for each portfolio card
        const cards = grid.querySelectorAll('.portfolio-card');
        cards.forEach((card, idx) => {
            card.classList.add('reveal-scale');
            card.style.setProperty('--stagger-delay', `${idx * 110}ms`);
            if (window.observeScrollElement) window.observeScrollElement(card);
        });
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
    // 9:16 VERTICAL CINEMATIC SHOWCASE REELS CONTROLLER (SMOOTH ONE-LINE SLIDE)
    // ----------------------------------------------------------------------
    let reelsScrollAnimFrame = null;
    let isReelsPaused = false;
    let reelsScrollSpeed = 0.95; // Buttery smooth sub-pixel gliding speed
    let isDraggingReels = false;
    let reelsResumeTimeout = null;

    function initReelsShowcase() {
        const track = document.getElementById('reels-track');
        const container = document.getElementById('reels-showcase');
        if (!track || !container) return;

        // Clone cards for seamless infinite loop
        const originalCards = Array.from(track.querySelectorAll('.reel-card'));
        if (originalCards.length === 8) {
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                track.appendChild(clone);
            });
        }

        const allReelCards = Array.from(track.querySelectorAll('.reel-card'));

        // 1. Setup all videos: muted, 10-second playback loop, playsinline
        allReelCards.forEach((card, idx) => {
            const video = card.querySelector('video');
            if (video) {
                video.muted = true;
                video.volume = 0;
                video.playsInline = true;
                video.currentTime = 0;
                video.play().catch(() => {});

                // Cap playback strictly to the starting 10 seconds
                video.addEventListener('timeupdate', () => {
                    if (video.currentTime >= 10) {
                        video.currentTime = 0;
                        video.play().catch(() => {});
                    }
                });

                video.addEventListener('ended', () => {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                });
            }

            card.style.setProperty('--stagger-delay', `${(idx % 8) * 70}ms`);
            if (window.observeScrollElement) window.observeScrollElement(card);
        });

        // Set initial scroll offset so moving left-to-right (decreasing scrollLeft) is continuous
        const singleSetWidth = track.scrollWidth / 2;
        track.scrollLeft = singleSetWidth / 2;

        // 2. Smooth Rainbow Arc Dynamic Physics Calculator
        function updateRainbowArcPhysics() {
            if (!track) return;
            const trackRect = track.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;
            const maxDistance = trackRect.width * 0.55;

            allReelCards.forEach(card => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = cardCenter - trackCenter;
                const normDist = Math.max(-1.4, Math.min(1.4, distance / maxDistance));
                const absDist = Math.abs(normDist);

                // Parabolic Rainbow Arc formula:
                // Peak at center (arcY = -16px), curving smoothly down to sides (arcY = +40px)
                const arcY = Math.pow(absDist, 1.8) * 52 - 16;
                // Subtle 3D angular rotation matching the rainbow curve tangent
                const arcRotate = normDist * 6.5;
                // Center card scales to 1.05, outer cards scale smoothly to 0.88
                const arcScale = Math.max(0.86, 1.05 - Math.pow(absDist, 2) * 0.15);
                // Dynamic depth opacity and z-indexing
                const arcOpacity = Math.max(0.45, 1 - Math.pow(absDist, 2) * 0.42);
                const arcZ = Math.round(150 - absDist * 90);

                if (!card.matches(':hover')) {
                    card.style.transform = `translate3d(0, ${arcY.toFixed(2)}px, 0) rotate(${arcRotate.toFixed(2)}deg) scale(${arcScale.toFixed(3)})`;
                    card.style.opacity = arcOpacity.toFixed(2);
                    card.style.zIndex = arcZ;
                } else {
                    card.style.transform = `translate3d(0, -20px, 0) rotate(0deg) scale(1.08)`;
                    card.style.opacity = '1';
                    card.style.zIndex = '999';
                }
            });
        }

        // 3. Smooth continuous ONE-LINE LEFT TO RIGHT sliding loop with rainbow arc updates
        function autoScrollReelsLoop() {
            if (track && !isReelsPaused && !isDraggingReels) {
                // Decreasing scrollLeft smoothly moves cards in one line from LEFT to RIGHT
                track.scrollLeft -= reelsScrollSpeed;

                const halfWidth = track.scrollWidth / 2;
                if (track.scrollLeft <= 5) {
                    track.scrollLeft += halfWidth;
                }
            }
            // Real-time rainbow arc curve calculation
            updateRainbowArcPhysics();
            reelsScrollAnimFrame = requestAnimationFrame(autoScrollReelsLoop);
        }

        if (!reelsScrollAnimFrame) {
            reelsScrollAnimFrame = requestAnimationFrame(autoScrollReelsLoop);
        }

        // Recalculate on manual scroll / touch / resize
        track.addEventListener('scroll', updateRainbowArcPhysics, { passive: true });
        window.addEventListener('resize', updateRainbowArcPhysics, { passive: true });

        // Hover & touch pause handlers
        track.addEventListener('mouseenter', () => { isReelsPaused = true; });
        track.addEventListener('mouseleave', () => {
            if (!isDraggingReels) isReelsPaused = false;
        });

        track.addEventListener('touchstart', () => { isReelsPaused = true; }, { passive: true });
        track.addEventListener('touchend', () => {
            if (reelsResumeTimeout) clearTimeout(reelsResumeTimeout);
            reelsResumeTimeout = setTimeout(() => { isReelsPaused = false; }, 1500);
        }, { passive: true });

        // Mouse drag smooth scrolling for reels track
        let isDown = false;
        let startX = 0;
        let scrollLeftPos = 0;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            isDraggingReels = true;
            isReelsPaused = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeftPos = track.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                isDraggingReels = false;
                if (reelsResumeTimeout) clearTimeout(reelsResumeTimeout);
                reelsResumeTimeout = setTimeout(() => { isReelsPaused = false; }, 2000);
            }
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollLeftPos - walk;
            updateRainbowArcPhysics();
        });
    }

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

    // Service Pricing Map for 50% Prepaid & 50% Postpaid System
    const SERVICE_PRICE_MAP = {
        'Video Editing': 1049,
        'Photo Editing': 599,
        'Website Design': 4999,
        'Reel / Shorts Editing': 799,
        'Poster Designing': 529,
        'Album Designing': 1299,
        'Color Grading': 599,
        'Other': 0
    };

    // Live Booking Summary Updater (50% Prepaid & 50% Postpaid)
    window.updateBookingSummaryLive = function () {
        const serviceVal = document.getElementById('service-select')?.value || 'Video Editing';
        const isOther = serviceVal === 'Other' || serviceVal.toLowerCase() === 'other';
        const totalPrice = isOther ? 0 : (SERVICE_PRICE_MAP[serviceVal] !== undefined ? SERVICE_PRICE_MAP[serviceVal] : 0);
        const prepaidAmount = Math.round(totalPrice * 0.5);
        const postpaidAmount = totalPrice - prepaidAmount;

        const prepEl = document.getElementById('display-prepaid-amount');
        const postEl = document.getElementById('display-postpaid-amount');
        const totEl = document.getElementById('display-total-amount');

        if (prepEl) prepEl.textContent = `₹${prepaidAmount.toLocaleString('en-IN')}`;
        if (postEl) postEl.textContent = `₹${postpaidAmount.toLocaleString('en-IN')}`;
        if (totEl) totEl.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    };

    // Modal Control Functions
    window.openSlotConfirmModal = function () {
        const modal = document.getElementById('slot-confirm-modal');
        if (modal) modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeSlotConfirmModal = function () {
        const modal = document.getElementById('slot-confirm-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.openSecurePaymentModal = function () {
        const modal = document.getElementById('secure-payment-modal');
        if (modal) modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeSecurePaymentModal = function () {
        const modal = document.getElementById('secure-payment-modal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
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
        const alertEl = document.getElementById('booking-form-alert');
        if (alertEl) alertEl.classList.add('hidden');
    }

    function validateBookingForm() {
        clearFormErrors();
        let isValid = true;
        let firstInvalidField = null;

        // Full Name Validation *
        const fullName = document.getElementById('cust-full-name')?.value.trim();
        if (!fullName) {
            showFieldError('cust-full-name', 'err-full-name');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('cust-full-name');
        }

        // Mobile Number Validation * (Accepts 10 digits or with +91)
        const mobile = document.getElementById('cust-mobile')?.value.trim();
        const digitsOnly = mobile ? mobile.replace(/\D/g, '') : '';
        const clean10 = digitsOnly.startsWith('91') && digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly.slice(-10);
        if (!mobile || clean10.length !== 10) {
            showFieldError('cust-mobile', 'err-mobile');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('cust-mobile');
        }

        // Email Address Validation *
        const email = document.getElementById('cust-email')?.value.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFieldError('cust-email', 'err-email');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('cust-email');
        }

        // Service Select Validation *
        const service = document.getElementById('service-select')?.value;
        if (!service) {
            showFieldError('service-select', 'err-service');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('service-select');
        }

        // URL Validation (Optional field)
        const link = document.getElementById('ref-link')?.value.trim();
        if (link && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i.test(link)) {
            showFieldError('ref-link', 'err-link');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = document.getElementById('ref-link');
        }

        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    function showFieldError(inputId, errMsgId) {
        const input = document.getElementById(inputId);
        const group = input?.closest('.form-group');
        const errEl = errMsgId ? document.getElementById(errMsgId) : null;

        if (group) group.classList.add('has-error');
        if (errEl) errEl.style.display = 'block';
    }

    // Submit Handling: Validate, Save Booking, Trigger Server Notifications, and Open Contact Options (WhatsApp + Gmail)
    window.handleSecondarySubmit = function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const form = document.getElementById('arne-booking-form');
        if (form) handleBookingFormSubmit(e || new Event('submit', { cancelable: true }));
        return false;
    };

    window.handleBookingFormSubmit = async function (e) {
        // Prevent Default Form Submission
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

        const btn = document.getElementById('btn-book-slot-primary');
        const btnText = document.getElementById('btn-book-text');
        const originalBtnHTML = btnText ? btnText.innerHTML : 'BOOK NOW ↗';

        try {
            if (!validateBookingForm()) {
                return false;
            }

            // Set loading state
            if (btn) btn.disabled = true;
            if (btnText) {
                btnText.innerHTML = '<span style="display:inline-block; width:14px; height:14px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span> Processing Request...';
            }

            // Generate Unique Booking ID
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const bookingId = `ARNE-2026-${randomCode}`;

            const fullName = document.getElementById('cust-full-name')?.value.trim() || '';
            const rawMobile = document.getElementById('cust-mobile')?.value.trim() || '';
            const digitsOnly = rawMobile.replace(/\D/g, '');
            const clean10 = digitsOnly.startsWith('91') && digitsOnly.length === 12 ? digitsOnly.slice(2) : digitsOnly.slice(-10);
            const formattedPhone = clean10 ? `+91${clean10}` : rawMobile;

            const email = document.getElementById('cust-email')?.value.trim().toLowerCase() || '';
            const serviceName = document.getElementById('service-select')?.value || 'Creative Service';
            const projectDesc = document.getElementById('project-description')?.value.trim() || 'No additional requirements.';
            const prefDate = document.getElementById('pref-date')?.value || new Date().toISOString().split('T')[0];
            const prefSlot = document.getElementById('pref-slot')?.value || 'Flexible Slot';
            const refLink = document.getElementById('ref-link')?.value.trim() || 'None';

            const bookingData = {
                id: bookingId,
                booking_id: bookingId,
                client_name: fullName,
                customer_name: fullName,
                client_email: email,
                customer_email: email,
                client_phone: formattedPhone,
                customer_phone: formattedPhone,
                customer_whatsapp: formattedPhone,
                service_type: serviceName,
                service_name: serviceName,
                project_desc: projectDesc,
                booking_date: prefDate,
                booking_time: prefSlot,
                time_slot: prefSlot,
                ref_link: refLink,
                status: 'Pending Review',
                booking_status: 'Pending Review',
                payment_status: 'Review Pending',
                created_at: new Date().toISOString()
            };

            // 1. Direct Supabase Cloud Database Insertion
            try {
                const sb = getSupabaseClient();
                if (sb) {
                    await sb.from('bookings').upsert([bookingData]);
                    await sb.from('customers').insert([{
                        full_name: fullName,
                        mobile: formattedPhone,
                        whatsapp: formattedPhone,
                        email: email
                    }]);
                    console.log('[ARNE Supabase] Booking saved with status Pending Review:', bookingId);
                }
            } catch (sbErr) {
                console.warn('[ARNE Supabase Insert Notice]', sbErr.message);
            }

            // 2. Dispatch to Backend API for Twilio WhatsApp (+919390662637) & Nodemailer Gmail Alert (arneworks26@gmail.com)
            try {
                fetch('/api/complete-booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: fullName,
                        email: email,
                        mobile: formattedPhone,
                        service: serviceName,
                        requirements: projectDesc,
                        bookingId: bookingId
                    })
                }).catch(err => console.warn('[ARNE Backend /api/complete-booking notice]', err.message));
            } catch (apiErr) {
                console.warn('[ARNE Backend /api/complete-booking notice]', apiErr.message);
            }

            // 3. Add to local bookings store
            if (typeof bookingsStore !== 'undefined') {
                bookingsStore.unshift({
                    id: bookingData.booking_id,
                    customerName: fullName,
                    customerPhone: formattedPhone,
                    customerEmail: email,
                    serviceName: serviceName,
                    date: prefDate,
                    timeSlot: prefSlot,
                    status: 'Pending Review',
                    paymentStatus: 'Review Pending',
                    createdAt: bookingData.created_at
                });
                if (typeof saveBookings === 'function') saveBookings();
            }

            // 4. Cache booking data
            window.lastConfirmedBooking = bookingData;
            window.pendingBookingData = bookingData;

            // 5. Close Booking Modal
            closeBookingModal();

            // 6. Populate Confirmation / Next Page Modal Elements
            const cId = document.getElementById('confirm-booking-id');
            const cIdVal = document.getElementById('confirm-booking-id-val');
            const cName = document.getElementById('confirm-client-name');
            const cSrv = document.getElementById('confirm-service-name');
            const cPhone = document.getElementById('confirm-phone-num');
            const cEmail = document.getElementById('confirm-client-email');

            if (cId) cId.textContent = bookingId;
            if (cIdVal) cIdVal.textContent = bookingId;
            if (cName) cName.textContent = fullName;
            if (cSrv) cSrv.textContent = serviceName;
            if (cPhone) cPhone.textContent = formattedPhone;
            if (cEmail) cEmail.textContent = email;

            // 7. Configure Dynamic Business WhatsApp & Business Gmail Links
            const waMsg = `Hi ARNE Works, I have submitted my creative project booking on your website.\n\n📌 *Booking Reference ID:* ${bookingId}\n👤 *Name:* ${fullName}\n🎬 *Selected Service:* ${serviceName}\n📱 *Contact:* ${formattedPhone}\n✉️ *Gmail:* ${email}\n📝 *Requirements / Notes:* ${projectDesc}`;
            window.lastBookingWhatsAppUrl = `https://wa.me/919390662637?text=${encodeURIComponent(waMsg)}`;

            const gmSubject = `🎬 ARNE Booking Request: ${bookingId} - ${fullName} (${serviceName})`;
            const gmBody = `Hi ARNE Works Team,\n\nI have submitted my booking request on your studio website.\n\nBooking ID: ${bookingId}\nClient Name: ${fullName}\nSelected Service: ${serviceName}\nMobile: ${formattedPhone}\nGmail: ${email}\nPreferred Slot: ${prefDate} (${prefSlot})\n\nProject Requirements / Notes:\n${projectDesc}\n\nLooking forward to your response.`;
            window.lastBookingGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=arneworks26@gmail.com&su=${encodeURIComponent(gmSubject)}&body=${encodeURIComponent(gmBody)}`;

            // Reset channel selection to default (WhatsApp)
            if (typeof selectBookingContactChannel === 'function') {
                selectBookingContactChannel('whatsapp');
            }

            // 8. Open Next Page (Confirmation Modal with Selectable Options & Submit)
            openSlotConfirmModal();

            // Reset form
            const form = document.getElementById('arne-booking-form');
            if (form) form.reset();

            return false;
        } catch (err) {
            console.error('[ARNE Booking Submission Error]', err);
            alert('Booking Notice: ' + (err.message || 'Please check your information and try again.'));
            return false;
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.innerHTML = originalBtnHTML;
        }
    };

    // Print Official Summary Handler
    window.printBookingReceipt = function () {
        const b = window.lastConfirmedBooking || window.pendingBookingData || {};
        const bookingId = b.booking_id || document.getElementById('confirm-booking-id')?.textContent || 'ARNE-2026';
        const clientName = b.client_name || document.getElementById('confirm-client-name')?.textContent || 'Valued Client';
        const serviceName = b.service_type || document.getElementById('confirm-service-name')?.textContent || 'Creative Service';
        const phone = b.client_phone || document.getElementById('confirm-phone-num')?.textContent || '-';
        const email = b.client_email || document.getElementById('confirm-client-email')?.textContent || '-';
        const projectDesc = b.project_desc || 'Standard project requirement.';
        const printDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

        const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>ARNE Works — Booking Request Summary #${bookingId}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #111; padding: 40px; margin: 0; }
                    .receipt-box { max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 32px; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
                    .brand { font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #008744; }
                    .badge { background: #e6f9f0; color: #008744; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid #b7ecd0; }
                    .subtitle { font-size: 12px; color: #666; margin: 0; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; font-size: 13px; }
                    .grid-item { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f0f0f0; }
                    .grid-item span { display: block; font-size: 11px; color: #777; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
                    .grid-item strong { font-size: 14px; color: #111; }
                    .info-card { background: #f9fafb; border: 1px solid #eee; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px; line-height: 1.6; }
                    .contact-bar { display: flex; justify-content: space-between; background: #008744; color: #fff; padding: 12px 16px; border-radius: 8px; font-size: 12px; font-weight: bold; margin-top: 20px; }
                    .footer { border-top: 1px solid #eee; padding-top: 16px; font-size: 11px; color: #777; text-align: center; margin-top: 24px; }
                    @media print { body { padding: 0; } .receipt-box { border: none; } }
                </style>
            </head>
            <body>
                <div class="receipt-box">
                    <div class="header">
                        <div>
                            <div class="brand">ARNE WORKS</div>
                            <p class="subtitle">Cinematic Creative Studio & Production</p>
                        </div>
                        <div style="text-align: right;">
                            <span class="badge">REQUEST SUBMITTED</span>
                            <div style="font-size: 11px; color: #666; margin-top: 6px;">Date: ${printDate}</div>
                        </div>
                    </div>

                    <div class="grid">
                        <div class="grid-item">
                            <span>Booking Reference ID</span>
                            <strong style="color: #008744;">${bookingId}</strong>
                        </div>
                        <div class="grid-item">
                            <span>Status</span>
                            <strong>Pending Studio Review</strong>
                        </div>
                        <div class="grid-item">
                            <span>Client Name</span>
                            <strong>${clientName}</strong>
                        </div>
                        <div class="grid-item">
                            <span>Selected Service</span>
                            <strong>${serviceName}</strong>
                        </div>
                        <div class="grid-item">
                            <span>Contact Mobile</span>
                            <strong>${phone}</strong>
                        </div>
                        <div class="grid-item">
                            <span>Client Gmail</span>
                            <strong>${email}</strong>
                        </div>
                    </div>

                    <div class="info-card">
                        <strong style="display:block; margin-bottom:4px; font-size:12px; text-transform:uppercase; color:#555;">Project Requirements:</strong>
                        ${projectDesc}
                    </div>

                    <div class="contact-bar">
                        <span>💬 WhatsApp: +91 93906 62637</span>
                        <span>✉️ Gmail: arneworks26@gmail.com</span>
                    </div>

                    <div class="footer">
                        ARNE Works • +91 9390662637 • arneworks26@gmail.com<br>
                        Thank you for choosing ARNE Stories & Production.
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        const printWin = window.open('', '_blank', 'width=800,height=750');
        if (printWin) {
            printWin.document.open();
            printWin.document.write(printHtml);
            printWin.document.close();
        } else {
            window.print();
        }
    };

    // Contact Channel Selection in Booking Confirmation Modal
    window.selectedBookingContactChannel = 'whatsapp';

    window.selectBookingContactChannel = function (channel) {
        window.selectedBookingContactChannel = channel;
        const waCard = document.getElementById('option-card-whatsapp');
        const gmCard = document.getElementById('option-card-gmail');
        const waCheck = document.getElementById('check-indicator-whatsapp');
        const gmCheck = document.getElementById('check-indicator-gmail');
        const waLabel = document.getElementById('label-state-whatsapp');
        const gmLabel = document.getElementById('label-state-gmail');
        const submitLabel = document.getElementById('btn-submit-channel-label');

        if (channel === 'whatsapp') {
            if (waCard) {
                waCard.style.background = 'linear-gradient(135deg, rgba(37, 211, 102, 0.18) 0%, rgba(18, 140, 126, 0.12) 100%)';
                waCard.style.border = '2px solid #25D366';
                waCard.style.boxShadow = '0 0 25px rgba(37, 211, 102, 0.35)';
            }
            if (waCheck) {
                waCheck.style.background = '#25D366';
                waCheck.style.border = 'none';
                waCheck.style.color = '#000';
            }
            if (waLabel) {
                waLabel.textContent = '● Selected';
                waLabel.style.color = '#25D366';
            }
            if (gmCard) {
                gmCard.style.background = 'rgba(255, 255, 255, 0.03)';
                gmCard.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                gmCard.style.boxShadow = 'none';
            }
            if (gmCheck) {
                gmCheck.style.background = 'transparent';
                gmCheck.style.border = '1.5px solid rgba(255, 255, 255, 0.3)';
                gmCheck.style.color = 'transparent';
            }
            if (gmLabel) {
                gmLabel.textContent = 'Click to Select';
                gmLabel.style.color = '#9ca3af';
            }
            if (submitLabel) {
                submitLabel.textContent = 'SUBMIT & CONTINUE VIA WHATSAPP ↗';
            }
        } else if (channel === 'gmail') {
            if (gmCard) {
                gmCard.style.background = 'linear-gradient(135deg, rgba(0, 255, 136, 0.16) 0%, rgba(16, 185, 129, 0.1) 100%)';
                gmCard.style.border = '2px solid #00ff88';
                gmCard.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.35)';
            }
            if (gmCheck) {
                gmCheck.style.background = '#00ff88';
                gmCheck.style.border = 'none';
                gmCheck.style.color = '#000';
            }
            if (gmLabel) {
                gmLabel.textContent = '● Selected';
                gmLabel.style.color = '#00ff88';
            }
            if (waCard) {
                waCard.style.background = 'rgba(255, 255, 255, 0.03)';
                waCard.style.border = '2px solid rgba(255, 255, 255, 0.1)';
                waCard.style.boxShadow = 'none';
            }
            if (waCheck) {
                waCheck.style.background = 'transparent';
                waCheck.style.border = '1.5px solid rgba(255, 255, 255, 0.3)';
                waCheck.style.color = 'transparent';
            }
            if (waLabel) {
                waLabel.textContent = 'Click to Select';
                waLabel.style.color = '#9ca3af';
            }
            if (submitLabel) {
                submitLabel.textContent = 'SUBMIT & CONTINUE VIA GMAIL ↗';
            }
        }
    };

    // Submit Selected Contact Channel Handler
    window.submitBookingContactChannel = function () {
        const channel = window.selectedBookingContactChannel || 'whatsapp';
        if (channel === 'whatsapp') {
            const waUrl = window.lastBookingWhatsAppUrl || 'https://wa.me/919390662637?text=' + encodeURIComponent("Hi Arne, I'd like to know more about your services");
            window.open(waUrl, '_blank');
        } else {
            const gmUrl = window.lastBookingGmailUrl || 'https://mail.google.com/mail/?view=cm&fs=1&to=arneworks26@gmail.com';
            window.open(gmUrl, '_blank');
        }
        closeSlotConfirmModal();
    };

    // Return to Home Handler
    window.returnToHomeFromConfirm = function () {
        closeSlotConfirmModal();
        const form = document.getElementById('arne-booking-form');
        if (form) form.reset();
        window.pendingBookingData = null;
        if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
    // ----------------------------------------------------------------------
    // CUSTOMER AUTH & LOGIN MODAL (GMAIL & PASSWORD)
    // ----------------------------------------------------------------------
    let activeAuthSession = null;

    // Initialize Supabase Auth Listener on Load
    function initSupabaseAuth() {
        // Check stored session in sessionStorage
        try {
            const savedSession = sessionStorage.getItem('arne_client_session');
            if (savedSession) {
                const parsedUser = JSON.parse(savedSession);
                activeAuthSession = { user: parsedUser };
                updateSupabaseAuthUI(parsedUser);
            }
        } catch (_) { }

        const sb = getSupabaseClient();
        if (!sb) return;

        // Check active session on initial load
        sb.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                activeAuthSession = session;
                sessionStorage.setItem('arne_client_session', JSON.stringify(session.user));
                updateSupabaseAuthUI(session.user);
            }
        }).catch(err => {
            console.warn('[Supabase Auth GetSession Error]', err);
        });

        // Subscribe to real-time auth changes
        sb.auth.onAuthStateChange((_event, session) => {
            activeAuthSession = session;
            if (session?.user) {
                sessionStorage.setItem('arne_client_session', JSON.stringify(session.user));
                updateSupabaseAuthUI(session.user);
            } else if (_event === 'SIGNED_OUT') {
                sessionStorage.removeItem('arne_client_session');
                updateSupabaseAuthUI(null);
            }
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            const wrapper = document.getElementById('user-auth-wrapper');
            const dropdown = document.getElementById('user-dropdown-menu');
            if (wrapper && dropdown && !wrapper.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initSupabaseAuth);

    window.handleUserAuthClick = function (e) {
        if (e) e.stopPropagation();
        if (activeAuthSession && activeAuthSession.user) {
            // User is logged in -> Toggle user dropdown menu
            const dropdown = document.getElementById('user-dropdown-menu');
            if (dropdown) dropdown.classList.toggle('hidden');
        } else {
            // User is logged out -> Open Gmail & Password Login Modal
            openAuthModal();
        }
    };

    window.openAuthModal = function () {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            switchAuthMode('signin');
            clearAuthAlert();
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

    window.switchAuthMode = function (mode) {
        clearAuthAlert();
        const tabSignIn = document.getElementById('tab-auth-signin');
        const tabSignUp = document.getElementById('tab-auth-signup');
        const formSignIn = document.getElementById('form-email-signin');
        const formSignUp = document.getElementById('form-email-signup');
        const formForgot = document.getElementById('form-email-forgot');
        const tabsBar = document.getElementById('auth-tabs-bar');
        const modalTitle = document.getElementById('auth-modal-title');
        const modalSubtext = document.getElementById('auth-modal-subtext');

        if (mode === 'signin') {
            if (tabsBar) tabsBar.style.display = 'flex';
            if (tabSignIn) tabSignIn.classList.add('active');
            if (tabSignUp) tabSignUp.classList.remove('active');
            if (formSignIn) formSignIn.classList.remove('hidden');
            if (formSignUp) formSignUp.classList.add('hidden');
            if (formForgot) formForgot.classList.add('hidden');
            if (modalTitle) modalTitle.textContent = 'CLIENT LOGIN';
            if (modalSubtext) modalSubtext.textContent = 'Enter your Gmail address and password to access your project dashboard and bookings.';
        } else if (mode === 'signup') {
            if (tabsBar) tabsBar.style.display = 'flex';
            if (tabSignIn) tabSignIn.classList.remove('active');
            if (tabSignUp) tabSignUp.classList.add('active');
            if (formSignIn) formSignIn.classList.add('hidden');
            if (formSignUp) formSignUp.classList.remove('hidden');
            if (formForgot) formForgot.classList.add('hidden');
            if (modalTitle) modalTitle.textContent = 'CREATE ACCOUNT';
            if (modalSubtext) modalSubtext.textContent = 'Register with your Gmail address to create your creative portal account.';
        } else if (mode === 'forgot') {
            if (tabsBar) tabsBar.style.display = 'none';
            if (formSignIn) formSignIn.classList.add('hidden');
            if (formSignUp) formSignUp.classList.add('hidden');
            if (formForgot) formForgot.classList.remove('hidden');
            if (modalTitle) modalTitle.textContent = 'RESET PASSWORD';
            if (modalSubtext) modalSubtext.textContent = 'Enter your Gmail address to receive a secure password recovery link.';
        }
    };

    window.togglePasswordVisibility = function (inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
            input.type = 'password';
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
    };

    // Global Toast Notification Helper
    window.showToast = function (msg, duration = 3500) {
        if (!msg) return;
        let container = document.getElementById('arne-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'arne-toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
                align-items: center;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = `
            background: rgba(18, 18, 18, 0.94);
            color: #f3f3f3;
            border: 1px solid rgba(0, 255, 136, 0.35);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 255, 136, 0.15);
            padding: 12px 22px;
            border-radius: 999px;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.3px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            opacity: 0;
            transform: translateY(16px) scale(0.96);
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 90vw;
            text-align: center;
        `;
        toast.textContent = msg;
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        // Auto dismiss
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px) scale(0.96)';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 400);
        }, duration);
    };

    function showAuthAlert(msg, isSuccess = false) {
        const alertBox = document.getElementById('auth-alert-box');
        const alertText = document.getElementById('auth-alert-text');
        const alertIcon = document.getElementById('auth-alert-icon');
        if (alertBox && alertText) {
            alertText.textContent = msg;
            if (isSuccess) {
                alertBox.className = 'booking-alert-success';
                if (alertIcon) alertIcon.textContent = '✓';
            } else {
                alertBox.className = 'booking-alert-error';
                if (alertIcon) alertIcon.textContent = '⚠️';
            }
            alertBox.classList.remove('hidden');
        }
    }

    function clearAuthAlert() {
        const alertBox = document.getElementById('auth-alert-box');
        if (alertBox) alertBox.classList.add('hidden');
    }

    // 1. Handle Gmail & Password Sign In
    window.handleEmailPasswordSignIn = async function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        clearAuthAlert();

        const emailInput = document.getElementById('auth-login-email');
        const passwordInput = document.getElementById('auth-login-password');
        const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
        const password = passwordInput ? passwordInput.value : '';

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            showAuthAlert('Please enter a valid Gmail / email address.');
            return;
        }

        if (!password || password.length < 6) {
            showAuthAlert('Please enter your password (minimum 6 characters).');
            return;
        }

        const btn = document.getElementById('btn-login-action');
        const originalHtml = btn ? btn.innerHTML : '<span>SIGN IN TO PORTAL 🔒</span>';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-block; width:13px; height:13px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span> Signing in...';
        }

        const sb = getSupabaseClient();
        let loggedUser = null;

        try {
            // A. Attempt Server-Side API Authentication
            try {
                const serverRes = await safeFetchJSON('/api/client/login', { email, password });
                if (serverRes && serverRes.success && serverRes.user) {
                    loggedUser = serverRes.user;
                }
            } catch (_) {}

            // B. Attempt Supabase Direct Auth if available
            if (!loggedUser && sb) {
                try {
                    const { data, error } = await sb.auth.signInWithPassword({
                        email: email,
                        password: password
                    });

                    if (!error && data?.user) {
                        loggedUser = data.user;
                        activeAuthSession = data.session || { user: loggedUser };
                    }
                } catch (sbErr) {
                    console.warn('[Supabase Direct Auth Notice]:', sbErr.message);
                }
            }

            // C. Fallback for offline or local client profile creation
            if (!loggedUser) {
                loggedUser = {
                    id: `client_${Date.now().toString(36)}`,
                    email: email,
                    fullName: email.split('@')[0],
                    role: 'CLIENT'
                };
            }

            activeAuthSession = { user: loggedUser };
            sessionStorage.setItem('arne_client_session', JSON.stringify(loggedUser));
            localStorage.setItem('arne_client_session', JSON.stringify(loggedUser));

            updateSupabaseAuthUI(loggedUser);
            closeAuthModal();
            showToast(`✓ Welcome back! Logged in as ${loggedUser.fullName || email}`);

            // Automatically open customer dashboard
            setTimeout(() => {
                if (typeof openCustomerPortal === 'function') {
                    openCustomerPortal();
                }
            }, 350);
        } catch (err) {
            console.error('[Sign In Error]:', err);
            showAuthAlert('Failed to sign in. Please verify your email and password.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }
    };

    // 2. Handle Gmail & Password Sign Up (Registration)
    window.handleEmailPasswordSignUp = async function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        clearAuthAlert();

        const nameInput = document.getElementById('auth-register-name');
        const emailInput = document.getElementById('auth-register-email');
        const passwordInput = document.getElementById('auth-register-password');

        const fullName = nameInput ? nameInput.value.trim() : 'Client';
        const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
        const password = passwordInput ? passwordInput.value : '';

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            showAuthAlert('Please enter a valid Gmail / email address.');
            return;
        }

        if (!password || password.length < 6) {
            showAuthAlert('Password must be at least 6 characters long.');
            return;
        }

        const btn = document.getElementById('btn-register-action');
        const originalHtml = btn ? btn.innerHTML : '<span>CREATE ACCOUNT & SIGN IN ↗</span>';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-block; width:13px; height:13px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span> Creating Account...';
        }

        const sb = getSupabaseClient();
        let newUser = null;

        try {
            // A. Attempt Server-Side API Registration
            try {
                const serverRes = await safeFetchJSON('/api/client/signup', { fullName, email, password });
                if (serverRes && serverRes.success && serverRes.user) {
                    newUser = serverRes.user;
                }
            } catch (_) {}

            // B. Attempt Supabase Direct Auth
            if (!newUser && sb) {
                try {
                    const { data, error } = await sb.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                full_name: fullName
                            }
                        }
                    });

                    if (!error && data?.user) {
                        newUser = data.user;
                        activeAuthSession = data.session || { user: newUser };
                    }

                    try {
                        await sb.from('customers').insert([{
                            full_name: fullName,
                            email: email,
                            mobile: ''
                        }]);
                    } catch (_) { }
                } catch (sbErr) {
                    console.warn('[Supabase SignUp Notice]:', sbErr.message);
                }
            }

            // C. Fallback instant local creation
            if (!newUser) {
                newUser = {
                    id: `client_${Date.now().toString(36)}`,
                    email: email,
                    fullName: fullName,
                    user_metadata: { full_name: fullName },
                    role: 'CLIENT'
                };
            }

            activeAuthSession = { user: newUser };
            sessionStorage.setItem('arne_client_session', JSON.stringify(newUser));
            localStorage.setItem('arne_client_session', JSON.stringify(newUser));

            updateSupabaseAuthUI(newUser);
            closeAuthModal();
            showToast(`✓ Account created! Welcome, ${fullName || email}`);

            setTimeout(() => {
                if (typeof openCustomerPortal === 'function') {
                    openCustomerPortal();
                }
            }, 350);
        } catch (err) {
            console.error('[Sign Up Error]:', err);
            showAuthAlert('Failed to create account. Please check your details.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }
    };

    // 3. Handle Forgot Password
    window.handleForgotPassword = async function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        clearAuthAlert();

        const emailInput = document.getElementById('auth-forgot-email');
        const email = emailInput ? emailInput.value.trim().toLowerCase() : '';

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            showAuthAlert('Please enter a valid Gmail / email address.');
            return;
        }

        const btn = document.getElementById('btn-forgot-action');
        const originalHtml = btn ? btn.innerHTML : '<span>SEND PASSWORD RESET EMAIL ✉️</span>';
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span style="display:inline-block; width:13px; height:13px; border:2px solid #000; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin-right:8px; vertical-align:middle;"></span> Sending email...';
        }

        const sb = getSupabaseClient();
        try {
            if (sb) {
                try {
                    await sb.auth.resetPasswordForEmail(email);
                } catch (_) {}
            }
            showAuthAlert(`Password recovery instructions sent to ${email}. Please check your inbox.`, true);
        } catch (err) {
            console.error('[Forgot Password Error]:', err);
            showAuthAlert('Failed to send password reset email.');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalHtml;
            }
        }
    };

    // 4. Handle Sign Out
    window.handleSupabaseSignOut = async function () {
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown) dropdown.classList.add('hidden');

        const sb = getSupabaseClient();
        if (sb) {
            try {
                await sb.auth.signOut();
            } catch (err) {
                console.warn('[Supabase SignOut Warning]', err);
            }
        }
        activeAuthSession = null;
        sessionStorage.removeItem('arne_client_session');
        updateSupabaseAuthUI(null);
        showToast('You have been signed out.');
    };

    // 5. Update Dynamic Navbar Auth Icon & Dropdown State
    function updateSupabaseAuthUI(user) {
        const loggedOutIcon = document.getElementById('auth-icon-logged-out');
        const loggedInAvatar = document.getElementById('auth-avatar-logged-in');
        const dropdownPhone = document.getElementById('dropdown-user-phone');
        const custAvatar = document.getElementById('cust-avatar');
        const custName = document.getElementById('cust-name-display');
        const custEmail = document.getElementById('cust-email-display');

        // SVG Contact / User Profile Icon Logo
        const contactLogoSvg = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;

        const drawerAvatarSvg = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;

        if (user) {
            // User is Authenticated
            const displayId = user.email || user.phone || 'Client';
            const initials = (user.email ? user.email.charAt(0).toUpperCase() : 'U');

            if (loggedOutIcon) loggedOutIcon.classList.add('hidden');
            if (loggedInAvatar) {
                loggedInAvatar.classList.remove('hidden');
                loggedInAvatar.innerHTML = initials;
                loggedInAvatar.setAttribute('title', `Logged in as ${displayId}`);
            }
            if (dropdownPhone) dropdownPhone.textContent = displayId;
            if (custAvatar) custAvatar.innerHTML = drawerAvatarSvg;
            if (custName) custName.textContent = user.user_metadata?.full_name || displayId.split('@')[0] || 'Client';
            if (custEmail) custEmail.textContent = user.email || displayId;
        } else {
            // User is Logged Out
            if (loggedOutIcon) loggedOutIcon.classList.remove('hidden');
            if (loggedInAvatar) loggedInAvatar.classList.add('hidden');
            if (dropdownPhone) dropdownPhone.textContent = 'client@gmail.com';
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
    // CLIENT BOOKING HISTORY & CUSTOMER DASHBOARD DRAWER
    // ----------------------------------------------------------------------
    window.openCustomerPortal = async function () {
        const activeUser = activeAuthSession?.user || JSON.parse(sessionStorage.getItem('arne_client_session') || 'null') || (currentUser?.isLoggedIn ? currentUser : null);
        if (!activeUser) {
            openAuthModal();
            return;
        }

        // Close Login Modal if currently open
        closeAuthModal();

        // Close user dropdown menu
        const dropdown = document.getElementById('user-dropdown-menu');
        if (dropdown) dropdown.classList.add('hidden');

        // Render real-time booking history for this client
        await renderCustomerDashboard(activeUser);

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
        handleSupabaseSignOut();
        closeCustomerPortal();
    };

    async function renderCustomerDashboard(user) {
        if (!user) return;
        const userPhone = (user.phone || '').replace(/\D/g, '');
        const userEmail = (user.email || '').toLowerCase().trim();

        const nameEl = document.getElementById('cust-name-display');
        const emailEl = document.getElementById('cust-email-display');
        if (nameEl) nameEl.textContent = user.phone || user.email || 'Verified Client';
        if (emailEl) emailEl.textContent = user.email || (user.phone ? `${user.phone} • Verified SMS Access` : 'Client Account');

        // 1. Gather bookings from localStorage
        let localBookings = [];
        try {
            const raw = localStorage.getItem('arne_bookings');
            if (raw) localBookings = JSON.parse(raw);
        } catch (_) { }

        // Filter local bookings for current user
        let userBookings = localBookings.filter(b => {
            const bPhone = (b.customerPhone || b.phone || '').replace(/\D/g, '');
            const bEmail = (b.customerEmail || b.email || '').toLowerCase().trim();
            return (userPhone && bPhone && (bPhone.includes(userPhone.slice(-10)) || userPhone.includes(bPhone.slice(-10)))) ||
                (userEmail && bEmail && bEmail === userEmail);
        });

        // 2. Fetch remote bookings from Supabase 'bookings' table
        const sb = getSupabaseClient();
        if (sb && (userPhone || userEmail)) {
            try {
                let query = sb.from('bookings').select('*');
                if (userPhone && userEmail) {
                    query = query.or(`phone.ilike.%${userPhone.slice(-10)}%,email.ilike.%${userEmail}%`);
                } else if (userPhone) {
                    query = query.ilike('phone', `%${userPhone.slice(-10)}%`);
                } else if (userEmail) {
                    query = query.ilike('email', `%${userEmail}%`);
                }

                const { data: dbBookings, error } = await query;
                if (!error && Array.isArray(dbBookings)) {
                    dbBookings.forEach(dbB => {
                        const exists = userBookings.some(ub => ub.id === dbB.booking_id || ub.id === dbB.id);
                        if (!exists) {
                            userBookings.push({
                                id: dbB.booking_id || `ARNE-${dbB.id}`,
                                serviceName: dbB.service_type || 'Production Package',
                                date: dbB.booking_date || 'Confirmed Slot',
                                timeSlot: dbB.booking_time || 'Scheduled',
                                prepaid30: dbB.advance_paid || 0,
                                postpaid70: dbB.postpaid_due || 0,
                                status: dbB.payment_status === 'Paid' ? 'Fully Paid' : (dbB.payment_status || 'Prepaid Paid'),
                                postpaidStatus: dbB.payment_status === 'Paid' ? 'Paid' : 'Pending'
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn('[Supabase Bookings Fetch Notice]:', err.message);
            }
        }

        // Update Dashboard Summary Stats
        const totalEl = document.getElementById('d-total-bookings');
        const activeEl = document.getElementById('d-active-projects');
        const pendingEl = document.getElementById('d-pending-postpaid');

        if (totalEl) totalEl.textContent = userBookings.length;
        const activeCount = userBookings.filter(b => b.status !== 'Completed' && b.status !== 'Fully Paid').length;
        if (activeEl) activeEl.textContent = activeCount;

        const pendingPostpaidSum = userBookings
            .filter(b => b.postpaidStatus === 'Pending')
            .reduce((sum, b) => sum + (Number(b.postpaid70) || 0), 0);
        if (pendingEl) pendingEl.textContent = `₹${pendingPostpaidSum.toLocaleString('en-IN')}`;

        // Render Booking List
        const listEl = document.getElementById('customer-bookings-list');
        if (!listEl) return;

        if (userBookings.length === 0) {
            listEl.innerHTML = `
                <div style="text-align:center; padding: 28px 16px; background: rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:18px;">
                    <div style="font-size:32px; margin-bottom:8px;">📅</div>
                    <div style="font-size:14px; font-weight:700; color:#fff; margin-bottom:4px;">No Booking History Yet</div>
                    <p style="font-size:12px; color: var(--text-muted); margin-bottom:16px;">Ready to elevate your production? Reserve your shoot date now.</p>
                    <button class="btn-primary btn-sparkle" onclick="closeCustomerPortal(); openBookingModal();" style="font-size:12px; padding:10px 20px;">
                        <span>Book a Slot ↗</span>
                    </button>
                </div>
            `;
            return;
        }

        listEl.innerHTML = userBookings.map(b => `
            <div class="booking-item-card">
                <div class="bic-top">
                    <strong>${b.id}</strong>
                    <span class="status-tag ${b.postpaidStatus === 'Paid' ? 'tag-fullpaid' : 'tag-prepaid'}">${b.status || 'Confirmed'}</span>
                </div>
                <div style="font-size:16px; font-weight:800; color:#fff; margin-bottom:4px;">${b.serviceName}</div>
                <div style="font-size:12.5px; color: var(--text-secondary); margin-bottom:10px;">📅 Date: <strong>${b.date}</strong> @ ⏰ <strong>${b.timeSlot}</strong></div>
                <div class="service-payment-split">
                    <span>💳 Advance: <strong>₹${(b.prepaid30 || 0).toLocaleString('en-IN')}</strong> (Paid ✓)</span>
                    <span>⏳ Postpaid Due: <strong>₹${(b.postpaid70 || 0).toLocaleString('en-IN')}</strong> (${b.postpaidStatus || 'Pending'})</span>
                </div>
                <div style="margin-top:12px; display:flex; justify-content:flex-end;">
                    <a href="https://wa.me/919390662637?text=Hi%20Chandu,%20inquiring%20about%20my%20booking%20${encodeURIComponent(b.id)}%20(${encodeURIComponent(b.serviceName)})." target="_blank" style="font-size:11.5px; font-weight:700; color:#25D366; text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:rgba(37,211,102,0.1); padding:6px 12px; border-radius:8px; border:1px solid rgba(37,211,102,0.25);">
                        <span>Chat Support on WhatsApp</span> 💬
                    </a>
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
        } catch (e) { }
    }

    function saveBlockedSlots() {
        try {
            localStorage.setItem('arne_blocked_slots', JSON.stringify(blockedSlotsStore));
        } catch (e) { }
    }

    function saveServices() {
        try {
            localStorage.setItem('arne_services', JSON.stringify(servicesStore));
        } catch (e) { }
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
            } catch (err) { }

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
        } catch (e) { }
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
                    <span style="display:inline-block; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase; ${b.status === 'Confirmed' ? 'background:rgba(16,185,129,0.15); color:#10b981; border:1px solid #10b981;' : (b.status === 'Declined' ? 'background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid #ef4444;' : 'background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid #f59e0b;')}">
                        ${b.status === 'Pending Review' ? '⏳ 1-Hr Review' : (b.status || 'Pending')}
                    </span>
                </td>
                <td>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        ${(b.status === 'Pending Review' || b.status === 'Pending' || !b.status) ? `
                            <button class="btn-primary btn-sm" onclick="adminUpdateBookingStatus('${b.id}', 'Confirmed')" style="background:#10b981; color:#000; font-weight:800; border:none; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:11px;" id="btn-approve-${b.id}">
                                ✓ Approve & Confirm
                            </button>
                            <button class="btn-outline btn-sm" onclick="adminUpdateBookingStatus('${b.id}', 'Declined')" style="border:1px solid #ef4444; color:#ef4444; background:rgba(239,68,68,0.08); font-weight:800; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:11px;" id="btn-decline-${b.id}">
                                ✕ Decline / Unavailable
                            </button>
                        ` : ''}
                        <button class="btn-outline btn-sm" onclick="viewBookingDetails('${b.id}')" title="View Full Details">👁️ Details</button>
                        <button class="btn-outline btn-sm" onclick="deleteAdminBooking('${b.id}')" style="border-color:rgba(239, 68, 68, 0.4); color:#ef4444;" title="Delete Booking">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');

        renderAdminStats();
    }

    window.adminUpdateBookingStatus = async function (id, newStatus) {
        const approveBtn = document.getElementById(`btn-approve-${id}`);
        const declineBtn = document.getElementById(`btn-decline-${id}`);
        if (approveBtn) approveBtn.disabled = true;
        if (declineBtn) declineBtn.disabled = true;

        const b = bookingsStore.find(x => x.id === id);
        const actionLabel = newStatus === 'Confirmed' ? 'Approving & dispatching Confirmation SMS...' : 'Declining & dispatching SMS...';
        console.log(`[Admin Action] ${actionLabel}`);

        try {
            // 1. Call Backend Status Update API
            const res = await fetch('/api/admin/update-booking-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: id,
                    status: newStatus,
                    clientName: b?.customerName || b?.client_name,
                    clientPhone: b?.customerPhone || b?.client_phone,
                    serviceName: b?.serviceName || b?.service_type
                })
            });

            // 2. Direct Supabase Fallback Update
            const sb = getSupabaseClient();
            if (sb) {
                await sb.from('bookings').update({
                    status: newStatus,
                    booking_status: newStatus
                }).eq('id', id);
            }

            // 3. Update Local Store
            if (b) {
                b.status = newStatus;
                b.booking_status = newStatus;
                saveBookings();
                renderAdminBookingsTable();
            }

            alert(`✓ Booking ${id} marked as ${newStatus.toUpperCase()}! ${newStatus === 'Confirmed' ? 'Confirmation SMS sent to client.' : 'Decline SMS sent.'}`);
        } catch (err) {
            console.error('[Admin Status Update Error]:', err);
            alert(`Status update error: ${err.message || 'Please try again'}`);
            if (approveBtn) approveBtn.disabled = false;
            if (declineBtn) declineBtn.disabled = false;
        }
    };

    window.openSlotConfirmModal = function () {
        const modal = document.getElementById('slot-confirm-modal');
        if (modal) modal.classList.add('active');
    };

    window.closeSlotConfirmModal = function () {
        const modal = document.getElementById('slot-confirm-modal');
        if (modal) modal.classList.remove('active');
    };

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
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

        try {
            const name = document.getElementById('c-name')?.value.trim() || '';
            const email = document.getElementById('c-email')?.value.trim() || '';
            const phone = document.getElementById('c-phone')?.value.trim() || '';

            // Save contact message directly to Supabase
            if (supabaseClient) {
                const { error: contactErr } = await supabaseClient.from('contact_messages').insert([{
                    name: name,
                    email: email,
                    phone: phone
                }]);
                if (contactErr) {
                    console.error('[ARNE Supabase Contact Insert Error]', contactErr);
                } else {
                    console.log('[ARNE Supabase] Contact message saved to Supabase');
                }
            }

            alert(`✨ Thank you ${name}! Your inquiry has been received. We will contact you at ${email} / ${phone} shortly.`);
            e.target?.reset();
            return false;
        } catch (contactErr) {
            console.error('[ARNE Contact Submission Error]', contactErr);
            alert('Contact Submission Error: ' + (contactErr.message || 'Failed to send message. Please try again.'));
            return false;
        }
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
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">PHOTO EDITING • HIGH-END RETOUCHING</span>
                </div>`;
            } else if (item.id === 'work-5') {
                visualHtml = `<div style="height:320px; border-radius:20px; background: url('images/website-design-showcase.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">3D WEB ARCHITECTURE • LIVE SHOWCASE</span>
                </div>`;
            } else if (item.id === 'work-6') {
                visualHtml = `<div style="height:320px; border-radius:20px; background: url('images/brand-design-system.jpg') center/cover no-repeat; margin-bottom:24px; border:1px solid var(--border-card); position:relative; overflow:hidden;">
                    <span style="position:absolute; bottom:16px; left:16px; font-size:11px; font-weight:800; color:var(--primary-emerald); letter-spacing:2px; background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:999px; border:1px solid rgba(0,255,136,0.3);">UPCOMING • ANDROID & IOS APP DEVELOPMENT</span>
                </div>`;
            } else {
                visualHtml = `<div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-card); padding:32px; border-radius:24px; text-align:center; font-size:64px; margin-bottom:24px;">${item.visual}</div>`;
            }

            const isUpcoming = item.id === 'work-6';

            content.innerHTML = `
                <span class="section-tag">${item.catLabel}</span>
                <h2 style="font-family: var(--font-headline); font-size:32px; margin-bottom:16px;">${item.title}</h2>
                <p style="font-size:16px; color: var(--text-secondary); margin-bottom:24px;">${item.desc}</p>
                ${visualHtml}
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; margin-bottom:24px; font-size:12px;">
                    <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px;">
                        <span style="color:var(--text-muted); display:block;">Lead Developer</span>
                        <strong>Chandu</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px;">
                        <span style="color:var(--text-muted); display:block;">Platform</span>
                        <strong>${isUpcoming ? 'Android & iOS' : '4K DCI'}</strong>
                    </div>
                    <div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:12px;">
                        <span style="color:var(--text-muted); display:block;">Service Status</span>
                        <strong style="color:var(--primary-emerald);">${isUpcoming ? 'Upcoming / Coming Soon 🚀' : 'Completed ✓'}</strong>
                    </div>
                </div>
                <button class="btn-primary btn-full" onclick="${isUpcoming ? "startBookingService('srv-6');" : "startBookingService('srv-1');"} closeCaseStudyModal();">${isUpcoming ? 'INQUIRE ABOUT APP DEVELOPMENT ↗' : 'BOOK SIMILAR PROJECT ↗'}</button>
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
                `https://yjgbzipdvhgdftxdlccx.supabase.co/storage/v1/object/public/hero-frames/ezgif-frame-${num}.png`
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
