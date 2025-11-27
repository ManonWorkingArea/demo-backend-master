<script>
// Import Components ที่จำเป็น
import Subhead from "@/interface/template/outline/Subhead.vue";
import CustomConfirmation from "@/utils/Confirmation.vue";
import FileBrowser from "@/interface/modal/FileBrowser.vue";
import FloatingPanel from "@/interface/template/builder/plugin/FloatingPanel.vue";
import Preview from "@/interface/template/Preview.vue";
import BuilderRender from "@/interface/template/BuilderRender.vue";

// Import MainController
import MainController from "./builder/plugin/MainController.js";
import debug from "@/plugins/Logger.js";
import { inject, getCurrentInstance } from 'vue';
import storageManager from '@/plugins/storage';

export default {
  emits: ["update-layout"],
  name: "BuilderController",
  components: {
    Subhead,
    CustomConfirmation,
    FileBrowser,
    FloatingPanel,
    Preview,
    BuilderRender,
  },
  props: {
    builderData: {
      type: Object,
      required: true,
    },
    getBuilder: {
      type: Function,
      required: true,
    },
    backUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      controller: null,
      rowRefs: {},
      columnRefs: {},
      // เพิ่มตัวแปรสำหรับ API ใหม่
      apiRequest: null,
      tenant: null,
      instance: null,
      configs: storageManager.get('configs'),
      // เพิ่มตัวแปรสำหรับ live preview
      useLivePreview: true, // ใช้ live preview แทน iframe
      previewBuilderData: null,
      previewPageData: null,
    };
  },
  async mounted() {
    try {
      // เตรียม instance สำหรับ API system
      this.instance = getCurrentInstance();
      
      // Inject API services
      this.apiRequest = inject('apiRequest', null);
      this.tenant = inject('tenant', null);
      
      // Debug API system
      console.log('BuilderController mounted with API system:', {
        injectedApiRequest: this.apiRequest,
        globalApiRequest: this.instance?.appContext?.config?.globalProperties?.$apiRequest,
        hasInjection: !!this.apiRequest,
        hasGlobal: !!this.instance?.appContext?.config?.globalProperties?.$apiRequest,
        tenant: this.tenant,
        tenantChild: this.tenant?.child,
        configs: this.configs
      });
      
      // ลองใช้ tenant data กับ apiRequest
      if (this.apiRequest && this.tenant && this.tenant.child) {
        try {
          this.apiRequest.injectTenantData(this.tenant);
          console.log('BuilderController: Successfully injected tenant data to apiRequest');
        } catch (error) {
          console.warn('BuilderController: Failed to inject tenant data:', error);
        }
      }
      
      // สร้าง MainController แบบ async
      this.controller = await MainController.createInstance({
        builderData: this.builderData,
        getBuilder: this.getBuilder,
        backUrl: this.backUrl
      });
      
      // เริ่มต้นระบบ
      await this.controller.initialize(this.builderData);
      
      debug.log("BuilderController initialized with MainController and new API system");
    } catch (error) {
      debug.log("Error initializing BuilderController:", error);
    }
  },
  beforeUnmount() {
    if (this.controller) {
      this.controller.destroy();
    }
  },
  computed: {
    // Computed properties จาก controller
    isRowPanelActive() {
      return (rowIndex) => {
        return this.controller?.rowController?.isRowPanelActive(rowIndex) || false;
      };
    },
    isColumnPanelActive() {
      return (rowIndex, colIndex) => {
        return this.controller?.columnController?.isColumnPanelActive(rowIndex, colIndex) || false;
      };
    },
    flattenedCategories() {
      return this.controller?.flattenCategories(this.lesson_categories || []) || [];
    },
    getMainCategories() {
      const categories = this.lesson_categories || [];
      return categories.filter((category) => category.type === "main");
    },
    getColumnDivClass() {
      return (columnIndex, rowIndex) => ({
        relative: true,
        "bg-gray-100": false,
        "border-gray-200": true,
        "cursor-pointer": true,
        "active-panel": this.activeColumnIndex === columnIndex && this.activeRowIndex === rowIndex,
      });
    },
    divStyles() {
      const fullScreenMode = this.controller?.state?.getState()?.fullScreenMode || false;
      if (fullScreenMode) {
        const height = `calc(100vh - 190px)`;
        return {
          height,
          overflowY: "scroll",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
          right: "-20px",
        };
      } else {
        return {
          minHeight: "600px",
          maxHeight: "600px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
          right: "-20px",
        };
      }
    },
    post() {
      return this.builderData;
    },
    rows() {
      return this.controller?.state?.getState()?.rows || this.builderData?.builder || [];
    },
    selectedColumn() {
      const state = this.controller?.state?.getState();
      const rows = state?.rows || [];
      const rowIndex = state?.popupDataRow;
      const colIndex = state?.popupDataColumn;
      return rows[rowIndex]?.columns?.[colIndex];
    },
    filteredContentItems() {
      if (this.builderData?.type === "form") {
        return this.controller?.state?.getContentItems() || [];
      } else {
        const items = this.controller?.state?.getContentItems() || [];
        return items.filter((item) => item.type !== "form");
      }
    },
    
    // State properties จาก controller - สร้างเป็น computed เพื่อ reactivity
    activeRowPanel() {
      return this.controller?.state?.getState()?.activeRowPanel;
    },
    activeColumnPanel() {
      return this.controller?.state?.getState()?.activeColumnPanel || { row: null, col: null };
    },
    showCssModal() {
      return this.controller?.state?.getState()?.showCssModal || false;
    },
    cssCode: {
      get() {
        return this.controller?.state?.getCssCode() || "";
      },
      set(value) {
        this.controller?.state?.setCssCode(value);
      }
    },
    lightboxOpen() {
      return this.controller?.state?.getState()?.lightboxOpen || false;
    },
    lightboxRowIndex() {
      return this.controller?.state?.getState()?.lightboxRowIndex;
    },
    lightboxColumnIndex() {
      return this.controller?.state?.getState()?.lightboxColumnIndex;
    },
    showConfirmation() {
      return this.controller?.state?.getState()?.showConfirmation || false;
    },
    confirmationMessage() {
      return this.controller?.state?.getState()?.confirmationMessage || "";
    },
    confirmationHeader() {
      return this.controller?.state?.getState()?.confirmationHeader || "";
    },
    showFormSubMenu() {
      return this.controller?.state?.getState()?.showFormSubMenu || false;
    },
    showLessonSubMenu() {
      return this.controller?.state?.getState()?.showLessonSubMenu || false;
    },
    showNavSubMenu() {
      return this.controller?.state?.getState()?.showNavSubMenu || false;
    },
    showDashboardSubMenu() {
      return this.controller?.state?.getState()?.showDashboardSubMenu || false;
    },
    previewVisible() {
      return this.controller?.state?.getState()?.previewVisible || false;
    },
    // เพิ่ม computed สำหรับ live preview data
    livePreviewData() {
      if (!this.useLivePreview || !this.controller?.state) return null;
      
      const state = this.controller.state.getState();
      return {
        builder: state.rows || [],
        css: this.controller.state.getCssCode() || '',
        _id: this.builderData._id,
        title: this.builderData.title,
        type: this.builderData.type || 'page',
        status: this.builderData.status || true
      };
    },
    formItems() {
      return this.controller?.state?.getState()?.formItems || [];
    },
    lessonItems() {
      return this.controller?.state?.getState()?.lessonItems || [];
    },
    navItems() {
      return this.controller?.state?.getState()?.navItems || [];
    },
    dashboardItems() {
      return this.controller?.state?.getState()?.dashboardItems || [];
    },
    lesson_categories() {
      return this.controller?.state?.getState()?.lesson_categories || [];
    },
    editPopupOpen() {
      return this.controller?.state?.getState()?.editPopupOpen || false;
    },
    selectedItem() {
      return this.controller?.state?.getState()?.selectedItem || {};
    },
    activeTab() {
      return this.controller?.state?.getState()?.activeTab || "content";
    },
    FileBrowserOpen() {
      return this.controller?.state?.getState()?.FileBrowserOpen || false;
    },
    FileImageBrowserOpen() {
      return this.controller?.state?.getState()?.FileImageBrowserOpen || false;
    },
    FilePreviewBrowserOpen() {
      return this.controller?.state?.getState()?.FilePreviewBrowserOpen || false;
    },
    activeColumnIndex() {
      return this.controller?.state?.getState()?.activeColumnIndex;
    },
    activeRowIndex() {
      return this.controller?.state?.getState()?.activeRowIndex;
    },
    componentImport() {
      return this.controller?.state?.getState()?.componentImport;
    },
  },
  methods: {
    // ===========================================
    // NEW API SYSTEM FUNCTIONS (Temporary Testing)
    // ===========================================
    
    /**
     * Helper function to make API calls using the new system
     */
    async makeApiCall(endpoint, method = 'GET', body = null, collection = null) {
      console.log('🔄 Making API call in BuilderController:', { endpoint, method, body, collection });
      
      try {
        // Try new API system first
        if (this.apiRequest) {
          console.log('📡 Using new ApiRequest system');
          const result = await this.apiRequest.apiCall(endpoint, method, collection, body);
          console.log('✅ New API call successful:', result);
          return result;
        }
        
        // Fallback to old system
        console.log('📡 Falling back to old $Request system');
        const globalProperties = this.instance.appContext.config.globalProperties;
        
        // Ensure endpoint has /api/ prefix for fallback system
        const fullEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api/${endpoint}`;
        console.log('📍 Using endpoint:', fullEndpoint);
        
        if (method === 'GET') {
          const response = await globalProperties.$Request.GET(fullEndpoint, this.configs.key);
          return response;
        } else if (method === 'POST') {
          const requestBody = { data: body, options: {} };
          const response = await globalProperties.$Request.POST(fullEndpoint, requestBody, this.configs.key);
          return response;
        } else if (method === 'PUT') {
          const requestBody = { data: body, options: {} };
          const response = await globalProperties.$Request.PUT(fullEndpoint, requestBody, this.configs.key);
          return response;
        } else if (method === 'DELETE') {
          const response = await globalProperties.$Request.DELETE(fullEndpoint, this.configs.key);
          return response;
        }
        
        throw new Error(`Unsupported method: ${method}`);
        
      } catch (error) {
        console.error('❌ API call failed:', error);
        throw error;
      }
    },

    /**
     * Helper function for fetch-based API calls (query endpoints)
     */
    async makeQueryCall(endpoint, queryBody) {
      console.log('🔍 Making query call in BuilderController:', { endpoint, queryBody });
      
      try {
        // Try to use apiRequest for queries if possible
        if (this.apiRequest) {
          console.log('📡 Using new ApiRequest system for query');
          const result = await this.apiRequest.apiCall(endpoint, 'POST', null, queryBody);
          console.log('✅ New query call successful:', result);
          return result;
        }
        
        // Fallback to direct fetch
        console.log('📡 Falling back to direct fetch for query');
        
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
        
        console.log('📍 Using query URL:', fullUrl);
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'client-token-key': this.configs.key 
          },
          body: JSON.stringify(queryBody)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Query call successful:', data);
          return { data: data.data, total: data.total, status: response.status };
        } else {
          throw new Error(`Query failed with status: ${response.status}`);
        }
        
      } catch (error) {
        console.error('❌ Query call failed:', error);
        throw error;
      }
    },

    // Enhanced previewLayout method with new API system
    async previewLayout() {
      console.log('🔄 previewLayout with new API system');
      
      try {
        // Get current data from controller
        const state = this.controller?.state?.getState();
        const builderData = state?.rows || [];
        const cssData = this.controller?.state?.getCssCode() || '';
        
        const saveData = {
          builder: builderData,
          css: cssData,
          title: this.builderData.title
        };

        console.log('📊 Saving data with new API:', {
          rowsCount: builderData.length,
          cssLength: cssData.length,
          id: this.builderData._id
        });

        // Save using new API system
        const response = await this.makeApiCall(`api/post/${this.builderData._id}`, 'PUT', saveData);

        if (response?.status === 200 || response?.data) {
          console.log('✅ Save successful with new API system');
          
          // Show success notification
          const globalProperties = this.instance.appContext.config.globalProperties;
          if (globalProperties.$Toast) {
            const toast = globalProperties.$Toast({
              type: 'success',
              message: 'บันทึกข้อมูลสำเร็จด้วยระบบ API ใหม่'
            });
            setTimeout(() => {
              toast.hide();
            }, 2000);
          }
          
          // แสดง preview ด้วยข้อมูลใหม่แทนการเรียก API เก่า
          this.showLivePreview();
          
        } else {
          throw new Error(`Save failed with response: ${JSON.stringify(response)}`);
        }
        
      } catch (error) {
        console.error('❌ previewLayout error with new API:', error);
        
        // Show error notification
        const globalProperties = this.instance.appContext.config.globalProperties;
        if (globalProperties.$Toast) {
          const toast = globalProperties.$Toast({
            type: 'error',
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
          });
          setTimeout(() => {
            toast.hide();
          }, 2000);
        }
        
        // Fallback to original method
        if (this.controller?.dataController?.previewLayout) {
          this.controller.dataController.previewLayout();
        }
      }
    },

    // Enhanced getDataFromParent method with new API system
    async getDataFromParent() {
      console.log('🔄 getDataFromParent with new API system');
      
      try {
        if (!this.builderData?._id) {
          console.warn('No builderData._id available for reload');
          return;
        }

        // Load fresh data using new API system
        console.log('📡 Loading fresh data for ID:', this.builderData._id);
        
        const response = await this.makeApiCall(`api/post/${this.builderData._id}`, 'GET');
        
        if (response?.data) {
          console.log('✅ Fresh data loaded:', response.data);
          
          // Update controller state with fresh data
          if (this.controller?.state) {
            const freshData = response.data;
            this.controller.state.getState().rows = freshData.builder || [];
            this.controller.state.setCssCode(freshData.css || '');
            
            console.log('🔄 Controller state updated with fresh data');
          }
          
          // Emit update to parent
          this.$emit('update-layout', {
            builder: response.data.builder || [],
            css: response.data.css || ''
          });
          
          // Show success notification
          const globalProperties = this.instance.appContext.config.globalProperties;
          if (globalProperties.$Toast) {
            const toast = globalProperties.$Toast({
              type: 'success',
              message: 'โหลดข้อมูลใหม่สำเร็จด้วยระบบ API ใหม่'
            });
            setTimeout(() => {
              toast.hide();
            }, 1800);
          }
          
        } else {
          throw new Error('No data received from API');
        }
        
      } catch (error) {
        console.error('❌ getDataFromParent error with new API:', error);
        
        // Show error notification
        const globalProperties = this.instance.appContext.config.globalProperties;
        if (globalProperties.$Toast) {
          const toast = globalProperties.$Toast({
            type: 'error',
            message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
          });
          setTimeout(() => {
            toast.hide();
          }, 1800);
        }
        
        // Fallback to original method
        if (this.controller?.dataController?.getDataFromParent) {
          this.controller.dataController.getDataFromParent();
        }
      }
    },

    // Enhanced saveCss method with new API system
    async saveCss() {
      console.log('🔄 saveCss with new API system');
      
      try {
        const cssData = this.controller?.state?.getCssCode() || '';
        
        console.log('📊 Saving CSS with new API:', {
          cssLength: cssData.length,
          id: this.builderData._id
        });

        const saveData = { css: cssData };

        // Save CSS using new API system
        const response = await this.makeApiCall(`api/post/${this.builderData._id}`, 'PUT', saveData);

        if (response?.status === 200 || response?.data) {
          console.log('✅ CSS save successful with new API system');
          
          // Close CSS modal
          this.closeCssModal();
          
          // Show success notification
          const globalProperties = this.instance.appContext.config.globalProperties;
          if (globalProperties.$Toast) {
            const toast = globalProperties.$Toast({
              type: 'success',
              message: 'บันทึก CSS สำเร็จด้วยระบบ API ใหม่'
            });
            setTimeout(() => {
              toast.hide();
            }, 1800);
          }
          
        } else {
          throw new Error(`CSS save failed with response: ${JSON.stringify(response)}`);
        }
        
      } catch (error) {
        console.error('❌ saveCss error with new API:', error);
        
        // Show error notification
        const globalProperties = this.instance.appContext.config.globalProperties;
        if (globalProperties.$Toast) {
          const toast = globalProperties.$Toast({
            type: 'error',
            message: 'เกิดข้อผิดพลาดในการบันทึก CSS'
          });
          setTimeout(() => {
            toast.hide();
          }, 1800);
        }
        
        // Fallback to original method
        if (this.controller?.dataController?.saveCss) {
          this.controller.dataController.saveCss();
        }
      }
    },

    // ===========================================
    // EXISTING METHODS (keeping original functionality)
    // ===========================================
    
    // Methods จาก controller - รวม methods ที่จำเป็นสำหรับ template
    addRow() {
      this.controller?.rowController?.addRow();
    },
    openCssModal() {
      this.controller?.state?.openCssModal();
    },
    closeCssModal() {
      this.controller?.state?.closeCssModal();
    },
    closeLightbox() {
      this.controller?.state?.closeLightbox();
    },
    handleItemClick(item, rowIndex, columnIndex) {
      this.controller?.handleItemClick(item, rowIndex, columnIndex);
    },
    
    // Panel Action Handler
    handlePanelAction(action) {
      if (action === "addRow") {
        this.addRow();
      } else if (action === "save") {
        this.previewLayout(); // ใช้ method ใหม่ที่มี API integration
      } else if (action === "reload") {
        this.getDataFromParent(); // ใช้ method ใหม่ที่มี API integration
      }
    },
    
    hidePreview() {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().previewVisible = false;
      }
    },
    
    // เพิ่ม method สำหรับแสดง preview แบบใหม่
    showLivePreview() {
      if (this.controller?.state?.getState) {
        // อัพเดตข้อมูล preview ก่อนแสดง
        this.updatePreviewData();
        this.controller.state.getState().previewVisible = true;
      }
    },
    
    // อัพเดตข้อมูล preview ด้วยข้อมูลปัจจุบัน
    updatePreviewData() {
      if (this.controller?.state) {
        const state = this.controller.state.getState();
        this.previewBuilderData = [...(state.rows || [])]; // Copy array
        this.previewPageData = {
          _id: this.builderData._id,
          title: this.builderData.title,
          type: this.builderData.type || 'page',
          status: this.builderData.status || true,
          css: this.controller.state.getCssCode() || ''
        };
        
        console.log('🔄 Updated preview data:', {
          rowsCount: this.previewBuilderData.length,
          cssLength: this.previewPageData.css.length,
          title: this.previewPageData.title
        });
      }
    },
    
    // Confirmation handlers
    handleConfirmation() {
      if (this.controller?.state?.getState) {
        const state = this.controller.state.getState();
        if (state.deletionData) {
          const { type, rowIndex, columnIndex, itemIndex } = state.deletionData;
          
          if (type === 'row' && this.controller.rowController) {
            this.controller.rowController.removeRow(rowIndex);
          } else if (type === 'column' && this.controller.columnController) {
            this.controller.columnController.removeColumn(rowIndex, columnIndex);
          } else if (type === 'item' && this.controller.columnController) {
            this.controller.columnController.removeContentItem(rowIndex, columnIndex, itemIndex);
          }
          
          state.deletionData = null;
        }
        this.controller.state.hideConfirmationDialog();
      }
    },
    handleConfirmCancel() {
      if (this.controller?.state?.getState) {
        const state = this.controller.state.getState();
        state.deletionData = null;
        this.controller.state.hideConfirmationDialog();
      }
    },
    
    // ปิด sub menus
    closeFormSubMenu() {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().showFormSubMenu = false;
      }
    },
    closeLessonSubMenu() {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().showLessonSubMenu = false;
      }
    },
    closeNavSubMenu() {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().showNavSubMenu = false;
      }
    },
    closeDashboardSubMenu() {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().showDashboardSubMenu = false;
      }
    },
    
    // File browser callbacks - ยังคงต้องการสำหรับ template
    changeFileTrigger(payload) {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().FileBrowserOpen = payload;
      }
    },
    selectFileTrigger(payload) {
      if (payload && this.controller?.state?.getState) {
        const state = this.controller.state.getState();
        if (state.selectedItem && state.selectedItem.slides && state.selectedSlideItemIndex !== undefined) {
          state.selectedItem.slides[state.selectedSlideItemIndex].image = payload.file;
          state.selectedSlideItemIndex = undefined;
        }
      }
    },
    changeFileImageTrigger(payload) {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().FileImageBrowserOpen = payload;
      }
    },
    selectFileImageTrigger(payload) {
      if (payload && this.controller?.state?.getState) {
        const state = this.controller.state.getState();
        if (state.selectedItem) {
          state.selectedItem.url = payload.file;
        }
      }
    },
    changeFilePreviewTrigger(payload) {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().FilePreviewBrowserOpen = payload;
      }
    },
    selectFilePreviewTrigger(payload) {
      if (payload && this.controller?.state?.getState) {
        const state = this.controller.state.getState();
        if (state.selectedItem) {
          state.selectedItem.fileurl = payload.file;
        }
      }
    },
  },
};
</script>

<template>
  <!-- Live Preview Modal -->
  <div v-if="previewVisible && useLivePreview" class="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
    <div class="bg-white w-full h-full max-w-7xl max-h-full flex flex-col">
      <!-- Preview Header -->
      <div class="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <h3 class="text-lg font-semibold">Live Preview</h3>
          <span class="bg-green-100 text-green-700 px-2 py-1 text-xs rounded-full">
            ข้อมูลปัจจุบัน (ไม่ผ่าน API เก่า)
          </span>
        </div>
        <button 
          @click="hidePreview"
          class="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>
      
      <!-- Preview Content -->
      <div class="flex-1 overflow-auto bg-gray-50">
        <div class="p-4">
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <BuilderRender 
              v-if="livePreviewData"
              :key="livePreviewData._id + '_' + livePreviewData.builder.length"
              :dataItem="livePreviewData._id"
              :masterItem="livePreviewData._id"
              mode="live"
              :liveBuilder="livePreviewData.builder"
              :livePage="livePreviewData"
            />
            <div v-else class="p-8 text-center text-gray-500">
              กำลังเตรียมข้อมูล...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Original iframe Preview (fallback) -->
  <Preview
    v-else-if="previewVisible && !useLivePreview"
    :visible="true"
    :data-item="post._id"
    @close="hidePreview"
  />

  <FloatingPanel @actionTriggered="handlePanelAction" />

  <Subhead
    :pageTitle="post.title"
    :subhead="'(' + post.slug + ')'"
    :navigation="[
      {
        name: 'Save',
        style: 'save',
        class: 'primary-btn',
        visible: true,
        type: 'button',
        function: 'previewLayout',
        eventName: 'callFunction2',
      },
      {
        name: 'Row',
        style: 'plus',
        class: 'default-btn',
        visible: true,
        type: 'button',
        function: 'addRow',
        eventName: 'callFunction1',
      },
      {
        name: 'Reload',
        style: 'refresh',
        class: 'default-btn',
        visible: true,
        type: 'button',
        function: 'getDataFromParent',
        eventName: 'callFunction3',
      },
      {
        name: 'CSS',
        style: 'palette',
        class: 'default-btn',
        visible: true,
        type: 'button',
        function: 'openCssModal',
        eventName: 'openCssModal',
      },
      {
        name: 'แก้ไข',
        link: `/cms/edit/${post._id}`,
        style: 'pencil',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
      {
        name: 'หน้าหลัก',
        link: backUrl,
        style: 'home',
        class: 'default-btn',
        visible: true,
        type: 'button',
      },
    ]"
    @callFunction1="addRow"
    @callFunction3="getDataFromParent"
    @callFunction2="previewLayout"
    @openCssModal="openCssModal"
  />

  <custom-confirmation
    v-if="showConfirmation"
    :message="confirmationMessage"
    :header="confirmationHeader"
    @confirm="handleConfirmation"
    @cancel="handleConfirmCancel"
  />

  <!-- CSS Modal -->
  <div v-if="showCssModal" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center w-full h-full">
      <div class="fixed inset-0 bg-black opacity-50"></div>
      <div class="z-10 modal w-full h-full flex flex-col items-center justify-center">
        <div class="bg-white rounded-lg overflow-hidden shadow-xl w-3/4 flex flex-col h-full">
          <div class="p-4 flex-1">
            <textarea
              v-model="cssCode"
              class="w-full h-full px-3 py-2 placeholder-gray-400 text-gray-700 bg-white rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            ></textarea>
          </div>
          <div class="flex justify-end px-4 py-2 bg-gray-100">
            <button
              @click="saveCss"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400"
            >
              Save
            </button>
            <button
              @click="closeCssModal"
              class="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Lightbox Modal -->
  <div
    v-if="lightboxOpen"
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white w-[600px] p-2 relative">
      <button
        v-if="!showFormSubMenu && !showLessonSubMenu && !showNavSubMenu && !showDashboardSubMenu"
        @click="closeLightbox"
        class="absolute top-0 right-0 mt-2 mr-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
      </button>
      
      <h2
        v-if="!showFormSubMenu && !showLessonSubMenu && !showNavSubMenu && !showDashboardSubMenu"
        class="text-lg font-semibold mt-3 mb-1"
      >
        เลือกประเภทเนื้อหาที่ต้องการเพิ่ม
      </h2>
      <h2 v-else class="text-lg font-semibold mt-3 mb-1">เลือกประเภทเนื้อหาในแบบฟอร์ม</h2>
      
      <p
        class="mb-4 text-gray-500"
        v-if="!showFormSubMenu && !showLessonSubMenu && !showNavSubMenu && !showDashboardSubMenu"
      >
        เนื้อหาแต่ละประเภทจะมีการตั้งค่าที่แตกต่างกันตามประเภทของข้อมูลนั้นๆ
      </p>
      
      <!-- Main Content Items -->
      <ul
        class="grid grid-cols-4 gap-2"
        v-if="!showFormSubMenu && !showLessonSubMenu && !showNavSubMenu && !showDashboardSubMenu"
      >
        <li
          v-for="item in filteredContentItems"
          :key="item.id"
          @click="handleItemClick(item, lightboxRowIndex, lightboxColumnIndex)"
          class="flex flex-col items-center justify-center cursor-pointer py-2 px-4 border border-gray-300 rounded-sm hover:bg-gray-100"
        >
          <div class="text-gray-600 mb-2 mt-3">
            <font-awesome-icon
              :icon="['fas', item.icon]"
              class="h-10 w-10 text-gray-300"
            />
          </div>
          <div class="text-center">
            <h3 class="text-[14px] text-gray-500 font-semibold">{{ item.name }}</h3>
            <p class="text-[12px] text-gray-500">{{ item.description }}</p>
          </div>
        </li>
      </ul>

      <!-- Form Sub Menu -->
      <div v-if="showFormSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="formItem in formItems"
            :key="formItem.type"
            @click="handleItemClick(formItem, lightboxRowIndex, lightboxColumnIndex)"
            class="flex flex-col items-center justify-center cursor-pointer py-2 px-4 border border-gray-300 rounded-sm hover:bg-gray-100"
          >
            <div class="text-gray-600 mb-2 mt-3">
              <font-awesome-icon
                :icon="['fas', formItem.icon]"
                class="h-10 w-10 text-gray-300"
              />
            </div>
            <div class="text-center">
              <h3 class="text-[14px] text-gray-500 font-semibold">{{ formItem.name }}</h3>
              <p class="text-[12px] text-gray-500">{{ formItem.description }}</p>
            </div>
          </li>
        </ul>
        <button
          @click="closeFormSubMenu"
          class="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          ย้อนกลับ
        </button>
      </div>

      <!-- Lesson Sub Menu -->
      <div v-if="showLessonSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="lessonItem in lessonItems"
            :key="lessonItem.type"
            @click="handleItemClick(lessonItem, lightboxRowIndex, lightboxColumnIndex)"
            class="flex flex-col items-center justify-center cursor-pointer py-2 px-4 border border-gray-300 rounded-sm hover:bg-gray-100"
          >
            <div class="text-gray-600 mb-2 mt-3">
              <font-awesome-icon
                :icon="['fas', lessonItem.icon]"
                class="h-10 w-10 text-gray-300"
              />
            </div>
            <div class="text-center">
              <h3 class="text-[14px] text-gray-500 font-semibold">{{ lessonItem.name }}</h3>
              <p class="text-[12px] text-gray-500">{{ lessonItem.description }}</p>
            </div>
          </li>
        </ul>
        <button
          @click="closeLessonSubMenu"
          class="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          ย้อนกลับ
        </button>
      </div>

      <!-- Nav Sub Menu -->
      <div v-if="showNavSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="navItem in navItems"
            :key="navItem.type"
            @click="handleItemClick(navItem, lightboxRowIndex, lightboxColumnIndex)"
            class="flex flex-col items-center justify-center cursor-pointer py-2 px-4 border border-gray-300 rounded-sm hover:bg-gray-100"
          >
            <div class="text-gray-600 mb-2 mt-3">
              <font-awesome-icon
                :icon="['fas', navItem.icon]"
                class="h-10 w-10 text-gray-300"
              />
            </div>
            <div class="text-center">
              <h3 class="text-[14px] text-gray-500 font-semibold">{{ navItem.name }}</h3>
              <p class="text-[12px] text-gray-500">{{ navItem.description }}</p>
            </div>
          </li>
        </ul>
        <button
          @click="closeNavSubMenu"
          class="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          ย้อนกลับ
        </button>
      </div>

      <!-- Dashboard Sub Menu -->
      <div v-if="showDashboardSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="dashboardItem in dashboardItems"
            :key="dashboardItem.type"
            @click="handleItemClick(dashboardItem, lightboxRowIndex, lightboxColumnIndex)"
            class="flex flex-col items-center justify-center cursor-pointer py-2 px-4 border border-gray-300 rounded-sm hover:bg-gray-100"
          >
            <div class="text-gray-600 mb-2 mt-3">
              <font-awesome-icon
                :icon="['fas', dashboardItem.icon]"
                class="h-10 w-10 text-gray-300"
              />
            </div>
            <div class="text-center">
              <h3 class="text-[14px] text-gray-500 font-semibold">{{ dashboardItem.name }}</h3>
              <p class="text-[12px] text-gray-500">{{ dashboardItem.description }}</p>
            </div>
          </li>
        </ul>
        <button
          @click="closeDashboardSubMenu"
          class="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  </div>

  <!-- File Browsers -->
  <FileBrowser
    :open="FileBrowserOpen"
    type="media"
    @change="changeFileTrigger"
    @select="selectFileTrigger"
  />

  <FileBrowser
    :open="FileImageBrowserOpen"
    type="media"
    @change="changeFileImageTrigger"
    @select="selectFileImageTrigger"
  />

  <FileBrowser
    :open="FilePreviewBrowserOpen"
    type="all"
    @change="changeFilePreviewTrigger"
    @select="selectFilePreviewTrigger"
  />
  
  <!-- Placeholder สำหรับเนื้อหาหลัก - จะเพิ่มต่อ -->
  <div class="text-center p-8">
    <h2 class="text-2xl font-bold text-green-600">🎉 Builder Controller พร้อมแล้ว!</h2>
    <p class="text-gray-600 mt-2">MainController กำลังทำงาน - พร้อมเพิ่ม Canvas และ Content</p>
    <div class="mt-4 text-sm text-gray-500">
      <p>Rows: {{ rows.length }}</p>
      <p>Controller: {{ controller ? '✅ Active' : '❌ Not Loaded' }}</p>
    </div>
  </div>
</template>

<style scoped>
/* CSS เฉพาะสำหรับ BuilderController */
.modal {
  font-family: inherit;
}
</style> 