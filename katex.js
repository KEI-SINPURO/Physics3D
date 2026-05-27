// ============================================================================
// KaTeX / 数式・記号レンダリング補助スクリプト
// ============================================================================
const MathRenderer = {
    // プレーンテキストの記号をきれいなラテン・ギリシャ文字風に変換する簡易書体ラッパー
    formatSymbol(symbol) {
        if (!symbol) return '';
        // 添え字（例: v0 -> v₀, m1 -> m₁）を綺麗に変換
        let formatted = symbol
            .replace('0', '₀')
            .replace('1', '₁')
            .replace('2', '₂')
            .replace('theta', 'θ')
            .replace('omega', 'ω');
        return formatted;
    },

    // 単位の表記をJIS/国際標準準拠のスタイルに整形
    formatUnit(unit) {
        if (!unit) return '';
        // 立方根や累乗の表記補助
        return unit.replace('m/s2', 'm/s²');
    }
};

// グローバルにエクスポート
window.MathRenderer = MathRenderer;
