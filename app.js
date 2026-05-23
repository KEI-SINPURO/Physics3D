// ==========================================
// 高校物理 2Dシミュレーションエンジン (第1回 力学編・オリジナルデザイン版)
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

// コントロールUI
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const playBtn = document.getElementById('playBtn');
if(playBtn) playBtn.onclick = () => { isPlaying = !isPlaying; playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
const resetBtn = document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick = () => setAnimation(animType);

// --- シンプルな描画補助関数（元のデザインに寄せる） ---
function drawArrow(x, y, dx, dy, color, label) {
    const headlen = 10;
    const angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + dx, y + dy);
    ctx.lineTo(x + dx - headlen * Math.cos(angle - Math.PI / 6), y + dy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x + dx - headlen * Math.cos(angle + Math.PI / 6), y + dy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
    
    if (label) {
        ctx.font = "italic 18px serif";
        ctx.fillText(label, x + dx + 5, y + dy + 5);
    }
}

function drawText(text, x, y, color = "#000") {
    ctx.fillStyle = color;
    ctx.font = "italic 18px serif";
    ctx.fillText(text, x, y);
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
        ctx.translate(w/2, h/2); // 中央を原点に

        // 地面の描画 (共通)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-w/2, 50);
        ctx.lineTo(w/2, 50);
        ctx.stroke();

        if(!animType) { ctx.restore(); return; }

        // ----------------------------------------------------
        // 1. 等加速度直線運動 / 等速直線運動
        // ----------------------------------------------------
        if (animType.includes("linear") || animType.includes("accel")) {
            let a = animType.includes("linear") ? 0 : 20; // 加速度
            let v0 = 40; // 初速度
            let x = -200 + v0*time + 0.5*a*time*time; 
            let v = v0 + a*time;
            if(x > 250) time = 0; // ループ
            
            // 物体
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x - 20, 10, 40, 40);
            drawText("m", x - 8, 35, "#fff"); // 質量mを追加
            
            // 速度ベクトル v
            drawArrow(x, 0, v, 0, "blue", "v");
            
            // 加速度ベクトル a
            if(a > 0) {
                drawArrow(x, -30, a*2, 0, "red", "a");
            }
            // 変位 x
            drawArrow(-200, 70, (x + 200), 0, "purple", "x");
        }
        // ----------------------------------------------------
        // 2. 落体の運動 (自由落下・投げ下ろし・投げ上げ)
        // ----------------------------------------------------
        else if (animType.includes("fall") || animType.includes("throw")) {
            let startY = animType.includes("throw") && !animType.includes("down") ? 50 : -150;
            let v0y = 0, g = 50;
            if(animType.includes("fall_v0")) v0y = 50; // 投げ下ろし
            if(animType.includes("throw") && !animType.includes("down")) v0y = -120; // 投げ上げ
            
            let cy = startY + v0y*time + 0.5*g*time*time; 
            let cvy = v0y + g*time;
            if(cy > 150) time=0;

            // 物体
            ctx.fillStyle = '#FF5722';
            ctx.beginPath();
            ctx.arc(0, cy, 15, 0, Math.PI*2);
            ctx.fill();
            drawText("m", -7, cy + 5, "#fff");

            // 速度ベクトル v と 重力加速度 g
            drawArrow(20, cy, 0, cvy * 0.5, "blue", "v"); 
            drawArrow(-30, cy, 0, g * 0.8, "red", "g");

            // 初速度 v0 (最初の少しの間だけ表示)
            if(v0y !== 0 && time < 0.5) {
                drawArrow(0, startY, 0, v0y * 0.5, "orange", "v₀");
            }
        }
        // ----------------------------------------------------
        // 3. 仕事 (W = Fx cosθ)
        // ----------------------------------------------------
        else if (animType.includes("work")) {
            let x = -100 + time*30; 
            if(x > 150) time=0;

            // 物体
            ctx.fillStyle = '#00BCD4';
            ctx.fillRect(x - 25, 10, 50, 40);
            drawText("m", x - 8, 35, "#fff");

            // 力 F と 角度 θ
            drawArrow(x, 10, 80, -40, "red", "F");
            drawText("θ", x + 30, 5, "black");

            // 移動距離 x
            drawArrow(-100, 70, (x + 100), 0, "purple", "x");
        }
        // ----------------------------------------------------
        // 4. 運動量と力積 (momentum / collision) ※モーメントと分離
        // ----------------------------------------------------
        else if (animType === "momentum" || animType.includes("collision") || animType.includes("impulse")) {
            let t2 = time % 4;
            let isCollided = t2 >= 2.0;

            let x1 = isCollided ? -20 - (t2-2)*40 : -150 + t2*65; 
            let x2 = isCollided ? 20 + (t2-2)*80 : 20; 
            
            // 物体1
            ctx.fillStyle = '#2196F3';
            ctx.beginPath(); ctx.arc(x1, 30, 20, 0, Math.PI*2); ctx.fill();
            drawText("m₁", x1 - 10, 35, "#fff");
            drawArrow(x1, 0, isCollided ? -30 : 60, 0, "blue", isCollided ? "v₁'" : "v₁");

            // 物体2
            ctx.fillStyle = '#E91E63';
            ctx.beginPath(); ctx.arc(x2, 30, 20, 0, Math.PI*2); ctx.fill();
            drawText("m₂", x2 - 10, 35, "#fff");
            if(isCollided) {
                drawArrow(x2, 0, 80, 0, "red", "v₂'");
            } else {
                drawText("v₂=0", x2 - 15, -10, "red");
            }
        }
        // ----------------------------------------------------
        // 5. 力のモーメント (moment) ※運動量と分離
        // ----------------------------------------------------
        else if (animType === "moment" || animType.includes("balance")) {
            // 支点
            ctx.fillStyle = '#795548';
            ctx.beginPath();
            ctx.moveTo(0, 50); ctx.lineTo(-20, 90); ctx.lineTo(20, 90);
            ctx.fill();

            // 棒 (少し揺らす)
            let angle = Math.sin(time) * 0.1;
            ctx.save();
            ctx.translate(0, 50);
            ctx.rotate(angle);

            ctx.fillStyle = '#FFC107';
            ctx.fillRect(-120, -5, 240, 10);

            // 左の力
            drawArrow(-80, 0, 0, 60, "red", "F₁");
            drawArrow(0, -20, -80, 0, "green", "l₁");

            // 右の力
            drawArrow(80, 0, 0, 60, "red", "F₂");
            drawArrow(0, -20, 80, 0, "green", "l₂");

            ctx.restore();
        }
        else {
            drawText("シミュレーション準備中...", -80, 0);
        }
    } catch (e) {
        ctx.fillStyle = "red";
        ctx.fillText("Error: " + e.message, -150, 0);
    }
    ctx.restore();
}
render();
