/**
 * Corporate Configuration Schema
 * เก็บการตั้งค่าทั้งหมดของบริษัท
 * Collection: erp_corporate_config
 */

export const CorporateConfigSchema = {
  name: 'CorporateConfig',
  collection: 'erp_corporate_config',
  version: '1.0.0',
  
  fields: {
    // Identifier
    config_key: {
      type: 'string',
      required: true,
      unique: true,
      description: 'รหัสการตั้งค่า เช่น accounting.account_mapping, accounting.account_types'
    },
    
    // Module Information
    module: {
      type: 'string',
      required: true,
      enum: ['accounting', 'inventory', 'sales', 'purchase', 'production', 'hr', 'system'],
      description: 'โมดูลที่เป็นเจ้าของการตั้งค่า'
    },
    
    category: {
      type: 'string',
      required: true,
      description: 'หมวดหมู่ของการตั้งค่า เช่น account_mapping, account_types, policies'
    },
    
    // Configuration Data
    config_data: {
      type: 'json',
      required: true,
      description: 'ข้อมูลการตั้งค่าในรูปแบบ JSON'
    },
    
    // Metadata
    name: {
      type: 'string',
      required: false,
      description: 'ชื่อการตั้งค่า'
    },
    
    description: {
      type: 'string',
      required: false,
      description: 'คำอธิบายการตั้งค่า'
    },
    
    // Versioning
    version: {
      type: 'string',
      default: '1.0.0',
      description: 'เวอร์ชันของการตั้งค่า'
    },
    
    // Access Control
    is_public: {
      type: 'boolean',
      default: false,
      description: 'สามารถเข้าถึงได้โดยไม่ต้อง login'
    },
    
    is_system: {
      type: 'boolean',
      default: false,
      description: 'เป็นการตั้งค่าระบบที่ไม่ควรแก้ไข'
    },
    
    // Audit Fields
    created_by: {
      type: 'string',
      required: false,
      description: 'ผู้สร้างการตั้งค่า'
    },
    
    updated_by: {
      type: 'string',
      required: false,
      description: 'ผู้แก้ไขล่าสุด'
    },
    
    created_at: {
      type: 'datetime',
      auto: 'created',
      description: 'วันที่สร้าง'
    },
    
    updated_at: {
      type: 'datetime',
      auto: 'updated',
      description: 'วันที่แก้ไขล่าสุด'
    }
  },
  
  indexes: [
    { fields: ['config_key'], unique: true },
    { fields: ['module', 'category'] },
    { fields: ['module'] },
    { fields: ['is_system'] }
  ],
  
  validation: {
    rules: {
      config_key: {
        pattern: /^[a-z_]+\.[a-z_]+$/,
        message: 'config_key must be in format: module.category (e.g., accounting.account_mapping)'
      }
    }
  }
}

export default CorporateConfigSchema
