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
// 2. 物理シミュレーション共通 3Dコアエンジンクラス
// ============================================================================
class PhysicsEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.placeholder = document.getElementById('canvas-placeholder');
        this.panel = document.getElementById('panel-container');
        this.titleElement = document.getElementById('unit-title');
        
        this.scene = null; this.camera = null; this.renderer = null; this.controls = null;
        this.activeUnit = null; this.isPaused = false; this.timeScale = 1.0;
        this.initialCameraPos = new THREE.Vector3(0, 5, 15);
        this.units = {};

        this.initThree();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        window.addEventListener('resize', () => this.onWindowResize());
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a); 

        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.copy(this.initialCameraPos);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        
        this.scene.add(new THREE.GridHelper(40, 40, 0x475569, 0x334155));
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

        if (this.activeUnit) this.activeUnit.destroy(this.scene);

        this.placeholder.style.display = 'none';
        this.panel.style.visibility = 'visible';
        
        const UnitClass = this.units[id];
        this.activeUnit = new UnitClass();
        this.titleElement.textContent = UnitClass.unitName;
        
        document.getElementById('current-sim-formula').textContent = UnitClass.linkedFormula;
        
        this.camera.position.copy(this.initialCameraPos);
        this.controls.target.set(0, 0, 0);
        
        this.activeUnit.init(this.scene);
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

    resetSimulation() { if (this.activeUnit) this.activeUnit.reset(); }
    
    changeSpeed(val) { 
        this.timeScale = parseFloat(val); 
        document.getElementById('txt-speed').textContent = `${this.timeScale.toFixed(2)}x`; 
    }
    
    changeZoom(val) {
        const zoom = parseFloat(val); 
        document.getElementById('txt-zoom').textContent = `${zoom.toFixed(1)}x`;
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
        this.camera.position.copy(dir.multiplyScalar(20 / zoom).add(this.controls.target));
    }

    onWindowResize() { 
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight; 
        this.camera.updateProjectionMatrix(); 
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight); 
    }

    animate() {
        requestAnimationFrame(this.animate); 
        this.controls.update();
        // 60FPS固定ステップで計算
        if (this.activeUnit && !this.isPaused) {
            this.activeUnit.step(0.01666 * this.timeScale);
        }
        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================================================
// 3. 各実験単元の基礎クラス
// ============================================================================
class BaseUnit {
    constructor() { this.meshGroup = new THREE.Group(); this.simTime = 0; }
    init(scene) { scene.add(this.meshGroup); }
    updateParameter(id, value) { this[id] = value; this.reset(); }
    step(dt) { this.simTime += dt; }
    reset() { this.simTime = 0; }
    destroy(scene) {
        scene.remove(this.meshGroup);
        this.meshGroup.traverse(c => { 
            if (c.geometry) c.geometry.dispose(); 
            if (c.material) c.material.dispose(); 
        });
    }
}

// ============================================================================
// 4. 高度な物理シミュレーション群（全5種）
// ============================================================================

// [1] 放物運動 (力学)
class ProjectileUnit extends BaseUnit {
    static unitName = "1. 斜方投射の軌道 (力学)";
    static linkedFormula = "x = v₀cosθ·t  /  y = v₀sinθ·t - (1/2)gt²";
    constructor() { super(); this.v0 = 15.0; this.theta = 45.0; this.g = 9.8; this.ball = null; }
    getParameters() {
        return [
            { id: 'v0', name: '初速度', symbol: 'v₀', min: 5, max: 25, step: 0.5, value: this.v0, unit: 'm/s' },
            { id: 'theta', name: '投射角', symbol: 'θ', min: 15, max: 85, step: 1, value: this.theta, unit: 'deg' }
        ];
    }
    init(scene) {
        super.init(scene);
        this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        this.meshGroup.add(this.ball);
    }
    step(dt) {
        super.step(dt);
        const rad = (this.theta * Math.PI) / 180;
        const x = this.v0 * Math.cos(rad) * this.simTime - 10; // 中央に寄せるためのオフセット
        const y = this.v0 * Math.sin(rad) * this.simTime - 0.5 * this.g * this.simTime * this.simTime;
        if (y >= 0) this.ball.position.set(x, y, 0); 
    }
    getExplanation() { return "重力下における物体の放物運動です。x方向は等速直線運動、y方向は等加速度直線運動を行います。"; }
    reset() { super.reset(); if (this.ball) this.ball.position.set(-10, 0, 0); }
}

// [2] 単振動 (力学)
class SHMUnit extends BaseUnit {
    static unitName = "2. ばね振り子と単振動 (力学)";
    static linkedFormula = "T = 2π√(m/K)  /  F = -Kx";
    constructor() { super(); this.m = 2.0; this.k = 20.0; this.A = 5.0; this.ball = null; }
    getParameters() {
        return [
            { id: 'm', name: '質量', symbol: 'm', min: 0.5, max: 5.0, step: 0.1, value: this.m, unit: 'kg' },
            { id: 'k', name: 'ばね定数', symbol: 'K', min: 5, max: 50, step: 1, value: this.k, unit: 'N/m' }
        ];
    }
    init(scene) {
        super.init(scene);
        this.ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), new THREE.MeshStandardMaterial({ color: 0xa855f7 }));
        this.meshGroup.add(this.ball);
    }
    step(dt) {
        super.step(dt);
        const omega = Math.sqrt(this.k / this.m);
        const y = this.A * Math.cos(omega * this.simTime);
        this.ball.position.set(0, y, 0);
    }
    getExplanation() { return "フックの法則に基づく単振動です。質量 m が大きいほど周期は長くなり、ばね定数 K が大きいほど周期は短くなります（速く振動します）。"; }
    reset() { super.reset(); if (this.ball) this.ball.position.set(0, this.A, 0); }
}

// [3] ローレンツ力 (電磁気)
class LorentzForceUnit extends BaseUnit {
    static unitName = "3. 磁場中のらせん運動 (電磁気)";
    static linkedFormula = "F = q(v × B)  /  r = mv / |q|B";
    constructor() {
        super();
        this.m = 1.0; this.q = 1.0; this.v0 = 10.0; this.theta = 45; this.B = 2.0;
        this.pos = new THREE.Vector3(0, -5, 0); this.vel = new THREE.Vector3(0, 0, 0);
        this.trailPoints = []; this.maxTrail = 800;
    }
    getParameters() {
        return [
            { id: 'q', name: '電荷(＋/－)', symbol: 'q', min: -3.0, max: 3.0, step: 0.5, value: this.q, unit: 'C' },
            { id: 'B', name: '磁束密度(上向)', symbol: 'B', min: 0.5, max: 5.0, step: 0.5, value: this.B, unit: 'T' },
            { id: 'v0', name: '初速度', symbol: 'v₀', min: 5.0, max: 20.0, step: 1.0, value: this.v0, unit: 'm/s' },
            { id: 'theta', name: '入射角', symbol: 'θ', min: 0, max: 90, step: 5, value: this.theta, unit: 'deg' }
        ];
    }
    init(scene) {
        super.init(scene);
        const arrowGroup = new THREE.Group();
        for(let x=-8; x<=8; x+=4) {
            for(let z=-8; z<=8; z+=4) {
                const arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(x,-8,z), 16, 0x3b82f6, 1, 0.5);
                arrow.line.material.transparent = true; arrow.line.material.opacity = 0.2;
                arrowGroup.add(arrow);
            }
        }
        this.meshGroup.add(arrowGroup);

        this.particle = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        this.meshGroup.add(this.particle);

        const trailGeom = new THREE.BufferGeometry();
        this.trailPositions = new Float32Array(this.maxTrail * 3);
        trailGeom.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        this.trail = new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 }));
        this.meshGroup.add(this.trail);
        this.reset();
    }
    step(dt) {
        super.step(dt);
        const B_vec = new THREE.Vector3(0, this.B, 0);
        const force = new THREE.Vector3().crossVectors(this.vel, B_vec).multiplyScalar(this.q);
        const acc = force.divideScalar(this.m);
        this.vel.add(acc.multiplyScalar(dt));
        this.pos.add(this.vel.clone().multiplyScalar(dt));
        this.particle.position.copy(this.pos);

        if (this.trailPoints.length < this.maxTrail) {
            this.trailPoints.push(this.pos.clone());
            const posAttr = this.trail.geometry.attributes.position;
            posAttr.setXYZ(this.trailPoints.length - 1, this.pos.x, this.pos.y, this.pos.z);
            posAttr.needsUpdate = true;
            this.trail.geometry.setDrawRange(0, this.trailPoints.length);
        }
    }
    getExplanation() { return "フレミングの左手の法則によるローレンツ力のシミュレーションです。電荷が正なら反時計回り、負なら時計回りに回転しながら進みます。"; }
    reset() {
        super.reset();
        if(this.particle) this.particle.material.color.setHex(this.q >= 0 ? 0xef4444 : 0x3b82f6);
        this.pos.set(0, -8, 0);
        const rad = (this.theta * Math.PI) / 180;
        this.vel.set(this.v0 * Math.sin(rad), this.v0 * Math.cos(rad), 0);
        this.trailPoints = [];
        if (this.trail) this.trail.geometry.setDrawRange(0, 0);
    }
}

// [4] 万有引力・惑星の軌道 (力学・宇宙)
class GravityOrbitUnit extends BaseUnit {
    static unitName = "4. 万有引力による惑星軌道 (力学)";
    static linkedFormula = "F = G(Mm / r²)  /  v = √(GM/r)";
    constructor() {
        super();
        this.M = 1000.0; this.v0 = 10.0; this.G = 1.0; 
        this.pos = new THREE.Vector3(10, 0, 0); this.vel = new THREE.Vector3(0, 0, -this.v0);
        this.trailPoints = []; this.maxTrail = 1000;
    }
    getParameters() {
        return [
            { id: 'M', name: '中心星の質量', symbol: 'M', min: 500, max: 2000, step: 100, value: this.M, unit: 'kg' },
            { id: 'v0', name: '惑星の初速度', symbol: 'v₀', min: 5.0, max: 15.0, step: 0.5, value: this.v0, unit: 'm/s' }
        ];
    }
    init(scene) {
        super.init(scene);
        this.sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), new THREE.MeshStandardMaterial({ color: 0xfab005, emissive: 0xfab005, emissiveIntensity: 0.5 }));
        this.meshGroup.add(this.sun);

        this.planet = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        this.meshGroup.add(this.planet);

        const trailGeom = new THREE.BufferGeometry();
        this.trailPositions = new Float32Array(this.maxTrail * 3);
        trailGeom.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        this.trail = new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5 }));
        this.meshGroup.add(this.trail);
        this.reset();
    }
    step(dt) {
        super.step(dt);
        const r_vec = new THREE.Vector3().subVectors(this.sun.position, this.pos);
        const r2 = r_vec.lengthSq();
        if (r2 < 2.0) return; // 衝突防止
        
        // a = GM / r^2 (mは打ち消される)
        const accScalar = (this.G * this.M) / r2;
        const acc = r_vec.normalize().multiplyScalar(accScalar);
        
        this.vel.add(acc.multiplyScalar(dt));
        this.pos.add(this.vel.clone().multiplyScalar(dt));
        this.planet.position.copy(this.pos);

        if (this.simTime % 0.05 < dt && this.trailPoints.length < this.maxTrail) {
            this.trailPoints.push(this.pos.clone());
            const posAttr = this.trail.geometry.attributes.position;
            posAttr.setXYZ(this.trailPoints.length - 1, this.pos.x, this.pos.y, this.pos.z);
            posAttr.needsUpdate = true;
            this.trail.geometry.setDrawRange(0, this.trailPoints.length);
        }
    }
    getExplanation() { return "中心の星（質量M）からの万有引力による軌道運動です。初速度と質量のバランスにより、円軌道、楕円軌道、双曲線軌道（飛び去る）へと変化します。"; }
    reset() {
        super.reset();
        this.pos.set(10, 0, 0);
        this.vel.set(0, 0, -this.v0);
        this.trailPoints = [];
        if (this.trail) this.trail.geometry.setDrawRange(0, 0);
    }
}

// [5] クーロン力・ラザフォード散乱 (原子/電磁気)
class CoulombScatteringUnit extends BaseUnit {
    static unitName = "5. クーロン力とラザフォード散乱 (原子)";
    static linkedFormula = "F = k(q₁q₂ / r²)";
    constructor() {
        super();
        this.q1 = 5.0; // 中心原子核の電荷 (固定)
        this.q2 = 1.0; // 入射粒子の電荷
        this.v0 = 8.0; this.b = 2.0; // 衝突径数(y軸ズレ)
        this.k = 50.0; // クーロン定数スケール
        this.pos = new THREE.Vector3(-15, this.b, 0);
        this.vel = new THREE.Vector3(this.v0, 0, 0);
        this.trailPoints = []; this.maxTrail = 500;
    }
    getParameters() {
        return [
            { id: 'q2', name: '入射粒子の電荷(＋/－)', symbol: 'q₂', min: -3.0, max: 3.0, step: 0.5, value: this.q2, unit: 'C' },
            { id: 'b', name: '衝突径数(ズレ)', symbol: 'b', min: 0.0, max: 5.0, step: 0.5, value: this.b, unit: 'm' },
            { id: 'v0', name: '入射速度', symbol: 'v₀', min: 5.0, max: 15.0, step: 1.0, value: this.v0, unit: 'm/s' }
        ];
    }
    init(scene) {
        super.init(scene);
        this.nucleus = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 32), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        this.meshGroup.add(this.nucleus);

        this.particle = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
        this.meshGroup.add(this.particle);

        const trailGeom = new THREE.BufferGeometry();
        this.trailPositions = new Float32Array(this.maxTrail * 3);
        trailGeom.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        this.trail = new THREE.Line(trailGeom, new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
        this.meshGroup.add(this.trail);
        this.reset();
    }
    step(dt) {
        super.step(dt);
        const r_vec = new THREE.Vector3().subVectors(this.pos, this.nucleus.position);
        const r2 = r_vec.lengthSq();
        if (r2 < 1.2) return; 

        // F = k * q1 * q2 / r^2 (斥力なら正、引力なら負)
        const forceScalar = (this.k * this.q1 * this.q2) / r2;
        const acc = r_vec.normalize().multiplyScalar(forceScalar); 
        
        this.vel.add(acc.multiplyScalar(dt));
        this.pos.add(this.vel.clone().multiplyScalar(dt));
        this.particle.position.copy(this.pos);

        if (this.simTime % 0.05 < dt && this.trailPoints.length < this.maxTrail) {
            this.trailPoints.push(this.pos.clone());
            const posAttr = this.trail.geometry.attributes.position;
            posAttr.setXYZ(this.trailPoints.length - 1, this.pos.x, this.pos.y, this.pos.z);
            posAttr.needsUpdate = true;
            this.trail.geometry.setDrawRange(0, this.trailPoints.length);
        }
    }
    getExplanation() { return "固定された正電荷（原子核）に対する、荷電粒子の散乱シミュレーションです。q₂が正なら斥力で大きく反れ（ラザフォード散乱）、負なら引力で引き寄せられます。衝突径数 b が小さいほど散乱角は大きくなります。"; }
    reset() {
        super.reset();
        if(this.particle) this.particle.material.color.setHex(this.q2 >= 0 ? 0xef4444 : 0x3b82f6);
        this.pos.set(-15, this.b, 0);
        this.vel.set(this.v0, 0, 0);
        this.trailPoints = [];
        if (this.trail) this.trail.geometry.setDrawRange(0, 0);
    }
}

// ============================================================================
// 5. エントリーポイント（アプリケーション起動）
// ============================================================================
const physicsApp = new PhysicsEngine();

// 作成した全5種のシミュレーションをエンジンに登録
physicsApp.registerUnit('projectile', ProjectileUnit);
physicsApp.registerUnit('shm', SHMUnit);
physicsApp.registerUnit('lorentz', LorentzForceUnit);
physicsApp.registerUnit('gravity', GravityOrbitUnit);
physicsApp.registerUnit('coulomb', CoulombScatteringUnit);

const uiController = new UIController();
uiController.switchMode('flashcard'); // 起動時は暗記モードを開く
