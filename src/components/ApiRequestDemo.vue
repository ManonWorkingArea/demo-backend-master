<template>
  <div class="api-demo">
    <h2>API Tester</h2>
    
    <!-- Status -->
    <div class="status-box">
      <div class="status-item">
        <span class="label">Status:</span>
        <span :class="apiRequest ? 'ok' : 'error'">
          {{ apiRequest ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
      <div class="status-item" v-if="apiRequest">
        <span class="label">Endpoint:</span>
        <span class="value">{{ apiRequest.baseURL }}</span>
      </div>
      <div class="status-item" v-if="tenant && tenant.child">
        <span class="label">Tenant:</span>
        <span class="value">{{ tenant.child.hostname }}</span>
      </div>
      <div class="status-item" v-if="tenant && tenant.child && tenant.child.token">
        <span class="label">Token:</span>
        <span class="value">{{ tenant.child.token.substring(0, 8) }}...</span>
      </div>
    </div>

    <!-- Request -->
    <div class="request-box">
      <div class="request-row">
        <select v-model="httpMethod" class="method">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        
        <input 
          v-model="endpoint" 
          type="text" 
          placeholder="/api/endpoint" 
          class="endpoint"
        />
        
        <button @click="sendRequest" class="send" :disabled="!apiRequest || isLoading">
          {{ isLoading ? 'Sending...' : 'Send' }}
        </button>
      </div>

      <div v-if="['POST', 'PUT'].includes(httpMethod)" class="body-row">
        <textarea 
          v-model="requestBody" 
          placeholder='{"key": "value"}'
          class="body"
        ></textarea>
      </div>
    </div>

    <!-- Quick Tests -->
    <div class="quick-box">
      <button @click="doGet" :disabled="!apiRequest || isLoading" class="quick-btn">GET Test</button>
      <button @click="doPost" :disabled="!apiRequest || isLoading" class="quick-btn">POST Test</button>
      <button @click="doPut" :disabled="!apiRequest || isLoading" class="quick-btn">PUT Test</button>
      <button @click="doDelete" :disabled="!apiRequest || isLoading" class="quick-btn">DELETE Test</button>
      <button 
        v-if="tenant && tenant.child" 
        @click="injectTenantData" 
        :disabled="!apiRequest" 
        class="quick-btn tenant-btn"
      >
        Inject Tenant
      </button>
    </div>

    <!-- Response -->
    <div v-if="response" class="response-box">
      <div class="response-header">
        <span class="status" :class="getStatusClass(response.status)">{{ response.status }}</span>
        <span class="time">{{ responseTime }}ms</span>
      </div>
      <pre class="response-body">{{ formatResponse(response) }}</pre>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-box">
      <strong>Error:</strong> {{ error }}
    </div>
  </div>
</template>

<script>
import { inject } from 'vue';

export default {
  name: 'ApiRequestDemo',
  setup() {
    // Try to inject apiRequest and tenant
    const apiRequest = inject('apiRequest', null);
    const tenant = inject('tenant', null);
    
    return {
      apiRequest,
      tenant
    };
  },
  data() {
    return {
      httpMethod: 'GET',
      endpoint: '/api/test',
      requestBody: '{"test": "data"}',
      response: null,
      error: null,
      isLoading: false,
      responseTime: 0
    };
  },
  mounted() {
    console.log('ApiRequestDemo mounted:', {
      injectedApiRequest: this.apiRequest,
      globalApiRequest: this.$apiRequest,
      hasInjection: !!this.apiRequest,
      hasGlobal: !!this.$apiRequest,
      tenant: this.tenant,
      tenantChild: this.tenant?.child
    });
    
    // Try to inject tenant data to apiRequest if available
    if (this.apiRequest && this.tenant && this.tenant.child) {
      try {
        this.apiRequest.injectTenantData(this.tenant);
        console.log('ApiRequestDemo: Successfully injected tenant data to apiRequest');
      } catch (error) {
        console.warn('ApiRequestDemo: Failed to inject tenant data:', error);
      }
    }
  },
  methods: {
    async sendRequest() {
      if (!this.apiRequest) {
        this.error = 'ApiRequest plugin not available. Check main.js configuration.';
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.response = null;
      
      const startTime = Date.now();

      try {
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(this.httpMethod) && this.requestBody) {
          try {
            body = JSON.parse(this.requestBody);
          } catch (e) {
            throw new Error('Invalid JSON in request body');
          }
        }

        const result = await this.apiRequest.apiCall(
          this.endpoint,
          this.httpMethod,
          null, // collection
          body
        );

        this.responseTime = Date.now() - startTime;
        this.response = result;
        
      } catch (err) {
        this.responseTime = Date.now() - startTime;
        this.error = err.message || 'Unknown error occurred';
        console.error('API Request Error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async doGet() {
      if (!this.apiRequest) {
        this.error = 'ApiRequest plugin not available';
        return;
      }

      this.isLoading = true;
      this.error = null;
      const startTime = Date.now();

      try {
        const result = await this.apiRequest.apiCall('/api/test', 'GET');
        this.responseTime = Date.now() - startTime;
        this.response = result;
      } catch (err) {
        this.responseTime = Date.now() - startTime;
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async doPost() {
      if (!this.apiRequest) {
        this.error = 'ApiRequest plugin not available';
        return;
      }

      this.isLoading = true;
      this.error = null;
      const startTime = Date.now();

      try {
        const result = await this.apiRequest.apiCall('/api/test', 'POST', null, { test: 'POST data' });
        this.responseTime = Date.now() - startTime;
        this.response = result;
      } catch (err) {
        this.responseTime = Date.now() - startTime;
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async doPut() {
      if (!this.apiRequest) {
        this.error = 'ApiRequest plugin not available';
        return;
      }

      this.isLoading = true;
      this.error = null;
      const startTime = Date.now();

      try {
        const result = await this.apiRequest.apiCall('/api/test', 'PUT', null, { test: 'PUT data' });
        this.responseTime = Date.now() - startTime;
        this.response = result;
      } catch (err) {
        this.responseTime = Date.now() - startTime;
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async doDelete() {
      if (!this.apiRequest) {
        this.error = 'ApiRequest plugin not available';
        return;
      }

      this.isLoading = true;
      this.error = null;
      const startTime = Date.now();

      try {
        const result = await this.apiRequest.apiCall('/api/test', 'DELETE');
        this.responseTime = Date.now() - startTime;
        this.response = result;
      } catch (err) {
        this.responseTime = Date.now() - startTime;
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    injectTenantData() {
      if (!this.apiRequest) {
        this.error = 'ApiRequest plugin not available';
        return;
      }

      if (!this.tenant || !this.tenant.child) {
        this.error = 'Tenant data not available';
        return;
      }

      try {
        this.apiRequest.injectTenantData(this.tenant);
        this.response = {
          message: 'Tenant data injected successfully',
          hostname: this.tenant.child.hostname,
          hasToken: !!this.tenant.child.token,
          tokenPreview: this.tenant.child.token ? this.tenant.child.token.substring(0, 8) + '...' : 'none'
        };
        this.error = null;
        console.log('Manual tenant injection successful');
      } catch (err) {
        this.error = `Failed to inject tenant data: ${err.message}`;
        console.error('Manual tenant injection failed:', err);
      }
    },

    formatResponse(response) {
      return JSON.stringify(response, null, 2);
    },

    getStatusClass(status) {
      if (status >= 200 && status < 300) return 'success';
      if (status >= 400 && status < 500) return 'client-error';
      if (status >= 500) return 'server-error';
      return 'info';
    }
  }
};
</script>

<style scoped>
.api-demo {
  max-width: 100%;
  margin: 0;
  padding: 8px;
  font-family: system-ui, -apple-system, sans-serif;
  background: #fff;
}

h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 500;
}

/* Status Box */
.status-box {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 13px;
  color: #666;
  min-width: 60px;
}

.value {
  font-size: 13px;
  color: #333;
  font-family: monospace;
}

.ok {
  color: #28a745;
  font-weight: 500;
  font-size: 13px;
}

.error {
  color: #dc3545;
  font-weight: 500;
  font-size: 13px;
}

/* Request Box */
.request-box {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 12px;
}

.request-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}

.method {
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  min-width: 80px;
  background: #fff;
}

.endpoint {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
}

.send {
  padding: 6px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.send:hover:not(:disabled) {
  background: #0056b3;
}

.send:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.body-row {
  margin-top: 8px;
}

.body {
  width: 100%;
  height: 80px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

/* Quick Tests */
.quick-box {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.quick-btn {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #0056b3;
}

.quick-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.quick-btn.tenant-btn {
  background: #28a745;
}

.quick-btn.tenant-btn:hover:not(:disabled) {
  background: #1e7e34;
}

/* Response */
.response-box {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  background: #fff;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.status.success {
  background: #d4edda;
  color: #155724;
}

.status.client-error,
.status.server-error {
  background: #f8d7da;
  color: #721c24;
}

.time {
  font-size: 12px;
  color: #666;
}

.response-body {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 11px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  overflow-x: auto;
}

/* Error */
.error-box {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 16px;
}

/* Mobile */
@media (max-width: 600px) {
  .api-demo {
    margin: 10px;
    padding: 12px;
  }
  
  .request-row {
    flex-direction: column;
    gap: 6px;
  }
  
  .method,
  .endpoint,
  .send {
    width: 100%;
  }
  
  .quick-box {
    flex-direction: column;
  }
  
  .quick-btn {
    width: 100%;
  }
}
</style>
