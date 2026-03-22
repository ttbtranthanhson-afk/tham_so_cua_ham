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

// State Machine
let currentSlide = 1;
let currentStep = 0;
const totalSlides = 4;

const slideStepsCount = {
    1: 8, // 0 to 8
    2: 11,
    3: 10,
    4: 1
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
    initSlide1();
    
    // Key bindings
    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowRight' || e.key === ' ') {
            nextStep();
        } else if(e.key === 'ArrowLeft') {
            prevStep();
        }
    });

    // Click binding on app wrapper
    document.getElementById('app').addEventListener('click', (e) => {
        // Only advance if we didn't click a game button
        if(!e.target.closest('button') && !e.target.closest('.sortable-list')) {
            nextStep();
        }
    });

    // Game initializations
    initGame1();
    initGame2();
});

function nextStep() {
    // If there's a pending problem card on the current slide, dismiss it first
    const activeSlide = slides[currentSlide - 1];
    if (activeSlide && activeSlide._pendingCard) {
        const card = activeSlide._pendingCard;
        activeSlide._pendingCard = null;
        gsap.to(card, {opacity:0, y:-30, duration:0.4, ease:'power2.in', onComplete: () => {
            card.remove();
            if (card._onDone) card._onDone();
        }});
        return; // consume this click to dismiss the card
    }

    let maxSteps = slideStepsCount[currentSlide];
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
        const outSlide = slides[currentSlide - 1];
        const nextIdx = currentSlide; // 0-based index of next slide
        currentSlide++;
        currentStep = 0;
        const inSlide = slides[currentSlide - 1];

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
    if(slide === 1) handleSlide1(step);
    if(slide === 2) handleSlide2(step);
    if(slide === 3) handleSlide3(step);
    if(slide === 4) handleSlide4(step);
}

// ==========================================
// Slide 1 Logic
// ==========================================
let wireAnim;

function initSlide1() {
    // Create scene container for dynamic slide 1 content
    const slide1 = document.getElementById('slide-1');
    const sceneDiv = document.createElement('div');
    sceneDiv.id = 's1-scene';
    sceneDiv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;opacity:0;';
    slide1.appendChild(sceneDiv);
}

function drawSVGLine(id, x1, y1, x2, y2, extraClass="") {
    const svg = document.getElementById('s1-lines');
    const newLine = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    newLine.setAttribute('id', id);
    newLine.setAttribute('x1', x1);
    newLine.setAttribute('y1', y1);
    newLine.setAttribute('x2', x2);
    newLine.setAttribute('y2', y2);
    newLine.setAttribute('class', `wire-line ${extraClass}`);
    svg.appendChild(newLine);
    return newLine;
}

function clearSVGLines() {
    document.getElementById('s1-lines').innerHTML = '';
}

function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
}

function buildBulbRow(count, dimmed) {
    // Returns HTML string for a row of bulbs
    let html = '<div style="display:flex;gap:clamp(10px,2.5vw,40px);align-items:flex-end;justify-content:center;flex-wrap:nowrap;">';
    for(let i=0;i<count;i++){
        const color = dimmed ? 'rgba(255,255,255,0.15)' : '#ffdd00';
        const shadow = dimmed ? 'none' : '0 0 20px #ffdd00, 0 0 40px #ffaa00';
        html += `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
            <i class="fa-solid fa-lightbulb s1scene-bulb" data-idx="${i}" style="font-size:clamp(2rem,5vw,5rem);color:${color};filter:drop-shadow(${dimmed?'none':'0 0 12px #ffdd00'});transition:all 0.4s;"></i>
            <span style="font-size:clamp(9px,1vw,13px);color:rgba(255,255,255,0.45);font-family:var(--font-code);">Đèn ${i+1}</span>
        </div>`;
    }
    html += '</div>';
    return html;
}

function s1SetScene(html, onReady) {
    const scene = document.getElementById('s1-scene');
    // Fade out old content, swap, fade in new
    if (scene.innerHTML === '') {
        scene.innerHTML = html;
        gsap.fromTo(scene, {opacity:0}, {opacity:1, duration:0.5, onComplete: onReady});
    } else {
        gsap.to(scene, {opacity:0, y:-18, duration:0.28, ease:'power2.in', onComplete: () => {
            scene.innerHTML = html;
            gsap.fromTo(scene, {opacity:0, y:22}, {opacity:1, y:0, duration:0.45, ease:'power3.out', onComplete: onReady});
        }});
    }
}

// Color palette for buttons (scene 3)
const btnColors = ['#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#ef4444','#f97316','#10b981'];

let s1LightInterval = null;

function handleSlide1(step) {
    if(step > slideStepsCount[1]) { nextSlide(); return; }

    const greeting = document.getElementById('s1-greeting');
    if(greeting && step > 0) gsap.to(greeting, {opacity:0, duration:0.3});
    if(greeting && step === 0) gsap.to(greeting, {opacity:1, duration:0.5});

    switch(step) {
        case 0:
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            clearSVGLines();
            const scene0 = document.getElementById('s1-scene');
            gsap.to(scene0, {opacity:0, duration:0.3, onComplete:()=>{ scene0.innerHTML=''; }});
            break;

        case 1: {
            // 10 dim bulbs drop in with stagger
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            const html1 = `
                <h2 id="s1-h" style="font-size:clamp(1.2rem,3vw,2.5rem);color:var(--primary);font-family:var(--font-heading);text-shadow:0 0 20px var(--primary);margin-bottom:40px;font-weight:700;opacity:0;">10 bóng đèn cần điều khiển</h2>
                <div id="s1-bulbrow" style="display:flex;gap:clamp(10px,2.5vw,40px);align-items:flex-end;justify-content:center;">
                ${Array.from({length:10},(_,i)=>`
                    <div class="s1b" style="display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;transform:translateY(-40px);">
                        <i class="fa-solid fa-lightbulb" style="font-size:clamp(2rem,5vw,5rem);color:rgba(255,255,255,0.15);"></i>
                        <span style="font-size:clamp(9px,1vw,13px);color:rgba(255,255,255,0.35);font-family:var(--font-code);">Đèn ${i+1}</span>
                    </div>`).join('')}
                </div>`;
            s1SetScene(html1, () => {
                gsap.to('#s1-h', {opacity:1, y:0, duration:0.5, ease:'power2.out'});
                gsap.to('.s1b', {opacity:1, y:0, duration:0.5, stagger:0.07, ease:'back.out(1.4)', delay:0.2});
            });
            break;
        }

        case 2: {
            // Button slides in from left, wire draws across, bulb pops
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            const html2 = `
                <h2 id="s1-h" style="font-size:clamp(1.2rem,3vw,2.2rem);color:var(--primary);font-family:var(--font-heading);text-shadow:0 0 20px var(--primary);margin-bottom:32px;font-weight:700;opacity:0;">1 nút bấm, 1 sợi dây</h2>
                <div style="display:flex;align-items:center;gap:0;margin-bottom:40px;">
                    <div id="s1-mainbtn" style="background:#3b82f6;padding:14px 32px;border-radius:10px;font-size:clamp(1rem,2vw,1.3rem);font-weight:700;color:#fff;font-family:var(--font-heading);box-shadow:0 0 20px #3b82f6aa;opacity:0;transform:translateX(-60px);">Nút bấm</div>
                    <svg id="s1-wire2" width="200" height="8" style="flex-shrink:0;overflow:visible;">
                        <line id="s1-wireline" x1="0" y1="4" x2="0" y2="4" stroke="#ffdd00" stroke-width="3.5" stroke-linecap="round" filter="url(#glow)"/>
                        <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                    </svg>
                    <i id="s1-bulb2" class="fa-solid fa-lightbulb" style="font-size:clamp(2.5rem,5vw,5rem);color:#ffdd00;filter:drop-shadow(0 0 14px #ffdd00);opacity:0;transform:scale(0.3);"></i>
                </div>
                <div id="s1-row9" style="display:flex;gap:clamp(8px,1.8vw,28px);align-items:flex-end;justify-content:center;opacity:0;">
                ${Array.from({length:9},(_,i)=>`
                    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
                        <i class="fa-solid fa-lightbulb" style="font-size:clamp(1.6rem,3.5vw,3.5rem);color:rgba(255,255,255,0.13);"></i>
                        <span style="font-size:clamp(8px,0.9vw,11px);color:rgba(255,255,255,0.3);font-family:var(--font-code);">Đèn ${i+2}</span>
                    </div>`).join('')}
                </div>`;
            s1SetScene(html2, () => {
                const tl = gsap.timeline();
                tl.to('#s1-h', {opacity:1, duration:0.4})
                  .to('#s1-mainbtn', {opacity:1, x:0, duration:0.5, ease:'back.out(1.5)'}, '-=0.1')
                  .to('#s1-wireline', {attr:{x2:195}, duration:0.6, ease:'power2.inOut'}, '-=0.1')
                  .to('#s1-bulb2', {opacity:1, scale:1, duration:0.4, ease:'back.out(2)'}, '-=0.1')
                  .to('#s1-row9', {opacity:1, y:0, duration:0.5, ease:'power2.out'}, '-=0.1');
            });
            break;
        }

        case 3: {
            // Rows slam in one by one
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            const indents = [0,1,2,0,1,2,0,1,2,0];
            const wireColors = ['#ffdd00','#aaff00','#ffaa00','#ff6600','#ccff00','#ffee00','#88ff00','#ff8800','#ffcc00','#aaee00'];
            let rowsHtml = '';
            for(let i=0;i<10;i++){
                rowsHtml += `
                    <div class="s3-row" style="display:flex;align-items:center;margin-left:${indents[i]*80}px;height:38px;opacity:0;transform:translateX(-30px);">
                        <div style="background:${btnColors[i]};padding:5px 14px;border-radius:6px;font-size:clamp(0.65rem,1vw,0.88rem);font-weight:700;color:#fff;font-family:var(--font-heading);box-shadow:0 0 10px ${btnColors[i]};white-space:nowrap;flex-shrink:0;">Nút ${i+1}</div>
                        <div style="height:3px;background:${wireColors[i]};box-shadow:0 0 8px ${wireColors[i]};flex:1;min-width:20px;transform:scaleX(0);transform-origin:left;"></div>
                    </div>`;
            }
            let bulbsHtml = Array.from({length:10},(_,i)=>`
                <i class="s3-bulb fa-solid fa-lightbulb" style="font-size:clamp(1.4rem,2.8vw,2.8rem);color:#ffdd00;filter:drop-shadow(0 0 10px ${wireColors[i]});line-height:1;opacity:0;transform:scale(0.3);"></i>`).join('');
            s1SetScene(`
                <h2 id="s1-h" style="font-size:clamp(1rem,2.5vw,2rem);color:var(--warning);font-family:var(--font-heading);text-shadow:0 0 20px var(--warning);margin-bottom:18px;font-weight:700;opacity:0;">Quá nhiều nút bấm và dây!</h2>
                <div style="display:flex;width:94%;max-width:1200px;align-items:stretch;gap:0;padding:0 10px;">
                    <div style="flex:1;display:flex;flex-direction:column;justify-content:space-around;gap:4px;">${rowsHtml}</div>
                    <div style="display:flex;flex-direction:column;justify-content:space-around;align-items:center;gap:4px;flex-shrink:0;padding-left:6px;">${bulbsHtml}</div>
                </div>`, () => {
                    const tl = gsap.timeline();
                    tl.to('#s1-h', {opacity:1, duration:0.35});
                    document.querySelectorAll('.s3-row').forEach((row, i) => {
                        const wire = row.querySelector('div:last-child');
                        tl.to(row, {opacity:1, x:0, duration:0.25, ease:'power2.out'}, i*0.07)
                          .to(wire, {scaleX:1, duration:0.3, ease:'power2.out'}, i*0.07+0.15);
                    });
                    tl.to('.s3-bulb', {opacity:1, scale:1, stagger:0.06, duration:0.3, ease:'back.out(2)'}, '-=0.3');
            });
            break;
        }

        case 4: {
            // "Quá rối!" — shake + red flash
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            s1SetScene(`
                <div id="s1-err-circle" style="width:110px;height:110px;background:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0.3);box-shadow:0 0 60px #ef444488;margin-bottom:24px;">
                    <i class="fa-solid fa-exclamation" style="font-size:3.5rem;color:#fff;"></i>
                </div>
                <h1 id="s1-err-h" style="font-size:clamp(2rem,5vw,4rem);color:#ef4444;font-family:var(--font-heading);font-weight:900;text-shadow:0 0 40px #ef4444;opacity:0;">Quá rối! 😵</h1>
                <p id="s1-err-p" style="font-size:clamp(0.9rem,1.8vw,1.4rem);color:rgba(255,255,255,0.5);font-family:var(--font-heading);margin-top:16px;opacity:0;">Mỗi đèn một nút bấm riêng... không hiệu quả!</p>
            `, () => {
                const tl = gsap.timeline();
                tl.to('#s1-err-circle', {opacity:1, scale:1, duration:0.5, ease:'back.out(2)'})
                  .to('#s1-err-h', {opacity:1, duration:0.4}, '-=0.1')
                  .to('#s1-err-circle', {x:-12, duration:0.05, yoyo:true, repeat:7, ease:'none'}, '-=0.2')
                  .to('#s1-err-p', {opacity:1, y:0, duration:0.4}, '-=0.1');
                // Red screen flash
                gsap.fromTo(document.getElementById('glitch-overlay'),
                    {opacity:0.5, background:'rgba(239,68,68,0.25)'},
                    {opacity:0, duration:0.6, ease:'power2.out'});
            });
            break;
        }

        case 5: {
            // Reset: bulbs scatter-appear from random positions
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            const html5 = `
                <h2 id="s1-h" style="font-size:clamp(1.2rem,3vw,2.2rem);color:var(--primary);font-family:var(--font-heading);text-shadow:0 0 20px var(--primary);margin-bottom:40px;font-weight:700;opacity:0;">Quay lại từ đầu...</h2>
                <div id="s1-bulbrow" style="display:flex;gap:clamp(10px,2.5vw,40px);align-items:flex-end;justify-content:center;">
                ${Array.from({length:10},(_,i)=>`
                    <div class="s1b" style="display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;transform:scale(0.2) translateY(${(Math.random()-0.5)*80}px);">
                        <i class="fa-solid fa-lightbulb" style="font-size:clamp(2rem,5vw,5rem);color:rgba(255,255,255,0.15);"></i>
                        <span style="font-size:clamp(9px,1vw,13px);color:rgba(255,255,255,0.35);font-family:var(--font-code);">Đèn ${i+1}</span>
                    </div>`).join('')}
                </div>
                <p id="s1-sub" style="margin-top:32px;font-size:clamp(0.9rem,1.8vw,1.4rem);color:rgba(255,255,255,0.55);font-family:var(--font-heading);opacity:0;">Chỉ cần 1 nút bấm thôi!</p>`;
            s1SetScene(html5, () => {
                gsap.to('#s1-h', {opacity:1, duration:0.4});
                gsap.to('.s1b', {opacity:1, scale:1, y:0, stagger:0.06, duration:0.5, ease:'back.out(1.6)', delay:0.2});
                gsap.to('#s1-sub', {opacity:1, duration:0.5, delay:0.9});
            });
            break;
        }

        case 6: {
            // Sequential lights with live wire animation
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            const html6 = `
                <h2 id="s1-h" style="font-size:clamp(1.1rem,2.5vw,2rem);color:var(--primary);font-family:var(--font-heading);text-shadow:0 0 20px var(--primary);margin-bottom:32px;font-weight:700;opacity:0;">1 nút bấm → lần lượt từng đèn</h2>
                <div style="display:flex;align-items:center;gap:clamp(12px,2vw,30px);flex-wrap:wrap;justify-content:center;">
                    <div id="s1-main-btn" style="background:#3b82f6;padding:14px 32px;border-radius:10px;font-size:clamp(1rem,2vw,1.3rem);font-weight:700;color:#fff;font-family:var(--font-heading);box-shadow:0 0 18px #3b82f6;white-space:nowrap;opacity:0;transform:scale(0.7);">Nút bấm</div>
                    <div id="s1-bulb-row" style="display:flex;gap:clamp(8px,1.5vw,22px);align-items:flex-end;flex-wrap:nowrap;">
                    ${Array.from({length:10},(_,i)=>`
                        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;opacity:0;transform:translateY(20px);" class="s1bx">
                            <i class="fa-solid fa-lightbulb s1seq-bulb" data-idx="${i}" style="font-size:clamp(1.8rem,3.8vw,4rem);color:rgba(255,255,255,0.15);transition:color 0.25s,filter 0.25s;"></i>
                            <span style="font-size:clamp(8px,0.9vw,12px);color:rgba(255,255,255,0.4);font-family:var(--font-code);">Đèn ${i+1}</span>
                        </div>`).join('')}
                    </div>
                </div>`;
            s1SetScene(html6, () => {
                gsap.to('#s1-h', {opacity:1, duration:0.4});
                gsap.to('#s1-main-btn', {opacity:1, scale:1, duration:0.5, ease:'back.out(1.7)', delay:0.2});
                gsap.to('.s1bx', {opacity:1, y:0, stagger:0.05, duration:0.4, ease:'power2.out', delay:0.3,
                    onComplete: () => {
                        // Start sequential light
                        let idx = 0;
                        const lightUp = () => {
                            const allBulbs = document.querySelectorAll('.s1seq-bulb');
                            allBulbs.forEach(b => { b.style.color='rgba(255,255,255,0.15)'; b.style.filter='none'; });
                            const oldWire = document.getElementById('s1-seq-wire');
                            if(oldWire) oldWire.remove();
                            if(!allBulbs.length) return;
                            const cur = allBulbs[idx];
                            cur.style.color='#ffdd00';
                            cur.style.filter='drop-shadow(0 0 14px #ffdd00) drop-shadow(0 0 28px #ffaa00)';
                            // Draw wire
                            const btn = document.getElementById('s1-main-btn');
                            const svg = document.getElementById('s1-lines');
                            if(btn && cur && svg) {
                                const bR = btn.getBoundingClientRect(), cR = cur.getBoundingClientRect();
                                const sR = document.getElementById('slide-1').getBoundingClientRect();
                                const l = document.createElementNS('http://www.w3.org/2000/svg','line');
                                l.id='s1-seq-wire';
                                l.setAttribute('x1', bR.right-sR.left); l.setAttribute('y1', bR.top+bR.height/2-sR.top);
                                l.setAttribute('x2', cR.left+cR.width/2-sR.left); l.setAttribute('y2', cR.top+cR.height/2-sR.top);
                                l.setAttribute('stroke','#ffdd00'); l.setAttribute('stroke-width','3');
                                l.setAttribute('filter','drop-shadow(0 0 4px #ffdd00)');
                                svg.appendChild(l);
                                gsap.fromTo(l, {attr:{x2: bR.right-sR.left, y2: bR.top+bR.height/2-sR.top}},
                                    {attr:{x2: cR.left+cR.width/2-sR.left, y2: cR.top+cR.height/2-sR.top}, duration:0.35, ease:'power2.out'});
                            }
                            idx=(idx+1)%10;
                        };
                        lightUp();
                        s1LightInterval = setInterval(lightUp, 750);
                    }
                });
            });
            break;
        }

        case 7: {
            // Thuật ngữ — staggered reveal with connecting wire animation
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            clearSVGLines();
            s1SetScene(`
                <h2 id="s1-h" style="font-size:clamp(1.5rem,3.5vw,3rem);color:var(--primary);font-family:var(--font-heading);font-weight:700;text-shadow:0 0 20px var(--primary);margin-bottom:60px;opacity:0;">Thuật ngữ</h2>
                <div style="display:flex;align-items:center;gap:0;position:relative;">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
                        <div id="term-btn" style="background:#3b82f6;padding:22px 50px;border-radius:14px;font-size:clamp(1.2rem,2.5vw,2rem);font-weight:700;color:#fff;font-family:var(--font-heading);box-shadow:0 0 30px #3b82f688;white-space:nowrap;opacity:0;transform:scale(0.7);">Chương trình con</div>
                        <span id="term-sub" style="font-size:clamp(0.8rem,1.2vw,1rem);color:rgba(255,255,255,0.45);font-family:var(--font-heading);opacity:0;">(Hàm / Thủ tục)</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;position:relative;width:220px;flex-shrink:0;">
                        <div id="term-wire" style="height:4px;background:#ffdd00;box-shadow:0 0 12px #ffdd00;width:0;border-radius:2px;margin-top:2px;"></div>
                        <span id="term-thamso" style="font-size:clamp(1rem,1.8vw,1.5rem);color:#ffdd00;font-family:var(--font-heading);font-weight:700;margin-top:12px;opacity:0;text-shadow:0 0 12px #ffdd00;">Tham số</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
                        <i id="term-bulb" class="fa-solid fa-lightbulb" style="font-size:clamp(3rem,6vw,6rem);color:#ffdd00;filter:drop-shadow(0 0 24px #ffaa00);opacity:0;transform:scale(0.3);"></i>
                        <span id="term-doiso" style="font-size:clamp(1rem,1.8vw,1.5rem);color:#10b981;font-family:var(--font-heading);font-weight:700;opacity:0;text-shadow:0 0 12px #10b981;">Đối số</span>
                    </div>
                </div>`, () => {
                const tl = gsap.timeline({delay:0.1});
                tl.to('#s1-h', {opacity:1, y:0, duration:0.5, ease:'power2.out'})
                  .to('#term-btn', {opacity:1, scale:1, duration:0.6, ease:'back.out(2)'}, '-=0.1')
                  .to('#term-sub', {opacity:1, duration:0.4}, '-=0.1')
                  .to('#term-wire', {width:210, duration:0.55, ease:'power2.inOut'}, '+=0.1')
                  .to('#term-thamso', {opacity:1, y:0, duration:0.4, ease:'back.out(1.7)'}, '-=0.2')
                  .to('#term-bulb', {opacity:1, scale:1, duration:0.55, ease:'back.out(2.5)'}, '-=0.1')
                  .to('#term-doiso', {opacity:1, duration:0.4}, '-=0.2');
                // Pulse the bulb gently
                tl.to('#term-bulb', {filter:'drop-shadow(0 0 40px #ffaa00)', duration:0.7, yoyo:true, repeat:-1, ease:'sine.inOut'});
            });
            break;
        }

        case 8: {
            // Final title zoom-in then next slide
            if(s1LightInterval) { clearInterval(s1LightInterval); s1LightInterval=null; }
            clearSVGLines();
            gsap.to(document.getElementById('s1-scene'), {opacity:0, y:-20, duration:0.4, ease:'power2.in', onComplete: () => {
                document.getElementById('s1-scene').innerHTML='';
                const ft = document.getElementById('s1-title-final');
                if(ft) {
                    ft.classList.remove('hidden');
                    gsap.fromTo(ft, {scale:0.4, opacity:0, filter:'blur(20px)'},
                        {scale:1, opacity:1, filter:'blur(0px)', duration:1.0, ease:'expo.out'});
                }
            }});
            break;
        }
    }
}

// Old handleSlide1 replaced above

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
            <div class="problem-card-left" style="max-width:460px;">
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
    // Only target direct line spans (those with an id), not child token spans
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
    const b7 = arrayContainer.children[6];
    
    const varC = document.getElementById('v2-c');
    const varK = document.getElementById('v2-k');

    switch(step) {
        case 0:
            clearHighlight(2);
            hideCodeTooltip(2);
            arrayContainer.classList.add('hidden');
            varsTable.classList.add('hidden');
            // Show problem card intro
            showProblemCard(document.getElementById('slide-2'), {
                badge: 'Ví dụ 1',
                title: 'Sử dụng hàm <em>prime(n)</em> để kiểm tra số nguyên tố',
                desc: `Viết hàm <span class="problem-code-inline">prime(n)</span> nhận vào một số nguyên <span class="problem-code-inline">n</span> và trả về <span class="problem-code-inline">True</span> nếu <span class="problem-code-inline">n</span> là số nguyên tố, ngược lại trả về <span class="problem-code-inline">False</span>.<br><br>Hàm đếm số ước của <span class="problem-code-inline">n</span> từ 1 đến n-1. Nếu chỉ có đúng 1 ước (là chính 1) thì <span class="problem-code-inline">n</span> là số nguyên tố.`
            }, null);
            break;
        case 1:
            highlightCode(2, ['c2-1', 'c2-2', 'c2-3']);
            showCodeTooltip(2, "Khởi tạo hàm và biến đếm C", 'c2-2');
            break;
        case 2:
            highlightCode(2, ['c2-4', 'c2-5', 'c2-6', 'c2-7']);
            showCodeTooltip(2, "Vòng lặp kiểm tra từ k=1 đến n-1", 'c2-4');
            break;
        case 3:
            highlightCode(2, ['c2-8', 'c2-9', 'c2-10']);
            showCodeTooltip(2, "Nếu C > 1 thì không phải số nguyên tố", 'c2-8');
            break;
        case 4:
            // Show right pane
            clearHighlight(2);
            hideCodeTooltip(2);
            arrayContainer.classList.remove('hidden');
            varsTable.classList.remove('hidden');
            gsap.from([arrayContainer, varsTable], {opacity: 0, x: 50, duration: 0.5, stagger: 0.2});
            varC.innerText = "0"; varK.innerText = "1";
            Array.from(arrayContainer.children).forEach(c => c.className = "array-box");
            break;
        case 5:
            // k=1
            highlightCode(2, ['c2-5', 'c2-6']);
            showCodeTooltip(2, "7 chia hết cho 1. C = C + 1", 'c2-5');
            b1.classList.add('active');
            varC.innerText = "1"; varC.classList.add('pulse', 'animating');
            setTimeout(()=>varC.classList.remove('animating'), 500);
            varK.innerText = "2";
            break;
        case 6:
            // k=2
            highlightCode(2, ['c2-5', 'c2-7']);
            showCodeTooltip(2, "7 không chia hết cho 2", 'c2-5');
            b1.classList.remove('active'); b1.classList.add('success');
            b2.classList.add('active');
            varK.innerText = "3";
            break;
        case 7:
            // k=3
            highlightCode(2, ['c2-5', 'c2-7']);
            b2.classList.remove('active'); b2.classList.add('fail');
            b3.classList.add('active');
            varK.innerText = "4";
            break;
        case 8:
            // k=4
            highlightCode(2, ['c2-5', 'c2-7']);
            b3.classList.remove('active'); b3.classList.add('fail');
            b4.classList.add('active');
            varK.innerText = "5";
            break;
        case 9:
            // k=5
            highlightCode(2, ['c2-5', 'c2-7']);
            b4.classList.remove('active'); b4.classList.add('fail');
            b5.classList.add('active');
            varK.innerText = "6";
            break;
        case 10:
            // k=6
            highlightCode(2, ['c2-5', 'c2-7']);
            b5.classList.remove('active'); b5.classList.add('fail');
            b6.classList.add('active');
            varK.innerText = "7";
            break;
        case 11:
            // End loop
            b6.classList.remove('active'); b6.classList.add('fail');
            highlightCode(2, ['c2-8', 'c2-10']);
            showCodeTooltip(2, "C = 1 (không lớn hơn 1) => Trả về True", 'c2-8');
            varC.classList.add('pulse', 'animating');
            gsap.to(varC, {color: "var(--success)"});
            Array.from(arrayContainer.children).forEach(c => c.classList.remove('active'));
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
    const boxes = arrayContainer.children; // 6 items
    const varS = document.getElementById('v3-s');

    switch(step) {
        case 0:
            clearHighlight(3);
            hideCodeTooltip(3);
            arrayContainer.classList.add('hidden');
            varsTable.classList.add('hidden');
            // Show problem card intro
            showProblemCard(document.getElementById('slide-3'), {
                badge: 'Ví dụ 2',
                title: 'Sử dụng hàm <em>tongduong(A)</em> để tính tổng dãy A',
                desc: `Viết hàm <span class="problem-code-inline">tongduong(A)</span> nhận vào một danh sách <span class="problem-code-inline">A</span> và trả về tổng của tất cả các phần tử <b>dương</b> trong danh sách.<br><br>Ví dụ: <span class="problem-code-inline">tongduong([0, 2, -1, 5, 10, -3])</span> → <span class="problem-code-inline">17</span>`
            }, null);
            break;
        case 1:
            highlightCode(3, ['c3-1', 'c3-2']);
            showCodeTooltip(3, "Khởi tạo tổng S = 0", 'c3-2');
            break;
        case 2:
            highlightCode(3, ['c3-3', 'c3-4', 'c3-5']);
            showCodeTooltip(3, "Duyệt từng phần tử, nếu lớn hơn 0 thì cộng vào S", 'c3-3');
            break;
        case 3:
            clearHighlight(3);
            hideCodeTooltip(3);
            arrayContainer.classList.remove('hidden');
            varsTable.classList.remove('hidden');
            gsap.from([arrayContainer, varsTable], {opacity: 0, x: 50, duration: 0.5, stagger: 0.2});
            varS.innerText = "0"; varS.style.color = "var(--primary)";
            Array.from(boxes).forEach(c => c.className = "array-box");
            break;
        case 4:
            // k = 0
            highlightCode(3, ['c3-4']);
            showCodeTooltip(3, "0 không lớn hơn 0 (Bỏ qua)", 'c3-4');
            boxes[0].classList.add('active', 'fail');
            break;
        case 5:
            // k = 2
            highlightCode(3, ['c3-4', 'c3-5']);
            showCodeTooltip(3, "2 > 0 (Đúng). S = 0 + 2 = 2", 'c3-4');
            boxes[0].classList.remove('active');
            boxes[1].classList.add('active', 'success');
            varS.innerText = "2"; varS.classList.add('pulse', 'animating');
            setTimeout(()=>varS.classList.remove('animating'), 500);
            break;
        case 6:
            // k = -1
            highlightCode(3, ['c3-4']);
            showCodeTooltip(3, "-1 không lớn hơn 0 (Bỏ qua)", 'c3-4');
            boxes[1].classList.remove('active');
            boxes[2].classList.add('active', 'fail');
            break;
        case 7:
            // k = 5
            highlightCode(3, ['c3-4', 'c3-5']);
            showCodeTooltip(3, "5 > 0 (Đúng). S = 2 + 5 = 7", 'c3-4');
            boxes[2].classList.remove('active');
            boxes[3].classList.add('active', 'success');
            varS.innerText = "7"; varS.classList.add('pulse', 'animating');
            setTimeout(()=>varS.classList.remove('animating'), 500);
            break;
        case 8:
            // k = 10
            highlightCode(3, ['c3-4', 'c3-5']);
            showCodeTooltip(3, "10 > 0 (Đúng). S = 7 + 10 = 17", 'c3-4');
            boxes[3].classList.remove('active');
            boxes[4].classList.add('active', 'success');
            varS.innerText = "17"; varS.classList.add('pulse', 'animating');
            setTimeout(()=>varS.classList.remove('animating'), 500);
            break;
        case 9:
            // k = -3
            highlightCode(3, ['c3-4']);
            showCodeTooltip(3, "-3 không lớn hơn 0 (Bỏ qua)", 'c3-4');
            boxes[4].classList.remove('active');
            boxes[5].classList.add('active', 'fail');
            break;
        case 10:
            // return S
            highlightCode(3, ['c3-6']);
            showCodeTooltip(3, "Trả về tổng S cuối cùng", 'c3-6');
            boxes[5].classList.remove('active');
            varS.classList.add('pulse', 'animating');
            gsap.to(varS, {color: "var(--success)"});
            break;
    }
}

// ==========================================
// Slide 4 Logic
// ==========================================
function handleSlide4(step) {
    if(step > slideStepsCount[4]) { return; }
}

// ==========================================
// Game 1 Logic
// ==========================================
const quizData = [
    {
        q: "1. Hàm trong Python được định nghĩa bằng từ khóa nào?",
        answers: [
            { text: "function", correct: false },
            { text: "def", correct: true },
            { text: "sub", correct: false },
            { text: "void", correct: false }
        ]
    },
    {
        q: "2. Kết quả trả về của hàm được xác định bởi từ khóa nào?",
        answers: [
            { text: "print", correct: false },
            { text: "return", correct: true },
            { text: "yield", correct: false },
            { text: "break", correct: false }
        ]
    },
    {
        q: "3. Biến được khai báo bên trong hàm được gọi là gì?",
        answers: [
            { text: "Biến toàn cục", correct: false },
            { text: "Biến cục bộ", correct: true },
            { text: "Biến tĩnh", correct: false },
            { text: "Biến động", correct: false }
        ]
    }
];

let currentQ = 0;

function loadQuestion() {
    const qLabel = document.getElementById('g1-question');
    const optionsGrid = document.getElementById('g1-options');
    
    qLabel.innerText = quizData[currentQ].q;
    optionsGrid.innerHTML = '';
    
    quizData[currentQ].answers.forEach(ans => {
        const btn = document.createElement('button');
        btn.className = 'g1-btn';
        btn.innerText = ans.text;
        btn.onclick = () => handleAnswer(btn, ans.correct);
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(btn, isCorrect) {
    if(isCorrect) {
        btn.classList.add('correct');
        // Play success sound here if available
        setTimeout(() => {
            currentQ++;
            if(currentQ < quizData.length) {
                // Fade out, load next
                gsap.to(document.getElementById('game-1'), {opacity: 0, duration: 0.2, onComplete: () => {
                    loadQuestion();
                    gsap.to(document.getElementById('game-1'), {opacity: 1, duration: 0.2});
                }});
            } else {
                // Finish Quiz, move to Game 2
                gsap.to(document.getElementById('game-1'), {opacity: 0, duration: 0.5, onComplete: () => {
                    document.getElementById('game-1').classList.add('hidden');
                    const game2 = document.getElementById('game-2');
                    game2.classList.remove('hidden');
                    gsap.fromTo(game2, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.5});
                    // Show problem card intro
                    showProblemCard(document.getElementById('slide-4'), {
                        badge: 'Ghép Code',
                        title: 'Dùng hàm để kiểm tra <em>tổng chi tiêu</em> tháng',
                        desc: `Viết hàm <span class="problem-code-inline">xu_ly(ds)</span> nhận vào danh sách chi tiêu <span class="problem-code-inline">ds</span>.<br><br>Hàm tính tổng và kiểm tra: nếu tổng <b>≤ 2,000,000đ</b> thì trả về <span class="problem-code-inline">"Chi tiêu hợp lý"</span>, ngược lại trả về <span class="problem-code-inline">"Chi tiêu vượt mức"</span>.<br><br>Ví dụ: <span class="problem-code-inline">xu_ly([100k, 50k, 60k])</span> → <span class="problem-code-inline">(210k, "Chi tiêu hợp lý")</span>`
                    }, null);
                }});
            }
        }, 500);
    } else {
        btn.classList.add('wrong');
        setTimeout(() => btn.classList.remove('wrong'), 400);
    }
}

function initGame1() {
    loadQuestion();
}

// ==========================================
// Game 2 Logic
// ==========================================
let mistakes = 0;

function initGame2() {
    const dragBank = document.getElementById('drag-bank');
    const dropZone = document.getElementById('drop-zone');
    
    new Sortable(dragBank, {
        group: 'shared',
        animation: 150
    });

    new Sortable(dropZone, {
        group: 'shared',
        animation: 150
    });

    const checkBtn = document.getElementById('g2-check');
    const feedback = document.getElementById('g2-feedback');

    checkBtn.addEventListener('click', () => {
        const items = Array.from(dropZone.children).map(c => c.getAttribute('data-id'));
        if(items.length < 5) {
            feedback.innerText = "Kéo toàn bộ code sang nhé!";
            feedback.className = "mt-2 text-lg neon-red-text";
            return;
        }

        const correctOrder = ["1", "2", "3", "4", "5"];
        let isCorrect = true;
        for(let i=0; i<5; i++) {
            if(items[i] !== correctOrder[i]) isCorrect = false;
        }

        if(isCorrect) {
            feedback.innerText = "ĐÚNG RỒI!";
            feedback.className = "mt-2 text-lg neon-green-text";
            setTimeout(() => {
                document.getElementById('game-success').classList.remove('hidden');
            }, 1000);
        } else {
            mistakes++;
            feedback.innerText = `Sai rồi! Thử lại nhé. (Lỗi: ${mistakes}/3)`;
            feedback.className = "mt-2 text-lg neon-red-text";
            
            // Shake dropzone
            dropZone.style.animation = "shake 0.4s";
            setTimeout(() => dropZone.style.animation = "", 400);

            if(mistakes >= 3) {
                feedback.innerText = "Hết lượt! Đây là đáp án đúng.";
                // Auto solve
                autoSolveGame2();
            }
        }
    });
}

function autoSolveGame2() {
    const dropZone = document.getElementById('drop-zone');
    const dragBank = document.getElementById('drag-bank');
    
    // Disable dragging
    Sortable.get(dropZone).option('disabled', true);
    Sortable.get(dragBank).option('disabled', true);
    
    const correctOrder = ["1", "2", "3", "4", "5"];
    
    correctOrder.forEach(id => {
        const el = document.querySelector(`.code-block[data-id="${id}"]`);
        dropZone.appendChild(el);
    });
    
    setTimeout(() => {
        document.getElementById('game-success').classList.remove('hidden');
    }, 2000);
}
