// ==========================================
// 高校物理 2Dシミュレーションエンジン (第1回 力学編・高品質＆公式なし版)
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
}

// コントロールUI
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const playBtn = document.getElementById('playBtn');
if(playBtn) playBtn.onclick = () => { isPlaying = !isPlaying; playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
const resetBtn = document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick = () => setAnimation(animType);

// ====================================================
// 高品質な描画ユーティリティ
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

function dMath(t, x, y, c="#2c3e50", size=20) {
    ctx.font = `italic ${size}px 'Times New Roman', serif`;
    ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 5;
    ctx.fillText(t, x, y);
    ctx.shadowBlur = 0;
}

// ====================================================
// メインループ
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

        // 美しい背景グリッド
        ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
        for(let i=-1000; i<=1000; i+=20) { 
            if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5'; 
            dLine(i,-1000,i,1000,ctx.strokeStyle); dLine(-1000,i,1000,i,ctx.strokeStyle); 
        }
        dLine(-1000, 0, 1000, 0, '#b2bec3', 2); // X軸

        let t = time % 6; 
        if(!animType) { ctx.restore(); return; }

        // ----------------------------------------------------
        // 仕事と三角比 (公式を削除、記号のみ)
        // ----------------------------------------------------
        if (animType === "work_cos") {
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
            let x = -100 + t*30; if(x > 150) time=0;
            dB(x, 20, 50, 40, '#3498db'); dMath("m", x-10, 25, "white");
            let F = 100, ang = -Math.PI/6; let Fx = F*Math.cos(ang), Fy = F*Math.sin(ang);
            
            dA(x, 0, x+Fx, Fy, '#7f8c8d', 'F'); 
            dAng(x, 0, 40, ang, 0, "θ", "#e67e22");
            dA(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ'); 
            dLine(x+Fx, 0, x+Fx, Fy, '#bdc3c7', 2, [5,5]); 
            dA(-100, 60, x, 60, '#2ecc71', 'x');
        }
        // ----------------------------------------------------
        // 等加速度直線運動 (公式を削除)
        // ----------------------------------------------------
        else if (animType.includes("linear") || animType.includes("accel")) {
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-300, 40, 600, 5); 
            let a = animType.includes("linear") ? 0 : 20;
            let v0 = 40; let x = -200 + v0*t + 0.5*a*t*t; let v = v0 + a*t;
            if(x > 250) time = 0;
            
            dB(x, 20, 50, 40, '#3498db'); dMath("m", x-8, 25, "white");
            dA(x, -10, x + v, -10, '#2980b9', 'v');
            if(a > 0) dA(x, -40, x + a*3, -40, '#27ae60', 'a');
            dA(-200, 60, x, 60, '#8e44ad', 'x');
        }
        // ----------------------------------------------------
        // 落体の運動
        // ----------------------------------------------------
        else if (animType.includes("fall") || animType.includes("throw")) {
            let startY = animType.includes("throw") && !animType.includes("down") ? 100 : -100;
            let v0y = 0, g = 50;
            if(animType.includes("fall_v0")) v0y = 50; 
            if(animType.includes("throw") && !animType.includes("down")) v0y = -130; 
            
            let cy = startY + v0y*t + 0.5*g*t*t; let cvy = v0y + g*t;
            if(cy > 180 && t>0.5) time=0;

            dLine(-100, startY, 100, startY, '#7f8c8d', 1, [5,5]); dMath("y=0", 50, startY-10, '#7f8c8d');

            dC(0, cy, 15, '#e74c3c'); dMath("m", -8, cy+6, "white");
            dA(25, cy, 25, cy+cvy*0.4, '#2980b9', 'v'); 
            dA(-25, cy, -25, cy+g*0.6, '#27ae60', 'g');
            dA(-60, startY, -60, cy, '#8e44ad', 'y', true);
            
            if(v0y !== 0 && t < 0.8) dA(0, startY, 0, startY+v0y*0.4, '#e67e22', 'v₀');
        }
        // ----------------------------------------------------
        // 運動量と力積 (美しい等質量弾性衝突に修正)
        // ----------------------------------------------------
        else if (animType.includes("momentum") || animType.includes("impulse") || animType.includes("collision")) {
            let t2 = time % 4;
            dLine(-300, 20, 300, 20, '#bdc3c7', 4); // 地面
            
            let x1, x2, v1, v2;
            if (t2 < 2.0) {
                // 衝突前: 青が進み、赤は停止
                x1 = -150 + 75 * t2; 
                x2 = 0; 
                v1 = 75; v2 = 0;
            } else {
                // 衝突後: 青が止まり、赤が進む
                x1 = 0; 
                x2 = 0 + 75 * (t2 - 2.0); 
                v1 = 0; v2 = 75;
            }
            
            dC(x1, 0, 20, '#3498db'); dMath("m₁", x1-12, 6, "white"); 
            if(v1 > 0) dA(x1, -30, x1+60, -30, '#2980b9', 'v₁');
            
            dC(x2, 0, 20, '#e74c3c'); dMath("m₂", x2-12, 6, "white"); 
            if(v2 > 0) dA(x2, -30, x2+60, -30, '#e74c3c', "v₂'");
        }
        // ----------------------------------------------------
        // モーメント (独立・高品質なシーソー)
        // ----------------------------------------------------
        else if (animType === "moment" || animType.includes("balance")) {
            let a = animType === "moment" ? Math.sin(time)*0.2 : 0;
            ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(-20,80); ctx.lineTo(20,80); ctx.fillStyle='#7f8c8d'; ctx.fill(); // 支点
            ctx.translate(0,30); ctx.rotate(a);
            ctx.fillStyle='#f39c12'; ctx.fillRect(-120,-5,240,10); // 棒
            
            dB(-80,-20,30,30,'#3498db'); dA(-80,-20,-80,50,'#e74c3c','F₁'); 
            dA(0, -35, -80, -35, '#2ecc71', 'l₁');
            
            dB(80,-25,40,40,'#e74c3c'); dA(80,-25,80,70,'#e74c3c','F₂'); 
            dA(0, -35, 80, -35, '#2ecc71', 'l₂');
        }
        else {
            dMath("開発中", -30, 0, "#7f8c8d");
        }
    } catch (e) {
        ctx.fillStyle = "red";
        ctx.fillText("Error: " + e.message, -150, 0);
    }
    ctx.restore();
}
render();
