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
            const categories = ["すべて", "力学", "熱力学", "波動", "電磁気", "原子"];
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                li.textContent = cat;
                li.onclick = () => this.renderFlashcards(cat);
                menu.appendChild(li);
            });
            this.renderFlashcards("すべて");
        } else {
            physicsApp.renderMenu();
        }
    }

    renderFlashcards(filterCategory) {
        const container = document.getElementById('flashcard-container');
        container.innerHTML = '';

        const targetFormulas = filterCategory === "すべて" 
            ? PHYSICS_FORMULAS 
            : PHYSICS_FORMULAS.filter(f => f.category === filterCategory);

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
        if (index > -1) {
            this.masteredList.splice(index, 1);
            btn.classList.remove('active');
            btn.textContent = '未暗記';
        } else {
            this.masteredList.push(id);
            btn.classList.add('active');
            btn.textContent = '覚えた！';
        }
        localStorage.setItem('physics_mastered_ids', JSON.stringify(this.masteredList));
        this.updateMasterCount();
    }

    updateMasterCount() {
        const el = document.getElementById('master-count');
        if (el) el.textContent = this.masteredList.length;
    }
}

// ============================================================================
// 2. 2D 物理シミュレーション コアエンジンクラス
// ============================================================================
class PhysicsEngine {
    constructor() {
        this.canvas = document.getElementById('physics-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.placeholder = document.getElementById('canvas-placeholder');
        this.panel = document.getElementById('panel-container');
        this.titleElement = document.getElementById('unit-title');
        
        this.activeUnit = null;
        this.isPaused = false;
        this.timeScale = 1.0;
        this.units = {};

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        if (this.activeUnit) this.activeUnit.onResize(this.canvas.width, this.canvas.height);
    }

    registerUnit(id, unitClass) {
        this.units[id] = unitClass;
    }

    renderMenu() {
        const menu = document.getElementById('menu-list');
        menu.innerHTML = '';
        Object.keys(this.units).forEach(id => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.textContent = this.units[id].unitName;
            li.onclick = () => this.selectUnit(id);
            li.setAttribute('data-id', id);
            menu.appendChild(li);
        });
    }

    selectUnit(id) {
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`[data-id="${id}"]`);
        if (activeItem) activeItem.classList.add('active');

        this.placeholder.style.display = 'none';
        this.panel.style.visibility = 'visible';
        
        const UnitClass = this.units[id];
        this.activeUnit = new UnitClass();
        this.titleElement.textContent = UnitClass.unitName;
        document.getElementById('current-sim-formula').textContent = UnitClass.linkedFormula;
        
        this.resizeCanvas();
        this.buildControls();
        this.renderExplanation();
        this.resetSimulation();
    }

    buildControls() {
        const container = document.getElementById('dynamic-controls');
        container.innerHTML = '';
        if (!this.activeUnit) return;

        this.activeUnit.getParameters().forEach(p => {
            const item = document.createElement('div');
            item.className = 'control-item';
            item.innerHTML = `
                <div class="control-label">
                    <span>${p.name} <span class="symbol-tag">${p.symbol}</span></span>
                    <span id="val-${p.id}">${p.value} ${p.unit}</span>
                </div>
                <input type="range" class="control-slider" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" 
                    oninput="physicsApp.activeUnit.updateParameter('${p.id}', parseFloat(this.value)); document.getElementById('val-${p.id}').textContent = this.value + ' ${p.unit}';">
            `;
            container.appendChild(item);
        });
    }

    renderExplanation() {
        document.getElementById('explanation-text').textContent = this.activeUnit ? this.activeUnit.getExplanation() : '';
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
        document.getElementById('btn-play-pause').textContent = this.isPaused ? '再 生' : '一時停止';
    }

    resetSimulation() { 
        if (this.activeUnit) this.activeUnit.reset(); 
    }
    
    changeSpeed(val) { 
        this.timeScale = parseFloat(val); 
        document.getElementById('txt-speed').textContent = `${this.timeScale.toFixed(1)}x`; 
    }

    drawArrow(ctx, fromX, fromY, toX, toY, color, width = 2) {
        const headLength = 10; 
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = width;
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    animate() {
        requestAnimationFrame(this.animate);
        if (!this.activeUnit) return;

        if (!this.isPaused) {
            this.activeUnit.step(0.01666 * this.timeScale);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.canvas.height); this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.canvas.width, y); this.ctx.stroke();
        }

        this.activeUnit.draw(this.ctx, this);
    }
}

// ============================================================================
// 3. 2Dシミュレーション 各単元クラス
// ============================================================================
class Base2DUnit {
    constructor() {
        this.simTime = 0; this.width = 800; this.height = 500; this.trail = [];
    }
    onResize(w, h) { this.width = w; this.height = h; }
    updateParameter(id, value) { this[id] = value; this.reset(); }
    step(dt) { this.simTime += dt; }
    reset() { this.simTime = 0; this.trail = []; }
    draw(ctx, engine) {}
}

// --- [1] 斜方投射 (力学) ---
class ProjectileUnit extends Base2DUnit {
    static unitName = "1. 斜方投射の成分分解 (力学)";
    static linkedFormula = "x = v₀ cosθ·t  /  y = v₀ sinθ·t - (1/2)gt²";
    constructor() {
        super(); this.v0 = 18.0; this.theta = 45.0; this.g = 9.8; this.x = 0; this.y = 0;
    }
    getParameters() {
        return [
            { id: 'v0', name: '初速度', symbol: 'v₀', min: 10, max: 25, step: 1, value: this.v0, unit: 'm/s' },
            { id: 'theta', name: '投射角', symbol: 'θ', min: 15, max: 80, step: 5, value: this.theta, unit: '度' }
        ];
    }
    step(dt) {
        super.step(dt);
        const rad = (this.theta * Math.PI) / 180;
        this.x = this.v0 * Math.cos(rad) * this.simTime;
        this.y = this.v0 * Math.sin(rad) * this.simTime - 0.5 * this.g * this.simTime * this.simTime;
        
        if (this.y < 0) { this.y = 0; }
        else if (this.simTime > 0) { this.trail.push({x: this.x, y: this.y}); }
    }
    draw(ctx, engine) {
        const scale = 20; 
        const startX = 50; const startY = this.height - 50;

        ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, startY); ctx.lineTo(this.width, startY); ctx.stroke();

        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.beginPath();
        this.trail.forEach((p, idx) => {
            const tx = startX + p.x * scale; const ty = startY - p.y * scale;
            if(idx === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        });
        ctx.stroke(); ctx.setLineDash([]);

        const bx = startX + this.x * scale; const by = startY - this.y * scale;
        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(bx, by, 10, 0, Math.PI*2); ctx.fill();

        if (this.y > 0 || this.simTime === 0) {
            const rad = (this.theta * Math.PI) / 180;
            const vx = this.v0 * Math.cos(rad);
            const vy = this.v0 * Math.sin(rad) - this.g * this.simTime;
            engine.drawArrow(ctx, bx, by, bx + vx * scale * 0.3, by - vy * scale * 0.3, '#38bdf8', 2.5);
            engine.drawArrow(ctx, bx, by, bx, by + 40, '#f43f5e', 2.5);
        }
    }
    getExplanation() { return "【見て学ぶポイント】\n水平方向には力が働かないため、横向きの速度ベクトル（青）はずっと同じ長さです。\n鉛直方向には常に一定の重力（赤）が下向きに働くため、縦向きの速度（青）はだんだん短くなり、最高点で0になった後、下向きに加速します。"; }
}

// --- [2] 単振動 (力学) ---
class SHMUnit extends Base2DUnit {
    static unitName = "2. ばね振り子の復元力 (力学)";
    static linkedFormula = "F = -Kx   /   T = 2π√(m / K)";
    constructor() {
        super(); this.m = 2.0; this.k = 15.0; this.A = 5.0; this.y = 0;
    }
    getParameters() {
        return [
            { id: 'm', name: '質量', symbol: 'm', min: 0.5, max: 4.5, step: 0.5, value: this.m, unit: 'kg' },
            { id: 'k', name: 'ばね定数', symbol: 'K', min: 5, max: 30, step: 1, value: this.k, unit: 'N/m' }
        ];
    }
    step(dt) {
        super.step(dt);
        const omega = Math.sqrt(this.k / this.m);
        this.y = this.A * Math.cos(omega * this.simTime);
    }
    draw(ctx, engine) {
        const centerX = this.width / 2; const centerY = this.height / 2;
        const scale = 25;
        const ballY = centerY + this.y * scale;

        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(centerX - 50, 40); ctx.lineTo(centerX + 50, 40); ctx.stroke();

        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(centerX, 40);
        const turns = 15;
        const dist = (ballY - 40) / turns;
        for(let i=0; i<turns; i++) {
            const y = 40 + (i + 0.5) * dist;
            const x = centerX + (i % 2 === 0 ? 15 : -15);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(centerX, ballY); ctx.stroke();

        ctx.strokeStyle = '#334155'; ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(centerX - 80, centerY); ctx.lineTo(centerX + 80, centerY); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#a855f7'; ctx.beginPath(); ctx.arc(centerX, ballY, 14, 0, Math.PI*2); ctx.fill();

        const omega = Math.sqrt(this.k / this.m);
        const velY = -this.A * omega * Math.sin(omega * this.simTime);
        const forceY = -this.k * this.y;

        if (Math.abs(velY) > 0.1) engine.drawArrow(ctx, centerX + 25, ballY, centerX + 25, ballY + velY * scale * 0.2, '#38bdf8', 2.5);
        if (Math.abs(forceY) > 0.1) engine.drawArrow(ctx, centerX - 25, ballY, centerX - 25, ballY - forceY * scale * 0.2, '#f43f5e', 2.5);
    }
    getExplanation() { return "【見て学ぶポイント】\n復元力（赤矢印）に注目。おもりが中心（点線）から離れるほど力は大きくなり、常に中心へ引き戻す向きに働きます。\n中心を通過するとき力（赤）はゼロになりますが、速度（青）が最大になるため、行き過ぎて次の振動へ向かいます。"; }
}

// --- [3] ローレンツ力 (電磁気) ---
class LorentzForceUnit extends Base2DUnit {
    static unitName = "3. 磁場中の円運動 (電磁気)";
    static linkedFormula = "F = qvB   /   r = mv / qB";
    constructor() {
        super(); this.q = 1.0; this.B = 1.5; this.v0 = 12.0; this.m = 1.0;
        this.px = 0; this.py = 0; this.vx = 0; this.vy = 0;
    }
    getParameters() {
        return [
            { id: 'q', name: '電荷の正負', symbol: 'q', min: -1.0, max: 1.0, step: 2.0, value: this.q, unit: 'C (陽子 1/ 電子 -1)' },
            { id: 'B', name: '磁束密度', symbol: 'B', min: 0.5, max: 2.5, step: 0.5, value: this.B, unit: 'T' },
            { id: 'v0', name: '粒子速さ', symbol: 'v₀', min: 8, max: 16, step: 1, value: this.v0, unit: 'm/s' }
        ];
    }
    reset() {
        super.reset();
        this.px = 0; this.py = 0;
        this.vx = 0; this.vy = -this.v0;
    }
    step(dt) {
        super.step(dt);
        const fx = this.q * this.vy * this.B;
        const fy = -this.q * this.vx * this.B;
        const ax = fx / this.m; const ay = fy / this.m;
        this.vx += ax * dt; this.vy += ay * dt;
        this.px += this.vx * dt; this.py += this.vy * dt;
        this.trail.push({x: this.px, y: this.py});
        if (this.trail.length > 400) this.trail.shift();
    }
    draw(ctx, engine) {
        const cx = this.width / 2; const cy = this.height / 2;
        const scale = 15;
        ctx.fillStyle = '#1e293b'; ctx.font = '14px Arial';
        for(let x=60; x<this.width; x+=100) {
            for(let y=40; y<this.height; y+=100) ctx.fillText('⊙ B', x, y);
        }
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.beginPath();
        this.trail.forEach((p, idx) => {
            if(idx === 0) ctx.moveTo(cx + p.x * scale, cy - p.y * scale);
            else ctx.lineTo(cx + p.x * scale, cy - p.y * scale);
        });
        ctx.stroke();
        const bx = cx + this.px * scale; const by = cy - this.py * scale;
        ctx.fillStyle = this.q > 0 ? '#ef4444' : '#3b82f6';
        ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2); ctx.fill();
        engine.drawArrow(ctx, bx, by, bx + this.vx * scale * 0.4, by - this.vy * scale * 0.4, '#38bdf8', 2.5);
        const fx = this.q * this.vy * this.B; const fy = -this.q * this.vx * this.B;
        engine.drawArrow(ctx, bx, by, bx + fx * scale * 0.4, by - fy * scale * 0.4, '#f43f5e', 2.5);
    }
    getExplanation() { return "【見て学ぶポイント】\n力（赤）と速度（青）の関係を見てください。力は常に速度と直角（円の中心向き）に働くため、速さを変えずに曲げるだけの「向心力」となり、等速円運動になります。\n電荷を負（-1）にすると、力の向きが反転し、逆回りになります。"; }
}

// --- [4] 万有引力 (力学) ---
class GravityOrbitUnit extends Base2DUnit {
    static unitName = "4. 惑星軌道と面積速度 (力学)";
    static linkedFormula = "F = G(Mm / r²)   /   v = √(GM / r)";
    constructor() {
        super(); this.M = 1200.0; this.v0 = 11.0; this.px = 11.0; this.py = 0; this.vx = 0; this.vy = 0;
    }
    getParameters() {
        return [
            { id: 'M', name: '中心星の質量', symbol: 'M', min: 600, max: 1800, step: 100, value: this.M, unit: 'kg' },
            { id: 'v0', name: '惑星の初速度', symbol: 'v₀', min: 7.0, max: 15.0, step: 0.5, value: this.v0, unit: 'm/s' }
        ];
    }
    reset() {
        super.reset();
        this.px = 11.0; this.py = 0;
        this.vx = 0; this.vy = this.v0;
    }
    step(dt) {
        super.step(dt);
        const r2 = this.px*this.px + this.py*this.py;
        const r = Math.sqrt(r2);
        if (r < 1.0) return;
        const accScalar = (1.0 * this.M) / r2;
        const ax = -accScalar * (this.px / r);
        const ay = -accScalar * (this.py / r);
        this.vx += ax * dt; this.vy += ay * dt;
        this.px += this.vx * dt; this.py += this.vy * dt;
        this.trail.push({x: this.px, y: this.py});
        if(this.trail.length > 600) this.trail.shift();
    }
    draw(ctx, engine) {
        const cx = this.width / 2; const cy = this.height / 2;
        const scale = 18;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
        this.trail.forEach((p, idx) => {
            if(idx === 0) ctx.moveTo(cx + p.x * scale, cy - p.y * scale);
            else ctx.lineTo(cx + p.x * scale, cy - p.y * scale);
        });
        ctx.stroke();
        ctx.fillStyle = '#fab005'; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
        const bx = cx + this.px * scale; const by = cy - this.py * scale;
        ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI*2); ctx.fill();
        engine.drawArrow(ctx, bx, by, bx + this.vx * scale * 0.4, by - this.vy * scale * 0.4, '#38bdf8', 2.5);
        const r = Math.sqrt(this.px*this.px + this.py*this.py);
        const fScalar = 150 / (r*r);
        engine.drawArrow(ctx, bx, by, bx - (this.px/r) * fScalar * scale, by + (this.py/r) * fScalar * scale, '#f43f5e', 2.5);
    }
    getExplanation() { return "【見て学ぶポイント】\nケプラーの第二法則（面積速度一定）の可視化です。\n惑星が中心星に近づくほど引力（赤）が強くなり、それによって速度（青）が跳ね上がって、鋭くコーナーを駆け抜けます。離れるとゆっくり動きます。"; }
}

// --- [5] クーロン散乱 (原子物理) ---
class CoulombScatteringUnit extends Base2DUnit {
    static unitName = "5. α粒子散乱実験 (原子物理)";
    static linkedFormula = "F = k (q₁q₂ / r²)";
    constructor() {
        super(); this.q2 = 1.0; this.b = 1.5; this.v0 = 10.0;
        this.px = 0; this.py = 0; this.vx = 0; this.vy = 0;
    }
    getParameters() {
        return [
            { id: 'q2', name: '入射粒子の電荷', symbol: 'q₂', min: -1.0, max: 1.0, step: 2.0, value: this.q2, unit: '(正 1/ 負 -1)' },
            { id: 'b', name: '衝突径数 (ズレ)', symbol: 'b', min: 0.2, max: 3.5, step: 0.3, value: this.b, unit: 'm' },
            { id: 'v0', name: '入射速度', symbol: 'v₀', min: 7.0, max: 14.0, step: 1.0, value: this.v0, unit: 'm/s' }
        ];
    }
    reset() {
        super.reset();
        this.px = -15.0; this.py = this.b;
        this.vx = this.v0; this.vy = 0;
    }
    step(dt) {
        super.step(dt);
        const r2 = this.px*this.px + this.py*this.py;
        const r = Math.sqrt(r2);
        if (r < 0.6) return;
        const k = 40.0;
        const fScalar = (k * 4.0 * this.q2) / r2;
        const ax = fScalar * (this.px / r);
        const ay = fScalar * (this.py / r);
        this.vx += ax * dt; this.vy += ay * dt;
        this.px += this.vx * dt; this.py += this.vy * dt;
        if (this.px < 20) this.trail.push({x: this.px, y: this.py});
    }
    draw(ctx, engine) {
        const cx = this.width / 2; const cy = this.height / 2;
        const scale = 20;
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.beginPath();
        this.trail.forEach((p, idx) => {
            if(idx === 0) ctx.moveTo(cx + p.x * scale, cy - p.y * scale);
            else ctx.lineTo(cx + p.x * scale, cy - p.y * scale);
        });
        ctx.stroke();
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('+', cx-4, cy+4);
        const bx = cx + this.px * scale; const by = cy - this.py * scale;
        ctx.fillStyle = this.q2 > 0 ? '#f59e0b' : '#3b82f6';
        ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2); ctx.fill();
        engine.drawArrow(ctx, bx, by, bx + this.vx * scale * 0.3, by - this.vy * scale * 0.3, '#38bdf8', 2);
        const r = Math.sqrt(this.px*this.px + this.py*this.py);
        const k = 40.0; const fScalar = (k * 4.0 * this.q2) / (r*r);
        const fx = fScalar * (this.px / r); const fy = fScalar * (this.py / r);
        if(r < 10) engine.drawArrow(ctx, bx, by, bx + fx * scale * 0.3, by - fy * scale * 0.3, '#f43f5e', 2);
    }
    getExplanation() { return "【見て学ぶポイント】\n電荷が正（黄）の時は斥力が働き、原子核（赤）に近づくにつれて凄まじい力（赤矢印）で軌道を曲げられます。上下のズレ b を小さくするほど近くを通るため、曲がり方が急になります。"; }
}

// ============================================================================
// 4. エントリーポイント（アプリケーション起動）
// ============================================================================
const physicsApp = new PhysicsEngine();
physicsApp.registerUnit('projectile', ProjectileUnit);
physicsApp.registerUnit('shm', SHMUnit);
physicsApp.registerUnit('lorentz', LorentzForceUnit);
physicsApp.registerUnit('gravity', GravityOrbitUnit);
physicsApp.registerUnit('coulomb', CoulombScatteringUnit);
const uiController = new UIController();
uiController.switchMode('flashcard');
