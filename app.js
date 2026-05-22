const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

let currentType = "";
let isPlaying = true;
let time = 0;
let objects = [];

function clearScene() {
    objects.forEach(obj => scene.remove(obj));
    objects = [];
    time = 0;
}

function createObj(geom, color, wire=false) {
    const mat = new THREE.MeshStandardMaterial({ color: color, wireframe: wire });
    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);
    objects.push(mesh);
    return mesh;
}

function initSim(type) {
    clearScene();
    currentType = type;
    scene.background = new THREE.Color(0x111);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    if(type === "kinematics" || type === "force" || type === "collision") {
        createObj(new THREE.SphereGeometry(0.8, 32, 32), 0xe74c3c).position.set(-5, 0, 0);
        createObj(new THREE.BoxGeometry(20, 0.2, 5), 0x555).position.y = -0.9;
    } else if(type === "rotate" || type === "energy" || type === "harmonic") {
        createObj(new THREE.SphereGeometry(0.8, 32, 32), 0x2ecc71);
    } else if(type === "circular" || type === "orbit") {
        createObj(new THREE.SphereGeometry(0.5, 32, 32), 0xf1c40f); // 中心
        createObj(new THREE.SphereGeometry(0.6, 32, 32), 0x3498db); // 周回
        const orbit = createObj(new THREE.RingGeometry(3.9, 4.0, 64), 0x444);
        orbit.rotation.x = Math.PI / 2;
    } else if(type === "thermo") {
        createObj(new THREE.BoxGeometry(6, 6, 6), 0xffffff, true);
        for(let i=0; i<20; i++){
            let p = createObj(new THREE.SphereGeometry(0.3, 16, 16), 0xe67e22);
            p.position.set((Math.random()-0.5)*5, (Math.random()-0.5)*5, (Math.random()-0.5)*5);
            p.userData = { v: new THREE.Vector3((Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3) };
        }
    } else if(type === "wave" || type === "doppler" || type === "light" || type === "ac") {
        for(let i=0; i<40; i++){
            let p = createObj(new THREE.SphereGeometry(0.2, 16, 16), 0x9b59b6);
            p.position.x = -8 + i*0.4;
        }
    } else if(type === "efield" || type === "capacitor" || type === "current" || type === "magnetic" || type === "induction") {
        createObj(new THREE.SphereGeometry(0.4, 32, 32), 0xf1c40f).position.set(-5,0,0);
    } else if(type.startsWith("atom")) {
        createObj(new THREE.SphereGeometry(1.2, 32, 32), 0xe74c3c); // 核
        createObj(new THREE.SphereGeometry(0.3, 32, 32), 0x3498db); // 電子
        const orbit = createObj(new THREE.RingGeometry(4.9, 5.0, 64), 0x444);
        orbit.rotation.x = Math.PI / 2;
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (!isPlaying) return;
    time += 0.04;

    if(currentType === "kinematics" || currentType === "force" || currentType === "collision") {
        let x = -5 + (time*time)*0.3; if(x>5) time=0;
        objects[0].position.x = x;
    } else if(currentType === "circular" || currentType === "orbit") {
        objects[1].position.set(4*Math.cos(time*2), 0, 4*Math.sin(time*2));
    } else if(currentType === "harmonic" || currentType === "rotate" || currentType === "energy") {
        objects[0].position.x = 4*Math.sin(time*3);
    } else if(currentType === "thermo") {
        for(let i=1; i<21; i++){
            let p = objects[i]; p.position.add(p.userData.v);
            if(Math.abs(p.position.x)>2.8) p.userData.v.x *= -1;
            if(Math.abs(p.position.y)>2.8) p.userData.v.y *= -1;
            if(Math.abs(p.position.z)>2.8) p.userData.v.z *= -1;
        }
    } else if(currentType === "wave" || currentType === "doppler" || currentType === "light" || currentType === "ac") {
        for(let i=0; i<40; i++) objects[i].position.y = 2*Math.sin(objects[i].position.x - time*4);
    } else if(currentType === "efield" || currentType === "capacitor" || currentType === "current" || currentType === "magnetic" || currentType === "induction") {
        objects[0].position.set(4*Math.cos(time*3), 0, 4*Math.sin(time*3)); // 磁場での円運動など
    } else if(currentType.startsWith("atom")) {
        objects[1].position.set(5*Math.cos(time*4), 0, 5*Math.sin(time*4));
    }
    renderer.render(scene, camera);
}
animate();

// UI制御
document.querySelectorAll('.sidebar .item').forEach(item => {
    item.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar .item').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');

        const data = physicsData[e.target.dataset.id];
        document.getElementById('unit-title').innerText = data.title;
        document.getElementById('sim-desc').innerText = data.simText;
        
        const container = document.getElementById('formula-cards-container');
        container.innerHTML = "";
        data.formulas.forEach(f => {
            container.innerHTML += `<div class="formula-card"><h3>${f.name}</h3><div class="math-box">${f.math}</div>
                <div class="desc-section"><strong>【いつ使う？】</strong><br>${f.usage}</div>
                <div class="desc-section"><strong>【なぜこうなる？】</strong><br>${f.reason}</div></div>`;
        });
        if (window.MathJax) MathJax.typeset();
        initSim(data.type);
    });
});

document.getElementById('playBtn').addEventListener('click', () => isPlaying = !isPlaying);
document.getElementById('resetBtn').addEventListener('click', () => time = 0);
window.addEventListener('resize', () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); });
setTimeout(() => document.querySelector('.sidebar .item').click(), 300);
