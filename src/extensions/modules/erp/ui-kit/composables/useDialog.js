import { createApp } from 'vue'
import ErpDialog from '../elements/dialog/ErpDialog.vue'

// Dialog state management
let currentDialog = null

// Clean up dialog
const cleanup = () => {
  if (currentDialog) {
    currentDialog.app.unmount()
    if (currentDialog.container.parentNode) {
      currentDialog.container.parentNode.removeChild(currentDialog.container)
    }
    currentDialog = null
  }
}

// Create dialog
const createDialog = (options) => {
  return new Promise((resolve) => {
    // Clean up existing dialog
    cleanup()

    // Create dialog container
    const container = document.createElement('div')
    container.id = `dialog-${Date.now()}`
    document.body.appendChild(container)

    // Create Vue app instance
    const app = createApp(ErpDialog, {
      ...options,
      onClose: (result) => {
        resolve(result)
        cleanup()
      }
    })

    // Mount the dialog
    const instance = app.mount(container)

    // Store references
    currentDialog = {
      app,
      instance,
      container
    }
  })
}

// Composable function
export const useDialog = () => {
  /**
   * Show alert dialog
   */
  const alert = (message, options = {}) => {
    return createDialog({
      type: 'alert',
      title: options.title || 'Alert',
      message,
      variant: options.variant || 'primary',
      confirmText: options.confirmText || 'OK',
      closable: options.closable !== false
    })
  }

  /**
   * Show success alert
   */
  const success = (message, options = {}) => {
    return alert(message, {
      title: 'Success',
      variant: 'success',
      confirmText: 'Great!',
      ...options
    })
  }

  /**
   * Show warning alert
   */
  const warning = (message, options = {}) => {
    return alert(message, {
      title: 'Warning', 
      variant: 'warning',
      confirmText: 'I Understand',
      ...options
    })
  }

  /**
   * Show error alert
   */
  const error = (message, options = {}) => {
    return alert(message, {
      title: 'Error',
      variant: 'danger',
      confirmText: 'OK',
      ...options
    })
  }

  /**
   * Show confirmation dialog
   */
  const confirm = (message, options = {}) => {
    return createDialog({
      type: 'confirm',
      title: options.title || 'Confirm',
      message,
      variant: options.variant || 'primary',
      confirmText: options.confirmText || 'Yes',
      cancelText: options.cancelText || 'No',
      closable: options.closable !== false
    }).then(result => result.action === 'confirm')
  }

  /**
   * Show dangerous confirmation
   */
  const confirmDelete = (message, options = {}) => {
    return confirm(message, {
      title: 'Delete Confirmation',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      ...options
    })
  }

  /**
   * Show prompt dialog
   */
  const prompt = (message, options = {}) => {
    return createDialog({
      type: 'prompt',
      title: options.title || 'Input Required',
      message,
      variant: options.variant || 'primary',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      placeholder: options.placeholder || 'Enter value...',
      defaultValue: options.defaultValue || '',
      closable: options.closable !== false
    }).then(result => result.action === 'confirm' ? result.value : null)
  }

  /**
   * Close current dialog
   */
  const close = () => {
    if (currentDialog) {
      currentDialog.instance.handleClose()
    }
  }

  return {
    alert,
    success,
    warning,
    error,
    confirm,
    confirmDelete,
    prompt,
    close
  }
}

// Create a global dialog instance
const globalDialogInstance = useDialog()

// Export individual functions for convenience
export const alert = globalDialogInstance.alert
export const success = globalDialogInstance.success
export const warning = globalDialogInstance.warning
export const error = globalDialogInstance.error
export const confirm = globalDialogInstance.confirm
export const confirmDelete = globalDialogInstance.confirmDelete
export const prompt = globalDialogInstance.prompt