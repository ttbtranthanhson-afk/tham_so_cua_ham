// ==========================================
// Animated Background Lighting
// ==========================================
function initBackgroundOrbs() {
    const canvas = document.getElementById('bg-canvas');

    // ── Large drifting orbs ──────────────────────────────────
    const orbs = [
        { w:900, h:900, color:'rgba(0,80,255,0.20)',   top:'-20%', left:'-15%', dx:'140px', dy:'90px',  ds:'1.15', dur:22 },
        { w:650, h:650, color:'rgba(0,200,255,0.14)',  top:'55%',  left:'65%',  dx:'-110px',dy:'-130px',ds:'1.08', dur:27 },
        { w:500, h:500, color:'rgba(130,0,255,0.13)',  top:'20%',  left:'38%',  dx:'70px',  dy:'-90px', ds:'1.12', dur:18 },
        { w:700, h:700, color:'rgba(0,255,170,0.08)',  top:'75%',  left:'-12%', dx:'120px', dy:'-70px', ds:'1.06', dur:32 },
        { w:420, h:420, color:'rgba(255,80,180,0.08)', top:'-8%',  left:'72%',  dx:'-90px', dy:'110px', ds:'1.10', dur:24 },
        { w:350, h:350, color:'rgba(255,160,0,0.07)',  top:'40%',  left:'85%',  dx:'-60px', dy:'-80px', ds:'1.05', dur:19 },
        { w:300, h:300, color:'rgba(0,255,255,0.06)',  top:'85%',  left:'50%',  dx:'50px',  dy:'-50px', ds:'1.08', dur:15 },
    ];
    orbs.forEach((o, i) => {
        const el = document.createElement('div');
        el.className = 'bg-orb';
        el.style.cssText = `
            width:${o.w}px; height:${o.h}px;
            background: radial-gradient(circle at 40% 40%, ${o.color} 0%, transparent 68%);
            top:${o.top}; left:${o.left};
            --dx:${o.dx}; --dy:${o.dy}; --ds:${o.ds};
            animation-duration:${o.dur}s;
            animation-delay:${-(i * 4.1)}s;
            opacity:1;
        `;
        canvas.appendChild(el);
    });

    // ── Tiny star particles ──────────────────────────────────
    for (let i = 0; i < 55; i++) {
        const s = document.createElement('div');
        s.className = 'bg-star';
        const size = 1 + Math.random() * 2.5;
        const minOp = (0.05 + Math.random() * 0.15).toFixed(2);
        const maxOp = (0.3  + Math.random() * 0.55).toFixed(2);
        s.style.cssText = `
            width:${size}px; height:${size}px;
            top:${Math.random()*100}%; left:${Math.random()*100}%;
            --min-op:${minOp}; --max-op:${maxOp};
            animation-duration:${2 + Math.random()*4}s;
            animation-delay:${-(Math.random()*5)}s;
            box-shadow: 0 0 ${size*2}px rgba(200,230,255,0.6);
        `;
        canvas.appendChild(s);
    }

    // ── Light beams from corners ─────────────────────────────
    const beams = [
        { top:'0%',  left:'20%', height:'70vh', color:'rgba(0,180,255,0.06)',  angle:'-15deg', dur:9,  delay:0   },
        { top:'0%',  left:'75%', height:'65vh', color:'rgba(120,0,255,0.05)', angle:'12deg',  dur:12, delay:-4  },
        { top:'0%',  left:'50%', height:'80vh', color:'rgba(0,255,200,0.04)', angle:'0deg',   dur:15, delay:-7  },
        { top:'0%',  left:'5%',  height:'55vh', color:'rgba(255,60,180,0.04)',angle:'-25deg', dur:11, delay:-2  },
    ];
    beams.forEach(b => {
        const el = document.createElement('div');
        el.className = 'bg-beam';
        el.style.cssText = `
            top:${b.top}; left:${b.left};
            height:${b.height};
            background: linear-gradient(to bottom, ${b.color}, transparent);
            --angle:${b.angle};
            animation-duration:${b.dur}s;
            animation-delay:${b.delay}s;
            width:120px;
            filter: blur(18px);
        `;
        canvas.appendChild(el);
    });

    // ── Slow GSAP breathing on the largest orbs ──────────────
    gsap.to(canvas.querySelectorAll('.bg-orb'), {
        opacity: 0.85,
        duration: 3,
        stagger: 0.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
    });
}

// ==========================================
// Sound Effects (Web Audio API)
// ==========================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let _actx = null;
function getACtx() {
    if (!_actx) _actx = new AudioCtx();
    return _actx;
}

function sfx(type) {
    try {
        const ctx = getACtx();
        const g = ctx.createGain();
        g.connect(ctx.destination);

        const configs = {
            click:   { type:'sine',    freq:520,  freq2:520,  dur:0.08, vol:0.18, attack:0.005, decay:0.07 },
            correct: { type:'sine',    freq:523,  freq2:784,  dur:0.35, vol:0.22, attack:0.01,  decay:0.30 },
            wrong:   { type:'sawtooth',freq:200,  freq2:100,  dur:0.25, vol:0.18, attack:0.005, decay:0.22 },
            slide:   { type:'sine',    freq:440,  freq2:660,  dur:0.18, vol:0.12, attack:0.01,  decay:0.15 },
            reveal:  { type:'sine',    freq:330,  freq2:495,  dur:0.22, vol:0.14, attack:0.01,  decay:0.18 },
            success: { type:'sine',    freq:523,  freq2:1047, dur:0.7,  vol:0.20, attack:0.01,  decay:0.65 },
            bulb:    { type:'sine',    freq:880,  freq2:880,  dur:0.12, vol:0.10, attack:0.003, decay:0.10 },
            highlight:{ type:'sine',  freq:660,  freq2:660,  dur:0.10, vol:0.09, attack:0.005, decay:0.08 },
        };

        const c = configs[type] || configs.click;
        const osc = ctx.createOscillator();
        osc.type = c.type;

        // Frequency sweep
        osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(c.freq2, ctx.currentTime + c.dur);

        // Volume envelope
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(c.vol, ctx.currentTime + c.attack);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur);

        // For 'success' add a harmonious chord
        if (type === 'success') {
            [1.26, 1.5].forEach(ratio => {
                const o2 = ctx.createOscillator();
                const g2 = ctx.createGain();
                o2.type = 'sine';
                o2.frequency.setValueAtTime(c.freq * ratio, ctx.currentTime);
                o2.frequency.linearRampToValueAtTime(c.freq2 * ratio, ctx.currentTime + c.dur);
                g2.gain.setValueAtTime(0, ctx.currentTime);
                g2.gain.linearRampToValueAtTime(c.vol * 0.5, ctx.currentTime + c.attack + 0.05);
                g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur);
                o2.connect(g2); g2.connect(ctx.destination);
                o2.start(); o2.stop(ctx.currentTime + c.dur + 0.02);
            });
        }

        osc.connect(g);
        osc.start();
        osc.stop(ctx.currentTime + c.dur + 0.02);
    } catch(e) {}
}

// State Machine
let currentSlide = 2; // bắt đầu từ slide 2
let currentStep = 0;
const totalSlides = 4; // vẫn giữ 4 vì có slide 2,3,4

const slideStepsCount = {
    2: 14,
    3: 14,
    4: 0
};

// Elements
const slides = document.querySelectorAll('.slide');
const glitchOverlay = document.getElementById('glitch-overlay');

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Check for libraries
    if (typeof gsap === 'undefined' || typeof Sortable === 'undefined') {
        const overlay = document.getElementById('alert-overlay');
        overlay.classList.remove('hidden');
        const title = overlay.querySelector('h1');
        const icon = overlay.querySelector('i');
        
        if (title) title.innerText = "THIẾU THƯ VIỆN!";
        if (icon) icon.className = "fa-solid fa-wifi neon-red-text";
        
        const msg = document.createElement('p');
        msg.innerText = "Vui lòng kết nối Internet để tải các thành phần cần thiết.";
        msg.style.marginTop = "20px";
        msg.style.fontSize = "1.5rem";
        overlay.appendChild(msg);
        return; // Stop initialization
    }

    initBackgroundOrbs();
    
    // Key bindings
    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowRight' || e.key === ' ') {
            sfx('click'); nextStep();
        } else if(e.key === 'ArrowLeft') {
            sfx('click'); prevStep();
        }
    });

    // Click binding on app wrapper
    document.getElementById('app').addEventListener('click', (e) => {
        if(!e.target.closest('button') && !e.target.closest('.sortable-list')) {
            sfx('click'); nextStep();
        }
    });

    // Bắt đầu từ bước 0 của slide hiện tại
    routeStep(currentSlide, 0);
});

function nextStep() {
    const activeSlide = slides[currentSlide - 2]; // vì slide 2 index 0
    if (activeSlide && activeSlide._pendingCard) {
        const card = activeSlide._pendingCard;
        activeSlide._pendingCard = null;
        if (card._isSummary) {
            card.remove();
            return;
        }
        gsap.to(card, {opacity:0, y:-30, duration:0.4, ease:'power2.in', onComplete: () => {
            card.remove();
            if (card._onDone) card._onDone();
        }});
        return;
    }
    currentStep++;
    routeStep(currentSlide, currentStep);
}

function prevStep() {
    if(currentStep > 0) {
        currentStep--;
        routeStep(currentSlide, currentStep);
    }
}

function nextSlide() {
    if(currentSlide < totalSlides) {
        sfx('slide');
        const outSlide = slides[currentSlide - 2];
        const nextIdx = currentSlide; // 0-based index of next slide
        currentSlide++;
        currentStep = 0;
        const inSlide = slides[currentSlide - 2];

        // Animate out
        outSlide.classList.add('slide-exit');
        outSlide.addEventListener('animationend', () => {
            outSlide.classList.remove('active', 'slide-exit');
            outSlide.style.opacity = '';

            // Animate in
            inSlide.classList.add('active', 'slide-enter');
            inSlide.addEventListener('animationend', () => {
                inSlide.classList.remove('slide-enter');
                routeStep(currentSlide, 0);
            }, { once: true });
        }, { once: true });

        // Shoot particles at transition midpoint
        setTimeout(() => spawnTransitionParticles(), 200);
    }
}

function spawnTransitionParticles() {
    const colors = ['#00d2ff','#7c3aed','#10b981','#f59e0b','#fff'];
    for(let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * 360;
        const dist = 80 + Math.random() * 220;
        const size = 3 + Math.random() * 5;
        p.style.cssText = `
            position:fixed;
            left:50vw; top:50vh;
            width:${size}px; height:${size}px;
            border-radius:50%;
            background:${color};
            box-shadow:0 0 8px ${color};
            pointer-events:none;
            z-index:9999;
            transform:translate(-50%,-50%);
        `;
        document.body.appendChild(p);
        const rad = angle * Math.PI / 180;
        gsap.to(p, {
            x: Math.cos(rad) * dist,
            y: Math.sin(rad) * dist,
            opacity: 0,
            scale: 0,
            duration: 0.7 + Math.random() * 0.4,
            ease: 'power2.out',
            onComplete: () => p.remove()
        });
    }
}

function routeStep(slide, step) {
    if(slide === 2) handleSlide2(step);
    if(slide === 3) handleSlide3(step);
    if(slide === 4) handleSlide4(step);
}

// ==========================================
// Problem Card
// ==========================================
function showProblemCard(slideEl, config, onDone) {
    // Remove any existing card
    const existing = slideEl.querySelector('.problem-card');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.className = 'problem-card';
    card.innerHTML = `
        <div class="problem-accent-circle" style="width:420px;height:420px;top:-120px;left:-120px;"></div>
        <div class="problem-accent-circle" style="width:260px;height:260px;bottom:-60px;right:10%;"></div>
        <div class="problem-card-inner">
            <div class="problem-card-left">
                <div class="problem-quote-mark">"</div>
                <div>
                    <div class="problem-badge" id="pc-badge" style="opacity:0;">
                        <i class="fa-solid fa-code"></i> ${config.badge}
                    </div>
                    <div class="problem-title" id="pc-title" style="opacity:0;margin-top:18px;">${config.title}</div>
                </div>
            </div>
            <div class="problem-card-right">
                <div class="problem-desc-box" id="pc-desc" style="opacity:0;">
                    ${config.desc}
                </div>
            </div>
        </div>`;
    slideEl.appendChild(card);

    // Animate in
    gsap.fromTo(card, {opacity:0}, {opacity:1, duration:0.5, ease:'power2.out'});
    const tl = gsap.timeline({delay:0.2});
    tl.to('#pc-badge',  {opacity:1, x:0, duration:0.5, ease:'back.out(1.5)'}, 0)
      .fromTo('#pc-title', {opacity:0, y:30}, {opacity:1, y:0, duration:0.7, ease:'expo.out'}, 0.15)
      .fromTo('#pc-desc',  {opacity:0, x:40}, {opacity:1, x:0, duration:0.6, ease:'power3.out'}, 0.35);

    // Click or key to dismiss
    const dismiss = (e) => {
        if (e.type === 'keydown' && e.key !== 'ArrowRight' && e.key !== ' ') return;
        card.removeEventListener('click', dismiss);
        document.removeEventListener('keydown', dismiss);
        gsap.to(card, {opacity:0, y:-30, duration:0.4, ease:'power2.in', onComplete: () => {
            card.remove();
            if (onDone) onDone();
        }});
    };
    // We don't use the card's own listeners — instead we intercept the NEXT nextStep() call
    card._onDone = onDone;
    card._dismiss = dismiss;
    slideEl._pendingCard = card;
}

// ==========================================
// Slide 2 Logic
// ==========================================
function highlightCode(slideNum, lines) {
    sfx('highlight');
    const allLines = document.querySelectorAll(`#s${slideNum}-code > span[id]`);
    allLines.forEach(l => {
        l.classList.remove('highlight');
        l.classList.add('dim');
    });
    lines.forEach(lineId => {
        const el = document.getElementById(lineId);
        if(el) {
            el.classList.remove('dim');
            el.classList.add('highlight');
        }
    });
}

function clearHighlight(slideNum) {
    const allLines = document.querySelectorAll(`#s${slideNum}-code > span[id]`);
    allLines.forEach(l => {
        l.classList.remove('highlight', 'dim');
    });
}

function showCodeTooltip(slideNum, text, lineId) {
    const tt = document.getElementById(`s${slideNum}-tooltip`);
    const line = document.getElementById(lineId);
    if(line) {
        tt.innerHTML = text;
        tt.classList.remove('hidden');
        const offset = line.offsetTop;
        gsap.to(tt, {top: offset, opacity: 1, duration: 0.3});
    }
}

function hideCodeTooltip(slideNum) {
    const tt = document.getElementById(`s${slideNum}-tooltip`);
    tt.classList.add('hidden');
    tt.style.opacity = 0;
}

function handleSlide2(step) {
    if(step > slideStepsCount[2]) { nextSlide(); return; }
    
    const arrayContainer = document.getElementById('s2-array');
    const varsTable = document.getElementById('s2-vars');
    const b1 = arrayContainer.children[0];
    const b2 = arrayContainer.children[1];
    const b3 = arrayContainer.children[2];
    const b4 = arrayContainer.children[3];
    const b5 = arrayContainer.children[4];
    const b6 = arrayContainer.children[5];
    const varC = document.getElementById('v2-c');
    const varK = document.getElementById('v2-k');

    switch(step) {
        case 0:
            clearHighlight(2);
            hideCodeTooltip(2);
            arrayContainer.classList.add('hidden');
            varsTable.classList.add('hidden');
            showProblemCard(document.getElementById('slide-2'), {
                badge: 'Ví dụ 1',
                title: 'Sử dụng hàm <em>prime(n)</em> để kiểm tra số nguyên tố',
                desc: `Viết hàm <span class="problem-code-inline">prime(n)</span> nhận vào một số nguyên <span class="problem-code-inline">n</span> và trả về <span class="problem-code-inline">True</span> nếu <span class="problem-code-inline">n</span> là số nguyên tố, ngược lại trả về <span class="problem-code-inline">False</span>.<br><br>Hàm đếm số ước của <span class="problem-code-inline">n</span> từ 1 đến n-1. Nếu chỉ có đúng 1 ước (là chính 1) thì <span class="problem-code-inline">n</span> là số nguyên tố.`
            }, null);
            break;
        case 1:
            highlightCode(2, ['c2-1', 'c2-2', 'c2-3']);
            showCodeTooltip(2, "Định nghĩa hàm prime(n) — khởi tạo đếm C = 0, k = 1", 'c2-2');
            break;
        case 2:
            highlightCode(2, ['c2-4', 'c2-5', 'c2-6', 'c2-7']);
            showCodeTooltip(2, "Vòng lặp while: duyệt k từ 1 đến n−1, đếm số ước", 'c2-4');
            break;
        case 3:
            highlightCode(2, ['c2-8', 'c2-9', 'c2-10', 'c2-11']);
            showCodeTooltip(2, "Nếu C == 1 (chỉ có 1 ước là chính 1) → True, ngược lại → False", 'c2-8');
            break;
        case 4:
            clearHighlight(2);
            hideCodeTooltip(2);
            arrayContainer.classList.remove('hidden');
            varsTable.classList.remove('hidden');
            gsap.from([arrayContainer, varsTable], {opacity: 0, x: 50, duration: 0.5, stagger: 0.2});
            varC.innerText = "0"; varC.style.color = "var(--primary)"; varK.innerText = "1";
            Array.from(arrayContainer.children).forEach(c => c.className = "array-box");
            showCodeTooltip(2, "Gọi prime(7): C = 0, k = 1, bắt đầu kiểm tra", 'c2-2');
            break;
        case 5:
            highlightCode(2, ['c2-5', 'c2-6']);
            showCodeTooltip(2, "7 % 1 == 0 → C = 1 (ước là 1)", 'c2-5');
            b1.classList.add('active');
            varC.innerText = "1"; varC.classList.add('pulse', 'animating');
            setTimeout(()=>varC.classList.remove('animating'), 500);
            varK.innerText = "2";
            break;
        case 6:
            highlightCode(2, ['c2-5', 'c2-7']);
            showCodeTooltip(2, "7 % 2 ≠ 0 → bỏ qua, k = 3", 'c2-5');
            b1.classList.remove('active'); b1.classList.add('success');
            b2.classList.add('active');
            varK.innerText = "3";
            break;
        case 7:
            highlightCode(2, ['c2-5', 'c2-7']);
            showCodeTooltip(2, "7 % 3 ≠ 0 → bỏ qua, k = 4", 'c2-5');
            b2.classList.remove('active'); b2.classList.add('fail');
            b3.classList.add('active');
            varK.innerText = "4";
            break;
        case 8:
            highlightCode(2, ['c2-5', 'c2-7']);
            showCodeTooltip(2, "7 % 4 ≠ 0 → bỏ qua, k = 5", 'c2-5');
            b3.classList.remove('active'); b3.classList.add('fail');
            b4.classList.add('active');
            varK.innerText = "5";
            break;
        case 9:
            highlightCode(2, ['c2-5', 'c2-7']);
            showCodeTooltip(2, "7 % 5 ≠ 0 → bỏ qua, k = 6", 'c2-5');
            b4.classList.remove('active'); b4.classList.add('fail');
            b5.classList.add('active');
            varK.innerText = "6";
            break;
        case 10:
            highlightCode(2, ['c2-5', 'c2-7']);
            showCodeTooltip(2, "7 % 6 ≠ 0 → bỏ qua, k = 7 (dừng vòng lặp)", 'c2-5');
            b5.classList.remove('active'); b5.classList.add('fail');
            b6.classList.add('active');
            varK.innerText = "7";
            break;
        case 11:
            b6.classList.remove('active'); b6.classList.add('fail');
            highlightCode(2, ['c2-8', 'c2-9']);
            showCodeTooltip(2, "C = 1 → prime(7) trả về True ✓  (7 là số nguyên tố)", 'c2-8');
            varC.classList.add('pulse', 'animating');
            gsap.to(varC, {color: "var(--success)"});
            Array.from(arrayContainer.children).forEach(c => c.classList.remove('active'));
            break;
        case 12:
            clearHighlight(2);
            arrayContainer.classList.add('hidden');
            varsTable.classList.add('hidden');
            highlightCode(2, ['c2-12', 'c2-13']);
            showCodeTooltip(2, "Chương trình chính: nhập n từ bàn phím", 'c2-13');
            break;
        case 13:
            highlightCode(2, ['c2-14', 'c2-15']);
            showCodeTooltip(2, "Vòng lặp for từ 1 đến n, gọi hàm prime(k) để kiểm tra từng số", 'c2-14');
            break;
        case 14:
            highlightCode(2, ['c2-15', 'c2-16']);
            showCodeTooltip(2, "Nếu prime(k) = True → in k ra màn hình (in các số nguyên tố)", 'c2-15');
            break;
    }
}

// ==========================================
// Slide 3 Logic
// ==========================================
function handleSlide3(step) {
    if(step > slideStepsCount[3]) { nextSlide(); return; }
    
    const arrayContainer = document.getElementById('s3-array');
    const varsTable = document.getElementById('s3-vars');
    const boxes = arrayContainer.children;
    const varS = document.getElementById('v3-s');

    switch(step) {
        case 0:
            clearHighlight(3);
            hideCodeTooltip(3);
            arrayContainer.classList.add('hidden');
            varsTable.classList.add('hidden');
            showProblemCard(document.getElementById('slide-3'), {
                badge: 'Ví dụ 2',
                title: 'Sử dụng hàm <em>tongduong(A)</em> để tính tổng dãy A',
                desc: `Viết hàm <span class="problem-code-inline">tongduong(A)</span> nhận vào một danh sách <span class="problem-code-inline">A</span> và trả về tổng của tất cả các phần tử <b>dương</b> trong danh sách.<br><br>Ví dụ: <span class="problem-code-inline">tongduong([0, 2, -1, 5, 10, -3])</span> → <span class="problem-code-inline">17</span>`
            }, null);
            break;
        case 1:
            highlightCode(3, ['c3-1', 'c3-2']);
            showCodeTooltip(3, "Định nghĩa hàm tongduong(A) — khởi tạo S = 0", 'c3-2');
            break;
        case 2:
            highlightCode(3, ['c3-3', 'c3-4', 'c3-5']);
            showCodeTooltip(3, "Duyệt từng phần tử k trong A — nếu k > 0 thì cộng vào S", 'c3-3');
            break;
        case 3:
            clearHighlight(3);
            hideCodeTooltip(3);
            arrayContainer.classList.remove('hidden');
            varsTable.classList.remove('hidden');
            gsap.from([arrayContainer, varsTable], {opacity: 0, x: 50, duration: 0.5, stagger: 0.2});
            varS.innerText = "0"; varS.style.color = "var(--primary)";
            Array.from(boxes).forEach(c => c.className = "array-box");
            showCodeTooltip(3, "Gọi tongduong([0,2,-1,5,10,-3]): S = 0, bắt đầu duyệt", 'c3-2');
            break;
        case 4:
            highlightCode(3, ['c3-4']);
            showCodeTooltip(3, "k = 0 → 0 không lớn hơn 0 → bỏ qua", 'c3-4');
            boxes[0].classList.add('active', 'fail');
            break;
        case 5:
            highlightCode(3, ['c3-4', 'c3-5']);
            showCodeTooltip(3, "k = 2 → 2 > 0 ✓ → S = 0 + 2 = 2", 'c3-4');
            boxes[0].classList.remove('active');
            boxes[1].classList.add('active', 'success');
            varS.innerText = "2"; varS.classList.add('pulse', 'animating');
            setTimeout(()=>varS.classList.remove('animating'), 500);
            break;
        case 6:
            highlightCode(3, ['c3-4']);
            showCodeTooltip(3, "k = -1 → -1 ≤ 0 → bỏ qua", 'c3-4');
            boxes[1].classList.remove('active');
            boxes[2].classList.add('active', 'fail');
            break;
        case 7:
            highlightCode(3, ['c3-4', 'c3-5']);
            showCodeTooltip(3, "k = 5 → 5 > 0 ✓ → S = 2 + 5 = 7", 'c3-4');
            boxes[2].classList.remove('active');
            boxes[3].classList.add('active', 'success');
            varS.innerText = "7"; varS.classList.add('pulse', 'animating');
            setTimeout(()=>varS.classList.remove('animating'), 500);
            break;
        case 8:
            highlightCode(3, ['c3-4', 'c3-5']);
            showCodeTooltip(3, "k = 10 → 10 > 0 ✓ → S = 7 + 10 = 17", 'c3-4');
            boxes[3].classList.remove('active');
            boxes[4].classList.add('active', 'success');
            varS.innerText = "17"; varS.classList.add('pulse', 'animating');
            setTimeout(()=>varS.classList.remove('animating'), 500);
            break;
        case 9:
            highlightCode(3, ['c3-4']);
            showCodeTooltip(3, "k = -3 → -3 ≤ 0 → bỏ qua", 'c3-4');
            boxes[4].classList.remove('active');
            boxes[5].classList.add('active', 'fail');
            break;
        case 10:
            highlightCode(3, ['c3-6']);
            showCodeTooltip(3, "Trả về S = 17 ✓", 'c3-6');
            boxes[5].classList.remove('active');
            varS.classList.add('pulse', 'animating');
            gsap.to(varS, {color: "var(--success)"});
            break;
        case 11:
            clearHighlight(3);
            arrayContainer.classList.add('hidden');
            varsTable.classList.add('hidden');
            highlightCode(3, ['c3-7', 'c3-8', 'c3-9']);
            showCodeTooltip(3, "Chương trình chính: khai báo hai danh sách A và B", 'c3-8');
            break;
        case 12:
            highlightCode(3, ['c3-10']);
            showCodeTooltip(3, "Gọi tongduong(A) → tính tổng các số dương trong A = [-2,1,5,10,-3] → kết quả: 16", 'c3-10');
            break;
        case 13:
            highlightCode(3, ['c3-11', 'c3-12']);
            showCodeTooltip(3, "Gọi tongduong(B) → tính tổng các số dương trong B = [1,-10,-11,8,2,-5] → in B ra màn hình", 'c3-11');
            break;
        case 14:
            // Tổng kết — full screen takeover
            clearHighlight(3);
            hideCodeTooltip(3);
            showSummaryScreen();
            break;
    }
}

// ==========================================
// Summary Screen (Tổng kết)
// ==========================================
function showSummaryScreen() {
    const slide3 = document.getElementById('slide-3');

    // Remove if already exists
    const existing = document.getElementById('summary-screen');
    if (existing) existing.remove();

    // Code snippets to float in the background
    const codeLines = [
        'def prime(n):',
        '    C = 0',
        '    while k < n:',
        '        if n % k == 0:',
        'return True',
        'def tongduong(A):',
        '    S = 0',
        '    for k in A:',
        '        if k > 0:',
        '    return S',
        'if __name__ == "__main__":',
        'n = int(input(...))',
        'for k in range(1, n+1):',
        '    if prime(k):',
        'print(k, end=" ")',
        'tongduong(A)',
        'tongduong(B)',
        '.split-layout {',
        'background: rgba(15,20,35)',
        'border-radius: 10px;',
        'font-family: monospace;',
    ];

    let bgCodeHtml = codeLines.map((line, i) => {
        const top  = 2  + (i * 4.5) % 96;
        const left = 1  + (i * 13 + 7) % 60;
        const size = 11 + (i % 4) * 2;
        const op   = 0.06 + (i % 5) * 0.03;
        return `<div class="sum-bg-code" style="top:${top}%;left:${left}%;font-size:${size}px;opacity:${op};">${line}</div>`;
    }).join('');

    // The summary quote words — split so each word animates separately
    const quoteWords = "Việc sử dụng chương trình con giúp chia nhỏ bài toán để dễ làm việc nhóm, làm cho cấu trúc chương trình chính rõ ràng và thuận tiện hơn khi cần hiệu chỉnh hay nâng cấp.".split(' ');
    const wordsHtml = quoteWords.map((w, i) =>
        `<span class="sum-word" style="opacity:0;display:inline-block;margin:0 6px;">${w}</span>`
    ).join('');

    const screen = document.createElement('div');
    screen.id = 'summary-screen';
    screen.innerHTML = `
        <div class="sum-bg-codes">${bgCodeHtml}</div>
        <div class="sum-overlay"></div>
        <div class="sum-content">
            <div class="sum-label" id="sum-label">✦ TỔNG KẾT ✦</div>
            <div class="sum-quote" id="sum-quote">${wordsHtml}</div>
            <div class="sum-brand" id="sum-brand">LẬP TRÌNH &amp; CHƯƠNG TRÌNH CON</div>
        </div>`;
    slide3.appendChild(screen);

    // Animate in
    gsap.fromTo(screen, {opacity:0}, {opacity:1, duration:0.6, ease:'power2.out'});

    const tl = gsap.timeline({delay:0.3});
    tl.fromTo('#sum-label',
        {opacity:0, letterSpacing:'0.6em', y: -20},
        {opacity:1, letterSpacing:'0.35em', y:0, duration:0.8, ease:'power3.out'})
      .to('.sum-word', {
            opacity:1,
            y:0,
            stagger:0.045,
            duration:0.45,
            ease:'power2.out',
            onStart: () => {
                gsap.set('.sum-word', {y: 18});
            }
        }, '-=0.2')
      .fromTo('#sum-brand',
            {opacity:0, y:20},
            {opacity:1, y:0, duration:0.7, ease:'back.out(1.5)'},
            '-=0.3');

    // Gentle neon pulse on the quote forever
    gsap.to('#sum-quote', {
        textShadow: '0 0 40px rgba(0,210,255,0.7)',
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.5
    });

    // Slow drift of bg code lines
    document.querySelectorAll('.sum-bg-code').forEach((el, i) => {
        gsap.to(el, {
            y: -30 - (i % 4) * 15,
            duration: 12 + (i % 5) * 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: -(i * 0.8)
        });
    });

    // Store dismiss on slide._pendingCard pattern
    slide3._pendingCard = {
        _isSummary: true,
        _onDone: null,
        remove: () => {
            gsap.to(screen, {opacity:0, scale:0.97, duration:0.5, ease:'power2.in',
                onComplete: () => { screen.remove(); nextSlide(); }});
        }
    };
}

// ==========================================
// Slide 4 Logic — Tổng kết
// ==========================================
function handleSlide4(step) {
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo('.sum4-beam',   { opacity:0, scaleY:0 }, { opacity:1, scaleY:1, stagger:0.15, duration:0.9, ease:'power3.out' })
      .fromTo('#sum4-tag',    { opacity:0, x:-30 },    { opacity:1, x:0, duration:0.5, ease:'power2.out' }, '-=0.4')
      .fromTo('#sum4-title',  { opacity:0, x:-40 },    { opacity:1, x:0, duration:0.7, ease:'expo.out' }, '-=0.2')
      .fromTo('#sum4-box',    { opacity:0, x:50 },     { opacity:1, x:0, duration:0.7, ease:'expo.out' }, '-=0.4');
    sfx('reveal');
}