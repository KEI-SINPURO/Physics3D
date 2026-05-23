// ==========================================
// 高校物理 高精度2Dシミュレーションエンジン (記号・正確作図 完全対応版)
// ==========================================

// --- UI・メニュー構築 ---
const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

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

// --- キャンバスと制御変数 ---
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let scale = 1.0, panX = 0, panY = 0;
let isDragging = false, lastX = 0, lastY = 0;

function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

function setAnimation(type) { animType = type; time = 0; scale = 1.0; panX = 0; panY = 0; document.getElementById('zoomSlider').value=1.0; document.getElementById('zoomVal').innerText="1.0x"; }

// UIリスナー
const speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const zoomSlider = document.getElementById('zoomSlider');
zoomSlider.addEventListener('input', e => { scale = parseFloat(e.target.value); document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; });
document.getElementById('playBtn').onclick = () => { isPlaying = !isPlaying; document.getElementById('playBtn').innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
document.getElementById('resetBtn').onclick = () => setAnimation(animType);

// マウス操作
canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', e => { if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('wheel', e => { e.preventDefault(); scale = Math.max(0.5, Math.min(3.0, scale + (e.deltaY>0?-0.1:0.1))); zoomSlider.value=scale; document.getElementById('zoomVal').innerText=scale.toFixed(1)+"x"; }, { passive: false });

// ==========================================
// ★ 高精度描画ユーティリティ（物理記号対応）
// ==========================================
function dLine(x1, y1, x2, y2, color, w=2, dash=[]) {
    ctx.strokeStyle=color; ctx.lineWidth=w; ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.setLineDash([]);
}
function dA(x1, y1, x2, y2, color, label="", dashed=false) { // drawArrow
    dLine(x1,y1,x2,y2,color, 2, dashed?[5,5]:[]);
    if(x1===x2 && y1===y2) return;
    const a = Math.atan2(y2-y1, x2-x1);
    ctx.beginPath(); ctx.moveTo(x2,y2); ctx.lineTo(x2-12*Math.cos(a-0.5), y2-12*Math.sin(a-0.5)); ctx.lineTo(x2-12*Math.cos(a+0.5), y2-12*Math.sin(a+0.5)); ctx.fillStyle=color; ctx.fill();
    if(label) { dMath(label, x2+10*Math.cos(a), y2+10*Math.sin(a), color); }
}
function dC(x, y, r, color, fill=true) { // drawCircle
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    if(fill){ctx.fillStyle=color; ctx.fill();}else{ctx.strokeStyle=color; ctx.lineWidth=2; ctx.stroke();}
}
function dB(x, y, w, h, color) { // drawBlock
    ctx.fillStyle=color; ctx.fillRect(x-w/2,y-h/2,w,h); ctx.strokeStyle='#2c3e50'; ctx.lineWidth=2; ctx.strokeRect(x-w/2,y-h/2,w,h);
}
function dAng(x, y, r, a1, a2, label, color) { // drawAngle
    ctx.beginPath(); ctx.moveTo(x,y); ctx.arc(x,y,r,a1,a2,false); ctx.closePath();
    ctx.fillStyle=color+"33"; ctx.fill(); ctx.strokeStyle=color; ctx.lineWidth=1; ctx.stroke();
    let m = (a1+a2)/2; dMath(label, x+(r+15)*Math.cos(m)-5, y+(r+15)*Math.sin(m)+5, color);
}
function dTxt(t, x, y, c="black", f="14px 'Hiragino Sans', Arial") {
    ctx.fillStyle=c; ctx.font=f; ctx.fillText(t,x,y);
}
function dMath(t, x, y, c="black") {
    ctx.fillStyle=c; ctx.font="italic bold 18px 'Times New Roman', serif"; 
    ctx.shadowColor="rgba(255,255,255,0.8)"; ctx.shadowBlur=4; ctx.fillText(t,x,y); ctx.shadowBlur=0;
}
function drawAxis(ox, oy, w, h, xL, yL) {
    dA(ox, oy+h, ox, oy-h, '#7f8c8d', yL); dA(ox-w, oy, ox+w, oy, '#7f8c8d', xL);
    dMath("O", ox-15, oy+15, '#7f8c8d');
}

// === メインループ ===
function render() {
    requestAnimationFrame(render);
    if(isPlaying) time += 0.04 * parseFloat(speedSlider.value);
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w/2 + panX, h/2 + panY); ctx.scale(scale, scale);

    // 背景方眼紙
    ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
    for(let i=-1000; i<=1000; i+=20) { if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5'; dLine(i,-1000,i,1000,ctx.strokeStyle); dLine(-1000,i,1000,i,ctx.strokeStyle); }
    dLine(-1000,0,1000,0,'#b2bec3',2); dLine(0,-1000,0,1000,'#b2bec3',2); // 原点十字

    let t = time % 6; 

    // ----------------------------------------------------
    // 【力学】等加速度運動・力・エネルギー
    // ----------------------------------------------------
    if (["linear","accel","equation","power","momentum","impulse"].includes(animType)) {
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-300, 40, 600, 5); 
        let a = animType==="linear"||animType==="momentum" ? 0 : 20;
        let v0 = 40; let x = -200 + v0*t + 0.5*a*t*t; let v = v0 + a*t;
        if(x > 250) time = 0;
        dB(x, 20, 50, 40, '#3498db'); dMath("m", x-8, 25, "white");
        if(animType !== "equation") dA(x, -10, x + v, -10, '#2980b9', 'v');
        if(a > 0) dA(x, -35, x + a*3, -35, '#27ae60', 'a');
        if(a > 0 || animType==="impulse" || animType==="power") dA(x-80, 20, x-25, 20, '#e74c3c', 'F');
        if(animType==="momentum" || animType==="impulse") dMath("p = mv", x-25, -35, '#8e44ad');
        
        // v-t / x-t グラフ表示
        drawAxis(-180, -100, 100, 80, "t", a>0?"v":"x");
        ctx.beginPath(); ctx.strokeStyle=a>0?'#2980b9':'#3498db'; ctx.lineWidth=2;
        for(let i=0; i<t; i+=0.1) ctx.lineTo(-180 + i*15, -100 - (a>0?(v0+a*i)*0.4 : v0*i*0.2));
        ctx.stroke();
    }
    else if (animType === "work_cos") { // W = Fx cosθ (徹底分解)
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
        let x = -100 + t*30; if(x > 150) time=0;
        dB(x, 20, 50, 40, '#3498db');
        let F = 100, ang = -Math.PI/6; let Fx = F*Math.cos(ang), Fy = F*Math.sin(ang);
        dA(x, 0, x+F*Math.cos(ang), Fy, '#7f8c8d', 'F');
        dAng(x, 0, 40, ang, 0, "θ", "#e67e22");
        dA(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ'); dA(x, 0, x, Fy, '#f1c40f', 'F sinθ', true);
        dLine(x, Fy, x+Fx, Fy, '#bdc3c7', 2, [5,5]); dLine(x+Fx, Fy, x+Fx, 0, '#bdc3c7', 2, [5,5]);
        dMath("x", x-15, 60, '#34495e'); dA(-100, 60, x, 60, '#34495e'); // 変位x
    }
    else if (["fall","fall_v0","throw"].includes(animType)) {
        let y = -100, v0 = 0, g = 50;
        if(animType==="fall_v0") v0 = 40; if(animType==="throw") { y = 100; v0 = -130; }
        let cy = y + v0*t + 0.5*g*t*t; let cv = v0 + g*t;
        if(cy > 150 && t>0.5) time=0;
        drawAxis(-50, 0, 30, 150, "", "y");
        dC(0, cy, 15, '#e74c3c'); dMath("m", -7, cy+5, "white");
        dA(25, cy, 25, cy+cv*0.5, '#2980b9', 'v'); dA(-25, cy, -25, cy+g*0.8, '#27ae60', 'g');
        ctx.fillStyle='rgba(231,76,60,0.3)'; for(let i=0; i<t; i+=0.1) dC(0, y+v0*i+0.5*g*i*i, 3); // 軌跡
    }
    else if (["force_g","spring","friction_s","friction_d","pressure"].includes(animType)) {
        ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
        dB(0, 10, 60, 60, '#9b59b6'); dMath("m", -8, 15, "white");
        dA(0, 10, 0, 80, '#e74c3c', 'mg'); dA(0, 10, 0, -60, '#2ecc71', 'N');
        if(animType.includes("friction")) {
            let p = animType==="friction_s" ? (t*20) : 80; if(p>80) time=0;
            dA(0, 10, p, 10, '#3498db', 'F'); dA(0, 40, -p, 40, '#e67e22', animType==="friction_s"?'f = μN':'f\' = μ\'N');
            if(animType==="friction_d") dA(0,-30,40,-30,'#2980b9','v');
        } else if(animType==="spring") {
            let sx = Math.sin(time*3)*60;
            ctx.fillRect(-120, -40, 10, 80);
            ctx.beginPath(); ctx.moveTo(-110,10); let c = 10; let dx=(sx-30+110)/c; for(let i=0;i<c;i++){ctx.lineTo(-110+dx*(i+0.5), 10+(i%2===0?-10:10));} ctx.lineTo(sx-30,10); ctx.strokeStyle='#7f8c8d'; ctx.stroke();
            dB(sx, 10, 60, 60, '#9b59b6'); dA(sx, 10, sx-sx, 10, '#e74c3c', 'F = -kx');
            drawAxis(0, 60, 100, 10, "x", ""); // 変位x軸
        } else if(animType==="pressure") {
            for(let i=-20; i<=20; i+=10) dA(i, -30, i, 10, '#e74c3c');
            dLine(-30,10,30,10,'#2ecc71',4); dMath("S", 35, 15, '#2ecc71'); dMath("P = F/S", 40, -20, '#e74c3c');
        }
    }
    else if (["moment","balance","center_mass"].includes(animType)) {
        let a = animType==="moment"? Math.sin(time)*0.2 : 0;
        ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(-20,80); ctx.lineTo(20,80); ctx.fillStyle='#7f8c8d'; ctx.fill();
        ctx.translate(0,30); ctx.rotate(a);
        ctx.fillStyle='#f39c12'; ctx.fillRect(-120,-5,240,10);
        dB(-80,-20,30,30,'#3498db'); dA(-80,-20,-80,50,'#e74c3c','F₁'); dMath("l₁", -40, 0, "black");
        if(animType!=="moment"){ dB(80,-25,40,40,'#e74c3c'); dA(80,-25,80,70,'#e74c3c','F₂'); dMath("l₂", 40, 0, "black"); }
    }
    else if (["k_energy","p_energy","s_energy","pendulum"].includes(animType)) {
        let a = Math.sin(time*2)*0.8;
        ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50,-100,100,10);
        let px = 150*Math.sin(a), py = -100+150*Math.cos(a);
        dLine(0,-100,px,py,'#333',2); dC(px, py, 20, '#9b59b6'); dMath("m", px-8, py+5, "white");
        dA(px, py, px+40*Math.cos(a)*Math.cos(time*2), py+40*Math.sin(a)*Math.cos(time*2), '#2980b9', 'v');
        // グラフ
        let K = (0.8 - Math.abs(a))*100, U = Math.abs(a)*100;
        ctx.fillStyle='#2ecc71'; ctx.fillRect(-150, 100-K, 20, K); dMath("K", -145, 120, '#2ecc71');
        ctx.fillStyle='#e67e22'; ctx.fillRect(-100, 100-U, 20, U); dMath("U", -95, 120, '#e67e22');
        ctx.fillStyle='#8e44ad'; ctx.fillRect(-50, 0, 20, 100); dMath("E", -45, 120, '#8e44ad'); // 総エネルギー
    }
    else if (["collision","bounce"].includes(animType)) {
        let t2 = time%3;
        if(animType==="collision") {
            let x1 = t2<1.5 ? -100+t2*60 : -10; let x2 = t2<1.5 ? -10 : -10+(t2-1.5)*60;
            dC(x1, 0, 20, '#3498db'); dMath("m₁", x1-10, 5, "white"); dA(x1, -30, x1+(t2<1.5?40:0), -30, '#2980b9', t2<1.5?'v₁':'v₁\'');
            dC(x2, 0, 20, '#e74c3c'); dMath("m₂", x2-10, 5, "white"); dA(x2, -30, x2+(t2>=1.5?40:0), -30, '#2980b9', t2<1.5?'v₂':'v₂\'');
        } else {
            let by = 80 - Math.abs(Math.cos(time*3)*80)*Math.exp(-time*0.2);
            dC(0, by, 15, '#1abc9c'); dA(20, by, 20, by+Math.sin(time*3)*40*Math.exp(-time*0.2), '#2980b9', 'v');
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, 95, 100, 5); dMath("e = |v'| / |v|", 60, 50);
        }
    }
    else if (animType.startsWith("circular") || animType==="centrifugal") {
        let r = 80; dC(0,0,r,'#bdc3c7',false); dC(0,0,5,'#f1c40f');
        let a = time*2; let bx = r*Math.cos(a), by = r*Math.sin(a);
        dC(bx, by, 15, '#3498db'); dMath("m", bx-8, by+5, "white");
        dLine(0,0,bx,by,'#7f8c8d'); dMath("r", bx/2, by/2-10); dAng(0,0,30,0,a,"θ=ωt","#e67e22");
        if(animType==="circular_v") dA(bx, by, bx-50*Math.sin(a), by+50*Math.cos(a), '#2980b9', 'v=rω');
        if(animType==="circular_a"||animType==="circular_f") dA(bx, by, bx*0.4, by*0.4, animType==="circular_a"?'#27ae60':'#e74c3c', animType==="circular_a"?'a=rω²':'F=mrω²');
        if(animType==="centrifugal") dA(bx, by, bx*1.6, by*1.6, '#e67e22', 'f=mrω² (遠心力)');
    }
    else if (animType.startsWith("harmonic") || animType==="pendulum_t") {
        let R = 80, o = 1.5, a = time*o; let px = R*Math.cos(a), py = R*Math.sin(a);
        if(animType==="harmonic_sin") { 
            dC(-150, 0, R, '#bdc3c7', false); dLine(-150,0,-150+px,py,'#7f8c8d'); dMath("A", -150+px/2, py/2-10);
            dAng(-150, 0, 30, 0, a, "ωt", "#2980b9");
            dA(-150+px, 0, -150+px, py, '#e74c3c', 'x = A sin(ωt)', true);
            dLine(-150+px, py, 50, py, '#e74c3c', 2, [5,5]);
        }
        drawAxis(50, 0, 150, 100, "t", "x");
        dC(50, py, 15, '#2ecc71');
        ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.6)'; ctx.lineWidth=2;
        for(let i=0; i<150; i++) ctx.lineTo(50+i, R*Math.sin(a - i*0.05)); ctx.stroke();
        if(animType==="harmonic_v") dA(70, py, 70, py+R*o*Math.cos(a)*0.5, '#2980b9', 'v');
        if(animType==="harmonic_a") dA(90, py, 90, py-R*o*o*Math.sin(a)*0.3, '#27ae60', 'a');
        if(animType==="harmonic_f") dA(90, py, 90, py-py*0.5, '#e74c3c', 'F=-kx');
    }
    else if (["kepler","gravity","orbit_u","escape"].includes(animType)) {
        let a = 120, b = 80; if(animType==="kepler") { a=150; b=90; }
        ctx.beginPath(); ctx.ellipse(0,0,a,b,0,0,Math.PI*2); ctx.strokeStyle='#bdc3c7'; ctx.stroke();
        let fx = animType==="kepler"? 50:0; dC(fx,0,25,'#e74c3c'); dMath("M", fx-10, 8, "white");
        let ang = animType==="kepler"? time*1.0+0.5*Math.sin(time*1.0) : time*1.5;
        let px = a*Math.cos(ang), py = b*Math.sin(ang);
        dC(px, py, 10, '#3498db'); dMath("m", px+15, py+10);
        dLine(fx,0,px,py,'#7f8c8d',1,[5,5]); dMath("r", (fx+px)/2, (0+py)/2-10);
        if(animType==="gravity") dA(px, py, px+(fx-px)*0.4, py+(0-py)*0.4, '#e74c3c', 'F = G(Mm/r²)');
        if(animType==="kepler") {
            ctx.beginPath(); ctx.moveTo(fx,0); ctx.lineTo(px,py); ctx.lineTo(a*Math.cos(ang-0.3), b*Math.sin(ang-0.3)); ctx.fillStyle='rgba(52, 152, 219, 0.4)'; ctx.fill();
            dTxt("面積速度 一定", -100, 100);
        }
    }
    
    // ----------------------------------------------------
    // 【熱力学】
    // ----------------------------------------------------
    else if (["temp","heat","heat_mix","latent"].includes(animType)) {
        ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100,-80,200,160);
        let spd = animType==="heat"||animType==="temp" ? 1+(time%4) : 2;
        let c = animType==="heat_mix" ? ((time%4)<2?'#e74c3c':'#8e44ad') : `rgb(${spd*50},50,200)`;
        for(let i=1; i<=40; i++) {
            let px = Math.sin(i*123 + time*spd)*80, py = Math.cos(i*321 + time*spd)*60;
            dC(px, py, 4, c);
        }
        ctx.fillStyle='white'; ctx.fillRect(-130,-50,10,100); ctx.strokeRect(-130,-50,10,100);
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-128,50-spd*15,6,spd*15); dC(-125,50,12,'#e74c3c');
        dMath("T", -140, 70, '#e74c3c'); if(animType==="heat") dA(0, 120, 0, 90, '#e74c3c', 'Q (熱)');
    }
    else if (["boyle","gas","kinetic","internal_u","piston","molar","engine"].includes(animType)) {
        let pw = (animType==="piston"||animType==="engine"||animType==="molar") ? 60+Math.sin(time*2)*40 : 100;
        ctx.strokeRect(-100,-60,pw+100,120); dMath("V", -80, -70);
        ctx.fillStyle='#e74c3c'; ctx.fillRect(pw,-60,15,120);
        if(animType==="piston" && Math.sin(time*2)>0) dA(pw+20,0,pw+60,0,'#e74c3c','W = PΔV');
        if(animType==="gas" || animType==="kinetic") dMath("P", pw-20, -70, '#e74c3c');
        for(let i=1; i<=40; i++) {
            let px = -100 + Math.abs(Math.sin(i*11+time*(3+i%3)))*(pw+100);
            let py = -60 + Math.abs(Math.cos(i*22+time*(2+i%2)))*120;
            dC(px, py, 4, '#e67e22');
        }
    }

    // ----------------------------------------------------
    // 【波動】
    // ----------------------------------------------------
    else if (["wave","wave_eq","sound"].includes(animType)) {
        drawAxis(0, 0, 250, 80, "x", "y");
        ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
        for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(x*0.04 - time*3)*60); ctx.stroke();
        dC(0, Math.sin(-time*3)*60, 10, '#e74c3c');
        dA(20, Math.sin(-time*3)*60, 20, Math.sin(-time*3)*60 + Math.cos(-time*3)*30, '#e74c3c', 'v');
        // 波長と振幅の明記
        let peak1 = (Math.PI/2 + time*3)/0.04; let peak2 = (5*Math.PI/2 + time*3)/0.04;
        dA(peak1, -70, peak2, -70, '#2980b9', 'λ (波長)'); dLine(peak1, -60, peak1, -80, '#2980b9'); dLine(peak2, -60, peak2, -80, '#2980b9');
        dA(-100, 0, -100, 60, '#27ae60', 'A (振幅)');
    }
    else if (["interfere","beat","standing"].includes(animType)) {
        if(animType==="standing") {
            drawAxis(0, 0, 250, 80, "x", "y");
            ctx.beginPath(); ctx.strokeStyle='#3498db'; ctx.lineWidth=2;
            for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(time*4)*Math.cos(x*0.05)*60); ctx.stroke();
            for(let x=-250; x<=250; x+=Math.PI/0.05) dC(x, 0, 5, '#e74c3c'); dTxt("赤点: 節 (常に振幅0)", -240, -80);
        } else if(animType==="beat") {
            drawAxis(0, 0, 250, 80, "t", "y");
            ctx.beginPath(); ctx.strokeStyle='rgba(52, 152, 219, 0.5)'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.1 - time*3)*30); ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='rgba(231, 76, 60, 0.5)'; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.11 - time*3.3)*30); ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3; for(let x=-250; x<=250; x+=2) ctx.lineTo(x, Math.sin(x*0.1 - time*3)*30 + Math.sin(x*0.11 - time*3.3)*30); ctx.stroke();
            dTxt("うなり (赤と青が重なり紫の合成波に)", -120, -80);
        } else {
            for(let r=10; r<100; r+=20) { dC(-40, 0, (r+time*15)%100, 'rgba(231,76,60,0.5)', false); dC(40, 0, (r+time*15)%100, 'rgba(52,152,219,0.5)', false); }
        }
    }
    else if (animType === "doppler") {
        let sx = -100 + t*30; dC(sx, 0, 8, '#e74c3c'); dA(sx, -20, sx+30, -20, '#e74c3c', 'v_s');
        for(let i=0; i<10; i++) { let eTime = t - i*0.5; if(eTime>0) dC(-100 + (t-eTime)*30, 0, eTime*40, 'rgba(52,152,219,0.5)', false); }
        dA(100, 0, 150, 0, '#2980b9', 'V (音速)'); dTxt("前方: 波長λ' が短くなる", -20, 100);
    }
    else if (animType==="refract_sin" || animType==="refract_n" || animType==="reflect_all") {
        ctx.fillStyle='rgba(52,152,219,0.2)'; ctx.fillRect(-250, 0, 500, 200);
        dLine(-250, 0, 250, 0, '#34495e', 3); dMath("n₁", -240, -20); dMath("n₂", -240, 30);
        dA(0, -150, 0, 150, '#bdc3c7', '', true); // 法線
        
        let aI = animType==="reflect_all"? Math.PI/2.5 : Math.PI/4; let aR = animType==="reflect_all"? Math.PI/1.5 : Math.PI/8;
        let ix = -120*Math.sin(aI), iy = -120*Math.cos(aI); let rx = 120*Math.sin(aR), ry = 120*Math.cos(aR);
        dA(ix, iy, 0, 0, '#f1c40f', '入射光');
        if(animType==="reflect_all") dA(0, 0, -ix, iy, '#f1c40f', '全反射'); else dA(0, 0, rx, ry, '#f1c40f', '屈折光');
        
        if(animType==="refract_sin") {
            dAng(0, 0, 40, -Math.PI/2, -Math.PI/2 + aI, "i", "#e74c3c"); dAng(0, 0, 60, Math.PI/2 - aR, Math.PI/2, "r", "#2980b9");
            dA(ix, iy, 0, iy, '#e74c3c', 'sin i', true); dA(rx, ry, 0, ry, '#2980b9', 'sin r', true);
            dLine(0, iy, ix, iy, '#bdc3c7', 1, [5,5]); dLine(ix, iy, ix, 0, '#bdc3c7', 1, [5,5]);
            dLine(0, ry, rx, ry, '#bdc3c7', 1, [5,5]); dLine(rx, ry, rx, 0, '#bdc3c7', 1, [5,5]);
        }
    }
    else if (animType === "lens") {
        drawAxis(0, 0, 250, 100, "", ""); // 光軸
        // レンズ描画
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 80, 0, 0, Math.PI*2); ctx.fillStyle='rgba(52, 152, 219, 0.3)'; ctx.fill(); ctx.strokeStyle='#3498db'; ctx.stroke();
        dC(60, 0, 3, '#e74c3c'); dC(-60, 0, 3, '#e74c3c'); dMath("F", 65, 15); dMath("F'", -70, 15);
        let a = 120, oH = 40; dA(-a, 0, -a, -oH, '#2ecc71', '物体'); dMath("a", -a/2, 20); dLine(-a, 0, -a, 10, '#333');
        let b = 1 / (1/60 - 1/a); let iH = oH * (b/a); dA(b, 0, b, iH, '#e74c3c', '実像'); dMath("b", b/2, -10); dLine(b, 0, b, -10, '#333');
        // 作図線
        ctx.beginPath(); ctx.moveTo(-a, -oH); ctx.lineTo(0, -oH); ctx.lineTo(b, iH); ctx.strokeStyle='rgba(241, 196, 15, 0.8)'; ctx.stroke(); // 光軸平行
        ctx.beginPath(); ctx.moveTo(-a, -oH); ctx.lineTo(0, 0); ctx.lineTo(b, iH); ctx.stroke(); // 中心
    }
    else if (["young","diffraction","film"].includes(animType)) {
        if(animType==="film") {
            ctx.fillStyle='rgba(52, 152, 219, 0.3)'; ctx.fillRect(-150, -40, 300, 80); dMath("d", -170, 0);
            ctx.beginPath(); ctx.moveTo(-100, -100); ctx.lineTo(-40, -40); ctx.lineTo(20, 100); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2; ctx.stroke(); 
            ctx.beginPath(); ctx.moveTo(-40, -40); ctx.lineTo(20, -100); ctx.stroke(); dTxt("表面反射 (位相πズレ)", 30, -100);
            ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(60, -20); ctx.stroke(); dTxt("裏面反射 (そのまま)", 70, -20);
        } else {
            ctx.fillStyle='#34495e'; ctx.fillRect(-100, -100, 5, 200); ctx.fillRect(100, -100, 5, 200); // スリットとスクリーン
            ctx.fillStyle='white'; ctx.fillRect(-105, -30, 15, 5); ctx.fillRect(-105, 30, 15, 5); dMath("S₁", -130, -25); dMath("S₂", -130, 35); dMath("d", -85, 5);
            if(animType==="diffraction") { ctx.fillRect(-105, 0, 15, 5); ctx.fillRect(-105, 60, 15, 5); ctx.fillRect(-105, -60, 15, 5); }
            let m = Math.floor(Math.sin(time)*3); let y = m * 30;
            dLine(-100, 0, 100, 0, '#bdc3c7', 1, [5,5]); dMath("L", 0, -10); dMath("x", 110, y/2);
            ctx.beginPath(); ctx.moveTo(-100, -30); ctx.lineTo(100, y); ctx.strokeStyle='rgba(241, 196, 15, 0.5)'; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-100, 30); ctx.lineTo(100, y); ctx.stroke();
            dC(100, y, 8, '#e74c3c'); dTxt("明線", 115, y+5);
        }
    }

    // ----------------------------------------------------
    // 【電磁気】
    // ----------------------------------------------------
    else if (["coulomb","efield","potential","efield_uniform"].includes(animType)) {
        if(animType==="efield_uniform") {
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-120, -80, 240, 15); dTxt("+ + + +", -20, -70, "white");
            ctx.fillStyle='#3498db'; ctx.fillRect(-120, 80, 240, 15); dTxt("- - - -", -15, 92, "white");
            dMath("d", -140, 0); dLine(-130,-80,-130,80,'#7f8c8d');
            for(let i=-90; i<=90; i+=30) dA(i, -60, i, 70, '#e74c3c', i===90?'E':"");
            let ey = -60 + (t*30)%120; dC(0, ey, 8, '#f1c40f'); dMath("q", 10, ey); dA(15, ey, 15, ey+20, '#e74c3c', 'F=qE');
        } else {
            dC(0, 0, 20, '#e74c3c'); dTxt("+", -5, 5, "white"); dMath("Q", -8, -25);
            if(animType==="coulomb") { dC(100, 0, 20, '#3498db'); dTxt("-", 95, 5, "white"); dMath("q", 92, -25); dA(20,0,60,0,'#e74c3c','F'); dA(80,0,40,0,'#3498db','F'); dLine(0,25,100,25,'#7f8c8d'); dMath("r", 45, 45); }
            else {
                for(let i=0; i<8; i++) { let a = (Math.PI/4)*i; dA(35*Math.cos(a), 35*Math.sin(a), 100*Math.cos(a), 100*Math.sin(a), '#e74c3c', i===0?"E":""); }
                if(animType==="potential") for(let r=40; r<=120; r+=40) { dC(0, 0, r, 'rgba(231,76,60,0.3)', false); dMath("V", r+5, 0, '#e74c3c'); }
            }
        }
    }
    else if (["capacitor","cap_energy","cap_circuit"].includes(animType)) {
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-80, -40, 160, 10); dMath("+Q", -110, -35, "#e74c3c");
        ctx.fillStyle='#3498db'; ctx.fillRect(-80, 40, 160, 10); dMath("-Q", -110, 50, "#3498db");
        dMath("d", 100, 0); dLine(90,-40,90,40,'#7f8c8d'); dMath("V = Ed", 110, 0);
        for(let i=0; i<5; i++) dA(-60+30*i, -30, -60+30*i, 40, 'rgba(231, 76, 60, 0.5)', i===4?"E":""); 
        if(animType==="cap_energy") {
            drawAxis(-200, 80, 100, 100, "V", "Q");
            ctx.beginPath(); ctx.moveTo(-200, 80); ctx.lineTo(-120, -20); ctx.lineTo(-120, 80); ctx.closePath();
            ctx.fillStyle='rgba(46, 204, 113, 0.5)'; ctx.fill(); ctx.stroke(); dMath("U = 1/2 QV", -190, 50);
        } else if(animType==="cap_circuit") {
            dLine(-150, 0, -80, 0, '#333'); dLine(80, 0, 150, 0, '#333'); dTxt("直列・並列の合成", -60, -60);
        }
    }
    else if (["current","resistance","joule","kirchhoff"].includes(animType)) {
        ctx.strokeStyle='#333'; ctx.lineWidth=2; ctx.strokeRect(-120, -60, 240, 120); 
        ctx.fillStyle='#e74c3c'; ctx.fillRect(-10, 50, 20, 20); dTxt("V", -5, 65, "white"); 
        ctx.fillStyle='#95a5a6'; ctx.fillRect(-30, -70, 60, 20); dMath("R", -5, -85); 
        dA(40, -80, 80, -80, '#2980b9', 'I');
        let ex = -120 + (time*60)%240; dC(ex, -60, 5, '#f1c40f'); dMath("-e", ex-5, -70);
        if(animType==="joule") { dC(0, -60, 30, 'rgba(231,76,60,0.5)'); dMath("Q = I²Rt", -30, -100, '#e74c3c'); }
        if(animType==="kirchhoff") { ctx.beginPath(); ctx.moveTo(0,-60); ctx.lineTo(0,60); ctx.stroke(); dMath("ΣI = 0", 10, 0); }
    }
    else if (["mag_field","mag_flux","ampere"].includes(animType)) {
        if(animType==="ampere") {
            ctx.fillStyle='#f39c12'; ctx.fillRect(-80, -5, 160, 10); dA(40, 0, 80, 0, '#2980b9', 'I');
            for(let i=-60; i<=60; i+=30) dA(i, -40, i, 40, '#2ecc71', i===60?'B':""); 
            dA(0, 0, 0, -40, '#e74c3c', 'F = IBl');
        } else {
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-5, -120, 10, 240); 
            dA(0, 100, 0, -100, '#3498db', 'I');
            for(let r=30; r<=90; r+=30) dC(0, 0, r, '#2ecc71', false); dMath("H", 95, 0, "#2ecc71");
            dTxt("磁力線 (右ねじ)", 40, -40);
        }
    }
    else if (animType.startsWith("lorentz")) {
        for(let y=-80; y<=80; y+=40) { for(let x=-100; x<=100; x+=40) { dMath("×", x, y, "#2ecc71"); } } dMath("B(奥へ)", 120, -90, "#2ecc71");
        
        let v = 80, a = -Math.PI/6; let vx = v*Math.cos(a), vy = v*Math.sin(a);
        if(animType==="lorentz_sin") {
            dC(0, 0, 10, '#f1c40f'); dMath("-e", -8, 25);
            dA(0, 0, vx, vy, '#3498db', 'v'); dAng(0, 0, 40, a, 0, "θ");
            dA(0, 0, 0, vy, '#e74c3c', 'v sinθ (力)', true); dA(0, 0, vx, 0, '#95a5a6', 'v cosθ (無)', true);
            dLine(0,vy,vx,vy,'#bdc3c7',1,[5,5]); dLine(vx,vy,vx,0,'#bdc3c7',1,[5,5]);
            dA(0, 0, -vy, 0, '#e67e22', 'F = evB sinθ'); // フレミング左手
        } else {
            let lx = 50*Math.cos(time*3), ly = 50*Math.sin(time*3);
            dC(lx, ly, 8, '#f1c40f'); dMath("-e", lx+10, ly);
            dA(lx, ly, lx-20*Math.sin(time*3), ly+20*Math.cos(time*3), '#2980b9', 'v');
            dA(lx, ly, lx*0.5, ly*0.5, '#e74c3c', 'F');
        }
    }
    else if (["flux_cos","induction","rod","self_ind"].includes(animType)) {
        if(animType==="flux_cos") {
            ctx.beginPath(); ctx.ellipse(0, 0, 100, 30, 0, 0, Math.PI*2); ctx.strokeStyle='#34495e'; ctx.lineWidth=3; ctx.stroke(); 
            ctx.fillStyle='rgba(52, 73, 94, 0.1)'; ctx.fill(); dMath("S", -80, 0);
            dA(0, 0, 0, -120, '#7f8c8d', '法線', true);
            let B = 140, a = -Math.PI/4; let Bx = B*Math.sin(a), By = -B*Math.cos(a);
            dA(0, 0, Bx, By, '#2ecc71', 'B'); dAng(0, 0, 40, -Math.PI/2, a - Math.PI/2, "θ");
            dA(0, 0, 0, By, '#e74c3c', 'B cosθ', true); dA(0, By, Bx, By, '#95a5a6', 'B sinθ', true);
            dMath("Φ = BS cosθ", 50, -100, '#e74c3c');
        } else if(animType==="rod") {
            ctx.fillStyle='#f39c12'; ctx.fillRect(-80, -5, 160, 10); dMath("l", 90, 0);
            for(let i=-60; i<=60; i+=30) { dC(i,0,5,'#2ecc71'); dMath("B(手前)", i+8, 5, "#2ecc71"); } 
            dA(0, 0, 50, 0, '#3498db', 'v'); dA(0, 0, 0, -40, '#e74c3c', 'F'); dC(0,-10,5,'#f1c40f'); dMath("-e", 10,-10);
            dMath("V = vBl", -50, -60, '#e74c3c');
        } else {
            ctx.strokeStyle='#8e44ad'; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(0,0, 40, 0, Math.PI, true); ctx.stroke(); 
            let my = -80 + Math.abs(Math.sin(time*2))*60;
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-15, my, 30, 40); dTxt("N", -5, my+25, "white"); dA(0, my+40, 0, my+80, '#2ecc71', 'B'); 
            dMath("V = -N(ΔΦ/Δt)", 60, 0, '#e74c3c');
        }
    }
    else if (["ac_gen","reactance","impedance","resonance"].includes(animType)) {
        if(animType==="ac_gen") {
            let R = 60, o = 2, a = time * o;
            drawAxis(-150, 0, 80, 80, "x", "y"); dC(-150, 0, R, '#bdc3c7', false);
            dA(-150, 0, -150+R*Math.cos(a), R*Math.sin(a), '#3498db', 'コイル'); dAng(-150, 0, 25, 0, a, "ωt");
            dA(-150+R*Math.cos(a), 0, -150+R*Math.cos(a), R*Math.sin(a), '#e74c3c', 'V₀sinωt', true);
            drawAxis(50, 0, 150, 80, "t", "V");
            dC(0, R*Math.sin(a), 8, '#e74c3c');
            ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=3;
            for(let i=0; i<150; i++) ctx.lineTo(0+i, R*Math.sin(a - i*0.05)); ctx.stroke();
            dLine(-150+R*Math.cos(a), R*Math.sin(a), 0, R*Math.sin(a), '#e74c3c', 1, [5,5]);
        } else {
            drawAxis(0, 0, 100, 100, "Re", "Im");
            let w = time*2;
            dA(0, 0, 80*Math.cos(w), 80*Math.sin(w), '#e74c3c', 'V');
            let phase = animType==="reactance" ? Math.PI/2 : (animType==="resonance"? 0 : Math.PI/4);
            dA(0, 0, 60*Math.cos(w - phase), 60*Math.sin(w - phase), '#3498db', 'I');
            dTxt("フェーザ図 (位相のズレ)", -80, -120);
        }
    }
    
    // ----------------------------------------------------
    // 【原子】
    // ----------------------------------------------------
    else if (["photon","photoelectric","stop_v","matter_wave","xray"].includes(animType)) {
        if(animType==="matter_wave") {
            drawAxis(0, 0, 200, 50, "x", "");
            let x = -150 + t_short*100; dC(x, 0, 8, '#3498db'); dMath("m, v", x-10, 25);
            ctx.beginPath(); ctx.strokeStyle='rgba(52, 152, 219, 0.5)'; ctx.lineWidth=2;
            for(let i=0; i<100; i++) ctx.lineTo(x - i*2, Math.sin(i*0.2 - time*5)*20); ctx.stroke();
            dMath("λ = h / mv", -50, -50, '#3498db');
        } else {
            ctx.fillStyle='#95a5a6'; ctx.fillRect(-100, -50, 20, 100); ctx.fillRect(80, -50, 20, 100); dMath("W", -120, 0);
            let pt = time%2;
            if(animType==="xray") {
                dC(-80+pt*160, 0, 5, '#3498db'); dMath("-e", -80+pt*160, -15);
                if(pt>0.9) { dC(80, 0, 20, 'rgba(241, 196, 15, 0.5)', false); dMath("hν = eV", 100, -20); }
            } else {
                if(pt<0.5) { dC(-150+pt*100, 0, 5, '#f1c40f'); dMath("hν", -150+pt*100, -15); } 
                else {
                    let ex = -80 + (pt-0.5)*200;
                    if(animType==="stop_v") { ex = -80 + Math.sin((pt-0.5)*Math.PI)*150; for(let y=-40; y<=40; y+=20) dA(80, y, -80, y, 'rgba(231,76,60,0.3)'); dMath("V₀", 0, -60, '#e74c3c'); }
                    dC(ex, 0, 5, '#3498db'); dMath("K", ex, -15);
                }
            }
        }
    }
    else if (animType.includes("bohr") || animType==="energy_level") {
        dC(0, 0, 20, '#e74c3c'); dTxt("+", -5, 5, "white"); 
        dC(0, 0, 60, '#bdc3c7', false); dMath("n=1 (E₁)", 65, 0, "#bdc3c7");
        dC(0, 0, 120, '#bdc3c7', false); dMath("n=2 (E₂)", 125, 0, "#bdc3c7");
        let orbit = (Math.floor(time) % 2 === 0) ? 120 : 60; 
        let ex = orbit*Math.cos(time*3), ey = orbit*Math.sin(time*3);
        dC(ex, ey, 10, '#3498db'); dTxt("-", ex-3, ey+3, "white");
        if(orbit === 60 && (time%1)<0.3) {
            ctx.beginPath(); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2;
            for(let i=0; i<50; i++) ctx.lineTo(ex + i*3, ey + Math.sin(i*0.5)*10); ctx.stroke();
            dMath("hν = E₂ - E₁", ex+150, ey, '#f1c40f');
        }
    }
    else if (["mass_defect","mc2","half_life","decay"].includes(animType)) {
        if(animType==="half_life") {
            let hl = Math.floor(time); let count = 64 / Math.pow(2, hl);
            for(let i=0; i<64; i++) { let cx = -100 + (i%8)*20, cy = -80 + Math.floor(i/8)*20; dC(cx, cy, 8, i<count ? '#e74c3c' : '#bdc3c7'); }
            drawAxis(100, 0, 100, 80, "t", "N"); ctx.beginPath(); ctx.strokeStyle='#e74c3c';
            for(let x=0; x<100; x++) ctx.lineTo(100+x, -80 * Math.pow(0.5, x/25)); ctx.stroke();
            dMath("T", 125, 20); dLine(125, 0, 125, -40, '#7f8c8d', 1, [5,5]);
        } else {
            let t2 = time%4;
            if(t2<2) { 
                dC(-60, -20, 15, '#e74c3c'); dC(-40, 10, 15, '#e74c3c'); dC(-20, -10, 15, '#3498db'); dC(-80, 0, 15, '#3498db');
                dMath("質量: Zmₚ + (A-Z)mₙ", -100, 50);
            } else { 
                dC(60, -10, 15, '#e74c3c'); dC(45, 5, 15, '#e74c3c'); dC(55, 15, 15, '#3498db'); dC(75, 0, 15, '#3498db');
                if(animType==="decay") { dA(90, 0, 150, 0, '#f1c40f', 'α線'); }
                else { dMath("質量: M (少し軽い)", 20, 50); dMath("E = Δmc²", 20, 80, '#e74c3c'); }
            }
        }
    }
    
    ctx.restore();
}

render();
