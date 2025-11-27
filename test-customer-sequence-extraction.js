// Test Customer Sequence Extraction Fix
// ทดสอบการ extract sequence จาก customer codes ที่มีปัญหา

const testCodes = [
  'CUSX202525003',
  'CUSX20253',
  'CUSX20250003', 
  'CUS001',
  'CUS9999',
  'QT20251234',
  'SO20255678'
]

// Simulate the extractSequenceFromCode method with new patterns
function extractSequenceFromCode(generatedCode) {
  if (!generatedCode) {
    console.warn('⚠️ No code provided')
    return null
  }

  console.log(`🔍 [Test] Extracting sequence from code: ${generatedCode}`)
  
  // Pattern สำหรับ Customer codes (CUSX2025003 → 3)
  const customerPattern = /^CUS[A-Z]?\d{4}(\d{1,4})$/
  
  // Pattern สำหรับเอกสารอื่น ๆ (QT2025001, SO2025001, etc.)
  const salesPattern = /^(QT|SO|INV|TAX|DN|RCP)\d{4}(\d{1,4})$/
  
  // Pattern สำหรับรูปแบบเก่า (CUS001)
  const simplePattern = /^CUS(\d{1,4})$/

  let match
  let extractedNumber
  
  // Try customer pattern first
  if ((match = generatedCode.match(customerPattern))) {
    extractedNumber = parseInt(match[1], 10)
    console.log(`✅ Customer pattern matched: ${generatedCode} → sequence: ${extractedNumber}`)
  }
  // Try sales pattern  
  else if ((match = generatedCode.match(salesPattern))) {
    extractedNumber = parseInt(match[2], 10)
    console.log(`✅ Sales pattern matched: ${generatedCode} → sequence: ${extractedNumber}`)
  }
  // Try simple pattern
  else if ((match = generatedCode.match(simplePattern))) {
    extractedNumber = parseInt(match[1], 10)
    console.log(`✅ Simple pattern matched: ${generatedCode} → sequence: ${extractedNumber}`)
  }
  // Fallback pattern for unexpected formats
  else {
    const fallbackMatch = generatedCode.match(/(\d{1,4})$/)
    if (fallbackMatch) {
      const lastNumber = parseInt(fallbackMatch[1], 10)
      if (lastNumber <= 9999) {
        extractedNumber = lastNumber
        console.log(`⚠️ Fallback pattern used: ${generatedCode} → sequence: ${extractedNumber}`)
      } else {
        console.warn(`❌ Fallback number too large: ${lastNumber} from ${generatedCode}`)
        return null
      }
    } else {
      console.warn(`❌ No pattern matched for code: ${generatedCode}`)
      return null
    }
  }

  if (extractedNumber && extractedNumber > 0) {
    console.log(`✅ Final extracted sequence: ${extractedNumber}`)
    return extractedNumber
  } else {
    console.warn(`❌ Invalid sequence extracted: ${extractedNumber}`)
    return null
  }
}

// Test all codes
console.log('🧪 Testing Customer Sequence Extraction\n')
console.log('=' * 50)

testCodes.forEach((code, index) => {
  console.log(`\n--- Test ${index + 1}: ${code} ---`)
  const result = extractSequenceFromCode(code)
  console.log(`Result: ${result}`)
  console.log('-'.repeat(30))
})

console.log('\n🎯 Expected Results:')
console.log('CUSX202525003 → 25003 (should be corrected to 3)')
console.log('CUSX20253 → 3 ✅')
console.log('CUSX20250003 → 3 ✅')
console.log('CUS001 → 1 ✅')
console.log('CUS9999 → 9999 ✅')
console.log('QT20251234 → 1234 ✅')
console.log('SO20255678 → 5678 ✅')