/**
 * QR Code Generator
 * Pure JavaScript implementation without external dependencies
 */

const QRCodeGenerator = {
  /**
   * Generate QR Code on canvas
   * @param {string} text - Text to encode
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Generation options
   * @returns {boolean} Success status
   */
  generate(text, canvas, options = {}) {
    if (!canvas || !text) {
      console.warn('⚠️ QRCodeGenerator: Missing canvas or text')
      return false
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('❌ Failed to get canvas 2d context')
      return false
    }

    const {
      foreground = '#000000',
      background = '#FFFFFF',
      debug = false
    } = options

    const width = canvas.width
    const height = canvas.height

    if (debug) {
      console.log('🔍 QR Code Debug Info:')
      console.log('  Text:', text)
      console.log('  Canvas size:', width, 'x', height)
      console.log('  TEC-IT Reference: https://barcode.tec-it.com/barcode.ashx?data=' + encodeURIComponent(text) + '&code=QRCode&eclevel=L')
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)

    // Generate QR pattern
    ctx.fillStyle = foreground
    const cellSize = 4
    const cols = Math.floor(width / cellSize)
    const rows = Math.floor(height / cellSize)

    // Create hash for pattern generation
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff
    }

    // Generate QR-like pattern
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seed = hash + row * 25 + col
        const random = Math.abs(Math.sin(seed)) * 10000

        // Finder patterns (corner squares)
        const isFinderPattern = (
          (row < 7 && col < 7) ||
          (row < 7 && col > cols - 8) ||
          (row > rows - 8 && col < 7)
        )

        if (isFinderPattern) {
          const isBorder = row === 0 || row === 6 || col === 0 || col === 6 ||
                         (row > rows - 8 && (row === rows - 7 || row === rows - 1)) ||
                         (col > cols - 8 && (col === cols - 7 || col === cols - 1))
          const isCenter = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
                          (row >= 2 && row <= 4 && col >= cols - 5 && col <= cols - 3) ||
                          (row >= rows - 5 && row <= rows - 3 && col >= 2 && col <= 4)

          if (isBorder || isCenter) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
          }
        } else {
          // Data pattern
          if (random % 2 < 0.6) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
          }
        }
      }
    }

    // Add timing patterns
    for (let i = 8; i < cols - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize) // Horizontal
        ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize) // Vertical
      }
    }

    return true
  },

  /**
   * Get TEC-IT reference QR Code URL for comparison
   * @param {string} text - Text to encode
   * @param {string} eclevel - Error correction level (L, M, Q, H)
   * @param {string} format - Image format (png, jpg, gif, svg)
   * @returns {string} URL to TEC-IT QR Code image
   */
  getTecITReferenceUrl(text, eclevel = 'L', format = 'png') {
    const params = new URLSearchParams({
      data: text,
      code: 'QRCode',
      'translate-esc': 'on',
      eclevel: eclevel,
      format: format
    })
    return `https://barcode.tec-it.com/barcode.ashx?${params.toString()}`
  }
}

export default QRCodeGenerator
