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
            if(idx === 0) card.click(); // 最初を自動選択
        });
        if (window.MathJax) MathJax.typesetPromise();
    };
    chapUl.appendChild(li);
});

// --- 2D Canvas シミュレーションエンジン ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let reqId;

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setAnimation(type) {
    animType = type;
    time = 0;
}

// 描画補助関数群
function drawArrow(ctx, x1, y1, x2, y2, color, label="") {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI/6), y2 - 10 * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI/6), y2 - 10 * Math.sin(angle + Math.PI/6));
    ctx.fill();
    if(label) { ctx.font="14px Arial"; ctx.fillText(label, x2+5, y2+5); }
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
    if(!isPlaying) return;
    time += 0.04;
    
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;
    ctx.clearRect(0, 0, w, h);
    
    // 背景グリッド描画（共通）
    ctx.strokeStyle = '#f1f2f6'; ctx.lineWidth=1;
    for(let i=0; i<w; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
    for(let i=0; i<h; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

    ctx.save();
    ctx.translate(cx, cy); // 原点を中心に

    let t = time % 5; // 基本ループ時間
    
    // カテゴリごとの2D描画ロジック
    if(animType === "linear" || animType === "accel" || animType.includes("equation") || animType==="work" || animType==="power" || animType==="momentum" || animType==="impulse") {
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-w/2, 40, w, 5); // 地面
        let x = -150; let v = 60; let a = 0;
        if(animType==="accel" || animType==="equation" || animType==="work" || animType==="power" || animType==="impulse") a = 20;
        x = -150 + v*t + 0.5*a*t*t;
        if(x > 150) time = 0;
        drawBlock(ctx, x, 20, 40, 40, '#3498db');
        if(animType==="linear" || animType==="accel" || animType==="momentum") drawArrow(ctx, x, -10, x + v + a*t, -10, '#2980b9', 'v'); // 速度ベクトル
        if(a > 0) drawArrow(ctx, x, -30, x + 50, -30, '#27ae60', 'a'); // 加速度
        if(animType.includes("equation") || animType==="work" || animType==="power" || animType==="impulse") drawArrow(ctx, x-60, 20, x-20, 20, '#e74c3c', 'F'); // 力
    }
    else if(animType.includes("fall") || animType === "throw") {
        let y = -100, v0 = 0, g = 50;
        if(animType==="fall_v0") v0 = 40;
        if(animType==="throw") { y = 80; v0 = -120; } // 上向き
        let curY = y + v0*t + 0.5*g*t*t;
        if(curY > 100 && t>0.5) time = 0;
        drawCircle(ctx, 0, curY, 15, '#e74c3c');
        drawArrow(ctx, 20, curY, 20, curY + (v0 + g*t)*0.5, '#2980b9', 'v');
        drawArrow(ctx, -20, curY, -20, curY + 30, '#27ae60', 'g');
    }
    else if(animType==="force_g" || animType==="friction_s" || animType==="friction_d" || animType==="pressure") {
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-100, 40, 200, 5);
        drawBlock(ctx, 0, 10, 60, 60, '#9b59b6');
        drawArrow(ctx, 0, 10, 0, 70, '#e74c3c', 'W (mg)'); // 重力
        drawArrow(ctx, 0, 10, 0, -50, '#2ecc71', 'N'); // 垂直抗力
        if(animType.includes("friction")) {
            drawArrow(ctx, 0, 10, 60, 10, '#3498db', 'F'); // 引く力
            drawArrow(ctx, 0, 40, -40, 40, '#e67e22', animType==="friction_s"?'f (静止)':'f\' (動)'); // 摩擦力
        }
        if(animType==="pressure") {
            for(let i=-20; i<=20; i+=10) drawArrow(ctx, i, -40, i, -20, '#e74c3c');
            ctx.fillText("圧力 P = F/S", 50, -30);
        }
    }
    else if(animType==="spring" || animType==="harmonic_f") {
        let x = Math.sin(time*3)*80;
        ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-150, -40, 10, 80); // 壁
        drawSpring(ctx, -140, 0, x-20, 0, 10);
        drawBlock(ctx, x, 0, 40, 40, '#2ecc71');
        drawArrow(ctx, x, -30, x - x*0.5, -30, '#e74c3c', 'F = -kx'); // 復元力
    }
    else if(animType==="buoyancy") {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.3)'; ctx.fillRect(-100, -20, 200, 120); // 水
        let y = Math.sin(time*2)*10;
        drawBlock(ctx, 0, y+40, 50, 50, '#f1c40f');
        drawArrow(ctx, 0, y+40, 0, y+90, '#e74c3c', 'W');
        drawArrow(ctx, 0, y+40, 0, y-10, '#2980b9', 'F (浮力)');
    }
    else if(animType==="moment" || animType==="balance" || animType==="center_mass") {
        let angle = animType==="moment" ? Math.sin(time)*0.2 : 0;
        ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(-20, 80); ctx.lineTo(20, 80); ctx.fillStyle='#7f8c8d'; ctx.fill(); // 支点
        ctx.rotate(angle);
        ctx.fillStyle = '#f39c12'; ctx.fillRect(-100, 30, 200, 10); // 棒
        drawBlock(ctx, -80, 15, 30, 30, '#3498db'); drawArrow(ctx, -80, 15, -80, 60, '#e74c3c', 'mg'); // 左おもり
        if(animType!=="moment") { drawBlock(ctx, 60, 10, 40, 40, '#e74c3c'); drawArrow(ctx, 60, 10, 60, 80, '#e74c3c', 'Mg'); } // 右おもり
    }
    else if(animType.includes("energy") || animType==="pendulum") {
        let angle = Math.sin(time*2)*0.8;
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, -80, 100, 10); // 天井
        let px = 120*Math.sin(angle), py = -80 + 120*Math.cos(angle);
        ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(px, py); ctx.strokeStyle='#333'; ctx.stroke();
        drawCircle(ctx, px, py, 20, '#9b59b6');
        // グラフ
        let K = (0.8 - Math.abs(angle))*100; let U = Math.abs(angle)*100;
        ctx.fillStyle='#2ecc71'; ctx.fillRect(-100, 100-K, 20, K); ctx.fillText("K (運動)", -110, 120);
        ctx.fillStyle='#e67e22'; ctx.fillRect(-60, 100-U, 20, U); ctx.fillText("U (位置)", -70, 120);
    }
    else if(animType==="collision" || animType==="bounce") {
        let t2 = time%3;
        if(animType==="collision") {
            let x1 = t2<1.5 ? -100 + t2*60 : -10; let x2 = t2<1.5 ? -10 : -10 + (t2-1.5)*60;
            drawCircle(ctx, x1, 0, 20, '#3498db'); drawArrow(ctx, x1, -30, x1+(t2<1.5?40:0), -30, '#2980b9');
            drawCircle(ctx, x2, 0, 20, '#e74c3c'); drawArrow(ctx, x2, -30, x2+(t2>=1.5?40:0), -30, '#2980b9');
        } else {
            let by = 80 - Math.abs(Math.cos(time*3)*80)*Math.exp(-time*0.2); // 減衰バウンド
            drawCircle(ctx, 0, by, 15, '#1abc9c');
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, 95, 100, 5);
        }
    }
    else if(animType.includes("circular") || animType==="centrifugal") {
        let r = 80;
        drawCircle(ctx, 0, 0, r, '#bdc3c7', false); // 軌道
        drawCircle(ctx, 0, 0, 5, '#f1c40f'); // 中心
        let bx = r*Math.cos(time*2), by = r*Math.sin(time*2);
        drawCircle(ctx, bx, by, 15, '#3498db');
        if(animType!=="circular") {
            if(animType==="circular_v") drawArrow(ctx, bx, by, bx - 40*Math.sin(time*2), by + 40*Math.cos(time*2), '#2980b9', 'v');
            if(animType==="circular_a"||animType==="circular_f") drawArrow(ctx, bx, by, bx*0.5, by*0.5, animType==="circular_a"?'#27ae60':'#e74c3c', animType==="circular_a"?'a':'F');
            if(animType==="centrifugal") drawArrow(ctx, bx, by, bx*1.5, by*1.5, '#e67e22', 'f (遠心力)');
        }
    }
    else if(animType.includes("harmonic_") || animType==="pendulum_t") {
        let hx = 60*Math.sin(time*3);
        drawCircle(ctx, hx, 0, 20, '#2ecc71');
        // グラフを描画
        ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.5)';
        for(let i=0; i<100; i++) ctx.lineTo(hx - i*2, 0 + Math.sin(time*3 - i*0.1)*60);
        ctx.stroke();
        if(animType==="harmonic_v") drawArrow(ctx, hx, -30, hx + Math.cos(time*3)*40, -30, '#2980b9', 'v');
        if(animType==="harmonic_a") drawArrow(ctx, hx, 30, hx - Math.sin(time*3)*40, 30, '#27ae60', 'a');
    }
    else if(animType==="kepler" || animType==="gravity" || animType==="orbit_u" || animType==="escape") {
        let a = 100, b = 70;
        ctx.beginPath(); ctx.ellipse(0, 0, a, b, 0, 0, Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke(); // 楕円
        drawCircle(ctx, 40, 0, 25, '#e74c3c'); // 太陽(焦点)
        let ex = a*Math.cos(time*1.5), ey = b*Math.sin(time*1.5);
        drawCircle(ctx, ex, ey, 10, '#3498db'); // 惑星
        if(animType==="gravity") drawArrow(ctx, ex, ey, ex + (40-ex)*0.5, ey - ey*0.5, '#e74c3c', 'F');
        if(animType==="kepler") { ctx.beginPath(); ctx.moveTo(40,0); ctx.lineTo(ex,ey); ctx.lineTo(a*Math.cos((time-0.2)*1.5), b*Math.sin((time-0.2)*1.5)); ctx.fillStyle='rgba(52, 152, 219, 0.3)'; ctx.fill(); }
    }
    else if(animType.includes("heat") || animType==="temp" || animType==="latent") {
        ctx.strokeRect(-60, -60, 120, 120);
        let speed = animType==="heat_mix" ? (t<2.5 ? 5 : 2) : (t+1);
        ctx.fillStyle = animType==="heat_mix"?(t<2.5?'#e74c3c':'#8e44ad') : '#e74c3c'; // 混合で色変化
        for(let i=0; i<30; i++) {
            let px = (Math.sin(i*123+time*speed)*50), py = (Math.cos(i*321+time*speed)*50);
            drawCircle(ctx, px, py, 4, ctx.fillStyle);
        }
    }
    else if(animType==="boyle" || animType==="gas" || animType==="kinetic" || animType==="internal_u" || animType==="piston" || animType==="molar" || animType==="engine") {
        let pw = animType==="piston" || animType==="engine" ? 60 + Math.sin(time*2)*30 : 80;
        ctx.strokeRect(-60, -40, pw+60, 80); // シリンダー
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(pw, -40, 10, 80); // ピストン
        ctx.fillStyle = '#e67e22';
        for(let i=0; i<40; i++) {
            let px = -50 + Math.abs(Math.sin(i*11+time*(3+i%3)))*(pw+40);
            let py = -30 + Math.abs(Math.cos(i*22+time*(2+i%2)))*60;
            drawCircle(ctx, px, py, 3, ctx.fillStyle);
        }
        if(animType==="piston") drawArrow(ctx, pw+10, 0, pw+40, 0, '#e74c3c', 'W (仕事)');
    }
    else if(animType==="wave" || animType==="wave_eq" || animType==="sound") {
        ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
        for(let x=-150; x<=150; x+=5) ctx.lineTo(x, Math.sin(x*0.05 - time*3)*40);
        ctx.stroke();
        // 媒質の動き(赤丸)
        drawCircle(ctx, 0, Math.sin(0 - time*3)*40, 8, '#e74c3c');
    }
    else if(animType==="interfere" || animType==="young" || animType==="beat" || animType==="standing" || animType==="doppler") {
        if(animType==="standing") {
            ctx.beginPath(); ctx.strokeStyle='#3498db'; ctx.lineWidth=2;
            for(let x=-100; x<=100; x+=2) ctx.lineTo(x, Math.sin(time*4)*Math.cos(x*0.05)*40);
            ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]);
            for(let x=-100; x<=100; x+=2) ctx.lineTo(x, -Math.sin(time*4)*Math.cos(x*0.05)*40);
            ctx.stroke(); ctx.setLineDash([]);
        } else if (animType==="doppler") {
            let srcX = -50 + (time%4)*25; drawCircle(ctx, srcX, 0, 5, '#e74c3c'); // 音源
            for(let i=0; i<5; i++) {
                let pastTime = (time%4) - i*0.5;
                if(pastTime>0) drawCircle(ctx, -50 + i*0.5*25, 0, pastTime*40, 'rgba(52, 152, 219, 0.5)', false);
            }
        } else {
            // 波紋の干渉
            for(let r=10; r<100; r+=20) {
                drawCircle(ctx, -40, 0, (r+time*10)%100, 'rgba(231, 76, 60, 0.5)', false);
                drawCircle(ctx, 40, 0, (r+time*10)%100, 'rgba(52, 152, 219, 0.5)', false);
            }
        }
    }
    else if(animType==="refract" || animType==="reflect_all" || animType==="film" || animType==="lens" || animType==="diffraction" || animType==="refract_n") {
        ctx.fillStyle='rgba(52,152,219,0.2)'; ctx.fillRect(-150, 0, 300, 100); // 下部媒質
        ctx.beginPath(); ctx.moveTo(-100, -100); ctx.lineTo(0,0); // 入射光
        if(animType==="reflect_all") { ctx.lineTo(100, -100); } // 全反射
        else { ctx.lineTo(60, 100); ctx.setLineDash([5,5]); ctx.lineTo(100, 100); ctx.setLineDash([]); } // 屈折
        ctx.strokeStyle='#f1c40f'; ctx.lineWidth=3; ctx.stroke();
        drawArrow(ctx, -50, -50, -25, -25, '#f1c40f'); // 矢印
    }
    else if(animType==="coulomb" || animType==="efield" || animType==="potential") {
        drawCircle(ctx, 0, 0, 20, '#e74c3c'); ctx.fillStyle='white'; ctx.fillText("+", -4, 4);
        for(let i=0; i<8; i++) {
            let angle = (Math.PI/4)*i;
            drawArrow(ctx, 30*Math.cos(angle), 30*Math.sin(angle), 80*Math.cos(angle), 80*Math.sin(angle), '#e74c3c'); // 電場
        }
        if(animType==="potential") {
            for(let r=40; r<=100; r+=20) drawCircle(ctx, 0, 0, r, 'rgba(231,76,60,0.3)', false); // 等電位線
        }
    }
    else if(animType.includes("capacitor") || animType==="efield_uniform") {
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-80, -40, 160, 10); ctx.fillText("+ + + + + + + +", -50, -45);
        ctx.fillStyle='#3498db'; ctx.fillRect(-80, 40, 160, 10); ctx.fillText("- - - - - - - - -", -45, 60);
        for(let i=-60; i<=60; i+=30) drawArrow(ctx, i, -30, i, 30, '#e74c3c'); // 電場
        if(animType.includes("capacitor")) drawCircle(ctx, -60+(time*30)%120, 10, 5, '#f1c40f'); // 電荷移動
    }
    else if(animType==="current" || animType==="resistance" || animType==="joule" || animType==="kirchhoff") {
        ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.strokeRect(-80, -40, 160, 80); // 回路
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-10, 30, 20, 20); // 電池
        ctx.fillStyle='#95a5a6'; ctx.fillRect(-20, -50, 40, 20); // 抵抗
        let ex = -80 + (time*40)%160;
        drawCircle(ctx, ex, -40, 5, '#f1c40f'); // 動く電子
    }
    else if(animType.includes("mag_") || animType==="ampere" || animType.includes("lorentz")) {
        if(animType==="mag_field") {
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-5, -80, 10, 160); // 導線
            for(let r=20; r<=60; r+=20) drawCircle(ctx, 0, 0, r, '#2ecc71', false); // 磁界
        } else if(animType.includes("lorentz")) {
            for(let i=-60; i<=60; i+=30) { ctx.fillStyle='#2ecc71'; ctx.fillText("x", i, 0); } // 磁場(奥へ)
            let lx = 50*Math.cos(time*3), ly = 50*Math.sin(time*3);
            drawCircle(ctx, lx, ly, 8, '#f1c40f'); // 電子円運動
            drawArrow(ctx, lx, ly, lx-20*Math.sin(time*3), ly+20*Math.cos(time*3), '#2980b9', 'v');
            drawArrow(ctx, lx, ly, lx*0.5, ly*0.5, '#e74c3c', 'F');
        } else {
            ctx.fillStyle='#f39c12'; ctx.fillRect(-80, -5, 160, 10); // 棒
            for(let i=-60; i<=60; i+=30) drawArrow(ctx, i, -40, i, 40, '#2ecc71'); // 磁場
            drawArrow(ctx, 0, 0, 0, -30, '#e74c3c', 'F'); // 力
        }
    }
    else if(animType==="flux" || animType==="induction" || animType==="rod" || animType==="self_ind") {
        ctx.strokeStyle='#8e44ad'; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(0,0, 40, 0, Math.PI, true); ctx.stroke(); // コイル
        let my = -80 + Math.abs(Math.sin(time*2))*60;
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-15, my, 30, 40); ctx.fillStyle='white'; ctx.fillText("N", -5, my+25); // 磁石
        drawArrow(ctx, 0, my+40, 0, my+80, '#2ecc71', 'B'); // 磁界
    }
    else if(animType.includes("ac") || animType==="reactance" || animType==="impedance" || animType==="resonance") {
        ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=2;
        for(let x=-100; x<=100; x+=5) ctx.lineTo(x, Math.sin(x*0.05 - time*2)*40); ctx.stroke(); // 電圧
        ctx.beginPath(); ctx.strokeStyle='#3498db';
        let phase = animType==="reactance"? Math.PI/2 : 0;
        for(let x=-100; x<=100; x+=5) ctx.lineTo(x, Math.sin(x*0.05 - time*2 + phase)*25); ctx.stroke(); // 電流
        ctx.fillText("赤:V  青:I", 50, -50);
    }
    else if(animType==="photon" || animType==="photoelectric" || animType==="stop_v" || animType==="xray" || animType==="matter_wave") {
        ctx.fillStyle='#95a5a6'; ctx.fillRect(-10, -60, 20, 120); // 金属
        let pt = time%2;
        if(pt<1) { // 光子入射
            drawCircle(ctx, -80+pt*70, -40+pt*40, 5, '#f1c40f');
            ctx.beginPath(); ctx.moveTo(-80+pt*70, -40+pt*40); ctx.lineTo(-90+pt*70, -50+pt*40); ctx.strokeStyle='#f1c40f'; ctx.stroke(); // 波線っぽく
        } else { // 電子放出
            drawCircle(ctx, 0+(pt-1)*50, 0+(pt-1)*30, 5, '#3498db');
        }
    }
    else if(animType.includes("bohr") || animType==="energy_level") {
        drawCircle(ctx, 0, 0, 15, '#e74c3c'); // 核
        drawCircle(ctx, 0, 0, 40, '#bdc3c7', false); drawCircle(ctx, 0, 0, 70, '#bdc3c7', false); // 軌道
        let r = Math.floor(time)%2===0 ? 40 : 70; // 軌道ジャンプ
        drawCircle(ctx, r*Math.cos(time*3), r*Math.sin(time*3), 6, '#3498db'); // 電子
        if(Math.floor(time)%2===1 && (time%1)<0.2) drawArrow(ctx, 40, 0, 70, 0, '#f1c40f', 'hν'); // 光子放出
    }
    else if(animType.includes("mass") || animType==="mc2" || animType==="half_life" || animType==="decay" || animType==="nuclear") {
        let nt = time%3;
        if(nt<1.5) { // 結合状態
            drawCircle(ctx, -10, 0, 15, '#e74c3c'); drawCircle(ctx, 10, 0, 15, '#3498db');
        } else { // 分裂・放出
            drawCircle(ctx, -10 - (nt-1.5)*30, 0, 15, '#e74c3c'); 
            drawCircle(ctx, 10 + (nt-1.5)*60, 0, 10, '#3498db'); // α粒子など
            ctx.fillText("E = mc²", 0, -30);
        }
    }

    ctx.restore();
}

// === 初期化とUI操作 ===
document.getElementById('playBtn').onclick = () => {
    isPlaying = !isPlaying;
    document.getElementById('playBtn').innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生";
};
document.getElementById('resetBtn').onclick = () => { time = 0; };

// 最初のアニメーションを起動
setTimeout(() => {
    const firstItem = document.querySelector('.chapter-list .item');
    if(firstItem) firstItem.click();
    render();
}, 500);
