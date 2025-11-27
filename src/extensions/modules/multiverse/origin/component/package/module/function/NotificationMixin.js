// Notification Mixin for Package Management components
export const NotificationMixin = {
  methods: {
    showNotification(options) {
      // Try using the global notification system first
      if (this.$notify && typeof this.$notify === 'function') {
        this.$notify(options);
      } else if (this.$toast && typeof this.$toast === 'function') {
        // Fallback to toast if available
        const { type, title, message } = options;
        const toastMessage = title ? `${title}: ${message}` : message;
        
        if (type === 'success') {
          this.$toast.success(toastMessage);
        } else if (type === 'error') {
          this.$toast.error(toastMessage);
        } else if (type === 'warning') {
          this.$toast.warning(toastMessage);
        } else {
          this.$toast.info(toastMessage);
        }
      } else {
        // Fallback to console and alert
        const { type, title, message } = options;
        const fullMessage = title ? `${title}: ${message}` : message;
        
        console.log(`[${type.toUpperCase()}] ${fullMessage}`);
        
        // Only show alert for errors or important success messages
        if (type === 'error' || (type === 'success' && title)) {
          alert(fullMessage);
        }
      }
    },

    showSuccess(title, message) {
      this.showNotification({
        type: 'success',
        title,
        message
      });
    },

    showError(title, message) {
      this.showNotification({
        type: 'error',
        title,
        message
      });
    },

    showWarning(title, message) {
      this.showNotification({
        type: 'warning',
        title,
        message
      });
    },

    showInfo(title, message) {
      this.showNotification({
        type: 'info',
        title,
        message
      });
    }
  }
};
