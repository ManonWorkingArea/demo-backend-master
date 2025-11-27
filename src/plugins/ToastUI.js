// Global toast management
const toastManager = {
    toasts: [],
    zIndex: 9999,
    
    addToast(toast) {
        this.toasts.push(toast);
        this.updatePositions();
    },
    
    removeToast(toast) {
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
            this.toasts.splice(index, 1);
            this.updatePositions();
        }
    },
    
    updatePositions() {
        this.toasts.forEach((toast, index) => {
            const spacing = 50; // เพิ่มจาก 40px เป็น 50px
            
            if (toast.position === 'center') {
                // สำหรับ center: stack แนวตั้งจากตรงกลาง
                const offsetY = (index - (this.toasts.filter(t => t.position === 'center').length - 1) / 2) * spacing;
                toast.element.style.top = `calc(50% + ${offsetY}px)`;
                toast.element.style.left = '50%';
                toast.element.style.right = 'auto';
                toast.element.style.transform = 'translate(-50%, -50%)';
            } else {
                // สำหรับ top-right: stack แนวตั้งจากบนลงล่าง
                const topRightToasts = this.toasts.filter(t => t.position === 'top-right');
                const topRightIndex = topRightToasts.indexOf(toast);
                const topPosition = 20 + (topRightIndex * spacing);
                toast.element.style.top = `${topPosition}px`;
                toast.element.style.right = '20px';
                toast.element.style.left = 'auto';
                toast.element.style.transform = 'none';
            }
            
            toast.element.style.zIndex = this.zIndex - index; // toast ใหม่จะอยู่บนสุด
        });
    }
};

export default function Toast(option) {
    const typeToIcon = {
        success: require('@/assets/images/success-tick.svg'),
        error: require('@/assets/images/error.svg'),
        pending: require('@/assets/images/sand-clock.svg'),
    };

    const typeToColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        pending: 'bg-gray-800',
    };

    // กำหนดตำแหน่งแสดง toast (default: center)
    const position = option.position || 'center'; // 'center' หรือ 'top-right'

    // Define the CSS animation
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes slow-spin {
        0%, 20% { transform: rotate(0deg); }
        25%, 45% { transform: rotate(45deg); }
        50%, 70% { transform: rotate(90deg); }
        75%, 95% { transform: rotate(135deg); }
        100% { transform: rotate(180deg); }
    }
    
    @keyframes toast-slide-in-center {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes toast-slide-out-center {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
    
    @keyframes toast-slide-in-right {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes toast-slide-out-right {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .toast-slide-in-center {
        animation: toast-slide-in-center 0.3s ease-out forwards;
    }
    
    .toast-slide-out-center {
        animation: toast-slide-out-center 0.3s ease-in forwards;
    }
    
    .toast-slide-in-right {
        animation: toast-slide-in-right 0.3s ease-out forwards;
    }
    
    .toast-slide-out-right {
        animation: toast-slide-out-right 0.3s ease-in forwards;
    }
    `;
    document.head.appendChild(style);

    const iconURL       = typeToIcon[option.type] || typeToIcon['pending'];
    const colorClass    = typeToColor[option.type] || 'bg-gray-800';

    const element = document.createElement('div');
    
    // ตั้งค่าตำแหน่งและ style ตาม position
    if (position === 'center') {
        element.classList.add('fixed', 'transition-all', 'duration-300');
        element.style.width = '320px'; // ลดจาก 400px เป็น 320px
        element.style.maxWidth = '90vw'; // responsive
    } else {
        element.classList.add('fixed', 'transition-all', 'duration-300');
        element.style.width = '280px'; // ลดจาก 320px เป็น 280px
        element.style.maxWidth = '90vw';
    }

    document.body.appendChild(element);

    // เลือก animation ตาม position
    const slideInClass = position === 'center' ? 'toast-slide-in-center' : 'toast-slide-in-right';
    element.classList.add(slideInClass);

    const iconElement = document.createElement('img');
    iconElement.src = iconURL;
    iconElement.style.width = '16px';
    iconElement.style.height = '16px';
    iconElement.style.filter = 'invert(1)';

    if (option.type === 'pending') {
        iconElement.style.animation = 'slow-spin 1s linear infinite';
    }

    const textElement = document.createElement('span');
    textElement.className = 'ml-2 text-sm flex-1';
    textElement.textContent = option.message;

    // เพิ่มปุ่มปิด toast
    const closeButton = document.createElement('button');
    closeButton.className = 'ml-2 text-white hover:text-gray-200 focus:outline-none';
    closeButton.innerHTML = '×';
    closeButton.style.fontSize = '16px';
    closeButton.style.fontWeight = 'bold';
    closeButton.onclick = () => toast.hide();

    const contentElement = document.createElement('div');
    contentElement.className = 'flex items-center justify-between w-full';
    
    const messageContainer = document.createElement('div');
    messageContainer.className = 'flex items-center flex-1';
    messageContainer.appendChild(iconElement);
    messageContainer.appendChild(textElement);
    
    contentElement.appendChild(messageContainer);
    contentElement.appendChild(closeButton);

    const toastElement = document.createElement('div');
    toastElement.className = `${colorClass} text-white py-2 px-4 rounded-lg shadow-lg`;
    toastElement.appendChild(contentElement);

    element.appendChild(toastElement);

    let autohideTimeout = null;

    const toast = {
        element,
        position, // เก็บข้อมูลตำแหน่งไว้ใน toast object
        hide: function(message, type, timeout = 300, callback = () => {}) {
            clearTimeout(autohideTimeout);
            // Check if the iconElement is currently rotating
            if (iconElement.style.animation.includes('slow-spin')) {
                // Remove the rotation
                iconElement.style.animation = '';
            }
            if (message) {
                textElement.textContent = message;
            }
            if (type) {
                const newIconURL        = typeToIcon[type] || typeToIcon['pending'];
                const newColorClass     = typeToColor[type] || 'bg-gray-800';
                iconElement.src         = newIconURL;
                toastElement.className  = `${newColorClass} text-white py-2 px-4 rounded-lg shadow-lg`;
            }
            
            // เลือก animation ตาม position
            const slideInClass = position === 'center' ? 'toast-slide-in-center' : 'toast-slide-in-right';
            const slideOutClass = position === 'center' ? 'toast-slide-out-center' : 'toast-slide-out-right';
            
            element.classList.remove(slideInClass);
            element.classList.add(slideOutClass);
            
            setTimeout(() => {
                toastManager.removeToast(toast);
                element.remove();
                callback();
            }, timeout);
        }
    };

    // เพิ่ม toast เข้าระบบ management
    toastManager.addToast(toast);

    if (option.autohide !== false) { // เปลี่ยนเป็น !== false เพื่อให้ default เป็น true
        const hideTimeout = option.timeout || 3000; // ลดจาก 4000ms เป็น 3000ms (3 วินาที)
        autohideTimeout = setTimeout(() => {
            toast.hide();
        }, hideTimeout);
    }

    return toast;
}