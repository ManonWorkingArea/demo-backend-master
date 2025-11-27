/**
 * Barcode Generator (Code 128)
 * Pure JavaScript implementation of Code 128 barcode standard
 * Supports variable length alphanumeric data
 */

const BarcodeGenerator = {
  // Code 128 encoding patterns (106 symbols + start/stop codes)
  code128Patterns: [
    '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
    '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
    '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
    '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
    '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
    '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
    '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
    '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
    '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
    '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
    '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
    '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
    '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
    '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
    '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
    '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
    '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
    '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
    '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
    '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
    '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
    '11010011100', '11000111010'
  ],

  /**
   * Get Code 128B value for a character
   * @param {string} char - Character to encode (ASCII 32-127)
   * @returns {number} Code value
   */
  getCode128BValue(char) {
    const code = char.charCodeAt(0)
    if (code >= 32 && code <= 127) {
      return code - 32
    }
    return 0
  },

  /**
   * Calculate Code 128 checksum
   * @param {Array<number>} values - Array of encoded values
   * @returns {number} Checksum value
   */
  calculateChecksum(values) {
    let sum = 104 // Start Code B
    values.forEach((value, index) => {
      sum += value * (index + 1)
    })
    return sum % 103
  },

  /**
   * Generate Code 128 Barcode on canvas
   * @param {string} text - Text to encode
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Generation options
   * @returns {boolean} Success status
   */
  generate(text, canvas, options = {}) {
    if (!canvas || !text) {
      console.warn('⚠️ BarcodeGenerator: Missing canvas or text')
      return false
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('❌ Failed to get canvas 2d context for barcode')
      return false
    }

    const {
      barWidth = 1,
      foreground = '#000000',
      background = '#FFFFFF',
      displayText = false,
      fontSize = 10,
      debug = false
    } = options

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)

    // Encode text to Code 128 values
    const values = []
    for (let i = 0; i < text.length; i++) {
      values.push(this.getCode128BValue(text[i]))
    }

    // Calculate checksum
    const checksum = this.calculateChecksum(values)

    if (debug) {
      console.log('🔍 Debug Info:')
      console.log('  Text:', text)
      console.log('  Values:', values)
      console.log('  Checksum:', checksum)
      console.log('  TEC-IT Reference: https://barcode.tec-it.com/barcode.ashx?data=' + encodeURIComponent(text) + '&code=Code128')
    }

    // Build barcode pattern
    let pattern = ''
    
    // Start Code B (104)
    pattern += this.code128Patterns[104]
    
    // Data characters
    values.forEach(value => {
      pattern += this.code128Patterns[value]
    })
    
    // Checksum
    pattern += this.code128Patterns[checksum]
    
    // Stop pattern (106)
    pattern += this.code128Patterns[106]

    // Calculate optimal bar width to fit canvas
    // Code 128 Standard: Quiet zone should be ≥10X (10 times module width)
    const totalModules = pattern.length
    const availableWidth = width * 0.9 // Reserve 5% on each side for quiet zones
    const moduleWidth = Math.max(barWidth, availableWidth / totalModules)
    const quietZone = moduleWidth * 10 // Quiet zone = 10X (Code 128 standard)

    // Draw barcode
    ctx.fillStyle = foreground
    let x = quietZone
    
    // Code 128 Standard: Height should be ≥15% of barcode length (min 6.5mm)
    // For display purposes, use most of canvas height minus text area
    const barHeight = displayText ? height - fontSize - 6 : height - 4
    const yOffset = 2

    // Draw each module (bar or space)
    // Code 128 pattern: alternates between bars and spaces
    // Pattern string contains widths (e.g., '11011001100')
    let isBar = true // Start with a bar
    
    for (let i = 0; i < pattern.length; i++) {
      const width = parseInt(pattern[i])
      const elementWidth = moduleWidth * width
      
      if (isBar && width > 0) {
        // Draw bar
        ctx.fillRect(x, yOffset, elementWidth, barHeight)
      }
      // Space: don't draw, just advance x
      
      x += elementWidth
      isBar = !isBar // Alternate between bar and space
    }

    // Display text below barcode if requested
    if (displayText) {
      ctx.fillStyle = foreground
      ctx.font = `${fontSize}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText(text, width / 2, height - 2)
    }

    if (debug) {
      console.log('📊 Code 128 generated:', text, '| Pattern length:', pattern.length, '| Module width:', moduleWidth.toFixed(2))
    }

    return true
  },

  /**
   * Get TEC-IT reference barcode URL for comparison
   * @param {string} text - Text to encode
   * @param {string} format - Image format (png, jpg, gif, svg)
   * @returns {string} URL to TEC-IT barcode image
   */
  getTecITReferenceUrl(text, format = 'png') {
    const params = new URLSearchParams({
      data: text,
      code: 'Code128',
      'translate-esc': 'on',
      format: format
    })
    return `https://barcode.tec-it.com/barcode.ashx?${params.toString()}`
  }
}

export default BarcodeGenerator
