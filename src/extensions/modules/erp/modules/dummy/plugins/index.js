// ==========================================
// Dummy Module - Plugin Configuration
// ==========================================
// Template plugin สำหรับโมดูลใหม่

// Module Constants
export const DUMMY_CONSTANTS = {
  MODULE_NAME: 'dummy',
  MODULE_VERSION: '1.0.0',
  MODULE_AUTHOR: 'Your Name',
  
  // Status Constants
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    DRAFT: 'draft'
  },

  // Priority Levels
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },

  // Item Types
  ITEM_TYPES: {
    TYPE_A: 'type_a',
    TYPE_B: 'type_b',
    TYPE_C: 'type_c'
  }
}

// Default Configuration
export const DEFAULT_CONFIG = {
  // UI Settings
  ui: {
    theme: 'light',
    itemsPerPage: 20,
    showSidebar: true,
    defaultView: 'grid'
  },
  
  // Feature Flags
  features: {
    enableNotifications: true,
    enableExport: true,
    enableBulkActions: true,
    enableAdvancedSearch: false
  },

  // Data Settings
  data: {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxFileSize: 10485760,   // 10MB
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'docx']
  }
}

// Validation Rules
export const VALIDATION_RULES = {
  item_name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\u0E00-\u0E7F]+$/ // Thai + English + Numbers + Spaces
  },
  
  item_code: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9-]+$/, // Uppercase + Numbers + Dash
    unique: true
  },

  description: {
    required: false,
    maxLength: 500
  },

  price: {
    required: false,
    min: 0,
    max: 9999999.99,
    decimal: 2
  }
}

// API Endpoints Template
export const API_ENDPOINTS = {
  // CRUD Operations
  getItems: '/api/dummy/items',
  getItem: (id) => `/api/dummy/items/${id}`,
  createItem: '/api/dummy/items',
  updateItem: (id) => `/api/dummy/items/${id}`,
  deleteItem: (id) => `/api/dummy/items/${id}`,
  
  // Bulk Operations
  bulkDelete: '/api/dummy/items/bulk-delete',
  bulkUpdate: '/api/dummy/items/bulk-update',
  
  // Export/Import
  exportItems: '/api/dummy/items/export',
  importItems: '/api/dummy/items/import',
  
  // Search & Filter
  searchItems: '/api/dummy/items/search',
  filterItems: '/api/dummy/items/filter'
}

// Module Menu Configuration
export const MODULE_MENU = {
  title: 'Dummy Module',
  icon: 'fas fa-cube',
  order: 1000, // Menu order
  children: [
    {
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/dummy',
      permissions: ['view_dummy']
    },
    {
      title: 'Items Management',
      icon: 'fas fa-list',
      route: '/dummy/items',
      permissions: ['view_dummy_items']
    },
    {
      title: 'Add New Item',
      icon: 'fas fa-plus',
      route: '/dummy/items/add',
      permissions: ['create_dummy_items']
    },
    {
      title: 'Settings',
      icon: 'fas fa-cog',
      route: '/dummy/settings',
      permissions: ['admin', 'super_admin']
    }
  ]
}

// Permissions Template
export const MODULE_PERMISSIONS = [
  'view_dummy',
  'view_dummy_items',
  'create_dummy_items',
  'edit_dummy_items',
  'delete_dummy_items',
  'export_dummy_items',
  'import_dummy_items'
]

// Event Hooks Template
export const MODULE_HOOKS = {
  // Lifecycle Hooks
  onModuleLoad: () => {
    console.log('Dummy Module loaded')
  },
  
  onModuleUnload: () => {
    console.log('Dummy Module unloaded')
  },

  // Data Hooks
  beforeItemCreate: (data) => {
    console.log('Before item create:', data)
    return data
  },
  
  afterItemCreate: (item) => {
    console.log('After item create:', item)
  },
  
  beforeItemUpdate: (id, data) => {
    console.log('Before item update:', id, data)
    return data
  },
  
  afterItemUpdate: (item) => {
    console.log('After item update:', item)
  }
}

// Utility Functions Template
export const MODULE_UTILS = {
  // Format helpers
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  },

  formatDate: (date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date))
  },

  // Validation helpers
  validateItemCode: (code) => {
    const rule = VALIDATION_RULES.item_code
    return rule.pattern.test(code) && 
           code.length >= rule.minLength && 
           code.length <= rule.maxLength
  },

  // Data transformation
  transformItemForApi: (item) => {
    return {
      ...item,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

// Export all configurations
export default {
  DUMMY_CONSTANTS,
  DEFAULT_CONFIG,
  VALIDATION_RULES,
  API_ENDPOINTS,
  MODULE_MENU,
  MODULE_PERMISSIONS,
  MODULE_HOOKS,
  MODULE_UTILS
}