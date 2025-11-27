function notification(header, message, type = 'normal', showNotification = false) {
    if (!showNotification) {
      return;
    }
  
    let bgColorClass = '';
  
    if (type === 'success') {
      bgColorClass = 'bg-black';
    } else if (type === 'error') {
      bgColorClass = 'bg-red-500';
    } else {
      bgColorClass = 'bg-blue-500';
    }
  
    const notificationHTML = `
      <div class="fixed z-50 transform translate-y-full right-5 text-xs bg-gray-800 text-white p-2 rounded shadow-md ${bgColorClass} notification">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-center">
            <div class="loader"></div>
          </div>
          <div class="ml-2">
            <div class="font-bold">${header}</div>
            <div>${message}</div>
          </div>
        </div>
      </div>
    `;
  
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
  
    let topPosition = 0;
    const existingNotification = document.querySelectorAll('.notification');
    existingNotification.forEach((existingToast) => {
      topPosition += existingToast.offsetHeight + 10;
    });
  
    const notification = document.body.lastElementChild;
    notification.style.top = `${topPosition}px`;
  
    setTimeout(() => {
      notification.style.transform = 'translateY(0%)';
      setTimeout(() => {
        notification.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 300);
    }, 10);
  }
  
  export default notification;
  