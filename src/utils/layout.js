const RADIUS = 15

// Dispone N moduli su un cerchio di raggio fisso, equidistanti tra loro.
export function getCircularPosition(index, total, radius = RADIUS) {
  const angle = (index / total) * Math.PI * 2
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  return [x, 0, z]
}

export const GRID_RADIUS = RADIUS
