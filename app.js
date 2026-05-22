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
            if(idx === 0) card.click();
        });
        if (window.MathJax) MathJax.typesetPromise();
    };
    chapUl.appendChild(li);
});

setTimeout(() => {
    const firstChapter = document.querySelector('.chapter-list .item');
    if (firstChapter) firstChapter.click();
}, 100);

// --- 2D Canvas シミュレーションエンジン ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;

let scale = 1.0;
let panX = 0, panY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setAnimation(type) {
    animType = type;
    time = 0;
    scale = 1.0; panX = 0; panY = 0;
    document.getElementById('zoomSlider').value = 1.0;
    document.getElementById('zoomVal').innerText = "1.0x";
}

const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');
speedSlider.addEventListener('input', (e) => { speedVal.innerText = parseFloat(e.target.value).toFixed(2) + "x"; });

const zoomSlider = document.getElementById('zoomSlider');
const zoomVal = document.getElementById('zoomVal');
zoomSlider.addEventListener('input', (e) => { 
    scale = parseFloat(e.target.value); zoomVal.innerText = scale.toFixed(1) + "x"; 
});

document.getElementById('playBtn').onclick = () => {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生";
};
document.getElementById('resetBtn').onclick = () => { 
    time = 0; scale = 1.0; panX = 0; panY = 0;
    zoomSlider.value = 1.0; zoomVal.innerText = "1.0x";
};

canvas.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', (e) => {
    if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; }
});
window.addEventListener('mouseup', () => { isDragging = false; });
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    let zoomAmount = e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.max(0.5, Math.min(3.0, scale + zoomAmount));
    zoomSlider.value = scale; zoomVal.innerText = scale.toFixed(1) + "x";
}, { passive: false });

// === 描画ユーティリティ ===
function drawArrow(x1, y1, x2, y2, color, label="", isDashed=false) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
    if(isDashed) ctx.setLineDash([5,5]); else ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    if(x1===x2 && y1===y2) return;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(angle - Math.PI/6), y2 - 12 * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2 - 12 * Math.cos(angle + Math.PI/6), y2 - 12 * Math.sin(angle + Math.PI/6));
    ctx.fill();
    if(label) { 
        ctx.font="bold 15px Arial"; ctx.shadowColor="white"; ctx.shadowBlur=3;
        ctx.fillText(label, x2+8, y2+8); ctx.shadowBlur=0;
    }
}
function drawAngleMark(x, y, radius, angle1, angle2, label, color="#e67e22") {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, radius, angle1, angle2, false); ctx.closePath();
    ctx.fillStyle = "rgba(230, 126, 34, 0.2)"; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    let mid = (angle1 + angle2) / 2;
    ctx.fillStyle = color; ctx.font="bold 16px Arial";
    ctx.fillText(label, x + (radius+15)*Math.cos(mid) - 5, y + (radius+15)*Math.sin(mid) + 5);
}
function drawBlock(x, y, w, h, color) {
    ctx.fillStyle = color; ctx.fillRect(x - w/2, y - h/2, w, h);
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth=2; ctx.strokeRect(x - w/2, y - h/2, w, h);
}
function drawCircle(x, y, r, color, fill=true) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    if(fill) { ctx.fillStyle = color; ctx.fill(); }
    else { ctx.strokeStyle = color; ctx.lineWidth=2; ctx.stroke(); }
}
function drawSpring(x1, y1, x2, y2, coils) {
    ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1);
    const dx = (x2-x1)/coils, dy = (y2-y1)/coils;
    for(let i=0; i<coils; i++) {
        let cx = x1 + dx*(i+0.5), cy = y1 + dy*(i+0.5);
        ctx.lineTo(cx - dy*0.3, cy + dx*0.3); ctx.lineTo(cx + dy*0.3, cy - dx*0.3);
    }
    ctx.lineTo(x2, y2); ctx.stroke();
}

// === メインループ ===
function render() {
    requestAnimationFrame(render);
    
    let speedMult = parseFloat(speedSlider.value);
    if(isPlaying) time += 0.04 * speedMult;
    
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    ctx.translate(w/2 + panX, h/2 + panY);
    ctx.scale(scale, scale);

    ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
    for(let i=-1000; i<=1000; i+=20) {
        if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5';
        ctx.beginPath(); ctx.moveTo(i,-1000); ctx.lineTo(i,1000); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1000,i); ctx.lineTo(1000,i); ctx.stroke();
    }
    ctx.strokeStyle = '#b2bec3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-1000, 0); ctx.lineTo(1000, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -1000); ctx.lineTo(0, 1000); ctx.stroke();

    let t = time % 6; 
    ctx.fillStyle = 'black'; ctx.font="16px Arial";

    // ----------------------------------------------------
    // 力学
    // ----------------------------------------------------
    if(animType === "linear" || animType === "accel" || animType === "momentum" || animType === "equation" || animType === "impulse" || animType==="power") {
        ctx.fillStyle = '#95a5a6'; ctx.fillRect(-300, 40, 600, 5); 
        let startX = -200; let v0 = 50; let a = animType==="linear"||animType==="momentum"? 0 : 20;
        let curX = startX + v0*t + 0.5*a*t*t; let curV = v0 + a*t;
        if(curX > 250) time = 0;
        
        drawBlock(curX, 20, 50, 40, '#3498db');
        if(animType !== "equation") drawArrow(curX, -10, curX + curV, -10, '#2980b9', 'v');
        if(a > 0) drawArrow(curX, -30, curX + a*3, -30, '#27ae60', 'a');
        if(a > 0 || animType==="impulse" || animType==="power") drawArrow(curX-80, 20, curX-30, 20, '#e74c3c', 'F');
    }
    else if(animType === "work_cos") {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-200, 40, 400, 5);
        let x = -100 + t*30; if(x > 150) time=0;
        drawBlock(x, 20, 50, 40, '#3498db');
        let F = 100; let angle = -Math.PI/6;
        let Fx = F * Math.cos(angle); let Fy = F * Math.sin(angle);
        drawArrow(x, 0, x+F*Math.cos(angle), F*Math.sin(angle), '#95a5a6', 'F');
        drawAngleMark(x, 0, 40, angle, 0, "θ");
        drawArrow(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ (仕事)');
        drawArrow(x, 0, x, Fy, '#f1c40f', 'F sinθ', true); 
        ctx.beginPath(); ctx.moveTo(x, Fy); ctx.lineTo(x+Fx, Fy); ctx.lineTo(x+Fx, 0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
    }
    else if(animType.includes("fall") || animType === "throw") {
        let y = -100, v0 = animType==="fall_v0"? 40 : (animType==="throw"? -120 : 0); let g = 50;
        let curY = y + v0*t + 0.5*g*t*t;
        if(curY > 150 && t>0.5) time = 0;
        drawCircle(0, curY, 15, '#e74c3c');
        drawArrow(30, curY, 30, curY + (v0+g*t)*0.5, '#2980b9', 'v');
        drawArrow(-30, curY, -30, curY + g*0.8, '#27ae60', 'g');
    }
    else if(animType==="force_g" || animType.includes("friction") || animType==="pressure") {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
        drawBlock(0, 10, 60, 60, '#9b59b6');
        drawArrow(0, 10, 0, 80, '#e74c3c', 'mg');
        drawArrow(0, 10, 0, -60, '#2ecc71', 'N');
        if(animType.includes("friction")) {
            let pull = animType==="friction_s" ? (t*20) : 80; if(pull>80) time=0;
            drawArrow(0, 10, pull, 10, '#3498db', '引力');
            drawArrow(0, 40, -pull, 40, '#e67e22', animType==="friction_s"?'静止 f':'動 f\'');
        } else if(animType==="pressure") {
            for(let i=-20; i<=20; i+=10) drawArrow(i, -30, i, 10, '#e74c3c');
            ctx.fillText("圧力 P = F / 面積S", 50, -20);
        }
    }
    else if(animType==="buoyancy") {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)'; ctx.fillRect(-150, 0, 300, 150); 
        drawBlock(0, 60, 60, 60, '#f1c40f');
        drawArrow(0, 60, 0, 120, '#e74c3c', 'mg');
        drawArrow(-40, 30, -15, 30, '#2980b9'); drawArrow(40, 30, 15, 30, '#2980b9');
        drawArrow(-40, 90, -15, 90, '#2980b9'); drawArrow(40, 90, 15, 90, '#2980b9');
        drawArrow(0, 140, 0, 90, '#2980b9', '下面水圧'); drawArrow(0, -20, 0, 30, '#2980b9', '上面水圧');
        ctx.fillText("浮力 = 下面水圧 - 上面水圧", -100, -40);
    }
    else if(animType==="moment" || animType==="balance" || animType==="center_mass") {
        let angle = animType==="moment" ? Math.sin(time)*0.2 : 0;
        ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(-20, 80); ctx.lineTo(20, 80); ctx.fillStyle='#7f8c8d'; ctx.fill();
        ctx.translate(0, 30); ctx.rotate(angle);
        ctx.fillStyle = '#f39c12'; ctx.fillRect(-120, -5, 240, 10);
        drawBlock(-80, -20, 30, 30, '#3498db'); drawArrow(-80, -20, -80, 50, '#e74c3c', 'F1');
        if(animType!=="moment") { drawBlock(80, -25, 40, 40, '#e74c3c'); drawArrow(80, -25, 80, 70, '#e74c3c', 'F2'); }
    }
    else if(animType.includes("energy") || animType==="pendulum") {
        let angle = Math.sin(time*2)*0.8;
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, -100, 100, 10); 
        let px = 150*Math.sin(angle), py = -100 + 150*Math.cos(angle);
        ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(px, py); ctx.strokeStyle='#333'; ctx.stroke();
        drawCircle(px, py, 20, '#9b59b6');
        let K = (0.8 - Math.abs(angle))*100; let U = Math.abs(angle)*100;
        ctx.fillStyle='#2ecc71'; ctx.fillRect(-120, 100-K, 20, K); ctx.fillText("K (運動)", -130, 120);
        ctx.fillStyle='#e67e22'; ctx.fillRect(-70, 100-U, 20, U); ctx.fillText("U (位置)", -80, 120);
    }
    else if(animType==="s_energy" || animType==="spring" || animType==="harmonic_f") {
        let x = Math.sin(time*3)*80;
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-150, -40, 10, 80); 
        drawSpring(-140, 0, x-20, 0, 10);
        drawBlock(x, 0, 40, 40, '#2ecc71');
        if(animType==="s_energy") {
            let U = 0.5 * 1 * (x*x) * 0.015; 
            ctx.fillStyle='#e67e22'; ctx.fillRect(-100, 100-U, 20, U); ctx.fillText("弾性エネルギー", -130, 120);
        } else { drawArrow(x, -30, x - x, -30, '#e74c3c', 'F = -kx'); }
    }
    else if(animType==="collision" || animType==="bounce") {
        let t2 = time%3;
        if(animType==="collision") {
            let x1 = t2<1.5 ? -100 + t2*60 : -10; let x2 = t2<1.5 ? -10 : -10 + (t2-1.5)*60;
            drawCircle(x1, 0, 20, '#3498db'); drawArrow(x1, -30, x1+(t2<1.5?40:0), -30, '#2980b9');
            drawCircle(x2, 0, 20, '#e74c3c'); drawArrow(x2, -30, x2+(t2>=1.5?40:0), -30, '#2980b9');
        } else {
            let by = 80 - Math.abs(Math.cos(time*3)*80)*Math.exp(-time*0.2); 
            drawCircle(0, by, 15, '#1abc9c'); ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, 95, 100, 5);
        }
    }
    else if(animType.includes("circular") || animType==="centrifugal" || animType==="kepler" || animType==="gravity" || animType==="orbit_u" || animType==="escape") {
        let a = 120, b = 120; if(animType==="kepler") { a=150; b=90; } 
        ctx.beginPath(); ctx.ellipse(0, 0, a, b, 0, 0, Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
        let fx = animType==="kepler" ? 50 : 0;
        drawCircle(fx, 0, animType.includes("circular")?5:20, animType.includes("circular")?'#f1c40f':'#e74c3c');
        let angle = animType==="kepler" ? time*1.0 + 0.5*Math.sin(time*1.0) : time*1.5; 
        let px = a*Math.cos(angle), py = b*Math.sin(angle);
        drawCircle(px, py, 12, '#3498db');
        if(animType==="circular_v") drawArrow(px, py, px - 50*Math.sin(angle), py + 50*Math.cos(angle), '#2980b9', 'v');
        if(animType==="circular_a" || animType==="circular_f" || animType==="gravity") drawArrow(px, py, px + (fx-px)*0.4, py + (0-py)*0.4, animType==="circular_a"?'#27ae60':'#e74c3c', animType==="circular_a"?'a':'F');
        if(animType==="centrifugal") drawArrow(px, py, px*1.5, py*1.5, '#e67e22', 'f (遠心力)');
        if(animType==="kepler") { 
            ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(px, py); ctx.lineTo(a*Math.cos(angle-0.4), b*Math.sin(angle-0.4)); ctx.fillStyle='rgba(52, 152, 219, 0.4)'; ctx.fill(); 
        }
    }
    else if(animType.includes("harmonic_sin") || animType.includes("harmonic_v") || animType.includes("harmonic_a")) {
        let R = 80; let omega = 1.5; let angle = time * omega;
        let px = R*Math.cos(angle), py = R*Math.sin(angle); 
        drawCircle(-150, 0, R, '#bdc3c7', false);
        drawArrow(-150, 0, -150+px, py, '#7f8c8d', 'A'); 
        drawAngleMark(-150, 0, 30, 0, angle, "ωt", "#2980b9");
        drawArrow(-150+px, 0, -150+px, py, '#e74c3c', 'A sin(ωt)', true); 
        ctx.beginPath(); ctx.moveTo(-150+px, py); ctx.lineTo(50, py); ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        drawCircle(50, py, 15, '#2ecc71');
        ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.6)'; ctx.lineWidth=2;
        for(let i=0; i<150; i++) ctx.lineTo(50 + i, R*Math.sin(angle - i*0.05)); ctx.stroke();
        if(animType==="harmonic_v") drawArrow(70, py, 70, py + R*omega*Math.cos(angle)*0.5, '#2980b9', 'v');
        if(animType==="harmonic_a") drawArrow(90, py, 90, py - R*omega*omega*Math.sin(angle)*0.3, '#27ae60', 'a');
    }

    // ----------------------------------------------------
    // 熱力学
    // ----------------------------------------------------
    else if(animType.includes("thermo") || animType.includes("gas") || animType.includes("boyle") || animType.includes("piston") || animType.includes("engine") || animType.includes("temp") || animType.includes("heat")) {
        let pw = (animType.includes("boyle") || animType.includes("piston") || animType==="molar") ? 80 + Math.sin(time*2)*40 : 120; 
        ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100, -80, pw+100, 160);
        ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4; ctx.strokeRect(-100, -80, pw+100, 160);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(pw, -80, 15, 160); // ピストン
        if(animType.includes("piston") && Math.sin(time*2)>0) drawArrow(pw+20, 0, pw+60, 0, '#e74c3c', 'W(仕事)');
        
        let tempSpeed = animType.includes("temp")||animType==="heat" ? 1 + (time%4) : 2; 
        ctx.fillStyle = animType==="heat_mix" ? ((time%4)<2?'#e74c3c':'#8e44ad') : `rgb(${tempSpeed*50}, 50, 200)`;
        Math.seedrandom = 1; 
        for(let i=1; i<=50; i++) {
            let px = -100 + Math.abs(Math.sin(i*123 + time*tempSpeed*(1+i%2))) * (pw+100);
            let py = -80 + Math.abs(Math.cos(i*321 + time*tempSpeed*(1+i%3))) * 160;
            drawCircle(px, py, 4, ctx.fillStyle);
        }
        ctx.fillStyle = 'white'; ctx.fillRect(-130, -50, 10, 100); ctx.strokeRect(-130, -50, 10, 100); // 温度計
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(-128, 50 - tempSpeed*15, 6, tempSpeed*15); drawCircle(-125, 50, 12, '#e74c3c');
    }
    
    // ----------------------------------------------------
    // 波動
    // ----------------------------------------------------
    else if(animType.includes("wave") || animType==="sound" || animType==="beat" || animType==="standing") {
        ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(250, 0); ctx.strokeStyle='#bdc3c7'; ctx.lineWidth=1; ctx.stroke(); 
        ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
        if(animType==="standing") {
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(time*3)*Math.cos(x*0.05)*60); ctx.stroke();
            for(let x=-250; x<=250; x+=Math.PI/0.05) drawCircle(x, 0, 5, '#e74c3c'); // 節
            ctx.fillText("定常波 (節は全く動かない)", -80, -80);
        } else if(animType==="beat") {
            ctx.strokeStyle='rgba(52, 152, 219, 0.5)'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.1 - time*3)*30); ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='rgba(231, 76, 60, 0.5)'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.11 - time*3.3)*30); ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='#9b59b6'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.1 - time*3)*30 + Math.sin(x*0.11 - time*3.3)*30); ctx.stroke();
            ctx.fillText("うなり (赤と青が重なり紫の合成波に)", -100, -80);
        } else {
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(x*0.04 - time*3)*60); ctx.stroke();
            drawCircle(0, Math.sin(0 - time*3)*60, 10, '#e74c3c');
            drawArrow(20, Math.sin(0 - time*3)*60, 20, Math.sin(0 - time*3)*60 + Math.cos(0 - time*3)*30, '#e74c3c', 'v(媒質)');
        }
    }
    else if(animType==="doppler") {
        let srcX = -100 + (t*30); drawCircle(srcX, 0, 8, '#e74c3c'); ctx.fillText("音源 (vs)", srcX-20, -15);
        for(let i=0; i<10; i++) {
            let eTime = t - i*0.5;
            if(eTime>0) drawCircle(-100 + (t-eTime)*30, 0, eTime*40, 'rgba(52, 152, 219, 0.5)', false);
        }
    }
    else if(animType==="lens") {
        ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, 100); ctx.strokeStyle='#3498db'; ctx.lineWidth=4; ctx.stroke(); 
        ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(200, 0); ctx.lineWidth=1; ctx.stroke(); 
        drawCircle(60, 0, 3, '#e74c3c'); drawCircle(-60, 0, 3, '#e74c3c'); ctx.fillText("f", 65, 15); 
        let a = 120; let objH = 40; drawArrow(-a, 0, -a, -objH, '#2ecc71', '物体');
        let b = 1 / (1/60 - 1/a); let imgH = objH * (b/a); drawArrow(b, 0, b, imgH, '#e74c3c', '実像');
        ctx.beginPath(); ctx.moveTo(-a, -objH); ctx.lineTo(0, -objH); ctx.lineTo(b, imgH); ctx.strokeStyle='rgba(241, 196, 15, 0.8)'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-a, -objH); ctx.lineTo(0, 0); ctx.lineTo(b, imgH); ctx.stroke();
    }
    else if(animType==="young" || animType==="diffraction") {
        ctx.fillStyle='#34495e'; ctx.fillRect(-100, -100, 5, 200); 
        ctx.fillStyle='white'; ctx.fillRect(-105, -30, 15, 5); ctx.fillRect(-105, 30, 15, 5); 
        if(animType==="diffraction") { ctx.fillRect(-105, 0, 15, 5); ctx.fillRect(-105, 60, 15, 5); ctx.fillRect(-105, -60, 15, 5); }
        ctx.fillRect(100, -100, 5, 200); 
        let m = Math.floor(Math.sin(time)*3); let y = m * 30;
        ctx.beginPath(); ctx.moveTo(-100, -30); ctx.lineTo(100, y); ctx.strokeStyle='rgba(241, 196, 15, 0.5)'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-100, 30); ctx.lineTo(100, y); ctx.stroke();
        drawCircle(100, y, 10, '#e74c3c'); ctx.fillText("明線 (強め合う)", 115, y+5);
    }
    else if(animType==="film") {
        ctx.fillStyle='rgba(52, 152, 219, 0.3)'; ctx.fillRect(-150, -40, 300, 80); 
        ctx.beginPath(); ctx.moveTo(-100, -100); ctx.lineTo(-40, -40); ctx.lineTo(20, 100); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2; ctx.stroke(); 
        ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(20, -100); ctx.stroke(); ctx.fillText("表面反射", 30, -100);
        ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(60, -20); ctx.stroke(); ctx.fillText("裏面反射", 70, -20);
        ctx.fillText("経路差による干渉（虹色）", -80, -120);
    }
    else if(animType.includes("refract") || animType==="reflect_all") {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)'; ctx.fillRect(-250, 0, 500, 200); 
        ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(250, 0); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke(); 
        drawArrow(0, -150, 0, 150, '#bdc3c7', '法線', true); 
        
        let angleI = animType==="reflect_all"? Math.PI/2.5 : Math.PI/4; 
        let angleR = animType==="reflect_all"? Math.PI/1.5 : Math.PI/8; 
        let R = 120;
        let ix = -R*Math.sin(angleI), iy = -R*Math.cos(angleI);
        let rx = R*Math.sin(angleR), ry = R*Math.cos(angleR);
        
        drawArrow(ix, iy, 0, 0, '#f1c40f', '入射光');
        if(animType==="reflect_all") { drawArrow(0, 0, -ix, iy, '#f1c40f', '全反射'); }
        else { drawArrow(0, 0, rx, ry, '#f1c40f', '屈折光'); }
        
        if(animType==="refract_sin") {
            drawAngleMark(0, 0, 40, -Math.PI/2, -Math.PI/2 + angleI, "i", "#e74c3c");
            drawAngleMark(0, 0, 60, Math.PI/2 - angleR, Math.PI/2, "r", "#2980b9");
            drawArrow(ix, iy, 0, iy, '#e74c3c', 'sin i', true); drawArrow(rx, ry, 0, ry, '#2980b9', 'sin r', true);
            ctx.beginPath(); ctx.moveTo(0, iy); ctx.lineTo(ix, iy); ctx.lineTo(ix, 0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(rx, ry); ctx.lineTo(rx, 0); ctx.stroke(); ctx.setLineDash([]);
        }
    }

    // ----------------------------------------------------
    // 電磁気
    // ----------------------------------------------------
    else if(animType.includes("efield") || animType==="coulomb" || animType==="potential") {
        if(animType==="efield_uniform") {
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-120, -80, 240, 15); ctx.fillStyle='white'; ctx.fillText("+++++", -20, -70);
            ctx.fillStyle='#3498db'; ctx.fillRect(-120, 80, 240, 15); ctx.fillStyle='white'; ctx.fillText("-----", -15, 92);
            for(let i=-90; i<=90; i+=30) drawArrow(i, -60, i, 70, '#e74c3c', i===90?'E(電場)':"");
            drawCircle(0, -60 + (t*30)%120, 8, '#f1c40f'); 
        } else {
            drawCircle(0, 0, 25, '#e74c3c'); ctx.fillStyle='white'; ctx.font="24px Arial"; ctx.fillText("+", -7, 8);
            for(let i=0; i<8; i++) {
                let angle = (Math.PI/4)*i;
                drawArrow(35*Math.cos(angle), 35*Math.sin(angle), 120*Math.cos(angle), 120*Math.sin(angle), '#e74c3c');
            }
            if(animType==="potential") { 
                for(let r=50; r<=150; r+=30) drawCircle(0, 0, r, 'rgba(231,76,60,0.3)', false);
                ctx.fillStyle='black'; ctx.fillText("赤い円: 等電位線", 80, -80);
            }
        }
    }
    else if(animType.includes("capacitor") || animType==="cap_energy" || animType==="cap_circuit") {
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-80, -40, 160, 10);
        ctx.fillStyle='#3498db'; ctx.fillRect(-80, 40, 160, 10);
        let q = Math.abs(Math.sin(time*2));
        for(let i=0; i<10*q; i++) drawArrow(-60+15*i, -30, -60+15*i, 40, 'rgba(231, 76, 60, 0.5)'); 
        
        if(animType==="cap_energy") {
            ctx.beginPath(); ctx.moveTo(100, 50); ctx.lineTo(100, -50); ctx.lineTo(180, 50); ctx.closePath();
            ctx.fillStyle='rgba(46, 204, 113, 0.5)'; ctx.fill(); ctx.stroke();
            ctx.fillStyle='black'; ctx.fillText("Q-Vグラフの面積 = エネルギー", 80, 70);
        } else if(animType==="cap_circuit") {
            ctx.fillText("直列や並列の回路網を計算します", -120, -70);
        }
    }
    else if(animType==="current" || animType==="resistance" || animType==="joule" || animType==="kirchhoff") {
        ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.strokeRect(-120, -60, 240, 120); // 回路
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-10, 50, 20, 20); ctx.fillStyle='white'; ctx.fillText("V", -5, 65); // 電池
        ctx.fillStyle='#95a5a6'; ctx.fillRect(-30, -70, 60, 20); ctx.fillStyle='black'; ctx.fillText("R", -5, -85); // 抵抗
        let ex = -120 + (time*60)%240; drawCircle(ex, -60, 5, '#f1c40f'); // 動く電子
        if(animType==="joule") { drawCircle(0, -60, 20, 'rgba(231,76,60,0.5)'); ctx.fillText("発熱", 35, -55); }
    }
    else if(animType==="mag_field" || animType==="mag_flux") {
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-5, -120, 10, 240); 
        drawArrow(0, 100, 0, -100, '#3498db', 'I');
        for(let r=30; r<=90; r+=30) drawCircle(0, 0, r, '#2ecc71', false); 
        ctx.fillStyle='black'; ctx.fillText("磁力線 (右ねじ)", 40, -40);
    }
    else if(animType==="lorentz_sin") {
        for(let y=-80; y<=80; y+=40) drawArrow(-150, y, 150, y, '#2ecc71');
        ctx.fillStyle='#2ecc71'; ctx.fillText("磁場 B", 120, -90);
        let v = 100; let angle = -Math.PI/6;
        let vx = v*Math.cos(angle), vy = v*Math.sin(angle);
        drawCircle(0, 0, 12, '#f1c40f'); ctx.fillStyle='black'; ctx.fillText("-e", -8, 4);
        drawArrow(0, 0, vx, vy, '#3498db', 'v (速度)'); drawAngleMark(0, 0, 40, angle, 0, "θ");
        drawArrow(0, 0, 0, vy, '#e74c3c', 'v sinθ (力を受ける)', true); drawArrow(0, 0, vx, 0, '#95a5a6', 'v cosθ (力0)', true);
        ctx.beginPath(); ctx.moveTo(0,vy); ctx.lineTo(vx,vy); ctx.lineTo(vx,0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
    }
    else if(animType==="lorentz_r" || animType==="lorentz") {
        for(let i=-60; i<=60; i+=30) { ctx.fillStyle='#2ecc71'; ctx.fillText("x", i, 0); } 
        let lx = 50*Math.cos(time*3), ly = 50*Math.sin(time*3);
        drawCircle(lx, ly, 8, '#f1c40f'); 
        drawArrow(lx, ly, lx-20*Math.sin(time*3), ly+20*Math.cos(time*3), '#2980b9', 'v');
        drawArrow(lx, ly, lx*0.5, ly*0.5, '#e74c3c', 'F');
    }
    else if(animType==="ampere" || animType==="rod") {
        ctx.fillStyle='#f39c12'; ctx.fillRect(-80, -5, 160, 10); 
        for(let i=-60; i<=60; i+=30) drawArrow(i, -40, i, 40, '#2ecc71'); 
        drawArrow(0, 0, 0, -30, '#e74c3c', 'F'); 
    }
    else if(animType==="flux_cos" || animType==="flux") {
        ctx.beginPath(); ctx.ellipse(0, 0, 100, 30, 0, 0, Math.PI*2); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke(); 
        ctx.fillStyle='rgba(52, 73, 94, 0.1)'; ctx.fill();
        drawArrow(0, 0, 0, -120, '#7f8c8d', '面の法線 (垂直)', true);
        let B = 140; let angle = -Math.PI/4;
        let Bx = B*Math.sin(angle), By = -B*Math.cos(angle);
        drawArrow(0, 0, Bx, By, '#2ecc71', '磁場 B'); drawAngleMark(0, 0, 40, -Math.PI/2, angle - Math.PI/2, "θ");
        drawArrow(0, 0, 0, By, '#e74c3c', 'B cosθ (貫く)', true); drawArrow(0, By, Bx, By, '#95a5a6', 'B sinθ (貫かない)', true);
    }
    else if(animType==="induction" || animType==="self_ind") {
        ctx.strokeStyle='#8e44ad'; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(0,0, 40, 0, Math.PI, true); ctx.stroke(); 
        let my = -80 + Math.abs(Math.sin(time*2))*60;
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-15, my, 30, 40); ctx.fillStyle='white'; ctx.fillText("N", -5, my+25); 
        drawArrow(0, my+40, 0, my+80, '#2ecc71', 'B'); 
        ctx.fillStyle='black'; ctx.fillText(animType==="induction"?"電磁誘導":"自己誘導 (変化を嫌がる)", 60, 0);
    }
    else if(animType.includes("ac_gen") || animType==="ac") {
        let R = 60; let omega = 2; let angle = time * omega;
        drawCircle(-150, 0, R, '#bdc3c7', false);
        drawArrow(-150, 0, -150+R*Math.cos(angle), R*Math.sin(angle), '#3498db', 'コイルの回転'); drawAngleMark(-150, 0, 25, 0, angle, "ωt");
        drawArrow(-150+R*Math.cos(angle), 0, -150+R*Math.cos(angle), R*Math.sin(angle), '#e74c3c', 'V0 sin(ωt)', true);
        ctx.beginPath(); ctx.moveTo(-150+R*Math.cos(angle), R*Math.sin(angle)); ctx.lineTo(0, R*Math.sin(angle)); 
        ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        drawCircle(0, R*Math.sin(angle), 8, '#e74c3c');
        ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=3;
        for(let i=0; i<200; i++) ctx.lineTo(i, R*Math.sin(angle - i*0.05)); ctx.stroke();
    }
    else if(animType==="reactance" || animType==="impedance" || animType==="resonance") {
        let w = time*2;
        drawArrow(0, 0, 80*Math.cos(w), 80*Math.sin(w), '#e74c3c', 'V');
        let phase = animType==="reactance" ? Math.PI/2 : (animType==="resonance"? 0 : Math.PI/4);
        drawArrow(0, 0, 60*Math.cos(w - phase), 60*Math.sin(w - phase), '#3498db', 'I');
        ctx.fillStyle='black'; ctx.fillText("電圧と電流の位相のズレ（ベクトル図）", -100, 120);
    }
    // ----------------------------------------------------
    // 原子
    // ----------------------------------------------------
    else if(animType==="stop_v" || animType==="photoelectric" || animType==="xray" || animType==="photon") {
        ctx.fillStyle='#95a5a6'; ctx.fillRect(-100, -50, 20, 100); ctx.fillRect(80, -50, 20, 100);
        let pt = time%2;
        if(animType==="xray") {
            drawCircle(-80+pt*160, 0, 5, '#3498db'); 
            if(pt>0.9) { drawCircle(80, 0, 20, 'rgba(241, 196, 15, 0.5)', false); ctx.fillStyle='black'; ctx.fillText("X線", 100, -20); }
        } else {
            if(pt<0.5) { drawCircle(-150+pt*100, 0, 5, '#f1c40f'); } // 光
            else {
                let ex = -80 + (pt-0.5)*200;
                if(animType==="stop_v") {
                    ex = -80 + Math.sin((pt-0.5)*Math.PI)*150; // 引き返す
                    for(let y=-40; y<=40; y+=20) drawArrow(80, y, -80, y, 'rgba(231,76,60,0.3)'); 
                }
                drawCircle(ex, 0, 5, '#3498db');
            }
        }
    }
    else if(animType==="matter_wave") {
        let x = -150 + (time%3)*100;
        drawCircle(x, 0, 8, '#3498db');
        ctx.beginPath(); ctx.strokeStyle='rgba(52, 152, 219, 0.5)'; ctx.lineWidth=2;
        for(let i=0; i<100; i++) ctx.lineTo(x - i*2, Math.sin(i*0.2 - time*5)*20);
        ctx.stroke(); ctx.fillStyle='black'; ctx.fillText("粒子でもあり、波でもある", -100, 50);
    }
    else if(animType.includes("bohr") || animType==="energy_level") {
        drawCircle(0, 0, 20, '#e74c3c'); ctx.fillStyle='white'; ctx.fillText("+", -5, 5); 
        drawCircle(0, 0, 60, '#bdc3c7', false); ctx.fillStyle='#bdc3c7'; ctx.fillText("n=1", 65, 0);
        drawCircle(0, 0, 120, '#bdc3c7', false); ctx.fillText("n=2", 125, 0);
        let orbit = (Math.floor(time) % 2 === 0) ? 120 : 60; 
        let ex = orbit*Math.cos(time*3), ey = orbit*Math.sin(time*3);
        drawCircle(ex, ey, 10, '#3498db'); ctx.fillStyle='white'; ctx.fillText("-", ex-3, ey+3);
        if(orbit === 60 && (time%1)<0.3) {
            ctx.beginPath(); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2;
            for(let i=0; i<50; i++) ctx.lineTo(ex + i*3, ey + Math.sin(i*0.5)*10);
            ctx.stroke(); ctx.fillStyle='black'; ctx.fillText("hν (光子放出)", ex+150, ey);
        }
    }
    else if(animType==="mass_defect" || animType==="mc2" || animType==="decay" || animType==="nuclear") {
        let t2 = time%4;
        if(t2<2) { 
            drawCircle(-60, -20, 15, '#e74c3c'); drawCircle(-40, 10, 15, '#e74c3c');
            drawCircle(-20, -10, 15, '#3498db'); drawCircle(-80, 0, 15, '#3498db');
            ctx.fillStyle='black'; ctx.fillText("部品の合計質量", -100, 50);
        } else { 
            drawCircle(60, -10, 15, '#e74c3c'); drawCircle(45, 5, 15, '#e74c3c');
            drawCircle(55, 15, 15, '#3498db'); drawCircle(75, 0, 15, '#3498db');
            if(animType==="decay") { drawArrow(90, 0, 150, 0, '#f1c40f', '放射線'); }
            else { ctx.fillStyle='black'; ctx.fillText("結合後の質量 (少し軽い!)", 20, 50); ctx.fillText("Δmc² のエネルギー放出", 20, 70); }
        }
    }
    else if(animType==="half_life") {
        let hl = Math.floor(time);
        let count = 64 / Math.pow(2, hl);
        for(let i=0; i<64; i++) {
            let cx = -100 + (i%8)*20; let cy = -80 + Math.floor(i/8)*20;
            drawCircle(cx, cy, 8, i<count ? '#e74c3c' : '#bdc3c7');
        }
        ctx.fillStyle='black'; ctx.fillText(`経過: ${hl} 半減期`, 80, -20);
    }
    
    ctx.restore();
}

render();
