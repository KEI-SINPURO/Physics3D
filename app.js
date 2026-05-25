// ==========================================
// 高校物理 2Dシミュレーションエンジン (完全網羅・公式表示・美文字対応版)
// ==========================================

// ----------------------------------------------------
// 【補完】高校物理 全分野網羅 公式データベース (physicsData)
// ----------------------------------------------------
const physicsData = {
    // === 1. 力学 ===
    "work_cos": {
        chap: "1. 力学",
        title: "仕事の定義と公式",
        formulas: [
            { name: "仕事の定義 (斜め方向の力)", math: "W = F x \\cos\\theta", usage: "力が物体の移動方向に対して傾いているとき", reason: "移動方向の力成分 F \\cos\\theta と移動距離 x の積になります。", simText: "物体を斜め上方に引きながら水平に移動させる時の仕事を表示します。", animType: "work_cos" }
        ]
    },
    "linear_motion": {
        chap: "1. 力学",
        title: "等速直線運動・相対速度",
        formulas: [
            { name: "等速直線運動の変位", math: "x = vt", usage: "速度が一定の物体の移動距離を求めるとき", reason: "単位時間あたりの移動量（速度）に時間を掛けたものです。", simText: "速度が変化しない物体の直線運動です。", animType: "linear" },
            { name: "相対速度", math: "v_{AB} = v_B - v_A", usage: "動く観測者(A)から見た別の物体(B)の速度を求めるとき", reason: "相手の速度から自分の速度を引くことで、自分を基準とした動きになります。", simText: "赤い物体Aから見た青い物体Bの運動ベクトルを表示します。", animType: "relative" }
        ]
    },
    "accel_motion": {
        chap: "1. 力学",
        title: "等加速度直線運動",
        formulas: [
            { name: "速度の公式", math: "v = v_0 + at", usage: "一定の加速度で加速または減速する物体の速度を求めるとき", reason: "初速度に、加速した分の速度（加速度×時間）を加算します。", simText: "一定の加速度で加速する運動と、速度・時間の関係を示します。", animType: "accel" },
            { name: "変位の公式", math: "x = v_0t + \\frac{1}{2}at^2", usage: "等加速度運動を行う物体の位置（移動距離）を求めるとき", reason: "初速度による進みと、加速による進みの合計です（v-tグラフの面積）。", simText: "加速する物体の位置変化と、v-tグラフの面積の連動です。", animType: "v_t" }
        ]
    },
    "fall_motion": {
        chap: "1. 力学",
        title: "落体の運動",
        formulas: [
            { name: "自由落下・鉛直投げ下ろし", math: "y = v_0t + \\frac{1}{2}gt^2", usage: "重力によって下向きに落ちる物体の位置を求めるとき", reason: "重力加速度 g を加速度とした等加速度直線運動です。", simText: "初速度を持って下向きに落下する物体の運動です。", animType: "fall_v0" },
            { name: "鉛直投げ上げ", math: "v = v_0 - gt", usage: "真上に投げ上げた物体の速度を求めるとき", reason: "上向きを正とすると、重力加速度は下向き（マイナス）に作用します。", simText: "最高点で速度が0になり、その後落下に転じる運動です。", animType: "throw" },
            { name: "斜方投射 (放物運動)", math: "y = v_{0y}t - \\frac{1}{2}gt^2", usage: "斜めに投げ上げた物体の軌道や高さを求めるとき", reason: "水平方向は等速、鉛直方向は投げ上げ運動に分解して考えます。", simText: "放物線を描いて飛ぶ物体の速度成分の分解を表示します。", animType: "throw_angle" }
        ]
    },
    "force_and_spring": {
        chap: "1. 力学",
        title: "力・摩擦・ばねの弾性力",
        formulas: [
            { name: "フックの法則 (ばねの力)", math: "F = -kx", usage: "ばねが物体を引っ張る、または押し返す力を求めるとき", reason: "変位 x に比例し、常に自然長に戻ろうとする逆向き（マイナス）の力です。", simText: "ばねに繋がれた物体の往復運動と、復元力の関係です。", animType: "spring" },
            { name: "最大静止摩擦力", math: "f = \\mu N", usage: "静止している物体が動き出す瞬間の限界の力を求めるとき", reason: "面を押し付ける力（垂直抗力 N）に比例する最大の摩擦力です。", simText: "外力を大きくしていき、動き出す臨界点（最大静止摩擦）を表現します。", animType: "friction_s" },
            { name: "動摩擦力", math: "f' = \\mu' N", usage: "滑っている物体に働く進行方向と逆向きの力を求めるとき", reason: "運動中、面から受ける抵抗力は速度によらず一定になります。", simText: "滑っている物体に働く一定の動摩擦力を表示します。", animType: "friction_d" }
        ]
    },
    "pressure_buoyancy": {
        chap: "1. 力学",
        title: "圧力と浮力",
        formulas: [
            { name: "圧力の定義", math: "p = \\frac{F}{S}", usage: "面が受ける単位面積あたりの力を求めるとき", reason: "全受力を面積で割ることで、力の集中度合いを表します。", simText: "面に加わる力と面積による圧力の集中度を可視化します。", animType: "pressure" },
            { name: "浮力 (アルキメデスの原理)", math: "F = \\rho V g", usage: "水などの流体中にある物体が受ける上向きの力を求めるとき", reason: "物体が押ししのけた流体の質量が受ける重力と同じ大きさの浮力を得ます。", simText: "水中の物体に働く重力と浮力の釣り合いです。", animType: "buoyancy" }
        ]
    },
    "moment_rigid": {
        chap: "1. 力学",
        title: "モーメントと重心",
        formulas: [
            { name: "力のモーメント", math: "M = F l", usage: "剛体を回転させる効果の大きさを求めるとき", reason: "力の大きさと、回転中心から力の作用線までの距離の積です。", simText: "てこの原理と、左右のモーメントの釣り合いをシミュレートします。", animType: "moment" },
            { name: "物体系の重心", math: "x_G = \\frac{m_1x_1 + m_2x_2}{m_1 + m_2}", usage: "質量の異なる複数の物体全体のバランスの取れる点を求めるとき", reason: "各物体の位置を質量で加重平均した位置が重心になります。", simText: "質量の異なる２つの球体の重心位置（G）をリアルタイムに計算します。", animType: "center" }
        ]
    },
    "momentum_collision": {
        chap: "1. 力学",
        title: "運動量・衝突・力積",
        formulas: [
            { name: "運動量保存の法則", math: "m_1v_1 + m_2v_2 = m_1v_1' + m_2v_2'", usage: "２物体の衝突や分裂の前後の速度を求めるとき", reason: "内力（衝突の衝撃など）のみが働く場合、全体の運動量の総和は不変です。", simText: "２つの球が衝突し、速度が変化する前後の運動量保存を示します。", animType: "collision" },
            { name: "力積と運動量変化", math: "I = F\\Delta t = m\\Delta v", usage: "物体に力を加えたときの速度変化を追うとき", reason: "加えた力と時間の積（力積）の分だけ、物体の運動量が変化します。", simText: "球体に強い力積が加わり、急加速する様子をシミュレートします。", animType: "impulse" },
            { name: "反発係数 (はねかえり係数)", math: "e = \\frac{|v_1' - v_2'|}{|v_1 - v_2|}", usage: "衝突後の跳ね返りの強さを計算するとき", reason: "衝突前の相対速度に対する、衝突後の相対速度の比率（0〜1）です。", simText: "床に衝突して、反発係数に応じて徐々に跳ね返り高さを減じる球体です。", animType: "restitution" }
        ]
    },
    "energy_conserv": {
        chap: "1. 力学",
        title: "機械的エネルギー保存則",
        formulas: [
            { name: "力学的エネルギー保存則", math: "E = K + U = \\text{一定}", usage: "摩擦のない斜面や振り子の運動を解析するとき", reason: "運動エネルギーKと位置エネルギーUの合計は常に一定に保たれます。", simText: "振り子の往復運動における、運動エネルギーと位置エネルギーのトレードオフです。", animType: "energy" }
        ]
    },
    "circular_motion": {
        chap: "1. 力学",
        title: "円運動と万有引力",
        formulas: [
            { name: "等速円運動の向心力", math: "F = mr\\omega^2", usage: "物体を円軌道に留めるために必要な中心向きの力を求めるとき", reason: "円の中心向きに常に速度を曲げ続けるための加速度が生じています。", simText: "円運動する物体の速度ベクトルと向心力ベクトルを表示します。", animType: "circular" },
            { name: "万有引力の法則", math: "F = G\\frac{m_1m_2}{r^2}", usage: "天体同士や質量を持つ物体の間に働く引力を求めるとき", reason: "互いの質量の積に比例し、中心間距離の２乗に反比例します。", simText: "太陽の周りを公転する惑星に働く引力をシミュレートします。", animType: "gravity" }
        ]
    },
    "shm_oscillation": {
        chap: "1. 力学",
        title: "単振動",
        formulas: [
            { name: "単振動の変位", math: "x = A \\sin(\\omega t)", usage: "単振動を行う物体の任意の時間での位置を求めるとき", reason: "等速円運動を真横からスクリーンに投影した運動と同じ軌跡を描きます。", simText: "等速円運動の投影としての単振動と、時間経過の正弦波グラフの連動です。", animType: "shm" }
        ]
    },

    // === 2. 熱力学 ===
    "thermo_heat": {
        chap: "2. 熱力学",
        title: "熱量と比熱・状態変化",
        formulas: [
            { name: "熱量の公式", math: "Q = mc\\Delta T", usage: "物質の温度を変化させるのに必要な熱量を求めるとき", reason: "物質の質量、比熱（1gを1K上げる熱量）、温度変化に比例します。", simText: "熱を加えられることで分子運動（熱運動）が激しくなる気体容器です。", animType: "heat" }
        ]
    },
    "thermo_gas": {
        chap: "2. 熱力学",
        title: "気体の法則と第一法則",
        formulas: [
            { name: "理想気体の状態方程式", math: "pV = nRT", usage: "気体の圧力、体積、温度、モル数の関係性を解くとき", reason: "ボイルの法則とシャルルの法則を分子運動論に基づいて一般化した式です。", simText: "ピストン内の気体分子の衝突によって生じる圧力と体積の関係です。", animType: "gas" },
            { name: "熱力学第一法則", math: "\\Delta U = Q + W", usage: "気体の状態変化にともなうエネルギー変化を追うとき", reason: "内部エネルギーの増加は、吸収した熱量と外部からされた仕事の総和です。", simText: "加熱によって外部に膨張仕事（W）を行うピストンの動作です。", animType: "thermo" }
        ]
    },

    // === 3. 波動 ===
    "wave_basic": {
        chap: "3. 波動",
        title: "波の基本式と音波",
        formulas: [
            { name: "波の基本式", math: "v = f\\lambda", usage: "波の伝わる速さ、振動数、波長の関係を求めるとき", reason: "波１周期分（波長λ）の長さが１秒間に振動数fの回数だけ進みます。", simText: "正弦波が右向きに伝播していく横波の基本モデルです。", animType: "wave" },
            { name: "縦波 (疎密波)", math: "v = f\\lambda", usage: "音波など、媒質の振動方向と進む向きが並行な波を解析するとき", reason: "媒質の密度の濃い部分（密）と薄い部分（疎）が交互に伝わります。", simText: "媒質粒子の水平振動によって発生する疎密波（縦波）の様子です。", animType: "longitudinal" }
        ]
    },
    "wave_doppler": {
        chap: "3. 波動",
        title: "ドップラー効果",
        formulas: [
            { name: "ドップラー効果の公式", math: "f' = f \\frac{V - v_o}{V - v_s}", usage: "救急車が近づく・遠ざかる時の音の高さの変化を計算するとき", reason: "音源の運動で波長が縮み、観測者の運動で１秒間に受ける波の数が変わります。", simText: "前方に波面が詰まり、後方が広がる動く音源の波の伝播です。", animType: "doppler" }
        ]
    },
    "wave_optics": {
        chap: "3. 波動",
        title: "光の屈折・反射とレンズ",
        formulas: [
            { name: "屈折の法則 (スネルの法則)", math: "\\frac{\\sin i}{\\sin r} = \\frac{n_2}{n_1}", usage: "光が空気から水などへ進むときの屈折角を求めるとき", reason: "異なる媒質間での光の進む速度の違いが、境界での折れ曲がりを生みます。", simText: "入射角と屈折角の関係、および臨界角を超えた際の全反射を表示します。", animType: "refract" },
            { name: "レンズの公式", math: "\\frac{1}{a} + \\frac{1}{b} = \\frac{1}{f}", usage: "凸レンズや凹レンズによって像ができる位置を求めるとき", reason: "レンズの中心を通る光線と焦点をとおる光線の幾何学的な相似関係から導かれます。", simText: "光源から出た光線がレンズで屈折し、焦点の先に実像を結ぶ様子です。", animType: "lens" }
        ]
    },

    // === 4. 電磁気 ===
    "elec_field": {
        chap: "4. 電磁気",
        title: "電荷・電場・コンデンサー",
        formulas: [
            { name: "クーロンの法則", math: "F = k\\frac{q_1q_2}{r^2}", usage: "帯電した２つの粒子の間に働く電気力を求めるとき", reason: "それぞれの電荷量の積に比例し、粒子間の距離の２乗に反比例します。", simText: "正電性と負電性の粒子間に発生する引力とベクトルの関係です。", animType: "coulomb" },
            { name: "平行板コンデンサーの電気容量", math: "C = \\varepsilon \\frac{S}{d}", usage: "コンデンサーに蓄えられる電荷量を設計・計算するとき", reason: "極板の面積 S が大きいほど、また極板間隔 d が狭いほど多く電荷を蓄えられます。", simText: "極板に電荷が溜まり、内部に一様な電場が形成される様子です。", animType: "capacitor" }
        ]
    },
    "elec_circuit": {
        chap: "4. 電磁気",
        title: "電流と直流回路",
        formulas: [
            { name: "オームの法則", math: "V = RI", usage: "回路中の抵抗に加わる電圧、または流れる電流を求めるとき", reason: "電流の流れにくさ（抵抗 R）に比例して、電位の降下（電圧 V）が生まれます。", simText: "電源と抵抗からなる直流閉回路を電子（電流）が流れるシミュレーションです。", animType: "circuit" }
        ]
    },
    "elec_mag": {
        chap: "4. 電磁気",
        title: "磁場・電磁誘導・交流回路",
        formulas: [
            { name: "ローレンツ力", math: "F = qvB \\sin\\theta", usage: "磁場の中を運動する電子やイオンが受ける磁気的な力を求めるとき", reason: "動く電荷が作る磁界と外部磁界が干渉し、速度と磁場に垂直な力を受けます。", simText: "一様な磁場空間に飛び込んだ荷電粒子が、直交する力を受けて円軌道を描く様子です。", animType: "lorentz" },
            { name: "ファラデーの電磁誘導の法則", math: "V = -N \\frac{\\Delta \\Phi}{\\Delta t}", usage: "コイルに磁石を近づけたときに生じる誘導起電力を求めるとき", reason: "コイル内部を貫く磁束の変化を妨げようとする向き（レンツの法則）に電圧が発生します。", simText: "磁石が接近・遠ざかることで、コイルを貫く磁力線と誘起される電流を表示します。", animType: "faraday" },
            { name: "交流電圧の発生", math: "V = V_0 \\sin(\\omega t)", usage: "発電機など、磁場中でコイルを等速回転させて交流を得るとき", reason: "回転角にともない、コイルを貫く有効磁束が正弦波（サイン）状に変化するためです。", simText: "磁場内でのコイルの回転運動と、発生する正弦波交流電圧のグラフです。", animType: "ac_gen" }
        ]
    },

    // === 5. 原子 ===
    "atom_quantum": {
        chap: "5. 原子",
        title: "光電効果・ボーアモデル・原子核",
        formulas: [
            { name: "光電効果の式", math: "K_{\\max} = h\\nu - W", usage: "金属表面に光を照射して飛び出す電子の最大運動エネルギーを求めるとき", reason: "光を粒子（光子）と考え、１個のエネルギー h\\nu から脱出に必要な仕事関数 W を消費します。", simText: "限界以上の振動数の光子（波束）が衝突し、金属から光電子が飛び出す現象です。", animType: "photo" },
            { name: "ボーアの量子条件", math: "mvr = n\\frac{h}{2\\pi}", usage: "水素原子内の電子が、エネルギーを放射せずに安定して回れる軌道を解くとき", reason: "電子を波（物質波）と考えたとき、円軌道の長さが波長の整数倍になる定常波条件です。", simText: "原子核の周囲に不連続な定常波軌道をとって周回する電子のモデルです。", animType: "bohr" },
            { name: "アインシュタインの等価性 (質量欠損)", math: "E = \\Delta m c^2", usage: "核反応などで、反応前後の質量の減少から解放されるエネルギーを求めるとき", reason: "質量とエネルギーは本質的に等価であり、質量 Δm はエネルギーへと変換可能です。", simText: "原子核が融合・分裂した際の質量欠損から、莫大なエネルギーが放射されるイメージです。", animType: "mass" }
        ]
    }
};

// ----------------------------------------------------
// メニューの構築・イベント設定
// ----------------------------------------------------
const menuList = document.getElementById('menu-list');
let currentChap = "";
let chapGroup = null;
let chapUl = null;

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

// ----------------------------------------------------
// Canvas 設定・基本コントロール
// ----------------------------------------------------
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let scale = 1.0, panX = 0, panY = 0;
let isDragging = false, lastX = 0, lastY = 0;

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
    const zoomSlider = document.getElementById('zoomSlider');
    const zoomVal = document.getElementById('zoomVal');
    if(zoomSlider && zoomVal) { zoomSlider.value = 1.0; zoomVal.innerText = "1.0x"; }
}

// コントロールUIイベント
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const zoomSlider = document.getElementById('zoomSlider');
if(zoomSlider) zoomSlider.addEventListener('input', e => { scale = parseFloat(e.target.value); document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; });
const playBtn = document.getElementById('playBtn');
if(playBtn) playBtn.onclick = () => { isPlaying = !isPlaying; playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
const resetBtn = document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick = () => setAnimation(animType);

// マウスによるパン(画面移動)・ズーム操作
canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', e => { if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('wheel', e => { 
    e.preventDefault(); 
    scale = Math.max(0.5, Math.min(3.0, scale + (e.deltaY > 0 ? -0.1 : 0.1))); 
    if(zoomSlider) zoomSlider.value = scale; 
    if(document.getElementById('zoomVal')) document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; 
}, { passive: false });

// ----------------------------------------------------
// 描画ユーティリティ (太文字を解消し、シャドウで視認性を確保)
// ----------------------------------------------------
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

function dTxt(t, x, y, c="#2c3e50", f="16px 'Hiragino Sans', Arial, sans-serif") {
    ctx.font = f;
    ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 5;
    ctx.fillText(t, x, y);
    ctx.shadowBlur = 0; // リセット
}

function dMath(t, x, y, c="#2c3e50", size=20) {
    ctx.font = `italic ${size}px 'Times New Roman', serif`;
    ctx.fillStyle = c;
    ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
    ctx.shadowBlur = 5;
    ctx.fillText(t, x, y);
    ctx.shadowBlur = 0;
}

function dFormula(t, x, y) {
    ctx.font = "italic 18px 'Times New Roman', serif";
    const w = ctx.measureText(t).width + 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 6;
    ctx.fillRect(x, y - 22, w, 32);
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#bdc3c7";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 22, w, 32);
    ctx.fillStyle = "#c0392b";
    ctx.fillText(t, x + 15, y);
}

function drawAxis(ox, oy, w, h, xL, yL) {
    dA(ox, oy+h, ox, oy-h, '#7f8c8d', yL); dA(ox-w, oy, ox+w, oy, '#7f8c8d', xL);
    dMath("O", ox-15, oy+15, '#7f8c8d');
}

// ----------------------------------------------------
// メインループ (全分野をグラフィカルに描画)
// ----------------------------------------------------
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

        // 背景グリッド
        ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
        for(let i=-1000; i<=1000; i+=20) { 
            if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5'; 
            dLine(i,-1000,i,1000,ctx.strokeStyle); dLine(-1000,i,1000,i,ctx.strokeStyle); 
        }
        dLine(-1000, 0, 1000, 0, '#b2bec3', 2); dLine(0, -1000, 0, 1000, '#b2bec3', 2); 

        let t = time % 6; 
        if(!animType) { dTxt("シミュレーションを選択してください。", -120, 0, "#7f8c8d"); ctx.restore(); return; }

        // 1. 力学: 直線運動・加速度・仕事
        if (animType === "work_cos") {
            dFormula("W = F x cosθ", -60, -120);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200, 40, 400, 5);
            let x = -100 + t*30; if(x > 150) time=0;
            dB(x, 20, 50, 40, '#3498db'); dMath("m", x-10, 25, "white");
            let F = 100, ang = -Math.PI/6; let Fx = F*Math.cos(ang), Fy = F*Math.sin(ang);
            dA(x, 0, x+Fx, Fy, '#7f8c8d', 'F'); dAng(x, 0, 40, ang, 0, "θ", "#e67e22");
            dA(x, 0, x+Fx, 0, '#e74c3c', 'F cosθ'); dLine(x+Fx, 0, x+Fx, Fy, '#bdc3c7', 2, [5,5]); 
            dA(-100, 60, x, 60, '#2ecc71', 'x');
        }
        else if (animType.includes("linear") || animType.includes("accel") || animType.includes("equation") || animType.includes("relative") || animType.includes("v_t")) {
            dFormula("v = v₀ + at,  x = v₀t + 1/2 at²", -120, -150);
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-300, 40, 600, 5); 
            let a = animType.includes("linear") || animType.includes("relative") ? 0 : 20;
            let v0 = 40; let x = -200 + v0*t + 0.5*a*t*t; let v = v0 + a*t;
            if(x > 250) time = 0;
            
            dB(x, 20, 50, 40, '#3498db'); dMath("m", x-8, 25, "white");
            if(!animType.includes("equation")) dA(x, -10, x + v, -10, '#2980b9', 'v');
            if(a > 0) dA(x, -35, x + a*3, -35, '#27ae60', 'a');
            
            if(animType.includes("relative")) {
                let x2 = -200 + 80*t; 
                dB(x2, -40, 50, 40, '#e74c3c'); dA(x2, -70, x2+80, -70, '#c0392b', 'v_A'); dMath("A", x2-10, -35, "white");
                dMath("B", x-10, 25, "white"); dTxt("v_AB = v_B - v_A", -60, -100);
            } else {
                drawAxis(-180, -100, 100, 80, "t", a>0?"v":"x");
                ctx.beginPath(); ctx.strokeStyle=a>0?'#2980b9':'#3498db'; ctx.lineWidth=2;
                for(let i=0; i<t; i+=0.1) ctx.lineTo(-180 + i*15, -100 - (a>0?(v0+a*i)*0.4 : v0*i*0.2));
                ctx.stroke();
            }
        }
        // 2. 力学: 落体の運動 (投げ下ろし・投げ上げ)
        else if (animType.includes("fall") || animType.includes("throw")) {
            dFormula("y = v₀t + 1/2 gt²,  v = v₀ + gt", -120, -160);
            let startY = animType.includes("throw") && !animType.includes("down") ? 100 : -100;
            let startX = animType.includes("angle") ? -150 : 0;
            let v0y = 0, v0x = 0, g = 50;
            if(animType.includes("fall_v0")) v0y = 50; 
            if(animType.includes("throw") && !animType.includes("down")) v0y = -130; 
            if(animType.includes("angle")) { v0x = 60; v0y = -130; startY = 100; }
            
            let cy = startY + v0y*t + 0.5*g*t*t; let cx = startX + v0x*t; let cvy = v0y + g*t;
            if(cy > 180 && t>0.5) time=0;

            dLine(-200, startY, 200, startY, '#7f8c8d', 1, [5,5]); dMath("y=0", -80, startY-10, '#7f8c8d');
            drawAxis(animType.includes("angle")?-150:-50, startY, animType.includes("angle")?200:30, 150, animType.includes("angle")?"x":"", "y");

            ctx.fillStyle='rgba(231,76,60,0.3)'; for(let i=0; i<t; i+=0.1) dC(startX+v0x*i, startY+v0y*i+0.5*g*i*i, 4);
            dC(cx, cy, 15, '#e74c3c'); dMath("m", cx-8, cy+6, "white");
            dA(cx+25, cy, cx+25, cy+cvy*0.4, '#2980b9', 'v'); dA(cx-25, cy, cx-25, cy+g*0.6, '#27ae60', 'g');
            if(v0y !== 0 && t < 0.8) dA(startX, startY, startX+v0x*0.4, startY+v0y*0.4, '#8e44ad', 'v₀');
        }
        // 3. 力学: 力・摩擦・ばね
        else if (animType.includes("force") || animType.includes("normal") || animType.includes("tension") || animType.includes("spring") || animType.includes("friction") || animType.includes("law")) {
            ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
            if(animType.includes("spring")) {
                dFormula("F = -kx", -40, -120);
                let sx = Math.sin(time*3)*60;
                ctx.fillRect(-120, -40, 10, 80); 
                ctx.beginPath(); ctx.moveTo(-110,10); let c = 10; let dx=(sx-30+110)/c; 
                for(let i=0;i<c;i++){ctx.lineTo(-110+dx*(i+0.5), 10+(i%2===0?-10:10));} 
                ctx.lineTo(sx-30,10); ctx.strokeStyle='#7f8c8d'; ctx.stroke();
                dB(sx, 10, 60, 60, '#9b59b6'); dMath("m", sx-10, 15, "white");
                dA(sx, 10, sx-sx, 10, '#e74c3c', 'F'); drawAxis(0, 60, 100, 10, "x", ""); 
            } else {
                if(animType.includes("friction")) dFormula("f = μN", -40, -120);
                else dFormula("W = mg", -40, -120);
                dB(0, 10, 60, 60, '#9b59b6'); dMath("m", -8, 15, "white");
                dA(0, 10, 0, 80, '#e74c3c', 'mg'); 
                if(animType.includes("tension")) { dA(0, -20, 0, -80, '#7f8c8d', '糸'); dA(0, 10, 0, -60, '#2ecc71', 'T'); }
                else dA(0, 10, 0, -60, '#2ecc71', 'N');
                
                if(animType.includes("friction")) {
                    let p = animType.includes("friction_s") ? (t*20) : 80; if(p>80) time=0;
                    dA(0, 10, p, 10, '#3498db', 'F'); dA(0, 40, -p, 40, '#e67e22', animType.includes("friction_s")?'f = μN':'f\' = μ\'N');
                    if(animType.includes("friction_d")) dA(0,-30,40,-30,'#2980b9','v');
                }
            }
        }
        // 4. 力学: 圧力と浮力
        else if (animType.includes("pressure") || animType.includes("buoyancy") || animType.includes("pascal")) {
            if(animType.includes("buoyancy")) {
                dFormula("F = ρVg (浮力)", -60, -120);
                ctx.fillStyle='rgba(52, 152, 219, 0.4)'; ctx.fillRect(-150, -20, 300, 120);
                let bob = Math.sin(time*3)*15; 
                dB(0, 10+bob, 60, 60, '#e67e22'); dMath("V", -8, 15+bob, "white");
                dA(0, 10+bob, 0, 80+bob, '#e74c3c', 'mg'); dA(0, 10+bob, 0, -60+bob, '#2ecc71', 'ρVg');
                dLine(-150, -20, 150, -20, '#2980b9', 2);
            } else {
                dFormula("p = F / S", -50, -120);
                ctx.fillStyle='#7f8c8d'; ctx.fillRect(-150, 40, 300, 5);
                dB(0, 10, 80, 60, '#9b59b6');
                dLine(-40, -20, 40, -20, '#2ecc71', 6); dMath("S", 50, -15, '#2ecc71'); 
                for(let i=-20; i<=20; i+=20) dA(i, -70, i, -20, '#e74c3c'); 
                dMath("F", -10, -80, '#e74c3c');
            }
        }
        // 5. 力学: モーメント・重心
        // 剛体のバランスと重心
        else if (animType.includes("moment") || animType.includes("balance") || animType.includes("center")) {
            if(animType.includes("center")) {
                dFormula("x_G = (m₁x₁ + m₂x₂) / (m₁ + m₂)", -120, -120);
                drawAxis(0, 50, 150, 20, "x", "");
                dC(-80, 0, 20, '#3498db'); dMath("m₁", -90, -30); dA(-80, 50, -80, 15, '#3498db', 'x₁', true);
                dC(60, 0, 30, '#e74c3c'); dMath("m₂", 50, -40); dA(60, 50, 60, 30, '#e74c3c', 'x₂', true);
                dLine(-80, 0, 60, 0, '#bdc3c7', 4);
                let xg = (-80*20 + 60*30) / (20+30); 
                dA(xg, 50, xg, 0, '#2ecc71', 'x_G', true); dC(xg, 0, 6, '#2ecc71');
            } else {
                dFormula("M = F l (力のモーメント)", -100, -120);
                let a = animType.includes("moment") ? Math.sin(time)*0.2 : 0;
                ctx.beginPath(); ctx.moveTo(0,40); ctx.lineTo(-20,80); ctx.lineTo(20,80); ctx.fillStyle='#7f8c8d'; ctx.fill();
                ctx.translate(0,30); ctx.rotate(a);
                ctx.fillStyle='#f39c12'; ctx.fillRect(-120,-5,240,10);
                dB(-80,-20,30,30,'#3498db'); dA(-80,-20,-80,50,'#e74c3c','F₁'); dMath("l₁", -40, -15);
                dB(80,-25,40,40,'#e74c3c'); dA(80,-25,80,70,'#e74c3c','F₂'); dMath("l₂", 40, -15);
            }
        }
        // 6. 力学: 運動量・衝突・反発係数
        else if (animType.includes("momentum") || animType.includes("impulse") || animType.includes("collision") || animType.includes("bounce") || animType.includes("restitution")) {
            let t2 = time%3;
            if(animType.includes("impulse")) {
                dFormula("I = FΔt = mΔv", -60, -120);
                let x = -150 + t*50; if(x > 150) time=0;
                dC(x, 0, 20, '#3498db'); dMath("m", x-8, 6, "white"); dA(x, -30, x+40, -30, '#2980b9', 'v');
                dA(x-60, 0, x-20, 0, '#e74c3c', 'FΔt');
            } else if (animType.includes("restitution") || animType.includes("bounce")) {
                dFormula("e = |v₁' - v₂'| / |v₁ - v₂|", -100, -120);
                let by = 80 - Math.abs(Math.cos(time*3)*80)*Math.exp(-time*0.2);
                dC(0, by, 15, '#1abc9c'); dA(20, by, 20, by+Math.sin(time*3)*40*Math.exp(-time*0.2), '#2980b9', 'v');
                ctx.fillStyle='#bdc3c7'; ctx.fillRect(-50, 95, 100, 5);
            } else {
                dFormula("m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'", -120, -120);
                let x1 = t2<1.5 ? -120+t2*70 : -15 - (t2-1.5)*60; 
                let x2 = t2<1.5 ? -15 : -15+(t2-1.5)*120; 
                dC(x1, 0, 20, '#3498db'); dMath("m₁", x1-10, 6, "white"); 
                dA(x1, -30, x1+(t2<1.5?50:-30), -30, '#2980b9', t2<1.5?'v₁':'v₁\'');
                dC(x2, 0, 20, '#e74c3c'); dMath("m₂", x2-10, 6, "white"); 
                dA(x2, -30, x2+(t2>=1.5?80:0), -30, '#e74c3c', t2<1.5?'v₂=0':'v₂\'');
            }
        }
        // 7. 力学: エネルギー保存則
        else if (animType.includes("energy") || animType.includes("power") || (animType.includes("pendulum") && !animType.includes("t"))) {
            dFormula("E = K + U = 1/2 mv² + mgh = 一定", -140, -160);
            let a = Math.sin(time*2)*0.8;
            ctx.fillStyle='#bdc3c7'; ctx.fillRect(-200,-100,100,10); 
            let px = -150 + 150*Math.sin(a), py = -100 + 150*Math.cos(a);
            dLine(-150,-100, px, py, '#333', 2); 
            dC(px, py, 20, '#9b59b6'); dMath("m", px-8, py+6, "white");
            dA(px, py, px+40*Math.cos(a)*Math.cos(time*2), py+40*Math.sin(a)*Math.cos(time*2), '#2980b9', 'v');
            dLine(-250, 50, -50, 50, '#7f8c8d', 1, [5,5]); dMath("h=0", -250, 40, '#7f8c8d');
            dA(-150, 50, -150, py, '#2ecc71', 'h', true);

            let K = (0.8 - Math.abs(a))*100, U = Math.abs(a)*100;
            drawAxis(100, 100, 120, 120, "", "Energy");
            ctx.fillStyle='#2ecc71'; ctx.fillRect(120, 100-K, 30, K); dMath("K", 125, 130, '#2ecc71');
            ctx.fillStyle='#e67e22'; ctx.fillRect(160, 100-U, 30, U); dMath("U", 165, 130, '#e67e22');
            ctx.fillStyle='#8e44ad'; ctx.fillRect(200, 0, 30, 100);   dMath("E", 205, 130, '#8e44ad'); 
        }
        // 8. 力学: 円運動
        else if (animType.includes("circular") || animType.includes("centripetal") || animType.includes("centrifugal")) {
            dFormula("v = rω,  a = rω²,  F = mrω²", -120, -150);
            let r = 80; dC(0,0,r,'#bdc3c7',false); dC(0,0,5,'#f1c40f');
            let a = time*2; let bx = r*Math.cos(a), by = r*Math.sin(a);
            dC(bx, by, 15, '#3498db'); dMath("m", bx-8, by+6, "white");
            dLine(0,0,bx,by,'#7f8c8d'); dMath("r", bx/2, by/2-10); dAng(0,0,30,0,a,"ωt","#e67e22");
            dA(bx, by, bx-50*Math.sin(a), by+50*Math.cos(a), '#2980b9', 'v');
            if(animType.includes("centrifugal")) dA(bx, by, bx+50*Math.cos(a), by+50*Math.sin(a), '#e67e22', 'mrω²');
            else dA(bx, by, bx*0.4, by*0.4, '#e74c3c', 'F');
        }
        // 9. 力学: 万有引力・ケプラーの法則
        else if (animType.includes("gravity") || animType.includes("kepler") || animType.includes("universal")) {
            dFormula("F = G (m₁m₂) / r²", -70, -150);
            let a = time;
            dC(0,0,30,"#e67e22"); dMath("M", -10, 10, "white");
            let px = 120*Math.cos(a), py = 120*Math.sin(a);
            dC(px, py, 15, "#3498db"); dMath("m", px-8, py+5, "white");
            dA(px, py, 0, 0, "#e74c3c", "F"); dA(0, 0, px, py, "#e74c3c", "F");
            dLine(0,0, px, py, "#7f8c8d", 1, [5,5]); dMath("r", px/2, py/2-10);
            ctx.beginPath(); ctx.strokeStyle='rgba(189, 195, 199, 0.5)'; ctx.arc(0,0,120,0,Math.PI*2); ctx.stroke();
        }
        // 10. 力学: 単振動
        else if (animType.includes("shm") || animType.includes("harmonic") || animType.includes("oscillation") || animType === "pendulum_t") {
            dFormula("x = A sin(ωt),  F = -Kx", -100, -150);
            let R = 80, o = 1.5, a = time*o; let px = R*Math.cos(a), py = R*Math.sin(a);
            dC(-150, 0, R, '#bdc3c7', false); dLine(-150,0,-150+px,py,'#7f8c8d'); dMath("A", -150+px/2, py/2-10);
            dAng(-150, 0, 30, 0, a, "ωt", "#2980b9");
            dA(-150+px, 0, -150+px, py, '#e74c3c', 'x', true); 
            dLine(-150+px, py, 50, py, '#e74c3c', 2, [5,5]);
            
            drawAxis(50, 0, 150, 100, "t", "x");
            dC(50, py, 15, '#2ecc71'); dMath("m", 40, py+5, "white");
            ctx.beginPath(); ctx.strokeStyle='rgba(46, 204, 113, 0.6)'; ctx.lineWidth=2;
            for(let i=0; i<150; i++) ctx.lineTo(50+i, R*Math.sin(a - i*0.05)); ctx.stroke();
            if(animType.includes("v")) dA(70, py, 70, py+R*o*Math.cos(a)*0.5, '#2980b9', 'v');
            if(animType.includes("a") || animType.includes("f")) dA(90, py, 90, py-py*0.5, '#e74c3c', 'F');
        }
        // 11. 熱力学: 熱量・比熱・状態変化
        else if (animType.includes("temp") || animType.includes("heat") || animType.includes("latent") || animType.includes("state")) {
            dFormula("Q = mcΔT", -50, -150);
            ctx.fillStyle = 'rgba(236, 240, 241, 0.8)'; ctx.fillRect(-100,-80,200,160);
            let spd = animType.includes("heat") ? 1+(time%4) : 2;
            let c = animType.includes("state") ? ((time%4)<2?'#e74c3c':'#8e44ad') : `rgb(${spd*50},50,200)`;
            for(let i=1; i<=40; i++) {
                let px = Math.sin(i*123 + time*spd)*80, py = Math.cos(i*321 + time*spd)*60;
                dC(px, py, 4, c);
            }
            ctx.fillStyle='white'; ctx.fillRect(-130,-50,10,100); ctx.strokeRect(-130,-50,10,100); 
            ctx.fillStyle='#e74c3c'; ctx.fillRect(-128,50-spd*15,6,spd*15); dC(-125,50,12,'#e74c3c');
            dMath("T", -150, 75, '#e74c3c'); 
            if(animType.includes("heat")) dA(0, 120, 0, 90, '#e74c3c', 'Q');
        }
        // 12. 熱力学: 気体の法則・第一法則
        else if (animType.includes("gas") || animType.includes("boyle") || animType.includes("charles") || animType.includes("kinetic") || animType.includes("internal") || animType.includes("thermo") || animType.includes("piston") || animType.includes("engine") || animType.includes("molar")) {
            if(animType.includes("thermo") || animType.includes("internal")) dFormula("ΔU = Q + W", -60, -150);
            else dFormula("pV = nRT", -50, -150);
            let pw = 60+Math.sin(time*2)*40;
            ctx.strokeRect(-100,-60,pw+100,120); dMath("V", -80, -70);
            ctx.fillStyle='#e74c3c'; ctx.fillRect(pw,-60,15,120); 
            if(Math.sin(time*2)>0) dA(pw+20,0,pw+60,0,'#e74c3c','W = pΔV');
            if(animType.includes("thermo")) dA(0, 100, 0, 70, '#e74c3c', 'Q');
            dMath("p", pw-20, -70, '#e74c3c');
            for(let i=1; i<=40; i++) {
                let px = -100 + Math.abs(Math.sin(i*11+time*(3+i%3)))*(pw+100);
                let py = -60 + Math.abs(Math.cos(i*22+time*(2+i%2)))*120;
                dC(px, py, 4, '#e67e22');
            }
        }
        // 13. 波動: 波の基本・音波・ドップラー効果
        else if (animType.includes("wave") || animType.includes("sound") || animType.includes("doppler") || animType.includes("interference") || animType.includes("beat") || animType.includes("pipe") || animType.includes("string") || animType.includes("transverse") || animType.includes("longitudinal")) {
            if (animType.includes("doppler")) {
                dFormula("f' = f (V - v_o) / (V - v_s)", -100, -150);
                let sx = -100 + (t%3)*40;
                dC(sx, 0, 10, "#e74c3c"); dA(sx, 0, sx+40, 0, "#c0392b", "v_s");
                for(let i=0; i<4; i++) { ctx.beginPath(); ctx.strokeStyle="rgba(52, 152, 219, 0.5)"; ctx.arc(sx - i*25, 0, 30 + i*25, 0, Math.PI*2); ctx.stroke(); }
                dC(100, 0, 15, "#2ecc71"); dMath("Obs", 90, 25);
            } else if (animType.includes("longitudinal") || animType.includes("sound")) {
                dFormula("v = fλ", -40, -150);
                for(let x=-200; x<=200; x+=20) {
                    for(let y=-40; y<=40; y+=20) {
                        let dx = Math.sin(x*0.05 - time*3)*15; dC(x+dx, y, 4, '#3498db');
                    }
                }
                dTxt("疎密波（縦波）", -60, -80);
            } else {
                dFormula("v = fλ,  T = 1/f", -60, -150);
                drawAxis(0, 0, 250, 80, "x", "y");
                ctx.beginPath(); ctx.strokeStyle='#9b59b6'; ctx.lineWidth=3;
                for(let x=-250; x<=250; x+=5) ctx.lineTo(x, Math.sin(x*0.04 - time*3)*60); ctx.stroke();
                dC(0, Math.sin(-time*3)*60, 10, '#e74c3c');
                dA(20, Math.sin(-time*3)*60, 20, Math.sin(-time*3)*60 + Math.cos(-time*3)*30, '#e74c3c', 'v');
                let peak1 = (Math.PI/2 + time*3)/0.04; let peak2 = (5*Math.PI/2 + time*3)/0.04;
                dA(peak1, -70, peak2, -70, '#2980b9', 'λ'); dLine(peak1, -60, peak1, -80, '#2980b9'); dLine(peak2, -60, peak2, -80, '#2980b9');
            }
        }
        // 14. 光学: 屈折・反射・レンズ
        else if (animType.includes("refract") || animType.includes("reflect") || animType.includes("lens") || animType.includes("slit") || animType.includes("diffraction") || animType.includes("light")) {
            if(animType.includes("lens")) {
                dFormula("1/a + 1/b = 1/f", -60, -150);
                dLine(-200, 0, 200, 0, "#7f8c8d"); 
                dA(0, -80, 0, 80, "#3498db"); dA(0, 80, 0, -80, "#3498db"); 
                let ox = -100, oy = -40;
                dA(ox, 0, ox, oy, "#e74c3c", "A"); 
                dLine(ox, oy, 0, oy, "#f1c40f"); dLine(0, oy, 100, 0, "#f1c40f"); 
                dLine(ox, oy, 0, 0, "#f1c40f"); dLine(0, 0, 100, 40, "#f1c40f"); 
                dA(100, 0, 100, 40, "#e67e22", "A'"); 
                dMath("f", 50, 15); dC(50, 0, 4, "#2c3e50");
            } else {
                dFormula("n₁₂ = sin(i) / sin(r) = v₁ / v₂", -100, -170);
                ctx.fillStyle='rgba(52,152,219,0.2)'; ctx.fillRect(-250, 0, 500, 200);
                dLine(-250, 0, 250, 0, '#34495e', 3); dMath("n₁", -240, -20); dMath("n₂", -240, 30);
                dA(0, -150, 0, 150, '#bdc3c7', '', true); 
                
                let isTotal = animType.includes("total") || animType.includes("all");
                let isReflect = isTotal || animType.includes("reflect");
                let aI = isTotal? Math.PI/2.5 : Math.PI/4; let aR = isTotal? Math.PI/1.5 : Math.PI/8;
                let ix = -120*Math.sin(aI), iy = -120*Math.cos(aI); let rx = 120*Math.sin(aR), ry = 120*Math.cos(aR);
                dA(ix, iy, 0, 0, '#f1c40f', '入射光');
                
                if(isTotal) { dA(0, 0, -ix, iy, '#f1c40f', '全反射'); } 
                else if (isReflect) { dA(0, 0, -ix, iy, '#f1c40f', '反射光'); dA(0, 0, rx, ry, 'rgba(241, 196, 15, 0.4)', '屈折光'); }
                else { dA(0, 0, rx, ry, '#f1c40f', '屈折光'); }
                
                dAng(0, 0, 40, -Math.PI/2, -Math.PI/2 + aI, "i", "#e74c3c"); 
                if(!isTotal) { dAng(0, 0, 60, Math.PI/2 - aR, Math.PI/2, "r", "#2980b9"); dA(ix, iy, 0, iy, '#e74c3c', 'sin i', true); dA(rx, ry, 0, ry, '#2980b9', 'sin r', true); }
            }
        }
        // 15. 電磁気: クーロン・電場・コンデンサー・回路
        else if (animType.includes("coulomb") || animType.includes("field") || animType.includes("voltage") || animType.includes("capacitor") || animType.includes("circuit") || animType.includes("ohm") || animType.includes("kirchhoff") || animType.includes("joule") || animType.includes("electric")) {
            if(animType.includes("coulomb") || animType.includes("field")) {
                dFormula("F = k q₁q₂ / r²,  E = F/q", -100, -130);
                dC(-80, 0, 20, "#e74c3c"); dMath("+q₁", -95, -30);
                dC(80, 0, 20, "#3498db"); dMath("-q₂", 65, -30);
                dA(-80, 0, -20, 0, "#e74c3c", "F"); dA(80, 0, 20, 0, "#3498db", "F");
                dLine(-80, 0, 80, 0, "#bdc3c7", 1, [5,5]); dMath("r", 0, -10);
            } else if(animType.includes("capacitor")) {
                dFormula("C = ε S / d,  U = 1/2 CV²", -100, -130);
                dLine(-60, -50, 60, -50, "#e74c3c", 8); dMath("+Q", -15, -65, "#e74c3c");
                dLine(-60, 50, 60, 50, "#3498db", 8); dMath("-Q", -15, 85, "#3498db");
                for(let x=-50; x<=50; x+=25) dA(x, -40, x, 40, "#2ecc71");
                dMath("E", 75, 0, "#2ecc71");
            } else {
                dFormula("V = RI,  P = VI", -60, -130);
                dLine(-60, -60, 60, -60, "#34495e"); dLine(60, -60, 60, 60, "#34495e");
                dLine(-60, 60, -15, 60, "#34495e"); dLine(15, 60, 60, 60, "#34495e");
                dLine(-60, -60, -60, 60, "#34495e");
                dLine(-15, 45, -15, 75, "#e74c3c", 4); dLine(15, 50, 15, 70, "#34495e", 4); // 電源
                dMath("V", -5, 95);
                dB(0, -60, 50, 25, "#bdc3c7"); dMath("R", -5, -75);
                dA(-60, 0, -60, -30, "#e67e22", "I"); // 電流
            }
        }
        // 16. 電磁気: 磁場・ローレンツ力・電磁誘導・交流
        else if (animType.includes("lorentz") || animType.includes("mag") || animType.includes("ampere") || animType.includes("faraday") || animType.includes("lenz") || animType.includes("induct") || animType.includes("ac_") || animType.includes("reactance") || animType.includes("impedance") || animType.includes("resonance")) {
            if(animType.includes("lorentz")) {
                dFormula("F = qvB sinθ", -60, -150);
                for(let y=-80; y<=80; y+=40) { for(let x=-100; x<=100; x+=40) { dMath("×", x, y, "#2ecc71"); } } 
                dMath("B(奥へ)", 120, -90, "#2ecc71");
                let v = 80, a = -Math.PI/6; let vx = v*Math.cos(a), vy = v*Math.sin(a);
                dC(0, 0, 10, '#f1c40f'); dMath("q", -12, 30);
                dA(0, 0, vx, vy, '#3498db', 'v'); dAng(0, 0, 40, a, 0, "θ");
                dA(0, 0, 0, vy, '#e74c3c', 'v sinθ', true); dA(0, 0, vx, 0, '#95a5a6', 'v cosθ', true); 
                dLine(0,vy,vx,vy,'#bdc3c7',1,[5,5]); dLine(vx,vy,vx,0,'#bdc3c7',1,[5,5]);
                dA(0, 0, -vy, 0, '#e67e22', 'F');
            } else if (animType.includes("faraday") || animType.includes("lenz") || animType.includes("induct")) {
                dFormula("V = -N (ΔΦ / Δt)", -80, -150);
                let y = Math.sin(time*2)*40;
                dB(0, -80 + y, 40, 70, "#e74c3c"); dMath("N", -5, -80+y, "white"); dMath("S", -5, -45+y, "white");
                dA(0, -40+y, 0, y, "#3498db", "v");
                for(let i=-1; i<=1; i++) { dC(i*40, 40, 25, "#bdc3c7", false); dC(i*40, 45, 25, "#bdc3c7", false); }
            } else if (animType.includes("ac_gen") || animType.includes("ac_circuit")) {
                dFormula("V = V₀ sin(ωt)", -60, -150);
                let R = 60, o = 2, a = time * o;
                drawAxis(-120, 0, 80, 80, "x", "y"); dC(-120, 0, R, '#bdc3c7', false);
                let cx = -120 + R*Math.cos(a), cy = R*Math.sin(a);
                dA(-120, 0, cx, cy, '#3498db', 'コイル'); dAng(-120, 0, 25, 0, a, "ωt");
                dA(cx, 0, cx, cy, '#e74c3c', 'V₀ sinωt', true);
                drawAxis(50, 0, 150, 80, "t", "V"); dC(50, cy, 6, '#e74c3c');
                ctx.beginPath(); ctx.strokeStyle='#e74c3c'; ctx.lineWidth=3;
                for(let i=0; i<150; i++) ctx.lineTo(50+i, R*Math.sin(a - i*0.05)); ctx.stroke();
                dLine(cx, cy, 50, cy, '#e74c3c', 1, [5,5]); 
            } else {
                dFormula("V = Z I", -40, -150);
                drawAxis(0, 0, 100, 100, "Re", "Im");
                let w = time*2;
                dA(0, 0, 80*Math.cos(w), 80*Math.sin(w), '#e74c3c', 'V');
                let phase = animType.includes("reactance") ? Math.PI/2 : (animType.includes("resonance")? 0 : Math.PI/4);
                dA(0, 0, 60*Math.cos(w - phase), 60*Math.sin(w - phase), '#3498db', 'I');
                dTxt("フェーザ図 (位相のズレ)", -90, -120);
            }
        }
        // 17. 原子: 光電効果・ボーアモデル・核反応
        else if (animType.includes("photo") || animType.includes("compton") || animType.includes("bohr") || animType.includes("atom") || animType.includes("decay") || animType.includes("mass") || animType.includes("matter") || animType.includes("work_func") || animType.includes("modern")) {
            if(animType.includes("photo") || animType.includes("work")) {
                dFormula("K_max = hν - W", -70, -150);
                dLine(-120, 50, 120, 50, "#7f8c8d", 20); dMath("Metal (仕事関数 W)", -70, 80);
                dA(-80, -50, -20, 40, "#f1c40f", "hν (光子)");
                if(t % 2 > 0.5) dA(0, 40, 80, -20, "#3498db", "e⁻ (K_max)");
            } else if(animType.includes("bohr") || animType.includes("atom")) {
                dFormula("mvr = n(h/2π),  hν = E_n - E_m", -120, -150);
                dC(0, 0, 15, "#e74c3c"); dMath("+Ze", -15, 30, "#e74c3c");
                dC(0, 0, 70, "#bdc3c7", false); dC(0, 0, 120, "#bdc3c7", false);
                let a = time*3;
                dC(70*Math.cos(a), 70*Math.sin(a), 8, "#3498db"); dMath("e⁻", 70*Math.cos(a)+15, 70*Math.sin(a)+15, "#3498db");
            } else {
                dFormula("E = Δm c² (質量欠損)", -80, -150);
                dC(0, 0, 40, "#e74c3c"); dMath("Mass Δm", -35, 60);
                dA(50, 0, 120, 0, "#f1c40f", "Energy E");
            }
        }
        // フォールバック (不測の事態用)
        else {
            dFormula("Simulation Running...", -80, -120);
            dTxt("設定されたアニメーション (" + animType + ") を実行中", -140, 0, "#7f8c8d");
        }
    } catch (e) {
        console.error("Render Error:", e);
        ctx.fillStyle = "red";
        ctx.fillText("エラーが発生しました: " + e.message, -150, 0);
    }
    ctx.restore();
}

render();
