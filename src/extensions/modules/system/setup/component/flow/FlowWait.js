export function customWait(seconds) {
    return new Promise(resolve => {
      const toastContainer = document.createElement('div');
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.left = '50%';
      toastContainer.style.transform = 'translateX(-50%)';
      toastContainer.style.backgroundColor = '#333';
      toastContainer.style.color = 'white';
      toastContainer.style.padding = '10px 20px';
      toastContainer.style.borderRadius = '5px';
      toastContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      toastContainer.style.zIndex = '9999';
      toastContainer.style.textAlign = 'center';
      toastContainer.innerHTML = `Waiting for ${seconds} seconds`;
  
      document.body.appendChild(toastContainer);
  
      let remainingSeconds = seconds;
      const countdownInterval = setInterval(() => {
        remainingSeconds -= 1;
        toastContainer.innerHTML = `Waiting for ${remainingSeconds} seconds`;
  
        if (remainingSeconds <= 0) {
          clearInterval(countdownInterval);
          document.body.removeChild(toastContainer);
          resolve();
        }
      }, 1000);
    });
  }
  
  export function showToast(message) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'flow-toast';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.left = '50%';
    toastContainer.style.transform = 'translateX(-50%)';
    toastContainer.style.backgroundColor = '#333';
    toastContainer.style.color = 'white';
    toastContainer.style.padding = '10px 20px';
    toastContainer.style.borderRadius = '5px';
    toastContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.textAlign = 'center';
    toastContainer.innerHTML = message;
  
    document.body.appendChild(toastContainer);
  }
  
  export function hideToast() {
    const toastContainer = document.getElementById('flow-toast');
    if (toastContainer) {
      document.body.removeChild(toastContainer);
    }
  }
  