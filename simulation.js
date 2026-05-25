// ==========================================
// 高校物理 2Dシミュレーションエンジン (完全網羅・高精度版)
// ==========================================

const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

// 1. メニューおよび公式カードの動的構築
if (typeof physicsData !== 'undefined') {
    Object.keys(physicsData).forEach(key => {
        const data = physicsData[key];
        // 章ごとにグループ分けしてヘッダーを生成
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

        // 単元項目の生成
        const li = document.createElement('li');
        li.className = 'item';
        li.innerText = data.title;
        li.onclick = () => {
            document.querySelectorAll('.chapter-list .item').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            document.getElementById('unit-title').innerText = data.title;
            
            // 右下パネルの公式カードコンテナをクリア＆再生成
            const container = document.getElementById('formula-cards-container');
            container.innerHTML = "";
            
            data.formulas.forEach((f, idx) => {
                const card = document.createElement('div');
                card.className = "formula-card";
                card.innerHTML = `
                    <h3>${f.name}</h3>
                    <div class="math-box">\\[ ${f.math} \\]</div>
                    <div class="desc-section"><strong>いつ使う？</strong><br>${f.usage}</div>
                    <div class="desc-section"><strong>式の意味・物理的背景</strong><br>${f.reason}</div>
                `;
                // カードクリックでアニメーション切り替え
                card.onclick = () => {
                    document.querySelectorAll('.formula-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    document.getElementById('sim-desc').innerText = f.simText;
                    setAnimation(f.animType);
                };
                container.appendChild(card);
                // 初期状態として最初のカードを選択
                if(idx === 0) card.click();
            });
            // MathJaxで数式を美しくレンダリング
            if (window.MathJax) MathJax.typesetPromise();
        };
        chapUl.appendChild(li);
    });
    // 起動時に最初の項目を自動クリック
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
    canvas.width = rect.width; 
    canvas.height = rect.height; 
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

// 3. コントロールUIのイベント制御
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) {
    speedSlider.addEventListener('input', e => {
        document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x";
    });
}
const zoomSlider = document.getElementById('zoomSlider');
if(zoomSlider) {
    zoomSlider.addEventListener('input', e => {
        scale = parseFloat(e.target.value);
        document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x";
    });
}
const playBtn = document.getElementById('playBtn');
if(playBtn) {
    playBtn.onclick = () => {
        isPlaying = !isPlaying;
        playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生";
        playBtn.classList.toggle('paused', !isPlaying);
    };
}
const resetBtn = document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick = () => setAnimation(animType);

// 4. マウス・トラックパッド操作による視点移動（パン・ズーム）
canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', e => { 
    if(isDragging) { 
        panX += e.clientX - lastX; 
        panY += e.clientY - lastY; 
        lastX = e.clientX; 
        lastY = e.clientY; 
    } 
});
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('wheel', e => { 
    e.preventDefault(); 
    scale = Math.max(0.5, Math.min(4.0, scale + (e.deltaY > 0 ? -0.1 : 0.1))); 
    if(zoomSlider) zoomSlider.value = scale; 
    if(document.getElementById('zoomVal')) document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; 
}, { passive: false });

// ====================================================
// 5. 描画高度ユーティリティ (文字の視認性、美しい矢印)
// ====================================================
function dLine(x1, y1, x2, y2, color, w=2, dash=[]) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
}

function dA(x1, y1, x2, y2, color, label="", dashed=false) { 
    dLine(x1, y1, x2, y2, color, 2, dashed ? [5,5] : []);
    if(Math.abs(x1 - x2) < 0.1 && Math.abs(y1 - y2) < 0.1) return;
    const a = Math.atan2(y2-y1, x2-x1);
    ctx.beginPath(); 
    ctx.moveTo(x2, y2); 
    ctx.lineTo(x2 - 12*Math.cos(a-0.35), y2 - 12*Math.sin(a-0.35)); 
    ctx.lineTo(x2 - 12*Math.cos(a+0.35), y2 - 12*Math.sin(a+0.35)); 
    ctx.fillStyle = color; ctx.fill();
    if(label) dMath(label, x2 + 15*Math.cos(a), y2 + 15*Math.sin(a) + 5, color);
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
    ctx.fillStyle = color + "22"; ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    let m = (a1+a2)/2; 
    dMath(label, x + (r+18)*Math.cos(m) - 4, y + (r+18)*Math.sin(m) + 6, color);
}

function dTxt(t, x, y, c="#2c3e50", f="15px 'Helvetica Neue', Arial, sans-serif") {
    ctx.font = f; ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.95)"; ctx.shadowBlur = 4;
    ctx.fillText(t, x, y); ctx.shadowBlur = 0;
}

function dMath(t, x, y, c="#2c3e50", size=19) {
    ctx.font = `italic ${size}px 'Times New Roman', serif`; ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.95)"; ctx.shadowBlur = 4;
    ctx.fillText(t, x, y); ctx.shadowBlur = 0;
}

function dFormula(t, x, y) {
    ctx.font = "italic 18px 'Times New Roman', serif";
    const w = ctx.measureText(t).width + 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.shadowColor = "rgba(0,0,0,0.1)"; ctx.shadowBlur = 5;
    ctx.fillRect(x, y - 24, w, 34); ctx.shadowBlur = 0;
    ctx.strokeStyle = "#e74c3c"; ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y - 24, w, 34);
    ctx.fillStyle = "#c0392b"; ctx.fillText(t, x + 15, y);
}

function drawAxis(ox, oy, w, h, xL, yL) {
    dA(ox, oy, ox, oy-h, '#7f8c8d', yL); dA(ox, oy, ox+w, oy, '#7f8c8d', xL);
    dMath("O", ox-15, oy+15, '#7f8c8d');
}

// ====================================================
// 6. メイン描画ループ (フィジックス演算・レンダリング)
// ====================================================
function render() {
    requestAnimationFrame(render);
    try {
        let speed = (speedSlider) ? parseFloat(speedSlider.value) : 1.0;
        if(isPlaying) time += 0.03 * speed;
        
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        
        ctx.save();
        ctx.translate(w/2 + panX, h/2 + panY); 
        ctx.scale(scale, scale);

        // 背景方眼グリッド
        for(let i=-1000; i<=1000; i+=25) { 
            ctx.strokeStyle = (i % 100 === 0) ? '#e2e8f0' : '#f1f5f9'; 
            ctx.lineWidth = (i % 100 === 0) ? 1.5 : 0.8;
            dLine(i, -1000, i, 1000, ctx.strokeStyle); 
            dLine(-1000, i, 1000, i, ctx.strokeStyle); 
        }
        // 主要中心軸
        dLine(-1000, 0, 1000, 0, '#94a3b8', 1.5); 
        dLine(0, -1000, 0, 1000, '#94a3b8', 1.5); 

        if(!animType) { 
            dTxt("左メニューから単元を選択してください。", -130, 0, "#64748b", "16px sans-serif"); 
            ctx.restore(); return; 
        }

        // ----------------------------------------------------
        // 分野1: 力学 (直線運動・仕事・落体・ばね・衝突・円運動)
        // ----------------------------------------------------
        if (animType === "work_cos") {
            dFormula("W = F x cosθ", -60, -140);
            dLine(-250, 50, 250, 50, '#475569', 3);
            let loopT = time % 6;
            let x = -150 + loopT * 50;
            dB(x, 25, 60, 50, '#3b82f6'); dMath("m", x-8, 30, "white");
            
            let ang = -Math.PI / 6;
            let Fx = 120 * Math.cos(ang), Fy = 120 * Math.sin(ang);
            dA(x, 25, x + Fx, 25 + Fy, '#e67e22', 'F');
            dAng(x, 25, 40, ang, 0, "θ", "#e67e22");
            dA(x, 25, x + Fx, 25, '#ef4444', 'F cosθ');
            dLine(x + Fx, 25, x + Fx, 25 + Fy, '#94a3b8', 1.5, [4,4]);
            dA(-150, 70, x, 70, '#10b981', 'x');
        }
        else if (animType === "linear_motion" || animType === "accel_motion") {
            dFormula(animType === "linear_motion" ? "v = v₀ (一定)" : "x = v₀t + 1/2 at²", -100, -140);
            dLine(-300, 50, 300, 50, '#475569', 3);
            let isAccel = (animType === "accel_motion");
            let a = isAccel ? 25 : 0;
            let v0 = 40;
            let loopT = time % 5;
            let x = -200 + v0 * loopT + 0.5 * a * loopT * loopT;
            let v = v0 + a * loopT;
            if (x > 260) x = 260; // 端で停止またはループ

            dB(x, 25, 50, 50, '#3b82f6');
            dA(x, 10, x + v * 0.8, 10, '#2563eb', 'v');
            if(isAccel) dA(x, -15, x + a * 1.5, -15, '#16a34a', 'a');
            
            // グラフ描画 (右上にミニグラフ)
            drawAxis(100, -60, 120, 80, "t", isAccel?"v":"x");
            ctx.beginPath(); ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2;
            for(let i=0; i<=loopT; i+=0.1) {
                let gx = 100 + i * 20;
                let gy = -60 - (isAccel ? (v0 + a*i)*0.4 : (v0*i)*0.3);
                ctx.lineTo(gx, gy);
            }
            ctx.stroke();
        }
        else if (animType.includes("fall") || animType.includes("throw")) {
            dFormula("y = v₀t + 1/2 g t²", -80, -150);
            let loopT = time % 4;
            let startY = animType.includes("up") ? 120 : -120;
            let v0y = animType.includes("up") ? -140 : (animType.includes("down") ? 60 : 0);
            let g = 60;
            let y = startY + v0y * loopT + 0.5 * g * loopT * loopT;
            let vy = v0y + g * loopT;
            if(y > 160) y = 160;

            dLine(-100, startY, 100, startY, '#64748b', 1, [4,4]);
            dC(0, y, 16, '#ef4444'); dMath("m", -6, y+6, "white");
            dA(20, y, 20, y + vy * 0.5, '#2563eb', 'v');
            dA(-20, y, -20, y + g * 0.6, '#16a34a', 'g');
        }
        else if (animType === "spring_motion") {
            dFormula("F = -kx", -40, -140);
            let dispX = Math.sin(time * 2.5) * 80;
            // 固定壁
            ctx.fillStyle = '#64748b'; ctx.fillRect(-160, -30, 15, 80);
            // ばねコイルの描画
            ctx.beginPath(); ctx.moveTo(-145, 10);
            let turns = 12;
            let stepX = (dispX - 30 - (-145)) / turns;
            for(let i=0; i<turns; i++) {
                ctx.lineTo(-145 + stepX*(i+0.5), 10 + (i%2===0 ? -20 : 20));
            }
            ctx.lineTo(dispX - 30, 10); ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.stroke();
            // 物体
            dB(dispX, 10, 60, 50, '#8b5cf6'); dMath("m", dispX-8, 15, "white");
            // 力のベクトル
            dA(dispX, 10, dispX - dispX * 1.2, 10, '#ef4444', 'F');
            drawAxis(0, 65, 100, 10, "x", "");
        }
        else if (animType === "momentum_collision") {
            dFormula("m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'", -120, -140);
            let loopT = time % 4;
            let x1, x2, v1, v2;
            if(loopT < 1.8) { // 衝突前
                x1 = -160 + loopT * 70; x2 = 20;
                v1 = 70; v2 = 0;
            } else { // 衝突後 (完全弾性衝突の例 m1=m2)
                x1 = -160 + 1.8 * 70; 
                x2 = 20 + (loopT - 1.8) * 70;
                v1 = 0; v2 = 70;
            }
            dC(x1, 0, 20, '#3b82f6'); dMath("m₁", x1-12, 6, "white");
            if(v1 > 0) dA(x1, -25, x1 + v1*0.6, -25, '#2563eb', 'v₁');
            dC(x2, 0, 20, '#ef4444'); dMath("m₂", x2-12, 6, "white");
            if(v2 > 0) dA(x2, -25, x2 + v2*0.6, -25, '#dc2626', 'v₂\'');
            dLine(-220, 20, 220, 20, '#64748b', 2);
        }
        else if (animType === "circular_motion") {
            dFormula("F = m r ω²", -50, -150);
            let r = 90;
            dC(0, 0, r, '#cbd5e1', false);
            dC(0, 0, 6, '#eab308'); // 中心点
            let omega = 1.8;
            let ang = time * omega;
            let bx = r * Math.cos(ang), by = r * Math.sin(ang);
            
            dLine(0, 0, bx, by, '#64748b', 1.5);
            dC(bx, by, 16, '#3b82f6'); dMath("m", bx-8, by+6, "white");
            // 速度ベクトル（接線方向）
            dA(bx, by, bx - 60*Math.sin(ang), by + 60*Math.cos(ang), '#2563eb', 'v');
            // 向心力ベクトル（中心方向）
            dA(bx, by, bx * 0.5, by * 0.5, '#ef4444', 'F');
        }

        // ----------------------------------------------------
        // 分野2: 熱力学 (ボイル・シャルル、第一法則)
        // ----------------------------------------------------
        else if (animType.includes("gas_")) {
            dFormula(animType === "gas_law" ? "pV = nRT" : "ΔU = Q + W", -60, -150);
            let pW = 80 + Math.sin(time * 2) * 40; // ピストンの可動域
            // シリンダー枠
            ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
            ctx.strokeRect(-120, -60, pW + 120, 120);
            // ピストン壁
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(pW, -59, 16, 118);
            
            // 外力または仕事の矢印
            if(Math.sin(time * 2) > 0) {
                dA(pW + 50, 0, pW + 10, 0, '#ef4444', 'W');
            }
            // 分子運動のシミュレーション（ランダム風に配置）
            for(let i=1; i<=25; i++) {
                let px = -110 + Math.abs(Math.sin(i*13 + time*2.2)) * (pW + 105);
                let py = -50 + Math.abs(Math.cos(i*29 + time*1.8)) * 100;
                dC(px, py, 4, '#e67e22');
            }
            dMath("V", -90, -75, '#475569', 22);
        }

        // ----------------------------------------------------
        // 分野3: 波動 (波の基本・ドップラー効果)
        // ----------------------------------------------------
        else if (animType === "wave_base") {
            dFormula("v = f λ", -40, -150);
            drawAxis(-200, 0, 400, 80, "x", "y");
            ctx.beginPath(); ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 3;
            for(let x=-200; x<=200; x+=4) {
                let y = Math.sin(x * 0.03 - time * 3.5) * 55;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            // 媒質の1点（赤丸）の上下運動
            let ry = Math.sin(0 - time * 3.5) * 55;
            dC(0, ry, 8, '#ef4444');
            dA(0, ry, 0, ry + Math.cos(-time*3.5)*30, '#ef4444');
        }
        else if (animType === "doppler_effect") {
            dFormula("f' = f (V / V - v_s)", -80, -150);
            let loopT = time % 4.5;
            let sx = -140 + loopT * 40; // 音源の移動
            dC(sx, 0, 10, '#ef4444'); dA(sx, 0, sx + 35, 0, '#dc2626', 'v_s');
            
            // パルス状の音波群
            for(let i=0; i<5; i++) {
                let age = loopT - i * 0.8;
                if(age > 0) {
                    let waveR = age * 60; // 音速Vによる広がり
                    let waveX = -140 + (i * 0.8) * 40; // 放出された瞬間の音源位置
                    ctx.beginPath(); ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
                    ctx.lineWidth = 2; ctx.arc(waveX, 0, waveR, 0, Math.PI*2); ctx.stroke();
                }
            }
            // 観測者
            dC(120, 0, 12, '#10b981'); dMath("Obs", 105, 25);
        }

        // ----------------------------------------------------
        // 分野4: 光学 (屈折・レンズの法則)
        // ----------------------------------------------------
        else if (animType === "light_refract") {
            dFormula("n = sin i / sin r", -70, -160);
            // 境界（水・ガラス面など）
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'; ctx.fillRect(-200, 0, 400, 150);
            dLine(-200, 0, 200, 0, '#334155', 2.5);
            dLine(0, -140, 0, 140, '#94a3b8', 1, [5,5]); // 法線
            
            let iAng = Math.PI / 4;   // 入射角 45度
            let rAng = Math.PI / 6.5; // 屈折角 約28度
            
            // 入射光
            let ix = -130 * Math.sin(iAng), iy = -130 * Math.cos(iAng);
            dA(ix, iy, 0, 0, '#eab308', '入射光');
            dAng(0, 0, 45, -Math.PI/2, -Math.PI/2 + iAng, "i", '#ef4444');
            
            // 屈折光
            let rx = 130 * Math.sin(rAng), ry = 130 * Math.cos(rAng);
            dA(0, 0, rx, ry, '#eab308', '屈折光');
            dAng(0, 0, 45, Math.PI/2 - rAng, Math.PI/2, "r", '#2563eb');
        }

        // ----------------------------------------------------
        // 分野5: 電磁気 (クーロン力・コンデンサー・回路)
        // ----------------------------------------------------
        else if (animType === "coulomb_force") {
            dFormula("F = k (q₁q₂ / r²)", -70, -140);
            dC(-90, 0, 18, '#ef4444'); dMath("+q₁", -105, -25);
            dC(90, 0, 18, '#3b82f6'); dMath("-q₂", 75, -25);
            // 相互作用の引力矢印
            dA(-90, 0, -35, 0, '#ef4444', 'F');
            dA(90, 0, 35, 0, '#2563eb', 'F');
            dLine(-90, 0, 90, 0, '#cbd5e1', 1.5, [4,4]);
            dMath("r", -5, -12);
        }
        else if (animType === "capacitor_field") {
            dFormula("C = ε (S / d)", -60, -140);
            // 極板
            dLine(-80, -45, 80, -45, '#ef4444', 7); dMath("+Q", 95, -40, '#ef4444');
            dLine(-80, 45, 80, 45, '#3b82f6', 7); dMath("-Q", 95, 50, '#3b82f6');
            // 電場線
            for(let x=-60; x<=60; x+=30) {
                dA(x, -40, x, 40, '#10b981');
            }
            dMath("E", -15, 5, '#10b981', 22);
        }

        // ----------------------------------------------------
        // 分野6: 原子 (光電効果・ボーアモデル)
        // ----------------------------------------------------
        else if (animType === "photo_electric") {
            dFormula("K_{max} = hν - W", -70, -140);
            // 金属板
            ctx.fillStyle = '#94a3b8'; ctx.fillRect(-120, 40, 240, 16);
            dTxt("金属ターゲット", -45, 75, '#475569');
            
            let loopT = time % 3;
            // 入射光子パルス
            let lx = -130 + loopT * 60, ly = -80 + loopT * 60;
            if (loopT < 1.5) {
                ctx.beginPath(); ctx.strokeStyle = '#eab308'; ctx.lineWidth = 3;
                // 波形を描画
                for(let i=0; i<20; i++) {
                    ctx.lineTo(lx + i*1.5, ly + Math.sin(i*1.2)*10);
                }
                ctx.stroke();
                dMath("hν", lx-15, ly-10, '#eab308');
            } else {
                // 電子飛び出し
                let ex = (loopT - 1.5) * 80;
                let ey = 40 - (loopT - 1.5) * 50;
                dC(ex, ey, 6, '#3b82f6');
                dA(ex, ey, ex + 30, ey - 18, '#2563eb', 'e⁻');
            }
        }
        else if (animType === "bohr_model") {
            dFormula("E_n - E_m = hν", -70, -150);
            // 原子核
            dC(0, 0, 14, '#ef4444'); dMath("+Ze", -16, 5, "white", 14);
            // 軌道
            dC(0, 0, 60, '#cbd5e1', false);
            dC(0, 0, 110, '#cbd5e1', false);
            
            let rot = time * 1.5;
            let ex = 60 * Math.cos(rot), ey = 60 * Math.sin(rot);
            dC(ex, ey, 7, '#3b82f6'); dMath("e⁻", ex+10, ey+5, '#2563eb');
            dTxt("n = 1", 65, 0, '#64748b');
            dTxt("n = 2", 115, 0, '#64748b');
        }
        else {
            // 万が一、定義漏れがあった場合のセーフティ
            dFormula("E = m c²", -40, -140);
            dC(0, 0, Math.abs(Math.sin(time))*40 + 10, '#ec4899');
        }

        ctx.restore();
    } catch (e) {
        console.error("Render Error:", e);
        ctx.fillStyle = "#ef4444";
        ctx.fillText("エラーが発生しました: " + e.message, 20, 40);
    }
}

// 描画ループ起動
render();
