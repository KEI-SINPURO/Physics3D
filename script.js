// ============================================================================
// 1. 物理シミュレーション共通コアエンジンクラス
// ============================================================================
class PhysicsEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.placeholder = document.getElementById('canvas-placeholder');
        this.panel = document.getElementById('panel-container');
        this.titleElement = document.getElementById('unit-title');
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.activeUnit = null;
        this.isPaused = false;
        this.timeScale = 1.0;
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
        this.controls.target.set(0, 2, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
        
        const gridHelper = new THREE.GridHelper(40, 40, 0x475569, 0x334155);
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);
    }

    registerUnit(id, unitClass) {
        this.units[id] = unitClass;
        this.renderMenu();
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

        if (this.activeUnit) {
            this.activeUnit.destroy(this.scene);
        }

        this.placeholder.style.display = 'none';
        this.panel.style.visibility = 'visible';
        
        const UnitClass = this.units[id];
        this.activeUnit = new UnitClass();
        this.titleElement.textContent = UnitClass.unitName;
        
        this.camera.position.copy(this.initialCameraPos);
        this.controls.target.set(0, 2, 0);
        
        this.activeUnit.init(this.scene);
        this.buildControls();
        this.renderExplanation();
        this.resetSimulation();
    }

    buildControls() {
        const container = document.getElementById('dynamic-controls');
        container.innerHTML = '';
        if (!this.activeUnit) return;

        const params = this.activeUnit.getParameters();
        params.forEach(p => {
            const item = document.createElement('div');
            item.className = 'control-item';

            const labelDiv = document.createElement('div');
            labelDiv.className = 'control-label';
            
            // katex.js (MathRenderer) を使用して記号と単位を整形
            const prettySymbol = window.MathRenderer ? window.MathRenderer.formatSymbol(p.symbol) : p.symbol;
            const prettyUnit = window.MathRenderer ? window.MathRenderer.formatUnit(p.unit) : p.unit;

            const nameSpan = document.createElement('span');
            nameSpan.innerHTML = `${p.name} <span class="symbol-tag">${prettySymbol}</span>`;
            
            const valSpan = document.createElement('span');
            valSpan.id = `val-${p.id}`;
            valSpan.textContent = `${p.value} ${prettyUnit}`;

            labelDiv.appendChild(nameSpan);
            labelDiv.appendChild(valSpan);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'control-slider';
            slider.min = p.min;
            slider.max = p.max;
            slider.step = p.step;
            slider.value = p.value;
            
            slider.oninput = (e) => {
                const val = parseFloat(e.target.value);
                valSpan.textContent = `${val} ${prettyUnit}`;
                this.activeUnit.updateParameter(p.id, val);
            };

            item.appendChild(labelDiv);
            item.appendChild(slider);
            container.appendChild(item);
        });
    }

    renderExplanation() {
        const expBox = document.getElementById('explanation-text');
        expBox.textContent = this.activeUnit ? this.activeUnit.getExplanation() : '';
    }

    togglePlayPause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('btn-play-pause');
        if (this.isPaused) {
            btn.textContent = '再 生';
            btn.className = 'btn btn-danger';
        } else {
            btn.textContent = '一時停止';
            btn.className = 'btn btn-primary';
        }
    }

    resetSimulation() {
        if (this.activeUnit) {
            this.activeUnit.reset();
        }
    }

    changeSpeed(val) {
        this.timeScale = parseFloat(val);
        document.getElementById('txt-speed').textContent = `${this.timeScale.toFixed(2)}x`;
    }

    changeZoom(val) {
        const zoomFactor = parseFloat(val);
        document.getElementById('txt-zoom').textContent = `${zoomFactor.toFixed(1)}x`;
        const targetDist = 15 / zoomFactor;
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
        this.camera.position.copy(dir.multiplyScalar(targetDist).add(this.controls.target));
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        
        if (this.activeUnit && !this.isPaused) {
            const dt = 0.01666 * this.timeScale;
            this.activeUnit.step(dt);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================================================
// 2. 単元オブジェクトのベースクラス
// ============================================================================
class BaseUnit {
    constructor() {
        this.meshGroup = new THREE.Group();
        this.simTime = 0;
    }
    init(scene) { scene.add(this.meshGroup); }
    getParameters() { return []; }
    updateParameter(id, value) { this[id] = value; this.reset(); }
    getExplanation() { return ""; }
    step(dt) { this.simTime += dt; }
    reset() { this.simTime = 0; }
    destroy(scene) {
        scene.remove(this.meshGroup);
        this.meshGroup.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        });
    }
}

// --- 単元A: 放物運動 ---
class ProjectileUnit extends BaseUnit {
    static unitName = "放物運動シミュレーション";
    constructor() {
        super();
        this.m = 1.0;
        this.v0 = 15.0;
        this.theta = 45.0;
        this.g = 9.8;
        
        this.ball = null;
        this.trail = null;
        this.trailPoints = [];
        this.maxTrailCount = 600;
    }

    getParameters() {
        return [
            { id: 'm', name: '球の質量', symbol: 'm', min: 0.2, max: 5.0, step: 0.1, value: this.m, unit: 'kg' },
            { id: 'v0', name: '発射初速度', symbol: 'v0', min: 5.0, max: 25.0, step: 0.5, value: this.v0, unit: 'm/s' },
            { id: 'theta', name: '投射角度', symbol: 'theta', min: 0, max: 90, step: 1, value: this.theta, unit: 'deg' },
            { id: 'g', name: '重力加速度', symbol: 'g', min: 1.0, max: 20.0, step: 0.1, value: this.g, unit: 'm/s2' }
        ];
    }

    init(scene) {
        super.init(scene);
        const radius = 0.2 * Math.cbrt(this.m);
        const geom = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.1 });
        this.ball = new THREE.Mesh(geom, mat);
        this.ball.castShadow = true;
        this.meshGroup.add(this.ball);

        const trailGeom = new THREE.BufferGeometry();
        this.trailPositions = new Float32Array(this.maxTrailCount * 3);
        trailGeom.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
        const trailMat = new THREE.LineBasicMaterial({ color: 0xf43f5e, linewidth: 2 });
        this.trail = new THREE.Line(trailGeom, trailMat);
        this.meshGroup.add(this.trail);

        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        stand.position.set(0, 0.25, 0);
        this.meshGroup.add(stand);
        
        this.reset();
    }

    getExplanation() {
        return "水平方向には等速直線運動、鉛直方向には等加速度直線運動（自由落下）を行う現象です。\n\n質量 m を変化させても空気抵抗を考慮しない理論上、軌道や到達距離は変化しません（球の大きさが連動変化します）。\n初速度 v₀ を大きくすると遠くへ飛び、角度 θ を45度に設定したときに水平到達距離が最大になります。重力加速度 g を小さくすると（月面など）、落下が遅くなり軌道が高くなります。";
    }

    step(dt) {
        super.step(dt);
        const t = this.simTime;
        const rad = (this.theta * Math.PI) / 180;
        
        const x = this.v0 * Math.cos(rad) * t;
        const y = this.v0 * Math.sin(rad) * t - 0.5 * this.g * t * t;
        const z = 0;

        if (y >= 0) {
            this.ball.position.set(x, y, z);
            
            if (this.trailPoints.length < this.maxTrailCount) {
                this.trailPoints.push(new THREE.Vector3(x, y, z));
                const posAttr = this.trail.geometry.attributes.position;
                posAttr.setXYZ(this.trailPoints.length - 1, x, y, z);
                posAttr.needsUpdate = true;
                this.trail.geometry.setDrawRange(0, this.trailPoints.length);
            }
        } else {
            this.ball.position.y = 0;
        }
    }

    reset() {
        super.reset();
        if (this.ball) {
            const radius = 0.2 * Math.cbrt(this.m);
            this.ball.geometry.dispose();
            this.ball.geometry = new THREE.SphereGeometry(radius, 32, 32);
            this.ball.position.set(0, 0, 0);
        }
        this.trailPoints = [];
        if (this.trail) {
            this.trail.geometry.setDrawRange(0, 0);
        }
    }
}

// --- 単元B: 単振動 ---
class SHMUnit extends BaseUnit {
    static unitName = "単振動（ばね振り子）";
    constructor() {
        super();
        this.m = 1.0;
        this.k = 20.0;
        this.A = 3.0;
        
        this.ball = null;
        this.spring = null;
        this.springTurns = 24;
        this.springPointsCount = 200;
        this.ceilingY = 8.0;
    }

    getParameters() {
        return [
            { id: 'm', name: '重りの質量', symbol: 'm', min: 0.5, max: 4.5, step: 0.1, value: this.m, unit: 'kg' },
            { id: 'k', name: 'ばね定数', symbol: 'k', min: 5.0, max: 40.0, step: 1.0, value: this.k, unit: 'N/m' },
            { id: 'A', name: '振幅', symbol: 'A', min: 0.5, max: 4.0, step: 0.1, value: this.A, unit: 'm' }
        ];
    }

    init(scene) {
        super.init(scene);
        
        const ceilGeom = new THREE.BoxGeometry(4, 0.2, 4);
        const ceilMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const ceiling = new THREE.Mesh(ceilGeom, ceilMat);
        ceiling.position.set(0, this.ceilingY, 0);
        this.meshGroup.add(ceiling);

        const radius = 0.25 * Math.cbrt(this.m);
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 })
        );
        this.ball.castShadow = true;
        this.meshGroup.add(this.ball);

        const springGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(this.springPointsCount * 3);
        springGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const springMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0, linewidth: 3 });
        this.spring = new THREE.Line(springGeom, springMat);
        this.meshGroup.add(this.spring);

        this.reset();
    }

    getExplanation() {
        return "復元力（F = -kx）によって、物体が特定の中心点の周りを往復運動する現象です。\n\n平衡位置（力がつり合う中心点）を基準に変位します。\n角振動数 ω は √(k/m) で計算され、周期 T は 2π√(m/k) となります。\n質量 m を大きくすると周期が長くなり、ばね定数 k を大きく（強いばねに）すると往復が速くなります。振幅 A を変えても、往復にかかる周期 T は変化しない（等時性）ことが観察できます。";
    }

    step(dt) {
        super.step(dt);
        
        const omega = Math.sqrt(this.k / this.m);
        const equilibriumY = 3.5;
        const displacement = this.A * Math.cos(omega * this.simTime);
        const ballY = equilibriumY + displacement;

        this.ball.position.set(0, ballY, 0);
        this.updateSpringGeometry(ballY);
    }

    updateSpringGeometry(ballY) {
        const posAttr = this.spring.geometry.attributes.position;
        const startY = this.ceilingY - 0.1;
        const endY = ballY + 0.25 * Math.cbrt(this.m);
        const length = startY - endY;

        for (let i = 0; i < this.springPointsCount; i++) {
            const t = i / (this.springPointsCount - 1);
            const currentY = startY - t * length;
            
            let currentX = 0;
            let currentZ = 0;

            if (t > 0.05 && t < 0.95) {
                const theta = (t - 0.05) / 0.09 * this.springTurns * 2 * Math.PI;
                const radius = 0.3;
                currentX = radius * Math.cos(theta);
                currentZ = radius * Math.sin(theta);
            }

            posAttr.setXYZ(i, currentX, currentY, currentZ);
        }
        posAttr.needsUpdate = true;
    }

    reset() {
        super.reset();
        if (this.ball) {
            const radius = 0.25 * Math.cbrt(this.m);
            this.ball.geometry.dispose();
            this.ball.geometry = new THREE.SphereGeometry(radius, 32, 32);
            
            const equilibriumY = 3.5;
            this.ball.position.set(0, equilibriumY + this.A, 0);
            this.updateSpringGeometry(equilibriumY + this.A);
        }
    }
}

// --- 単元C: 2球の衝突 ---
class CollisionUnit extends BaseUnit {
    static unitName = "運動量保存と2球の衝突";
    constructor() {
        super();
        this.m1 = 1.0;
        this.m2 = 2.0;
        this.v1 = 4.0;
        this.v2 = -2.0;
        this.e = 0.8;

        this.ball1 = null;
        this.ball2 = null;
        
        this.x1 = -5.0;
        this.x2 = 5.0;
        this.currentV1 = 0;
        this.currentV2 = 0;
    }

    getParameters() {
        return [
            { id: 'm1', name: '球1の質量', symbol: 'm1', min: 0.5, max: 4.5, step: 0.1, value: this.m1, unit: 'kg' },
            { id: 'm2', name: '球2の質量', symbol: 'm2', min: 0.5, max: 4.5, step: 0.1, value: this.m2, unit: 'kg' },
            { id: 'v1', name: '球1初速度', symbol: 'v1', min: 0.0, max: 10.0, step: 0.5, value: this.v1, unit: 'm/s' },
            { id: 'v2', name: '球2初速度', symbol: 'v2', min: -10.0, max: 0.0, step: 0.5, value: this.v2, unit: 'm/s' },
            { id: 'e', name: '反発係数', symbol: 'e', min: 0.0, max: 1.0, step: 0.05, value: this.e, unit: '' }
        ];
    }

    init(scene) {
        super.init(scene);

        const railMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const rail = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 1.0), railMat);
        rail.position.set(0, 0.05, 0);
        this.meshGroup.add(rail);

        this.ball1 = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
        );
        this.ball1.castShadow = true;
        this.meshGroup.add(this.ball1);

        this.ball2 = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 })
        );
        this.ball2.castShadow = true;
        this.meshGroup.add(this.ball2);

        this.reset();
    }

    getExplanation() {
        return "外力が働かない２球の衝突前後において、運動量の総和が保存される現象（運動量保存の法則）です。\n\n反発係数 e が 1.0 のとき（弾性衝突）、衝突によって運動エネルギーは失われません。\ne が 0 のとき（完全非弾性衝突）、２つの球は衝突後に合体して同じ速度で進みます。\nそれぞれの質量 m₁ , m₂ や初速度を変えたとき、衝突後にどちらがどれだけの速度で跳ね返るか、挙動がリアルタイムに変化します。";
    }

    step(dt) {
        super.step(dt);

        const r1 = 0.3 * Math.cbrt(this.m1);
        const r2 = 0.3 * Math.cbrt(this.m2);

        this.x1 += this.currentV1 * dt;
        this.x2 += this.currentV2 * dt;

        const distance = this.x2 - this.x1;
        const minDistance = r1 + r2;

        if (distance <= minDistance && this.currentV1 > this.currentV2) {
            const u1 = this.currentV1;
            const u2 = this.currentV2;
            const mSum = this.m1 + this.m2;

            this.currentV1 = ((this.m1 - this.e * this.m2) * u1 + this.m2 * (1 + this.e) * u2) / mSum;
            this.currentV2 = (this.m1 * (1 + this.e) * u1 + (this.m2 - this.e * this.m1) * u2) / mSum;

            const overlap = minDistance - distance;
            this.x1 -= overlap * (this.m2 / mSum);
            this.x2 += overlap * (this.m1 / mSum);
        }

        if (Math.abs(this.x1) > 14) this.currentV1 = 0;
        if (Math.abs(this.x2) > 14) this.currentV2 = 0;

        this.ball1.position.set(this.x1, r1, 0);
        this.ball2.position.set(this.x2, r2, 0);
    }

    reset() {
        super.reset();
        this.x1 = -5.0;
        this.x2 = 4.0;
        this.currentV1 = this.v1;
        this.currentV2 = this.v2;

        if (this.ball1 && this.ball2) {
            const r1 = 0.3 * Math.cbrt(this.m1);
            const r2 = 0.3 * Math.cbrt(this.m2);

            this.ball1.geometry.dispose();
            this.ball1.geometry = new THREE.SphereGeometry(r1, 32, 32);
            this.ball1.position.set(this.x1, r1, 0);

            this.ball2.geometry.dispose();
            this.ball2.geometry = new THREE.SphereGeometry(r2, 32, 32);
            this.ball2.position.set(this.x2, r2, 0);
        }
    }
}

// ============================================================================
// 4. アプリケーションの起動処理
// ============================================================================
const physicsApp = new PhysicsEngine();

physicsApp.registerUnit('projectile', ProjectileUnit);
physicsApp.registerUnit('shm', SHMUnit);
physicsApp.registerUnit('collision', CollisionUnit);
