// ==========================================
// 高校物理 高精度2Dシミュレーションエンジン (全公式網羅版)
// ==========================================

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

// --- 2D Canvas シミュレーション設定 ---
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
    animType = type; time = 0;
    scale = 1.0; panX = 0; panY = 0;
    document.getElementById('zoomSlider').value = 1.0;
    document.getElementById('zoomVal').innerText = "1.0x";
}

// UIイベント
const speedSlider = document.getElementById('speedSlider');
const speedVal = document.getElementById('speedVal');
speedSlider.addEventListener('input', (e) => { speedVal.innerText = parseFloat(e.target.value).toFixed(2) + "x"; });

const zoomSlider = document.getElementById('zoomSlider');
const zoomVal = document.getElementById('zoomVal');
zoomSlider.addEventListener('input', (e) => { 
    scale = parseFloat(e.target.value); zoomVal.innerText = scale.toFixed(1) + "x"; 
});

document.getElementById('playBtn').onclick = () => {
    isPlaying = !isPlaying; document.getElementById('playBtn').innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生";
};
document.getElementById('resetBtn').onclick = () => { 
    time = 0; scale = 1.0; panX = 0; panY = 0; zoomSlider.value = 1.0; zoomVal.innerText = "1.0x";
};

// マウス操作
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

// === 描画ヘルパー関数 ===
function dA(x1, y1, x2, y2, color, label="", dashed=false) { // drawArrow
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    if(dashed) ctx.setLineDash([5,5]); else ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    if(x1===x2 && y1===y2) return;
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(a - 0.5), y2 - 10 * Math.sin(a - 0.5));
    ctx.lineTo(x2 - 10 * Math.cos(a + 0.5), y2 - 10 * Math.sin(a + 0.5)); ctx.fill();
    if(label) { ctx.font="bold 14px Arial"; ctx.fillText(label, x2+5, y2+5); }
}
function dC(x, y, r, color, fill=true) { // drawCircle
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    if(fill) { ctx.fillStyle = color; ctx.fill(); } else { ctx.strokeStyle = color; ctx.lineWidth=2; ctx.stroke(); }
}
function dB(x, y, w, h, color) { // drawBlock
    ctx.fillStyle = color; ctx.fillRect(x - w/2, y - h/2, w, h);
    ctx.strokeStyle = '#2c3e50'; ctx.lineWidth=2; ctx.strokeRect(x - w/2, y - h/2, w, h);
}
function dAng(x, y, r, a1, a2, label, color) { // drawAngle
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a1, a2, false); ctx.closePath();
    ctx.fillStyle = color+"33"; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth=1; ctx.stroke();
    let m = (a1+a2)/2; ctx.fillStyle=color; ctx.font="bold 14px Arial";
    ctx.fillText(label, x + (r+10)*Math.cos(m) - 5, y + (r+10)*Math.sin(m) + 5);
}
function dTxt(text, x, y, color="black", font="14px Arial") {
    ctx.fillStyle = color; ctx.font = font; ctx.fillText(text, x, y);
}

// === メインループ ===
function render() {
    requestAnimationFrame(render);
    if(isPlaying) time += 0.04 * parseFloat(speedSlider.value);
    
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    ctx.translate(w/2 + panX, h/2 + panY); ctx.scale(scale, scale);

    // 背景グリッド
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
    let t_short = time % 3;

    // ----------------------------------------------------
    // 【力学】 運動・力・エネルギー
    // ----------------------------------------------------
    if (["linear","accel","equation","power","momentum","impulse"].includes(animType)) {
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-300, 40, 600, 5); // 地面
        let a = animType==="linear"||animType==="momentum" ? 0 : 20;
        let v0 = 40; let x = -200 + v0*t + 0.5*a*t*t; let v = v0 + a*t;
        if(x > 250) time = 0;
        dB(x, 20, 50, 40, '#3498db');
        if(animType !== "equation") dA(x, -10, x + v, -10, '#2980b9', 'v');
        if(a > 0) dA(x, -30, x + a*3, -30, '#27ae60', 'a');
        if(a > 0 || animType==="impulse" || animType==="power") dA(x-80, 20, x-30, 20, '#e74c3c', 'F');
        
        // グラフ
        ctx.fillStyle="white"; ctx.fillRect(-280,-180,120,100); ctx.strokeRect(-280,-180,120,100);
        dTxt(a>0?"v-t グラフ":"x-t グラフ", -270,-160);
        ctx.beginPath(); ctx.strokeStyle='#e74c3c';
        for(let i=0; i<t; i+=0.1) ctx.lineTo(-270+i*15, -80 - (a>0?(v0+a*i)*0.5 : v0*i*0.2));
        ctx.stroke();
    }
    else if (animType === "work_cos") {
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
        let x = -100 + t*30; if(x > 150) time=0;
        dB(x, 20, 50, 40, '#3498db');
        let F = 100, angle = -Math.PI/6;
        let Fx = F * Math.cos(angle), Fy = F * Math.sin(angle);
        dA(x, 0, x+Fx, Fy, '#7f8c8d', 'F (引く力)');
        dAng(x, 0, 40, angle, 0, "θ", "#e67e22");
        dA(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ (仕事する)');
        dA(x, 0, x, Fy, '#f1c40f', 'F sinθ', true);
        ctx.beginPath(); ctx.moveTo(x, Fy); ctx.lineTo(x+Fx, Fy); ctx.lineTo(x+Fx, 0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
    }
    else if (["fall","fall_v0","throw"].includes(animType)) {
        let y = -100, v0 = 0, g = 50;
        if(animType==="fall_v0") v0 = 40;
        if(animType==="throw") { y = 100; v0 = -130; }
        let cy = y + v0*t + 0.5*g*t*t;
        if(cy > 150 && t>0.5) time=0;
        dC(0, cy, 15, '#e74c3c');
        dA(30, cy, 30, cy+(v0+g*t)*0.5, '#2980b9', 'v');
        dA(-30, cy, -30, cy+g*0.8, '#27ae60', 'g');
    }
    else if (["force_g","spring","friction_s","friction_d","pressure"].includes(animType)) {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
        dB(0, 10, 60, 60, '#9b59b6');
        dA(0, 10, 0, 80, '#e74c3c', 'mg');
        dA(0, 10, 0, -60, '#2ecc71', 'N (垂直抗力)');
        if(animType.includes("friction")) {
            let p = animType==="friction_s" ? (t*20) : 80; if(p>80) time=0;
            dA(0, 10, p, 10, '#3498db', '引力');
            dA(0, 40, -p, 40, '#e67e22', animType==="friction_s"?'静止摩擦 f':'動摩擦 f\'');
            if(animType==="friction_d") dA(0,-30,40,-30,'#2980b9','v');
        } else if(animType==="spring") {
            let sx = Math.sin(time*3)*60;
            ctx.fillRect(-120, -40, 10, 80);
            ctx.beginPath(); ctx.moveTo(-110,10); ctx.lineTo(sx-30,10); ctx.strokeStyle='#7f8c8d'; ctx.stroke(); // ばね略記
            dB(sx, 10, 60, 60, '#9b59b6');
            dA(sx, 10, sx - sx, 10, '#e74c3c', 'F=-kx');
        } else if(animType==="pressure") {
            for(let i=-20; i<=20; i+=10) dA(i, -30, i, 10, '#e74c3c');
            dTxt("圧力 P = F/S", 50, -20);
        }
    }
    else if (animType === "buoyancy") {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)'; ctx.fillRect(-100, 0, 200, 150);
        dB(0, 60, 60, 60, '#f1c40f');
        dA(0, 60, 0, 120, '#e74c3c', 'mg');
        dA(-40, 30, -20, 30, '#2980b9'); dA(40, 30, 20, 30, '#2980b9');
        dA(-40, 90, -20, 90, '#2980b9'); dA(40, 90, 20, 90, '#2980b9');
        dA(0, 140, 0, 90, '#2980b9', '下面水圧'); dA(0, -20, 0, 30, '#2980b9', '上面水圧');
        dTxt("浮力 = 下面水圧 - 上面水圧", -100, -30);
    }
    else if (["moment","balance","center_mass"].includes(animType)) {
        let a = animType==="moment"? Math.sin(time)*0.2 : 0;
        ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(-20,80); ctx.lineTo(20,80); ctx.fillStyle='#7f8c8d'; ctx.fill();
        ctx.translate(0,30); ctx.rotate(a);
        ctx.fillStyle='#f39c12'; ctx.fillRect(-120,-5,240,10);
        dB(-80,-20,30,30,'#3498db'); dA(-80,-20,-80,50,'#e74c3c','F1');
        if(animType!=="moment"){ dB(80,-25,40,40,'#e74c3c'); dA(80,-25,80,70,'#e74c3c','F2'); }
    }
    else if (["k_energy","p_energy","s_energy","pendulum"].includes(animType)) {
        let a = Math.sin(time*2)*0.8;
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50,-100,100,10);
        let px = 150*Math.sin(a), py = -100+150*Math.cos(a);
        ctx.beginPath(); ctx.moveTo(0,-100); ctx.lineTo(px,py); ctx.strokeStyle='#333'; ctx.stroke();
        dC(px, py, 20, '#9b59b6');
        let K = (0.8 - Math.abs(a))*100, U = Math.abs(a)*100;
        ctx.fillStyle='#2ecc71'; ctx.fillRect(-120, 100-K, 20, K); dTxt("K", -120, 120);
        ctx.fillStyle='#e67e22'; ctx.fillRect(-70, 100-U, 20, U); dTxt("U", -70, 120);
    }
    else if (["collision","bounce"].includes(animType)) {
        if(animType==="collision") {
            let x1 = t_short<1.5 ? -100+t_short*60 : -10; let x2 = t_short<1.5 ? -10 : -10+(t_short-1.5)*60;
            dC(x1, 0, 20, '#3498db'); dA(x1, -30, x1+(t_short<1.5?40:0), -30, '#2980b9');
            dC(x2, 0, 20, '#e74c3c'); dA(x2, -30, x2+(t_short>=1.5?40:0), -30, '#2980b9');
        } else {
            let by = 80 - Math.abs(Math.cos(time*3)*80)*Math.exp(-time*0.2);
            dC(0, by, 15, '#1abc9c'); ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, 95, 100, 5);
        }
    }
    else if (animType.startsWith("circular") || animType==="centrifugal") {
        let r = 80; dC(0,0,r,'#bdc3c7',false); dC(0,0,5,'#f1c40f');
        let bx = r*Math.cos(time*2), by = r*Math.sin(time*2);
        dC(bx, by, 15, '#3498db');
        if(animType==="circular_v") dA(bx, by, bx-40*Math.sin(time*2), by+40*Math.cos(time*2), '#2980b9', 'v');
        if(animType==="circular_a"||animType==="circular_f") dA(bx, by, bx*0.4, by*0.4, animType==="circular_a"?'#27ae60':'#e74c3c', animType==="circular_a"?'a':'F');
        if(animType==="centrifugal") dA(bx, by, bx*1.6, by*1.6, '#e67e22', 'f(遠心力)');
    }
    else if (animType.startsWith("harmonic") || animType==="pendulum_t") {
        let R = 80, o = 1.5, a = time*o;
        let px = R*Math.cos(a), py = R*Math.sin(a);
        if(animType==="harmonic_sin") { // sin成分分解
            dC(-150, 0, R, '#bdc3c7', false);
            dA(-150, 0, -150+px, py, '#7f8c8d', 'A'); dAng(-150, 0, 30, 0, a, "ωt", "#2980b9");
            dA(-150+px, 0, -150+px, py, '#e74c3c', 'A sin(ωt)', true);
            ctx.beginPath(); ctx.moveTo(-150+px, py); ctx.lineTo(50, py); ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        }
        dC(50, py, 15, '#2ecc71');
        ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.6)'; ctx.lineWidth=2;
        for(let i=0; i<150; i++) ctx.lineTo(50+i, R*Math.sin(a - i*0.05)); ctx.stroke();
        if(animType==="harmonic_v") dA(70, py, 70, py+R*o*Math.cos(a)*0.5, '#2980b9', 'v');
        if(animType==="harmonic_a") dA(90, py, 90, py-R*o*o*Math.sin(a)*0.3, '#27ae60', 'a');
        if(animType==="harmonic_f") dA(90, py, 90, py-py*0.5, '#e74c3c', 'F=-Kx');
    }
    else if (["kepler","gravity","orbit_u","escape"].includes(animType)) {
        let a = 120, b = 80; if(animType==="kepler") { a=150; b=90; }
        ctx.beginPath(); ctx.ellipse(0,0,a,b,0,0,Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
        let fx = animType==="kepler"? 50:0; dC(fx,0,25,'#e74c3c');
        let ang = animType==="kepler"? time*1.0+0.5*Math.sin(time*1.0) : time*1.5;
        let px = a*Math.cos(ang), py = b*Math.sin(ang);
        dC(px, py, 10, '#3498db');
        if(animType==="gravity") dA(px, py, px+(fx-px)*0.4, py+(0-py)*0.4, '#e74c3c', 'F');
        if(animType==="kepler") {
            ctx.beginPath(); ctx.moveTo(fx,0); ctx.lineTo(px,py); ctx.lineTo(a*Math.cos(ang-0.3), b*Math.sin(ang-0.3));
            ctx.fillStyle='rgba(52, 152, 219, 0.4)'; ctx.fill();
        }
    }
    
    // ----------------------------------------------------
    // 【熱力学】
    // ----------------------------------------------------
    else if (["temp","heat","heat_mix","latent"].includes(animType)) {
        ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100,-80,200,160);
        let spd = animType==="heat"||animType==="temp" ? 1+(time%4) : 2;
        let c = animType==="heat_mix" ? ((time%4)<2?'#e74c3c':'#8e44ad') : `rgb(${spd*50},50,200)`;
        for(let i=1; i<=40; i++) {
            let px = Math.sin(i*123 + time*spd)*80; let py = Math.cos(i*321 + time*spd)*60;
            dC(px, py, 4, c);
        }
        ctx.fillStyle='white'; ctx.fillRect(-130,-50,10,100); ctx.strokeRect(-130,-50,10,100);
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-128,50-spd*15,6,spd*15); dC(-125,50,12,'#e74c3c');
    }
    else if (["boyle","gas","kinetic","internal_u","piston","molar","engine"].includes(animType)) {
        let pw = (animType==="piston"||animType==="engine") ? 60+Math.sin(time*2)*40 : 100;
        ctx.strokeRect(-100,-60,pw+100,120);
        ctx.fillStyle='#e74c3c'; ctx.fillRect(pw,-60,15,120);
        if(animType==="piston" && Math.sin(time*2)>0) dA(pw+20,0,pw+60,0,'#e74c3c','W(仕事)');
        for(let i=1; i<=40; i++) {
            let px = -100 + Math.abs(Math.sin(i*11+time*(3+i%3)))*(pw+100);
            let py = -60 + Math.abs(Math.cos(i*22+time*(2+i%2)))*120;
            dC(px, py, 4, '#e67e22');
        }
    }

    // ----------------------------------------------------
    // 【波動】
    // ----------------------------------------------------
    else if (["wave","wave_eq","sound"].includes(animType)) {
        ctx.beginPath(); ctx.moveTo(-250,0); ctx.lineTo(250,0); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
        ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
        for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(x*0.04 - time*3)*60); ctx.stroke();
        dC(0, Math.sin(-time*3)*60, 10, '#e74c3c');
        dA(20, Math.sin(-time*3)*60, 20, Math.sin(-time*3)*60 + Math.cos(-time*3)*30, '#e74c3c', 'v(媒質)');
    }
    else if (["interfere","beat","standing"].includes(animType)) {
        if(animType==="standing") {
            ctx.beginPath(); ctx.strokeStyle='#3498db'; ctx.lineWidth=2;
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(time*4)*Math.cos(x*0.05)*60); ctx.stroke();
            for(let x=-250; x<=250; x+=Math.PI/0.05) dC(x, 0, 5, '#e74c3c'); // 節
            dTxt("定常波 (赤点は動かない節)", -100, -80);
        } else if(animType==="beat") {
            ctx.beginPath(); ctx.strokeStyle='rgba(52, 152, 219, 0.5)'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.1 - time*3)*30); ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='rgba(231, 76, 60, 0.5)'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.11 - time*3.3)*30); ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.1 - time*3)*30 + Math.sin(x*0.11 - time*3.3)*30); ctx.stroke();
            dTxt("うなり (赤と青が重なり紫の合成波に)", -120, -80);
        } else {
            for(let r=10; r<100; r+=20) {
                dC(-40, 0, (r+time*15)%100, 'rgba(231,76,60,0.5)', false);
                dC(40, 0, (r+time*15)%100, 'rgba(52,152,219,0.5)', false);
            }
        }
    }
    else if (animType === "doppler") {
        let sx = -100 + t*30; dC(sx, 0, 8, '#e74c3c'); dTxt("音源", sx-15, -15);
        for(let i=0; i<10; i++) {
            let eTime = t - i*0.5;
            if(eTime>0) dC(-100 + (t-eTime)*30, 0, eTime*40, 'rgba(52,152,219,0.5)', false);
        }
    }
    else if (animType==="refract_sin" || animType==="refract_n" || animType==="reflect_all") {
        ctx.fillStyle='rgba(52,152,219,0.2)'; ctx.fillRect(-250, 0, 500, 200);
        ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(250, 0); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke();
        dA(0, -150, 0, 150, '#bdc3c7', '法線', true);
        
        let aI = animType==="reflect_all"? Math.PI/2.5 : Math.PI/4;
        let aR = animType==="reflect_all"? Math.PI/1.5 : Math.PI/8;
        let ix = -120*Math.sin(aI), iy = -120*Math.cos(aI);
        let rx = 120*Math.sin(aR), ry = 120*Math.cos(aR);
        
        dA(ix, iy, 0, 0, '#f1c40f', '入射光');
        if(animType==="reflect_all") dA(0, 0, -ix, iy, '#f1c40f', '全反射'); else dA(0, 0, rx, ry, '#f1c40f', '屈折光');
        
        if(animType==="refract_sin") {
            dAng(0, 0, 40, -Math.PI/2, -Math.PI/2 + aI, "i", "#e74c3c");
            dAng(0, 0, 60, Math.PI/2 - aR, Math.PI/2, "r", "#2980b9");
            dA(ix, iy, 0, iy, '#e74c3c', 'sin i', true); dA(rx, ry, 0, ry, '#2980b9', 'sin r', true);
            ctx.beginPath(); ctx.moveTo(0, iy); ctx.lineTo(ix, iy); ctx.lineTo(ix, 0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(rx, ry); ctx.lineTo(rx, 0); ctx.stroke(); ctx.setLineDash([]);
        }
    }
    else if (animType === "lens") {
        ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, 100); ctx.strokeStyle='#3498db'; ctx.lineWidth=4; ctx.stroke(); 
        ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(200, 0); ctx.lineWidth=1; ctx.stroke(); 
        dC(60, 0, 3, '#e74c3c'); dC(-60, 0, 3, '#e74c3c'); dTxt("f", 65, 15); 
        let a = 120, oH = 40; dA(-a, 0, -a, -oH, '#2ecc71', '物体');
        let b = 1 / (1/60 - 1/a); let iH = oH * (b/a); dA(b, 0, b, iH, '#e74c3c', '実像');
        ctx.beginPath(); ctx.moveTo(-a, -oH); ctx.lineTo(0, -oH); ctx.lineTo(b, iH); ctx.strokeStyle='rgba(241, 196, 15, 0.8)'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-a, -oH); ctx.lineTo(0, 0); ctx.lineTo(b, iH); ctx.stroke();
    }
    else if (["young","diffraction","film"].includes(animType)) {
        if(animType==="film") {
            ctx.fillStyle='rgba(52, 152, 219, 0.3)'; ctx.fillRect(-150, -40, 300, 80); 
            ctx.beginPath(); ctx.moveTo(-100, -100); ctx.lineTo(-40, -40); ctx.lineTo(20, 100); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2; ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(20, -100); ctx.stroke(); dTxt("表面反射", 30, -100);
            ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(60, -20); ctx.stroke(); dTxt("裏面反射", 70, -20);
        } else {
            ctx.fillStyle='#34495e'; ctx.fillRect(-100, -100, 5, 200); ctx.fillRect(100, -100, 5, 200); 
            ctx.fillStyle='white'; ctx.fillRect(-105, -30, 15, 5); ctx.fillRect(-105, 30, 15, 5); 
            if(animType==="diffraction") { ctx.fillRect(-105, 0, 15, 5); ctx.fillRect(-105, 60, 15, 5); ctx.fillRect(-105, -60, 15, 5); }
            let m = Math.floor(Math.sin(time)*3); let y = m * 30;
            ctx.beginPath(); ctx.moveTo(-100, -30); ctx.lineTo(100, y); ctx.strokeStyle='rgba(241, 196, 15, 0.5)'; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-100, 30); ctx.lineTo(100, y); ctx.stroke();
            dC(100, y, 10, '#e74c3c'); dTxt("明線 (強め合う)", 115, y+5);
        }
    }

    // ----------------------------------------------------
    // 【電磁気】
    // ----------------------------------------------------
    else if (["coulomb","efield","potential","efield_uniform"].includes(animType)) {
        if(animType==="efield_uniform") {
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-120, -80, 240, 15); dTxt("+++++", -20, -70, "white");
            ctx.fillStyle='#3498db'; ctx.fillRect(-120, 80, 240, 15); dTxt("-----", -15, 92, "white");
            for(let i=-90; i<=90; i+=30) dA(i, -60, i, 70, '#e74c3c');
            dC(0, -60 + (t*30)%120, 8, '#f1c40f'); 
        } else {
            dC(0, 0, 20, '#e74c3c'); dTxt("+", -5, 5, "white");
            if(animType==="coulomb") { dC(80, 0, 20, '#3498db'); dTxt("-", 75, 5, "white"); dA(20,0,50,0,'#e74c3c','F'); dA(60,0,30,0,'#3498db','F'); }
            else {
                for(let i=0; i<8; i++) {
                    let a = (Math.PI/4)*i; dA(30*Math.cos(a), 30*Math.sin(a), 80*Math.cos(a), 80*Math.sin(a), '#e74c3c');
                }
                if(animType==="potential") for(let r=40; r<=120; r+=20) dC(0, 0, r, 'rgba(231,76,60,0.3)', false);
            }
        }
    }
    else if (["capacitor","cap_energy","cap_circuit"].includes(animType)) {
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-80, -40, 160, 10);
        ctx.fillStyle='#3498db'; ctx.fillRect(-80, 40, 160, 10);
        let q = Math.abs(Math.sin(time*2));
        for(let i=0; i<10*q; i++) dA(-60+15*i, -30, -60+15*i, 40, 'rgba(231, 76, 60, 0.5)'); 
        if(animType==="cap_energy") {
            ctx.beginPath(); ctx.moveTo(100, 50); ctx.lineTo(100, -50); ctx.lineTo(180, 50); ctx.closePath();
            ctx.fillStyle='rgba(46, 204, 113, 0.5)'; ctx.fill(); ctx.stroke();
            dTxt("Q-Vグラフ面積 = 蓄積エネルギー", 30, 70);
        } else if(animType==="cap_circuit") {
            dTxt("直列・並列の合成容量を計算", -100, -60);
        }
    }
    else if (["current","resistance","joule","kirchhoff"].includes(animType)) {
        ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.strokeRect(-120, -60, 240, 120); 
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-10, 50, 20, 20); dTxt("V", -5, 65, "white"); 
        ctx.fillStyle='#95a5a6'; ctx.fillRect(-30, -70, 60, 20); dTxt("R", -5, -85); 
        let ex = -120 + (time*60)%240; dC(ex, -60, 5, '#f1c40f'); 
        if(animType==="joule") { dC(0, -60, 25, 'rgba(231,76,60,0.5)'); dTxt("発熱", 35, -55); }
        if(animType==="kirchhoff") { ctx.beginPath(); ctx.moveTo(0,-60); ctx.lineTo(0,60); ctx.stroke(); dTxt("分岐の法則", 10, 0); }
    }
    else if (["mag_field","mag_flux","ampere"].includes(animType)) {
        if(animType==="ampere") {
            ctx.fillStyle='#f39c12'; ctx.fillRect(-80, -5, 160, 10); 
            for(let i=-60; i<=60; i+=30) dA(i, -40, i, 40, '#2ecc71'); 
            dA(0, 0, 0, -30, '#e74c3c', 'F');
        } else {
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-5, -120, 10, 240); 
            dA(0, 100, 0, -100, '#3498db', 'I');
            for(let r=30; r<=90; r+=30) dC(0, 0, r, '#2ecc71', false); 
            dTxt("磁界(右ねじ)", 40, -40);
        }
    }
    else if (animType.startsWith("lorentz")) {
        for(let y=-80; y<=80; y+=40) dA(-150, y, 150, y, '#2ecc71');
        dTxt("磁場 B", 120, -90, "#2ecc71");
        
        let v = 100; let angle = -Math.PI/6;
        let vx = v*Math.cos(angle), vy = v*Math.sin(angle);
        
        if(animType==="lorentz_sin") {
            dC(0, 0, 12, '#f1c40f'); dTxt("-e", -8, 4);
            dA(0, 0, vx, vy, '#3498db', 'v (速度)'); dAng(0, 0, 40, angle, 0, "θ");
            dA(0, 0, 0, vy, '#e74c3c', 'v sinθ (力を受ける)', true); dA(0, 0, vx, 0, '#95a5a6', 'v cosθ (力0)', true);
            ctx.beginPath(); ctx.moveTo(0,vy); ctx.lineTo(vx,vy); ctx.lineTo(vx,0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        } else {
            let lx = 50*Math.cos(time*3), ly = 50*Math.sin(time*3);
            dC(lx, ly, 8, '#f1c40f'); 
            dA(lx, ly, lx-20*Math.sin(time*3), ly+20*Math.cos(time*3), '#2980b9', 'v');
            dA(lx, ly, lx*0.5, ly*0.5, '#e74c3c', 'F');
        }
    }
    else if (["flux_cos","induction","rod","self_ind"].includes(animType)) {
        if(animType==="flux_cos") {
            ctx.beginPath(); ctx.ellipse(0, 0, 100, 30, 0, 0, Math.PI*2); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke(); 
            ctx.fillStyle='rgba(52, 73, 94, 0.1)'; ctx.fill();
            dA(0, 0, 0, -120, '#7f8c8d', '面の法線', true);
            let B = 140, angle = -Math.PI/4; let Bx = B*Math.sin(angle), By = -B*Math.cos(angle);
            dA(0, 0, Bx, By, '#2ecc71', '磁場 B'); dAng(0, 0, 40, -Math.PI/2, angle - Math.PI/2, "θ");
            dA(0, 0, 0, By, '#e74c3c', 'B cosθ', true); dA(0, By, Bx, By, '#95a5a6', 'B sinθ', true);
        } else if(animType==="rod") {
            ctx.fillStyle='#f39c12'; ctx.fillRect(-80, -5, 160, 10); 
            for(let i=-60; i<=60; i+=30) { dC(i,0,5,'#2ecc71'); dTxt("B", i+8, 5, "#2ecc71"); } // Bの手前向きマーク
            dA(0, 0, 50, 0, '#3498db', 'v'); dA(0, 0, 0, -40, '#e74c3c', 'F(電子)');
        } else {
            ctx.strokeStyle='#8e44ad'; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(0,0, 40, 0, Math.PI, true); ctx.stroke(); 
            let my = -80 + Math.abs(Math.sin(time*2))*60;
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-15, my, 30, 40); dTxt("N", -5, my+25, "white"); 
            dA(0, my+40, 0, my+80, '#2ecc71', 'B'); 
        }
    }
    else if (["ac_gen","reactance","impedance","resonance"].includes(animType)) {
        if(animType==="ac_gen") {
            let R = 60, angle = time*2;
            dC(-150, 0, R, '#bdc3c7', false);
            dA(-150, 0, -150+R*Math.cos(angle), R*Math.sin(angle), '#3498db', 'コイル回転'); dAng(-150, 0, 25, 0, angle, "ωt");
            dA(-150+R*Math.cos(angle), 0, -150+R*Math.cos(angle), R*Math.sin(angle), '#e74c3c', 'V0 sin(ωt)', true);
            ctx.beginPath(); ctx.moveTo(-150+R*Math.cos(angle), R*Math.sin(angle)); ctx.lineTo(0, R*Math.sin(angle)); 
            ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
            dC(0, R*Math.sin(angle), 8, '#e74c3c');
            ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=3;
            for(let i=0; i<200; i++) ctx.lineTo(i, R*Math.sin(angle - i*0.05)); ctx.stroke();
        } else {
            let w = time*2;
            dA(0, 0, 80*Math.cos(w), 80*Math.sin(w), '#e74c3c', 'V');
            let phase = animType==="reactance" ? Math.PI/2 : (animType==="resonance"? 0 : Math.PI/4);
            dA(0, 0, 60*Math.cos(w - phase), 60*Math.sin(w - phase), '#3498db', 'I');
            dTxt("電圧と電流の位相のズレ（フェーザ図）", -120, 120);
        }
    }

    // ----------------------------------------------------
    // 【原子】
    // ----------------------------------------------------
    else if (["photon","photoelectric","stop_v","matter_wave","xray"].includes(animType)) {
        if(animType==="matter_wave") {
            let x = -150 + t_short*100; dC(x, 0, 8, '#3498db');
            ctx.beginPath(); ctx.strokeStyle='rgba(52, 152, 219, 0.5)'; ctx.lineWidth=2;
            for(let i=0; i<100; i++) ctx.lineTo(x - i*2, Math.sin(i*0.2 - time*5)*20); ctx.stroke();
            dTxt("粒子でもあり、波でもある", -100, 50);
        } else {
            ctx.fillStyle='#95a5a6'; ctx.fillRect(-100, -50, 20, 100); ctx.fillRect(80, -50, 20, 100);
            let pt = time%2;
            if(animType==="xray") {
                dC(-80+pt*160, 0, 5, '#3498db'); 
                if(pt>0.9) { dC(80, 0, 20, 'rgba(241, 196, 15, 0.5)', false); dTxt("X線", 100, -20); }
            } else {
                if(pt<0.5) { dC(-150+pt*100, 0, 5, '#f1c40f'); } 
                else {
                    let ex = -80 + (pt-0.5)*200;
                    if(animType==="stop_v") {
                        ex = -80 + Math.sin((pt-0.5)*Math.PI)*150; 
                        for(let y=-40; y<=40; y+=20) dA(80, y, -80, y, 'rgba(231,76,60,0.3)'); 
                    }
                    dC(ex, 0, 5, '#3498db');
                }
            }
        }
    }
    else if (animType.startsWith("bohr") || animType === "energy_level") {
        dC(0, 0, 20, '#e74c3c'); dTxt("+", -5, 5, "white"); 
        dC(0, 0, 60, '#bdc3c7', false); dTxt("n=1", 65, 0, "#bdc3c7");
        dC(0, 0, 120, '#bdc3c7', false); dTxt("n=2", 125, 0, "#bdc3c7");
        let orbit = (Math.floor(time) % 2 === 0) ? 120 : 60; 
        let ex = orbit*Math.cos(time*3), ey = orbit*Math.sin(time*3);
        dC(ex, ey, 10, '#3498db'); dTxt("-", ex-3, ey+3, "white");
        if(orbit === 60 && (time%1)<0.3) {
            ctx.beginPath(); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2;
            for(let i=0; i<50; i++) ctx.lineTo(ex + i*3, ey + Math.sin(i*0.5)*10); ctx.stroke();
            dTxt("hν (光子放出)", ex+150, ey);
        }
    }
    else if (["mass_defect","mc2","half_life","decay"].includes(animType)) {
        if(animType==="half_life") {
            let hl = Math.floor(time); let count = 64 / Math.pow(2, hl);
            for(let i=0; i<64; i++) {
                let cx = -100 + (i%8)*20; let cy = -80 + Math.floor(i/8)*20;
                dC(cx, cy, 8, i<count ? '#e74c3c' : '#bdc3c7');
            }
            dTxt(`経過: ${hl} 半減期`, 80, -20);
        } else {
            let t2 = time%4;
            if(t2<2) { 
                dC(-60, -20, 15, '#e74c3c'); dC(-40, 10, 15, '#e74c3c'); dC(-20, -10, 15, '#3498db'); dC(-80, 0, 15, '#3498db');
                dTxt("部品の合計質量", -100, 50);
            } else { 
                dC(60, -10, 15, '#e74c3c'); dC(45, 5, 15, '#e74c3c'); dC(55, 15, 15, '#3498db'); dC(75, 0, 15, '#3498db');
                if(animType==="decay") { dA(90, 0, 150, 0, '#f1c40f', '放射線'); }
                else { dTxt("結合後の質量 (少し軽い!)", 20, 50); dTxt("Δmc² のエネルギー放出", 20, 70); }
            }
        }
    }
    else {
        // フォールバック
        dTxt("シミュレーションを読み込んでいます...", -130, 0);
        dC(Math.cos(time*2)*40, Math.sin(time*2)*40, 15, '#3498db');
    }

    ctx.restore();
}

render();
