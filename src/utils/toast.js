// Simple Toast Notification Library
class Toast {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.createContainer();
  }

  createContainer() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  show(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }

    const {
      message,
      type = 'info',
      duration = 5000,
      closable = true
    } = options;

    const toastId = Date.now() + Math.random();
    const toastElement = this.createToastElement(message, type, closable, toastId);
    
    this.container.appendChild(toastElement);
    this.toasts.set(toastId, toastElement);

    // Animate in
    setTimeout(() => {
      toastElement.style.transform = 'translateX(0)';
      toastElement.style.opacity = '1';
    }, 10);

    // Auto hide
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }

    return {
      id: toastId,
      element: toastElement,
      hide: () => this.hide(toastId),
      update: (newOptions) => this.update(toastId, newOptions)
    };
  }

  createToastElement(message, type, closable, toastId) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
      success: { bg: '#10b981', border: '#059669' },
      error: { bg: '#ef4444', border: '#dc2626' },
      warning: { bg: '#f59e0b', border: '#d97706' },
      info: { bg: '#3b82f6', border: '#2563eb' },
      pending: { bg: '#6b7280', border: '#4b5563' }
    };

    const color = colors[type] || colors.info;
    
    toast.style.cssText = `
      background: ${color.bg};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid ${color.border};
      margin-bottom: 8px;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    `;

    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'flex: 1; white-space: pre-line;';
    messageDiv.textContent = message;

    toast.appendChild(messageDiv);

    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 12px;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
      `;
      
      closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
      closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
      closeBtn.onclick = () => this.hide(toastId);
      
      toast.appendChild(closeBtn);
    }

    return toast;
  }

  hide(toastId, newMessage, newType) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    if (newMessage) {
      // Update message and type before hiding
      this.update(toastId, { message: newMessage, type: newType });
      setTimeout(() => this.actuallyHide(toastId), 2000);
    } else {
      this.actuallyHide(toastId);
    }
  }

  actuallyHide(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  update(toastId, options) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    const messageDiv = toast.querySelector('div');
    if (options.message && messageDiv) {
      messageDiv.textContent = options.message;
    }

    if (options.type) {
      const colors = {
        success: { bg: '#10b981', border: '#059669' },
        error: { bg: '#ef4444', border: '#dc2626' },
        warning: { bg: '#f59e0b', border: '#d97706' },
        info: { bg: '#3b82f6', border: '#2563eb' },
        pending: { bg: '#6b7280', border: '#4b5563' }
      };

      const color = colors[options.type] || colors.info;
      toast.style.background = color.bg;
      toast.style.borderLeftColor = color.border;
      toast.className = `toast toast-${options.type}`;
    }
  }

  clear() {
    this.toasts.forEach((toast, id) => {
      this.hide(id);
    });
  }
}

// Create singleton instance
const toastInstance = new Toast();

// Export simple function interface
export function toast(options) {
  return toastInstance.show(options);
}

// Export class for advanced usage
export { Toast };

// Also expose as default export
export default toast;
