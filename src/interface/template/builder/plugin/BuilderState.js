/**
 * BuilderState.js - จัดการ State และ Data ของ Builder
 * แยกออกมาจาก Builder.vue เพื่อให้จัดการได้ง่ายขึ้น
 */

import storageManager from "@/plugins/storage";
import { reactive } from 'vue';
import {
  getAllItemTypes,
  getItemsByCategory,
} from "./builderItems.js";

/**
 * Generate valid types from builder items (async)
 * @returns {Promise<Array>} Array of valid types
 */
async function generateValidTypesAsync() {
  return await getAllItemTypes();
}

export class BuilderState {
  constructor(validTypes) {
    this.updateCallback = null; // Add callback for state updates
    this.state = reactive({
      // Refs และ Component Management
      rowRefs: {},
      columnRefs: {},
      componentImport: null,
      componentsCache: {},

      // Panel และ UI State
      activeRowPanel: null,
      activeColumnPanel: { row: null, col: null },
      showCssModal: false,
      cssCode: "",
      flowOptions: [],
      menuItems: [],
      showButtonPanel: false,
      activeColumnIndex: null,
      visibleRowIndex: null,
      columnPanels: [],
      rowPanels: [],

      // App Configuration
      configs: storageManager.get("configs"),
      session: storageManager.get("session"),
      builder: "web",

      // Preview และ Data
      previewRows: [],
      previewHtml: "",
      previewVisible: false,

      // Popup และ Modal State
      showPopup: false,
      activeBlock: false,
      popupData: {},
      popupDataRow: "",
      popupDataColumn: "",
      selectedOption: "",
      popupStage: false,
      popupdata: [],

      // Style Values
      paddingValue: "",
      marginValue: "",
      paddingInnerValue: "",
      marginInnerValue: "",

      // Lightbox และ Edit State
      lightboxOpen: false,
      showColorPickerField: null,
      lightboxRowIndex: undefined,
      lightboxColumnIndex: undefined,
      editPopupOpen: false,
      fullScreenMode: false,
      selectedItemIndex: undefined,
      selectedSlideItemIndex: undefined,
      activeTab: "content",
      selectedSlideIndex: undefined,
      selectedColor: "",

      // Categories และ Content
      lesson_categories: [],
      selectedCode: null,

      // Selected Item State
      selectedItem: {
        bgType: "none",
        bgColor: "",
        bgImage: "",
        bgGradientColor1: "",
        bgGradientColor2: "",
        bgVideo: "",
      },

      // Flow และ Logic State
      newStep: {
        type: "",
        options: {},
      },
      flow: [],
      activeFlowTab: "button",
      newMapping: { keyword: "", values: [] },
      newGateway: {
        name: "",
        description: "",
      },

      // Template และ Modal State
      template: [],
      isModalOpen: false,
      loading: false,

      // Content Items
      contentItems: getItemsByCategory("content"),
      formItems: getItemsByCategory("form"),
      lessonItems: getItemsByCategory("lesson"),
      navItems: getItemsByCategory("nav"),
      menuData: [], // เก็บข้อมูล menu จาก API
      dashboardItems: getItemsByCategory("dashboard"),

      // Confirmation State
      confirmationMessage: "",
      confirmationHeader: "",
      showConfirmation: false,
      deletionData: null,

      // Sub Menu State
      showFormSubMenu: false,
      showLessonSubMenu: false,
      showNavSubMenu: false,
      showDashboardSubMenu: false,

      // File Browser State
      FileBrowserOpen: false,
      FileImageBrowserOpen: false,
      setAllMargin: false,
      setAllPadding: false,
      setAllInnerPadding: false,
      FilePreviewBrowserOpen: false,

      // API State
      dataSourceType: "manual",
      apiEndpoint: "",
      selectedMethodType: "GET",
      apiResponseError: "",

      // Valid Types - Generated dynamically from builderItems
      validTypes: validTypes || [],

      // Drag and Drop State
      isDragging: false,
      draggedItem: null,
      draggedItemType: null, // 'row', 'column', 'object'
      draggedItemData: null, // { rowIndex, columnIndex, itemIndex }
      dragOverTarget: null, // Current drop target
      dragOverTargetType: null, // 'row', 'column'
      dropZones: [], // Available drop zones
      dragPreview: null, // Preview element data
    });
  }

  // Getters
  getState() {
    return this.state;
  }

  getConfigs() {
    return this.state.configs;
  }

  getSession() {
    return this.state.session;
  }

  getContentItems() {
    return this.state.contentItems;
  }

  getValidTypes() {
    return this.state.validTypes;
  }

  // Panel State Management
  setActiveRowPanel(rowIndex) {
    this.state.activeRowPanel = rowIndex;
  }

  setActiveColumnPanel(rowIndex, colIndex) {
    this.state.activeColumnPanel = { row: rowIndex, col: colIndex };
  }

  clearActivePanels() {
    this.state.activeRowPanel = null;
    this.state.activeColumnPanel = { row: null, col: null };
  }

  // Modal State Management
  openCssModal() {
    this.state.showCssModal = true;
  }

  closeCssModal() {
    this.state.showCssModal = false;
  }

  openLightbox(rowIndex, columnIndex) {
    this.state.lightboxOpen = true;
    this.state.lightboxRowIndex = rowIndex;
    this.state.lightboxColumnIndex = columnIndex;
  }

  closeLightbox() {
    this.state.lightboxOpen = false;
    this.state.lightboxRowIndex = undefined;
    this.state.lightboxColumnIndex = undefined;
  }

  // Edit Popup State
  openEditPopup() {
    this.state.editPopupOpen = true;
  }

  closeEditPopup() {
    this.state.editPopupOpen = false;
    // Reset selectedItem to its default state
    this.state.selectedItem = {
        bgType: "none",
        bgColor: "",
        bgImage: "",
        bgGradientColor1: "",
        bgGradientColor2: "",
        bgVideo: "",
        // Add any other default properties that selectedItem might have
        // For example, if it commonly holds 'type' or 'uid', reset them or ensure they are not problematic
        // For now, resetting to the initial style-related properties.
    };
    this.state.popupDataRow = ""; // Or null or undefined
    this.state.popupDataColumn = ""; // Or null or undefined
    this.state.selectedItemIndex = undefined;
    // It might also be good to reset activeTab to default if needed
    // this.state.activeTab = "content"; 
  }

  toggleFullScreenMode() {
    this.state.fullScreenMode = !this.state.fullScreenMode;
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
  }

  // Selected Item Management
  setSelectedItem(newItem) {
    if (!this.state.selectedItem || !newItem) {
      this.state.selectedItem = JSON.parse(JSON.stringify(newItem));
      console.log('[BuilderState] setSelectedItem: Replaced/set (newItem or current was null/undefined).');
      this.triggerUpdate(); // Add callback trigger
      return;
    }

    if (newItem.uid && this.state.selectedItem.uid && newItem.uid !== this.state.selectedItem.uid) {
      this.state.selectedItem = JSON.parse(JSON.stringify(newItem));
      console.log('[BuilderState] setSelectedItem: Replaced (UIDs differ).');
      this.triggerUpdate(); // Add callback trigger
      return;
    }

    let changed = false;
    // Update/add properties from newItem to existing selectedItem
    for (const key in newItem) {
      if (Object.prototype.hasOwnProperty.call(newItem, key)) {
        if (JSON.stringify(this.state.selectedItem[key]) !== JSON.stringify(newItem[key])) {
          this.state.selectedItem[key] = JSON.parse(JSON.stringify(newItem[key]));
          changed = true;
        }
      }
    }

    // Remove properties from selectedItem that are not in newItem
    for (const key in this.state.selectedItem) {
      if (Object.prototype.hasOwnProperty.call(this.state.selectedItem, key) && !Object.prototype.hasOwnProperty.call(newItem, key)) {
        delete this.state.selectedItem[key];
        changed = true;
      }
    }

    if (changed) {
      console.log('[BuilderState] setSelectedItem: Updated existing item properties.', JSON.stringify(this.state.selectedItem));
      this.triggerUpdate(); // Add callback trigger
    } else {
      console.log('[BuilderState] setSelectedItem: No changes to existing item properties needed.');
    }
    // Optional: If reactivity issues persist with deep changes, 
    // you might need to force a shallow clone of the top-level selectedItem.
    // However, direct property assignments as above should typically be reactive.
    // Example: this.state.selectedItem = { ...this.state.selectedItem }; 
    // But use this cautiously as it creates a new top-level reference, 
    // potentially re-triggering what we are trying to avoid if not handled carefully by consumers.
  }

  updateSelectedItem(field, value) {
    this.state.selectedItem[field] = value;
    this.triggerUpdate(); // Add callback trigger
  }

  // Categories Management
  setLessonCategories(categories) {
    this.state.lesson_categories = categories;
  }

  // Template Management
  setTemplate(template) {
    this.state.template = template;
  }

  setLoading(loading) {
    this.state.loading = loading;
  }

  // File Browser State
  openFileBrowser() {
    this.state.FileBrowserOpen = true;
  }

  closeFileBrowser() {
    this.state.FileBrowserOpen = false;
  }

  openFileImageBrowser() {
    this.state.FileImageBrowserOpen = true;
  }

  closeFileImageBrowser() {
    this.state.FileImageBrowserOpen = false;
  }

  openFilePreviewBrowser() {
    this.state.FilePreviewBrowserOpen = true;
  }

  closeFilePreviewBrowser() {
    this.state.FilePreviewBrowserOpen = false;
  }

  // Confirmation State
  showConfirmationDialog(message, header) {
    this.state.confirmationMessage = message;
    this.state.confirmationHeader = header;
    this.state.showConfirmation = true;
  }

  hideConfirmationDialog() {
    this.state.showConfirmation = false;
    this.state.confirmationMessage = "";
    this.state.confirmationHeader = "";
  }

  // CSS Code Management
  setCssCode(code) {
    this.state.cssCode = code;
  }

  getCssCode() {
    return this.state.cssCode;
  }

  // Component Cache Management
  addToComponentCache(componentName, component) {
    this.state.componentsCache[componentName] = component;
  }

  getFromComponentCache(componentName) {
    return this.state.componentsCache[componentName];
  }

  isComponentCached(componentName) {
    return !!this.state.componentsCache[componentName];
  }

  // Valid Types Management
  async refreshValidTypes() {
    this.state.validTypes = await getAllItemTypes();
    console.log('Valid types refreshed:', this.state.validTypes);
  }

  addValidType(type) {
    if (type && !this.state.validTypes.includes(type)) {
      this.state.validTypes.push(type);
      this.state.validTypes.sort();
      console.log(`Added valid type: ${type}`);
    }
  }

  removeValidType(type) {
    const index = this.state.validTypes.indexOf(type);
    if (index > -1) {
      this.state.validTypes.splice(index, 1);
      console.log(`Removed valid type: ${type}`);
    }
  }

  // Debug method to see current valid types
  async debugValidTypes() {
    console.group('🔍 Valid Types Debug Info');
    console.log('Total valid types:', this.state.validTypes.length);
    console.log('Valid types:', this.state.validTypes);
    // Show types grouped by source
    const generatedTypes = await getAllItemTypes();
    const contentTypes = getItemsByCategory("content").map(item => item.type);
    const formTypes = getItemsByCategory("form").map(item => item.type);
    const lessonTypes = getItemsByCategory("lesson").map(item => item.type);
    const navTypes = getItemsByCategory("nav").map(item => item.type);
    const dashboardTypes = getItemsByCategory("dashboard").map(item => item.type);
    console.log('Generated from builderItems:', generatedTypes);
    console.log('Content types:', contentTypes);
    console.log('Form types:', formTypes);
    console.log('Lesson types:', lessonTypes);
    console.log('Navigation types:', navTypes);
    console.log('Dashboard types:', dashboardTypes);
    console.groupEnd();
  }

  /**
   * Set callback for state updates
   */
  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  /**
   * Trigger update callback
   */
  triggerUpdate() {
    if (this.updateCallback && typeof this.updateCallback === 'function') {
      try {
        this.updateCallback();
      } catch (error) {
        console.error('Error triggering state update:', error);
      }
    }
  }

  // Drag and Drop State Management
  startDrag(itemType, itemData, item) {
    this.state.isDragging = true;
    this.state.draggedItem = item;
    this.state.draggedItemType = itemType;
    this.state.draggedItemData = itemData;
    this.state.dragPreview = this.createDragPreview(itemType, item);
    console.log(`Started dragging ${itemType}:`, itemData);
  }

  endDrag() {
    this.state.isDragging = false;
    this.state.draggedItem = null;
    this.state.draggedItemType = null;
    this.state.draggedItemData = null;
    this.state.dragOverTarget = null;
    this.state.dragOverTargetType = null;
    this.state.dropZones = [];
    this.state.dragPreview = null;
    console.log('Ended drag operation');
  }

  setDragOverTarget(targetType, targetData) {
    this.state.dragOverTarget = targetData;
    this.state.dragOverTargetType = targetType;
  }

  clearDragOverTarget() {
    this.state.dragOverTarget = null;
    this.state.dragOverTargetType = null;
  }

  createDragPreview(itemType, item) {
    switch (itemType) {
      case 'column':
        return {
          type: 'column',
          text: item.text || 'Column',
          objectCount: item.object ? item.object.length : 0
        };
      case 'object':
        return {
          type: 'object',
          text: item.type || 'Object',
          uid: item.uid
        };
      default:
        return null;
    }
  }

  isValidDropTarget(targetType, targetData) {
    // Basic validation rules for drops
    const { draggedItemType } = this.state;
    
    if (!draggedItemType) return false;
    
    // Add specific validation rules as needed
    // For example: can't drop row into column, etc.
    // eslint-disable-next-line no-unused-vars
    const validTarget = targetType && targetData;
    return true;
  }

  // อัพเดทข้อมูล menu
  setMenuData(menuData) {
    this.state.menuData = menuData || [];
    console.log('[BuilderState] Updated menuData:', this.state.menuData);
  }
}

// เพิ่ม async factory function สำหรับสร้าง BuilderState
BuilderState.createInstance = async function() {
  const validTypes = await generateValidTypesAsync();
  console.log('All item types:', validTypes);
  return new BuilderState(validTypes);
};

export default BuilderState;

// Export utility function
export { generateValidTypesAsync }; 