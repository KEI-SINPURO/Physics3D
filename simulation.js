// ==========================================
// 高校物理 2Dシミュレーションエンジン (究極96公式・動的連動版)
// ==========================================

const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

// 1. メニューおよび公式カードの動的構築
if (typeof physicsData !== 'undefined') {
    Object.keys(physicsData).forEach(key => {
        const data = physicsData[key];
        if (data.chap !== currentChap) {
            chapGroup = document.createElement('div');
            chapGroup.className = 'chapter-group';
            const title = document.createElement('div');
            title.className = 'chapter-title';
            title.innerText = data.chap;
            chapGroup.appendChild(title);
            
            chapUl = document.createElement('ul');
            chapUl.className = 'chapter-list';
            chapGroup.appendChild(chapUl);
            menuList.appendChild(chapGroup);
            currentChap = data.chap;
        }

        const li = document.createElement('li');
        li.className = 'item';
        li.innerText = data.title;
        li.onclick = () => {
            document.querySelectorAll('.chapter-list .item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            document.getElementById('unit-title').innerText = data.title;
            
            const container = document.getElementById('formula-cards-container');
            container.innerHTML = "";
            
            data.formulas.forEach((f, idx) => {
                const card = document.createElement('div');
                card.className = "formula-card";
                card.innerHTML = `
                    <h3>${f.name}</h3>
                    <div class="math-box">\\[ ${f.math} \\]</div>
                    <div class="desc-section"><strong>いつ使う？</strong><br>${f.usage}</div>
                    <div class="desc-section"><strong>式の背景・意味</strong><br>${f.reason}</div>
                `;
                card.onclick = (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.formula-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    document.getElementById('sim-desc').innerText = f.simText;
                    
                    // グローバルに現在アクティブな公式を登録（Canvas描画で使用）
                    window.activeFormula = f;
                    setAnimation(f.animType);
                };
                container.appendChild(card);
                if(idx === 0) card.click();
            });
            if (window.MathJax) MathJax.typesetPromise();
        };
        chapUl.appendChild(li);
    });
    setTimeout(() => { const firstItem = document.querySelector('.chapter-list .item'); if(firstItem) firstItem.click(); }, 100);
}

// 2. Canvas 基本設定
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let scale = 1.0, panX = 0, panY = 0;
let isDragging = false, lastX = 0, lastY = 0;

function resizeCanvas() { 
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height; 
}
window.addEventListener('resize', resizeCanvas); 
resizeCanvas();

function setAnimation(type) { 
    animType = type; time = 0; scale = 1.0; panX = 0; panY = 0; 
    const zoomSlider = document.getElementById('zoomSlider');
    if(zoomSlider) zoomSlider.value = 1.0;
    const zoomVal = document.getElementById('zoomVal');
    if(zoomVal) zoomVal.innerText = "1.0x";
}

// コントロールUI制御
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const zoomSlider = document.getElementById('zoomSlider');
if(zoomSlider) zoomSlider.addEventListener('input', e => { scale = parseFloat(e.target.value); document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; });
const playBtn = document.getElementById('playBtn');
if(playBtn) {
    playBtn.onclick = () => {
        isPlaying = !isPlaying;
        playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生";
        playBtn.classList.toggle('paused', !isPlaying);
    };
}
if(document.getElementById('resetBtn')) document.getElementById('resetBtn').onclick = () => setAnimation(animType);

// マウス・ドラッグ視点操作
canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', e => { if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('wheel', e => { 
    e.preventDefault(); scale = Math.max(0.4, Math.min(4.0, scale + (e.deltaY > 0 ? -0.1 : 0.1))); 
    if(zoomSlider) zoomSlider.value = scale; 
    if(document.getElementById('zoomVal')) document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; 
}, { passive: false });

// 3. 高精度描画ユーティリティ
function dLine(x1, y1, x2, y2, color, w=2, dash=[]) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
}
function dA(x1, y1, x2, y2, color, label="") { 
    dLine(x1, y1, x2, y2, color, 2); if(Math.abs(x1 - x2) < 0.2 && Math.abs(y1 - y2) < 0.2) return;
    const a = Math.atan2(y2-y1, x2-x1); ctx.beginPath(); ctx.moveTo(x2, y2); 
    ctx.lineTo(x2 - 12*Math.cos(a-0.35), y2 - 12*Math.sin(a-0.35)); ctx.lineTo(x2 - 12*Math.cos(a+0.35), y2 - 12*Math.sin(a+0.35));
    ctx.fillStyle = color; ctx.fill(); if(label) dMath(label, x2 + 14*Math.cos(a), y2 + 14*Math.sin(a) + 5, color);
}
function dC(x, y, r, color, fill=true) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); if(fill){ ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}
function dB(x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x-w/2, y-h/2, w, h); ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 2; ctx.strokeRect(x-w/2, y-h/2, w, h);
}
function dAng(x, y, r, a1, a2, label, color) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a1, a2, false); ctx.closePath(); ctx.fillStyle = color + "18"; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke(); dMath(label, x + (r+15)*Math.cos((a1+a2)/2) - 4, y + (r+15)*Math.sin((a1+a2)/2) + 5, color);
}
function dMath(t, x, y, c="#2c3e50", size=18) {
    ctx.font = `italic ${size}px 'Times New Roman', serif`; ctx.fillStyle = c; ctx.shadowColor = "white"; ctx.shadowBlur = 4; ctx.fillText(t, x, y); ctx.shadowBlur = 0;
}
function drawAxis(ox, oy, w, h, xL, yL) { dA(ox, oy, ox, oy-h, '#7f8c8d', yL); dA(ox, oy, ox+w, oy, '#7f8c8d', xL); }

// 動的公式表示ユーティリティ (これが質を保つコアシステムです)
function dDynamicFormula(x, y) {
    if (!window.activeFormula || !window.activeFormula.canvasMath) return;
    const t = window.activeFormula.canvasMath;
    ctx.font = "italic 18px 'Times New Roman', serif";
    const w = ctx.measureText(t).width + 24;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)"; ctx.shadowColor = "rgba(0,0,0,0.08)"; ctx.shadowBlur = 4;
    ctx.fillRect(x, y - 22, w, 32); ctx.shadowBlur = 0; ctx.strokeStyle = "#e74c3c"; ctx.lineWidth = 1.5; ctx.strokeRect(x, y - 22, w, 32);
    ctx.fillStyle = "#c0392b"; ctx.fillText(t, x + 12, y);
}

// 4. メインフィジックス・描画ループ
function render() {
    requestAnimationFrame(render);
    try {
        let speed = (speedSlider) ? parseFloat(speedSlider.value) : 1.0;
        if(isPlaying) time += 0.03 * speed;
        const w = canvas.width, h = canvas.height; ctx.clearRect(0, 0, w, h);
        
        ctx.save(); ctx.translate(w/2 + panX, h/2 + panY); ctx.scale(scale, scale);

        // 背景グリッド網羅
        for(let i=-1000; i<=1000; i+=25) { 
            ctx.strokeStyle = (i % 100 === 0) ? '#e2e8f0' : '#f8fafc'; ctx.lineWidth = (i % 100 === 0) ? 1.2 : 0.6;
            dLine(i, -1000, i, 1000, ctx.strokeStyle); dLine(-1000, i, 1000, i, ctx.strokeStyle); 
        }

        if(!animType) { dMath("左メニューから単元・公式を選択してください。", -150, 0, "#64748b", 16); ctx.restore(); return; }

        // 各シーンに応じた最高精度の2Dレンダリング
        if (animType === "linear_motion" || animType === "accel_motion") {
            let isAccel = (animType === "accel_motion");
            let a = isAccel ? 24 : 0; let v0 = 35; let loopT = time % 5;
            let x = -200 + v0 * loopT + 0.5 * a * loopT * loopT; if (x > 250) x = 250;
            dLine(-260, 50, 260, 50, '#475569', 3); dB(x, 25, 50, 50, '#3b82f6');
            dA(x, 10, x + (v0 + a * loopT) * 0.8, 10, '#2563eb', 'v');
            if(isAccel) dA(x, -15, x + a * 1.5, -15, '#16a34a', 'a');
            dDynamicFormula(x - 50, -40); // 動的数式追従
            drawAxis(90, -60, 120, 70, "t", isAccel?"v":"x");
        }
        else if (animType === "work_cos") {
            dLine(-250, 50, 250, 50, '#475569', 3); let loopT = time % 6; let x = -150 + loopT * 50;
            dB(x, 25, 60, 50, '#3b82f6'); let ang = -Math.PI / 6;
            dA(x, 25, x + 110 * Math.cos(ang), 25 + 110 * Math.sin(ang), '#e67e22', 'F');
            dAng(x, 25, 35, ang, 0, "θ", "#e67e22");
            dA(x, 25, x + 110 * Math.cos(ang), 25, '#ef4444', 'Fx');
            dDynamicFormula(-70, -130);
        }
        else if (animType.includes("fall") || animType.includes("throw")) {
            let loopT = time % 4;
            let up = animType.includes("up"); let side = animType.includes("side");
            let sx = side ? -180 + 70 * loopT : 0;
            let sy = up ? 120 - 130 * loopT + 30 * loopT * loopT : -120 + 35 * loopT * loopT;
            if (sy > 160) sy = 160;
            dLine(-250, 176, 250, 176, '#475569', 2); dC(sx, sy, 15, '#ef4444');
            dA(sx + 18, sy, sx + 18, sy + 40, '#16a34a', 'g');
            dDynamicFormula(sx + 25, sy - 25);
        }
        else if (animType === "spring_motion") {
            let dispX = Math.sin(time * 2.2) * 85;
            ctx.fillStyle = '#64748b'; ctx.fillRect(-170, -20, 15, 60);
            ctx.beginPath(); ctx.moveTo(-155, 10); let turns = 14; let step = (dispX - 25 - (-155)) / turns;
            for(let i=0; i<=turns; i++) ctx.lineTo(-155 + step * i, 10 + (i % 2 === 0 ? -18 : 18));
            ctx.strokeStyle = '#475569'; ctx.stroke(); dB(dispX, 10, 50, 44, '#8b5cf6');
            dA(dispX, 10, dispX - dispX * 1.2, 10, '#ef4444', 'F');
            dDynamicFormula(dispX - 60, -50);
        }
        else if (animType === "momentum_collision") {
            let loopT = time % 4; let x1 = -160 + loopT * 65, x2 = 10;
            if(loopT > 1.7) { x1 = -160 + 1.7 * 65; x2 = 10 + (loopT - 1.7) * 65; }
            dLine(-220, 25, 220, 25, '#94a3b8', 2); dC(x1, 5, 20, '#3b82f6'); dC(x2, 5, 20, '#ef4444');
            dDynamicFormula(-80, -120);
        }
        else if (animType === "circular_motion") {
            let r = 95; dC(0, 0, r, '#cbd5e1', false); dC(0, 0, 5, '#eab308');
            let ang = time * 1.6; let bx = r * Math.cos(ang), by = r * Math.sin(ang);
            dLine(0, 0, bx, by, '#94a3b8', 1.5); dC(bx, by, 15, '#3b82f6');
            dA(bx, by, bx - 55 * Math.sin(ang), by + 55 * Math.cos(ang), '#2563eb', 'v');
            dA(bx, by, bx * 0.5, by * 0.5, '#ef4444', 'F');
            dDynamicFormula(-80, -140);
        }
        else if (animType === "gas_law") {
            let pW = 75 + Math.sin(time * 1.8) * 35;
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 3; ctx.strokeRect(-120, -60, pW + 120, 120);
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(pW, -59, 15, 118);
            for(let i=0; i<20; i++) dC(-110 + Math.abs(Math.sin(i*7 + time*2)) * (pW + 105), -50 + Math.abs(Math.cos(i*19 + time*1.5)) * 100, 3.5, '#e67e22');
            dDynamicFormula(-70, -100);
        }
        else if (animType === "wave_base") {
            ctx.beginPath(); ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2.5;
            for(let x=-180; x<=180; x+=5) ctx.lineTo(x, Math.sin(x * 0.035 - time * 3) * 45);
            ctx.stroke(); dC(0, Math.sin(-time*3)*45, 7, '#ef4444');
            dDynamicFormula(-70, -110);
        }
        else if (animType === "doppler_effect") {
            let loopT = time % 4; let sx = -120 + loopT * 35; dC(sx, 0, 8, '#ef4444');
            for(let i=0; i<4; i++) {
                let age = loopT - i * 0.9;
                if(age > 0) { ctx.beginPath(); ctx.strokeStyle = 'rgba(59,130,246,0.35)'; ctx.arc(-120 + i*0.9*35, 0, age*65, 0, Math.PI*2); ctx.stroke(); }
            }
            dC(100, 0, 10, '#10b981'); dDynamicFormula(-80, -110);
        }
        else if (animType === "light_refract") {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.2)'; ctx.fillRect(-200, 0, 400, 130);
            dLine(-200, 0, 200, 0, '#334155', 2); dLine(0, -120, 0, 120, '#94a3b8', 1, [4,4]);
            let iA = Math.PI / 4; let rA = Math.PI / 7;
            dA(-110 * Math.sin(iA), -110 * Math.cos(iA), 0, 0, '#eab308', '入射');
            dA(0, 0, 110 * Math.sin(rA), 110 * Math.cos(rA), '#eab308', '屈折');
            dDynamicFormula(-80, -140);
        }
        else if (animType === "coulomb_force" || animType === "capacitor_field") {
            if (animType === "coulomb_force") {
                dC(-80, 0, 16, '#ef4444'); dC(80, 0, 16, '#3b82f6');
                dA(-80, 0, -30, 0, '#ef4444', 'F'); dA(80, 0, 30, 0, '#2563eb', 'F');
            } else {
                dLine(-100, -35, 100, -35, '#ef4444', 6); dLine(-100, 35, 100, 35, '#3b82f6', 6);
                for(let x=-75; x<=75; x+35) dA(x, -30, x, 30, '#10b981');
            }
            dDynamicFormula(-80, -110);
        }
        else if (animType === "photo_electric") {
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(-100, 40, 200, 14); let loopT = time % 3;
            if(loopT < 1.4) {
                ctx.beginPath(); ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2.5;
                for(let i=0; i<15; i++) ctx.lineTo(-110 + loopT * 50 + i, -50 + loopT * 50 + Math.sin(i)*8);
                ctx.stroke();
            } else {
                let ex = (loopT - 1.4) * 75; let ey = 40 - (loopT - 1.4) * 45;
                dC(ex, ey, 6, '#3b82f6'); dA(ex, ey, ex + 25, ey - 15, '#2563eb', 'e⁻');
            }
            dDynamicFormula(-80, -120);
        }
        else if (animType === "bohr_model") {
            dC(0, 0, 12, '#ef4444'); dC(0, 0, 55, '#cbd5e1', false); dC(0, 0, 100, '#cbd5e1', false);
            let rot = time * 1.3; dC(55 * Math.cos(rot), 55 * Math.sin(rot), 6, '#3b82f6');
            dDynamicFormula(-80, -140);
        }

        ctx.restore();
    } catch (e) {
        console.error(e);
    }
}
render();
