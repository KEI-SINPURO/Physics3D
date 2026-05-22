// ==========================================
// 高校物理 高精度2Dシミュレーションエンジン
// ==========================================

// --- UI・メニュー構築 ---
const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

// data.js の読み込みとメニュー生成
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

// 起動時の初期化
setTimeout(() => {
    const firstChapter = document.querySelector('.chapter-list .item');
    if (firstChapter) firstChapter.click();
}, 100);

// --- キャンバスと制御変数 ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;

// パン（移動）とズーム（拡大縮小）
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
    scale = 1.0; panX = 0; panY = 0; // 視点リセット
    document.getElementById('zoomSlider').value = 1.0;
    document.getElementById('zoomVal').innerText = "1.0x";
}

// UIイベントリスナー
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

// マウス操作（ドラッグで移動、ホイールでズーム）
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

// ==========================================
// ★ 高精度描画ユーティリティ関数群
// ==========================================
function drawArrow(x1, y1, x2, y2, color, label="", isDashed=false) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2.5;
    if(isDashed) ctx.setLineDash([5,5]); else ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    
    // 矢印の先端
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 12;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI/6), y2 - headLen * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI/6), y2 - headLen * Math.sin(angle + Math.PI/6));
    ctx.fill();
    
    // ラベル
    if(label) { 
        ctx.font="bold 16px 'Helvetica Neue', Arial"; 
        ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 4;
        ctx.fillText(label, x2+8, y2+8); 
        ctx.shadowBlur = 0;
    }
}

// 角度のマーク（扇形）を描画する関数（sin, cosの可視化で活躍）
function drawAngleMark(x, y, radius, angle1, angle2, label, color="#e67e22") {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, radius, angle1, angle2, false); ctx.closePath();
    ctx.fillStyle = "rgba(230, 126, 34, 0.2)"; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    
    let midAngle = (angle1 + angle2) / 2;
    ctx.fillStyle = color; ctx.font="bold 16px Arial";
    ctx.fillText(label, x + (radius+15)*Math.cos(midAngle) - 5, y + (radius+15)*Math.sin(midAngle) + 5);
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

// ==========================================
// ★ メイン物理シミュレーションループ
// ==========================================
function render() {
    requestAnimationFrame(render);
    
    let speedMult = parseFloat(speedSlider.value);
    if(isPlaying) time += 0.04 * speedMult;
    
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.save();
    ctx.translate(w/2 + panX, h/2 + panY); // パン操作
    ctx.scale(scale, scale);               // ズーム操作

    // 背景方眼紙グリッド（正確さを演出）
    ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
    for(let i=-1000; i<=1000; i+=20) {
        if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5';
        ctx.beginPath(); ctx.moveTo(i,-1000); ctx.lineTo(i,1000); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-1000,i); ctx.lineTo(1000,i); ctx.stroke();
    }
    // 原点のX/Y軸
    ctx.strokeStyle = '#b2bec3'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-1000, 0); ctx.lineTo(1000, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -1000); ctx.lineTo(0, 1000); ctx.stroke();

    let t = time % 6; // 周期リセット用
    
    // ----------------------------------------------------
    // 【力学】運動・力・エネルギー
    // ----------------------------------------------------
    if(animType === "linear" || animType === "accel" || animType === "momentum" || animType === "equation" || animType === "impulse" || animType==="power") {
        ctx.fillStyle = '#95a5a6'; ctx.fillRect(-300, 40, 600, 10); // 地面
        
        let startX = -200; let v0 = 50; let a = 0;
        if(animType==="accel" || animType==="equation" || animType==="impulse" || animType==="power") a = 20; // 加速度あり
        
        let curX = startX + v0*t + 0.5*a*t*t;
        let curV = v0 + a*t;
        if(curX > 250) time = 0; // リセット
        
        drawBlock(curX, 20, 50, 40, '#3498db');
        
        // 速度ベクトル
        if(animType !== "equation") drawArrow(curX, -10, curX + curV, -10, '#2980b9', 'v');
        // 加速度ベクトル
        if(a > 0) drawArrow(curX, -30, curX + a*3, -30, '#27ae60', 'a');
        // 力のベクトル
        if(animType==="equation" || animType==="impulse" || animType==="power") drawArrow(curX-80, 20, curX-30, 20, '#e74c3c', 'F');
        
        // 動的なグラフ表示 (x-t または v-t)
        ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillRect(-250, -180, 150, 100); ctx.strokeRect(-250, -180, 150, 100);
        ctx.fillStyle = "black"; ctx.font="12px Arial"; ctx.fillText(a>0?"v-t グラフ":"x-t グラフ", -240, -160);
        ctx.beginPath(); ctx.strokeStyle = a>0?'#2980b9':'#3498db'; ctx.lineWidth=2;
        for(let i=0; i<t; i+=0.1) {
            let plotY = a>0 ? -80 - (v0+a*i)*0.4 : -80 - (v0*i)*0.3;
            ctx.lineTo(-240 + i*20, plotY);
        }
        ctx.stroke();
    }
    // ----------------------------------------------------
    // ★ 三角関数の徹底可視化（仕事 W = Fx cosθ）
    // ----------------------------------------------------
    else if(animType === "work_cos") {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-200, 40, 400, 5); // 地面
        let x = -100 + t*30; if(x > 150) time=0;
        drawBlock(x, 20, 50, 40, '#3498db');
        
        let F = 100; let angle = -Math.PI/6; // -30度
        let Fx = F * Math.cos(angle); let Fy = F * Math.sin(angle);
        
        // 元の力
        drawArrow(x, 0, x+F*Math.cos(angle), F*Math.sin(angle), '#95a5a6', 'F');
        // 角度θのマーク
        drawAngleMark(x, 0, 40, angle, 0, "θ");
        
        // 力の分解（直角三角形の形成）
        drawArrow(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ (仕事をする成分)');
        drawArrow(x, 0, x, Fy, '#f1c40f', 'F sinθ', true); // 補助線
        drawArrow(x+Fx, 0, x+Fx, Fy, '#bdc3c7', '', true); // 射影線
        ctx.beginPath(); ctx.moveTo(x, Fy); ctx.lineTo(x+Fx, Fy); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
    }
    // ----------------------------------------------------
    // 落体の運動
    // ----------------------------------------------------
    else if(animType.includes("fall") || animType === "throw") {
        let y = -100, v0 = 0, g = 50;
        if(animType==="fall_v0") v0 = 40; // 投げ下ろし
        if(animType==="throw") { y = 100; v0 = -130; } // 投げ上げ
        
        let curY = y + v0*t + 0.5*g*t*t;
        let curV = v0 + g*t;
        if(curY > 150 && t>0.5) time = 0;
        
        drawCircle(0, curY, 15, '#e74c3c');
        // 速度ベクトル
        drawArrow(30, curY, 30, curY + curV*0.5, '#2980b9', 'v');
        // 重力加速度ベクトル
        drawArrow(-30, curY, -30, curY + g*0.8, '#27ae60', 'g');
        
        // 軌跡プロット
        ctx.fillStyle='rgba(231, 76, 60, 0.3)';
        for(let i=0; i<t; i+=0.1) drawCircle(0, y + v0*i + 0.5*g*i*i, 3, '', true);
    }
    // ----------------------------------------------------
    // 力のつりあい・摩擦
    // ----------------------------------------------------
    else if(animType==="force_g" || animType.includes("friction") || animType==="pressure") {
        ctx.fillStyle = '#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
        drawBlock(0, 10, 60, 60, '#9b59b6');
        
        // 重力と垂直抗力
        drawArrow(0, 10, 0, 80, '#e74c3c', 'mg');
        drawArrow(0, 10, 0, -60, '#2ecc71', 'N (垂直抗力)');
        
        if(animType.includes("friction")) {
            // 引く力
            let pull = animType==="friction_s" ? (t*20) : 80;
            if(pull>80) time=0;
            drawArrow(0, 10, 0+pull, 10, '#3498db', '引く力');
            // 摩擦力
            drawArrow(0, 40, 0-pull, 40, '#e67e22', animType==="friction_s"?'静止摩擦 f':'動摩擦 f\'');
            if(animType==="friction_d") { drawArrow(0, -30, 40, -30, '#2980b9', 'v'); }
        }
    }
    // ----------------------------------------------------
    // 円運動・ケプラー・万有引力
    // ----------------------------------------------------
    else if(animType.includes("circular") || animType==="centrifugal" || animType==="gravity" || animType==="kepler" || animType==="orbit_u" || animType==="escape") {
        let a = 120, b = 120; // 基本は円
        if(animType==="kepler") { a=150; b=90; } // 楕円軌道
        
        // 軌道
        ctx.beginPath(); ctx.ellipse(0, 0, a, b, 0, 0, Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
        
        // 中心天体/支点
        let focusX = animType==="kepler" ? 50 : 0;
        drawCircle(focusX, 0, animType.includes("circular")?5:20, animType.includes("circular")?'#f1c40f':'#e74c3c');
        
        // 運動する物体
        let angle = time*1.5;
        if(animType==="kepler") angle = time*1.0 + 0.5*Math.sin(time*1.0); // 面積速度一定の近似
        let objX = a*Math.cos(angle), objY = b*Math.sin(angle);
        drawCircle(objX, objY, 12, '#3498db');
        
        if(animType==="circular_v") {
            // 接線方向の速度ベクトル
            drawArrow(objX, objY, objX - 50*Math.sin(angle), objY + 50*Math.cos(angle), '#2980b9', 'v');
        } else if(animType==="circular_a" || animType==="circular_f" || animType==="gravity") {
            // 中心向きのベクトル
            drawArrow(objX, objY, objX + (focusX-objX)*0.4, objY + (0-objY)*0.4, animType==="circular_a"?'#27ae60':'#e74c3c', animType==="circular_a"?'a':'F');
        } else if(animType==="centrifugal") {
            // 遠心力
            drawArrow(objX, objY, objX*1.5, objY*1.5, '#e67e22', 'f (遠心力)');
        } else if(animType==="kepler") {
            // 面積の塗りつぶし
            ctx.beginPath(); ctx.moveTo(focusX, 0); ctx.lineTo(objX, objY);
            let prevAngle = angle - 0.3;
            ctx.lineTo(a*Math.cos(prevAngle), b*Math.sin(prevAngle)); ctx.closePath();
            ctx.fillStyle = 'rgba(52, 152, 219, 0.4)'; ctx.fill();
        }
    }
    // ----------------------------------------------------
    // ★ 三角関数の徹底可視化（単振動と円運動の射影）
    // ----------------------------------------------------
    else if(animType.includes("harmonic_sin") || animType.includes("harmonic_v") || animType.includes("harmonic_a")) {
        let R = 80; let omega = 1.5; let angle = time * omega;
        let px = R*Math.cos(angle), py = R*Math.sin(angle); // 円運動の座標
        
        // 参照円
        drawCircle(-150, 0, R, '#bdc3c7', false);
        drawArrow(-150, 0, -150+px, py, '#7f8c8d', 'A (振幅)'); // 半径
        drawAngleMark(-150, 0, 30, 0, angle, "ωt", "#2980b9");
        
        // 射影成分（sin）の抽出
        drawArrow(-150+px, 0, -150+px, py, '#e74c3c', 'A sin(ωt)', true); // sin成分
        ctx.beginPath(); ctx.moveTo(-150+px, py); ctx.lineTo(50, py); ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        
        // 単振動する物体
        drawCircle(50, py, 15, '#2ecc71');
        
        // 時間変化の波形グラフ
        ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.6)'; ctx.lineWidth=2;
        for(let i=0; i<150; i++) ctx.lineTo(50 + i, R*Math.sin(angle - i*0.05));
        ctx.stroke();
        
        if(animType==="harmonic_v") {
            let v = R*omega*Math.cos(angle);
            drawArrow(70, py, 70, py + v*0.5, '#2980b9', 'v');
        } else if(animType==="harmonic_a") {
            let a = -R*omega*omega*Math.sin(angle);
            drawArrow(90, py, 90, py + a*0.3, '#27ae60', 'a');
        }
    }
    // ----------------------------------------------------
    // 熱力学（気体分子とピストン）
    // ----------------------------------------------------
    else if(animType.includes("thermo") || animType.includes("gas") || animType.includes("boyle") || animType.includes("piston") || animType.includes("engine") || animType.includes("temp")) {
        let pw = (animType.includes("boyle") || animType.includes("piston")) ? 80 + Math.sin(time*2)*40 : 120; // ピストン位置
        
        // 容器
        ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100, -80, pw+100, 160);
        ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4; ctx.strokeRect(-100, -80, pw+100, 160);
        
        // ピストン
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(pw, -80, 15, 160);
        if(animType.includes("piston") && Math.sin(time*2)>0) drawArrow(pw+20, 0, pw+60, 0, '#e74c3c', 'W(外へ仕事)');
        if(animType.includes("boyle") && Math.sin(time*2)<0) drawArrow(pw+60, 0, pw+20, 0, '#3498db', '圧縮');
        
        // 分子
        let tempSpeed = animType.includes("temp") ? 1 + (time%4) : 2; // 温度変化
        ctx.fillStyle = animType.includes("temp") ? `rgb(${tempSpeed*50}, 50, 200)` : '#e67e22';
        Math.seedrandom = 1; // 簡易固定シード
        for(let i=1; i<=50; i++) {
            let px = -100 + Math.abs(Math.sin(i*123 + time*tempSpeed*(1+i%2))) * (pw+100);
            let py = -80 + Math.abs(Math.cos(i*321 + time*tempSpeed*(1+i%3))) * 160;
            drawCircle(px, py, 4, ctx.fillStyle);
        }
        
        // 温度計
        ctx.fillStyle = 'white'; ctx.fillRect(-130, -50, 10, 100); ctx.strokeRect(-130, -50, 10, 100);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(-128, 50 - tempSpeed*15, 6, tempSpeed*15); drawCircle(-125, 50, 12, '#e74c3c');
    }
    // ----------------------------------------------------
    // 波動（干渉、ドップラー、正弦波）
    // ----------------------------------------------------
    else if(animType.includes("wave") || animType.includes("sound") || animType==="standing") {
        ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(250, 0); ctx.strokeStyle='#bdc3c7'; ctx.lineWidth=1; ctx.stroke(); // 軸
        ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
        
        if(animType==="standing") {
            // 定常波（青と赤の波が重なる）
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(time*3)*Math.cos(x*0.05)*60);
            ctx.stroke();
            // 腹と節を明示
            for(let x=-250; x<=250; x+=Math.PI/0.05) drawCircle(x, 0, 5, '#e74c3c'); // 節
        } else {
            // 進行波
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(x*0.04 - time*3)*60);
            ctx.stroke();
            // 特定の媒質（赤丸）が上下にしか動かないことを示す
            drawCircle(0, Math.sin(0 - time*3)*60, 10, '#e74c3c');
            drawArrow(20, Math.sin(0 - time*3)*60, 20, Math.sin(0 - time*3)*60 + Math.cos(0 - time*3)*30, '#e74c3c', 'v(媒質)');
        }
    }
    else if(animType==="doppler") {
        let srcX = -100 + (t*30); // 音源移動
        drawCircle(srcX, 0, 8, '#e74c3c');
        ctx.fillText("音源 (vs)", srcX-20, -15);
        for(let i=0; i<10; i++) {
            let emitTime = t - i*0.5;
            if(emitTime>0) drawCircle(-100 + (t-emitTime)*30, 0, emitTime*40, 'rgba(52, 152, 219, 0.5)', false);
        }
    }
    // ----------------------------------------------------
    // ★ 三角関数の徹底可視化（スネルの法則 屈折）
    // ----------------------------------------------------
    else if(animType.includes("refract")) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.1)'; ctx.fillRect(-250, 0, 500, 200); // 媒質2
        ctx.beginPath(); ctx.moveTo(-250, 0); ctx.lineTo(250, 0); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke(); // 境界
        drawArrow(0, -150, 0, 150, '#bdc3c7', '法線', true); // 法線
        
        let angleI = Math.PI/4; // 入射角 i
        let angleR = Math.PI/8; // 屈折角 r (遅い媒質へ)
        let R = 120;
        
        let ix = -R*Math.sin(angleI), iy = -R*Math.cos(angleI);
        let rx = R*Math.sin(angleR), ry = R*Math.cos(angleR);
        
        // 光線
        drawArrow(ix, iy, 0, 0, '#f1c40f', '入射光');
        drawArrow(0, 0, rx, ry, '#f1c40f', '屈折光');
        
        // 角度マーク
        drawAngleMark(0, 0, 40, -Math.PI/2, -Math.PI/2 + angleI, "i", "#e74c3c");
        drawAngleMark(0, 0, 60, Math.PI/2 - angleR, Math.PI/2, "r", "#2980b9");
        
        // ★ sinの成分を物理的に長さとして示す（直角三角形）
        drawArrow(ix, iy, 0, iy, '#e74c3c', 'sin i に比例', true);
        drawArrow(rx, ry, 0, ry, '#2980b9', 'sin r に比例', true);
        ctx.beginPath(); ctx.moveTo(0, iy); ctx.lineTo(ix, iy); ctx.lineTo(ix, 0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(rx, ry); ctx.lineTo(rx, 0); ctx.stroke(); ctx.setLineDash([]);
    }
    // ----------------------------------------------------
    // 電磁気
    // ----------------------------------------------------
    else if(animType.includes("efield") || animType==="coulomb" || animType==="potential") {
        if(animType==="efield_uniform") {
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-120, -80, 240, 15); ctx.fillStyle='white'; ctx.fillText("+++++", -20, -70);
            ctx.fillStyle='#3498db'; ctx.fillRect(-120, 80, 240, 15); ctx.fillStyle='white'; ctx.fillText("-----", -15, 92);
            for(let i=-90; i<=90; i+=30) drawArrow(i, -60, i, 70, '#e74c3c', i===90?'E(電場)':"");
            drawCircle(0, -60 + (t*30)%120, 8, '#f1c40f'); // 電荷の移動
        } else {
            drawCircle(0, 0, 25, '#e74c3c'); ctx.fillStyle='white'; ctx.font="24px Arial"; ctx.fillText("+", -7, 8);
            for(let i=0; i<8; i++) {
                let angle = (Math.PI/4)*i;
                drawArrow(35*Math.cos(angle), 35*Math.sin(angle), 120*Math.cos(angle), 120*Math.sin(angle), '#e74c3c');
            }
            if(animType==="potential") { // 等電位線
                for(let r=50; r<=150; r+=30) drawCircle(0, 0, r, 'rgba(231,76,60,0.3)', false);
            }
        }
    }
    // ----------------------------------------------------
    // ★ 三角関数の徹底可視化（ローレンツ力 F = qvB sinθ）
    // ----------------------------------------------------
    else if(animType==="lorentz_sin") {
        // 磁場 B は奥から手前、または右向き
        for(let y=-80; y<=80; y+=40) drawArrow(-150, y, 150, y, '#2ecc71');
        ctx.fillStyle='#2ecc71'; ctx.fillText("磁場 B", 120, -90);
        
        let v = 100; let angle = -Math.PI/6; // -30度
        let vx = v*Math.cos(angle), vy = v*Math.sin(angle);
        
        drawCircle(0, 0, 12, '#f1c40f'); ctx.fillStyle='black'; ctx.fillText("-e", -8, 4);
        
        drawArrow(0, 0, vx, vy, '#3498db', 'v (速度)');
        drawAngleMark(0, 0, 40, angle, 0, "θ");
        
        // 成分分解
        drawArrow(0, 0, 0, vy, '#e74c3c', 'v sinθ (磁場を横切る=力を受ける)', true);
        drawArrow(0, 0, vx, 0, '#95a5a6', 'v cosθ (磁場と平行=力0)', true);
        
        // ローレンツ力 (フレミング左手) Bは右(x), v_sinは上(-y), 電子(-)なので力は奥(z)。
        // 2Dでは表現しづらいので、垂直方向の力を強調。
        ctx.beginPath(); ctx.moveTo(0,vy); ctx.lineTo(vx,vy); ctx.lineTo(vx,0); ctx.strokeStyle='#bdc3c7'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
    }
    // ----------------------------------------------------
    // ★ 三角関数の徹底可視化（磁束 Φ = BS cosθ）
    // ----------------------------------------------------
    else if(animType==="flux_cos" || animType==="flux") {
        ctx.beginPath(); ctx.ellipse(0, 0, 100, 30, 0, 0, Math.PI*2); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke(); // コイル面
        ctx.fillStyle='rgba(52, 73, 94, 0.1)'; ctx.fill();
        
        drawArrow(0, 0, 0, -120, '#7f8c8d', '面の法線 (垂直)', true);
        
        let B = 140; let angle = -Math.PI/4;
        let Bx = B*Math.sin(angle), By = -B*Math.cos(angle);
        
        drawArrow(0, 0, Bx, By, '#2ecc71', '磁場 B');
        drawAngleMark(0, 0, 40, -Math.PI/2, angle - Math.PI/2, "θ");
        
        // B cosθ の分解
        drawArrow(0, 0, 0, By, '#e74c3c', 'B cosθ (面を垂直に貫く成分)', true);
        drawArrow(0, By, Bx, By, '#95a5a6', 'B sinθ (貫かない)', true);
    }
    // ----------------------------------------------------
    // ★ 三角関数の徹底可視化（交流発生 V = V0 sinωt）
    // ----------------------------------------------------
    else if(animType.includes("ac_gen") || animType.includes("ac")) {
        let R = 60; let omega = 2; let angle = time * omega;
        
        // 発電機の回転モデル
        drawCircle(-150, 0, R, '#bdc3c7', false);
        drawArrow(-150, 0, -150+R*Math.cos(angle), R*Math.sin(angle), '#3498db', 'コイル面の回転');
        drawAngleMark(-150, 0, 25, 0, angle, "ωt");
        
        // サイン成分の取り出し
        drawArrow(-150+R*Math.cos(angle), 0, -150+R*Math.cos(angle), R*Math.sin(angle), '#e74c3c', 'V0 sin(ωt)', true);
        
        // 波形グラフ
        ctx.beginPath(); ctx.moveTo(-150+R*Math.cos(angle), R*Math.sin(angle)); ctx.lineTo(0, R*Math.sin(angle)); 
        ctx.strokeStyle='#e74c3c'; ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);
        
        drawCircle(0, R*Math.sin(angle), 8, '#e74c3c');
        ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=3;
        for(let i=0; i<200; i++) ctx.lineTo(i, R*Math.sin(angle - i*0.05));
        ctx.stroke();
    }
    // ----------------------------------------------------
    // 原子（ボーア模型など）
    // ----------------------------------------------------
    else if(animType.includes("bohr") || animType==="energy_level") {
        drawCircle(0, 0, 20, '#e74c3c'); ctx.fillStyle='white'; ctx.fillText("+", -5, 5); // 原子核
        
        drawCircle(0, 0, 60, '#bdc3c7', false); ctx.fillStyle='#bdc3c7'; ctx.fillText("n=1", 65, 0);
        drawCircle(0, 0, 120, '#bdc3c7', false); ctx.fillText("n=2", 125, 0);
        
        let orbit = (Math.floor(time) % 2 === 0) ? 120 : 60; // 軌道ジャンプ
        let ex = orbit*Math.cos(time*3), ey = orbit*Math.sin(time*3);
        drawCircle(ex, ey, 10, '#3498db'); ctx.fillStyle='white'; ctx.fillText("-", ex-3, ey+3);
        
        // 光子放出
        if(orbit === 60 && (time%1)<0.3) {
            ctx.beginPath(); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2;
            for(let i=0; i<50; i++) ctx.lineTo(ex + i*3, ey + Math.sin(i*0.5)*10);
            ctx.stroke();
            ctx.fillStyle='#f1c40f'; ctx.fillText("hν (光子放出)", ex+150, ey);
        }
    }
    else {
        // その他一般的なアニメーション（原子核崩壊など）
        ctx.fillStyle='#7f8c8d'; ctx.font="20px Arial"; ctx.fillText("詳細シミュレーション再生中...", -120, -50);
        drawCircle(Math.cos(time*2)*40, Math.sin(time*2)*40, 15, '#3498db');
        drawCircle(-Math.cos(time*2)*40, -Math.sin(time*2)*40, 15, '#e74c3c');
    }

    ctx.restore();
}

// === 初回描画の開始 ===
render();
