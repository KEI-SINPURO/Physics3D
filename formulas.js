// ============================================================================
// 物理公式100選 データベース (完全網羅版)
// ============================================================================
const PHYSICS_FORMULAS = [
    // -------------------
    // 1. 力学 (1〜35)
    // -------------------
    { id: 1, category: "力学", name: "等速直線運動の変位", formula: "x = vt", unit: "m", desc: "速度vで時間tに進む距離" },
    { id: 2, category: "力学", name: "等加速度直線運動 (速度)", formula: "v = v₀ + at", unit: "m/s", desc: "初速度v₀、加速度a、時間t後の速度" },
    { id: 3, category: "力学", name: "等加速度直線運動 (変位)", formula: "x = v₀t + (1/2)at²", unit: "m", desc: "時間tにおける変位" },
    { id: 4, category: "力学", name: "等加速度直線運動 (時間消去)", formula: "v² - v₀² = 2ax", unit: "-", desc: "時間tを含まない速度と変位の関係" },
    { id: 5, category: "力学", name: "自由落下 (速度)", formula: "v = gt", unit: "m/s", desc: "初速度0で落下した時間t後の速度" },
    { id: 6, category: "力学", name: "自由落下 (変位)", formula: "y = (1/2)gt²", unit: "m", desc: "初速度0で落下した時間t後の落下距離" },
    { id: 7, category: "力学", name: "鉛直投げ下ろし (変位)", formula: "y = v₀t + (1/2)gt²", unit: "m", desc: "初速度v₀で投げ下ろしたときの落下距離" },
    { id: 8, category: "力学", name: "鉛直投げ上げ (速度)", formula: "v = v₀ - gt", unit: "m/s", desc: "初速度v₀で上向きに投げたときの速度" },
    { id: 9, category: "力学", name: "鉛直投げ上げ (最高点)", formula: "h = v₀² / 2g", unit: "m", desc: "投げ上げ時の最高点の高さ" },
    { id: 10, category: "力学", name: "水平投射 (軌道の式)", formula: "y = (g / 2v₀²) x²", unit: "m", desc: "水平に初速度v₀で投げた物体の軌道" },
    { id: 11, category: "力学", name: "斜方投射 (最高点までの時間)", formula: "t = (v₀ sinθ) / g", unit: "s", desc: "仰角θで投げた物体が最高点に達する時間" },
    { id: 12, category: "力学", name: "フックの法則", formula: "F = kx", unit: "N", desc: "ばねの弾性力。kはばね定数、xは伸び縮み" },
    { id: 13, category: "力学", name: "運動方程式", formula: "ma = F", unit: "N", desc: "質量mの物体に力Fが働くと加速度aが生じる" },
    { id: 14, category: "力学", name: "最大静止摩擦力", formula: "f = μN", unit: "N", desc: "動き出す直前の摩擦力。μは静止摩擦係数" },
    { id: 15, category: "力学", name: "動摩擦力", formula: "f' = μ'N", unit: "N", desc: "運動中の摩擦力。μ'は動摩擦係数" },
    { id: 16, category: "力学", name: "圧力", formula: "p = F / S", unit: "Pa", desc: "面積Sに垂直な力Fが働くときの圧力" },
    { id: 17, category: "力学", name: "水圧", formula: "p = ρhg", unit: "Pa", desc: "深さhにおける流体の圧力。ρは密度" },
    { id: 18, category: "力学", name: "浮力 (アルキメデスの原理)", formula: "F = ρVg", unit: "N", desc: "流体中の物体が受ける浮力。Vは排除した体積" },
    { id: 19, category: "力学", name: "仕事", formula: "W = Fx cosθ", unit: "J", desc: "力Fの向きからθずれた方向にx移動させた仕事" },
    { id: 20, category: "力学", name: "仕事率", formula: "P = W / t = Fv", unit: "W", desc: "単位時間あたりの仕事" },
    { id: 21, category: "力学", name: "運動エネルギー", formula: "K = (1/2)mv²", unit: "J", desc: "質量m、速さvの物体が持つエネルギー" },
    { id: 22, category: "力学", name: "重力による位置エネルギー", formula: "U = mgh", unit: "J", desc: "基準面から高さhにある物体のエネルギー" },
    { id: 23, category: "力学", name: "弾性力による位置エネルギー", formula: "U = (1/2)kx²", unit: "J", desc: "ばねの伸び縮みxによるエネルギー" },
    { id: 24, category: "力学", name: "力学的エネルギー保存の法則", formula: "K + U = 一定", unit: "J", desc: "保存力のみが仕事をするとき力学的エネルギーは不変" },
    { id: 25, category: "力学", name: "運動量", formula: "p = mv", unit: "kg·m/s", desc: "質量と速度の積で表される運動の激しさ" },
    { id: 26, category: "力学", name: "力積と運動量の変化", formula: "mv' - mv = FΔt", unit: "N·s", desc: "受けた力積(FΔt)は運動量の変化に等しい" },
    { id: 27, category: "力学", name: "反発係数 (はねかえり係数)", formula: "e = - (v₁' - v₂') / (v₁ - v₂)", unit: "-", desc: "衝突前後の相対速度の比" },
    { id: 28, category: "力学", name: "角速度", formula: "ω = Δθ / Δt = 2π / T", unit: "rad/s", desc: "円運動における単位時間あたりの回転角" },
    { id: 29, category: "力学", name: "円運動の速さ", formula: "v = rω", unit: "m/s", desc: "半径r、角速度ωの円運動の線速度" },
    { id: 30, category: "力学", name: "向心加速度", formula: "a = rω² = v² / r", unit: "m/s²", desc: "円運動で常に中心に向かう加速度" },
    { id: 31, category: "力学", name: "向心力", formula: "F = mrω² = m(v² / r)", unit: "N", desc: "円運動を維持するための中心に向かう力" },
    { id: 32, category: "力学", name: "単振動の復元力", formula: "F = -Kx", unit: "N", desc: "変位xに比例し、常に振動の中心へ向かう力" },
    { id: 33, category: "力学", name: "単振動の周期", formula: "T = 2π√(m/K)", unit: "s", desc: "ばね振り子などの往復運動の周期" },
    { id: 34, category: "力学", name: "単振り子の周期", formula: "T = 2π√(l/g)", unit: "s", desc: "長さlの糸による振り子の微小振動の周期" },
    { id: 35, category: "力学", name: "万有引力の法則", formula: "F = G(m₁m₂ / r²)", unit: "N", desc: "質量を持つ2物体間に働く引力" },

    // -------------------
    // 2. 熱力学 (36〜50)
    // -------------------
    { id: 36, category: "熱力学", name: "熱容量と熱量", formula: "Q = CΔT", unit: "J", desc: "熱容量Cの物体の温度をΔT上げる熱量" },
    { id: 37, category: "熱力学", name: "比熱と熱量", formula: "Q = mcΔT", unit: "J", desc: "質量m、比熱cの物体の温度をΔT上げる熱量" },
    { id: 38, category: "熱力学", name: "潜熱", formula: "Q = mL", unit: "J", desc: "質量mの物質が状態変化するのに必要な熱量。Lは融解熱や蒸発熱" },
    { id: 39, category: "熱力学", name: "熱膨張 (線膨張)", formula: "l = l₀(1 + αt)", unit: "m", desc: "温度t上昇時の長さ。αは線膨張率" },
    { id: 40, category: "熱力学", name: "ボイルの法則", formula: "pV = 一定", unit: "-", desc: "温度一定のとき、一定量の気体の体積は圧力に反比例" },
    { id: 41, category: "熱力学", name: "シャルルの法則", formula: "V / T = 一定", unit: "-", desc: "圧力一定のとき、一定量の気体の体積は絶対温度に比例" },
    { id: 42, category: "熱力学", name: "ボイル・シャルルの法則", formula: "pV / T = 一定", unit: "-", desc: "一定量の理想気体において成り立つ関係" },
    { id: 43, category: "熱力学", name: "理想気体の状態方程式", formula: "pV = nRT", unit: "-", desc: "物質量n、気体定数Rを含む状態方程式" },
    { id: 44, category: "熱力学", name: "気体分子の平均運動エネルギー", formula: "E = (3/2)kT", unit: "J", desc: "分子1個あたりの熱運動エネルギー。kはボルツマン定数" },
    { id: 45, category: "熱力学", name: "気体の二乗平均速度", formula: "v_rms = √(3RT / M)", unit: "m/s", desc: "モル質量Mの気体分子の二乗平均速度" },
    { id: 46, category: "熱力学", name: "単原子分子理想気体の内部エネルギー", formula: "U = (3/2)nRT", unit: "J", desc: "単原子分子気体全体の内部エネルギー" },
    { id: 47, category: "熱力学", name: "熱力学第一法則", formula: "ΔU = Q + W", unit: "J", desc: "内部エネルギー変化は吸収熱Qとされた仕事Wの和" },
    { id: 48, category: "熱力学", name: "気体が外部にする仕事", formula: "W' = pΔV", unit: "J", desc: "定圧変化で気体が膨張する際に外部にする仕事" },
    { id: 49, category: "熱力学", name: "マイヤーの関係式", formula: "C_p - C_v = R", unit: "J/(mol·K)", desc: "定圧モル比熱と定積モル比熱の差は気体定数" },
    { id: 50, category: "熱力学", name: "熱機関の熱効率", formula: "e = W' / Q_in = (Q_in - Q_out) / Q_in", unit: "-", desc: "吸収した熱量のうち仕事に変換された割合" },

    // -------------------
    // 3. 波動 (51〜70)
    // -------------------
    { id: 51, category: "波動", name: "波の基本式", formula: "v = fλ", unit: "m/s", desc: "波の速さv、振動数f、波長λの関係" },
    { id: 52, category: "波動", name: "振動数と周期", formula: "f = 1 / T", unit: "Hz", desc: "1秒間あたりの振動回数と、1回の振動にかかる時間の関係" },
    { id: 53, category: "波動", name: "正弦波の式", formula: "y = A sin{2π(t/T - x/λ)}", unit: "m", desc: "x軸正の向きに進む振幅Aの波の変位" },
    { id: 54, category: "波動", name: "うなりの振動数", formula: "f = |f₁ - f₂|", unit: "Hz", desc: "振動数のわずかに異なる2音による1秒間のうなりの回数" },
    { id: 55, category: "波動", name: "弦を伝わる波の速さ", formula: "v = √(S / ρ)", unit: "m/s", desc: "張力S、線密度ρの弦を伝わる横波の速さ" },
    { id: 56, category: "波動", name: "弦の固有振動数", formula: "f_m = (m/2L)√(S / ρ)", unit: "Hz", desc: "長さLの弦におけるm倍振動の振動数" },
    { id: 57, category: "波動", name: "閉管の固有振動数", formula: "f_m = m(V / 4L)", unit: "Hz", desc: "長さLの閉管における固有振動数（mは奇数）" },
    { id: 58, category: "波動", name: "開管の固有振動数", formula: "f_m = m(V / 2L)", unit: "Hz", desc: "長さLの開管における固有振動数（mは整数）" },
    { id: 59, category: "波動", name: "音速 (気温による変化)", formula: "V = 331.5 + 0.6t", unit: "m/s", desc: "摂氏t度における空気中の音の速さ" },
    { id: 60, category: "波動", name: "ドップラー効果", formula: "f' = f(V - v_o)/(V - v_s)", unit: "Hz", desc: "音源速度v_s、観測者速度v_oのときの観測振動数" },
    { id: 61, category: "波動", name: "反射の法則", formula: "θ₁ = θ₁'", unit: "rad", desc: "入射角と反射角は等しい" },
    { id: 62, category: "波動", name: "屈折の法則", formula: "sinθ₁ / sinθ₂ = v₁ / v₂ = n₁₂", unit: "-", desc: "媒質1から2へ進む波の入射角θ₁と屈折角θ₂の関係" },
    { id: 63, category: "波動", name: "絶対屈折率と相対屈折率", formula: "n₁₂ = n₂ / n₁", unit: "-", desc: "媒質1に対する媒質2の相対屈折率" },
    { id: 64, category: "波動", name: "全反射の臨界角", formula: "sinθ_c = 1 / n", unit: "-", desc: "屈折率nの媒質から空気へ進むときの全反射する最小の角" },
    { id: 65, category: "波動", name: "ヤングの実験 (明線)", formula: "dx / l = mλ", unit: "m", desc: "スリット間隔d、距離lのときのスクリーン上の明線の位置x" },
    { id: 66, category: "波動", name: "回折格子 (明線)", formula: "d sinθ = mλ", unit: "m", desc: "格子定数dの回折格子で明線ができる方向" },
    { id: 67, category: "波動", name: "くさび形空気層の干渉 (明線)", formula: "2d = (m + 1/2)λ", unit: "m", desc: "厚さdの空気層での反射光による干渉条件" },
    { id: 68, category: "波動", name: "ニュートンリング (明環)", formula: "r² / R = (m + 1/2)λ", unit: "m", desc: "曲率半径Rのレンズによる明環の半径r" },
    { id: 69, category: "波動", name: "レンズの公式", formula: "1/a + 1/b = 1/f", unit: "-", desc: "物体までの距離a、像までの距離b、焦点距離f" },
    { id: 70, category: "波動", name: "レンズの倍率", formula: "m = |b / a|", unit: "-", desc: "実物の大きさに対する像の大きさの比" },

    // -------------------
    // 4. 電磁気 (71〜90)
    // -------------------
    { id: 71, category: "電磁気", name: "クーロンの法則", formula: "F = k(q₁q₂ / r²)", unit: "N", desc: "距離r離れた点電荷q₁,q₂間に働く静電気力" },
    { id: 72, category: "電磁気", name: "電場の強さ", formula: "E = F / q", unit: "N/C", desc: "電荷qが受ける静電気力から定義される電場" },
    { id: 73, category: "電磁気", name: "点電荷のつくる電場", formula: "E = k(q / r²)", unit: "N/C", desc: "点電荷qから距離rの点の電場" },
    { id: 74, category: "電磁気", name: "電位", formula: "V = U / q", unit: "V", desc: "電荷qが持つ静電気力による位置エネルギーUに基づく電位" },
    { id: 75, category: "電磁気", name: "点電荷のつくる電位", formula: "V = k(q / r)", unit: "V", desc: "点電荷qから距離rの点の電位" },
    { id: 76, category: "電磁気", name: "一様な電場と電位差", formula: "V = Ed", unit: "V", desc: "一様な電場Eにおいて距離d離れた2点間の電位差" },
    { id: 77, category: "電磁気", name: "コンデンサーの基本式", formula: "Q = CV", unit: "C", desc: "電気容量C、電圧Vで蓄えられる電気量" },
    { id: 78, category: "電磁気", name: "平行平板コンデンサーの容量", formula: "C = ε(S / d)", unit: "F", desc: "極板面積S、間隔d、誘電率εの電気容量" },
    { id: 79, category: "電磁気", name: "静電エネルギー", formula: "U = (1/2)QV = (1/2)CV²", unit: "J", desc: "充電されたコンデンサーが持つエネルギー" },
    { id: 80, category: "電磁気", name: "オームの法則", formula: "V = RI", unit: "V", desc: "抵抗Rに電流Iが流れるときの電圧降下" },
    { id: 81, category: "電磁気", name: "抵抗率", formula: "R = ρ(l / S)", unit: "Ω", desc: "長さl、断面積Sの導線の抵抗値。ρは抵抗率" },
    { id: 82, category: "電磁気", name: "ジュール熱", formula: "Q = VIt = RI²t", unit: "J", desc: "時間tの間に抵抗で発生する熱量" },
    { id: 83, category: "電磁気", name: "直線電流が作る磁場", formula: "H = I / 2πr", unit: "A/m", desc: "無限に長い直線電流Iから距離rの点の磁場" },
    { id: 84, category: "電磁気", name: "円形電流が中心に作る磁場", formula: "H = I / 2r", unit: "A/m", desc: "半径rの円形電流の中心の磁場" },
    { id: 85, category: "電磁気", name: "ソレノイドの磁場", formula: "H = nI", unit: "A/m", desc: "単位長さあたりの巻き数nのソレノイド内部の磁場" },
    { id: 86, category: "電磁気", name: "磁束密度と磁束", formula: "Φ = BS = μHS", unit: "Wb", desc: "磁場H、透磁率μのときの磁束密度Bと、面積Sを貫く磁束" },
    { id: 87, category: "電磁気", name: "電磁力 (アンペール力)", formula: "F = IBl sinθ", unit: "N", desc: "磁束密度B中で長さlの電流Iが受ける力" },
    { id: 88, category: "電磁気", name: "ローレンツ力", formula: "F = qvB sinθ", unit: "N", desc: "磁束密度B中を速さvで動く電荷qが受ける力" },
    { id: 89, category: "電磁気", name: "ファラデーの電磁誘導の法則", formula: "V = -N(ΔΦ / Δt)", unit: "V", desc: "コイルを貫く磁束の変化による誘導起電力" },
    { id: 90, category: "電磁気", name: "自己誘導の起電力", formula: "V = -L(ΔI / Δt)", unit: "V", desc: "自己インダクタンスLのコイルにおける誘導起電力" },

    // -------------------
    // 5. 原子物理 (91〜100)
    // -------------------
    { id: 91, category: "原子", name: "光子のエネルギー", formula: "E = hν = hc / λ", unit: "J", desc: "振動数νの光子1個のエネルギー。hはプランク定数" },
    { id: 92, category: "原子", name: "光子の運動量", formula: "p = h / λ = hν / c", unit: "kg·m/s", desc: "波長λの光子の運動量" },
    { id: 93, category: "原子", name: "光電効果 (アインシュタインの関係式)", formula: "K_max = hν - W", unit: "J", desc: "飛び出す電子の最大運動エネルギー。Wは仕事関数" },
    { id: 94, category: "原子", name: "限界波長", formula: "λ_0 = hc / W", unit: "m", desc: "光電効果が起こる最大の波長" },
    { id: 95, category: "原子", name: "物質波 (ド・ブロイ波) の波長", formula: "λ = h / p = h / mv", unit: "m", desc: "運動量pで運動する粒子の波長" },
    { id: 96, category: "原子", name: "ブラッグ条件 (X線回折)", formula: "2d sinθ = nλ", unit: "m", desc: "格子面間隔dの結晶によるX線の強め合い条件" },
    { id: 97, category: "原子", name: "ボーアの量子条件", formula: "mvr = n(h / 2π)", unit: "-", desc: "電子が安定して軌道を回るための条件" },
    { id: 98, category: "原子", name: "質量エネルギーの等価性", formula: "E = mc²", unit: "J", desc: "質量mの物質が持つエネルギー。cは光速" },
    { id: 99, category: "原子", name: "質量欠損と結合エネルギー", formula: "ΔE = Δmc²", unit: "J", desc: "原子核形成時の質量欠損Δmに相当するエネルギー" },
    { id: 100, category: "原子", name: "半減期の式", formula: "N = N₀(1/2)^(t/T)", unit: "個", desc: "時間t後の放射性同位元素の数。Tは半減期" }
];
