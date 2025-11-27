// ERP UI Kit - Modern Component Library

// Import all elements (components)
export * from './elements'

// Import all composables (logic/utilities)
export * from './composables'

// Import layout components
import ModuleDashboard from './ModuleDashboard.vue'

// Organize imports for clean structure
import {
  // Form Elements
  ErpButton, ErpInput, ErpSelect, ErpTextarea, ErpCheckbox, ErpRadio, ErpSwitch,
  // Navigation Elements  
  ErpBreadcrumb,
  // Feedback Elements
  ErpToast, ErpDialog,
  // Display Elements
  ErpBadge
} from './elements'

import {
  // Dialog Composables
  useDialog, alert, success, warning, error, confirm, confirmDelete, prompt,
  // Toast Composables  
  useToast, successToast, errorToast, warningToast, infoToast, darkToast, toast, clearToasts
} from './composables'

// Re-export organized components for named imports
export {
  // 📱 Layout Components
  ModuleDashboard,
  
  // 🧭 Navigation Elements
  ErpBreadcrumb,
  
  // 🎯 Form Elements
  ErpButton,
  ErpInput,
  ErpSelect,
  ErpTextarea,
  ErpCheckbox,
  ErpRadio,
  ErpSwitch,
  
  // 🔔 Feedback Elements
  ErpToast,
  ErpDialog,
  
  // 🎨 Display Elements
  ErpBadge,
  
  // �️ Composables & Utilities
  useDialog,
  useToast,
  
  // 🚀 Quick Functions - Dialogs
  alert,
  success,
  warning,
  error,
  confirm,
  confirmDelete,
  prompt,
  
  // 🚀 Quick Functions - Toasts
  successToast,
  errorToast,
  warningToast,
  infoToast,
  darkToast,
  toast,
  clearToasts
}

// Default export - organized by category
export default {
  // Elements (Components)
  elements: {
    // Layout
    ModuleDashboard,
    
    // Form
    ErpButton,
    ErpInput,
    ErpSelect,
    ErpTextarea,
    ErpCheckbox,
    ErpRadio,
    ErpSwitch,
    
    // Navigation
    ErpBreadcrumb,
    
    // Feedback
    ErpToast,
    ErpDialog,
    
    // Display
    ErpBadge
  },
  
  // Composables (Logic)
  composables: {
    useDialog,
    useToast
  },
  
  // Quick Functions
  dialogs: {
    alert,
    success,
    warning, 
    error,
    confirm,
    confirmDelete,
    prompt
  },
  
  toasts: {
    successToast,
    errorToast,
    warningToast,
    infoToast,
    darkToast,
    toast,
    clearToasts
  }
}