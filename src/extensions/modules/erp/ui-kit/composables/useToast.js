import { createApp } from 'vue'
import ErpToast from '../elements/toast/ErpToast.vue'

// Toast management
const toasts = []
let toastId = 0

// Create toast container if not exists
const ensureContainer = () => {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.className = 'fixed top-4 right-4 z-50 space-y-2'
    document.body.appendChild(container)
  }
  return container
}

// Show toast function
const showToast = (options) => {
  const container = ensureContainer()
  toastId++
  
  const toastElement = document.createElement('div')
  toastElement.id = `toast-${toastId}`
  container.appendChild(toastElement)

  const app = createApp(ErpToast, {
    ...options,
    onClose: () => {
      app.unmount()
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement)
      }
      // Remove from toasts array
      const index = toasts.findIndex(t => t.id === toastId)
      if (index > -1) {
        toasts.splice(index, 1)
      }
    }
  })

  const instance = app.mount(toastElement)
  
  // Store toast reference
  toasts.push({
    id: toastId,
    app,
    instance,
    element: toastElement
  })

  return toastId
}

// Composable function
export const useToast = () => {
  /**
   * Show success toast
   */
  const success = (message, options = {}) => {
    return showToast({
      message,
      type: 'success',
      title: 'Success',
      duration: 4000,
      ...options
    })
  }

  /**
   * Show error toast
   */
  const error = (message, options = {}) => {
    return showToast({
      message,
      type: 'error',
      title: 'Error',
      duration: 6000,
      ...options
    })
  }

  /**
   * Show warning toast
   */
  const warning = (message, options = {}) => {
    return showToast({
      message,
      type: 'warning',
      title: 'Warning',
      duration: 5000,
      ...options
    })
  }

  /**
   * Show info toast
   */
  const info = (message, options = {}) => {
    return showToast({
      message,
      type: 'info',
      title: 'Info',
      duration: 4000,
      ...options
    })
  }

  /**
   * Show dark toast
   */
  const dark = (message, options = {}) => {
    return showToast({
      message,
      type: 'dark',
      title: 'Notification',
      duration: 4000,
      ...options
    })
  }

  /**
   * Show toast with custom options
   * Supports both calling styles:
   * - toast('message', {options})
   * - toast({message: 'text', ...options})
   */
  const toast = (message, options = {}) => {
    // Handle both calling styles
    if (typeof message === 'object' && message !== null) {
      // Called with options object as first parameter
      return showToast({
        type: 'info',
        duration: 4000,
        ...message
      })
    } else {
      // Called with message string as first parameter
      return showToast({
        message,
        type: 'info',
        duration: 4000,
        ...options
      })
    }
  }

  /**
   * Clear all toasts
   */
  const clear = () => {
    toasts.forEach(toast => {
      toast.app.unmount()
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element)
      }
    })
    toasts.length = 0
  }

  /**
   * Remove specific toast
   */
  const remove = (id) => {
    const toast = toasts.find(t => t.id === id)
    if (toast) {
      toast.app.unmount()
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element)
      }
      const index = toasts.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.splice(index, 1)
      }
    }
  }

  return {
    success,
    error,
    warning,
    info,
    dark,
    toast,
    showToast,
    clear,
    remove
  }
}

// Create a global toast instance
const globalToastInstance = useToast()

// Export individual functions for convenience
export const success = globalToastInstance.success
export const error = globalToastInstance.error
export const warning = globalToastInstance.warning
export const info = globalToastInstance.info
export const dark = globalToastInstance.dark
export const toast = globalToastInstance.toast
export const clear = globalToastInstance.clear