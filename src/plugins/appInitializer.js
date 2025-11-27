// Application Initializer Plugin
export class AppInitializer {
  constructor() {
    this.loadingIndicator = null;
    this.errorHandler = null;
  }

  showLoading() {
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.id = 'app-loading';
    this.loadingIndicator.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                  background: rgba(255,255,255,0.95); z-index: 9999; 
                  display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                      border-top: 4px solid #3498db; border-radius: 50%; 
                      animation: spin 2s linear infinite; margin: 0 auto 20px;"></div>
          <p style="color: #666; font-size: 16px;">กำลังโหลดแอปพลิเคชัน...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(this.loadingIndicator);
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.remove();
      this.loadingIndicator = null;
    }
  }

  showError(error) {
    console.error('Application initialization failed:', error);
    
    this.hideLoading();
    
    const errorEl = document.createElement('div');
    errorEl.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: #fee; color: #d00; padding: 30px; border-radius: 12px; 
                  border: 2px solid #fcc; z-index: 9999; text-align: center; 
                  box-shadow: 0 4px 20px rgba(0,0,0,0.3); max-width: 400px;">
        <h3 style="margin: 0 0 15px 0; font-size: 20px;">⚠️ เกิดข้อผิดพลาด</h3>
        <p style="margin: 0 0 20px 0; line-height: 1.5;">
          ไม่สามารถโหลดแอปพลิเคชันได้<br>
          กรุณาลองใหม่อีกครั้ง
        </p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="location.reload()" 
                  style="padding: 10px 20px; background: #d00; color: white; 
                         border: none; border-radius: 6px; cursor: pointer; 
                         font-size: 14px;">
            🔄 รีเฟรช
          </button>
          <button onclick="window.location.href='/'" 
                  style="padding: 10px 20px; background: #666; color: white; 
                         border: none; border-radius: 6px; cursor: pointer; 
                         font-size: 14px;">
            🏠 หน้าแรก
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(errorEl);
  }

  // Global error handler
  setupGlobalErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }
}
