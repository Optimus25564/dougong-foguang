// Mock canvas getContext for jsdom
HTMLCanvasElement.prototype.getContext = function (contextId) {
  if (contextId === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      lineWidth: 1,
      fillRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
    }
  }
  return null
}
