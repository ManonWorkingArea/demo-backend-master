<template>
  <div>
    <!-- Top Page Info Section -->
    <div v-if="builderData" class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs">
      <div class="flex items-center gap-3 flex-wrap">
        <font-awesome-icon :icon="['fas', 'file-alt']" class="text-blue-500 text-base" />
        <span class="font-semibold text-gray-900">{{ builderData.title || 'Untitled Page' }}</span>
        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{{ builderData.type || 'page' }}</span>
        <span>แถว: <b>{{ builderData.builder?.length || 0 }}</b></span>
        <span v-if="builderData._id" class="flex items-center gap-1">
          <span>ID:</span>
          <a
            :href="`/cms/edit/${builderData._id}`"
            class="text-blue-600 underline hover:text-blue-800 transition-colors"
            target="_blank"
            rel="noopener"
          >{{ builderData._id }}</a>
          <a
            :href="`/cms/edit/${builderData._id}`"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ml-1"
            style="height:22px;"
          >
            <font-awesome-icon :icon="['fas', 'edit']" class="mr-1 text-xs" />
            แก้ไข
          </a>
        </span>
      </div>
      <div class="text-gray-400 hidden sm:block">
        <span>{{ new Date().toLocaleString() }}</span>
      </div>
    </div>
    <!-- End Top Page Info Section -->
    <Builder v-if="stableBuilderData" 
      :key="`builder-${stableBuilderData._id}`"
      :builder-data="stableBuilderData" 
      :main-controller="controllerInstance"
      :get-builder="triggerDataLoad"
      :back-url="props.backUrl || '/default-back-url'"
      :revision-history="revisions"
      :loading-revisions="loadingRevisions"
      :block-templates="blockTemplates"
      :loading-block-templates="loadingBlockTemplates"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @update-layout="handleLayoutUpdate"
      @save-data="handleSaveFromBuilder"
      @reload-data="handleReloadFromBuilder"
      @load-revisions="handleLoadRevisions"
      @revision-rollback="handleRevisionRollback"
      @revision-branch="handleRevisionBranch"
      @revision-delete="handleRevisionDelete"
      @revision-view="handleRevisionView"
      @revision-details="handleRevisionDetails"
      @export-json="handleExportJson"
      @import-json="handleImportJson"
      @save-row-as-template="handleSaveRowAsTemplate"
      @load-block-templates="handleLoadBlockTemplates"
      @undo="handleUndo"
      @redo="handleRedo"
    />
    
    <!-- Builder Loading State -->
    <div v-else-if="!stableBuilderData" class="min-h-screen bg-gray-50">
      <!-- Loading Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs">
        <div class="flex items-center gap-3">
          <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div class="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div class="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div class="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <!-- Loading Content -->
      <div class="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div class="text-center space-y-6 max-w-md mx-4">
          <!-- Loading Icon -->
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'palette']" class="text-blue-600 text-lg" />
            </div>
          </div>
          
          <!-- Loading Text -->
          <div class="space-y-2">
            <h3 class="text-lg font-semibold text-gray-900">กำลังโหลดข้อมูล Builder</h3>
            <p class="text-gray-600 text-sm">กรุณารอสักครู่ ระบบกำลังเตรียมเครื่องมือออกแบบ...</p>
          </div>
          
          <!-- Loading Progress Simulation -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-1000 animate-pulse" style="width: 60%"></div>
          </div>
          
          <!-- Loading Steps -->
          <div class="text-xs text-gray-500 space-y-1">
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>เชื่อมต่อฐานข้อมูล</span>
            </div>
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>โหลดข้อมูลเนื้อหา</span>
            </div>
            <div class="flex items-center justify-center gap-2">
              <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>เตรียมเครื่องมือ Builder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- API Loading Overlay -->
    <div v-if="isApiLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-2xl">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">กำลังดำเนินการ...</h3>
        <p class="text-gray-600">{{ apiLoadingMessage || 'กรุณารอสักครู่' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, defineProps, getCurrentInstance, inject, computed, readonly } from 'vue';
import { useRoute } from 'vue-router';
import Builder from './Builder.vue'; // Changed from BuilderInterface
import MainController from '@/interface/template/builder/plugin/MainController.js';
import storageManager from '@/plugins/storage';

// Inject the new API system
const apiRequest = inject('apiRequest', null);
const tenant = inject('tenant', null);

const props = defineProps({
  recordId: {
    type: String,
    default: null,
  },
  backUrl: { // Added backUrl prop
    type: String,
    default: '/default-back-url' // Provide a default or make it required
  },
  builderData: {
    type: Object,
    default: null,
  },
  getBuilder: {
    type: Function,
    default: null,
  }
});

const instance = getCurrentInstance();
const builderData = ref(null); // Will hold { _id, builder: [], css: "" }
const dataLoaded = ref(false);
const controllerInstance = ref(null);
const configs = ref(storageManager.get('configs'));
const route = useRoute();

// Revision Management State - เหลือเฉพาะที่จำเป็นสำหรับ Builder
const revisions = ref([]);
const loadingRevisions = ref(false);
const revisionDescription = ref('');

// Block Templates State
const blockTemplates = ref([]);
const loadingBlockTemplates = ref(false);

// Local History State for Undo/Redo
const history = ref([]); // Single array เก็บ states ทั้งหมด
const currentHistoryIndex = ref(-1); // Index ปัจจุบันใน history array
const maxHistorySize = 50;
const isUndoRedoOperation = ref(false);
const storageKey = ref(null); // Will be set based on builder data ID

// Loading state for API operations
const isApiLoading = ref(false);
const apiLoadingMessage = ref('');

// Flag to prevent recursive updates
const isUpdating = ref(false);

// Debounce flags for API calls
const isLoadingData = ref(false);
const isSavingData = ref(false);

// Timeout to prevent getting stuck in loading state
let loadingTimeout = null;

// Provide read-only versions to prevent circular dependencies
provide('mainController', readonly(controllerInstance));
provide('builderDataRef', readonly(builderData));

// Debug API system on mount
onMounted(async () => {
  try {
    console.log('MainBuilderContainer mounted with NEW API system:', {
      hasApiRequest: !!apiRequest,
      apiRequestType: typeof apiRequest,
      hasTenant: !!tenant,
      tenantChild: tenant?.child,
      configs: configs.value
    });
    
    // Try to inject tenant data to apiRequest if available
    if (apiRequest && tenant && tenant.child) {
      try {
        apiRequest.injectTenantData(tenant);
        console.log('✅ MainBuilderContainer: Successfully injected tenant data to apiRequest');
      } catch (error) {
        console.warn('⚠️ MainBuilderContainer: Failed to inject tenant data:', error);
      }
    }
    
    // Initialize builder data loading
    if (props.builderData && Object.keys(props.builderData).length > 0) {
      builderData.value = props.builderData;
      initializeController(props.builderData);
      dataLoaded.value = true;
    } else {
      // Check if apiRequest is available before loading data
      if (!apiRequest) {
        console.error('❌ ApiRequest is not available - cannot load builder data');
        
        // Show error notification
        if (instance?.appContext?.config?.globalProperties?.$Toast) {
          const toastError = instance.appContext.config.globalProperties.$Toast({
            type: 'error',
            message: 'ระบบ API ไม่พร้อมใช้งาน กรุณาโหลดหน้าใหม่'
          });
          setTimeout(() => {
            toastError.hide();
          }, 3000);
        }
        
        // Set default data to prevent crashes
        builderData.value = {
          _id: `error_no_api_${Date.now()}`,
          title: "Error: API System Not Available",
          type: 'page',
          builder: [],
          css: ""
        };
        dataLoaded.value = true;
      } else {
        await loadBuilderData();
      }
    }
  } catch (error) {
    console.error('❌ Error in onMounted hook:', error);
    
    // Fallback to default data structure
    if (!builderData.value) {
      builderData.value = {
        _id: `error_mount_${Date.now()}`,
        title: "Error: Component Mount Failed",
        type: 'page',
        builder: [],
        css: ""
      };
      dataLoaded.value = true;
    }
    
    // Show error notification
    if (instance?.appContext?.config?.globalProperties?.$Toast) {
      const toastError = instance.appContext.config.globalProperties.$Toast({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเริ่มต้นระบบ'
      });
      setTimeout(() => {
        toastError.hide();
      }, 3000);
    }
  }
});

// History Management Functions

/**
 * Initialize history storage key based on builder data ID
 */
function initializeHistoryStorage() {
  if (builderData.value?._id) {
    storageKey.value = `builder_history_${builderData.value._id}`;
    loadHistoryFromStorage();
  }
}

/**
 * Save history to localStorage
 */
function saveHistoryToStorage() {
  if (!storageKey.value) return;
  
  try {
    const historyData = {
      history: history.value,
      currentHistoryIndex: currentHistoryIndex.value,
      timestamp: Date.now()
    };
    localStorage.setItem(storageKey.value, JSON.stringify(historyData));
    console.log('History saved to localStorage. Total states:', history.value.length, 'Current index:', currentHistoryIndex.value);
  } catch (error) {
    console.error('Error saving history to localStorage:', error);
  }
}

/**
 * Load history from localStorage
 */
function loadHistoryFromStorage() {
  if (!storageKey.value) return;
  
  try {
    const historyDataString = localStorage.getItem(storageKey.value);
    if (historyDataString) {
      const historyData = JSON.parse(historyDataString);
      history.value = historyData.history || [];
      currentHistoryIndex.value = historyData.currentHistoryIndex ?? -1;
      console.log('History loaded from localStorage. Total states:', history.value.length, 'Current index:', currentHistoryIndex.value);
    }
  } catch (error) {
    console.error('Error loading history from localStorage:', error);
    history.value = [];
    currentHistoryIndex.value = -1;
  }
}

/**
 * Clear history from localStorage and memory
 */
function clearHistory() {
  history.value = [];
  currentHistoryIndex.value = -1;
  
  if (storageKey.value) {
    try {
      localStorage.removeItem(storageKey.value);
      console.log('History cleared from localStorage');
    } catch (error) {
      console.error('Error clearing history from localStorage:', error);
    }
  }
}

/**
 * Save current state to history before making changes
 */
function saveStateToHistory() {
  console.log('saveStateToHistory: Called. isUndoRedoOperation:', isUndoRedoOperation.value);
  
  if (isUndoRedoOperation.value) {
    console.log('saveStateToHistory: Skipped - undo/redo operation in progress');
    return; // Don't save during undo/redo operations
  }
  
  if (!builderData.value) {
    console.log('saveStateToHistory: Skipped - no builderData');
    return;
  }
  
  try {
    const currentState = {
      builder: JSON.parse(JSON.stringify(builderData.value.builder || [])),
      css: builderData.value.css || '',
      timestamp: Date.now()
    };
    
    // Check if current state is different from current position
    if (currentHistoryIndex.value >= 0 && currentHistoryIndex.value < history.value.length && history.value[currentHistoryIndex.value]) {
      const currentPositionState = history.value[currentHistoryIndex.value];
      if (currentPositionState) {
        const currentStateString = JSON.stringify(currentState.builder) + currentState.css;
        const currentPositionString = JSON.stringify(currentPositionState.builder || []) + (currentPositionState.css || '');
        
        if (currentStateString === currentPositionString) {
          console.log('saveStateToHistory: Skipped - no changes detected');
          return; // No changes to save
        }
      }
    }
    
    // Remove any states after current index (for branching)
    if (currentHistoryIndex.value >= 0) {
      history.value = history.value.slice(0, currentHistoryIndex.value + 1);
      console.log('saveStateToHistory: Removed future states after current index');
    }
    
    // Add new state
    history.value.push(currentState);
    currentHistoryIndex.value = history.value.length - 1;
    console.log('saveStateToHistory: Added new state. Total rows:', currentState.builder.length);
    
    // Remove old items if exceeding max size
    if (history.value.length > maxHistorySize) {
      history.value.shift();
      currentHistoryIndex.value--;
      console.log('saveStateToHistory: Removed old state (exceeded max size)');
    }
    
    // Save to localStorage
    saveHistoryToStorage();
    
    console.log('saveStateToHistory: State saved. Total states:', history.value.length, 'Current index:', currentHistoryIndex.value);
  } catch (error) {
    console.error('saveStateToHistory: Error occurred:', error);
  }
}

/**
 * Undo last change
 */
function performUndo() {
  if (currentHistoryIndex.value <= 0 || !history.value || history.value.length === 0) {
    console.log('No more actions to undo');
    return false;
  }
  
  console.log('performUndo: Starting undo operation. Current index:', currentHistoryIndex.value, 'Total states:', history.value.length);
  
  // Set flag to prevent adding to history during undo
  isUndoRedoOperation.value = true;
  
  try {
    // Move to previous state
    currentHistoryIndex.value--;
    const previousState = history.value[currentHistoryIndex.value];
    
    if (!previousState) {
      console.error('performUndo: Previous state is null or undefined');
      return false;
    }
    
    console.log('performUndo: Moving to index:', currentHistoryIndex.value);
    
    // Ensure builderData.value exists before updating
    if (!builderData.value) {
      console.error('performUndo: builderData.value is null');
      return false;
    }
    
    // Update builderData directly (this will trigger Vue reactivity)
    builderData.value.builder = JSON.parse(JSON.stringify(previousState.builder || []));
    builderData.value.css = previousState.css || '';
    
    // Force update controller state after builderData is updated
    if (controllerInstance.value?.state) {
      // Use nextTick to ensure Vue reactivity completes first
      setTimeout(() => {
        if (controllerInstance.value?.state && !isUpdating.value) {
          try {
            const state = controllerInstance.value.state.getState();
            if (state) {
              state.rows = JSON.parse(JSON.stringify(previousState.builder || []));
              controllerInstance.value.state.setCssCode(previousState.css || '');
              console.log('performUndo: Controller state updated');
            }
          } catch (error) {
            console.error('performUndo: Error updating controller state:', error);
          }
        }
      }, 10);
    }
    
    // Save to localStorage
    saveHistoryToStorage();
    
    console.log('performUndo: Completed. Current index:', currentHistoryIndex.value, 'Total states:', history.value.length);
    
    return true;
  } catch (error) {
    console.error('performUndo: Error occurred:', error);
    return false;
  } finally {
    // Reset flag after sufficient delay
    setTimeout(() => {
      isUndoRedoOperation.value = false;
      console.log('performUndo: Flag reset, operation complete');
    }, 300);
  }
}

/**
 * Redo last undone change
 */
function performRedo() {
  if (currentHistoryIndex.value >= history.value.length - 1 || !history.value || history.value.length === 0) {
    console.log('No more actions to redo');
    return false;
  }
  
  console.log('performRedo: Starting redo operation. Current index:', currentHistoryIndex.value, 'Total states:', history.value.length);
  
  // Set flag to prevent adding to history during redo
  isUndoRedoOperation.value = true;
  
  try {
    // Move to next state
    currentHistoryIndex.value++;
    const nextState = history.value[currentHistoryIndex.value];
    
    if (!nextState) {
      console.error('performRedo: Next state is null or undefined');
      return false;
    }
    
    console.log('performRedo: Moving to index:', currentHistoryIndex.value);
    
    // Ensure builderData.value exists before updating
    if (!builderData.value) {
      console.error('performRedo: builderData.value is null');
      return false;
    }
    
    // Update builderData directly (this will trigger Vue reactivity)
    builderData.value.builder = JSON.parse(JSON.stringify(nextState.builder || []));
    builderData.value.css = nextState.css || '';
    
    // Force update controller state after builderData is updated
    if (controllerInstance.value?.state) {
      // Use nextTick to ensure Vue reactivity completes first
      setTimeout(() => {
        if (controllerInstance.value?.state && !isUpdating.value) {
          try {
            const state = controllerInstance.value.state.getState();
            if (state) {
              state.rows = JSON.parse(JSON.stringify(nextState.builder || []));
              controllerInstance.value.state.setCssCode(nextState.css || '');
              console.log('performRedo: Controller state updated');
            }
          } catch (error) {
            console.error('performRedo: Error updating controller state:', error);
          }
        }
      }, 10);
    }
    
    // Save to localStorage
    saveHistoryToStorage();
    
    console.log('performRedo: Completed. Current index:', currentHistoryIndex.value, 'Total states:', history.value.length);
    
    return true;
  } catch (error) {
    console.error('performRedo: Error occurred:', error);
    return false;
  } finally {
    // Reset flag after sufficient delay
    setTimeout(() => {
      isUndoRedoOperation.value = false;
      console.log('performRedo: Flag reset, operation complete');
    }, 300);
  }
}

/**
 * Check if undo is available - computed property to prevent infinite re-renders
 */
const canUndo = computed(() => {
  return currentHistoryIndex.value > 0;
});

/**
 * Check if redo is available - computed property to prevent infinite re-renders
 */
const canRedo = computed(() => {
  return currentHistoryIndex.value < history.value.length - 1;
});

/**
 * Stable builder data to prevent unnecessary re-renders
 */
const stableBuilderData = computed(() => {
  if (!builderData.value || !dataLoaded.value) {
    return null;
  }
  
  // Return a stable reference unless the core data has actually changed
  return {
    _id: builderData.value._id,
    title: builderData.value.title,
    type: builderData.value.type,
    builder: builderData.value.builder || [],
    css: builderData.value.css || ''
  };
});

// ===========================================
// NEW API SYSTEM FUNCTIONS (Temporary Testing)
// ===========================================

/**
 * Helper function to make API calls using the new system
 */
async function makeApiCall(endpoint, method = 'GET', body = null, collection = null, useProxy = false) {
  console.log('🔄 Making API call:', { endpoint, method, body, collection, useProxy });
  
  try {
    // Use new API system only
    if (!apiRequest) {
      throw new Error('ApiRequest system is not available. Please check injection.');
    }
    
    console.log('📡 Using new ApiRequest system');
    
    let result;
    
    // Only use proxy if explicitly requested or for specific operations like cache clearing
    if (useProxy) {
      console.log('🔄 Using proxy mode (explicitly requested)');
      result = await apiRequest.apiCallWithProxy(endpoint, method, collection, body);
    } else {
      console.log('🔄 Using direct API call');
      // Don't pass collection parameter since endpoint already has api/ prefix
      result = await apiRequest.apiCall(endpoint, method, null, body);
    }
    
    console.log('✅ New API call successful:', result);
    
    // Auto clear cache for PUT operations on post endpoints
    if (method === 'PUT' && endpoint.includes('post/') && (result?.status === 200 || result?.data)) {
      try {
        console.log('🔄 Auto-clearing cache after PUT operation');
        
        // Update loading message if already loading
        if (isApiLoading.value) {
          apiLoadingMessage.value = 'กำลังล้างแคช...';
        }
        
        // Use clearCache method from apiRequest (this may use proxy internally)
        const cacheResult = await apiRequest.clearCache();
        
        if (cacheResult.success) {
          console.log('✅ Auto cache clear successful:', cacheResult.hostname);
        } else {
          console.warn('⚠️ Auto cache clear failed:', cacheResult.error);
        }
      } catch (cacheError) {
        console.warn('❌ Auto cache clear error (non-critical):', cacheError);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ API call failed:', error);
    
    // Only fallback to proxy mode for specific CORS errors and if not already using proxy
    if (!useProxy && (error.message.includes('CORS') || 
                     error.message.includes('Cross-Origin') || 
                     error.message.includes('blocked by CORS'))) {
      console.log('🔄 CORS error detected, retrying with proxy mode');
      return await makeApiCall(endpoint, method, body, collection, true);
    }
    
    throw error;
  }
}

/**
 * Helper function for fetch-based API calls (query endpoints)
 */
async function makeQueryCall(endpoint, queryBody) {
  console.log('🔍 Making query call:', { endpoint, queryBody });
  
  try {
    // Always try to use apiRequest for queries first
    if (apiRequest) {
      console.log('📡 Using new ApiRequest system for query');
      
      // Determine the correct endpoint and collection
      let collection = null;
      let cleanEndpoint = endpoint;
      
      // Handle different endpoint formats
      if (endpoint.includes('://')) {
        // Full URL format: extract collection from URL
        const urlParts = endpoint.split('/');
        const apiIndex = urlParts.findIndex(part => part === 'api');
        if (apiIndex >= 0 && urlParts[apiIndex + 1]) {
          collection = urlParts[apiIndex + 1].replace('/query', '');
          cleanEndpoint = `api/${collection}/query`;
        }
      } else if (endpoint.startsWith('api/')) {
        // api/collection format - already has api/ prefix
        collection = endpoint.replace('api/', '').replace('/query', '');
        cleanEndpoint = `api/${collection}/query`;
      } else {
        // collection format - add api/ prefix
        collection = endpoint.replace('/query', '');
        cleanEndpoint = `api/${collection}/query`;
      }
      
      console.log('🔍 Query details:', { collection, cleanEndpoint, queryBody });
      
      // Use direct API call first, no automatic proxy fallback
      console.log('🔄 Using direct API query call');
      // Don't pass collection parameter since endpoint already has proper format
      const result = await apiRequest.apiCall(cleanEndpoint, 'POST', null, queryBody);
      console.log('✅ Direct query call successful:', result);
      return result;
    }
    
    // Fallback to direct fetch only if apiRequest is not available
    console.log('📡 Falling back to direct fetch for query (no apiRequest available)');
    
    // Build the full URL with proper /api/ prefix
    let fullUrl;
    if (endpoint.includes('://')) {
      // Full URL provided (legacy support)
      fullUrl = endpoint;
    } else {
      // Relative endpoint - build full URL
      const baseUrl = 'https://gateway.cloudrestfulapi.com';
      const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
      const queryEndpoint = apiEndpoint.endsWith('/query') ? apiEndpoint : `${apiEndpoint}/query`;
      fullUrl = `${baseUrl}${queryEndpoint}`;
    }
    
    console.log('📍 Using fallback query URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'client-token-key': configs.value.key 
      },
      body: JSON.stringify(queryBody)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fallback query call successful:', data);
      return { data: data.data, total: data.total, status: response.status };
    } else {
      throw new Error(`Fallback query failed with status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Query call failed:', error);
    
    // Only try proxy mode for specific CORS errors
    if (apiRequest && (error.message.includes('CORS') || 
                      error.message.includes('Cross-Origin') || 
                      error.message.includes('blocked by CORS'))) {
      console.log('🔄 CORS error detected, trying proxy mode for query');
      try {
        const collection = endpoint.replace('/query', '');
        const cleanEndpoint = `${collection}/query`;
        const proxyResult = await apiRequest.apiCallWithProxy(cleanEndpoint, 'POST', collection, queryBody);
        console.log('✅ Proxy query call successful:', proxyResult);
        return proxyResult;
      } catch (proxyError) {
        console.error('❌ Proxy query also failed:', proxyError);
      }
    }
    
    throw error;
  }
}

// ใช้ getData จริงจาก API แทน mock function (Updated for new API system)
async function realGetData(dataItem) {
  console.log('🔄 realGetData called with:', dataItem);
  
  try {
    // ใช้ makeApiCall โดยไม่ส่ง collection parameter เนื่องจาก endpoint มี /api/ prefix แล้ว
    const response = await makeApiCall(`api/post/${dataItem}`, 'GET');

    if (response?.data) {
      console.log('✅ realGetData success:', response.data);
      return response.data; // data ที่ได้จาก API จะมี _id, title, builder, css
    } else {
      console.warn('⚠️ No data in response, using default');
      // กำหนดค่า default ให้ return โครงสร้างที่ InnerBuilder คาดหวัง
      const defaultData = { 
        builder: [], 
        css: "", 
        _id: dataItem, 
        title: "Error: No data"
      };
      return defaultData;
    }
  } catch (error) {
    console.error('❌ realGetData error:', error);
    // กรณี error ก็ควร return โครงสร้างข้อมูล default
    const errorData = { 
      builder: [], 
      css: "", 
      _id: dataItem, 
      title: "Error: Fetch failed" 
    };
    return errorData;
  }
}

async function loadBuilderData() {
  // Prevent concurrent loading
  if (isLoadingData.value) {
    console.log('loadBuilderData: Already loading, skipping');
    return;
  }
  
  isLoadingData.value = true;
  dataLoaded.value = false;
  let responseData = null;
  let recordIdToUse = null;

  // Set timeout to prevent getting stuck in loading state
  if (loadingTimeout) clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => {
    if (isLoadingData.value) {
      console.warn('Loading timeout reached, forcing completion');
      isLoadingData.value = false;
      dataLoaded.value = true;
    }
  }, 30000); // 30 second timeout

  try {
    // Always prioritize route.params.id
    if (route && route.params && route.params.id) {
      recordIdToUse = route.params.id;
      responseData = await realGetData(recordIdToUse);
    } else if (props.getBuilder && typeof props.getBuilder === 'function') {
      // Fallback to getBuilder if route.params.id is not available
      responseData = await props.getBuilder();
      // Assuming getBuilder's response might contain _id, which will be used later
    } else if (props.recordId && props.recordId !== "null" && props.recordId !== "undefined") {
      // Fallback to props.recordId if route.params.id and getBuilder are not available/used
      recordIdToUse = props.recordId;
      responseData = await realGetData(recordIdToUse);
    } else {
      // No valid recordId from route, getBuilder, or props. Initializing with new data structure.
      responseData = {
        _id: `new_no_id_${Date.now()}`,
        title: "New Page (No Record ID)",
        builder: [],
        css: "",
      };
    }

    // Determine _id and title for builderData.value
    // recordIdToUse would be from route.params.id or props.recordId
    // responseData._id would be from realGetData or props.getBuilder
    const finalId = recordIdToUse || 
                    (responseData ? responseData._id : null) || 
                    (builderData.value ? builderData.value._id : `new_empty_${Date.now()}`);

    const finalTitle = (responseData ? responseData.title : null) || 
                       (builderData.value ? builderData.value.title : `Untitled Page`);

    // พยายามดึง type จาก responseData, ถ้าไม่มีให้เป็น 'page' (หรือค่า default อื่นๆที่เหมาะสม)
    const finalType = (responseData ? responseData.type : null) || 'page'; 

    let resolvedBuilder = [];
    let resolvedCss = "";

    if (responseData) {
        // Builder data: use if it's an array, otherwise default to empty array
        if (Array.isArray(responseData.builder)) {
            resolvedBuilder = responseData.builder;
        }
        // CSS data: use if it's a string, otherwise default to empty string
        if (typeof responseData.css === 'string') {
            resolvedCss = responseData.css;
        }
        // If responseData exists but builder/css are not in the expected format,
        // they remain as their defaults (empty array / empty string).
    }
    // If responseData was null/undefined, resolvedBuilder and resolvedCss also remain default.

    builderData.value = {
        _id: finalId,
        title: finalTitle,
        type: finalType,
        builder: resolvedBuilder,
        css: resolvedCss,
    };

    initializeController(builderData.value); 
    dataLoaded.value = true;
    
    // Initialize history storage after data is loaded
    initializeHistoryStorage();
  } catch (error) {
    console.error("Error in loadBuilderData:", error);
    builderData.value = {
      _id: props.recordId || `new_error_${Date.now()}`,
      title: `Error: Fetch Failed for ${props.recordId || 'New Page'}`,
      type: 'page',
      builder: [],
      css: "",
    };
  } finally {
    // Always reset loading flag and clear timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    isLoadingData.value = false;
  }
}

function initializeController(data) { // data is expected to be { _id, builder: [], css: "" }
  // Add defensive checks
  if (!data || typeof data !== 'object') {
    console.warn('initializeController: Invalid data provided');
    return;
  }

  const controllerConfig = {
    builderData: data, // MainController's constructor or initialize should expect this structure
    getBuilder: triggerDataLoad, // Pass the function for MainController if it still needs it
    backUrl: props.backUrl 
  };

  if (!controllerInstance.value) {
    // เปลี่ยนเป็น async with better error handling
    MainController.createInstance(controllerConfig)
      .then(instance => {
        if (instance && !controllerInstance.value) {
          controllerInstance.value = instance;
          console.log('Controller instance created successfully');
        }
      })
      .catch(error => {
        console.error('Error creating controller instance:', error);
      });
  } else {
    // Add safety check before calling initialize
    if (controllerInstance.value.initialize && typeof controllerInstance.value.initialize === 'function') {
      try {
        controllerInstance.value.initialize(data);
        console.log('Controller instance re-initialized');
      } catch (error) {
        console.error('Error re-initializing controller:', error);
      }
    }
  }
}

async function triggerDataLoad() {
  // Prevent concurrent data loading
  if (isLoadingData.value) {
    console.log('triggerDataLoad: Already loading, returning current data');
    return builderData.value;
  }
  
  await loadBuilderData(); 
  return builderData.value; // Return the updated data structure
}

async function handleLayoutUpdate(newLayout) {
  // Prevent recursive calls
  if (isUpdating.value) {
    console.log('handleLayoutUpdate: Skipping - already updating');
    return;
  }

  // Validate inputs
  if (!builderData.value || !newLayout) {
    console.log('handleLayoutUpdate: Skipped - invalid builderData or newLayout');
    return;
  }

  console.log('handleLayoutUpdate: Called with isUndoRedoOperation:', isUndoRedoOperation.value);
  console.log('handleLayoutUpdate: Received newLayout:', {
    hasBuilder: !!newLayout?.builder,
    builderLength: newLayout?.builder ? newLayout.builder.length : 'undefined',
    hasCss: !!newLayout?.css,
    cssLength: newLayout?.css ? newLayout.css.length : 'undefined',
    isUndoRedoOperation: isUndoRedoOperation.value
  });

  try {
    isUpdating.value = true;
    let changed = false;
    
    // Save current state to history before making changes
    if (!isUndoRedoOperation.value) {
      console.log('handleLayoutUpdate: Saving state to history before changes');
      saveStateToHistory();
    } else {
      console.log('handleLayoutUpdate: Skipping history save - undo/redo operation');
    }
    
    // Check for builder changes with safer comparison
    if (Array.isArray(newLayout.builder)) {
      const currentBuilderString = JSON.stringify(builderData.value.builder || []);
      const newBuilderString = JSON.stringify(newLayout.builder);
      
      if (currentBuilderString !== newBuilderString) {
        console.log('handleLayoutUpdate: Builder data changed - OLD length:', builderData.value.builder?.length, 'NEW length:', newLayout.builder.length);
        builderData.value.builder = [...newLayout.builder]; // Create a copy to avoid reference issues
        changed = true;
      }
    }
    
    // Check for CSS changes
    if (typeof newLayout.css === 'string' && builderData.value.css !== newLayout.css) {
      console.log('handleLayoutUpdate: CSS data changed');
      builderData.value.css = newLayout.css;
      changed = true;
    }

    if (changed) {
      console.log('handleLayoutUpdate: Data updated in memory only (localStorage history saved)');
      
      // Update controller state if needed - but avoid circular updates
      if (controllerInstance.value?.state && !isUndoRedoOperation.value) {
        // Use nextTick to ensure Vue reactivity completes first
        setTimeout(() => {
          if (controllerInstance.value?.state && !isUpdating.value) {
            try {
              const state = controllerInstance.value.state.getState();
              if (state && Array.isArray(newLayout.builder)) {
                state.rows = [...newLayout.builder]; // Create copy
                controllerInstance.value.state.setCssCode(newLayout.css || '');
                console.log('handleLayoutUpdate: Controller state updated');
              }
            } catch (error) {
              console.error('handleLayoutUpdate: Error updating controller state:', error);
            }
          }
        }, 10);
      }
    } else {
      console.log('handleLayoutUpdate: No changes detected');
    }
  } catch (error) {
    console.error('handleLayoutUpdate: Error occurred:', error);
  } finally {
    // Always reset the flag after a short delay
    setTimeout(() => {
      isUpdating.value = false;
    }, 50);
  }
}

// Function for Test Button: Reload Data
async function manualLoadData() {
  await loadBuilderData();
  const toastInfo = instance.appContext.config.globalProperties.$Toast({
    type: 'success', // Mapping 'info' to 'success'
    message: 'ข้อมูลถูกโหลดใหม่แล้ว'
  });
  setTimeout(() => {
    toastInfo.hide();
  }, 800); // 2000ms (swal) - 1200ms (Toast hide process) = 800ms delay
}

// Debug function to check current state
function debugCurrentState() {
  console.log('=== DEBUG CURRENT STATE ===');
  console.log('builderData.value:', builderData.value);
  console.log('controllerInstance.value exists?', !!controllerInstance.value);
  
  if (controllerInstance.value) {
    console.log('controller.state exists?', !!controllerInstance.value.state);
    if (controllerInstance.value.state) {
      const state = controllerInstance.value.state.getState();
      console.log('state.rows:', state.rows);
      console.log('state.rows is array?', Array.isArray(state.rows));
      console.log('state.rows length:', state.rows ? state.rows.length : 'undefined');
    }
  }
  console.log('=== END DEBUG ===');
}

// Enhanced manualSaveData with revision system
async function manualSaveData() {
  // Prevent concurrent saving
  if (isSavingData.value) {
    console.log('manualSaveData: Already saving, skipping');
    return;
  }
  
  isSavingData.value = true;
  
  // Debug current state first
  debugCurrentState();

  if (builderData.value && builderData.value._id) {
    try {
      // Show loading overlay
      isApiLoading.value = true;
      apiLoadingMessage.value = 'กำลังเตรียมข้อมูลสำหรับบันทึก...';
      
      let latestBuilderData = [];
      let latestCssData = "";
      
      // Try multiple sources for builder data
      if (controllerInstance.value?.state?.getState) {
        const state = controllerInstance.value.state.getState();
        if (state.rows && Array.isArray(state.rows)) {
          latestBuilderData = [...state.rows]; // Create copy
          console.log('manualSaveData: Got data from controller state:', latestBuilderData.length, 'rows');
        }
        
        const css = controllerInstance.value.state.getCssCode();
        if (css) {
          latestCssData = css;
          console.log('manualSaveData: Got CSS from controller state:', css.length, 'characters');
        }
      }
      
      // Fallback to builderData.value
      if (!latestBuilderData || latestBuilderData.length === 0) {
        if (builderData.value.builder && Array.isArray(builderData.value.builder)) {
          latestBuilderData = [...builderData.value.builder]; // Create copy
          console.log('manualSaveData: Fallback to builderData.value.builder:', latestBuilderData.length, 'rows');
        } else {
          console.warn('manualSaveData: No builder data found anywhere!');
          latestBuilderData = [];
        }
      }
      
      if (!latestCssData && builderData.value.css) {
        latestCssData = builderData.value.css;
        console.log('manualSaveData: Fallback to builderData.value.css');
      }

      // Ensure we have arrays/strings
      if (!Array.isArray(latestBuilderData)) {
        console.warn('manualSaveData: latestBuilderData is not array, converting');
        latestBuilderData = [];
      }
      
      if (typeof latestCssData !== 'string') {
        latestCssData = String(latestCssData || '');
      }

      // Update builderData.value for consistency
      builderData.value.builder = latestBuilderData;
      builderData.value.css = latestCssData;

      // Final validation
      console.log('manualSaveData: Final validation:', {
        builderIsArray: Array.isArray(latestBuilderData),
        builderRowsCount: latestBuilderData.length,
        cssIsString: typeof latestCssData === 'string',
        cssLength: latestCssData.length,
        title: builderData.value.title,
        id: builderData.value._id
      });

      const saveData = {
        builder: latestBuilderData,
        css: latestCssData,
        title: builderData.value.title 
      };

      // Final check of request body
      console.log('manualSaveData: Sending request with builder rows:', saveData.builder.length);

      // Update loading message
      apiLoadingMessage.value = 'กำลังบันทึกข้อมูลและเคลียร์แคช...';

      // Save main data using new API system โดยไม่ส่ง collection parameter
      const response = await makeApiCall(`api/post/${builderData.value._id}`, 'PUT', saveData);

      if (response?.status === 200 || response?.data) {
        // Update loading message for revision creation
        apiLoadingMessage.value = 'กำลังสร้าง revision...';
        
        // Create revision after successful save (cache already cleared by makeApiCall)
        await createRevision(latestBuilderData, latestCssData);
        
        // Hide loading overlay
        isApiLoading.value = false;
        
        const toastManualSuccess = instance.appContext.config.globalProperties.$Toast({
          type: 'success',
          message: 'ข้อมูลปัจจุบันถูกส่งไปบันทึกแล้ว (สร้าง revision เรียบร้อย + clear cache)'
        });
        setTimeout(() => {
          toastManualSuccess.hide();
        }, 1800);
        console.log('Manual save completed successfully, keeping current state');
      } else {
        // Hide loading overlay
        isApiLoading.value = false;
        
        const toastManualError = instance.appContext.config.globalProperties.$Toast({
          type: 'error',
          message: `ไม่สามารถบันทึกข้อมูลได้ (response: ${JSON.stringify(response)})`
        });
        setTimeout(() => {
          toastManualError.hide();
        }, 1800);
      }
    } catch (error) {
      // Hide loading overlay on error
      isApiLoading.value = false;
      
      console.error('manualSaveData: Error occurred:', error);
      const toastManualCatchError = instance.appContext.config.globalProperties.$Toast({
        type: 'error',
        message: 'การเชื่อมต่อมีปัญหา ไม่สามารถบันทึกข้อมูลได้'
      });
      setTimeout(() => {
        toastManualCatchError.hide();
      }, 1800);
    }
  } else {
    const toastWarning = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'ยังไม่มีข้อมูลให้บันทึก หรือไม่มี ID ของข้อมูล'
    });
    setTimeout(() => {
      toastWarning.hide();
    }, 1800);
  }
  
  // Always reset saving flag
  isSavingData.value = false;
}

// Revision Management Functions (Updated for new API system)
async function createRevision(builderDataArray, cssData) {
  try {
    // Update loading message for revision creation
    if (isApiLoading.value) {
      apiLoadingMessage.value = 'กำลังสร้าง revision ข้อมูล...';
    }
    
    const revisionData = {
      post_id: builderData.value._id,
      builder_data: builderDataArray,
      css_data: cssData,
      title: builderData.value.title,
      description: revisionDescription.value || `Auto-save at ${new Date().toLocaleString()}`,
      created_at: new Date().toISOString(),
      user_id: configs.value.user?.id || 'unknown',
      user_name: configs.value.user?.name || 'ไม่ระบุ',
      is_current: false,
      version: Date.now()
    };

    console.log('🔄 Creating revision with new API system:', revisionData);

    // ใช้ makeApiCall โดยไม่ส่ง collection parameter
    const response = await makeApiCall('api/post_revision', 'POST', revisionData);

    if (response?.status === 200 || response?.data) {
      console.log('✅ Revision created successfully:', response.data || response);
      revisionDescription.value = ''; // Reset description
      await loadRevisions(); // Refresh revision list
    }
  } catch (error) {
    console.error('❌ Error creating revision:', error);
  }
}

async function loadRevisions() {
  if (!builderData.value?._id) return;
  
  try {
    loadingRevisions.value = true;
    
    console.log('🔄 Loading revisions with new API system for post:', builderData.value._id);
    
    // ใช้ query endpoint แทน search
    const queryBody = {
      method: 'find',
      args: [
        {
          $and: [
            { post_id: builderData.value._id }
          ]
        }
      ],
      sort: { created_at: -1 }, // เรียงลำดับตามวันที่ล่าสุดก่อน
      paging: { page: 1, limit: 500 }
    };

    // ใช้ makeQueryCall กับ collection name โดยตรง
    const response = await makeQueryCall("post_revision", queryBody);

    if (response?.data) {
      revisions.value = response.data || [];
      console.log('✅ Loaded revisions:', revisions.value.length);
      console.log('Total revisions available:', response.total);
    } else {
      console.error('❌ Error response from loadRevisions');
      revisions.value = [];
    }
  } catch (error) {
    console.error('❌ Error loading revisions:', error);
    revisions.value = [];
  } finally {
    loadingRevisions.value = false;
  }
}

async function rollbackToRevision(revision) {
  try {
    if (!revision || !revision._id) {
      console.error('Invalid revision data');
      return false;
    }

    // Update current data with revision data
    builderData.value.builder = revision.builder_data || [];
    builderData.value.css = revision.css_data || '';
    
    // Update controller state
    if (controllerInstance.value?.state) {
      controllerInstance.value.state.getState().rows = revision.builder_data || [];
      controllerInstance.value.state.setCssCode(revision.css_data || '');
    }

    const toastRollback = instance.appContext.config.globalProperties.$Toast({
      type: 'success',
      message: `กลับไปยัง revision: ${revision.description}`
    });
    setTimeout(() => {
      toastRollback.hide();
    }, 2000);
    
    console.log('Rolled back to revision:', revision._id);
    return true;
  } catch (error) {
    console.error('Error during rollback:', error);
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการ rollback'
    });
    setTimeout(() => {
      toastError.hide();
    }, 1800);
    return false;
  }
}

// Create branch from revision (Updated for new API system)
async function createBranchFromRevision(revision, branchName) {
  try {
    console.log('🔄 Creating branch from revision with new API system:', { revision, branchName });
    
    const branchData = {
      title: `${builderData.value.title} (${branchName})`,
      builder: revision.builder_data || [],
      css: revision.css_data || '',
      type: builderData.value.type || 'page',
      original_post_id: builderData.value._id,
      revision_id: revision._id,
      branch_name: branchName,
      created_at: new Date().toISOString(),
      status: 'draft'
    };

    console.log('Branch data to create:', branchData);

    // ใช้ makeApiCall โดยไม่ส่ง collection parameter
    const response = await makeApiCall('api/post', 'POST', branchData);

    if (response?.status === 200 || response?.data) {
      console.log('✅ Branch created successfully:', response.data || response);
      
      const toastBranch = instance.appContext.config.globalProperties.$Toast({
        type: 'success',
        message: `สร้าง branch "${branchName}" สำเร็จแล้ว`
      });
      setTimeout(() => {
        toastBranch.hide();
      }, 2000);
      
      // Reset branch name input
      if (branchName.value !== undefined) {
        branchName.value = '';
      }
      
      return response.data || response;
    } else {
      throw new Error(`Branch creation failed with response: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    console.error('❌ Error creating branch:', error);
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการสร้าง branch'
    });
    setTimeout(() => {
      toastError.hide();
    }, 1800);
    
    throw error; // Re-throw สำหรับ caller
  }
}

// Delete revision (Updated for new API system)
async function deleteRevision(revisionId) {
  try {
    console.log('🔄 Deleting revision with new API system:', revisionId);
    
    if (!revisionId) {
      console.error('❌ Invalid revision ID');
      return false;
    }

    // ใช้ query endpoint สำหรับการลบด้วย deleteOne method
    const deleteQuery = {
      method: 'deleteOne',
      args: [
        { _id: revisionId }
      ]
    };

    console.log('Delete query:', deleteQuery);

    // ใช้ makeQueryCall กับ collection name โดยตรง
    const response = await makeQueryCall('post_revision', deleteQuery);

    if (response?.status === 200 || response?.data || response?.acknowledged) {
      console.log('✅ Revision deleted successfully:', revisionId);
      
      const toastDelete = instance.appContext.config.globalProperties.$Toast({
        type: 'success',
        message: 'ลบ revision สำเร็จแล้ว'
      });
      setTimeout(() => {
        toastDelete.hide();
      }, 1800);
      
      await loadRevisions(); // Refresh revision list
      return true;
    } else {
      throw new Error(`Delete failed with response: ${JSON.stringify(response)}`);
    }
  } catch (error) {
    console.error('Error deleting revision:', error);
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการลบ revision'
    });
    setTimeout(() => {
      toastError.hide();
    }, 1800);
    return false;
  }
}

// Get revision details (Updated for new API system)
async function getRevisionDetails(revisionId) {
  try {
    console.log('🔄 Getting revision details with new API system:', revisionId);
    
    // ใช้ query endpoint สำหรับการดึงข้อมูล revision รายการเดียว
    const queryData = {
      method: 'findOne',
      args: [
        { _id: revisionId }
      ]
    };

    console.log('Revision details query:', queryData);

    // ใช้ makeQueryCall กับ collection name โดยตรง
    const response = await makeQueryCall('post_revision', queryData);
    
    if (response?.status === 200 || response?.data) {
      const responseData = response.data || response;
      console.log('✅ Revision details loaded:', responseData.data || responseData);
      return responseData.data || responseData;
    }
    
    console.warn('⚠️ No revision details found for ID:', revisionId);
    return null;
  } catch (error) {
    console.error('Error loading revision details:', error);
    return null;
  }
}

async function viewRevisionDetails(revision) {
  try {
    const details = await getRevisionDetails(revision._id);
    if (details) {
      // ส่งข้อมูลกลับไปให้ Builder จัดการการแสดงผล
      return {
        id: details._id,
        description: details.description,
        created: new Date(details.created_at).toLocaleString(),
        builderRows: details.builder_data?.length || 0,
        cssLength: details.css_data?.length || 0,
        user: details.user_name || 'ไม่ระบุ',
        builderData: details.builder_data,
        cssData: details.css_data
      };
    }
    return null;
  } catch (error) {
    console.error('Error viewing revision details:', error);
    return null;
  }
}

// Handler for save event from Builder
async function handleSaveFromBuilder() {
  console.log('handleSaveFromBuilder: Called');
  console.log('handleSaveFromBuilder: Current builderData.value:', {
    hasBuilder: !!builderData.value?.builder,
    builderLength: builderData.value?.builder ? builderData.value.builder.length : 'undefined',
    hasCss: !!builderData.value?.css
  });
  await manualSaveData();
  
  // Clear history after successful save and start fresh
  clearHistory();
  console.log('History cleared after save, starting fresh');
}

// Handler for reload event from Builder  
async function handleReloadFromBuilder() {
  await manualLoadData();
}

// Handler for load revisions event from Builder
async function handleLoadRevisions() {
  await loadRevisions();
}

// Handler for revision rollback from Builder
async function handleRevisionRollback(revision) {
  return await rollbackToRevision(revision);
}

// Handler for revision branch creation from Builder
async function handleRevisionBranch(data) {
  const { revision, branchName } = data;
  return await createBranchFromRevision(revision, branchName);
}

// Handler for revision deletion from Builder
async function handleRevisionDelete(revisionId) {
  return await deleteRevision(revisionId);
}

// Handler for viewing revision details from Builder
async function handleRevisionView(revision) {
  return await viewRevisionDetails(revision);
}

// Handler for getting revision details from Builder
async function handleRevisionDetails(revisionId) {
  return await getRevisionDetails(revisionId);
}

// Handler for exporting JSON
async function handleExportJson() {
  try {
    // รวบรวมข้อมูลจาก builderData และ controller
    const exportData = {
      metadata: {
        title: builderData.value?.title || 'Untitled',
        type: builderData.value?.type || 'page',
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        exportedBy: 'Builder System',
        originalId: builderData.value?._id
      },
      builder: [],
      css: '',
      settings: {
        responsive: true
      }
    };

    // ดึงข้อมูล builder จาก controller state หรือ builderData
    if (controllerInstance.value?.state?.getState) {
      const state = controllerInstance.value.state.getState();
      exportData.builder = state.rows || [];
      exportData.css = controllerInstance.value.state.getCssCode() || '';
    } else if (builderData.value) {
      exportData.builder = builderData.value.builder || [];
      exportData.css = builderData.value.css || '';
    }

    // สร้างชื่อไฟล์
    const fileName = `${(exportData.metadata.title || 'builder').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    
    // สร้าง Blob และ download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    console.log('JSON exported successfully:', fileName);
    
    // แสดง toast notification
    const toastSuccess = instance.appContext.config.globalProperties.$Toast({
      type: 'success',
      message: `ส่งออกข้อมูลสำเร็จ: ${fileName}`
    });
    setTimeout(() => {
      toastSuccess.hide();
    }, 2000);
    
  } catch (error) {
    console.error('Error exporting JSON:', error);
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการส่งออกข้อมูล'
    });
    setTimeout(() => {
      toastError.hide();
    }, 1800);
  }
}

// Handler for importing JSON
async function handleImportJson(importedData) {
  try {
    if (!importedData || !Array.isArray(importedData.builder)) {
      throw new Error('Invalid import data structure');
    }

    const importMode = importedData.importMode || 'replace'; // default เป็น replace
    console.log('handleImportJson: Import mode:', importMode);
    console.log('handleImportJson: Current rows:', builderData.value.builder?.length || 0);
    console.log('handleImportJson: Importing rows:', importedData.builder.length);

    let finalBuilderData = [];
    let finalCssData = '';

    if (importMode === 'append') {
      // โหมดเพิ่มต่อท้าย
      finalBuilderData = [
        ...(builderData.value.builder || []), // ข้อมูลเดิม
        ...importedData.builder                // ข้อมูลใหม่
      ];
      
      // รวม CSS เดิมกับใหม่
      const currentCss = builderData.value.css || '';
      const importedCss = importedData.css || '';
      
      if (currentCss && importedCss) {
        finalCssData = currentCss + '\n\n/* === Imported CSS === */\n' + importedCss;
      } else {
        finalCssData = currentCss + importedCss;
      }
      
      console.log('handleImportJson: Append mode - Final rows:', finalBuilderData.length);
      
    } else {
      // โหมดแทนที่ทั้งหมด (default)
      finalBuilderData = importedData.builder;
      finalCssData = importedData.css || '';
      
      console.log('handleImportJson: Replace mode - Final rows:', finalBuilderData.length);
    }

    // อัปเดต builderData
    builderData.value.builder = finalBuilderData;
    builderData.value.css = finalCssData;
    
    // อัปเดต metadata หากมี (เฉพาะ replace mode)
    if (importMode === 'replace' && importedData.metadata) {
      if (importedData.metadata.title && importedData.metadata.title !== 'Untitled') {
        console.log('handleImportJson: Imported title:', importedData.metadata.title);
      }
    }

    // อัปเดต controller state
    if (controllerInstance.value?.state) {
      controllerInstance.value.state.getState().rows = finalBuilderData;
      controllerInstance.value.state.setCssCode(finalCssData);
    }

    console.log('handleImportJson: JSON imported successfully');
    
    // แสดง toast notification ตาม mode
    const modeText = importMode === 'append' ? 'เพิ่มต่อท้าย' : 'แทนที่';
    const toastSuccess = instance.appContext.config.globalProperties.$Toast({
      type: 'success',
      message: `นำเข้าข้อมูลสำเร็จ (${modeText}): ${importedData.builder.length} rows`
    });
    setTimeout(() => {
      toastSuccess.hide();
    }, 2000);
    
    // บันทึกการเปลี่ยนแปลงหลังจาก import
    await createRevision(finalBuilderData, finalCssData);
    
  } catch (error) {
    console.error('Error importing JSON:', error);
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล'
    });
    setTimeout(() => {
      toastError.hide();
    }, 1800);
  }
}

// Handler for saving row as template
// Handler for saving row as template (Updated for new API system)
async function handleSaveRowAsTemplate(templateData) {
  try {
    console.log('🔄 Saving row as template with new API system:', templateData);
    
    // เตรียมข้อมูลสำหรับ template
    const templateSaveData = {
      name: templateData.name,
      description: templateData.description,
      type: templateData.type,
      category: templateData.category,
      tags: templateData.tags,
      data: templateData.data,
      created_at: templateData.created_at,
      created_by: templateData.created_by,
      builder_version: '1.0.0',
      // เพิ่มข้อมูลเจ้าของหรือผู้สร้าง
      owner_id: configs.value.user?.id || 'unknown',
      owner_name: configs.value.user?.name || 'ไม่ระบุ',
      // เพิ่มข้อมูล metadata
      metadata: {
        columns_count: templateData.data.columns?.length || 0,
        grid_columns: templateData.data.col || 1,
        has_background: !!(templateData.data.bgColor || templateData.data.bgImage),
        responsive_settings: {
          mobile: templateData.data.mobile || true,
          tablet: templateData.data.tablet || true,
          laptop: templateData.data.laptop || true,
          desktop: templateData.data.desktop || true
        }
      },
      // เพิ่มสถานะ
      status: 'active',
      is_public: false, // เริ่มต้นเป็น private
      usage_count: 0
    };

    console.log('Template save data:', templateSaveData);

    // บันทึกไปยัง post_block_template collection โดยไม่ส่ง collection parameter
    const response = await makeApiCall('api/post_block_template', 'POST', templateSaveData);

    if (response?.status === 200 || response?.data) {
      console.log('✅ Template saved successfully:', response.data || response);
      
      // แสดง toast notification
      const toastSuccess = instance.appContext.config.globalProperties.$Toast({
        type: 'success',
        message: `บันทึก Block Template "${templateData.name}" สำเร็จแล้ว`
      });
      setTimeout(() => {
        toastSuccess.hide();
      }, 2000);
      
      // รีเฟรช block templates list หลังจากบันทึกสำเร็จ
      await loadBlockTemplates();
      
      // คืนค่า response data กลับไป (อาจจะมี _id ใหม่)
      return response.data || response;
      
    } else {
      throw new Error(`Save template failed with response: ${JSON.stringify(response)}`);
    }
    
  } catch (error) {
    console.error('❌ Error saving row as template:', error);
    
    // แสดง error toast
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการบันทึก Block Template'
    });
    setTimeout(() => {
      toastError.hide();
    }, 2000);
    
    throw error; // Re-throw เพื่อให้ caller จัดการต่อได้
  }
}

// Handler for loading block templates
async function handleLoadBlockTemplates() {
  await loadBlockTemplates();
}

// Load block templates (Updated for new API system)
async function loadBlockTemplates() {
  try {
    console.log('🔄 Loading block templates with new API system');
    loadingBlockTemplates.value = true;
    
    // ใช้ query endpoint เพื่อดึงข้อมูล block templates
    const queryData = {
      method: 'find',
      args: [
        {
          $and: [
            { type: 'row_template' },
            { status: 'active' },
            { 
              $or: [
                { owner_id: configs.value.user?.id },
                { is_public: true }
              ]
            }
          ]
        }
      ],
      sort: { created_at: -1 }, // เรียงลำดับตามวันที่ล่าสุดก่อน
      paging: { page: 1, limit: 100 }
    };

    console.log('Block templates query:', queryData);

    // ใช้ makeQueryCall กับ collection name โดยตรง
    const response = await makeQueryCall('post_block_template', queryData);

    if (response?.status === 200 || response?.data) {
      const responseData = response.data || response;
      blockTemplates.value = responseData.data || [];
      console.log('✅ Loaded block templates:', blockTemplates.value.length);
      console.log('Total templates available:', responseData.total);
    } else {
      console.warn('⚠️ No block templates data received:', response);
      blockTemplates.value = [];
    }
  } catch (error) {
    console.error('Error loading block templates:', error);
    blockTemplates.value = [];
    
    // แสดง error toast
    const toastError = instance.appContext.config.globalProperties.$Toast({
      type: 'error',
      message: 'เกิดข้อผิดพลาดในการโหลด Block Templates'
    });
    setTimeout(() => {
      toastError.hide();
    }, 2000);
  } finally {
    loadingBlockTemplates.value = false;
  }
}

// Undo/Redo Handlers
async function handleUndo() {
    console.log('handleUndo: Called. Current state:', {
      totalStates: history.value.length,
      currentIndex: currentHistoryIndex.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value,
      isUndoRedoOperation: isUndoRedoOperation.value
    });  const success = performUndo();
  if (success) {
    const toastUndo = instance.appContext.config.globalProperties.$Toast({
      type: 'success',
      message: 'ย้อนกลับการเปลี่ยนแปลงสำเร็จ'
    });
    setTimeout(() => {
      toastUndo.hide();
    }, 1500);
    
    console.log('handleUndo: Success. New state:', {
      totalStates: history.value.length,
      currentIndex: currentHistoryIndex.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value
    });
  } else {
    const toastNoUndo = instance.appContext.config.globalProperties.$Toast({
      type: 'warning',
      message: 'ไม่มีการเปลี่ยนแปลงให้ย้อนกลับ'
    });
    setTimeout(() => {
      toastNoUndo.hide();
    }, 1500);
    
    console.log('handleUndo: Failed - no history available');
  }
}

async function handleRedo() {
  console.log('handleRedo: Called. Current state:', {
    totalStates: history.value.length,
    currentIndex: currentHistoryIndex.value,
    canUndo: canUndo.value,
    canRedo: canRedo.value,
    isUndoRedoOperation: isUndoRedoOperation.value
  });
  
  const success = performRedo();
  if (success) {
    const toastRedo = instance.appContext.config.globalProperties.$Toast({
      type: 'success',
      message: 'ทำซ้ำการเปลี่ยนแปลงสำเร็จ'
    });
    setTimeout(() => {
      toastRedo.hide();
    }, 1500);
    
    console.log('handleRedo: Success. New state:', {
      totalStates: history.value.length,
      currentIndex: currentHistoryIndex.value,
      canUndo: canUndo.value,
      canRedo: canRedo.value
    });
  } else {
    const toastNoRedo = instance.appContext.config.globalProperties.$Toast({
      type: 'warning',
      message: 'ไม่มีการเปลี่ยนแปลงให้ทำซ้ำ'
    });
    setTimeout(() => {
      toastNoRedo.hide();
    }, 1500);
    
    console.log('handleRedo: Failed - no redo available');
  }
}

// Duplicate onMounted removed - consolidating with main onMounted above

</script>

<style scoped>
/* Add any specific styles for the container if needed */
</style> 