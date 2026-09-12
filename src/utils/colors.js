const PALETTE = [
  '#4df3ff', // 01 cyan
  '#b967ff', // 02 purple
  '#ffb84d', // 03 amber
  '#ff5e8a', // 04 pink
  '#5dff9a', // 05 mint
  '#ffd84d', // 06 yellow
  '#4d8bff', // 07 blue
  '#ff8c4d', // 08 orange
  '#c8ff4d', // 09 lime
  '#ff4dd8', // 10 magenta
  '#4dffe1', // 11 teal
  '#a06bff', // 12 violet
]

export const LOCKED_COLOR = '#2a2f3d'

export function getModuleColor(module) {
  const index = parseInt(module.id, 10) - 1
  if (Number.isNaN(index)) return PALETTE[0]
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length]
}
