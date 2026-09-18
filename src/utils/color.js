// Converte uma cor hex (#RRGGBB ou #RGB) em rgba(r, g, b, alpha).
// Existe pra evitar depender de color-mix() do CSS, que só tem suporte a
// partir do Chrome 111 (mar/2023) — em navegadores mais antigos, o valor é
// descartado e o background fica sem cor nenhuma, sem nenhum fallback visual.
// rgba() funciona em qualquer navegador.
export function hexToRgba(hex, alpha = 1) {
    const clean = hex.replace('#', '')
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
    const bigint = parseInt(full, 16)

    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}