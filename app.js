// --- Three.js & OrbitControls ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// ★ OrbitControlsによるカメラ操作
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

let currentAnim = "";
let isPlaying = true;
let time = 0;
let objects = []; // メモリリーク防止用管理配列

function clearScene() {
    objects.forEach(obj => {
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        scene.remove(obj);
    });
    objects = [];
    time = 0;
}

function createMesh(geo, color, opacity=1) {
    const mat = new THREE.MeshStandardMaterial({ color: color, transparent: opacity<1, opacity: opacity });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh); objects.push(mesh);
    return mesh;
}
function createArrow(dir, origin, length, color) {
    const arrow = new THREE.ArrowHelper(dir, origin, length, color, length*0.2, length*0.1);
    scene.add(arrow); objects.push(arrow);
    return arrow;
}

// === 公式クリック時の3Dシーン構築 ===
function initSimulation(type) {
    clearScene();
    currentAnim = type;
    scene.background = new THREE.Color(0x111111);
    camera.position.set(0, 5, 18);
    controls.target.set(0, 0, 0);

    // 共通グリッド
    if(!type.includes("wave") && !type.includes("gas") && !type.includes("atom")) {
        const grid = new THREE.GridHelper(30, 30, 0x333333, 0x222222);
        grid.position.y = -2; scene.add(grid); objects.push(grid);
    }

    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const boxGeo = new THREE.BoxGeometry(2,2,2);

    // アニメーションタイプごとの初期配置
    if(type === "linear" || type === "accel") {
        createMesh(sphereGeo, 0x3498db).position.set(-6, 0, 0);
    } else if(type === "fall" || type === "fall_v0") {
        createMesh(sphereGeo, 0xe74c3c).position.set(0, 6, 0);
    } else if(type === "throw") {
        createMesh(sphereGeo, 0xf1c40f).position.set(0, -1, 0);
    } else if(type === "force_g" || type === "buoyancy") {
        createMesh(boxGeo, 0x95a5a6);
        createArrow(new THREE.Vector3(0, type==="force_g"?-1:1, 0), new THREE.Vector3(0,0,0), 3, type==="force_g"?0xe74c3c:0x3498db);
    } else if(type === "spring" || type === "harmonic_f") {
        createMesh(boxGeo, 0x2ecc71);
        createArrow(new THREE.Vector3(-1,0,0), new THREE.Vector3(0,0,0), 3, 0xe74c3c); 
    } else if(type === "friction_s" || type === "friction_d") {
        createMesh(boxGeo, 0x9b59b6);
        createArrow(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 3, 0x3498db); 
        createArrow(new THREE.Vector3(-1,0,0), new THREE.Vector3(0,-1,0), 2, 0xe74c3c); 
    } else if(type === "pressure") {
        createMesh(new THREE.BoxGeometry(2,4,2), 0x34495e).position.y = 1;
        createArrow(new THREE.Vector3(0,-1,0), new THREE.Vector3(0,4,0), 2, 0xe74c3c);
    } else if(type === "equation" || type === "work" || type === "power") {
        createMesh(boxGeo, 0x34495e).position.set(-5, 0, 0);
        createArrow(new THREE.Vector3(1,0,0), new THREE.Vector3(-5,0,0), 2, 0xe74c3c); 
    } else if(type === "moment" || type === "balance" || type === "center_mass") {
        createMesh(new THREE.BoxGeometry(12, 0.2, 1), 0xf39c12); 
        createMesh(sphereGeo, 0x3498db).position.set(-4, 0.5, 0);
        if(type!=="moment") createMesh(sphereGeo, 0xe74c3c).position.set(4, 0.5, 0);
    } else if(type.includes("energy") || type.includes("pendulum")) {
        createMesh(sphereGeo, 0x9b59b6); 
    } else if(type === "momentum" || type === "impulse") {
        createMesh(sphereGeo, 0x3498db).position.set(-6, 0, 0);
    } else if(type === "collision") {
        createMesh(sphereGeo, 0x3498db).position.set(-6, 0, 0);
        createMesh(sphereGeo, 0xe74c3c).position.set(2, 0, 0);
    } else if(type === "bounce") {
        createMesh(sphereGeo, 0x1abc9c).position.set(-5, 5, 0);
    } else if(type.includes("circular") || type === "centrifugal" || type === "kepler" || type.includes("orbit") || type === "escape") {
        createMesh(new THREE.SphereGeometry(0.6), 0xf1c40f); // 中心
        createMesh(new THREE.SphereGeometry(0.5), 0x3498db); // 周回
        if(type === "circular_f" || type === "centrifugal") {
            createArrow(new THREE.Vector3(-1,0,0), new THREE.Vector3(4,0,0), 2, type==="centrifugal"?0x3498db:0xe74c3c);
        }
    } else if(type.includes("harmonic_")) {
        createMesh(sphereGeo, 0x2ecc71); // 振動子
        createMesh(new THREE.SphereGeometry(0.3), 0x7f8c8d); // 影の元
        const ring = new THREE.Mesh(new THREE.RingGeometry(3.9, 4.0, 64), new THREE.MeshBasicMaterial({color:0x444}));
        scene.add(ring); objects.push(ring);
    } else if(type === "heat" || type === "heat_mix" || type === "latent" || type === "temp") {
        createMesh(new THREE.BoxGeometry(4,4,4), 0xe74c3c, 0.5);
        for(let i=0; i<15; i++) createMesh(new THREE.SphereGeometry(0.2), 0xf1c40f).position.set((Math.random()-0.5)*3,(Math.random()-0.5)*3,(Math.random()-0.5)*3);
    } else if(type === "boyle" || type === "gas" || type === "kinetic" || type === "internal_u" || type === "piston" || type === "molar" || type === "engine") {
        createMesh(new THREE.BoxGeometry(6,6,6), 0xffffff, 0.2); // 容器
        if(type==="piston" || type==="engine") createMesh(new THREE.BoxGeometry(0.2, 5.8, 5.8), 0xe74c3c).position.set(3,0,0);
        for(let i=0; i<30; i++) {
            let p = createMesh(new THREE.SphereGeometry(0.2), 0xe67e22);
            p.position.set((Math.random()-0.5)*5, (Math.random()-0.5)*5, (Math.random()-0.5)*5);
            p.userData = { v: new THREE.Vector3((Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3) };
        }
    } else if(type === "wave" || type === "wave_eq" || type === "sound" || type === "beat") {
        for(let i=0; i<40; i++) createMesh(new THREE.SphereGeometry(0.2), 0x9b59b6).position.x = -8 + i*0.4;
    } else if(type === "interfere" || type === "young") {
        for(let i=0; i<20; i++) { createMesh(new THREE.SphereGeometry(0.2), 0x3498db); createMesh(new THREE.SphereGeometry(0.2), 0xe74c3c); }
    } else if(type === "refract" || type === "refract_n" || type === "reflect_all" || type === "film" || type === "lens" || type === "diffraction") {
        createMesh(new THREE.BoxGeometry(20, 10, 0.1), 0x3498db, 0.3).position.y = -5; // 媒質
        createMesh(new THREE.SphereGeometry(0.2), 0xf1c40f); // 光源・光子
    } else if(type === "doppler") {
        createMesh(new THREE.SphereGeometry(0.5), 0xe74c3c); // 音源
        for(let i=0; i<30; i++) createMesh(new THREE.SphereGeometry(0.1), 0xffffff); // 波面
    } else if(type === "standing") {
        for(let i=0; i<40; i++) createMesh(new THREE.SphereGeometry(0.15), 0x2ecc71).position.x = -8 + i*0.4;
    } else if(type === "coulomb" || type === "efield" || type === "potential") {
        createMesh(sphereGeo, 0xe74c3c); // +
        for(let i=0; i<8; i++) {
            let arr = createArrow(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 4, 0xe74c3c);
            arr.rotation.z = (Math.PI/4)*i;
        }
        if(type==="coulomb") createMesh(sphereGeo, 0x3498db).position.set(4,0,0);
    } else if(type === "efield_uniform") {
        createMesh(new THREE.BoxGeometry(8, 0.2, 4), 0xe74c3c).position.y = 3;
        createMesh(new THREE.BoxGeometry(8, 0.2, 4), 0x3498db).position.y = -3;
        for(let i=0; i<5; i++) createArrow(new THREE.Vector3(0,-1,0), new THREE.Vector3(-3+i*1.5, 3, 0), 6, 0xe74c3c);
    } else if(type.includes("capacitor") || type === "cap_energy" || type === "cap_circuit") {
        createMesh(new THREE.BoxGeometry(8, 0.2, 4), 0xe74c3c).position.y = 2;
        createMesh(new THREE.BoxGeometry(8, 0.2, 4), 0x3498db).position.y = -2;
        createMesh(new THREE.SphereGeometry(0.3), 0xf1c40f).position.set(-3, 0, 0); // 電子
    } else if(type === "current" || type === "resistance" || type === "joule" || type === "kirchhoff") {
        createMesh(new THREE.BoxGeometry(12, 1, 1), 0x7f8c8d, 0.3);
        for(let i=0; i<15; i++) createMesh(new THREE.SphereGeometry(0.2), 0xf1c40f).position.set((Math.random()-0.5)*10, 0, 0);
    } else if(type === "mag_field" || type === "mag_flux") {
        createMesh(new THREE.BoxGeometry(0.2, 10, 0.2), 0xbdc3c7); // 導線
        const ring = new THREE.Mesh(new THREE.RingGeometry(3.9, 4.0, 64), new THREE.MeshBasicMaterial({color:0x2ecc71}));
        ring.rotation.x = Math.PI/2; scene.add(ring); objects.push(ring);
    } else if(type === "ampere" || type === "rod") {
        createMesh(new THREE.BoxGeometry(8, 0.2, 0.2), 0xf39c12); // 棒
        createArrow(new THREE.Vector3(0,1,0), new THREE.Vector3(0,-2,0), 4, 0x2ecc71); // B
    } else if(type.includes("lorentz")) {
        createMesh(new THREE.SphereGeometry(0.4), 0xf1c40f); // 電子
        for(let i=0; i<5; i++) createArrow(new THREE.Vector3(0,1,0), new THREE.Vector3(-4+i*2, -3, 0), 6, 0x2ecc71); // B
    } else if(type === "flux" || type === "induction" || type === "self_ind") {
        createMesh(new THREE.BoxGeometry(4,4,4), 0x8e44ad, 0.3);
        createMesh(new THREE.BoxGeometry(1,3,1), 0xe74c3c).position.y = 5; // 磁石
    } else if(type === "ac_gen" || type === "ac" || type === "reactance" || type === "impedance" || type === "resonance") {
        for(let i=0; i<40; i++) createMesh(new THREE.SphereGeometry(0.15), 0xf1c40f).position.x = -8 + i*0.4;
    } else if(type === "photon" || type === "photoelectric" || type === "stop_v") {
        createMesh(new THREE.BoxGeometry(8,6,0.2), 0x95a5a6).position.z = -1;
        createMesh(new THREE.SphereGeometry(0.2), 0xf1c40f).position.z = 0; // 電子
        createMesh(new THREE.SphereGeometry(0.15), 0xecf0f1).position.set(-4,4,2); // 光子
    } else if(type === "matter_wave" || type === "xray") {
        for(let i=0; i<20; i++) createMesh(new THREE.SphereGeometry(0.15), 0xf1c40f).position.x = -8+i*0.5;
    } else if(type.includes("bohr") || type === "energy_level") {
        createMesh(new THREE.SphereGeometry(1.0), 0xe74c3c); // 核
        const orbit1 = new THREE.Mesh(new THREE.RingGeometry(2.9, 3.0, 64), new THREE.MeshBasicMaterial({color:0x333, side:THREE.DoubleSide}));
        const orbit2 = new THREE.Mesh(new THREE.RingGeometry(4.9, 5.0, 64), new THREE.MeshBasicMaterial({color:0x333, side:THREE.DoubleSide}));
        orbit1.rotation.x = Math.PI/2; orbit2.rotation.x = Math.PI/2;
        scene.add(orbit1); scene.add(orbit2); objects.push(orbit1, orbit2);
        createMesh(new THREE.SphereGeometry(0.3), 0x3498db); // 電子
    } else if(type.includes("mass_defect") || type === "mc2" || type === "half_life" || type === "decay" || type === "nuclear") {
        createMesh(new THREE.SphereGeometry(1.2), 0xe74c3c); // 核
        createMesh(new THREE.SphereGeometry(0.4), 0x3498db); // 粒子
    }
}

// === 毎フレームの更新 ===
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // ★ カメラ操作の更新
    if (!isPlaying) return;
    time += 0.04;

    if(currentAnim === "linear") {
        objects[0].position.x = -6 + time*3; if(objects[0].position.x > 6) time=0;
    } else if(currentAnim === "accel" || currentAnim === "equation" || currentAnim === "work" || currentAnim === "power" || currentAnim === "momentum" || currentAnim === "impulse") {
        objects[0].position.x = -6 + 0.5*(time*time); if(objects[0].position.x > 6) time=0;
        if(objects.length > 1 && objects[1].type === "ArrowHelper") objects[1].position.x = objects[0].position.x; 
    } else if(currentAnim === "fall" || currentAnim === "fall_v0") {
        let v0 = currentAnim==="fall_v0" ? 4 : 0;
        objects[0].position.y = 6 - v0*time - 0.5*9.8*(time*time)*0.2; if(objects[0].position.y < -2) time=0;
    } else if(currentAnim === "throw") {
        objects[0].position.y = -1 + 8*time - 0.5*9.8*(time*time)*0.5; if(objects[0].position.y < -2 && time>1) time=0;
    } else if(currentAnim === "spring" || currentAnim === "harmonic_f" || currentAnim === "friction_s" || currentAnim === "friction_d") {
        objects[0].position.x = Math.sin(time*2)*2; 
        if(objects[2]) objects[2].setLength(2 + Math.abs(objects[0].position.x)); 
    } else if(currentAnim === "moment" || currentAnim === "balance" || currentAnim === "center_mass") {
        objects[0].rotation.z = Math.sin(time)*0.2;
        objects[1].position.y = 0.5 + Math.sin(time)*0.2 * -4;
        if(objects[2]) objects[2].position.y = 0.5 + Math.sin(time)*0.2 * 4;
    } else if(currentAnim.includes("energy") || currentAnim.includes("pendulum")) {
        let angle = Math.sin(time*1.5);
        objects[0].position.set(6*Math.sin(angle), 4 - 6*Math.cos(angle), 0);
    } else if(currentAnim === "collision") {
        if(time<2) { objects[0].position.x = -6 + time*4; objects[1].position.x = 2; }
        else { objects[0].position.x = 2; objects[1].position.x = 2 + (time-2)*4; }
        if(time>4) time=0;
    } else if(currentAnim === "bounce") {
        let t = time%2; objects[0].position.x += 0.05;
        objects[0].position.y = -1 + 8*t - 0.5*9.8*(t*t);
        if(objects[0].position.x > 5) objects[0].position.set(-5,5,0);
    } else if(currentAnim.includes("circular") || currentAnim === "centrifugal" || currentAnim === "kepler" || currentAnim.includes("orbit") || currentAnim === "escape") {
        let r = 4; let spd = 2;
        if(currentAnim === "kepler") { r = 4 + Math.cos(time); spd = 2/r; } // 楕円近似
        objects[1].position.set(r*Math.cos(time*spd), 0, r*Math.sin(time*spd));
        if(objects[2] && objects[2].type === "ArrowHelper") {
            objects[2].position.copy(objects[1].position);
            let dir = currentAnim==="centrifugal" ? 1 : -1;
            objects[2].setDirection(new THREE.Vector3(dir*objects[1].position.x, 0, dir*objects[1].position.z).normalize());
        }
    } else if(currentAnim.includes("harmonic_")) {
        objects[0].position.x = 4*Math.sin(time*2);
        objects[1].position.set(4*Math.sin(time*2), 4*Math.cos(time*2), 0);
    } else if(currentAnim === "heat" || currentAnim === "heat_mix" || currentAnim === "latent" || currentAnim === "temp") {
        for(let i=1; i<16; i++) {
            objects[i].position.x += (Math.random()-0.5)*0.5;
            objects[i].position.y += (Math.random()-0.5)*0.5;
            objects[i].position.z += (Math.random()-0.5)*0.5;
            if(objects[i].position.length() > 2) objects[i].position.set(0,0,0);
        }
    } else if(currentAnim === "boyle" || currentAnim === "gas" || currentAnim === "kinetic" || currentAnim === "internal_u" || currentAnim === "piston" || currentAnim === "molar" || currentAnim === "engine") {
        let start = currentAnim==="piston"||currentAnim==="engine" ? 2 : 1;
        if(start===2) objects[1].position.x = 3 + Math.sin(time)*1.5;
        for(let i=start; i<objects.length; i++){
            let p = objects[i]; p.position.add(p.userData.v);
            let lx = start===2 ? objects[1].position.x-0.2 : 2.8;
            if(Math.abs(p.position.x)>lx) p.userData.v.x *= -1;
            if(Math.abs(p.position.y)>2.8) p.userData.v.y *= -1;
            if(Math.abs(p.position.z)>2.8) p.userData.v.z *= -1;
        }
    } else if(currentAnim === "wave" || currentAnim === "wave_eq" || currentAnim === "sound" || currentAnim === "beat") {
        for(let i=0; i<40; i++) objects[i].position.y = 2*Math.sin(objects[i].position.x - time*4);
    } else if(currentAnim === "interfere" || currentAnim === "young") {
        for(let i=0; i<20; i++) {
            objects[i*2].position.set(-3+i*0.3, Math.sin(i-time*3), 0);
            objects[i*2+1].position.set(3-i*0.3, Math.sin(i-time*3), 0);
        }
    } else if(currentAnim === "refract" || currentAnim === "refract_n" || currentAnim === "reflect_all" || currentAnim === "film" || currentAnim === "lens" || currentAnim === "diffraction") {
        objects[1].position.x = -5 + time*3;
        objects[1].position.y = 5 - time*3;
        if(objects[1].position.y < 0) {
            objects[1].position.x = -5 + 1.5*3 + (time-1.5)*1.5; // 屈折して遅くなる
            objects[1].position.y = -(time-1.5)*2;
        }
        if(time>3) time=0;
    } else if(currentAnim === "doppler") {
        objects[0].position.x = -4 + time*1.5; // 音源移動
        for(let i=1; i<31; i++) {
            let scale = (time*3 - i*0.5);
            if(scale>0) {
                objects[i].position.copy(objects[0].position);
                objects[i].scale.set(scale, scale, scale);
                objects[i].material.opacity = 1 - scale/10;
            } else { objects[i].scale.set(0,0,0); }
        }
        if(time>6) time=0;
    } else if(currentAnim === "standing") {
        for(let i=0; i<40; i++) objects[i].position.y = 2*Math.sin(time*4) * Math.sin(objects[i].position.x*0.8);
    } else if(currentAnim.includes("capacitor") || currentAnim === "cap_energy" || currentAnim === "cap_circuit") {
        objects[2].position.x += 0.1; objects[2].position.y += 0.05;
        if(objects[2].position.x > 4) objects[2].position.set(-4,-2,0);
    } else if(currentAnim === "current" || currentAnim === "resistance" || currentAnim === "joule" || currentAnim === "kirchhoff") {
        for(let i=1; i<16; i++) { objects[i].position.x += 0.1; if(objects[i].position.x>6) objects[i].position.x = -6; }
    } else if(currentAnim === "ampere" || currentAnim === "rod") {
        objects[0].position.z = Math.sin(time*2)*2; // ローレンツ力で手前・奥へ
    } else if(currentAnim.includes("lorentz")) {
        objects[0].position.set(2*Math.cos(time*3), time*0.5-2, 2*Math.sin(time*3)); // らせん
        if(objects[0].position.y > 3) time=0;
    } else if(currentAnim === "flux" || currentAnim === "induction" || currentAnim === "self_ind") {
        objects[1].position.y = 5 - Math.abs(Math.sin(time*2))*5; // 磁石の往復
    } else if(currentAnim.includes("ac") || currentAnim === "reactance" || currentAnim === "impedance" || currentAnim === "resonance") {
        for(let i=0; i<40; i++) objects[i].position.y = 2*Math.sin(time*3 - objects[i].position.x*0.5);
    } else if(currentAnim === "photon" || currentAnim === "photoelectric" || currentAnim === "stop_v") {
        if(time<1) { objects[2].position.set(-4+time*4, 4-time*4, 2); objects[1].position.set(0,0,0); } 
        else { objects[2].position.set(0,-10,0); objects[1].position.set((time-1)*3, 0, 2); } 
        if(time>3) time=0;
    } else if(currentAnim === "matter_wave" || currentAnim === "xray") {
        for(let i=0; i<20; i++) objects[i].position.y = Math.sin(objects[i].position.x - time*4);
    } else if(currentAnim.includes("bohr") || currentAnim === "energy_level") {
        let r = Math.floor(time)%2===0 ? 3 : 5;
        objects[3].position.set(r*Math.cos(time*3), 0, r*Math.sin(time*3));
    } else if(currentAnim.includes("mass_defect") || currentAnim === "mc2" || currentAnim === "half_life" || currentAnim === "decay" || currentAnim === "nuclear") {
        if(time>1) { objects[1].position.x = (time-1)*3; objects[0].position.x = -(time-1)*0.5; }
        if(time>3) { time=0; objects[0].position.x=0; objects[1].position.x=0; }
    }

    renderer.render(scene, camera);
}
animate();

// === UI連動 ===
const menuList = document.getElementById('menu-list');
Object.keys(physicsData).forEach(key => {
    const data = physicsData[key];
    const li = document.createElement('li');
    li.className = 'item';
    li.innerText = data.title;
    li.onclick = () => {
        document.querySelectorAll('.sidebar .item').forEach(el => el.classList.remove('active'));
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
                initSimulation(f.animType); 
            };
            container.appendChild(card);
            if(idx === 0) card.click();
        });
        if (window.MathJax) MathJax.typeset();
    };
    menuList.appendChild(li);
});

document.getElementById('playBtn').onclick = () => { isPlaying = !isPlaying; document.getElementById('playBtn').innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
document.getElementById('resetBtn').onclick = () => time = 0;
window.onresize = () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); };
setTimeout(() => document.querySelector('.sidebar .item').click(), 300);
