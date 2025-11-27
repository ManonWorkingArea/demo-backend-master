/**
 * Fix Sequence Database Script
 * แก้ไขข้อมูล sequence ในฐานข้อมูลที่เก็บปีรวมกับ sequence number
 * 
 * ปัญหา: current: 2025000011 (ผิด)
 * ควรเป็น: current: 11 (ถูก)
 */

const { MongoClient } = require('mongodb')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'erp_corporate'

async function fixSequenceNumbers() {
  const client = new MongoClient(MONGO_URI)
  
  try {
    await client.connect()
    console.log('✅ Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    const collection = db.collection('erp_corporate_config')
    
    // Find all number_series configs
    const configs = await collection.find({
      config_key: { $regex: /^number_series\./ }
    }).toArray()
    
    console.log(`📋 Found ${configs.length} number series configs`)
    
    for (const config of configs) {
      const sequence = config.config_data?.sequence
      
      if (!sequence || typeof sequence.current !== 'number') {
        console.log(`⏭️  Skipping ${config.config_key} - no valid sequence`)
        continue
      }
      
      // ตรวจสอบว่า current มีปีรวมอยู่หรือไม่
      const currentSeq = sequence.current
      const currentYear = new Date().getFullYear()
      
      // ถ้า current มีค่ามากกว่า 9999 แสดงว่ามีปีรวมอยู่
      if (currentSeq > 9999) {
        // Extract เฉพาะ sequence number
        const seqString = String(currentSeq)
        const yearString = String(currentYear)
        
        let pureSequence = currentSeq
        
        // ลอง remove ปีออก
        if (seqString.startsWith(yearString)) {
          const withoutYear = seqString.replace(yearString, '')
          pureSequence = parseInt(withoutYear) || 1
        } else {
          // ถ้าไม่ขึ้นต้นด้วยปี ใช้ตัวเลข 6 หลักสุดท้าย
          pureSequence = currentSeq % 1000000
        }
        
        // คำนวณ next
        const nextSeq = pureSequence + 1
        
        console.log(`🔧 Fixing ${config.config_key}:`)
        console.log(`   Before: current=${currentSeq}, next=${sequence.next}`)
        console.log(`   After:  current=${pureSequence}, next=${nextSeq}`)
        
        // Update database
        await collection.updateOne(
          { _id: config._id },
          {
            $set: {
              'config_data.sequence.current': pureSequence,
              'config_data.sequence.next': nextSeq,
              'config_data.sequence.lastUpdated': new Date().toISOString(),
              'updatedAt': new Date()
            }
          }
        )
        
        console.log(`✅ Fixed ${config.config_key}`)
      } else {
        console.log(`✓ ${config.config_key} already correct (current=${currentSeq})`)
      }
    }
    
    console.log('✅ All sequence numbers fixed')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await client.close()
    console.log('👋 Disconnected from MongoDB')
  }
}

// Run the fix
fixSequenceNumbers()
  .then(() => {
    console.log('🎉 Script completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
