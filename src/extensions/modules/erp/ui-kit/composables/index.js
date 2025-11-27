// Composables - Reusable Logic
export { 
  useDialog,
  alert,
  success,
  warning,
  error,
  confirm,
  confirmDelete,
  prompt
} from './useDialog'

export {
  useToast,
  success as successToast,
  error as errorToast, 
  warning as warningToast,
  info as infoToast,
  dark as darkToast,
  toast,
  clear as clearToasts
} from './useToast'