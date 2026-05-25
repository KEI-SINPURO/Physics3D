// ==========================================
// 高校物理 2Dシミュレーションエンジン (完全網羅・公式表示・美文字対応版)
// ==========================================

// ------------------------------------------
// 【欠落の修正】全17分野・全アニメーション型に対応するデータ定義
// ------------------------------------------
const physicsData = {
    // 1. 力学: 直線運動・加速度・仕事
    "work_cos": {
        chap: "第1章 力学", title: "仕事とエネルギー",
        formulas: [{ name: "仕事の定義", math: "W = F x \\cos\\theta", usage: "力が移動方向と斜めに向いているとき", reason: "移動方向の力成分 F \\cos\\theta のみが物体に仕事をします。", simText: "斜めに引っ張られる物体の仕事のシミュレーションです。", animType: "work_cos" }]
    },
    "linear_accel": {
        chap: "第1章 力学", title: "等加速度直線運動",
        formulas: [
            { name: "速度・位置の公式", math: "v = v_0 + at, \\quad x = v_0t + \\frac{1}{2}at^2", usage: "加速度が一定の直線運動を解析するとき", reason: "速度は時間tに比例して増え、変位xはtの2乗のグラフ（放物線）になります。", simText: "等加速度で直線運動する物体の位置・速度・加速度の変化です。", animType: "accel" },
            { name: "相対速度", math: "v_{AB} = v_B - v_A", usage: "動く観測者Aから別の動く物体Bを見たとき", reason: "相手の速度から自分の速度を引くことで、自分基準の速度を求めます。", simText: "赤い物体Aから見た、青い物体Bの相対的な運動です。", animType: "relative" }
        ]
    },
    // 2. 力学: 落体の運動
    "falling_motion": {
        chap: "第1章 力学", title: "落体の運動",
        formulas: [
            { name: "自由落下・鉛直投げ下ろし", math: "y = v_0t + \\frac{1}{2}gt^2", usage: "物体を真下に落としたり、投げ下ろしたとき", reason: "重力加速度gによって、下向きに等加速度運動をします。", simText: "初速度を持って下向きに落下する物体の運動です。", animType: "fall_v0" },
            { name: "鉛直投げ上げ", math: "v = v_0 - gt", usage: "物体を真上に投げ上げたとき", reason: "重力と逆向きに投げ上げるため、最高点に向かって減速します。", simText: "真上に投げ上げられ、最高点に達したあと落下する運動です。", animType: "throw" },
            { name: "平射・斜方投射", math: "x = v_0 \\cos\\theta \\cdot t, \\quad y = v_0 \\sin\\theta \\cdot t - \\frac{1}{2}gt^2", usage: "斜め方向に物体を投げ出したとき", reason: "水平方向は等速直線運動、鉛直方向は投げ上げ運動の合成です。", simText: "斜め方向に投射された物体の放物運動です。", animType: "angle" }
        ]
    },
    // 3. 力学: 力・摩擦・ばね
    "forces_spring": {
        chap: "第1章 力学", title: "力のつりあいと運動の法則",
        formulas: [
            { name: "フックの法則", math: "F = kx", usage: "ばねの弾性力を求めるとき", reason: "ばねの伸びまたは縮みxに比例した復元力が働きます。", simText: "ばねに繋がれた物体の往復運動と弾性力Fのシミュレーションです。", animType: "spring" },
            { name: "静止摩擦力と最大摩擦力", math: "f = \\mu N", usage: "物体が滑り出す直前の限界を調べるとき", reason: "垂直抗力Nに比例し、これを超えると物体は滑り出します。", simText: "力を加えていき、最大摩擦力を超えて滑り出す境界を視覚化します。", animType: "friction_s" },
            { name: "動摩擦力", math: "f' = \\mu' N", usage: "物体がすでに滑っているときの摩擦力を求めるとき", reason: "滑っている間は、速度によらず一定の動摩擦力が運動を妨げます。", simText: "滑っている物体に働く一定の動摩擦力f'のシミュレーションです。", animType: "friction_d" }
        ]
    },
    // 4. 力学: 圧力と浮力
    "fluid_mechanics": {
        chap: "第1章 力学", title: "流体の力学",
        formulas: [
            { name: "アルキメデスの原理（浮力）", math: "F = \\rho Vg", usage: "水などの流体中にある物体が受ける浮力を求めるとき", reason: "物体が押ししのけた流体の重さと同じだけの浮力を上向きに受けます。", simText: "流体中の物体に働く重力mgと浮力ρVgのつりあいです。", animType: "buoyancy" },
            { name: "圧力の定義", math: "p = \\frac{F}{S}", usage: "面が受ける単位面積あたりの力を求めるとき", reason: "力が分散する面積Sが小さいほど、受ける圧力pは大きくなります。", simText: "ピストン面に働く力Fと圧力pの関係を示します。", animType: "pressure" }
        ]
    },
    // 5. 力学: モーメント・重心
    "rigid_body": {
        chap: "第1章 力学", title: "剛体のバランス",
        formulas: [
            { name: "力のモーメント", math: "M = Fl", usage: "物体を回転させる効果を考えるとき", reason: "支点からの腕の長さlと、垂直な力Fの積で回転の強さが決まります。", simText: "天秤の左右で働くモーメントのつりあいです。", animType: "moment" },
            { name: "剛体の重心", math: "x_G = \\frac{m_1x_1 + m_2x_2}{m_1 + m_2}", usage: "大小の質点からなるシステムの重心位置を求めるとき", reason: "各質点の質量で位置を内分した点が、全体の質量中心（重心）になります。", simText: "2つの質点の質量比と重心x_Gの位置関係です。", animType: "center" }
        ]
    },
    // 6. 力学: 運動量と衝突
    "momentum_collision": {
        chap: "第1章 力学", title: "運動量と衝動",
        formulas: [
            { name: "運動量保存の法則", math: "m_1v_1 + m_2v_2 = m_1v_1' + m_2v_2'", usage: "2物体が衝突・合体・分裂するとき", reason: "外力が働かない限り、衝突前後で運動量の総和は不変です。", simText: "2つの球が衝突し、速度が変化する前後のシミュレーションです。", animType: "collision" },
            { name: "力積と運動量変化", math: "I = F\\Delta t = m\\Delta v", usage: "物体に一定時間力が働き、速度が変わるとき", reason: "加えた力積（力×時間）の分だけ、物体の運動量が変化します。", simText: "壁や外力から力積を受けて加速・減速する様子です。", animType: "impulse" },
            { name: "反発係数（はねかえり係数）", math: "e = \\frac{|v_1' - v_2'|}{|v_1 - v_2|}", usage: "衝突後のはねかえり具合を計算するとき", reason: "衝突前後の相対速度の比を表し、1であれば弾性衝突（エネルギー保存）です。", simText: "床に衝突してはねかえるボールの運動（eによる減衰）です。", animType: "restitution" }
        ]
    },
    // 7. 力学: エネルギー保存
    "energy_conservation": {
        chap: "第1章 力学", title: "力学的エネルギー保存",
        formulas: [{ name: "力学的エネルギー保存則", math: "E = K + U = \\frac{1}{2}mv^2 + mgh = 一定", usage: "摩擦や空気抵抗がなく、重力やばねの力だけで運動するとき", reason: "運動エネルギーKと位置エネルギーUは互いに変換され、総量は保たれます。", simText: "振り子の運動における運動エネルギーと位置エネルギーのリアルタイム推移です。", animType: "energy" }]
    },
    // 8. 力学: 円運動
    "circular_motion": {
        chap: "第1章 力学", title: "円運動",
        formulas: [{ name: "向心力・遠心力", math: "F = mr\\omega^2 = m\\frac{v^2}{r}", usage: "物体が円軌道を回っているとき", reason: "円の中心に向かう加速度（向心加速度）が生じるため、向心力が必要です。", simText: "等速円運動する物体に働く速度vと向心力（または遠心力）のベクトルです。", animType: "centrifugal" }]
    },
    // 9. 力学: 万有引力
    "gravitation": {
        chap: "第1章 力学", title: "万有引力と天体",
        formulas: [{ name: "万有引力の法則", math: "F = G\\frac{m_1m_2}{r^2}", usage: "惑星の軌道運動や宇宙空間での引力を考えるとき", reason: "すべての質量を持つ物体は、距離の2乗に反比例する引力を及ぼし合います。", simText: "中心の重い星（M）の周りを公転する惑星（m）のシミュレーションです。", animType: "gravity" }]
    },
    // 10. 力学: 単振動
    "harmonic_oscillation": {
        chap: "第1章 力学", title: "単振動",
        formulas: [{ name: "単振動の変位と復元力", math: "x = A\\sin(\\omega t), \\quad F = -Kx", usage: "ばね振り子や単振り子の振動を解析するとき", reason: "中心からのズレxに比例した逆向きの力を受けるため、正弦波の振動になります。", simText: "円運動の投影としての単振動と、時間の経過に伴うx-tグラフの描画です。", animType: "shm" }]
    },
    // 11. 熱力学: 熱量と比熱
    "thermo_heat": {
        chap: "第2章 熱力学", title: "熱量と状態変化",
        formulas: [{ name: "熱量の公式", math: "Q = mc\\Delta T", usage: "物質の温度を上げ下げするのに必要な熱量を求めるとき", reason: "質量m、比熱c、温度変化ΔTのすべてに比例して必要な熱量Qが決まります。", simText: "分子運動の激しさと温度計（T）、および外部からの熱量Qのイメージです。", animType: "heat" }]
    },
    // 12. 熱力学: 気体の法則
    "thermo_gas": {
        chap: "第2章 熱力学", title: "気体の状態変化",
        formulas: [
            { name: "気体の状態方程式", math: "pV = nRT", usage: "気体の圧力、体積、温度の相互関係を調べるとき", reason: "分子の衝突回数（圧力p）と空間（体積V）は、分子数nと熱運動の激しさTに比例します。", simText: "ピストン内の気体分子の運動と、体積V・圧力pの変化です。", animType: "gas" },
            { name: "熱力学第一法則", math: "\\Delta U = Q + W", usage: "気体が熱を受け取ったり、仕事をされたりするとき", reason: "外部から得た熱量Qとされた仕事Wの総和が、内部エネルギー（温度）の増加ΔUになります。", simText: "熱を加えられてピストンが膨張し、外部へ仕事をするシミュレーションです。", animType: "internal" }
        ]
    },
    // 13. 波動: 波の性質・ドップラー効果
    "wave_motion": {
        chap: "第3章 波動", title: "波の性質と音波",
        formulas: [
            { name: "波の基本式", math: "v = f\\lambda, \\quad T = \\frac{1}{f}", usage: "波の速度、周波数、波長の関係を求めるとき", reason: "1秒間にf個の波（長さλ）が進むため、速度はfλになります。", simText: "媒質が上下に振動し、波動が右へ伝播していく正弦波の様子です。", animType: "wave" },
            { name: "縦波（疎密波）", math: "v = f\\lambda", usage: "音波などの疎密波を可視化・解析するとき", reason: "媒質が波の進行方向と同じ向きに振動し、密な部分と粗な部分が伝わります。", simText: "媒質の密度の濃淡が右に進んでいく縦波（音波）の挙動です。", animType: "longitudinal" },
            { name: "ドップラー効果", math: "f' = f\\frac{V - v_o}{V - v_s}", usage: "音源や観測者が動いて音が変わって聞こえるとき", reason: "音源が動くと波長が縮み、観測者が動くと1秒間に受け取る波の数が変わります。", simText: "動く音源（赤）から放射される波面が前方に詰まり、後方に広がる様子です。", animType: "doppler" }
        ]
    },
    // 14. 光学: 反射・屈折・レンズ
    "optics": {
        chap: "第3章 波動", title: "光の反射・屈折とレンズ",
        formulas: [
            { name: "屈折の法則（スネルの法則）", math: "n_{12} = \\frac{\\sin i}{\\sin r} = \\frac{v_1}{v_2}", usage: "光が異なる媒質へ斜めに入射して折れ曲がるとき", reason: "媒質間での光の進む速度の違い（v1, v2）によって、進行方向が変化します。", simText: "境界における入射角iと屈折角r、および全反射のシミュレーションです。", animType: "refract" },
            { name: "レンズの公式", math: "\\frac{1}{a} + \\frac{1}{b} = \\frac{1}{f}", usage: "凸レンズや凹レンズによる像の位置を求めるとき", reason: "物体距離aと像距離b、焦点距離fは光線の幾何学的な経路からこの関係を満たします。", simText: "凸レンズを通過する光線が集まり、実像を結ぶ光路図です。", animType: "lens" }
        ]
    },
    // 15. 電磁気: 電場とコンデンサー
    "electrostatics": {
        chap: "第4章 電磁気", title: "電場とコンデンサー",
        formulas: [
            { name: "クーロンの法則", math: "F = k\\frac{q_1q_2}{r^2}", usage: "電荷同士に働く静電気力を求めるとき", reason: "質量に対する万有引力と同様に、電気量に比例し、距離の2乗に反比例します。", simText: "正電荷（赤）と負電荷（青）の間に働く引力Fのシミュレーションです。", animType: "coulomb" },
            { name: "コンデンサーの電気容量", math: "C = \\varepsilon \\frac{S}{d}, \\quad U = \\frac{1}{2}CV^2", usage: "平行板コンデンサーの蓄電性能を調べるとき", reason: "極板面積Sが広く、間隔dが狭いほど電荷を多く（C）蓄えられます。", simText: "極板間に形成される一様な電場Eと、蓄えられる電荷±Qの様子です。", animType: "capacitor" },
            { name: "オームの法則", math: "V = RI", usage: "直流回路の電圧・電流・抵抗を計算するとき", reason: "抵抗Rに電流Iを流すためには、電流に比例した電圧（電気的圧力）Vが必要です。", simText: "電源V、抵抗Rを流れる電流Iからなる基本回路です。", animType: "circuit" }
        ]
    },
    // 16. 電磁気: 磁場と電磁誘導
    "electromagnetism": {
        chap: "第4章 電磁気", title: "磁場と電磁誘導",
        formulas: [
            { name: "ローレンツ力", math: "F = qvB \\sin\\theta", usage: "磁場中を動く電荷が受ける力を求めるとき", reason: "磁場Bに対して速度vで動く電荷qは、フレミングの左手の法則に従う力を受けます。", simText: "奥向きの磁場（×）の中を斜めに進む電荷が受けるローレンツ力Fです。", animType: "lorentz" },
            { name: "ファラデーの電磁誘導の法則", math: "V = -N \\frac{\\Delta \\Phi}{\\Delta t}", usage: "コイルを貫く磁束が変化して誘導起電力が生じるとき", reason: "磁束の変化を妨げる向き（マイナス）に、変化の速さに比例した電圧が発生します。", simText: "磁石の移動によってコイル内の磁束が変化し、電流が誘起されるイメージです。", animType: "faraday" },
            { name: "交流電圧の発生", math: "V = V_0 \\sin(\\omega t)", usage: "発電機などの交流電源を扱うとき", reason: "一様な磁場中でコイルが等速円運動すると、時間とともに正弦波の電圧が生まれます。", simText: "回転するコイル（位相ωt）と、発生する交流電圧の波形グラフの同期です。", animType: "ac_gen" }
        ]
    },
    // 17. 原子: 光電効果・原子模型
    "atomic_physics": {
        chap: "第5章 原子物理", title: "量子と原子の構造",
        formulas: [
            { name: "光電効果の公式", math: "K_{max} = h\\nu - W", usage: "金属に光を当てて飛び出す電子の最大運動エネルギーを求めるとき", reason: "光子1個のエネルギー hν から、金属から脱出する仕事関数 W を差し引いた残りが電子の運動エネルギーになります。", simText: "光子（hν）の衝突により、金属から光電子（e⁻）が叩き出される様子です。", animType: "photo" },
            { name: "ボーアの量子化条件", math: "mvr = n\\frac{h}{2\\pi}", usage: "水素原子内の電子の安定軌道を説明するとき", reason: "電子の物質波が軌道1周で定常波を作るため、角運動量が不連続（量子化）になります。", simText: "原子核の周りを、特定の不連続な軌道（n=1, 2...）で周回する電子のモデルです。", animType: "bohr" },
            { name: "アインシュタインの質量エネルギー", math: "E = \\Delta m \\cdot c^2", usage: "核反応や質量欠損によるエネルギー解放を計算するとき", reason: "質量とエネルギーは等価であり、極小の質量欠損Δmが莫大なエネルギーEに化けます。", simText: "質量欠損Δmが発生した瞬間に、莫大なエネルギーEが放出されるイメージです。", animType: "mass" }
        ]
    }
};

// ------------------------------------------
// メニューと公式カードの構築ロジック
// ------------------------------------------
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

// Canvas 設定
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
let animType = "";
let isPlaying = true;
let time = 0;
let scale = 1.0, panX = 0, panY = 0;
let isDragging = false, lastX = 0, lastY = 0;

function resizeCanvas() { 
    if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
    }
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

// コントロールUI
const speedSlider = document.getElementById('speedSlider');
if(speedSlider) speedSlider.addEventListener('input', e => document.getElementById('speedVal').innerText = parseFloat(e.target.value).toFixed(2) + "x");
const zoomSlider = document.getElementById('zoomSlider');
if(zoomSlider) zoomSlider.addEventListener('input', e => { scale = parseFloat(e.target.value); document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; });
const playBtn = document.getElementById('playBtn');
if(playBtn) playBtn.onclick = () => { isPlaying = !isPlaying; playBtn.innerText = isPlaying ? "⏸ 一時停止" : "▶️ 再生"; };
const resetBtn = document.getElementById('resetBtn');
if(resetBtn) resetBtn.onclick = () => setAnimation(animType);

// マウス操作
canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
canvas.addEventListener('mousemove', e => { if(isDragging) { panX += e.clientX - lastX; panY += e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; } });
window.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('wheel', e => { 
    e.preventDefault(); 
    scale = Math.max(0.5, Math.min(3.0, scale + (e.deltaY > 0 ? -0.1 : 0.1))); 
    if(zoomSlider) zoomSlider.value = scale; 
    if(document.getElementById('zoomVal')) document.getElementById('zoomVal').innerText = scale.toFixed(1) + "x"; 
}, { passive: false });

// ====================================================
// 描画ユーティリティ
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

function dAng(x, y, r, a1, a2, label, color="#2c3e50") {
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
    ctx.shadowBlur = 0; 
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

        // 背景グリッド
        ctx.strokeStyle = '#eef2f5'; ctx.lineWidth = 1;
        for(let i=-1000; i<=1000; i+=20) { 
            if(i%100===0) ctx.strokeStyle='#dfe6e9'; else ctx.strokeStyle='#eef2f5'; 
            dLine(i,-1000,i,1000,ctx.strokeStyle); dLine(-1000,i,1000,i,ctx.strokeStyle); 
        }
        dLine(-1000, 0, 1000, 0, '#b2bec3', 2); dLine(0, -1000, 0, 1000, '#b2bec3', 2); 

        let t = time % 6; 
        if(!animType) { dTxt("シミュレーションを選択してください。", -120, 0, "#7f8c8d"); ctx.restore(); return; }

        // ----------------------------------------------------
        // 1. 力学: 直線運動・加速度
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 2. 力学: 落体の運動
        // ----------------------------------------------------
        else if (animType.includes("fall") || animType.includes("throw") || animType.includes("angle")) {
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
        // ----------------------------------------------------
        // 3. 力学: 力・摩擦・ばね
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 4. 力学: 圧力と浮力
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 5. 力学: モーメント・重心
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 6. 力学: 運動量・衝突・反発係数
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 7. 力学: エネルギー保存則
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 8. 力学: 円運動
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 9. 力学: 万有引力・ケプラーの法則
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 10. 力学: 単振動
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 11. 熱力学: 熱量・比熱・状態変化
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 12. 熱力学: 気体の法則・熱力学第一法則
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 13. 波動: 波の基本・音波・ドップラー効果
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 14. 光学: 屈折・反射・レンズ・回折
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 15. 電磁気: クーロン・電場・コンデンサー・回路
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 16. 電磁気: 磁場・ローレンツ力・電磁誘導・交流
        // ----------------------------------------------------
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
        // ----------------------------------------------------
        // 17. 原子: 光電効果・ボーアモデル・核反応
        // ----------------------------------------------------
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
