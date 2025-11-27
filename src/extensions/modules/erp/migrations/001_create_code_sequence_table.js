/**
 * 📊 Migration: สร้างตาราง code_sequence
 * สำหรับเก็บ sequence counter ของแต่ละ module
 */

const migration = {
  up: async (engine) => {
    console.log('🔄 Creating code_sequence table...')
    
    try {
      // สร้างตาราง code_sequence
      const result = await engine.createCollection('code_sequence', {
        schema: {
          id: { type: 'string', primary: true }, // format: "module_sequence_year"
          module: { type: 'string', required: true },
          year: { type: 'string', required: true },
          current_sequence: { type: 'number', default: 0 },
          last_generated_code: { type: 'string' },
          created_at: { type: 'datetime', default: 'now' },
          updated_at: { type: 'datetime', default: 'now' }
        },
        indexes: [
          { fields: ['module', 'year'], unique: true },
          { fields: ['module'] },
          { fields: ['year'] }
        ]
      })
      
      if (result.success) {
        console.log('✅ code_sequence table created successfully')
        
        // เพิ่มข้อมูลเริ่มต้นสำหรับ modules ที่มีอยู่
        const currentYear = new Date().getFullYear().toString()
        
        const initialData = [
          { 
            id: `product_sequence_${currentYear}`, 
            module: 'product', 
            year: currentYear, 
            current_sequence: 0 
          },
          { 
            id: `supplier_sequence_${currentYear}`, 
            module: 'supplier', 
            year: currentYear, 
            current_sequence: 0 
          },
          { 
            id: `customer_sequence_${currentYear}`, 
            module: 'customer', 
            year: currentYear, 
            current_sequence: 0 
          },
          { 
            id: `inventory_sequence_${currentYear}`, 
            module: 'inventory', 
            year: currentYear, 
            current_sequence: 0 
          }
        ]
        
        for (const data of initialData) {
          await engine.create('code_sequence', data)
        }
        
        console.log(`✅ Initialized sequence data for ${initialData.length} modules`)
      }
      
      return result
      
    } catch (error) {
      console.error('❌ Error creating code_sequence table:', error)
      throw error
    }
  },
  
  down: async (engine) => {
    console.log('🔄 Dropping code_sequence table...')
    
    try {
      const result = await engine.dropCollection('code_sequence')
      
      if (result.success) {
        console.log('✅ code_sequence table dropped successfully')
      }
      
      return result
      
    } catch (error) {
      console.error('❌ Error dropping code_sequence table:', error)
      throw error
    }
  }
}

export default migration