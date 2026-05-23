// ==========================================
// 高校物理 2Dシミュレーションエンジン (完全網羅・公式表示・美文字対応版 - 修正済)
// ==========================================

const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

// メニューの構築
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
                card.innerHTML = `<h3>${f.name}</h3><div class="math-box">${f.math}</div>
                    <div class="desc-section"><strong>いつ使う？</strong><br>${f.usage}</div>
                    <div class="desc-section"><strong>式の意味</strong><br>${f.reason}</div>`;
                card.onclick = () => {
                    document.querySelectorAll('.formula-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    document.getElementById('sim-desc').innerText = f.simText;
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

// Canvas 設定
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let scale = 1.0, panX = 0, panY = 0;
let isDragging = false, lastX = 0, lastY = 0;

function resizeCanvas() { 
    canvas.width = canvas.parentElement.clientWidth; 
    canvas.height = canvas.parentElement.clientHeight; 
}
window.addEventListener('resize', resizeCanvas); 
resizeCanvas();

function setAnimation(type) { 
    animType = type; 
    time = 0; 
    scale = 1.0; 
    panX = 0; 
    panY = 0; 
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomVal = document.getElementById('zoomVal');
    if(zoomSlider && zoomVal) { zoomSlider.value = 1.0; zoomVal.innerText = "1.0x"; }
}

// コントロールUI
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const zoomSlider = document.getElementById('zoomSlider');
if(zoomSlider) zoomSlider.addEventListener('input', e => { scale = parseFloat(e.target.value); document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; });
const playBtn = document.getElementById('playBtn');
if(playBtn) playBtn.onclick = () => { isPlaying = !isPlaying; playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
const resetBtn = document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick = () => setAnimation(animType);

// マウス操作
canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', e => { if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('wheel', e => { 
    e.preventDefault(); 
    scale = Math.max(0.5, Math.min(3.0, scale + (e.deltaY > 0 ? -0.1 : 0.1))); 
    if(zoomSlider) zoomSlider.value = scale; 
    if(document.getElementById('zoomVal')) document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; 
}, { passive: false });

// ====================================================
// 描画ユーティリティ
// ====================================================
function dLine(x1, y1, x2, y2, color, w=2, dash=[]) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
}

function dA(x1, y1, x2, y2, color, label="", dashed=false) { 
    dLine(x1, y1, x2, y2, color, 2, dashed ? [5,5] : []);
    if(x1 === x2 && y1 === y2) return;
    const a = Math.atan2(y2-y1, x2-x1);
    ctx.beginPath(); 
    ctx.moveTo(x2, y2); 
    ctx.lineTo(x2 - 12*Math.cos(a-0.4), y2 - 12*Math.sin(a-0.4)); 
    ctx.lineTo(x2 - 12*Math.cos(a+0.4), y2 - 12*Math.sin(a+0.4)); 
    ctx.fillStyle = color; ctx.fill();
    if(label) dMath(label, x2 + 15*Math.cos(a), y2 + 15*Math.sin(a), color);
}

function dC(x, y, r, color, fill=true) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    if(fill){ ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
}

function dB(x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x-w/2, y-h/2, w, h); 
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 2; ctx.strokeRect(x-w/2, y-h/2, w, h);
}

function dAng(x, y, r, a1, a2, label, color) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a1, a2, false); ctx.closePath();
    ctx.fillStyle = color + "33"; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
    let m = (a1+a2)/2; 
    dMath(label, x + (r+20)*Math.cos(m) - 5, y + (r+20)*Math.sin(m) + 5, color);
}

function dTxt(t, x, y, c="#2c3e50", f="16px 'Hiragino Sans', Arial, sans-serif") {
    ctx.font = f; ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)"; ctx.shadowBlur = 5;
    ctx.fillText(t, x, y); ctx.shadowBlur = 0;
}

function dMath(t, x, y, c="#2c3e50", size=20) {
    ctx.font = `italic ${size}px 'Times New Roman', serif`; ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)"; ctx.shadowBlur = 5;
    ctx.fillText(t, x, y); ctx.shadowBlur = 0;
}

function dFormula(t, x, y) {
    ctx.font = "italic 18px 'Times New Roman', serif";
    const w = ctx.measureText(t).width + 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)"; ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 6;
    ctx.fillRect(x, y - 22, w, 32); ctx.shadowBlur = 0;
    ctx.strokeStyle = "#bdc3c7"; ctx.lineWidth = 1; ctx.strokeRect(x, y - 22, w, 32);
    ctx.fillStyle = "#c0392b"; ctx.fillText(t, x + 15, y);
}

function drawAxis(ox, oy, w, h, xL, yL) {
    dA(ox, oy+h, ox, oy-h, '#7f8c8d', yL); dA(ox-w, oy, ox+w, oy, '#7f8c8d', xL);
    dMath("O", ox-15, oy+15, '#7f8c8d');
}

// ====================================================
// メインループ (全条件・公式・記号の完全一致版)
// ====================================================
function render() {
    requestAnimationFrame(render);
    try {
        let speed = (speedSlider) ? parseFloat(speedSlider.value) : 1.0;
        if(isPlaying) time += 0.04 * speed;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w/2 + panX, h/2 + panY); 
        ctx.scale(scale, scale);

        // 背景グリッド
        ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
        for(let i=-1000; i<=1000; i+=20) { 
            if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5'; 
            dLine(i,-1000,i,1000,ctx.strokeStyle); dLine(-1000,i,1000,i,ctx.strokeStyle); 
        }
        dLine(-1000, 0, 1000, 0, '#b2bec3', 2); dLine(0, -1000, 0, 1000, '#b2bec3', 2); 

        let t = time % 6; 
        if(!animType) { dTxt("シミュレーションを選択してください。", -120, 0, "#7f8c8d"); ctx.restore(); return; }

        // 共通ステータス表示 (時間tの可視化)
        dMath(`t = ${t.toFixed(2)} s`, -250, -180, "#7f8c8d", 16);

        // ----------------------------------------------------
        // 1. 力学: 仕事
        // ----------------------------------------------------
        if (animType === "work_cos") {
            dFormula("W = F x cosθ", -60, -120);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
            let x = -100 + t*30; if(x > 150) time=0;
            dB(x, 20, 50, 40, '#3498db'); dMath("m", x-10, 25, "white");
            let F = 100, ang = -Math.PI/6; let Fx = F*Math.cos(ang), Fy = F*Math.sin(ang);
            dA(x, 0, x+Fx, Fy, '#7f8c8d', 'F'); dAng(x, 0, 40, ang, 0, "θ", "#e67e22");
            dA(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ'); dLine(x+Fx, 0, x+Fx, Fy, '#bdc3c7', 2, [5,5]); 
            dA(-100, 60, x, 60, '#2ecc71', 'x');
            dMath(`W`, x + 30, 20, '#e74c3c'); // 仕事Wの記号を追加
        }
        // 相対速度の独立化
        else if (animType.includes("relative")) {
            dFormula("v_AB = v_B - v_A", -70, -150);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-300, 40, 600, 5); 
            let xA = -200 + 80*t; let xB = -200 + 40*t;
            if(xA > 250) time = 0;
            dB(xA, -40, 50, 40, '#e74c3c'); dMath("A", xA-10, -35, "white"); dA(xA, -70, xA+60, -70, '#c0392b', 'v_A');
            dB(xB, 20, 50, 40, '#3498db'); dMath("B", xB-10, 25, "white"); dA(xB, -10, xB+30, -10, '#2980b9', 'v_B');
            dMath("v_AB", (xA+xB)/2, -100, "#8e44ad");
        }
        // 等等直線運動
        else if (animType.includes("linear")) {
            dFormula("x = vt", -40, -150);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-300, 40, 600, 5);
            let v = 50; let x = -200 + v*t; if(x > 250) time = 0;
            dB(x, 20, 50, 40, '#3498db'); dA(x, -10, x + v, -10, '#2980b9', 'v');
            dA(-200, 60, x, 60, '#2ecc71', 'x');
            dMath("t", -200, -10, "#7f8c8d");
        }
        // 等加速度直線運動
        else if (animType.includes("accel") || animType.includes("equation") || animType.includes("v_t")) {
            dFormula("v = v₀ + at,  x = v₀t + 1/2 at²", -120, -150);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-300, 40, 600, 5); 
            let a = 20, v0 = 30; let x = -200 + v0*t + 0.5*a*t*t; let v = v0 + a*t;
            if(x > 250) time = 0;
            dB(x, 20, 50, 40, '#3498db'); 
            dMath("v₀", -200, -10, "#95a5a6");
            dA(x, -10, x + v*0.7, -10, '#2980b9', 'v');
            dA(x, -35, x + a*2, -35, '#27ae60', 'a');
            dA(-200, 60, x, 60, '#2ecc71', 'x');
        }
        // ----------------------------------------------------
        // 2. 力学: 落体の運動
        // ----------------------------------------------------
        else if (animType.includes("angle")) { // 斜方投射の独立化
            dFormula("x = v₀ cosθ t,  y = v₀ sinθ t - 1/2 gt²", -170, -160);
            let startX = -150, startY = 100, g = 40, v0 = 140, ang = -Math.PI/3;
            let v0x = v0 * Math.cos(ang), v0y = v0 * Math.sin(ang);
            let cx = startX + v0x*t; let cy = startY + v0y*t + 0.5*g*t*t;
            if(cy > 150) time = 0;
            drawAxis(startX, startY, 50, 200, "x", "y");
            dC(cx, cy, 15, '#e74c3c');
            dA(startX, startY, startX + v0x*0.5, startY + v0y*0.5, '#8e44ad', 'v₀');
            dAng(startX, startY, 40, ang, 0, "θ", "#e67e22");
            dA(cx, cy, cx, cy + g*0.8, '#27ae60', 'g');
        }
        else if (animType.includes("fall")) { // 自由落下
            dFormula("v = gt,  y = 1/2 gt²", -80, -160);
            let g = 60, cy = -120 + 0.5*g*t*t; if(cy > 150) time = 0;
            drawAxis(0, -120, 30, 250, "", "y");
            dC(0, cy, 15, '#e74c3c');
            dA(0, cy, 0, cy + g*t, '#2980b9', 'v');
            dA(-25, cy, -25, cy + g, '#27ae60', 'g');
        }
        else if (animType.includes("throw_down")) { // 投げ下ろし
            dFormula("v = v₀ + gt,  y = v₀t + 1/2 gt²", -120, -160);
            let v0 = 50, g = 50, cy = -120 + v0*t + 0.5*g*t*t; if(cy > 150) time = 0;
            drawAxis(0, -120, 30, 250, "", "y");
            dC(0, cy, 15, '#e74c3c');
            dA(0, -120, 0, -120 + v0, '#8e44ad', 'v₀');
            dA(0, cy, 0, cy + (v0 + g*t), '#2980b9', 'v');
            dA(-25, cy, -25, cy + g, '#27ae60', 'g');
        }
        else if (animType.includes("throw_up")) { // 投げ上げ
            dFormula("v = v₀ - gt,  y = v₀t - 1/2 gt²", -120, -160);
            let v0 = -120, g = 50, cy = 100 + v0*t + 0.5*g*t*t; if(cy > 120) time = 0;
            drawAxis(0, 100, 30, 220, "", "y");
            dC(0, cy, 15, '#e74c3c');
            dA(0, 100, 0, 100 + v0, '#8e44ad', 'v₀');
            dA(0, cy, 0, cy + (v0 + g*t), '#2980b9', 'v');
            dA(-25, cy, -25, cy + g, '#27ae60', 'g');
        }
        // ----------------------------------------------------
        // 3. 力学: 力・摩擦・ばね・運動方程式
        // ----------------------------------------------------
        else if (animType.includes("spring")) {
            dFormula("F = -kx", -40, -120);
            let sx = Math.sin(time*3)*60;
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            ctx.fillRect(-120, -40, 10, 80); 
            ctx.beginPath(); ctx.moveTo(-110,10); let c = 10; let dx=(sx-30+110)/c; 
            for(let i=0;i<c;i++){ctx.lineTo(-110+dx*(i+0.5), 10+(i%2===0?-10:10));} 
            ctx.lineTo(sx-30,10); ctx.strokeStyle='#7f8c8d'; ctx.stroke();
            dB(sx, 10, 60, 60, '#9b59b6'); dMath("m", sx-10, 15, "white");
            dA(sx, 10, sx-sx, 10, '#e74c3c', 'F'); 
            dMath("k", -60, -20, "#7f8c8d"); // 記号kを追加
            drawAxis(0, 60, 100, 10, "x", ""); 
        } 
        else if (animType.includes("friction_s")) { // 静止摩擦
            dFormula("f \u2264 \u03bcN", -40, -120);
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            dB(0, 10, 60, 60, '#9b59b6'); dMath("m", -8, 15, "white");
            let p = t*20; if(p>80) time=0;
            dA(0, 10, 0, 80, '#e74c3c', 'mg'); dA(0, 10, 0, -60, '#2ecc71', 'N');
            dA(0, 10, p, 10, '#3498db', 'F'); dA(0, 40, -p, 40, '#e67e22', 'f');
            dMath("\u03bc", -50, -20, "#e67e22"); // 記号μを追加
        }
        else if (animType.includes("friction_d")) { // 動摩擦
            dFormula("f' = \u03bc'N", -45, -120);
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            dB(0, 10, 60, 60, '#9b59b6'); dMath("m", -8, 15, "white");
            dA(0, 10, 0, 80, '#e74c3c', 'mg'); dA(0, 10, 0, -60, '#2ecc71', 'N');
            dA(0, 10, 80, 10, '#3498db', 'F'); dA(0, 40, -50, 40, '#e67e22', "f'");
            dA(0, -30, 40, -30, '#2980b9', 'v');
            dMath("\u03bc'", -50, -20, "#e67e22"); // 記号μ'を追加
        }
        else if (animType.includes("law")) { // 運動方程式
            dFormula("ma = F", -35, -120);
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            let a = 25; let x = -100 + 0.5*a*t*t; if(x > 150) time=0;
            dB(x, 10, 60, 60, '#9b59b6'); dMath("m", x-8, 15, "white");
            dA(x, 10, x + 90, 10, '#e74c3c', 'F');
            dA(x, -30, x + a*2, -30, '#27ae60', 'a');
        }
        else if (animType.includes("force") || animType.includes("normal") || animType.includes("tension")) {
            dFormula("F = mg", -35, -120);
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            dB(0, 10, 60, 60, '#9b59b6'); dMath("m", -8, 15, "white");
            dA(0, 10, 0, 80, '#e74c3c', 'mg'); 
            if(animType.includes("tension")) { dA(0, -20, 0, -80, '#7f8c8d', '糸'); dA(0, 10, 0, -60, '#2ecc71', 'T'); }
            else dA(0, 10, 0, -60, '#2ecc71', 'N');
        }
        // ----------------------------------------------------
        // 4. 力学: 圧力と浮力
        // ----------------------------------------------------
        else if (animType.includes("buoyancy")) {
            dFormula("F = \u03c1Vg", -50, -120);
            ctx.fillStyle='rgba(52, 152, 219, 0.4)'; ctx.fillRect(-150, -20, 300, 120);
            let bob = Math.sin(time*3)*15; 
            dB(0, 10+bob, 60, 60, '#e67e22'); dMath("V", -8, 15+bob, "white");
            dA(0, 10+bob, 0, 80+bob, '#e74c3c', 'mg'); dA(0, 10+bob, 0, -60+bob, '#2ecc71', 'F');
            dLine(-150, -20, 150, -20, '#2980b9', 2);
            dMath("\u03c1", -130, 20, "#2980b9"); dMath("g", -130, 50, "#27ae60"); // 構成記号の補完
        } 
        else if (animType.includes("pressure") || animType.includes("pascal")) {
            dFormula("p = F / S", -40, -120);
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            dB(0, 10, 80, 60, '#9b59b6');
            dLine(-40, -20, 40, -20, '#2ecc71', 6); dMath("S", 50, -15, '#2ecc71'); 
            for(let i=-20; i<=20; i+=20) dA(i, -70, i, -20, '#e74c3c'); 
            dMath("F", -10, -80, '#e74c3c');
            dMath("p", 0, 15, "white"); // 圧力pを明示
        }
        // ----------------------------------------------------
        // 5. 力学: モーメント・重心
        // ----------------------------------------------------
        else if (animType.includes("center")) {
            dFormula("x_G = (m\u2081x\u2081 + m\u2082x\u2082) / (m\u2081 + m\u2082)", -120, -120);
            drawAxis(0, 50, 150, 20, "x", "");
            dC(-80, 0, 20, '#3498db'); dMath("m\u2081", -90, -30); dA(-80, 50, -80, 15, '#3498db', 'x\u2081', true);
            dC(60, 0, 30, '#e74c3c'); dMath("m\u2082", 50, -40); dA(60, 50, 60, 30, '#e74c3c', 'x\u2082', true);
            dLine(-80, 0, 60, 0, '#bdc3c7', 4);
            let xg = (-80*20 + 60*30) / (20+30); 
            dA(xg, 50, xg, 0, '#2ecc71', 'x_G', true); dC(xg, 0, 6, '#2ecc71');
        } 
        else if (animType.includes("moment") || animType.includes("balance")) {
            dFormula("F\u2081 l\u2081 = F\u2082 l\u2082", -60, -120); // 釣り合いの式に修正
            ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(-20,80); ctx.lineTo(20,80); ctx.fillStyle='#7f8c8d'; ctx.fill();
            ctx.translate(0,30);
            ctx.fillStyle='#f39c12'; ctx.fillRect(-120,-5,240,10);
            dB(-80,-20,30,30,'#3498db'); dA(-80,-20,-80,50,'#e74c3c','F\u2081'); dMath("l\u2081", -40, -15);
            dB(80,-25,40,40,'#e74c3c'); dA(80,-25,80,70,'#e74c3c','F\u2082'); dMath("l\u2082", 40, -15);
        }
        // ----------------------------------------------------
        // 6. 力学: 運動量・衝突・反発係数
        // ----------------------------------------------------
        else if (animType.includes("impulse")) {
            dFormula("I = F\u0394t = m\u0394v", -60, -120);
            let x = -150 + t*50; if(x > 150) time=0;
            dC(x, 0, 20, '#3498db'); dMath("m", x-8, 6, "white"); 
            dA(x, -30, x+40, -30, '#2980b9', '\u0394v');
            dA(x-60, 0, x-20, 0, '#e74c3c', 'F');
            dMath("I", x, 30, '#e74c3c'); dMath("\u0394t", x-40, -45, '#7f8c8d');
        } 
        else if (animType.includes("restitution") || animType.includes("bounce")) { // 壁との反発用に式を変更
            dFormula("e = |v'| / |v|", -50, -120);
            let vy = -80 * Math.sin(time*3) * Math.exp(-time*0.1);
            let by = 80 - Math.abs(Math.cos(time*3)*80)*Math.exp(-time*0.1);
            dC(0, by, 15, '#1abc9c'); 
            if(vy > 0) dA(20, by, 20, by+40, '#2980b9', 'v');
            else dA(20, by, 20, by-40, '#e74c3c', "v'");
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, 95, 100, 5);
            dMath("e", 40, 80, "#1abc9c");
        } 
        else if (animType.includes("momentum") || animType.includes("collision")) {
            dFormula("m\u2081v\u2081 + m\u2082v\u2082 = m\u2081v\u2081' + m\u2082v\u2082'", -120, -120);
            let t2 = time%3;
            let x1 = t2<1.5 ? -120+t2*70 : -15 - (t2-1.5)*60; 
            let x2 = t2<1.5 ? -15 : -15+(t2-1.5)*120; 
            dC(x1, 0, 20, '#3498db'); dMath("m\u2081", x1-10, 6, "white"); 
            dA(x1, -30, x1+(t2<1.5?50:-30), -30, '#2980b9', t2<1.5?'v\u2081':'v\u2081\'');
            dC(x2, 0, 20, '#e74c3c'); dMath("m\u2082", x2-10, 6, "white"); 
            dA(x2, -30, x2+(t2>=1.5?80:0), -30, '#e74c3c', t2<1.5?'v\u2082=0':'v\u2082\'');
        }
        // ----------------------------------------------------
        // 7. 力学: エネルギー・仕事率
        // ----------------------------------------------------
        else if (animType.includes("power")) { // 仕事率の独立
            dFormula("P = W / t = Fv", -60, -160);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
            let v = 40; let x = -150 + v*t; if(x > 150) time=0;
            dB(x, 20, 50, 40, '#3498db'); dA(x, -10, x + v, -10, '#2980b9', 'v');
            dA(x, 20, x + 60, 20, '#e74c3c', 'F');
            dMath("W", x, -40, '#f1c40f'); dMath("P", -180, -100, '#e74c3c');
            dMath("t", -180, -70, '#7f8c8d');
        }
        else if (animType.includes("energy") || animType.includes("pendulum")) {
            dFormula("E = K + U = 1/2 mv\u00b2 + mgh", -130, -160);
            let a = Math.sin(time*2)*0.8;
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200,-100,100,10); 
            let px = -150 + 150*Math.sin(a), py = -100 + 150*Math.cos(a);
            dLine(-150,-100, px, py, '#333', 2); 
            dC(px, py, 20, '#9b59b6'); dMath("m", px-8, py+6, "white");
            dA(px, py, px+40*Math.cos(a)*Math.cos(time*2), py+40*Math.sin(a)*Math.cos(time*2), '#2980b9', 'v');
            dLine(-250, 50, -50, 50, '#7f8c8d', 1, [5,5]); dMath("h=0", -250, 40, '#7f8c8d');
            dA(-150, 50, -150, py, '#2ecc71', 'h', true);
            dMath("g", -230, -20, "#27ae60");

            let K = (0.8 - Math.abs(a))*100, U = Math.abs(a)*100;
            drawAxis(100, 100, 120, 120, "", "Energy");
            ctx.fillStyle='#2ecc71'; ctx.fillRect(120, 100-K, 30, K); dMath("K", 125, 130, '#2ecc71');
            ctx.fillStyle='#e67e22'; ctx.fillRect(160, 100-U, 30, U); dMath("U", 165, 130, '#e67e22');
            ctx.fillStyle='#8e44ad'; ctx.fillRect(200, 0, 30, 100);   dMath("E", 205, 130, '#8e44ad'); 
        }
        // ----------------------------------------------------
        // 8. 力学: 円運動・万有引力・ケプラー
        // ----------------------------------------------------
        else if (animType.includes("kepler")) { // ケプラーの独立
            dFormula("T\u00b2 / a\u00b3 = k", -50, -150);
            dC(0,0,10,"#e67e22"); 
            ctx.beginPath(); ctx.ellipse(0, 0, 120, 80, 0, 0, Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
            let ex = 120*Math.cos(time), ey = 80*Math.sin(time);
            dC(ex, ey, 8, "#3498db");
            dLine(0,0,120,0,"#7f8c8d",1,[3,3]); dMath("a", 60, -10, "#7f8c8d");
            dMath("T", ex+10, ey, "#3498db"); dMath("k", -180, -100);
        }
        else if (animType.includes("circular") || animType.includes("centripetal") || animType.includes("centrifugal")) {
            dFormula("v = r\u03c9,  a = r\u03c9\u00b2,  F = mr\u03c9\u00b2", -120, -150);
            let r = 80; dC(0,0,r,'#bdc3c7',false); dC(0,0,5,'#f1c40f');
            let a = time*2; let bx = r*Math.cos(a), by = r*Math.sin(a);
            dC(bx, by, 15, '#3498db'); dMath("m", bx-8, by+6, "white");
            dLine(0,0,bx,by,'#7f8c8d'); dMath("r", bx/2, by/2-10); dAng(0,0,30,0,a,"\u03c9t","#e67e22");
            dA(bx, by, bx-50*Math.sin(a), by+50*Math.cos(a), '#2980b9', 'v');
            dA(bx, by, bx-40*Math.cos(a), by-40*Math.sin(a), '#27ae60', 'a');
            if(animType.includes("centrifugal")) dA(bx, by, bx+50*Math.cos(a), by+50*Math.sin(a), '#e67e22', 'F');
            else dA(bx, by, bx*0.4, by*0.4, '#e74c3c', 'F');
        }
        else if (animType.includes("gravity") || animType.includes("universal")) {
            dFormula("F = G (m\u2081m\u2082) / r\u00b2", -70, -150);
            dC(-60,0,25,"#e67e22"); dMath("m\u2081", -70, -35);
            dC(80,0,15,"#3498db"); dMath("m\u2082", 70, -25);
            dA(-60, 0, -20, 0, "#e74c3c", "F"); dA(80, 0, 40, 0, "#e74c3c", "F");
            dLine(-60,0, 80, 0, "#7f8c8d", 1, [5,5]); dMath("r", 10, -10);
            dMath("G", -180, -100);
        }
        // ----------------------------------------------------
        // 9. 力学: 単振動・振り子の周期
        // ----------------------------------------------------
        else if (animType === "pendulum_t") { // 単振り子周期の独立
            dFormula("T = 2\u03c0 \u221a(l/g)", -60, -150);
            let ang = Math.sin(time*2.5)*0.5;
            let px = 140*Math.sin(ang), py = -100 + 140*Math.cos(ang);
            dLine(0,-100, px, py, '#333', 2); dC(px, py, 15, '#9b59b6');
            dMath("l", px/2, (-100+py)/2, "#7f8c8d"); dMath("g", 40, 40, "#27ae60");
            dMath("T", -150, -50, "#9b59b6");
        }
        else if (animType.includes("shm") || animType.includes("harmonic") || animType.includes("oscillation")) {
            dFormula("x = A sin(\u03c9t),  F = -Kx", -100, -150);
            let R = 80, o = 1.5, a = time*o; let px = R*Math.cos(a), py = R*Math.sin(a);
            dC(-150, 0, R, '#bdc3c7', false); dLine(-150,0,-150+px,py,'#7f8c8d'); dMath("A", -150+px/2, py/2-10);
            dAng(-150, 0, 30, 0, a, "\u03c9t", "#2980b9");
            dA(-150+px, 0, -150+px, py, '#e74c3c', 'x', true); 
            dLine(-150+px, py, 50, py, '#e74c3c', 2, [5,5]);
            
            drawAxis(50, 0, 150, 100, "t", "x");
            dC(50, py, 15, '#2ecc71'); dMath("m", 40, py+5, "white");
            ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.6)'; ctx.lineWidth=2;
            for(let i=0; i<150; i++) ctx.lineTo(50+i, R*Math.sin(a - i*0.05)); ctx.stroke();
            dMath("K", 220, -80, "#e74c3c");
        }
        // ----------------------------------------------------
        // 10. 熱力学: 比熱・潜熱
        // ----------------------------------------------------
        else if (animType.includes("latent") || animType.includes("state")) { // 潜熱の独立
            dFormula("Q = mL", -35, -150);
            ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100,-60,200,120);
            for(let i=1; i<=30; i++) {
                let px = -80 + (i*15 + time*20)%160, py = Math.sin(i*5)*40;
                dC(px, py, 5, i%2===0?'#3498db':'#8e44ad');
            }
            dMath("m", -140, 0); dMath("L", -140, 30, "#8e44ad"); dA(0, 90, 0, 70, '#e74c3c', 'Q');
        }
        else if (animType.includes("temp") || animType.includes("heat")) {
            dFormula("Q = mc\u0394T", -45, -150);
            ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100,-60,200,120);
            let dT = 1 + (time%4);
            for(let i=1; i<=30; i++) {
                let px = Math.sin(i*45 + time*dT)*70, py = Math.cos(i*67 + time*dT)*40;
                dC(px, py, 4, `rgb(${dT*50},80,200)`);
            }
            dMath("m", -140, -20); dMath("c", -140, 10); dMath("\u0394T", -140, 40, "#e74c3c");
            dA(0, 90, 0, 70, '#e74c3c', 'Q');
        }
        // ----------------------------------------------------
        // 11. 熱力学: 気体の状態変化・熱力学第一法則
        // ----------------------------------------------------
        else if (animType.includes("boyle")) {
            dFormula("pV = 一定", -40, -150);
            let v_vol = 70 + Math.sin(time*2)*30; ctx.strokeRect(-100,-50,v_vol+100,100);
            ctx.fillStyle='#e74c3c'; ctx.fillRect(v_vol,-50,15,100);
            dMath("p", v_vol-25, -20, '#e74c3c'); dMath("V", -80, -20, '#3498db');
        }
        else if (animType.includes("charles")) {
            dFormula("V / T = 一定", -50, -150);
            let v_vol = 70 + Math.sin(time*2)*30; ctx.strokeRect(-100,-50,v_vol+100,100);
            ctx.fillStyle='#e74c3c'; ctx.fillRect(v_vol,-50,15,100);
            dMath("V", -80, -20, '#3498db'); dMath("T", v_vol+25, -20, '#e74c3c');
        }
        else if (animType.includes("thermo") || animType.includes("internal")) {
            dFormula("\u0394U = Q + W", -50, -150);
            let pw = 60+Math.sin(time*2)*30; ctx.strokeRect(-100,-50,pw+100,100);
            ctx.fillStyle='#e74c3c'; ctx.fillRect(pw,-50,15,100);
            dA(0, 90, 0, 60, '#e74c3c', 'Q');
            if(Math.sin(time*2)>0) dA(pw+20,0,pw+50,0,'#3498db','W');
            dMath("\u0394U", -40, 0, "#8e44ad");
        }
        else if (animType.includes("engine")) {
            dFormula("e = W / Q_in", -55, -150);
            ctx.strokeRect(-60, -40, 120, 80); dTxt("熱機関", -25, 5);
            dA(-120, 0, -60, 0, "#e74c3c", "Q_in");
            dA(60, 0, 120, 0, "#3498db", "W");
            dA(0, 40, 0, 90, "#95a5a6", "Q_out");
            dMath("e", -15, -60, "#2ecc71");
        }
        else if (animType.includes("gas") || animType.includes("kinetic") || animType.includes("piston") || animType.includes("molar")) {
            dFormula("pV = nRT", -40, -150);
            let pw = 80; ctx.strokeRect(-100,-50,pw+100,100);
            ctx.fillStyle='#e74c3c'; ctx.fillRect(pw,-50,15,100);
            dMath("p", pw-20, -20, '#e74c3c'); dMath("V", -80, -20, '#3498db');
            dMath("n", -30, 80); dMath("R", 0, 80); dMath("T", 30, 80, "#9b59b6");
            for(let i=1; i<=15; i++) { dC(-90+Math.abs(Math.sin(i*5+time*3))*160, -40+Math.abs(Math.cos(i*7+time*2))*80, 4, '#e67e22'); }
        }
        // ----------------------------------------------------
        // 12. 波動: 波の基本・ドップラー・うなり・定常波
        // ----------------------------------------------------
        else if (animType.includes("doppler")) {
            dFormula("f' = f (V - v_o) / (V - v_s)", -120, -150);
            let v_s = 35; let sx = -120 + (t%3)*v_s;
            dC(sx, 0, 10, "#e74c3c"); dA(sx, 0, sx+40, 0, "#c0392b", "v_s");
            for(let i=0; i<3; i++) { ctx.beginPath(); ctx.strokeStyle="rgba(52, 152, 219, 0.4)"; ctx.arc(sx - i*25, 0, 20 + i*25, 0, Math.PI*2); ctx.stroke(); }
            let ox = 100; dC(ox, 0, 12, "#2ecc71"); dMath("v_o", ox, -20, "#2ecc71");
            dMath("f", sx-10, -25, "#e74c3c"); dMath("f'", ox-10, 30, "#2ecc71"); dMath("V", 0, -80, "#3498db");
        } 
        else if (animType.includes("beat")) {
            dFormula("f_beat = |f\u2081 - f\u2082|", -60, -150);
            drawAxis(-150, 0, 0, 60, "t", "y");
            ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=2;
            for(let x=-150; x<=150; x++) {
                let amp = Math.cos(x*0.02) * 50;
                ctx.lineTo(x, amp * Math.sin(x*0.3 - time*4));
            }
            ctx.stroke();
            dMath("f\u2081", -120, -80, "#3498db"); dMath("f\u2082", -70, -80, "#e74c3c");
        }
        else if (animType.includes("pipe") || animType.includes("string")) {
            dFormula("\u03bb = 2L / n,  f = nv / 2L", -110, -150);
            ctx.strokeRect(-100, -40, 200, 80); dMath("L", 0, 60);
            ctx.beginPath(); ctx.strokeStyle='#e67e22'; ctx.lineWidth=2;
            for(let x=-100; x<=100; x+=5) ctx.lineTo(x, Math.sin((x+100)*Math.PI/200)*35 * Math.cos(time*5));
            ctx.stroke();
            dMath("n=1", -130, -20); dMath("\u03bb", 0, -50, "#e67e22"); dMath("f", 120, -20); dMath("v", 120, 10);
        }
        else if (animType.includes("wave") || animType.includes("transverse") || animType.includes("longitudinal") || animType.includes("sound")) {
            dFormula("v = f\u03bb,  T = 1/f", -60, -150);
            drawAxis(0, 0, 250, 80, "x", "y");
            ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(x*0.04 - time*3)*60); ctx.stroke();
            dC(0, Math.sin(-time*3)*60, 10, '#e74c3c');
            let peak1 = (Math.PI/2 + time*3)/0.04, peak2 = (5*Math.PI/2 + time*3)/0.04;
            dA(peak1, -70, peak2, -70, '#2980b9', '\u03bb');
            dMath("f", -230, -100); dMath("T", -190, -100); dMath("v", 60, 40, "#e74c3c");
        }
        // ----------------------------------------------------
        // 13. 光学: 屈折・レンズ・干渉
        // ----------------------------------------------------
        else if (animType.includes("lens")) {
            dFormula("1/a + 1/b = 1/f", -60, -150);
            dLine(-200, 0, 200, 0, "#7f8c8d"); dA(0, -80, 0, 80, "#3498db"); dA(0, 80, 0, -80, "#3498db"); 
            let ox = -100, oy = -40;
            dA(ox, 0, ox, oy, "#e74c3c", "A"); dLine(ox, oy, 0, oy, "#f1c40f"); dLine(0, oy, 100, 40, "#f1c40f"); 
            dLine(ox, oy, 0, 0, "#f1c40f"); dLine(0, 0, 100, 40, "#f1c40f"); 
            dA(100, 0, 100, 40, "#e67e22", "A'"); 
            dLine(-100, 15, 0, 15, "#7f8c8d"); dMath("a", -50, 30);
            dLine(0, 15, 100, 15, "#7f8c8d"); dMath("b", 50, 30);
            dC(50, 0, 4, "#2c3e50"); dMath("f", 50, -10);
        } 
        else if (animType.includes("slit") || animType.includes("diffraction")) { // 光の干渉スリット
            dFormula("\u0394x = L\u03bb / d", -50, -150);
            dLine(-150, -60, -150, 60, "#34495e", 6); ctx.clearRect(-153, -25, 6, 4); ctx.clearRect(-153, 25, 6, 4);
            dMath("d", -170, 5); dLine(100, -80, 100, 80, "#bdc3c7", 4); dMath("L", -20, 90);
            for(let y=-60; y<=60; y+=30) { dC(100, y, 6, "#e74c3c"); }
            dMath("\u0394x", 120, 15, "#e74c3c"); dMath("\u03bb", -80, -40, "#f1c40f");
        }
        else if (animType.includes("refract") || animType.includes("reflect")) {
            dFormula("n\u2081\u2082 = sin i / sin r = v\u2081 / v\u2082", -120, -170);
            ctx.fillStyle='rgba(52,152,219,0.2)'; ctx.fillRect(-250, 0, 500, 200);
            dLine(-250, 0, 250, 0, '#34495e', 3); dMath("n\u2081", -240, -20); dMath("n\u2082", -240, 30);
            dA(0, -150, 0, 150, '#bdc3c7', '', true); 
            let aI = Math.PI/4, aR = Math.PI/6;
            let ix = -120*Math.sin(aI), iy = -120*Math.cos(aI); let rx = 120*Math.sin(aR), ry = 120*Math.cos(aR);
            dA(ix, iy, 0, 0, '#f1c40f', 'v\u2081'); dA(0, 0, rx, ry, '#f1c40f', 'v\u2082');
            dAng(0, 0, 40, -Math.PI/2, -Math.PI/2 + aI, "i", "#e74c3c"); dAng(0, 0, 50, Math.PI/2 - aR, Math.PI/2, "r", "#2980b9");
        }
        // ----------------------------------------------------
        // 14. 電磁気: クーロン・コンデンサー・オーム・回路
        // ----------------------------------------------------
        else if (animType.includes("capacitor")) {
            dFormula("C = \u03b5 S / d,  Q = CV", -90, -130);
            dLine(-60, -40, 60, -40, "#e74c3c", 8); dMath("+Q", 75, -35, "#e74c3c");
            dLine(-60, 40, 60, 40, "#3498db", 8); dMath("-Q", 75, 45, "#3498db");
            for(let x=-40; x<=40; x+=20) dA(x, -30, x, 30, "#2ecc71");
            dLine(-90, -40, -90, 40, "#7f8c8d"); dMath("d", -105, 5);
            dMath("\u03b5", -20, -60); dMath("S", 20, -60); dMath("C", -140, 0); dMath("V", -140, 30);
        }
        else if (animType.includes("coulomb") || animType.includes("field")) {
            dFormula("F = k q\u2081q\u2082 / r\u00b2,  E = F / q", -110, -130);
            dC(-70, 0, 18, "#e74c3c"); dMath("+q\u2081", -85, -25);
            dC(70, 0, 18, "#3498db"); dMath("-q\u2082", 55, -25);
            dA(-70, 0, -20, 0, "#e74c3c", "F"); dA(70, 0, 20, 0, "#3498db", "F");
            dLine(-70, 0, 70, 0, "#bdc3c7", 1, [5,5]); dMath("r", 0, -10);
            dMath("k", -150, -60); dMath("E", 0, 40, "#2ecc71");
        }
        else if (animType.includes("ohm") || animType.includes("circuit") || animType.includes("kirchhoff") || animType.includes("joule")) {
            dFormula("V = RI,  Q = VIt", -70, -130);
            dLine(-60, -40, 60, -40, "#34495e"); dLine(60, -40, 60, 40, "#34495e");
            dLine(-60, 40, -15, 40, "#34495e"); dLine(15, 40, 60, 40, "#34495e"); dLine(-60, -40, -60, 40, "#34495e");
            dLine(-15, 25, -15, 55, "#e74c3c", 4); dLine(15, 30, 15, 50, "#34495e", 4); dMath("V", -5, 70);
            dB(0, -40, 50, 20, "#bdc3c7"); dMath("R", -5, -55);
            dA(-60, 10, -60, -20, "#e67e22", "I");
            dMath("Q", 80, 0, "#9b59b6"); // ジュール熱
        }
        // ----------------------------------------------------
        // 15. 電磁気: 磁場・ローレンツ力・誘導・交流
        // ----------------------------------------------------
        else if (animType.includes("lorentz")) {
            dFormula("F = qvB sin\u03b8", -60, -150);
            for(let y=-60; y<=60; y+=40) { for(let x=-80; x<=80; x+=40) { dMath("\u00d7", x, y, "rgba(46,204,113,0.5)"); } } 
            dMath("B", 110, -50, "#2ecc71");
            let v = 70, ang = -Math.PI/6;
            dC(0, 0, 10, '#f1c40f'); dMath("q", -12, 25);
            dA(0, 0, v*Math.cos(ang), v*Math.sin(ang), '#3498db', 'v'); dAng(0, 0, 35, ang, 0, "\u03b8");
            dA(0, 0, -v*Math.sin(ang), 0, '#e67e22', 'F');
        }
        else if (animType.includes("faraday") || animType.includes("lenz") || animType.includes("induct")) {
            dFormula("V = -N (\u0394\u03a6 / \u0394t)", -80, -150);
            let y = Math.sin(time*2)*30;
            dB(0, -70 + y, 40, 50, "#e74c3c"); dMath("N", -5, -70+y, "white");
            dA(0, -35+y, 0, y, "#3498db", "v");
            dC(0, 40, 30, "#bdc3c7", false); dMath("V", 45, 40, "#e74c3c");
            dMath("\u0394\u03a6", -60, -20, "#3498db"); dMath("\u0394t", -60, 10);
        }
        else if (animType.includes("ac_")) {
            dFormula("V = V\u2080 sin(\u03c9t)", -60, -150);
            let R = 50, o = 2, a = time * o;
            drawAxis(-110, 0, 60, 60, "x", "y"); dC(-110, 0, R, '#bdc3c7', false);
            let cx = -110 + R*Math.cos(a), cy = R*Math.sin(a);
            dA(-110, 0, cx, cy, '#3498db'); dAng(-110, 0, 20, 0, a, "\u03c9t");
            drawAxis(40, 0, 120, 60, "t", "V"); dC(40, cy, 5, '#e74c3c');
            ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=2;
            for(let i=0; i<120; i++) ctx.lineTo(40+i, R*Math.sin(a - i*0.06)); ctx.stroke();
            dMath("V\u2080", 10, -60, "#e74c3c");
        }
        // ----------------------------------------------------
        // 16. 原子: 光電効果・ボーア・質量欠損
        // ----------------------------------------------------
        else if (animType.includes("photo") || animType.includes("work")) {
            dFormula("K_max = h\u03bd - W", -70, -150);
            dLine(-100, 40, 100, 40, "#7f8c8d", 16); dTxt("金属板", -25, 65);
            dA(-80, -50, -20, 30, "#f1c40f", "h\u03bd");
            if(t % 2 > 0.6) dA(0, 30, 70, -20, "#3498db", "e\u207b(K_max)");
            dMath("W", -130, 35, "#7f8c8d");
        }
        else if (animType.includes("bohr") || animType.includes("atom")) {
            dFormula("mvr = n(h/2\u03c0),  h\u03bd = E_n - E_m", -130, -150);
            dC(0, 0, 15, "#e74c3c"); dTxt("+Ze", -14, 5, "white", "11px Arial");
            dC(0, 0, 60, "#bdc3c7", false); dC(0, 0, 100, "#bdc3c7", false);
            let a = time*3; let ex = 60*Math.cos(a), ey = 60*Math.sin(a);
            dC(ex, ey, 6, "#3498db"); dMath("e\u207b", ex+10, ey+10, "#3498db");
            dLine(0,0, ex, ey, "#95a5a6", 1, [3,3]); dMath("r", ex/2, ey/2-8);
            dMath("m", ex-15, ey-15); dA(ex, ey, ex-30*Math.sin(a), ey+30*Math.cos(a), "#2980b9", "v");
            dMath("n", -140, -80); dMath("h", -140, -50); dMath("\u03bd", -140, -20);
            dMath("E_n", 70, -40); dMath("E_m", 110, -40);
        }
        else if (animType.includes("decay") || animType.includes("mass") || animType.includes("energy")) {
            dFormula("E = \u0394m c\u00b2", -50, -150);
            dC(-40, 0, 30, "#e74c3c"); dMath("\u0394m", -55, 45);
            dA(20, 0, 90, 0, "#f1c40f", "Energy E");
            dMath("c", 50, -20, "#95a5a6");
        }
        else {
            dFormula("Simulation Running...", -80, -120);
            dTxt("設定されたアニメーション (" + animType + ") を実行中", -140, 0, "#7f8c8d");
        }
    } catch (e) {
        console.error("Render Error:", e);
        ctx.fillStyle = "red"; ctx.fillText("エラーが発生しました: " + e.message, -150, 0);
    }
    ctx.restore();
}

render();
}
