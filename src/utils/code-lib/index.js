/**
 * Code Generator Plugin Bundle
 * Combines QR Code and Barcode generators
 */

import QRCodeGenerator from './qrcode-generator'
import BarcodeGenerator from './barcode-generator'

export const CodeGenerator = {
  /**
   * Generate QR Code
   * @param {string} text - Text to encode
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Options
   */
  generateQRCode(text, canvas, options = {}) {
    return QRCodeGenerator.generate(text, canvas, {
      size: options.size || canvas.width,
      foreground: options.foreground || '#000000',
      background: options.background || '#FFFFFF',
      errorCorrection: options.errorCorrection || 'M'
    })
  },

  /**
   * Generate Barcode
   * @param {string} text - Text to encode
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Options
   */
  generateBarcode(text, canvas, options = {}) {
    return BarcodeGenerator.generate(text, canvas, {
      height: options.height || canvas.height,
      barWidth: options.barWidth || 2,
      foreground: options.foreground || '#000000',
      background: options.background || '#FFFFFF',
      displayText: options.displayText || false,
      fontSize: options.fontSize || 12
    })
  },

  /**
   * Quick generate both codes
   * @param {string} text - Text to encode
   * @param {HTMLCanvasElement} qrCanvas - QR Canvas
   * @param {HTMLCanvasElement} barcodeCanvas - Barcode Canvas
   */
  generateBoth(text, qrCanvas, barcodeCanvas) {
    const qrResult = this.generateQRCode(text, qrCanvas)
    const barcodeResult = this.generateBarcode(text, barcodeCanvas)
    return qrResult && barcodeResult
  },

  /**
   * Get TEC-IT reference URLs for comparison
   * @param {string} text - Text to encode
   * @returns {Object} URLs for QR Code and Barcode references
   */
  getTecITReferenceUrls(text) {
    return {
      qrcode: QRCodeGenerator.getTecITReferenceUrl(text),
      barcode: BarcodeGenerator.getTecITReferenceUrl(text)
    }
  }
}

// Export individual generators
export { QRCodeGenerator, BarcodeGenerator }

// Default export
export default CodeGenerator
