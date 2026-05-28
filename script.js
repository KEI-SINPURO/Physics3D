// ============================================================================
// 1. UIおよび公式暗記モード コントローラー
// ============================================================================
class UIController {
    constructor() {
        this.currentMode = 'flashcard'; 
        this.masteredList = JSON.parse(localStorage.getItem('physics_mastered_ids')) || [];
        this.updateMasterCount();
    }

    switchMode(mode) {
        this.currentMode = mode;
        document.getElementById('tab-flashcard').classList.toggle('active', mode === 'flashcard');
        document.getElementById('tab-sim').classList.toggle('active', mode === 'sim');
        document.getElementById('view-flashcard').style.display = mode === 'flashcard' ? 'block' : 'none';
        document.getElementById('view-sim').style.display = mode === 'sim' ? 'flex' : 'none';
        
        this.renderLeftMenu();
    }

    renderLeftMenu() {
        const menu = document.getElementById('menu-list');
        menu.innerHTML = '';

        if (this.currentMode === 'flashcard') {
            // 暗記モード時はカテゴリフィルター
            const categories = ["すべて", "力学", "熱力学", "波動", "電磁気", "原子"];
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                li.textContent = `📁 ${cat}`;
                li.onclick = () => {
                    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                    this.renderFlashcards(cat);
                };
                menu.appendChild(li);
            });
            this.renderFlashcards("すべて");
        } else {
            // シミュレーションモード時は、101公式がずらりとメニューに並ぶ！
            PHYSICS_FORMULAS.forEach(f => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                li.textContent = `No.${f.id} [${f.category}] ${f.name}`;
                li.onclick = () => physicsApp.selectFormula(f.id);
                li.setAttribute('data-id', f.id);
                menu.appendChild(li);
            });
        }
    }

    renderFlashcards(filterCategory) {
        const container = document.getElementById('flashcard-container');
        container.innerHTML = '';
        const targetFormulas = filterCategory === "すべて" ? PHYSICS_FORMULAS : PHYSICS_FORMULAS.filter(f => f.category === filterCategory);

        targetFormulas.forEach(f => {
            const card = document.createElement('div');
            card.className = 'formula-card';
            const isMastered = this.masteredList.includes(f.id);
            card.innerHTML = `
                <div class="card-category">${f.category} (No.${f.id})</div>
                <div class="card-name">${f.name}</div>
                <div class="card-formula-box hidden-mode" onclick="this.classList.toggle('hidden-mode')">
                    <span class="formula-text">${f.formula}</span>
                </div>
                <div class="card-desc">${f.desc}</div>
                <div class="card-footer">
                    <span class="symbol-tag">単位: ${f.unit || 'なし'}</span>
                    <button class="master-btn ${isMastered ? 'active' : ''}" onclick="uiController.toggleMaster(${f.id}, this)">
                        ${isMastered ? '覚えた！' : '未暗記'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    toggleMaster(id, btn) {
        const index = this.masteredList.indexOf(id);
        if (index > -1) { this.masteredList.splice(index, 1); btn.classList.remove('active'); btn.textContent = '未暗記'; }
        else { this.masteredList.push(id); btn.classList.add('active'); btn.textContent = '覚えた！'; }
        localStorage.setItem('physics_mastered_ids', JSON.stringify(this.masteredList));
        this.updateMasterCount();
    }

    updateMasterCount() {
        const el = document.getElementById('master-count'); if (el) el.textContent = this.masteredList.length;
    }
}

// ============================================================================
// 2. 自動変数解析 ＆ 万能5大シミュレーションエンジン
// ============================================================================
class UniversalEngine {
    constructor() {
        this.canvas = document.getElementById('physics-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.placeholder = document.getElementById('canvas-placeholder');
        this.panel = document.getElementById('panel-container');
        this.titleElement = document.getElementById('unit-title');
        
        this.activeFormula = null;
        this.isPaused = false;
        this.timeScale = 1.0;
        this.simTime = 0;
        this.params = {}; // 解析された変数が格納される場所
        
        // 熱運動用粒子、波動トレイル、半減期粒子などの汎用バッファ
        this.particles = [];
        this.trail = [];

        // 万能変数定義ライブラリ（数式文字列からこれらを自動検知してスライダー化する）
        this.varLibrary = {
            "v₀": { name: "初速度", min: 0, max: 25, def: 12, unit: "m/s", key: "v0" },
            "a": { name: "加速度", min: -8, max: 8, def: 3, unit: "m/s²", key: "a" },
            "g": { name: "重力加速度", min: 0, max: 20, def: 9.8, unit: "m/s²", key: "g" },
            "θ": { name: "角度", min: 10, max: 80, def: 45, unit: "度", key: "theta" },
            "k": { name: "ばね/クーロン定数", min: 5, max: 40, def: 15, unit: "N/m", key: "k" },
            "m": { name: "質量", min: 0.5, max: 4.5, def: 2.0, unit: "kg", key: "m" },
            "μ": { name: "摩擦係数", min: 0, max: 0.8, def: 0.2, unit: "", key: "mu" },
            "μ'": { name: "動摩擦係数", min: 0, max: 0.8, def: 0.15, unit: "", key: "mu" },
            "ρ": { name: "密度", min: 0.5, max: 2.5, def: 1.2, unit: "kg/m³", key: "rho" },
            "T": { name: "絶対温度", min: 100, max: 500, def: 300, unit: "K", key: "T" },
            "V": { name: "体積 / 電圧", min: 1, max: 10, def: 5, unit: "L / V", key: "V" },
            "P": { name: "気体の圧力", min: 1, max: 10, def: 5, unit: "atm", key: "P" },
            "f": { name: "振動数", min: 1, max: 10, def: 3, unit: "Hz", key: "f" },
            "λ": { name: "波長", min: 20, max: 120, def: 60, unit: "px", key: "lambda" },
            "q": { name: "電荷", min: -2, max: 2, def: 1, unit: "C", key: "q" },
            "Q": { name: "標的電気量", min: -5, max: 5, def: 3, unit: "C", key: "Q" },
            "B": { name: "磁束密度", min: 0, max: 3, def: 1.5, unit: "T", key: "B" },
            "E": { name: "電場の強さ", min: 0, max: 20, def: 10, unit: "N/C", key: "E" },
            "R": { name: "電気抵抗", min: 1, max: 50, def: 15, unit: "Ω", key: "R" },
            "I": { name: "電流", min: 0, max: 5, def: 2, unit: "A", key: "I" }
        };

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width; this.canvas.height = rect.height;
    }

    selectFormula(id) {
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`[data-id="${id}"]`);
        if (activeItem) activeItem.classList.add('active');

        this.placeholder.style.display = 'none';
        this.panel.style.visibility = 'visible';
        
        this.activeFormula = PHYSICS_FORMULAS.find(f => f.id === id);
        this.titleElement.textContent = `No.${this.activeFormula.id}: ${this.activeFormula.name} (${this.activeFormula.category})`;
        document.getElementById('current-sim-formula').textContent = this.activeFormula.formula;
        
        this.resizeCanvas();
        this.parseAndBuildControls();
        this.resetSimulation();
    }

    // 【コアロジック】数式をスキャンして自動でスライダーを作る天才関数
    parseAndBuildControls() {
        const container = document.getElementById('dynamic-controls');
        container.innerHTML = '';
        this.params = {};

        const formulaText = this.activeFormula.formula;
        let hasControls = false;

        Object.keys(this.varLibrary).forEach(symbol => {
            // 数式テキストに特定の物理記号（v0やkなど）が含まれているかチェック
            if (formulaText.includes(symbol) || (symbol === "v₀" && formulaText.includes("v₀"))) {
                const config = this.varLibrary[symbol];
                this.params[config.key] = config.def; // 初期値をセット

                const item = document.createElement('div');
                item.className = 'control-item';
                item.innerHTML = `
                    <div class="control-label">
                        <span>${config.name} <span class="symbol-tag">${symbol}</span></span>
                        <span id="val-${config.key}">${config.def} ${config.unit}</span>
                    </div>
                    <input type="range" class="control-slider" min="${config.min}" max="${config.max}" step="${(config.max-config.min)/20}" value="${config.def}" 
                        oninput="physicsApp.params['${config.key}'] = parseFloat(this.value); document.getElementById('val-${config.key}').textContent = this.value + ' ${config.unit}';">
                `;
                container.appendChild(item);
                hasControls = true;
            }
        });

        // もし変数が見つからない簡易数式の場合、デフォルトの汎用変数を置く
        if (!hasControls) {
            this.params['generic'] = 5;
            const item = document.createElement('div');
            item.className = 'control-item';
            item.innerHTML = `
                <div class="control-label"><span>シミュレーション調整係数</span><span id="val-generic">5</span></div>
                <input type="range" class="control-slider" min="1" max="10" step="0.5" value="5" oninput="physicsApp.params['generic'] = parseFloat(this.value); document.getElementById('val-generic').textContent = this.value;">
            `;
            container.appendChild(item);
        }

        document.getElementById('explanation-text').textContent = this.activeFormula.desc + "\n\n【連動中】左メニューで選んだ数式に基づき、2Dグラフィックスが自動構築されています。スライダーを動かしてベクトル変化を確認してください。";
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
        document.getElementById('btn-play-pause').textContent = this.isPaused ? '再 生' : '一時停止';
    }

    resetSimulation() {
        this.simTime = 0;
        this.trail = [];
        this.particles = [];
        const f = this.activeFormula;
        if (!f) return;

        // モード別の初期化
        if (f.category === "熱力学") {
            for (let i = 0; i < 20; i++) {
                this.particles.push({
                    x: 50 + Math.random() * 200, y: 50 + Math.random() * 200,
                    vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100
                });
            }
        } else if (f.category === "原子" && f.name.includes("半減期")) {
            for (let i = 0; i < 150; i++) {
                this.particles.push({ x: 40 + Math.random() * (this.canvas.width-80), y: 60 + Math.random() * (this.canvas.height-120), alive: true });
            }
        }
    }

    changeSpeed(val) {
        this.timeScale = parseFloat(val);
        document.getElementById('txt-speed').textContent = `${this.timeScale.toFixed(1)}x`;
    }

    drawArrow(ctx, fromX, fromY, toX, toY, color, width = 2) {
        const headLength = 10; const dx = toX - fromX; const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
        ctx.beginPath(); ctx.moveTo(fromX, fromY); ctx.lineTo(toX, toY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath(); ctx.fill();
    }

    // ============================================================================
    // 3. 【物理計算＆描画コア】毎フレーム駆動する万能物理レンダラー
    // ============================================================================
    step(dt) {
        this.simTime += dt;
        const f = this.activeFormula;
        if (!f) return;

        // 【熱力学】分子運動計算
        if (f.category === "熱力学") {
            const temp = this.params.T || 300;
            const vol = this.params.V || 5;
            const boxWidth = 100 + vol * 40;
            const speedScale = Math.sqrt(temp / 300);

            this.particles.forEach(p => {
                p.x += p.vx * dt * speedScale; p.y += p.vy * dt * speedScale;
                if (p.x < 30) { p.x = 30; p.vx *= -1; }
                if (p.x > boxWidth) { p.x = boxWidth; p.vx *= -1; }
                if (p.y < 40) { p.y = 40; p.vy *= -1; }
                if (p.y > this.canvas.height - 40) { p.y = this.canvas.height - 40; p.vy *= -1; }
            });
        }
        // 【原子・半減期】確率崩壊計算
        else if (f.category === "原子" && f.name.includes("半減期")) {
            const lambda = 0.15; 
            this.particles.forEach(p => {
                if (p.alive && Math.random() < lambda * dt) p.alive = false;
            });
        }
    }

    draw() {
        const ctx = this.ctx; const w = this.canvas.width; const h = this.canvas.height;
        const f = this.activeFormula;
        if (!f) return;

        // グリッド背景の描画
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        // パラメーターの安全なフォールバック取得
        const v0 = this.params.v0 !== undefined ? this.params.v0 : 12;
        const a = this.params.a !== undefined ? this.params.a : 2;
        const g = this.params.g !== undefined ? this.params.g : 9.8;
        const theta = (this.params.theta !== undefined ? this.params.theta : 45) * Math.PI / 180;
        const k = this.params.k !== undefined ? this.params.k : 15;
        const m = this.params.m !== undefined ? this.params.m : 2;

        // ----------------------------------------------------
        // 分野①：力学の万能レンダリング
        // ----------------------------------------------------
        if (f.category === "力学") {
            // A. ばね・振動系公式の場合
            if (f.formula.includes("k") || f.name.includes("振り子") || f.name.includes("弾性")) {
                const centerX = w / 2; const centerY = h / 2;
                const omega = Math.sqrt(k / m);
                const amp = 5;
                const dispX = amp * Math.cos(omega * this.simTime) * 20;

                // ばね
                ctx.strokeStyle = '#64748b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50, centerY);
                let turns = 20; let stepX = (centerX + dispX - 50) / turns;
                for(let i=0; i<turns; i++){ ctx.lineTo(50 + i*stepX, centerY + (i%2===0?20:-20)); }
                ctx.lineTo(centerX + dispX, centerY); ctx.stroke();

                // おもり
                ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(centerX + dispX, centerY, 16, 0, Math.PI*2); ctx.fill();
                
                // ベクトル
                const velX = -amp * omega * Math.sin(omega * this.simTime) * 15;
                const forceX = -k * (dispX / 20) * 4;
                this.drawArrow(ctx, centerX + dispX, centerY, centerX + dispX + velX, centerY, '#38bdf8', 3);
                this.drawArrow(ctx, centerX + dispX, centerY - 25, centerX + dispX + forceX, centerY - 25, '#f43f5e', 3);
            } 
            // B. 円運動・万有引力系公式の場合
            else if (f.formula.includes("ω") || f.formula.includes("r") || f.name.includes("引力")) {
                const cx = w / 2; const cy = h / 2; const r = 100;
                const speed = v0 * 0.2;
                const angle = speed * this.simTime;
                const bx = cx + r * Math.cos(angle); const by = cy + r * Math.sin(angle);

                ctx.fillStyle = '#fab005'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI*2); ctx.fill(); // 中心星
                ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI*2); ctx.fill(); // 惑星

                // 速度・向心力ベクトル
                const vx = -Math.sin(angle) * speed * 40; const vy = Math.cos(angle) * speed * 40;
                this.drawArrow(ctx, bx, by, bx + vx, by + vy, '#38bdf8', 2.5);
                this.drawArrow(ctx, bx, by, bx - Math.cos(angle)*50, by - Math.sin(angle)*50, '#f43f5e', 2.5);
            }
            // C. 放物・落下・投げ上げ公式の場合
            else if (f.formula.includes("θ") || f.formula.includes("g") || f.name.includes("落下") || f.name.includes("投射")) {
                const startX = 60; const startY = h - 60;
                let curX = startX; let curY = startY;

                let t = this.simTime;
                let vx_now = 0; let vy_now = 0;

                if (f.name.includes("斜方投射")) {
                    curX += v0 * Math.cos(theta) * t * 20;
                    curY -= (v0 * Math.sin(theta) * t - 0.5 * g * t * t) * 20;
                    vx_now = v0 * Math.cos(theta); vy_now = v0 * Math.sin(theta) - g * t;
                } else if (f.name.includes("自由落下")) {
                    curY -= (-0.5 * g * t * t) * 20; vy_now = -g * t;
                } else { // 投げ上げ・投げ下ろし等
                    curY -= (v0 * t - 0.5 * g * t * t) * 20; vy_now = v0 - g * t;
                }

                if (curY > startY) { this.simTime = 0; curX = startX; curY = startY; } // 床に衝突したらリセット

                ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(curX, curY, 10, 0, Math.PI*2); ctx.fill();
                this.drawArrow(ctx, curX, curY, curX + vx_now*3, curY - vy_now*3, '#38bdf8', 2.5); // 速度
                this.drawArrow(ctx, curX, curY, curX, curY + g * 3, '#f43f5e', 2.5); // 重力
            }
            // D. 直線等速・等加速度運動
            else {
                let t = this.simTime;
                let posX = 60 + (v0 * t + 0.5 * a * t * t) * 5;
                let currentV = v0 + a * t;
                if (posX > w - 60) this.simTime = 0;

                ctx.fillStyle = '#f43f5e'; ctx.fillRect(posX - 20, h/2 - 15, 40, 30); // 自動車に見立てたブロック
                this.drawArrow(ctx, posX, h/2, posX + currentV*4, h/2, '#38bdf8', 3); // 速度
                if (Math.abs(a) > 0.1) this.drawArrow(ctx, posX, h/2 - 25, posX + a * 10, h/2 - 25, '#f43f5e', 3); // 加速度
            }
        }

        // ----------------------------------------------------
        // 分野②：熱力学の万能レンダリング（分子運動）
        // ----------------------------------------------------
        else if (f.category === "熱力学") {
            const vol = this.params.V || 5;
            const boxWidth = 100 + vol * 40;

            ctx.strokeStyle = '#475569'; ctx.lineWidth = 4;
            ctx.strokeRect(25, 35, boxWidth - 20, h - 70); // シリンダー容器

            this.particles.forEach(p => {
                ctx.fillStyle = '#67e8f9'; ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2); ctx.fill();
                this.drawArrow(ctx, p.x, p.y, p.x + p.vx*0.2, p.y + p.vy*0.2, '#38bdf8', 1);
            });
        }

        // ----------------------------------------------------
        // 分野③：波動の万能レンダリング（波形アニメーション）
        // ----------------------------------------------------
        else if (f.category === "波動") {
            const freq = this.params.f || 3;
            const lambda = this.params.lambda || 60;

            if (f.name.includes("レンズ")) {
                // レンズ・幾何光学シミュレーション
                const cx = w/2; const cy = h/2;
                ctx.strokeStyle = '#475569'; ctx.beginPath(); ctx.moveTo(50, cy); ctx.lineTo(w-50, cy); ctx.stroke(); // 光軸
                ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy-80); ctx.lineTo(cx, cy+80); ctx.stroke(); // レンズ
                
                // 物体矢印
                ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 4;
                this.drawArrow(ctx, cx - 120, cy, cx - 120, cy - 50, '#f59e0b', 4);
                // 光線
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(cx-120, cy-50); ctx.lineTo(cx, cy-50); ctx.lineTo(cx+120, cy+50); ctx.stroke(); // 平行光線
                ctx.beginPath(); ctx.moveTo(cx-120, cy-50); ctx.lineTo(cx, cy); ctx.lineTo(cx+240, cy+100); ctx.stroke(); // 中心を通る光線
            } else {
                // 正弦波のリアルタイム描画
                ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; ctx.beginPath();
                for (let x = 40; x < w - 40; x += 2) {
                    let y = h/2 + 50 * Math.sin(2 * Math.PI * (this.simTime * freq - x / lambda));
                    if (x === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }

        // ----------------------------------------------------
        // 分野④：電磁気の万能レンダリング（場の中の電荷運動）
        // ----------------------------------------------------
        else if (f.category === "電磁気") {
            const q = this.params.q !== undefined ? this.params.q : 1;
            const B = this.params.B !== undefined ? this.params.B : 1.5;
            const E = this.params.E !== undefined ? this.params.E : 10;

            // ローレンツ力、または電場加速の軌道追跡
            if (this.trail.length === 0) {
                this.particles = [{ x: 50, y: h/2, vx: 150, vy: -50 }];
            }

            let p = this.particles[0];
            // 物理力学計算
            let fx = q * E * 2; 
            let fy = q * p.vx * B * 0.1; // ローレンツ力成分
            
            p.vx += (fx / m) * 0.016; p.vy += (fy / m) * 0.016;
            p.x += p.vx * 0.016; p.y += p.vy * 0.016;
            this.trail.push({x: p.x, y: p.y});

            if (p.x > w || p.y < 0 || p.y > h) this.trail = []; // 画面外でリセット

            // 軌跡描画
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; ctx.lineWidth = 2; ctx.beginPath();
            this.trail.forEach((pt, i) => { if(i===0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
            ctx.stroke();

            // 粒子描画
            ctx.fillStyle = q >= 0 ? '#ef4444' : '#3b82f6';
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
            
            this.drawArrow(ctx, p.x, p.y, p.x + p.vx*0.2, p.y + p.vy*0.2, '#38bdf8', 2); // 速度ベクトル
            this.drawArrow(ctx, p.x, p.y, p.x + fx*0.5, p.y + fy*0.5, '#f43f5e', 2); // 電磁気力ベクトル
        }

        // ----------------------------------------------------
        // 分野⑤：原子物理の万能レンダリング（ミクロ・確率世界）
        // ----------------------------------------------------
        else if (f.category === "原子") {
            if (f.name.includes("半減期")) {
                // 半減期：粒子がランダムに崩壊する様子をリアルタイムシミュレート
                this.particles.forEach(p => {
                    ctx.fillStyle = p.alive ? '#f59e0b' : '#475569';
                    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
                });
            } else {
                // ボアの原子模型モデル
                const cx = w/2; const cy = h/2;
                ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI*2); ctx.fill(); // 原子核(+)
                ctx.fillStyle = '#fff'; ctx.font = '12px sans-serif'; ctx.fillText('+', cx-4, cy+4);

                const r = 80 + Math.sin(this.simTime) * 10; // 定常波のゆらぎ表現
                const ex = cx + r * Math.cos(this.simTime * 3); const ey = cy + r * Math.sin(this.simTime * 3);
                
                // 電子軌道
                ctx.strokeStyle = '#334155'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
                // 回る電子
                ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI*2); ctx.fill();
                this.drawArrow(ctx, ex, ey, ex - Math.sin(this.simTime*3)*40, ey + Math.cos(this.simTime*3)*40, '#38bdf8', 2); // 電子速度
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate);
        if (!this.activeFormula) return;
        if (!this.isPaused) {
            this.step(0.01666 * this.timeScale);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }
}

// ============================================================================
// 4. アプリケーションのエントリーポイント
// ============================================================================
const physicsApp = new UniversalEngine();
const uiController = new UIController();

// 起動時は公式暗記モードからスタート
uiController.switchMode('flashcard');
