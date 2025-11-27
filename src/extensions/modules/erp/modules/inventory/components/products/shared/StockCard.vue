<template>
  <!-- Horizontal Ticket Style Stock Card -->
  <div class="w-full max-w-4xl h-full bg-white border border-dashed border-gray-400 font-mono text-sm stock-card relative flex flex-col" 
       ref="stockCardRef">
        
        <!-- Top Left Circle -->
        <div class="absolute top-4 left-4 w-8 h-8 border border-dashed border-gray-400 rounded-full bg-white z-10"></div>
        
        <!-- Main Content - Horizontal Layout -->
        <div class="p-4 relative flex-1 flex flex-col">
          <div class="grid grid-cols-12 gap-4 flex-1">
            
            <!-- Left Section - QR Code & Barcode -->
            <div class="col-span-3 flex flex-col items-center justify-center border-r border-dashed border-black pr-4 pt-8">
              <!-- QR Code -->
              <div class="border border-black p-2 mb-2">
                <canvas 
                  ref="qrCanvas" 
                  width="80" 
                  height="80"
                  class="block"
                ></canvas>
              </div>
              <div class="text-xs text-center mb-3 uppercase">
                <div>QR CODE</div>
                <div class="font-bold">{{ (product?.sku || product?.product_code || 'N/A').substring(0, 10) }}</div>
              </div>
              
              <!-- Barcode Section -->
              <div class="w-full">
                <canvas 
                  ref="barcodeCanvas" 
                  width="120" 
                  height="24"
                  class="block mx-auto border border-gray-300"
                ></canvas>
                <div class="text-xs text-center mt-1 font-mono">
                  {{ product?.sku || product?.product_code || 'N/A' }}
                </div>
              </div>
            </div>
            
            <!-- Center Section - Product Info -->
            <div class="col-span-6 px-4 flex flex-col justify-center">
              
              <!-- Company & Title -->
              <div class="text-center border-b border-dashed border-black pb-2 mb-3">
                <div class="text-base font-bold uppercase">{{ companyName || 'ABC COMPANY' }}</div>
                <div class="text-xs uppercase">STOCK CARD</div>
              </div>
              
              <!-- Product Name -->
              <div class="text-center mb-3">
                <div class="text-sm font-bold uppercase leading-tight">
                  {{ (product?.product_name || product?.name || 'PRODUCT NAME').substring(0, 40) }}
                </div>
                <div class="text-xs uppercase mt-1">{{ formatCategory(product?.category) }}</div>
              </div>
              
              <!-- Product Data Grid -->
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border-t border-dashed border-black pt-2">
                <div class="flex justify-between border-b border-dotted border-gray-400 py-1">
                  <span>SKU:</span>
                  <span class="font-bold">{{ product?.sku || product?.product_code || 'N/A' }}</span>
                </div>
                <div class="flex justify-between border-b border-dotted border-gray-400 py-1">
                  <span>CODE:</span>
                  <span class="font-bold">{{ product?.product_code || product?.id || 'N/A' }}</span>
                </div>
                <div class="flex justify-between border-b border-dotted border-gray-400 py-1">
                  <span>STOCK:</span>
                  <span class="font-bold">{{ formatNumber(currentStock) }} {{ product?.unit || 'PCS' }}</span>
                </div>
                <div class="flex justify-between border-b border-dotted border-gray-400 py-1">
                  <span>PRICE:</span>
                  <span class="font-bold">{{ formatCurrency(product?.unit_price) }}</span>
                </div>
                <div class="flex justify-between border-b border-dotted border-gray-400 py-1">
                  <span>AVAIL:</span>
                  <span class="font-bold">{{ formatNumber(currentBalance?.qty_available || currentStock) }}</span>
                </div>
                <div class="flex justify-between border-b border-dotted border-gray-400 py-1">
                  <span>RESV:</span>
                  <span class="font-bold">{{ formatNumber(reservedQuantity || currentBalance?.qty_reserved || 0) }}</span>
                </div>
              </div>
              
            </div>
            
            <!-- Right Section - Status & Info -->
            <div class="col-span-3 pl-4 border-l border-dashed border-black flex flex-col justify-center">
              
              <!-- Status -->
              <div class="text-center mb-3">
                <div class="text-xs uppercase mb-1">STATUS</div>
                <div class="text-lg font-bold">
                  {{ currentStock > 0 ? 'IN STOCK' : 'OUT OF STOCK' }}
                </div>
                <div class="text-xs mt-1">
                  {{ currentStock > 0 ? '●' : '○' }} ACTIVE
                </div>
              </div>
              
              <!-- Key Info -->
              <div class="text-xs border-t border-dashed border-black pt-2 space-y-1">
                <div class="flex justify-between">
                  <span>VALUE:</span>
                  <span class="font-bold">{{ formatCurrency(currentBalance?.total_cost_value || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>AVG COST:</span>
                  <span class="font-bold">{{ formatCurrency(currentBalance?.weighted_avg_cost || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>LOCATIONS:</span>
                  <span class="font-bold">{{ locationData?.length || currentBalance?.total_locations || 0 }}</span>
                </div>
              </div>
            
            </div>
            
          </div>
        </div>
        
          <!-- Footer -->
          <div class="border-t border-dashed border-black mt-3 p-2 text-xs text-center">
            <div class="flex justify-between items-center">
              <span>GENERATED: {{ formatDateTime(new Date()) }}</span>
              <span class="font-bold">ID: {{ product?.id || 'N/A' }}</span>
            </div>
          </div>
        
      </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'

export default {
  name: 'StockCard',
  props: {
    product: {
      type: Object,
      required: true
    },
    currentStock: {
      type: Number,
      default: 0
    },
    companyName: {
      type: String,
      default: 'บริษัท ABC จำกัด'
    },
    currentBalance: {
      type: Object,
      default: () => ({})
    },
    locationData: {
      type: Array,
      default: () => []
    },
    reservedQuantity: {
      type: Number,
      default: 0
    },
    showControls: {
      type: Boolean,
      default: false
    },
    showInfo: {
      type: Boolean,
      default: false
    }
  },
  emits: ['qr-generated', 'card-printed', 'card-downloaded', 'data-copied'],
  setup(props, { emit }) {
    const stockCardRef = ref(null)
    const qrCanvas = ref(null)
    const barcodeCanvas = ref(null)
    
    // Formatting functions
    const formatNumber = (number) => {
      return new Intl.NumberFormat('th-TH').format(number || 0)
    }
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(amount || 0)
    }
    
    const formatDateTime = (date) => {
      if (!date) return 'ไม่ระบุ'
      
      try {
        return new Date(date).toLocaleString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return 'ไม่ระบุ'
      }
    }
    
    const formatCategory = (category) => {
      const categoryLabels = {
        'electronics': 'อิเล็กทรอนิกส์',
        'clothing': 'เสื้อผ้าและแฟชั่น',
        'food': 'อาหารและเครื่องดื่ม',
        'books': 'หนังสือและสื่อการเรียน',
        'home': 'บ้านและสวน',
        'beauty': 'ความงามและสุขภาพ',
        'sports': 'กีฬาและออกกำลังกาย',
        'automotive': 'ยานยนต์',
        'health': 'การแพทย์และสุขภาพ',
        'general': 'ทั่วไป'
      }
      return categoryLabels[category] || category || 'ทั่วไป'
    }
    
    
    // QR Code and Stock Card Methods
    const getQRCodeData = () => {
      if (!props.product) return ''
      
      const qrData = {
        sku: props.product.sku || props.product.product_code || '',
        name: props.product.product_name || props.product.name || '',
        code: props.product.product_code || props.product.id || '',
        category: props.product.category || '',
        stock: props.currentStock,
        price: props.product.unit_price || 0,
        unit: props.product.unit || 'ชิ้น',
        timestamp: new Date().toISOString()
      }
      
      return JSON.stringify(qrData)
    }
    
    // Simple Barcode Generator (Code 128 style)
    const generateBarcode = (text, canvas) => {
      if (!canvas || !text) return
      
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      
      // Generate barcode pattern
      ctx.fillStyle = '#000000'
      
      // Create encoding pattern for each character
      const patterns = {
        '0': [1,1,0,0,1,0,0],
        '1': [0,1,1,0,0,1,0],
        '2': [0,1,0,0,1,1,0],
        '3': [1,0,0,1,0,0,1],
        '4': [0,0,1,1,0,1,0],
        '5': [1,0,0,0,1,1,0],
        '6': [0,1,0,1,0,0,1],
        '7': [0,0,1,0,1,0,1],
        '8': [1,0,1,0,0,0,1],
        '9': [0,1,1,1,0,0,0],
        'A': [1,0,0,0,0,1,1],
        'B': [0,0,1,0,0,1,1],
        'C': [1,1,0,1,0,0,0],
        'default': [1,0,1,0,1,0,1]
      }
      
      const barWidth = 1.5
      const padding = 8
      let currentX = padding
      
      // Start pattern (11010010000)
      const startPattern = [1,1,0,1,0,0,1,0,0,0,0]
      for (let i = 0; i < startPattern.length; i++) {
        if (startPattern[i]) {
          ctx.fillRect(currentX, 2, barWidth, height - 4)
        }
        currentX += barWidth
      }
      
      // Add separator
      currentX += barWidth
      
      // Encode text characters
      for (let i = 0; i < text.length && currentX < width - padding - 20; i++) {
        const char = text[i].toUpperCase()
        const pattern = patterns[char] || patterns['default']
        
        for (let j = 0; j < pattern.length; j++) {
          if (pattern[j]) {
            ctx.fillRect(currentX, 2, barWidth, height - 4)
          }
          currentX += barWidth
        }
        
        // Small gap between characters
        currentX += barWidth * 0.5
      }
      
      // Add separator
      currentX += barWidth
      
      // End pattern (1100011101011)
      const endPattern = [1,1,0,0,0,1,1,1,0,1,0,1,1]
      for (let i = 0; i < endPattern.length && currentX < width - padding; i++) {
        if (endPattern[i]) {
          ctx.fillRect(currentX, 2, barWidth, height - 4)
        }
        currentX += barWidth
      }
    }
    
    // Simple QR Code Generator (without external library)
    const generateSimpleQR = (text, canvas) => {
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const size = canvas.width // Use actual canvas size
      const cellSize = size / 25 // 25x25 grid
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, size, size)
      
      // Generate simple pattern based on text
      ctx.fillStyle = '#000000'
      
      // Create a simple hash-based pattern
      let hash = 0
      for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff
      }
      
      // Generate QR-like pattern
      for (let row = 0; row < 25; row++) {
        for (let col = 0; col < 25; col++) {
          const seed = hash + row * 25 + col
          const random = Math.abs(Math.sin(seed)) * 10000
          
          // Create pattern with finder patterns in corners
          const isFinderPattern = (
            (row < 7 && col < 7) || 
            (row < 7 && col > 17) || 
            (row > 17 && col < 7)
          )
          
          if (isFinderPattern) {
            const isBorder = row === 0 || row === 6 || col === 0 || col === 6 ||
                           (row > 17 && (row === 18 || row === 24)) ||
                           (col > 17 && (col === 18 || col === 24))
            const isCenter = (row >= 2 && row <= 4 && col >= 2 && col <= 4)
            
            if (isBorder || isCenter) {
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
            }
          } else {
            // Fill based on hash pattern
            if (random % 2 < 0.6) {
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
            }
          }
        }
      }
      
      // Add timing patterns
      for (let i = 8; i < 17; i++) {
        if (i % 2 === 0) {
          ctx.fillRect(i * cellSize, 6 * cellSize, cellSize, cellSize) // Horizontal
          ctx.fillRect(6 * cellSize, i * cellSize, cellSize, cellSize) // Vertical
        }
      }
    }
    
    const generateQRCode = async () => {
      try {
        await nextTick()
        const canvas = qrCanvas.value
        const barcodeCanvasEl = barcodeCanvas.value
        
        if (!canvas) {
          console.error('❌ QR Canvas not found')
          return
        }
        
        const qrData = getQRCodeData()
        console.log('🔗 Generating QR Code for:', qrData)
        
        generateSimpleQR(qrData, canvas)
        
        // Generate barcode
        if (barcodeCanvasEl) {
          const barcodeText = props.product?.sku || props.product?.product_code || 'N/A'
          generateBarcode(barcodeText, barcodeCanvasEl)
          console.log('📊 Generated barcode for:', barcodeText)
        }
        
        emit('qr-generated', qrData)
        
        if (window.$toast) {
          window.$toast.success('สร้าง QR Code และ Barcode แล้ว!')
        }
        
      } catch (error) {
        console.error('❌ Error generating QR Code:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถสร้าง QR Code ได้')
        }
      }
    }
    
    const printStockCard = () => {
      try {
        const stockCard = stockCardRef.value
        if (!stockCard) {
          console.error('❌ Stock card element not found')
          return
        }
        
        const printWindow = window.open('', '_blank', 'width=800,height=600')
        
        // Create print document
        printWindow.document.write('<!DOCTYPE html>')
        printWindow.document.write('<html><head>')
        printWindow.document.write('<title>Stock Card - ' + (props.product?.product_name || 'Product') + '</title>')
        printWindow.document.write('<meta charset="utf-8">')
        printWindow.document.write('<style>')
        
        // Add comprehensive CSS for print
        const printCSS = `
          * { box-sizing: border-box; }
          body { 
            margin: 0; padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            background: white; color: #111827; line-height: 1.6;
          }
          .stock-card {
            width: 100%; background: white; border: 2px dashed #d1d5db;
            border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            page-break-inside: avoid; position: relative;
          }
          .bg-gray-50 { background-color: #f9fafb; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          .border-gray-200 { border-color: #e5e7eb; }
          .text-center { text-align: center; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-base { font-size: 1rem; line-height: 1.5rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-mono { font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace; }
          .text-gray-900 { color: #111827; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-green-700 { color: #15803d; }
          .text-green-600 { color: #16a34a; }
          .text-red-700 { color: #b91c1c; }
          .text-red-600 { color: #dc2626; }
          .text-blue-700 { color: #1d4ed8; }
          .text-blue-600 { color: #2563eb; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .p-3 { padding: 0.75rem; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mt-4 { margin-top: 1rem; }
          .space-y-4 > * + * { margin-top: 1rem; }
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .gap-6 { gap: 1.5rem; }
          .gap-4 { gap: 1rem; }
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .text-right { text-align: right; }
          .rounded-lg { border-radius: 0.5rem; }
          .border { border-width: 1px; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-green-200 { border-color: #bbf7d0; }
          .border-red-200 { border-color: #fecaca; }
          .border-blue-200 { border-color: #bfdbfe; }
          .bg-green-50 { background-color: #f0fdf4; }
          .bg-red-50 { background-color: #fef2f2; }
          .bg-blue-50 { background-color: #eff6ff; }
          .bg-white { background-color: white; }
          .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
          .w-3 { width: 0.75rem; }
          .h-3 { height: 0.75rem; }
          .bg-green-500 { background-color: #22c55e; }
          .rounded-full { border-radius: 9999px; }
          canvas { border-radius: 0.25rem; display: block; }
          
          /* Hide control elements */
          .text-center.space-y-3,
          .mt-6.p-4.bg-gray-50.rounded-lg {
            display: none !important;
          }
          
          @media print {
            body { margin: 0; padding: 0.5in; background: white !important; }
            .stock-card { max-width: 100%; box-shadow: none !important; border: 2px solid #d1d5db !important; }
          }
          @page { margin: 0.5in; size: A4; }
        `
        
        printWindow.document.write(printCSS)
        printWindow.document.write('</style></head><body>')
        
        // Add the stock card HTML
        printWindow.document.write(stockCard.outerHTML)
        
        // Add JavaScript for QR regeneration and auto-print
        printWindow.document.write('<script>')
        const printJS = `
          window.onload = function() {
            // Hide control buttons
            const controls = document.querySelectorAll('.text-center.space-y-3, .mt-6.p-4.bg-gray-50.rounded-lg');
            controls.forEach(el => el && (el.style.display = 'none'));
            
            // Regenerate QR code
            setTimeout(() => {
              const canvas = document.querySelector('canvas');
              if (canvas) {
                const ctx = canvas.getContext('2d');
                const size = 120;
                const cellSize = size / 25;
                
                ctx.clearRect(0, 0, size, size);
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = '#000000';
                
                const qrText = '${props.product?.sku || 'N/A'}';
                let hash = 0;
                for (let i = 0; i < qrText.length; i++) {
                  hash = ((hash << 5) - hash + qrText.charCodeAt(i)) & 0xffffffff;
                }
                
                for (let row = 0; row < 25; row++) {
                  for (let col = 0; col < 25; col++) {
                    const seed = hash + row * 25 + col;
                    const random = Math.abs(Math.sin(seed)) * 10000;
                    
                    const isFinderPattern = (
                      (row < 7 && col < 7) || 
                      (row < 7 && col > 17) || 
                      (row > 17 && col < 7)
                    );
                    
                    if (isFinderPattern) {
                      const isBorder = row === 0 || row === 6 || col === 0 || col === 6;
                      const isCenter = (row >= 2 && row <= 4 && col >= 2 && col <= 4);
                      if (isBorder || isCenter) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                      }
                    } else if (random % 2 < 0.6) {
                      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                  }
                }
              }
              
              // Auto print
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 200);
            }, 100);
          };
        `
        
        printWindow.document.write(printJS)
        printWindow.document.write('<' + '/script><' + '/body><' + '/html>')
        printWindow.document.close()
        
        emit('card-printed', props.product)
        
        if (window.$toast) {
          window.$toast.success('เปิดหน้าต่างพิมพ์แล้ว!')
        }
        
      } catch (error) {
        console.error('❌ Error printing stock card:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถพิมพ์บัตรได้: ' + error.message)
        }
      }
    }
    
    const downloadStockCard = () => {
      try {
        // Create a temporary canvas to capture the stock card
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = 400
        canvas.height = 550
        
        // Simple gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 550)
        gradient.addColorStop(0, '#2563eb')
        gradient.addColorStop(0.5, '#7c3aed')
        gradient.addColorStop(1, '#4338ca')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 400, 550)
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 10
        
        // Add border radius effect (simplified)
        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.roundRect(0, 0, 400, 550, 12)
        ctx.fill()
        ctx.globalCompositeOperation = 'source-over'
        
        // Add text information
        ctx.fillStyle = 'white'
        ctx.font = 'bold 18px Arial'
        ctx.textAlign = 'center'
        const productName = props.product?.product_name || props.product?.name || 'ชื่อสินค้าไม่ระบุ'
        ctx.fillText(productName.length > 25 ? productName.substring(0, 25) + '...' : productName, 200, 50)
        
        ctx.font = '12px Arial'
        ctx.fillText('STOCK CARD - บัตรสินค้า', 200, 70)
        
        // Add separator line
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(50, 85)
        ctx.lineTo(350, 85)
        ctx.stroke()
        
        // Category info
        ctx.font = 'bold 16px Arial'
        ctx.fillText(formatCategory(props.product?.category), 200, 120)
        
        ctx.font = '14px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(`SKU: ${props.product?.sku || 'N/A'}`, 50, 170)
        ctx.fillText(`รหัสสินค้า: ${props.product?.product_code || 'N/A'}`, 50, 195)
        ctx.fillText(`หมวดหมู่: ${formatCategory(props.product?.category)}`, 50, 220)
        
        // QR Code placeholder
        ctx.fillStyle = 'white'
        ctx.fillRect(150, 250, 100, 100)
        ctx.fillStyle = 'black'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('QR CODE', 200, 305)
        
        // Stock and price info
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(50, 380, 130, 80)
        ctx.fillRect(220, 380, 130, 80)
        
        ctx.fillStyle = 'white'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('สต็อก', 115, 400)
        ctx.font = 'bold 20px Arial'
        ctx.fillText(formatNumber(props.currentStock), 115, 430)
        ctx.font = '10px Arial'
        ctx.fillText(props.product?.unit || 'ชิ้น', 115, 450)
        
        ctx.font = '12px Arial'
        ctx.fillText('ราคา', 285, 400)
        ctx.font = 'bold 14px Arial'
        ctx.fillText(formatCurrency(props.product?.unit_price), 285, 430)
        
        // Footer
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.moveTo(50, 480)
        ctx.lineTo(350, 480)
        ctx.stroke()
        
        ctx.font = '10px Arial'
        ctx.fillText(formatDateTime(new Date()), 200, 510)
        
        // Create download link
        const link = document.createElement('a')
        link.download = `stock-card-${props.product?.sku || 'product'}-${new Date().toISOString().split('T')[0]}.png`
        link.href = canvas.toDataURL('image/png', 0.9)
        link.click()
        
        emit('card-downloaded', {
          product: props.product,
          filename: link.download
        })
        
        if (window.$toast) {
          window.$toast.success('ดาวน์โหลดรูป Stock Card แล้ว!')
        }
        
      } catch (error) {
        console.error('❌ Error downloading stock card:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถดาวน์โหลดรูปได้')
        }
      }
    }
    
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        // Fallback method
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      }
    }
    
    const copyStockCardData = async () => {
      try {
        const data = {
          sku: props.product?.sku || props.product?.product_code || '',
          productCode: props.product?.product_code || props.product?.id || '',
          productName: props.product?.product_name || props.product?.name || '',
          category: formatCategory(props.product?.category || ''),
          currentStock: props.currentStock,
          unit: props.product?.unit || 'ชิ้น',
          unitPrice: props.product?.unit_price || 0,
          qrCodeData: getQRCodeData(),
          generatedAt: new Date().toISOString()
        }
        
        const textData = `=== STOCK CARD DATA ===
SKU: ${data.sku}
รหัสสินค้า: ${data.productCode}
ชื่อสินค้า: ${data.productName}
หมวดหมู่: ${data.category}
สต็อกปัจจุบัน: ${formatNumber(data.currentStock)} ${data.unit}
ราคาต่อหน่วย: ${formatCurrency(data.unitPrice)}
สร้างเมื่อ: ${formatDateTime(data.generatedAt)}

QR Code Data:
${data.qrCodeData}`
        
        await copyToClipboard(textData)
        
        emit('data-copied', data)
        
        if (window.$toast) {
          window.$toast.success('คัดลอกข้อมูล Stock Card แล้ว!')
        }
        
      } catch (error) {
        console.error('❌ Error copying stock card data:', error)
        if (window.$toast) {
          window.$toast.error('ไม่สามารถคัดลอกข้อมูลได้')
        }
      }
    }
    
    // Lifecycle
    onMounted(() => {
      // Auto-generate QR code when component mounts
      setTimeout(() => {
        generateQRCode()
      }, 500)
    })
    
    return {
      stockCardRef,
      qrCanvas,
      barcodeCanvas,
      formatNumber,
      formatCurrency,
      formatDateTime,
      formatCategory,
      getQRCodeData,
      generateBarcode,
      generateQRCode,
      printStockCard,
      downloadStockCard,
      copyStockCardData
    }
  }
}
</script>

<style scoped>
/* Stock Card Ticket Styles */
.stock-card {
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stock-card:hover {
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
  border-color: #6b7280 !important;
}

/* Ticket punch holes effect */
.stock-card {
  position: relative;
}

canvas {
  border-radius: 4px;
}

.stock-card-button {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.stock-card-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stock-card-button:active {
  transform: translateY(0);
}

/* Ticket design improvements */
.stock-card {
  background: white;
  border: 1px dashed #9ca3af !important;
  border-radius: 0.5rem;
  animation: fadeInUp 0.6s ease-out;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s ease;
}

/* Clean professional look */

/* Perforated edges on left and right */
.stock-card {
  position: relative;
  overflow: visible;
}

/* Subtle gradient for header */
.stock-card .bg-gray-50:first-child {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Print styles */
@media print {
  .stock-card {
    box-shadow: none !important;
    break-inside: avoid;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid.lg\\:grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stock-card {
    margin: 0;
  }
  
  .grid.md\\:grid-cols-4 {
    grid-template-columns: 1fr;
  }
  
  .grid.md\\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .flex.justify-center.space-x-3 {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .flex.justify-center.space-x-3 button {
    width: 100%;
    justify-content: center;
  }
  
  .text-right {
    text-align: left !important;
  }
}
</style>