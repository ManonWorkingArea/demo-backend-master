<!-- 
  ตัวอย่างการใช้งาน Hostname Configuration ใน Vue Component
  ไฟล์นี้แสดงวิธีการเข้าถึงข้อมูล hostname config ที่ได้จาก API
-->
<template>
  <div class="hostname-info-container">
    <div class="site-header">
      <img 
        v-if="hostnameConfig.site?.siteLogo" 
        :src="hostnameConfig.site.siteLogo" 
        :alt="hostnameConfig.site?.siteName"
        class="site-logo"
      />
      <h1 class="site-title">{{ hostnameConfig.site?.siteName || 'Loading...' }}</h1>
    </div>

    <div class="config-sections">
      <!-- Site Information -->
      <div class="config-section">
        <h3>Site Information</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>Site Name:</label>
            <span>{{ hostnameConfig.site?.siteName }}</span>
          </div>
          <div class="config-item">
            <label>Site Type:</label>
            <span>{{ hostnameConfig.site?.siteType }}</span>
          </div>
          <div class="config-item">
            <label>Site View:</label>
            <span>{{ hostnameConfig.site?.siteView }}</span>
          </div>
          <div class="config-item">
            <label>Default Plugin:</label>
            <span>{{ hostnameConfig.site?.defaultPlugin }}</span>
          </div>
        </div>
      </div>

      <!-- Master/Child Configuration -->
      <div class="config-section">
        <h3>Master/Child Configuration</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>Master Hostname:</label>
            <span>{{ hostnameConfig.master?.hostname }}</span>
          </div>
          <div class="config-item">
            <label>Child Hostname:</label>
            <span>{{ hostnameConfig.child?.hostname }}</span>
          </div>
          <div class="config-item">
            <label>Child Token:</label>
            <span class="token-display">
              {{ hostnameConfig.child?.token ? '***' + hostnameConfig.child.token.slice(-8) : 'None' }}
            </span>
          </div>
        </div>
      </div>

      <!-- API Configuration -->
      <div class="config-section">
        <h3>API Configuration</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>Base URL:</label>
            <span>{{ hostnameConfig.api?.baseURL }}</span>
          </div>
          <div class="config-item">
            <label>Timeout:</label>
            <span>{{ hostnameConfig.api?.timeout }}ms</span>
          </div>
          <div class="config-item">
            <label>Encryption Enabled:</label>
            <span :class="encryptionStatusClass">
              {{ hostnameConfig.features?.enableEncryption ? 'Yes' : 'No' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Available Plugins -->
      <div class="config-section">
        <h3>Available Plugins</h3>
        <div class="plugins-list">
          <span 
            v-for="plugin in hostnameConfig.features?.plugins || []" 
            :key="plugin"
            class="plugin-tag"
          >
            {{ plugin }}
          </span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="config-section">
        <h3>Navigation Menu</h3>
        <div class="menu-preview">
          <div 
            v-for="menuItem in hostnameConfig.menu || []" 
            :key="menuItem.title"
            class="menu-item"
          >
            <span class="menu-title">{{ menuItem.title }}</span>
            <span class="menu-target">{{ menuItem.target }}</span>
            <div v-if="menuItem.submenu && menuItem.submenu.length > 0" class="submenu">
              <div 
                v-for="subItem in menuItem.submenu" 
                :key="subItem.title"
                class="submenu-item"
              >
                {{ subItem.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Configuration -->
      <div class="config-section" v-if="hostnameConfig.email?.fromEmail">
        <h3>Email Configuration</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>From Email:</label>
            <span>{{ hostnameConfig.email.fromEmail }}</span>
          </div>
          <div class="config-item">
            <label>From Name:</label>
            <span>{{ hostnameConfig.email.fromName }}</span>
          </div>
          <div class="config-item">
            <label>Provider:</label>
            <span>{{ hostnameConfig.email.provider }}</span>
          </div>
        </div>
      </div>

      <!-- Performance Info -->
      <div class="config-section">
        <h3>Performance & Cache</h3>
        <div class="config-grid">
          <div class="config-item">
            <label>Response Time:</label>
            <span>{{ hostnameConfig.performance?.responseTime }}ms</span>
          </div>
          <div class="config-item">
            <label>From Cache:</label>
            <span :class="cacheStatusClass">
              {{ hostnameConfig.performance?.fromCache ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="config-item">
            <label>Cache Hit Rate:</label>
            <span>{{ hostnameConfig.performance?.cacheHitRate || 'N/A' }}</span>
          </div>
          <div class="config-item">
            <label>Loaded At:</label>
            <span>{{ formattedLoadTime }}</span>
          </div>
        </div>
      </div>

      <!-- Debug Information -->
      <div class="config-section" v-if="showDebug">
        <h3>Debug Information</h3>
        <div class="debug-info">
          <pre>{{ JSON.stringify(hostnameConfig.metadata, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="refreshConfig" class="btn-refresh" :disabled="isRefreshing">
        {{ isRefreshing ? 'Refreshing...' : 'Refresh Config' }}
      </button>
      <button @click="showDebug = !showDebug" class="btn-debug">
        {{ showDebug ? 'Hide Debug' : 'Show Debug' }}
      </button>
      <button @click="testApiRequest" class="btn-test" :disabled="isTesting">
        {{ isTesting ? 'Testing...' : 'Test API Request' }}
      </button>
    </div>

    <!-- API Test Results -->
    <div v-if="apiTestResult" class="api-test-result">
      <h4>API Test Result:</h4>
      <div :class="apiTestResult.success ? 'success' : 'error'">
        {{ apiTestResult.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { inject, ref, computed, onMounted } from 'vue';

export default {
  name: 'HostnameConfigDisplay',
  
  setup() {
    // Inject hostname config from provide
    const hostnameConfig = inject('hostnameConfig', {});
    const apiRequest = inject('apiRequest', null);
    
    // Reactive data
    const showDebug = ref(false);
    const isRefreshing = ref(false);
    const isTesting = ref(false);
    const apiTestResult = ref(null);
    
    // Computed properties
    const encryptionStatusClass = computed(() => ({
      'status-enabled': hostnameConfig.features?.enableEncryption,
      'status-disabled': !hostnameConfig.features?.enableEncryption
    }));
    
    const cacheStatusClass = computed(() => ({
      'status-enabled': hostnameConfig.performance?.fromCache,
      'status-disabled': !hostnameConfig.performance?.fromCache
    }));
    
    const formattedLoadTime = computed(() => {
      if (!hostnameConfig.metadata?.loadedAt) return 'N/A';
      return new Date(hostnameConfig.metadata.loadedAt).toLocaleString();
    });
    
    // Methods
    const refreshConfig = async () => {
      isRefreshing.value = true;
      try {
        // Reload the page to fetch fresh config
        window.location.reload();
      } catch (error) {
        console.error('Failed to refresh config:', error);
      } finally {
        isRefreshing.value = false;
      }
    };
    
    const testApiRequest = async () => {
      if (!apiRequest) {
        apiTestResult.value = {
          success: false,
          message: 'ApiRequest plugin not available'
        };
        return;
      }
      
      isTesting.value = true;
      apiTestResult.value = null;
      
      try {
        // Test API connection
        const startTime = Date.now();
        const response = await apiRequest.healthCheck();
        const responseTime = Date.now() - startTime;
        
        apiTestResult.value = {
          success: response,
          message: response 
            ? `API connection successful (${responseTime}ms)` 
            : 'API connection failed'
        };
      } catch (error) {
        apiTestResult.value = {
          success: false,
          message: `API test failed: ${error.message}`
        };
      } finally {
        isTesting.value = false;
      }
    };
    
    // Log config on mount
    onMounted(() => {
      console.log('Hostname Config Loaded:', hostnameConfig);
    });
    
    return {
      hostnameConfig,
      showDebug,
      isRefreshing,
      isTesting,
      apiTestResult,
      encryptionStatusClass,
      cacheStatusClass,
      formattedLoadTime,
      refreshConfig,
      testApiRequest
    };
  }
};
</script>

<style scoped>
.hostname-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.site-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e5e5;
}

.site-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-right: 20px;
}

.site-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.config-sections {
  display: grid;
  gap: 25px;
}

.config-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.config-section h3 {
  margin: 0 0 15px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 8px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.config-item label {
  font-weight: 600;
  color: #6c757d;
  margin-right: 10px;
}

.config-item span {
  color: #495057;
}

.token-display {
  font-family: monospace;
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
}

.plugins-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.plugin-tag {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.menu-preview {
  display: grid;
  gap: 10px;
}

.menu-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 12px;
}

.menu-title {
  font-weight: 600;
  color: #495057;
  display: block;
  margin-bottom: 4px;
}

.menu-target {
  color: #6c757d;
  font-size: 0.875rem;
}

.submenu {
  margin-top: 8px;
  padding-left: 16px;
  border-left: 2px solid #dee2e6;
}

.submenu-item {
  display: block;
  padding: 4px 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.debug-info {
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 4px;
  font-size: 0.875rem;
  overflow-x: auto;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin: 30px 0;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh {
  background: #28a745;
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background: #218838;
}

.btn-debug {
  background: #6c757d;
  color: white;
}

.btn-debug:hover {
  background: #5a6268;
}

.btn-test {
  background: #007bff;
  color: white;
}

.btn-test:hover:not(:disabled) {
  background: #0056b3;
}

.action-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.api-test-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.api-test-result h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.api-test-result .success {
  color: #155724;
  background: #d4edda;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
}

.api-test-result .error {
  color: #721c24;
  background: #f8d7da;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.status-enabled {
  color: #155724 !important;
  font-weight: 600;
}

.status-disabled {
  color: #721c24 !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .hostname-info-container {
    padding: 15px;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .config-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .config-item label {
    margin-bottom: 5px;
  }
  
  .site-header {
    flex-direction: column;
    text-align: center;
  }
  
  .site-logo {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
