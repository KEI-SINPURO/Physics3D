// --- UI・メニュー構築 ---
const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

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
            if(idx === 0) card.click(); // 各単元の最初を自動選択
        });
        if (window.MathJax) MathJax.typesetPromise();
    };
    chapUl.appendChild(li);
});

// 起動時に一番最初の単元を自動で開く
const firstChapter = document.querySelector('.chapter-list .item');
if (firstChapter) firstChapter.click();

// --- 2D Canvas シミュレーションエンジン ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let reqId;

// --- ズーム＆パン（移動）の変数 ---
let scale = 1.0;
let panX = 0, panY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

// キャンバスリサイズ
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setAnimation(type) {
    animType = type;
    time = 0;
    // 公式切り替え時に視点をリセット
    scale = 1.0; panX = 0; panY = 0;
    document.getElementById('zoomSlider').value = 1.0;
    document.getElementById('zoomVal').innerText = "1.0x";
}

// --- イベントリスナー (UI・マウス操作) ---
const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');
speedSlider.addEventListener('input', (e) => { speedVal.innerText = parseFloat(e.target.value).toFixed(2) + "x"; });

const zoomSlider = document.getElementById('zoomSlider');
const zoomVal = document.getElementById('zoomVal');
zoomSlider.addEventListener('input', (e) => { 
    scale = parseFloat(e.target.value); 
    zoomVal.innerText = scale.toFixed(1) + "x"; 
});

document.getElementById('playBtn').onclick = () => {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生";
};
document.getElementById('resetBtn').onclick = () => { 
    time = 0; scale = 1.0; panX = 0; panY = 0;
    zoomSlider.value = 1.0; zoomVal.innerText = "1.0x";
};

// マウスドラッグでパン（移動）
canvas.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', (e) => {
    if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; }
});
window.addEventListener('mouseup', () => { isDragging = false; });
// ホイールでズーム
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    let zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.max(0.5, Math.min(3.0, scale + zoomAmount));
    zoomSlider.value = scale; zoomVal.innerText = scale.toFixed(1) + "x";
}, { passive: false });

// --- 描画補助関数群 ---
function drawArrow(ctx, x1, y1, x2, y2, color, label="", dashed=false) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    if(dashed) ctx.setLineDash([5,5]); else ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]);
    
    if(x1!==x2 || y1!==y2) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI/6), y2 - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI/6), y2 - 10 * Math.sin(angle + Math.PI/6));
        ctx.fill();
    }
    if(label) { 
        ctx.font="bold 16px Arial"; 
        ctx.shadowColor = "white"; ctx.shadowBlur = 4;
        ctx.fillText(label, x2+5, y2+5); 
        ctx.shadowBlur = 0;
    }
}
function drawBlock(ctx, x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x - w/2, y - h/2, w, h);
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth=2; ctx.strokeRect(x - w/2, y - h/2, w, h);
}
function drawCircle(ctx, x, y, r, color, fill=true) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    if(fill) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth=2; ctx.stroke(); }
}
function drawSpring(ctx, x1, y1, x2, y2, coils) {
    ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1);
    const dx = (x2-x1)/coils, dy = (y2-y1)/coils;
    for(let i=0; i<coils; i++) {
        let cx = x1 + dx*(i+0.5), cy = y1 + dy*(i+0.5);
        let perpX = -dy*0.3, perpY = dx*0.3;
        ctx.lineTo(cx + perpX, cy + perpY); ctx.lineTo(cx - perpX, cy - perpY);
    }
    ctx.lineTo(x2, y2); ctx.stroke();
}

// === メイン描画ループ ===
function render() {
    reqId = requestAnimationFrame(render);
    
    // スピード反映
    if(isPlaying) {
        let speedMult = parseFloat(speedSlider.value);
        time += 0.04 * speedMult;
    }
    
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    // 視点移動(パン)とズーム(スケール)を適用
    ctx.translate(w/2 + panX, h/2 + panY);
    ctx.scale(scale, scale);

    // 背景グリッド描画
    ctx.strokeStyle = '#e1e8ed'; ctx.lineWidth=1;
    for(let i=-1000; i<1000; i+=40) {
        ctx.beginPath(); ctx.moveTo(i,-1000); ctx.lineTo(i,1000); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1000,i); ctx.lineTo(1000,i); ctx.stroke();
    }

    let t = time % 5;
    
    // --- カテゴリごとの2D描画ロジック ---
    if(animType === "linear" || animType === "accel" || animType.includes("equation") || animType==="power" || animType==="momentum" || animType==="impulse") {
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-400, 40, 800, 5); // 地面
        let x = -150; let v = 60; let a = 0;
        if(animType==="accel" || animType==="equation" || animType==="power" || animType==="impulse") a = 20;
        x = -150 + v*t + 0.5*a*t*t;
        if(x > 150) time = 0;
        drawBlock(ctx, x, 20, 40, 40, '#3498db');
        if(animType==="linear" || animType==="accel" || animType==="momentum") drawArrow(ctx, x, -10, x + v + a*t, -10, '#2980b9', 'v');
        if(a > 0) drawArrow(ctx, x, -30, x + 50, -30, '#27ae60', 'a');
        if(animType.includes("equation") || animType==="power" || animType==="impulse") drawArrow(ctx, x-60, 20, x-20, 20, '#e74c3c', 'F');
    }
    else if(animType === "work_cos") {
        // ★エラー箇所修正済み
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
        let x = -100 + (t*40); if(x>100) time=0;
        drawBlock(ctx, x, 20, 40, 40, '#3498db');
        let F = 80; let angle = -Math.PI/6; // (-30度)
        let Fx = F * Math.cos(angle); let Fy = F * Math.sin(angle);
        drawArrow(ctx, x, 0, x+F*Math.cos(angle), Math.sin(angle)*F, '#7f8c8d', 'F (引く力)');
        drawArrow(ctx, x, 0, x+Fx, 0, '#e74c3c', 'F cosθ (仕事する)');
        drawArrow(ctx, x+Fx, 0, x+Fx, Fy, '#2980b9', 'F sinθ', true);
        ctx.beginPath(); ctx.arc(x, 0, 30, angle, 0); ctx.strokeStyle='black'; ctx.stroke();
        ctx.fillText("θ", x+35, -5);
    }
    else if(animType.includes("fall") || animType === "throw") {
        let y = -100, v0 = 0, g = 50;
        if(animType==="fall_v0") v0 = 40;
        if(animType==="throw") { y = 80; v0 = -120; }
        let curY = y + v0*t + 0.5*g*t*t;
        if(curY > 100 && t>0.5) time = 0;
        drawCircle(ctx, 0, curY, 15, '#e74c3c');
        drawArrow(ctx, 20, curY, 20, curY + (v0 + g*t)*0.5, '#2980b9', 'v');
        drawArrow(ctx, -20, curY, -20, curY + 30, '#27ae60', 'g');
    }
    else if(animType==="force_g" || animType==="friction_s" || animType==="friction_d" || animType==="pressure") {
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-100, 40, 200, 5);
        drawBlock(ctx, 0, 10, 60, 60, '#9b59b6');
        drawArrow(ctx, 0, 10, 0, 70, '#e74c3c', 'W (mg)');
        drawArrow(ctx, 0, 10, 0, -50, '#2ecc71', 'N');
        if(animType.includes("friction")) {
            drawArrow(ctx, 0, 10, 60, 10, '#3498db', 'F');
            drawArrow(ctx, 0, 40, -40, 40, '#e67e22', animType==="friction_s"?'f (静止)':'f\' (動)');
        }
    }
    else if(animType==="spring" || animType==="harmonic_f") {
        let x = Math.sin(time*3)*80;
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-150, -40, 10, 80); 
        drawSpring(ctx, -140, 0, x-20, 0, 10);
        drawBlock(ctx, x, 0, 40, 40, '#2ecc71');
        drawArrow(ctx, x, -30, x - x*0.5, -30, '#e74c3c', 'F = -kx'); 
    }
    else if(animType==="moment" || animType==="balance" || animType==="center_mass") {
        let angle = animType==="moment" ? Math.sin(time)*0.2 : 0;
        ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(-20, 80); ctx.lineTo(20, 80); ctx.fillStyle='#7f8c8d'; ctx.fill();
        ctx.rotate(angle);
        ctx.fillStyle = '#f39c12'; ctx.fillRect(-120, 30, 240, 10);
        drawBlock(ctx, -100, 15, 30, 30, '#3498db'); drawArrow(ctx, -100, 15, -100, 60, '#e74c3c', 'F1');
        if(animType!=="moment") { drawBlock(ctx, 80, 10, 40, 40, '#e74c3c'); drawArrow(ctx, 80, 10, 80, 80, '#e74c3c', 'F2'); }
    }
    else if(animType.includes("energy") || animType==="pendulum") {
        let angle = Math.sin(time*2)*0.8;
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, -80, 100, 10); 
        let px = 120*Math.sin(angle), py = -80 + 120*Math.cos(angle);
        ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(px, py); ctx.strokeStyle='#333'; ctx.stroke();
        drawCircle(ctx, px, py, 20, '#9b59b6');
        let K = (0.8 - Math.abs(angle))*100; let U = Math.abs(angle)*100;
        ctx.fillStyle='#2ecc71'; ctx.fillRect(-100, 100-K, 20, K); ctx.fillText("K", -100, 120);
        ctx.fillStyle='#e67e22'; ctx.fillRect(-60, 100-U, 20, U); ctx.fillText("U", -60, 120);
    }
    else if(animType.includes("circular") || animType==="centrifugal") {
        let r = 80;
        drawCircle(ctx, 0, 0, r, '#bdc3c7', false); 
        drawCircle(ctx, 0, 0, 5, '#f1c40f');
        let bx = r*Math.cos(time*2), by = r*Math.sin(time*2);
        drawCircle(ctx, bx, by, 15, '#3498db');
        if(animType!=="circular") {
            if(animType==="circular_v") drawArrow(ctx, bx, by, bx - 40*Math.sin(time*2), by + 40*Math.cos(time*2), '#2980b9', 'v');
            if(animType==="circular_a"||animType==="circular_f") drawArrow(ctx, bx, by, bx*0.5, by*0.5, animType==="circular_a"?'#27ae60':'#e74c3c', animType==="circular_a"?'a':'F');
            if(animType==="centrifugal") drawArrow(ctx, bx, by, bx*1.5, by*1.5, '#e67e22', 'f (遠心力)');
        }
    }
    else if(animType.includes("harmonic_sin")) {
        let R = 60; let omega = 2; let angle = time * omega;
        let px = -100 + R*Math.cos(angle), py = R*Math.sin(angle);
        drawCircle(ctx, -100, 0, R, '#bdc3c7', false); 
        drawArrow(ctx, -100, 0, px, py, '#7f8c8d', 'A'); 
        drawArrow(ctx, px, 0, px, py, '#e74c3c', 'A sin(ωt)', true); 
        drawArrow(ctx, -100, 0, px, 0, '#2980b9', 'A cos(ωt)', true); 
        ctx.beginPath(); ctx.arc(-100, 0, 20, 0, angle, angle<0); ctx.strokeStyle='black'; ctx.stroke();
        ctx.fillText("ωt", -80, 20);
        drawCircle(ctx, 50, py, 15, '#2ecc71');
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(50, py); ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.5)'; ctx.lineWidth=2;
        for(let i=0; i<150; i++) ctx.lineTo(50 + i, R*Math.sin(angle - i*0.05));
        ctx.stroke();
    }
    else if(animType.includes("harmonic_") || animType==="pendulum_t") {
        let hx = 60*Math.sin(time*3);
        drawCircle(ctx, hx, 0, 20, '#2ecc71');
        if(animType==="harmonic_v") drawArrow(ctx, hx, -30, hx + Math.cos(time*3)*40, -30, '#2980b9', 'v');
        if(animType==="harmonic_a") drawArrow(ctx, hx, 30, hx - Math.sin(time*3)*40, 30, '#27ae60', 'a');
    }
    else if(animType==="kepler" || animType==="gravity" || animType==="orbit_u" || animType==="escape") {
        let a = 120, b = 80;
        ctx.beginPath(); ctx.ellipse(0, 0, a, b, 0, 0, Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
        drawCircle(ctx, 40, 0, 25, '#e74c3c'); 
        let ex = a*Math.cos(time*1.5), ey = b*Math.sin(time*1.5);
        drawCircle(ctx, ex, ey, 10, '#3498db');
        if(animType==="gravity") drawArrow(ctx, ex, ey, ex + (40-ex)*0.5, ey - ey*0.5, '#e74c3c', 'F');
        if(animType==="kepler") { 
            ctx.beginPath(); ctx.moveTo(40,0); ctx.lineTo(ex,ey); ctx.lineTo(a*Math.cos((time-0.2)*1.5), b*Math.sin((time-0.2)*1.5)); 
            ctx.fillStyle='rgba(52, 152, 219, 0.4)'; ctx.fill(); 
        }
    }
    else if(animType==="boyle" || animType==="gas" || animType==="kinetic" || animType==="internal_u" || animType==="piston" || animType==="molar" || animType==="engine") {
        let pw = animType==="piston" || animType==="engine" ? 60 + Math.sin(time*2)*40 : 80;
        ctx.strokeRect(-80, -50, pw+80, 100); 
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(pw, -50, 10, 100); 
        ctx.fillStyle = '#e67e22';
        for(let i=0; i<40; i++) {
            let px = -70 + Math.abs(Math.sin(i*11+time*(3+i%3)))*(pw+60);
            let py = -40 + Math.abs(Math.cos(i*22+time*(2+i%2)))*80;
            drawCircle(ctx, px, py, 4, ctx.fillStyle);
        }
        if(animType==="piston") drawArrow(ctx, pw+15, 0, pw+50, 0, '#e74c3c', 'W (仕事)');
    }
    else if(animType==="wave" || animType==="wave_eq" || animType==="sound") {
        ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
        for(let x=-200; x<=200; x+=5) ctx.lineTo(x, Math.sin(x*0.05 - time*3)*40);
        ctx.stroke();
        drawCircle(ctx, 0, Math.sin(0 - time*3)*40, 8, '#e74c3c');
    }
    else if(animType==="refract_sin") {
        ctx.fillStyle='rgba(52,152,219,0.2)'; ctx.fillRect(-200, 0, 400, 200); 
        drawArrow(ctx, 0, -150, 0, 150, '#7f8c8d', '', true); 
        ctx.fillRect(-200, 0, 400, 2); 
        let angleI = Math.PI/4; let angleR = Math.PI/8; 
        let xI = -100*Math.sin(angleI), yI = -100*Math.cos(angleI);
        let xR = 100*Math.sin(angleR), yR = 100*Math.cos(angleR);
        drawArrow(ctx, xI, yI, 0, 0, '#f1c40f', '入射');
        drawArrow(ctx, 0, 0, xR, yR, '#f1c40f', '屈折');
        drawArrow(ctx, xI, yI, 0, yI, '#e74c3c', 'sin i', true);
        drawArrow(ctx, xR, yR, 0, yR, '#2980b9', 'sin r', true);
    }
    else if(animType==="coulomb" || animType==="efield" || animType==="potential") {
        drawCircle(ctx, 0, 0, 20, '#e74c3c'); ctx.fillStyle='white'; ctx.fillText("+", -4, 4);
        for(let i=0; i<8; i++) {
            let angle = (Math.PI/4)*i;
            drawArrow(ctx, 30*Math.cos(angle), 30*Math.sin(angle), 80*Math.cos(angle), 80*Math.sin(angle), '#e74c3c');
        }
        if(animType==="potential") {
            for(let r=40; r<=120; r+=20) drawCircle(ctx, 0, 0, r, 'rgba(231,76,60,0.3)', false);
        }
    }
    else if(animType==="lorentz_sin") {
        ctx.fillStyle='#2ecc71'; ctx.fillText("B (奥へ)", -50, -50);
        for(let i=-60; i<=60; i+=30) { ctx.fillText("x", i, 0); }
        let v = 60; let angle = -Math.PI/6;
        let vx = v*Math.cos(angle), vy = v*Math.sin(angle);
        drawCircle(ctx, 0, 0, 10, '#f1c40f');
        drawArrow(ctx, 0, 0, vx, vy, '#3498db', 'v (速度)');
        drawArrow(ctx, 0, 0, 0, vy, '#e74c3c', 'v sinθ (力を受ける)', true);
        drawArrow(ctx, 0, 0, vx, 0, '#7f8c8d', 'v cosθ (力0)', true);
        drawArrow(ctx, 0, 0, -vy, 0, '#e67e22', 'F (ローレンツ力)');
    }
    else if(animType==="flux_cos") {
        ctx.strokeStyle='#34495e'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.ellipse(0, 0, 60, 20, 0, 0, Math.PI*2); ctx.stroke();
        drawArrow(ctx, 0, 0, 0, -60, '#7f8c8d', '法線(垂直)', true);
        let B = 80; let angle = -Math.PI/6;
        let Bx = B*Math.sin(angle), By = -B*Math.cos(angle);
        drawArrow(ctx, 0, 0, Bx, By, '#2ecc71', 'B (磁場)');
        drawArrow(ctx, Bx, By, 0, By, '#e74c3c', 'B cosθ (貫く)', true);
    }
    else if(animType==="ac_gen") {
        let angle = time*2;
        drawCircle(ctx, -100, 0, 40, '#bdc3c7', false);
        drawArrow(ctx, -100, 0, -100+40*Math.cos(angle), 40*Math.sin(angle), '#3498db', 'コイル');
        drawArrow(ctx, -100+40*Math.cos(angle), 0, -100+40*Math.cos(angle), 40*Math.sin(angle), '#e74c3c', 'V0 sin(ωt)', true);
        drawCircle(ctx, 0, 40*Math.sin(angle), 8, '#e74c3c');
        ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=2;
        for(let i=0; i<150; i++) ctx.lineTo(i, 40*Math.sin(angle - i*0.05));
        ctx.stroke();
    }
    else {
        ctx.fillStyle='#bdc3c7'; ctx.font="20px Arial"; ctx.fillText("シミュレーションを選択してください", -150, 0);
        drawCircle(ctx, Math.cos(time*2)*40, Math.sin(time*2)*40, 10, '#3498db');
    }

    ctx.restore();
}

render();
