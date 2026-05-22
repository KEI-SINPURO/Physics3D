const physicsData = {
    // --- 力学 ---
    "c1": {
        chap: "力学", title: "1 運動の表し方",
        formulas: [
            { name: "等速直線運動の変位", math: "$$x=vt$$", usage: "速度が一定のときの進んだ距離。", reason: "距離＝速さ×時間", animType: "linear", simText: "速度が常に一定(a=0)で進み続ける運動です。" },
            { name: "等加速度直線運動（速度）", math: "$$v=v_0+at$$", usage: "加速度aで加速している物体の、時間t後の速度。", reason: "初速度に「1秒あたりに増える速度(a)×秒数(t)」を足します。", animType: "accel", simText: "徐々にスピードが上がっていく（または下がっていく）運動です。" },
            { name: "等加速度直線運動（変位）", math: "$$x=v_0t+\\frac{1}{2}at^2$$", usage: "時間tの間に進んだ距離。", reason: "v-tグラフの面積（長方形＋三角形）です。", animType: "accel", simText: "進む距離が二次関数的に（加速度的に）増えていきます。" },
            { name: "時間を含まない式", math: "$$v^2-v_0^2=2ax$$", usage: "時間が分からないときに速度と距離の関係を出す式。", reason: "上の2式から時間tを消去して整理したものです。", animType: "accel", simText: "時間(t)の情報がなくても、距離(x)と速度(v)の関係が分かります。" },
            { name: "自由落下", math: "$$v=gt \\quad y=\\frac{1}{2}gt^2$$", usage: "物体を静かに手放した時の速度と落下距離。", reason: "等加速度運動の式で、v0=0, a=g（重力加速度）としたものです。", animType: "fall", simText: "重力加速度gによって、下に向かって等加速度運動をします。" },
            { name: "鉛直投げ下ろし", math: "$$v=v_0+gt \\quad y=v_0t+\\frac{1}{2}gt^2$$", usage: "初速度v0で下向きに投げた時。", reason: "a=gとした等加速度運動です。", animType: "fall_v0", simText: "初速度があるため、自由落下よりも速く落ちていきます。" },
            { name: "鉛直投げ上げ", math: "$$v=v_0-gt \\quad y=v_0t-\\frac{1}{2}gt^2$$", usage: "上向きに投げた時。最高点でv=0になります。", reason: "上向きを正とすると重力は下向きなのでa=-gとなります。", animType: "throw", simText: "重力で徐々に減速し、最高点で速度0になり、落下に転じます。" }
        ]
    },
    "c2": {
        chap: "力学", title: "2 色々な力・運動方程式",
        formulas: [
            { name: "重力", math: "$$W=mg$$", usage: "質量mの物体が地球に引っ張られる力を求める時。", reason: "質量が大きいほど強い力を受けます。", animType: "force_g", simText: "物体の中心から、常に地球の中心（下）に向かってはたらく力です。" },
            { name: "フックの法則（弾性力）", math: "$$F=kx$$", usage: "ばねの伸び・縮みxから、戻ろうとする力を求める時。", reason: "ばね定数k（固さ）と変形量に比例します。", animType: "spring", simText: "ばねが伸びた分だけ、引き戻す力（復元力）が大きくなります。" },
            { name: "最大摩擦力（静止）", math: "$$F_0=\\mu N$$", usage: "物体が滑り出す直前の、ギリギリ耐えている摩擦力。", reason: "静止摩擦係数μと、垂直抗力Nに比例します。", animType: "friction_s", simText: "引く力に耐えていますが、限界を超えると滑り出します。" },
            { name: "動摩擦力", math: "$$F'=\\mu' N$$", usage: "滑って動いている最中の摩擦力。", reason: "動摩擦係数μ'を使用します。速度には関係しません。", animType: "friction_d", simText: "動いている間、進行方向と逆向きに一定の力でブレーキをかけます。" },
            { name: "圧力", math: "$$P=\\frac{F}{S}$$", usage: "面を押す力の集中度合い。", reason: "力Fを面積Sで割ったもの。", animType: "pressure", simText: "同じ力でも、面積が狭いほど圧力は高くなります。" },
            { name: "水圧と浮力", math: "$$P=\\rho hg \\quad F=\\rho Vg$$", usage: "深さhの水圧と、体積Vの物体が受ける浮力。", reason: "浮力は「物体が押しのけた液体の重さ」に等しくなります。", animType: "buoyancy", simText: "水中で、周囲から受ける水圧の差が上向きの浮力となります。" },
            { name: "運動方程式", math: "$$ma=F$$", usage: "物体にはたらく合力Fから、生じる加速度aを計算する時。", reason: "力が大きいほど、また質量が小さいほど急加速します。", animType: "equation", simText: "加えた力の方向へ、質量に反比例した加速度が生じます。" }
        ]
    },
    "c3": {
        chap: "力学", title: "3 剛体のつりあい",
        formulas: [
            { name: "力のモーメント", math: "$$M=Fl$$", usage: "物体を「回転」させようとする能力を求める時。", reason: "力Fと、回転軸からの距離（うでの長さ）lの積です。", animType: "moment", simText: "支点から遠い位置を押すほど、回転させる効果が大きくなります。" },
            { name: "剛体のつりあい条件", math: "$$\\Sigma F=0 \\quad \\Sigma M=0$$", usage: "大きさのある物体（剛体）が静止し続ける条件。", reason: "「移動しない（合力が0）」かつ「回転しない（モーメントの和が0）」必要があります。", animType: "balance", simText: "左右の回転させようとする力が完全に釣り合って静止しています。" },
            { name: "重心の座標", math: "$$x_G=\\frac{m_1x_1+m_2x_2+\\dots}{m_1+m_2+\\dots}$$", usage: "複数の物体が合わさった全体の重心位置。", reason: "質量の重み付き平均をとることで求められます。", animType: "center_mass", simText: "全体のバランスがとれる一点（重心）を求めます。" }
        ]
    },
    "c4": {
        chap: "力学", title: "4 仕事とエネルギー",
        formulas: [
            { name: "仕事", math: "$$W=Fx\\cos\\theta$$", usage: "力が物体を移動させた効果(W)。", reason: "移動方向と同じ向きの力の成分だけが仕事をします。", animType: "work", simText: "物体を押して移動させた分だけ、物体にエネルギーを与えます。" },
            { name: "仕事率", math: "$$P=\\frac{W}{t}$$", usage: "1秒間あたりにする仕事。", reason: "仕事Wを時間tで割ったもの（パワー）。", animType: "power", simText: "同じ仕事でも、短時間で終わらせる方が仕事率は高くなります。" },
            { name: "運動エネルギー", math: "$$K=\\frac{1}{2}mv^2$$", usage: "速さvで動く物体が持つエネルギー。", reason: "運動方程式から仕事を積分することで導かれます。", animType: "k_energy", simText: "速度が2倍になれば、運動エネルギーは4倍になります。" },
            { name: "重力による位置エネルギー", math: "$$U=mgh$$", usage: "高さhにある物体が持つエネルギー。", reason: "基準面まで落下する間に重力がする仕事mghに等しいです。", animType: "p_energy", simText: "高い位置にあるほど、落下した時に大きな仕事ができます。" },
            { name: "弾性力による位置エネルギー", math: "$$U=\\frac{1}{2}kx^2$$", usage: "ばねが変形している時に蓄えられるエネルギー。", reason: "フックの法則(F=kx)のグラフの面積から求められます。", animType: "s_energy", simText: "ばねを縮めるほど、反発するためのエネルギーが蓄えられます。" },
            { name: "力学的エネルギー保存則", math: "$$\\frac{1}{2}mv^2+mgh+\\frac{1}{2}kx^2=\\text{一定}$$", usage: "摩擦や空気抵抗がないときの、速度や高さを求める時。", reason: "保存力だけが仕事をする場合、エネルギーの総和は変わりません。", animType: "pendulum", simText: "振り子運動。位置エネルギーと運動エネルギーが移り変わります。" }
        ]
    },
    "c5": {
        chap: "力学", title: "5 運動量と力積",
        formulas: [
            { name: "運動量", math: "$$p=mv$$", usage: "物体の「勢い」を表すベクトル量。", reason: "質量と速度の積。", animType: "momentum", simText: "重くて速い物体ほど、大きな運動量（勢い）を持ちます。" },
            { name: "力積と運動量の関係", math: "$$I=F\\Delta t \\quad mv'-mv=F\\Delta t$$", usage: "力を加えた後の速度の変化を求める時。", reason: "運動方程式(ma=F)の両辺に時間Δtを掛けたものです。", animType: "impulse", simText: "力を加えた時間（力積）の分だけ、物体の勢いが増加します。" },
            { name: "運動量保存則", math: "$$m_1v_1+m_2v_2=m_1v_1'+m_2v_2'$$", usage: "物体が衝突・合体・分裂する前後の速度を計算する時。", reason: "内力しか働かない場合、全体の運動量は変化しません。", animType: "collision", simText: "衝突しても、2つの物体の運動量の合計値は変わりません。" },
            { name: "反発係数", math: "$$e=-\\frac{v_1'-v_2'}{v_1-v_2}$$", usage: "衝突後の互いの遠ざかるスピードの割合。", reason: "e=1なら弾性衝突、0なら完全非弾性衝突（合体）です。", animType: "bounce", simText: "バウンド。eが1未満だと、衝突のたびにエネルギーを失います。" }
        ]
    },
    "c6": {
        chap: "力学", title: "6 円運動と慣性力",
        formulas: [
            { name: "角速度", math: "$$\\omega=\\frac{\\theta}{t}$$", usage: "1秒間に回転する角度。", reason: "角度を時間で割ります。", animType: "circular", simText: "一定のペースで角度が変化しながら回転します。" },
            { name: "線速度", math: "$$v=r\\omega$$", usage: "円周上を動く物体の実際の速さ。", reason: "弧の長さ(rθ)を時間で割ったもの。", animType: "circular_v", simText: "同じ角速度でも、外側（半径大）ほど実際の移動速度は速くなります。" },
            { name: "周期と回転数", math: "$$T=\\frac{2\\pi}{\\omega}=\\frac{2\\pi r}{v} \\quad n=\\frac{1}{T}$$", usage: "1周する時間と、1秒間に回転する回数。", reason: "1周の距離を速さで割ります。", animType: "circular", simText: "1周するのにかかる時間が周期です。" },
            { name: "向心加速度", math: "$$a=r\\omega^2=\\frac{v^2}{r}$$", usage: "円の中心に向かう加速度。", reason: "速度の「向き」を変え続けるために必要な加速度です。", animType: "circular_a", simText: "常に中心を向く加速度が、物体の軌道を曲げ続けます。" },
            { name: "向心力", math: "$$F=mr\\omega^2=m\\frac{v^2}{r}$$", usage: "円運動を維持する力（張力や摩擦力など）。", reason: "運動方程式(ma=F)にむけて向心加速度を代入したものです。", animType: "circular_f", simText: "ひもが引く力などが向心力となって円運動を維持します。" },
            { name: "慣性力と遠心力", math: "$$f=-ma \\quad F=mr\\omega^2$$", usage: "加速・回転している観測者から見た見かけの力。", reason: "観測者自身が加速しているため、逆向きに力が働いているように感じます。", animType: "centrifugal", simText: "一緒に回転する視点では、外側へ引っ張られる遠心力を感じます。" }
        ]
    },
    "c7": {
        chap: "力学", title: "7 単振動",
        formulas: [
            { name: "変位", math: "$$x=A\\sin\\omega t$$", usage: "単振動中の任意の位置。", reason: "等速円運動の正射影(影)の動きです。", animType: "harmonic_x", simText: "円運動を真横から見た影の動きが単振動になります。" },
            { name: "速度", math: "$$v=A\\omega\\cos\\omega t$$", usage: "単振動中の任意の速度。", reason: "変位を時間微分したもの。中心で最大になります。", animType: "harmonic_v", simText: "振動の中心を通過する瞬間が一番スピードが速いです。" },
            { name: "加速度", math: "$$a=-A\\omega^2\\sin\\omega t=-\\omega^2x$$", usage: "単振動中の任意の加速度。", reason: "速度を微分。常に変位と逆向き(中心向き)に働きます。", animType: "harmonic_a", simText: "端に行くほど、中心に戻ろうとする加速度が大きくなります。" },
            { name: "復元力", math: "$$F=-Kx$$", usage: "単振動の中心に引き戻す力。", reason: "変位に比例する逆向きの力が単振動の条件です。", animType: "harmonic_f", simText: "変位に比例した復元力が単振動を生み出します。" },
            { name: "周期（一般・ばね・単振り子）", math: "$$T=\\frac{2\\pi}{\\omega}=2\\pi\\sqrt{\\frac{m}{K}}=2\\pi\\sqrt{\\frac{l}{g}}$$", usage: "1往復にかかる時間。", reason: "運動方程式からωを求め、代入します。単振り子は質量に無関係です。", animType: "pendulum_t", simText: "糸の長さlだけで周期が決まります（振り子の等時性）。" }
        ]
    },
    "c8": {
        chap: "力学", title: "8 万有引力",
        formulas: [
            { name: "ケプラーの法則", math: "$$\\frac{1}{2}rv\\sin\\theta=\\text{定数} \\quad \\frac{T^2}{a^3}=\\text{定数}$$", usage: "面積速度一定(第2)と、公転周期の法則(第3)。", reason: "中心力のみが働く運動の性質です。", animType: "kepler", simText: "太陽に近いほど速く、遠いほどゆっくり移動し、面積速度を保ちます。" },
            { name: "万有引力の法則", math: "$$F=G\\frac{m_1m_2}{r^2}$$", usage: "星同士などすべての物体が引き合う力。", reason: "質量に比例し、距離の2乗に反比例します。", animType: "gravity", simText: "星と星の間に、互いを引き寄せる万有引力が働きます。" },
            { name: "万有引力による位置エネルギー", math: "$$U=-G\\frac{Mm}{r}$$", usage: "無限遠を基準(0)としたエネルギー。", reason: "引力に逆らって無限遠まで運ぶ仕事から導かれます。", animType: "orbit_u", simText: "地球から離れるほど位置エネルギーは増加（0に近づく）します。" },
            { name: "第一・第二宇宙速度", math: "$$v_1=\\sqrt{gR} \\quad v_2=\\sqrt{2gR}$$", usage: "地表スレスレを回る速度と、地球の引力を振り切る速度。", reason: "力のつり合いと、力学的エネルギー保存則から導出します。", animType: "escape", simText: "第二宇宙速度を超えると、地球の重力を振り切って宇宙へ飛び出します。" }
        ]
    },

    // --- 熱力学 ---
    "c9": {
        chap: "熱力学", title: "9 熱と温度",
        formulas: [
            { name: "絶対温度", math: "$$T=t+273$$", usage: "セルシウス温度(℃)から絶対温度(K)へ。", reason: "分子運動が停止する絶対零度を0Kとします。", animType: "temp", simText: "温度が高いほど分子の運動が激しくなります。" },
            { name: "熱量・熱容量・比熱", math: "$$Q=C\\Delta T \\quad Q=mc\\Delta T$$", usage: "物質の温度を上げるのに必要なエネルギー。", reason: "Cは物体全体、c(比熱)は1gあたりの温まりにくさです。", animType: "heat", simText: "熱（エネルギー）を与えると、分子の振動が激しくなります。" },
            { name: "熱量の保存", math: "$$Q_{\\text{失った}}=Q_{\\text{得た}}$$", usage: "高温と低温の物体を混ぜたときの最終温度。", reason: "外部に熱が逃げない限り、移動した熱の量は等しいです。", animType: "heat_mix", simText: "高温側から低温側へ熱が移動し、やがて同じ温度になります。" },
            { name: "潜熱", math: "$$Q=mL$$", usage: "状態変化に必要な熱量。", reason: "状態変化中は温度が上がらず、分子の結合を切るために熱が使われます。", animType: "latent", simText: "固体から液体になる時など、結合を切るために熱が消費されます。" }
        ]
    },
    "c10": {
        chap: "熱力学", title: "10 気体の法則と内部エネルギー",
        formulas: [
            { name: "ボイル・シャルルの法則", math: "$$\\frac{PV}{T}=\\text{一定}$$", usage: "気体の圧力、体積、温度のどれかが変化した時。", reason: "閉じ込められた一定量の気体で成り立ちます。", animType: "boyle", simText: "体積を圧縮すると圧力が高まり、温めると膨張しようとします。" },
            { name: "理想気体の状態方程式", math: "$$PV=nRT$$", usage: "物質量n(モル数)が含まれる時の状態を知る時。", reason: "気体の種類によらず、気体定数Rで結ばれます。", animType: "gas", simText: "気体の圧力P、体積V、温度T、分子数nの関係を示します。" },
            { name: "気体の分子運動論", math: "$$P=\\frac{Nmv^2}{3V} \\quad \\frac{1}{2}m\\overline{v^2}=\\frac{3}{2}kT$$", usage: "ミクロな分子の衝突からマクロな圧力・温度を導く時。", reason: "温度とは、気体分子の平均運動エネルギーそのものです。", animType: "kinetic", simText: "分子が壁にぶつかる衝撃の積み重ねが「圧力」になります。" },
            { name: "内部エネルギー", math: "$$U=\\frac{3}{2}nRT$$", usage: "単原子分子理想気体の持つ全エネルギー。", reason: "すべての分子の運動エネルギーの総和です。温度Tにのみ比例します。", animType: "internal_u", simText: "温度が高いほど、気体内部のエネルギー（分子の速さ）は大きいです。" },
            { name: "熱力学第一法則", math: "$$Q=\\Delta U+W$$", usage: "気体に熱を加えた時のエネルギー収支。", reason: "加えた熱は、温度上昇(ΔU)とピストンを押す仕事(W)に使われます。", animType: "piston", simText: "加えた熱で気体が膨張し、ピストンを押し上げて外部に仕事をします。" },
            { name: "モル比熱", math: "$$C_V=\\frac{3}{2}R \\quad C_P=\\frac{5}{2}R \\quad C_P=C_V+R$$", usage: "定積・定圧変化で気体を温める時に必要な熱量。", reason: "定圧変化では仕事Wをする分、余計に熱が必要になります。", animType: "molar", simText: "体積一定で温めるか、圧力を保って膨張させながら温めるかの違いです。" },
            { name: "熱機関の熱効率", math: "$$e=\\frac{W}{Q_{\\text{in}}}=\\frac{Q_{\\text{in}}-Q_{\\text{out}}}{Q_{\\text{in}}}$$", usage: "エンジンの性能。", reason: "吸収した熱のうち、どれだけを仕事に変えられたかの割合です。", animType: "engine", simText: "吸収した熱の一部を仕事に変え、残りは外部へ捨てられます。" }
        ]
    },

    // --- 波動 ---
    "c11": {
        chap: "波動", title: "11 波の性質",
        formulas: [
            { name: "波の基本公式", math: "$$v=f\\lambda \\quad f=\\frac{1}{T}$$", usage: "波の速さ、振動数、波長の関係。", reason: "1周期(T)の間に1波長(λ)進むため。", animType: "wave", simText: "1秒間にf回振動し、1回の振動でλ進みます。" },
            { name: "正弦波の式", math: "$$y=A\\sin2\\pi\\left(\\frac{t}{T}-\\frac{x}{\\lambda}\\right)$$", usage: "任意の位置x、時間tにおける媒質の変位y。", reason: "原点の振動が、時間 x/v だけ遅れて伝わることを表します。", animType: "wave_eq", simText: "各場所の媒質が、少しずつタイミングをずらして上下に振動します。" },
            { name: "波の干渉条件", math: "$$|l_1-l_2|=m\\lambda \\quad \\left(m+\\frac{1}{2}\\right)\\lambda$$", usage: "2つの波源からの波が強め合う・弱め合う場所。", reason: "経路差が波長の整数倍なら山と山が重なります。", animType: "interfere", simText: "2つの波が重なり、大きく揺れる場所と全く揺れない場所ができます。" },
            { name: "反射と屈折の法則", math: "$$\\frac{\\sin i}{\\sin r}=\\frac{v_1}{v_2}=\\frac{\\lambda_1}{\\lambda_2}=n_{12}$$", usage: "波が違う媒質へ進むときの曲がり方。", reason: "波の速さが変わるため、波面が曲がります。振動数は不変です。", animType: "refract", simText: "遅い媒質に入ると波長が縮み、進行方向が曲がります（屈折）。" }
        ]
    },
    "c12": {
        chap: "波動", title: "12 音波とドップラー効果",
        formulas: [
            { name: "音速と温度", math: "$$V=331.5+0.6t$$", usage: "気温t[℃]での空気中の音の速さ。", reason: "温度が高いほど分子運動が活発で、速く伝わります。", animType: "sound", simText: "音は空気の密度の濃淡（縦波）として伝わります。" },
            { name: "うなり", math: "$$f=|f_1-f_2|$$", usage: "振動数が違う2つの音が干渉して大小を繰り返す回数。", reason: "1秒間に振動数の差の回数だけ、位相が揃って強め合います。", animType: "beat", simText: "わずかに違う波が重なり、全体として大きくなったり小さくなったりします。" },
            { name: "弦・気柱の固有振動", math: "$$f_m=m\\frac{v}{2l} \\text{ (開)} \\quad f_m=m\\frac{v}{4l} \\text{ (閉)}$$", usage: "楽器が発する特定の音の高さ。", reason: "両端の固定端・自由端の条件を満たす定常波しか存在できません。", animType: "standing", simText: "管や弦の中で反射した波が重なり、定常波を作ります。" },
            { name: "ドップラー効果", math: "$$f'=\\frac{V-v_o}{V-v_s}f$$", usage: "動く音源や観測者による音の高さの変化。", reason: "音源が動くと波長が縮み、観測者が動くと波の受け取り回数が変わります。", animType: "doppler", simText: "音源の進行方向は波が詰まって波長が短くなり、高い音になります。" }
        ]
    },
    "c13": {
        chap: "波動", title: "13 光波と干渉",
        formulas: [
            { name: "絶対屈折率", math: "$$n=\\frac{c}{v}$$", usage: "真空中に対する、その物質の光の進みにくさ。", reason: "光は真空中(c)が最速で、物質中では遅くなります。", animType: "refract_n", simText: "屈折率が大きいほど、光のスピードは遅くなります。" },
            { name: "全反射の臨界角", math: "$$\\sin i_0=\\frac{n_2}{n_1}$$", usage: "すべて反射してしまう限界の角度。", reason: "屈折角が90度になる条件です。", animType: "reflect_all", simText: "ある角度を超えると、光は外へ出られずすべて反射します。" },
            { name: "レンズの写像公式・倍率", math: "$$\\frac{1}{a}+\\frac{1}{b}=\\frac{1}{f} \\quad m=\\left|\\frac{b}{a}\\right|$$", usage: "像ができる位置と大きさ。", reason: "凸・凹、実像・虚像で符号が変わります。", animType: "lens", simText: "レンズを通った光が屈折し、焦点を経由して像を結びます。" },
            { name: "ヤングの実験", math: "$$d\\frac{x}{l}=m\\lambda \\quad \\Delta x=\\frac{l\\lambda}{d}$$", usage: "2つのスリットを通った光が作る縞模様の間隔。", reason: "経路差が d(x/l) で近似でき、これが波長λの整数倍で強め合います。", animType: "young", simText: "2つのスリットから出た光が干渉し、スクリーンに縞模様を作ります。" },
            { name: "回折格子", math: "$$d\\sin\\theta=m\\lambda$$", usage: "多数のスリットで光が強め合う角度。", reason: "隣り合うスリットからの経路差が d sinθ になります。", animType: "diffraction", simText: "細かい溝によって光が回折し、特定の角度だけで強め合います。" },
            { name: "薄膜の干渉", math: "$$2nd\\cos r=\\left(m+\\frac{1}{2}\\right)\\lambda$$", usage: "シャボン玉が色づく条件。", reason: "往復の経路差 2nd と、反射時の位相反転(πのズレ)を考慮します。", animType: "film", simText: "膜の表面と裏面で反射した光が重なり合って干渉します。" }
        ]
    },

    // --- 電磁気 ---
    "c14": {
        chap: "電磁気", title: "14 電場と電位",
        formulas: [
            { name: "クーロンの法則", math: "$$F=k\\frac{q_1q_2}{r^2}$$", usage: "2つの電荷間の静電気力。", reason: "万有引力と同じく、距離の2乗に反比例します。", animType: "coulomb", simText: "同種は反発し、異種は引き合います。距離が近いほど力は強いです。" },
            { name: "電場と受ける力", math: "$$E=k\\frac{Q}{r^2} \\quad F=qE$$", usage: "空間の電気的な力場と、電荷が受ける力。", reason: "電場Eは「+1Cが受ける力」。そこにqを置くとqEの力を受けます。", animType: "efield", simText: "＋電荷から周囲へ、電気的な力場（電場）が広がっています。" },
            { name: "電位", math: "$$V=k\\frac{Q}{r} \\quad U=qV$$", usage: "電気的な高さ（位置エネルギー）。", reason: "+1Cあたりの位置エネルギーが電位Vです。", animType: "potential", simText: "電荷の周りには、電位の「山」や「谷」ができます。" },
            { name: "一様電場と仕事", math: "$$V=Ed \\quad W=qV$$", usage: "平行極板間の電圧や、電荷を動かすエネルギー。", reason: "電場(傾き)×距離で電圧(高さ)になります。", animType: "efield_uniform", simText: "平行な極板の間には、どこでも同じ強さの真っ直ぐな電場ができます。" }
        ]
    },
    "c15": {
        chap: "電磁気", title: "15 コンデンサー",
        formulas: [
            { name: "基本式と電気容量", math: "$$Q=CV \\quad C=\\varepsilon\\frac{S}{d}$$", usage: "溜まる電気量Qと、器の大きさC。", reason: "極板面積Sに比例し、間隔dに反比例します。", animType: "capacitor", simText: "2枚の極板に＋と－の電荷が引き合って蓄えられます。" },
            { name: "静電エネルギー", math: "$$U=\\frac{1}{2}QV=\\frac{1}{2}CV^2=\\frac{Q^2}{2C}$$", usage: "コンデンサーに蓄えられたエネルギー。", reason: "Q-Vグラフの面積（三角形）に相当します。", animType: "cap_energy", simText: "極板間に作られた電場の中に、エネルギーが蓄えられています。" },
            { name: "合成容量", math: "$$C_{\\text{並}}=C_1+C_2 \\quad \\frac{1}{C_{\\text{直}}}=\\frac{1}{C_1}+\\frac{1}{C_2}$$", usage: "複数繋いだときの全体の容量。", reason: "並列は極板面積が広がる効果、直列は間隔が広がる効果です。", animType: "cap_circuit", simText: "繋ぎ方によって、電荷の溜まりやすさが変化します。" }
        ]
    },
    "c16": {
        chap: "電磁気", title: "16 電流と直流回路",
        formulas: [
            { name: "電流の定義と微視的モデル", math: "$$I=\\frac{q}{t} \\quad I=envS$$", usage: "1秒間に通過する電気量と、電子の運動からの導出。", reason: "電流の正体は電子の流れです。", animType: "current", simText: "導線の中を大量の自由電子が一斉に移動することで電流になります。" },
            { name: "オームの法則と抵抗率", math: "$$V=RI \\quad R=\\rho\\frac{l}{S}$$", usage: "電流の流れにくさR。", reason: "抵抗率は材質により、長さlに比例、太さSに反比例します。", animType: "resistance", simText: "抵抗の中では、電子が原子に衝突して進みにくくなります。" },
            { name: "電力とジュール熱", math: "$$P=VI=I^2R \\quad Q=Pt$$", usage: "抵抗器が発熱するエネルギー。", reason: "電子が原子に衝突して失ったエネルギーが熱になります。", animType: "joule", simText: "電子の衝突によって金属が発熱（ジュール熱）します。" },
            { name: "キルヒホッフの法則", math: "$$\\Sigma I_{\\text{in}}=\\Sigma I_{\\text{out}} \\quad \\Sigma V=\\Sigma RI$$", usage: "複雑な回路を解く時。", reason: "電荷の保存とエネルギー(電位)の保存の法則です。", animType: "kirchhoff", simText: "分岐点で電流は分かれ、1周すると電位の上がり下がりは0になります。" }
        ]
    },
    "c17": {
        chap: "電磁気", title: "17 磁場とローレンツ力",
        formulas: [
            { name: "電流が作る磁場", math: "$$H=\\frac{I}{2\\pi r} \\quad H=\\frac{I}{2r} \\quad H=nI$$", usage: "直線、円形、ソレノイドコイルが作る磁場の強さ。", reason: "右ねじの法則で向きが決まります。", animType: "mag_field", simText: "電流の周りに、右ねじの向きに磁場が発生します。" },
            { name: "磁束密度", math: "$$B=\\mu H$$", usage: "実際の磁力の強さの指標。", reason: "真空中や鉄心など、物質によって磁束の通りやすさ(μ)が違います。", animType: "mag_flux", simText: "透磁率の高い鉄心を入れると、磁力線が密集して強くなります。" },
            { name: "電磁力", math: "$$F=IBl\\sin\\theta$$", usage: "磁場中の電流が受ける力（モーターの原理）。", reason: "フレミングの左手の法則です。", animType: "ampere", simText: "磁場を横切る電流は、フレミング左手の法則に従う力を受けます。" },
            { name: "ローレンツ力", math: "$$F=qvB\\sin\\theta$$", usage: "磁場中を飛ぶ単体の電荷が受ける力。", reason: "電流の受ける力のミクロ版です。常に進行方向に垂直に働きます。", animType: "lorentz", simText: "磁場中を飛ぶ電子はローレンツ力を受け、円運動やらせん運動をします。" },
            { name: "円運動の半径", math: "$$r=\\frac{mv}{qB}$$", usage: "磁場に垂直に入射した電子の軌道。", reason: "向心力(mv²/r)＝ローレンツ力(qvB)のつり合いから。", animType: "lorentz_r", simText: "速くて重いほど大回りになり、磁場が強いほど小回りになります。" }
        ]
    },
    "c18": {
        chap: "電磁気", title: "18 電磁誘導",
        formulas: [
            { name: "磁束", math: "$$\\Phi=BS\\cos\\theta$$", usage: "面を貫く磁力線の総本数。", reason: "磁束密度と面積の積です。", animType: "flux", simText: "コイルの輪を貫く磁力線の数が「磁束」です。" },
            { name: "ファラデーの電磁誘導の法則", math: "$$V=-N\\frac{\\Delta\\Phi}{\\Delta t}$$", usage: "コイルを貫く磁束が変化した時の電圧。", reason: "マイナスは「変化を打ち消す向き」を意味します。", animType: "induction", simText: "磁石を近づけると、コイルがそれを邪魔する向きに磁場を作ります。" },
            { name: "導体棒の誘導起電力", math: "$$V=vBl$$", usage: "磁場を横切る金属棒に生じる電圧。", reason: "中の自由電子がローレンツ力を受けて偏るためです。", animType: "rod", simText: "磁場を横切る棒の中の電子が力を受け、棒自体が電池になります。" },
            { name: "自己誘導とエネルギー", math: "$$V=-L\\frac{\\Delta I}{\\Delta t} \\quad U=\\frac{1}{2}LI^2$$", usage: "自分の電流変化で自分に逆起電力を生む現象。", reason: "コイルは電流の変化を嫌う性質(L)を持ちます。", animType: "self_ind", simText: "コイルは電流が急に増えるのも減るのも嫌がって抵抗します。" }
        ]
    },
    "c19": {
        chap: "電磁気", title: "19 交流と電磁波",
        formulas: [
            { name: "交流電圧と実効値", math: "$$V=V_0\\sin\\omega t \\quad V_e=\\frac{V_0}{\\sqrt{2}}$$", usage: "コンセントの電圧と、直流換算の平均値。", reason: "コイルの回転により発生するためサインカーブになります。", animType: "ac_gen", simText: "発電機の中でコイルが回転することで、波のような電圧が生まれます。" },
            { name: "リアクタンス", math: "$$X_L=\\omega L \\quad X_C=\\frac{1}{\\omega C}$$", usage: "コイルとコンデンサーの交流に対する抵抗。", reason: "コイルは高周波を通しにくく、コンデンサーは通しやすいです。", animType: "reactance", simText: "周波数によって、コイルとコンデンサーの電流の通しやすさが変わります。" },
            { name: "インピーダンス", math: "$$Z=\\sqrt{R^2+\\left(\\omega L-\\frac{1}{\\omega C}\\right)^2}$$", usage: "RLC直列回路の全体の抵抗値。", reason: "電圧と電流の位相のズレを三平方の定理で合成します。", animType: "impedance", simText: "抵抗・コイル・コンデンサーを合わせた全体の電流の流れにくさです。" },
            { name: "共振周波数", math: "$$f_0=\\frac{1}{2\\pi\\sqrt{LC}}$$", usage: "回路に最も電流が流れやすくなる周波数。", reason: "ωL = 1/ωC となり、リアクタンスが打ち消し合う条件です。", animType: "resonance", simText: "特定の周波数の時だけ、コイルとコンデンサーの抵抗が打ち消し合います。" }
        ]
    },

    // --- 原子 ---
    "c20": {
        chap: "原子", title: "20 粒子性と波動性",
        formulas: [
            { name: "光子のエネルギーと運動量", math: "$$E=h\\nu=h\\frac{c}{\\lambda} \\quad p=\\frac{h}{\\lambda}$$", usage: "光を「粒」と考えたときのエネルギーと勢い。", reason: "プランク定数hを介して、波の性質と粒の性質が結びつきます。", animType: "photon", simText: "光は波でありながら、エネルギーの塊（粒）としての性質も持ちます。" },
            { name: "光電方程式", math: "$$K_{\\max}=h\\nu-W$$", usage: "光を当てて飛び出した電子の運動エネルギー。", reason: "もらったエネルギー(hν)から、金属から脱出する仕事関数(W)を引いた残りです。", animType: "photoelectric", simText: "光の粒が衝突し、金属から電子を弾き飛ばします。" },
            { name: "限界波長と阻止電圧", math: "$$\\lambda_0=\\frac{hc}{W} \\quad eV_0=K_{\\max}$$", usage: "電子が飛び出すギリギリの条件。", reason: "エネルギー保存則に基づきます。", animType: "stop_v", simText: "逆向きに電圧をかけて、飛び出した電子を無理やり止めます。" },
            { name: "物質波（ド・ブロイ波）", math: "$$\\lambda=\\frac{h}{p}=\\frac{h}{mv}$$", usage: "電子などの「粒」が持つ「波」としての波長。", reason: "運動量が大きいほど波長は短くなります。", animType: "matter_wave", simText: "飛んでいる電子も、実は波のように揺れながら進んでいます。" },
            { name: "X線の最短波長", math: "$$eV=h\\frac{c}{\\lambda_0}$$", usage: "電子を加速して金属に当てた時に出るX線。", reason: "電子の運動エネルギー(eV)がすべて1個のX線光子に変わった時です。", animType: "xray", simText: "高速の電子が金属に衝突して急ブレーキをかけられ、X線が出ます。" }
        ]
    },
    "c21": {
        chap: "原子", title: "21 原子の構造",
        formulas: [
            { name: "量子条件", math: "$$mvr=n\\frac{h}{2\\pi} \\quad (2\\pi r=n\\lambda)$$", usage: "電子が光を出さずに安定して回れる特定の軌道。", reason: "電子の波（物質波）が軌道上で綺麗に繋がる（定常波になる）ためです。", animType: "bohr_orbit", simText: "電子の波がぴったり1周で繋がる特定の軌道だけが存在を許されます。" },
            { name: "振動数条件", math: "$$h\\nu=E_n-E_{m}$$", usage: "高い軌道から低い軌道へ移る時に放出される光。", reason: "軌道のエネルギー差が、1個の光子として放出（または吸収）されます。", animType: "bohr_jump", simText: "電子が軌道をジャンプする時、エネルギーの差額が光となって放出されます。" },
            { name: "水素原子のエネルギー準位", math: "$$E_n=-\\frac{13.6}{n^2} \\text{ [eV]}$$", usage: "n番目の軌道にある電子の持つ全エネルギー。", reason: "クーロン力による円運動の方程式と量子条件を連立して解いた結果です。", animType: "energy_level", simText: "外側の軌道ほどエネルギーが高く（0に近く）なります。" }
        ]
    },
    "c22": {
        chap: "原子", title: "22 原子核と放射線",
        formulas: [
            { name: "質量欠損", math: "$$\\Delta m=Zm_p+(A-Z)m_n-M$$", usage: "部品（陽子・中性子）の和と実際の核の質量の差。", reason: "結合する際に質量の一部が失われます。", animType: "mass_defect", simText: "陽子と中性子がくっついて原子核になる時、ほんの少し軽くなります。" },
            { name: "結合エネルギー", math: "$$E=\\Delta mc^2$$", usage: "原子核をバラバラにするのに必要なエネルギー。", reason: "アインシュタインの式。失われた質量が光速の2乗を掛けてエネルギーに変わっています。", animType: "mc2", simText: "失われたわずかな質量が、莫大なエネルギーに変換されています。" },
            { name: "半減期", math: "$$N=N_0\\left(\\frac{1}{2}\\right)^{\\frac{t}{T}}$$", usage: "時間tの後に残っている放射性同位体の数。", reason: "半減期Tごとに数が半分になるため、指数関数になります。", animType: "half_life", simText: "時間が経つごとに、元の原子核が半分ずつ減っていきます。" },
            { name: "崩壊の種類", math: "$\\alpha$崩壊: $\\text{He}$の核<br>$\\beta$崩壊: 電子<br>$\\gamma$崩壊: 電磁波", usage: "放射線を出した後の原子核の変化。", reason: "質量数と電荷（原子番号）の保存則が成り立ちます。", animType: "decay", simText: "不安定な原子核が、α粒子（ヘリウムの核）などを放出して崩壊します。" }
        ]
    }
};
