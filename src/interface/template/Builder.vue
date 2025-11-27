<script>
// Import Components ที่จำเป็น
import CustomConfirmation from "@/utils/Confirmation.vue";
import FileBrowser from "@/interface/modal/FileBrowser.vue";
import FloatingPanel from "@/interface/template/builder/plugin/FloatingPanel.vue";
import Preview from "@/interface/template/Preview.vue";
import StyleTab from "./builder/tabs/StyleTab.vue"; // Import StyleTab
import ResponsiveTab from "./builder/tabs/ResponsiveTab.vue"; // Import ResponsiveTab
import OptionsTab from "./builder/tabs/OptionsTab.vue"; // Import OptionsTab
import LogicTab from "./builder/tabs/LogicTab.vue"; // Import LogicTab
import CssEditorModal from "./builder/CssEditorModal.vue"; // Import CssEditorModal
import RevisionHistoryModal from "./builder/components/RevisionHistoryModal.vue"; // Import RevisionHistoryModal
import DragDropMixin from "./builder/mixins/DragDropMixin.js"; // Import DragDropMixin
import BuilderToolbar from "./builder/components/BuilderToolbar.vue"; // Import BuilderToolbar
import ContentSelectorModal from "./builder/components/ContentSelectorModal.vue"; // Import ContentSelectorModal
import ImportModal from "./builder/components/ImportModal.vue"; // Import ImportModal
import SaveTemplateModal from "./builder/components/SaveTemplateModal.vue"; // Import SaveTemplateModal
import BlockTemplateModal from "./builder/components/BlockTemplateModal.vue"; // Import BlockTemplateModal

// Import MainController
import MainController from "./builder/plugin/MainController.js";

// Import utility functions สำหรับสร้าง hierarchical items
import { getHierarchicalItems } from "./builder/plugin/builderItems.js";

export default {
  mixins: [DragDropMixin], // Add DragDropMixin
  emits: [
    "update-layout", 
    "save-data", 
    "reload-data", 
    "revision-rollback", 
    "revision-branch", 
    "load-revisions",
    "revision-delete",
    "import-json",
    "save-row-as-template",
    "load-block-templates",
    "undo",
    "redo"
  ],
  name: "BuilderRefactored", 
  components: {
    CustomConfirmation,
    FileBrowser,
    FloatingPanel,
    Preview,
    StyleTab, // Register StyleTab
    ResponsiveTab, // Register ResponsiveTab
    OptionsTab, // Register OptionsTab
    LogicTab, // Register LogicTab
    CssEditorModal, // Register CssEditorModal
    RevisionHistoryModal, // Register RevisionHistoryModal
    BuilderToolbar, // Register BuilderToolbar
    ContentSelectorModal, // Register ContentSelectorModal
    ImportModal, // เพิ่ม ImportModal
    SaveTemplateModal, // เพิ่ม SaveTemplateModal
    BlockTemplateModal, // เพิ่ม BlockTemplateModal
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
    revisionHistory: {
      type: Array,
      default: () => []
    },
    loadingRevisions: {
      type: Boolean,
      default: false
    },
    blockTemplates: {
      type: Array,
      default: () => []
    },
    loadingBlockTemplates: {
      type: Boolean,
      default: false
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    canRedo: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      controller: null,
      rowRefs: {},
      columnRefs: {},
      observer: null,
      resizeObserver: null,
      initialLoadComplete: false, 
      showColorPickerField: null, // Added this line

      // --- Local UI state and form inputs from original data that template might need ---
      paddingValue: "", 
      marginValue: "",  
      paddingInnerValue: "", 
      marginInnerValue: "",

      // For Flow, Mapping, Gateway creation forms if their inputs are directly in this template
      newStep: { type: "", options: {} },
      activeFlowTab: "button", // Default tab for flow configuration section
      newMapping: { keyword: "", values: [] },
      newGateway: { name: "", description: "" },
      selectedOption: "", // Used for <select v-model='selectedOption'> in flow/mapping

      // For "Set All" checkboxes related to padding/margin inputs
      setAllMargin: false,
      setAllPadding: false,
      setAllInnerPadding: false,

      showGridLines: true, // Added for grid toggle
      
      // Professional Builder Tools
      builderTools: {
        zoom: 100,
        selectedTool: 'select',
        snapToGrid: true,
        showRulers: false,
        viewMode: 'desktop'
      },
      
      // Advanced features
      builderHistory: [],
      builderHistoryIndex: -1,
      clipboard: null,
      
      // Revision History Modal
      showRevisionHistoryModal: false,
      
      // Sticky Toolbar
      isToolbarSticky: false,
      
      // Device Preview Toggle
      showDevicePreview: false,
      
      // Device Viewport
      currentViewport: 'desktop',
      
      // Import/Export State
      showImportModal: false,
      importData: null,
      importFileName: '',
      
      // Save Row as Template State
      showSaveTemplateModal: false,
      templateName: '',
      templateDescription: '',
      savingRowIndex: null,
      savingTemplate: false,
      
      // Block Template Selection State
      showBlockTemplateModal: false,
      selectedTemplate: null,
      showTemplatePreview: false,
      importMode: 'replace',
    };
  },
  async mounted() {
    try {
      this.controller = await MainController.createInstance({
        builderData: this.builderData, // Pass the whole builderData
        getBuilder: this.getBuilder,
        backUrl: this.backUrl
      });
      // Set up data update callback
      this.controller.setUpdateDataCallback(() => {
        this.updateDataForParent();
      });
      // Set up reset tab state callback
      this.controller.setResetTabStateCallback(() => {
        this.resetTabLocalState();
      });
      // Initialize will now handle setting rows and CSS from the correct nested structure
      await this.controller.initialize(this.builderData); 
      // Load menu data for navigation elements
      await this.loadMenuData();
      // Add scroll listener for sticky toolbar
      this.addScrollListener();
      // Add keyboard event listeners
      this.addKeyboardListeners();
    } catch (error) {
      console.error("Error initializing BuilderRefactored.vue (InnerBuilder):", error);
    }
  },
  beforeUnmount() {
    if (this.controller) {
      this.controller.destroy();
    }
    // Remove scroll listener
    this.removeScrollListener();
    // Remove keyboard event listeners
    this.removeKeyboardListeners();
  },
  computed: {
    // --- Computed Properties Delegated to Controller State/Getters or Local View Logic ---
    isRowPanelActive() {
      return (rowIndex) => this.controller?.rowController?.isRowPanelActive(rowIndex) || false;
    },
    isColumnPanelActive() {
      return (rowIndex, colIndex) => this.controller?.columnController?.isColumnPanelActive(rowIndex, colIndex) || false;
    },
    rows() {
      const controllerRows = this.controller?.state?.getState()?.rows;
      if (controllerRows && controllerRows.length > 0) {
        return controllerRows;
      }
      // Fallback logic updated for nested builder structure
      if (this.builderData?.builder && typeof this.builderData.builder === 'object' && this.builderData.builder.builder && Array.isArray(this.builderData.builder.builder) && this.builderData.builder.builder.length > 0) {
        return this.builderData.builder.builder;
      }
      // Fallback for older structure where builderData.builder might be the rows array
      if (this.builderData?.builder && Array.isArray(this.builderData.builder) && this.builderData.builder.length > 0) {
        return this.builderData.builder;
      }
      // Fallback if builderData itself is the array of rows
      if (Array.isArray(this.builderData) && this.builderData.length > 0) {
        return this.builderData;
      }
      return [];
    },
    post() { 
      return this.builderData;
    },
    cssCode: {
      get() { return this.controller?.state?.getCssCode() || ""; },
      set(value) { this.controller?.state?.setCssCode(value); }
    },
    activeRowPanel() { return this.controller?.state?.getState()?.activeRowPanel; },
    activeColumnPanel() { return this.controller?.state?.getState()?.activeColumnPanel || { row: null, col: null }; },
    showCssModal() { return this.controller?.state?.getState()?.showCssModal || false; },
    lightboxOpen() { return this.controller?.state?.getState()?.lightboxOpen || false; },
    lightboxRowIndex() { return this.controller?.state?.getState()?.lightboxRowIndex; },
    lightboxColumnIndex() { return this.controller?.state?.getState()?.lightboxColumnIndex; },
    editPopupOpen() { return this.controller?.state?.getState()?.editPopupOpen || false; },
    selectedItem() { return this.controller?.state?.getState()?.selectedItem || {}; },
    activeTab() { return this.controller?.state?.getState()?.activeTab || "content"; },
    componentImport() { return this.controller?.state?.getState()?.componentImport; },
    previewVisible() { return this.controller?.state?.getState()?.previewVisible || false; },
    showConfirmation() { return this.controller?.state?.getState()?.showConfirmation || false; },
    confirmationMessage() { return this.controller?.state?.getState()?.confirmationMessage || ""; },
    confirmationHeader() { return this.controller?.state?.getState()?.confirmationHeader || ""; },
    showFormSubMenu() { return this.controller?.state?.getState()?.showFormSubMenu || false; },
    showLessonSubMenu() { return this.controller?.state?.getState()?.showLessonSubMenu || false; },
    showNavSubMenu() { return this.controller?.state?.getState()?.showNavSubMenu || false; },
    showDashboardSubMenu() { return this.controller?.state?.getState()?.showDashboardSubMenu || false; },
    FileBrowserOpen: {
        get() { return this.controller?.state?.getState()?.FileBrowserOpen || false; },
        set(value) { if(this.controller?.state?.getState) this.controller.state.getState().FileBrowserOpen = value;}
    },
    FileImageBrowserOpen: {
        get() { return this.controller?.state?.getState()?.FileImageBrowserOpen || false; },
        set(value) { if(this.controller?.state?.getState) this.controller.state.getState().FileImageBrowserOpen = value;}
    },
    FilePreviewBrowserOpen: {
        get() { return this.controller?.state?.getState()?.FilePreviewBrowserOpen || false; },
        set(value) { if(this.controller?.state?.getState) this.controller.state.getState().FilePreviewBrowserOpen = value;}
    },
    componentsCache() { // For dynamic components rendered in template via loadComponentLoop
        return this.controller?.state?.getState()?.componentsCache || {};
    },
    activeColumnIndex() { // Used by getColumnDivClass
        return this.controller?.state?.getState()?.activeColumnIndex;
    },
    activeRowIndex() { // Used by getColumnDivClass
        return this.controller?.state?.getState()?.activeRowIndex;
    },
    // Content item lists for lightbox
    contentItems() { return this.controller?.state?.getState()?.contentItems || []; },
    formItems() { return this.controller?.state?.getState()?.formItems || []; },
    lessonItems() { return this.controller?.state?.getState()?.lessonItems || []; },
    navItems() { return this.controller?.state?.getState()?.navItems || []; },
    menuData() { return this.controller?.state?.getState()?.menuData || []; },
    dashboardItems() { return this.controller?.state?.getState()?.dashboardItems || []; },
    lesson_categories() { return this.controller?.state?.getState()?.lesson_categories || []; }, 
    flowOptions() { return this.controller?.state?.getState()?.flowOptions || []; },
    template() { return this.controller?.state?.getState()?.template || []; },
    isModalOpen() { return this.controller?.state?.getState()?.isModalOpen || false; }, 
    loading() { return this.controller?.state?.getState()?.loading || false; }, 

    flattenedCategories() {
      const cats = this.lesson_categories; // Uses the computed lesson_categories
      return this.controller?.flattenCategories(cats) || [];
    },
    getMainCategories() {
      const cats = this.lesson_categories; // Uses the computed lesson_categories
      return cats.filter((category) => category.type === "main");
    },
    getColumnDivClass() { // Retained from original, ensure activeColumnIndex/activeRowIndex are from controller state
      return (columnIndex, rowIndex) => ({
        relative: true,
        "bg-gray-100": false,
        "border-gray-200": true,
        "cursor-pointer": true,
        "active-panel":
          this.activeColumnIndex === columnIndex && this.activeRowIndex === rowIndex,
      });
    },
    divStyles() {
      return {
        minHeight: "600px",
        maxHeight: "600px",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
        right: "-20px",
      };
    },
    selectedColumn() {
        const state = this.controller?.state?.getState();
        if (!state || state.popupDataRow === undefined || state.popupDataColumn === undefined) return null;
        const currentRows = state.rows || [];
        return currentRows[state.popupDataRow]?.columns?.[state.popupDataColumn];
    },
    editingRowIndex() {
      const state = this.controller?.state?.getState();
      return (state && state.popupDataRow !== undefined) ? state.popupDataRow : null;
    },
    editingRow() {
      if (this.editingRowIndex !== null && this.rows && this.rows[this.editingRowIndex]) {
        return this.rows[this.editingRowIndex];
      }
      return null;
    },
    computedAllBuilderOptions() {
      if (this.controller && typeof this.controller.getAllBuilderOptions === 'function') {
        return this.controller.getAllBuilderOptions();
      }
      return [];
    },

    // Drag and Drop Computed Properties
    isDragging() {
      return this.controller?.state?.getState()?.isDragging || false;
    },
    draggedItemType() {
      return this.controller?.state?.getState()?.draggedItemType || null;
    },
    draggedItemData() {
      return this.controller?.state?.getState()?.draggedItemData || null;
    },
    dragOverTarget() {
      return this.controller?.state?.getState()?.dragOverTarget || null;
    },
    dragOverTargetType() {
      return this.controller?.state?.getState()?.dragOverTargetType || null;
    },
    // Block Templates - ใช้ props แทน local data
    availableBlockTemplates() {
      return this.blockTemplates || [];
    },
    
    isLoadingBlockTemplates() {
      return this.loadingBlockTemplates || false;
    },
    
    // Hierarchical Content Items สำหรับ ContentSelectorModal แบบใหม่
    hierarchicalContentItems() {
      // ส่งไอเท็มทั้งหมดพร้อม category metadata
      return getHierarchicalItems();
    },
  },
  methods: {
    // --- Methods Delegated to Controller ---
    addRow() { 
      this.controller?.rowController?.addRow(); 
      // updateDataForParent will be triggered automatically via callback
    },
    addColumn(rowIndex) { 
      this.controller?.columnController?.addColumn(rowIndex); 
      // updateDataForParent will be triggered automatically via callback
    },

    // โหลดข้อมูล menu สำหรับ navigation elements
    async loadMenuData() {
      try {
        if (this.controller?.dataController) {
          const result = await this.controller.dataController.getMenuData();
          if (result.success) {
            this.controller.state.setMenuData(result.data);
            console.log('[Builder] Menu data loaded successfully:', result.data);
          } else {
            console.warn('[Builder] Failed to load menu data');
          }
        }
      } catch (error) {
        console.error('[Builder] Error loading menu data:', error);
      }
    },

    // Drag and Drop Methods
    startDragColumn(rowIndex, columnIndex, event) {
      this.controller?.startDragColumn(rowIndex, columnIndex, event);
    },
    startDragObject(rowIndex, columnIndex, itemIndex, event) {
      this.controller?.startDragObject(rowIndex, columnIndex, itemIndex, event);
    },
    handleDragOver(event, targetType, targetData) {
      this.controller?.handleDragOver(event, targetType, targetData);
    },
    handleDragLeave(event) {
      this.controller?.handleDragLeave(event);
    },
    handleDrop(event, targetType, targetData) {
      return this.controller?.handleDrop(event, targetType, targetData);
    },
    handleDragEnd() {
      // Clear drag state when drag is cancelled or ends
      this.controller?.endDrag();
    },
    getDragState() {
      return this.controller?.getDragState() || {
        isDragging: false,
        draggedItemType: null,
        draggedItemData: null,
        dragOverTarget: null,
        dragOverTargetType: null
      };
    },
    isValidDropTarget(targetType, targetData) {
      return this.controller?.canDrop(targetType, targetData) || false;
    },

    removeRow(index) { 
        this.controller?.state?.showConfirmationDialog(
            "คุณต้องการลบแถวแนวนอน (Row) นี้ ?", 
            "ยืนยันการทำรายการ"
        );
        if(this.controller?.state?.getState) this.controller.state.getState().deletionData = { type: "row", rowIndex: index };
    },
    removeColumn(rowIndex, colIndex) { 
        this.controller?.state?.showConfirmationDialog(
            "คุณต้องการลบแถวแนวตั้ง (Column) นี้ ?", 
            "ยืนยันการทำรายการ"
        );
        if(this.controller?.state?.getState) this.controller.state.getState().deletionData = { type: "column", rowIndex, columnIndex: colIndex };
    },
    removeItem(rowIndex, colIndex, itemIndex) { 
        this.controller?.state?.showConfirmationDialog(
            "คุณต้องการลบเนื้อหา (Content) นี้ ?", 
            "ยืนยันการทำรายการ"
        );
        if(this.controller?.state?.getState) this.controller.state.getState().deletionData = { type: "item", rowIndex, columnIndex: colIndex, itemIndex };
    },
    cloneRow(index) { 
      this.controller?.rowController?.cloneRow(index); 
      // updateDataForParent will be triggered automatically via callback
    },
    cloneColumn(rowIndex, colIndex) { 
      this.controller?.columnController?.cloneColumn(rowIndex, colIndex); 
      // updateDataForParent will be triggered automatically via callback
    },
    cloneItem(rowIndex, colIndex, itemIndex) { 
      this.controller?.columnController?.cloneContentItem(rowIndex, colIndex, itemIndex); 
      // updateDataForParent will be triggered automatically via callback
    },
    moveRowUp(index) { this.controller?.rowController?.moveRowUp(index); },
    moveRowDown(index) { this.controller?.rowController?.moveRowDown(index); },
    moveColumnLeft(rowIndex, colIndex) { this.controller?.columnController?.moveColumnLeft(rowIndex, colIndex); },
    moveColumnRight(rowIndex, colIndex) { this.controller?.columnController?.moveColumnRight(rowIndex, colIndex); },
    moveItemUp(rowIndex, colIndex, itemIndex) { this.controller?.columnController?.moveContentItemUp(rowIndex, colIndex, itemIndex); },
    moveItemDown(rowIndex, colIndex, itemIndex) { this.controller?.columnController?.moveContentItemDown(rowIndex, colIndex, itemIndex); },
    toggleRowPanel(index) { this.controller?.rowController?.toggleRowPanel(index); },
    toggleColumnPanel(rowIndex, columnIndex) {
      // ถ้า column ที่คลิกไม่ตรงกับ column ที่ active object อยู่ ให้ clear selectedItem
      const activeCol = this.controller?.state?.getState()?.activeColumnPanel;
      if (!activeCol || activeCol.row !== rowIndex || activeCol.col !== columnIndex) {
        // ถ้า object ที่ active อยู่ใน column อื่น ให้ลบ selectedItem
        if (this.selectedItem) {
          this.controller?.state?.setSelectedItem(null);
        }
      }
      this.controller?.columnController?.toggleColumnPanel(rowIndex, columnIndex);
    },
    previewLayout() { this.controller?.dataController?.previewLayout(); this.updateDataForParent(); }, // Added updateDataForParent

    async getDataFromParent() { 
        if (!this.controller || !this.getBuilder) {
            console.log("getDataFromParent: Controller or getBuilder prop is missing.");
            return;
        }
        try {
            console.log("getDataFromParent: Calling this.getBuilder()...");
            const fetchedData = await this.getBuilder(); 
            
            let loggableFetchedData = fetchedData;
            if (typeof fetchedData !== 'undefined' && fetchedData !== null) {
                try {
                    // พยายาม stringify เฉพาะถ้ามันไม่ใช VNode หรือ object ที่ซับซ้อนเกินไป
                    if (typeof fetchedData === 'object' && fetchedData !== null && !fetchedData.constructor?.name.includes('VNode')) {
                        loggableFetchedData = JSON.parse(JSON.stringify(fetchedData));
                    }
                } catch (e) {
                    // ถ้า stringify ไม่ได้ ก็ log object ดิบๆ หรือข้อความแทน
                    loggableFetchedData = "[Object potentially non-serializable or VNode]"; 
                    console.warn("getDataFromParent: fetchedData might be a VNode or non-serializable:", fetchedData);
                }
            }

            if (typeof fetchedData !== 'undefined') {
                console.log("getDataFromParent: Data received from this.getBuilder():", loggableFetchedData);
            } else {
                console.log("getDataFromParent: Data received from this.getBuilder() is UNDEFINED.");
            }

            if (fetchedData) { 
                let newRows = [];
                let newCss = this.controller.state.getCssCode(); 
                let newDataItem = this.controller.state.getState().dataItem;

                if (fetchedData._id) {
                    newDataItem = fetchedData._id;
                }

                // โครงสร้างที่คาดหวังจาก WrapperBuilder.getData() คือ object ที่มี property .builder เป็น array และ .css เป็น string
                if (Array.isArray(fetchedData.builder)) { 
                    newRows = fetchedData.builder;
                } else {
                    newRows = []; 
                }

                if (typeof fetchedData.css === 'string') { 
                    newCss = fetchedData.css;
                } else {
                    console.log("getDataFromParent: fetchedData.css is not a string or undefined. Using current CSS.", fetchedData.css);
                }
                
                this.controller.state.getState().rows = newRows;
                this.controller.state.setCssCode(newCss);
                this.controller.state.getState().dataItem = newDataItem;

                this.updateDataForParent(); 

            } else {
                this.controller.state.getState().rows = [];
                this.controller.state.setCssCode("");
            }
        } catch (error) {
            // กรณ๊ error ก็ควรจะตั้ง state เป็น default ที่ปลอดภัย
            this.controller.state.getState().rows = [];
            this.controller.state.setCssCode("");
        }
    },
    saveCss() { this.controller?.dataController?.saveCss(); this.updateDataForParent(); }, // Added updateDataForParent
    openCssModal() { this.controller?.state?.openCssModal(); },
    closeCssModal() { this.controller?.state?.closeCssModal(); },
    handleCssSave(newCssCode) { 
      // อัพเดท CSS code ใน controller state
      this.controller?.state?.setCssCode(newCssCode);
      // บันทึกและปิด modal
      this.controller?.dataController?.saveCss(); 
      this.updateDataForParent();
      this.controller?.state?.closeCssModal();
    },
    handleCssClose() {
      this.controller?.state?.closeCssModal();
    },
    openAddContentAndLightbox(rowIndex, columnIndex) { this.controller?.openContentLightbox(rowIndex, columnIndex); },
    closeLightbox() { this.controller?.state?.closeLightbox(); },
    openEditPopup(rowIndex, columnIndex, itemIndex) { this.controller?.openEditPopup(rowIndex, columnIndex, itemIndex); },
    saveEditedItem() { 
        this.controller?.dataController?.saveEditedItem(); 
        this.updateDataForParent(); // Added updateDataForParent
        
        // Auto-generate CSS สำหรับ custom ID/class หลังจากบันทึกแล้ว
        this.processCustomCSSGeneration();
    },
    cancelEditPopup() { this.controller?.state?.closeEditPopup(); },
    handleItemClick(item, rowIndex, columnIndex) { this.controller?.handleItemClick(item, rowIndex, columnIndex); },
    handleUpdate(data) { this.controller?.handleUpdate(data); },
    handleUpdateItem(updatedItemProperties) {
      console.log('[Builder.vue] handleUpdateItem CALLED. Payload:', updatedItemProperties); // Log สั้นๆ
      if (this.controller && this.controller.state && this.controller.dataController) {
        // อัปเดต selectedItem ใน state ของ controller
        this.controller.state.setSelectedItem(updatedItemProperties);
        this.updateDataForParent();
      } else {
        console.error('[Builder.vue] Controller or its properties are not available.');
      }
    },
    updateAllSides(value, type) { this.controller?.updateAllSides(value, type); },
    updateBackgroundProperties(bgType, prefix) { this.controller?.updateBackgroundProperties(bgType, prefix); },
    openTemplateModal() { this.controller?.dataController?.openTemplateModal(); },
    closeModal() { this.controller?.dataController?.closeTemplateModal(); },
    selectTemplate(template) { this.controller?.dataController?.selectTemplate(template).then(() => this.updateDataForParent()); },
    
    // Method to inform parent about data changes (like original Builder.vue's previewLayout -> updateData)
    updateDataForParent(){
        if(this.controller && this.controller.state) { // Ensure controller and state exist
            const layoutData = {
                builder: this.controller.state.getState().rows,
                css: this.controller.state.getCssCode(),
                selectedItem: this.controller.state.getState().selectedItem // Changed to access property directly
            };
            
            // Add debugging
            console.log('[Builder.vue] updateDataForParent: Emitting layout data', {
              rowsCount: layoutData.builder ? layoutData.builder.length : 0,
              cssLength: layoutData.css ? layoutData.css.length : 0,
              hasSelectedItem: !!layoutData.selectedItem
            });
            
            this.$emit("update-layout", layoutData);
        }
    },

    // --- Local Methods for UI or specific event handling ---
    showPreview(id) { 
        if (this.controller?.state?.getState) this.controller.state.getState().dataItem = id; 
        if (this.controller?.state?.getState) this.controller.state.getState().previewVisible = true;
    },
    hidePreview() {
      if (this.controller?.state?.getState) this.controller.state.getState().previewVisible = false;
    },
    setRowRef(el, index) { if (el) this.rowRefs[index] = el; },
    setColumnRef(el, rowIndex, columnIndex) {
      if (el) {
        if (!this.columnRefs[rowIndex]) this.columnRefs[rowIndex] = {};
        this.columnRefs[rowIndex][columnIndex] = el;
      }
    },
    extractYouTubeId(url) { return this.controller?.extractYouTubeId(url) || ""; },
    isValidType(type) { return this.controller?.state?.getValidTypes().includes(type) || false; },
    loadComponentLoop(componentName) { 
        return this.controller?.loadComponentLoop(componentName) || false;
    },
    OpenFileBrowser(index) { this.controller?.openFileBrowser(index); }, 
    OpenFileImageBrowser() { this.controller?.state?.openFileImageBrowser(); },
    OpenFilePreviewBrowser() { this.controller?.state?.openFilePreviewBrowser(); },
    changeFileTrigger(payload) { this.FileBrowserOpen = payload; }, // Uses computed setter
    selectFileTrigger(payload) { 
        if (payload && this.controller?.state?.getState) {
            const state = this.controller.state.getState();
            if (state.selectedItem && state.selectedItem.slides && state.selectedSlideItemIndex !== undefined) {
                state.selectedItem.slides[state.selectedSlideItemIndex].image = payload.file;
                state.selectedSlideItemIndex = undefined; 
            }
        }
    },
    changeFileImageTrigger(payload) { this.FileImageBrowserOpen = payload; }, // Uses computed setter
    selectFileImageTrigger(payload) {
        if (payload && this.controller?.state?.getState) {
            const state = this.controller.state.getState();
            if (state.selectedItem) state.selectedItem.url = payload.file;
        }
    },
    changeFilePreviewTrigger(payload) { this.FilePreviewBrowserOpen = payload; }, // Uses computed setter
    selectFilePreviewTrigger(payload) {
        if (payload && this.controller?.state?.getState) {
            const state = this.controller.state.getState();
            if (state.selectedItem) state.selectedItem.fileurl = payload.file;
        }
    },
    handleConfirmation() {
      if (this.controller?.state?.getState) {
        const state = this.controller.state.getState();
        if (state.deletionData) {
          const { type, rowIndex, columnIndex, itemIndex } = state.deletionData;
          if (type === 'row') this.controller.rowController.removeRow(rowIndex);
          else if (type === 'column') this.controller.columnController.removeColumn(rowIndex, columnIndex);
          else if (type === 'item') this.controller.columnController.removeContentItem(rowIndex, columnIndex, itemIndex);
          else if (type === 'clearAll') {
            // Clear all rows
            this.controller.state.getState().rows = [];
            this.controller.state.setCssCode('');
            console.log('🗑️ All content cleared');
            if (this.$toast) {
              this.$toast.success('ลบเนื้อหาทั้งหมดแล้ว');
            }
          }
          state.deletionData = null;
          this.updateDataForParent(); // Update parent after deletion
        }
        this.controller.state.hideConfirmationDialog();
      }
    },
    handleConfirmCancel() {
      if (this.controller?.state?.getState) {
        this.controller.state.getState().deletionData = null;
        this.controller.state.hideConfirmationDialog();
      }
    },
    handlePanelAction(action) {
      if (action === "addRow") this.addRow();
      else if (action === "save") this.previewLayout();
      else if (action === "reload") this.getDataFromParent();
    },
    // Methods for specific item interactions if not covered by dynamic components
    addSlide(selectedItem) { if(selectedItem && selectedItem.slides) selectedItem.slides.push({ title: "", subtitle: "", image: "", link: "" }); },
    deleteSlide(index) { if(this.selectedItem && this.selectedItem.slides) this.selectedItem.slides.splice(index, 1); },
    moveSlideUp(index) {
        if (this.selectedItem && this.selectedItem.slides && index > 0) {
            const slide = this.selectedItem.slides.splice(index, 1)[0];
            this.selectedItem.slides.splice(index - 1, 0, slide);
        }
    },
    moveSlideDown(index) {
        if (this.selectedItem && this.selectedItem.slides && index < this.selectedItem.slides.length - 1) {
            const slide = this.selectedItem.slides.splice(index, 1)[0];
            this.selectedItem.slides.splice(index + 1, 0, slide);
        }
    },
    cloneSlide(index) {
        if (this.selectedItem && this.selectedItem.slides) {
            const slide = this.selectedItem.slides[index];
            const clonedSlide = { ...slide }; 
            this.selectedItem.slides.splice(index + 1, 0, clonedSlide);
        }
    },
    showSlideActionPanel(index) { // This method likely was local, to set local selectedSlideIndex
        if(this.controller?.state?.getState) this.controller.state.getState().selectedSlideIndex = index;
    },
    saveSlideChanges() { // Similar to showSlideActionPanel
        // this.selectedSlideIndex = null;
        if(this.controller?.state?.getState) this.controller.state.getState().selectedSlideIndex = null;
    },
    cancelSlideEdit() { // Similar to showSlideActionPanel
        // this.selectedSlideIndex = null;
        if(this.controller?.state?.getState) this.controller.state.getState().selectedSlideIndex = null;
    },
    // Methods for Radio/Checkbox/Select options - these directly modify `selectedItem` which is from controller state
    addRadioOption(selectedItem) { if(selectedItem && selectedItem.options) selectedItem.options.push({ label: "", value: "" }); },
    deleteRadioOption(index) { if(this.selectedItem && this.selectedItem.options) this.selectedItem.options.splice(index, 1); },
    // ... other radio/checkbox/select option methods modify `this.selectedItem.options` directly ...
    addPaymentGateway(){
        if (!this.newGateway.name || !this.newGateway.description) {
            alert("Please provide both the gateway name and description.");
            return;
        }
        if (!this.selectedItem.gateways) this.selectedItem.gateways = [];
        this.selectedItem.gateways.push({ ...this.newGateway });
        this.newGateway = { name: "", description: "" }; // Reset local newGateway
    },
    deletePaymentGateway(index){ if(this.selectedItem.gateways) this.selectedItem.gateways.splice(index,1); },

    // Sub-menu closing methods
    closeFormSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showFormSubMenu = false; },
    closeLessonSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showLessonSubMenu = false; },
    closeNavSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showNavSubMenu = false; },
    closeDashboardSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showDashboardSubMenu = false; },
    showColorPicker(fieldName) { // Added this method
      if (this.showColorPickerField === fieldName) {
        this.showColorPickerField = null;
      } else {
        this.showColorPickerField = fieldName;
      }
    },
    updateColor(fieldName) { // Added this method (content commented out)
      console.log('updateColor called for:', fieldName); // Added to use fieldName
    },
    handleUpdateSelectedItemProperty({ property, value }) {
      if (this.selectedItem) {
        // ถ้าเป็น customId ให้เช็คความซ้ำก่อน
        if (property === 'customId' && value && value.trim()) {
          const isDuplicate = this.checkCustomIdDuplicate(value.trim(), this.selectedItem.uid);
          if (isDuplicate) {
            // แสดง error message และไม่อัพเดทค่า
            if (this.$toast) {
              this.$toast.error(`Custom ID "${value.trim()}" ถูกใช้แล้ว กรุณาใช้ ID อื่น`);
            } else {
              console.error(`Custom ID "${value.trim()}" is already in use`);
            }
            return; // หยุดการอัพเดท
          }
        }
        
        const updatedSelectedItem = { ...this.selectedItem, [property]: value };
        this.handleUpdateItem(updatedSelectedItem);
        
        // ลบ auto-generate CSS ออกจากตรงนี้ - ย้ายไปทำเมื่อบันทึก
      }
    },
    
    /**
     * เช็คว่า customId ซ้ำกับ element อื่นใน builderData หรือไม่
     */
    checkCustomIdDuplicate(customId, currentElementUid) {
      if (!customId || !this.controller?.state?.getState()?.rows) return false;
      
      const rows = this.controller.state.getState().rows;
      const foundIds = [];
      
      // ฟังก์ชันสำหรับ traverse และเก็บ customId ทั้งหมด
      const collectCustomIds = (element) => {
        if (element && element.customId && element.uid !== currentElementUid) {
          foundIds.push({
            customId: element.customId,
            uid: element.uid,
            type: element.type || 'unknown'
          });
        }
      };
      
      // เช็ค rows
      rows.forEach(row => {
        collectCustomIds(row);
        
        // เช็ค columns
        if (row.columns && Array.isArray(row.columns)) {
          row.columns.forEach(column => {
            collectCustomIds(column);
            
            // เช็ค objects (content items)
            if (column.object && Array.isArray(column.object)) {
              column.object.forEach(item => {
                collectCustomIds(item);
              });
            }
          });
        }
      });
      
      // เช็คความซ้ำ
      const duplicate = foundIds.find(item => item.customId === customId);
      
      if (duplicate) {
        console.warn(`Custom ID "${customId}" conflicts with:`, {
          uid: duplicate.uid,
          type: duplicate.type
        });
        return true;
      }
      
      return false;
    },
    
    /**
     * ดึงรายการ customId ทั้งหมดที่ใช้แล้วใน builderData
     */
    getAllUsedCustomIds() {
      if (!this.controller?.state?.getState()?.rows) return [];
      
      const rows = this.controller.state.getState().rows;
      const usedIds = [];
      
      const collectIds = (element) => {
        if (element && element.customId) {
          usedIds.push({
            customId: element.customId,
            uid: element.uid,
            type: element.type || 'unknown'
          });
        }
      };
      
      // เก็บ customId จาก rows, columns, และ objects
      rows.forEach(row => {
        collectIds(row);
        
        if (row.columns && Array.isArray(row.columns)) {
          row.columns.forEach(column => {
            collectIds(column);
            
            if (column.object && Array.isArray(column.object)) {
              column.object.forEach(item => {
                collectIds(item);
              });
            }
          });
        }
      });
      
      return usedIds;
    },
    
    /**
     * แสดง report ของ customId ที่ใช้แล้วทั้งหมด (สำหรับ debugging)
     */
    debugCustomIds() {
      const usedIds = this.getAllUsedCustomIds();
      console.group('🔍 Custom ID Usage Report');
      console.log('Total Custom IDs used:', usedIds.length);
      
      if (usedIds.length > 0) {
        console.table(usedIds);
        
        // เช็คความซ้ำ
        const duplicates = usedIds.filter((item, index, array) => 
          array.findIndex(other => other.customId === item.customId) !== index
        );
        
        if (duplicates.length > 0) {
          console.warn('⚠️  Found duplicate Custom IDs:');
          console.table(duplicates);
        } else {
          console.log('✅ No duplicate Custom IDs found');
        }
      } else {
        console.log('No Custom IDs are currently in use');
      }
      console.groupEnd();
    },
    handleUpdateColorValue({ fieldName, value }) {
      if (this.selectedItem) {
        const updatedSelectedItem = { ...this.selectedItem, [fieldName]: value };
        this.selectedItem[fieldName] = value; 
        this.handleUpdateItem(updatedSelectedItem);
      }
    },
    handleUpdateLocalBuilderData({ key, value }){
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value;
        
        // Handle special cases for setAll toggles
        if (key === 'setAllPadding') {
          console.log('📊 setAllPadding changed to:', value);
          if (!value) {
            // When turning off "Set All", clear the general padding value
            // and ensure individual padding fields are visible
            this.paddingValue = '';
            // Force Vue to re-render the template section
            this.$nextTick(() => {
              console.log('✅ Padding individual controls should now be visible');
            });
          } else {
            // When turning on "Set All", clear individual padding values
            if (this.selectedItem) {
              this.handleUpdateSelectedItemProperty({ property: 'paddingLeft', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'paddingRight', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'paddingTop', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'paddingBottom', value: '' });
            }
          }
        }
        
        if (key === 'setAllMargin') {
          console.log('📊 setAllMargin changed to:', value);
          if (!value) {
            // When turning off "Set All", clear the general margin value
            // and ensure individual margin fields are visible
            this.marginValue = '';
            // Force Vue to re-render the template section
            this.$nextTick(() => {
              console.log('✅ Margin individual controls should now be visible');
            });
          } else {
            // When turning on "Set All", clear individual margin values
            if (this.selectedItem) {
              this.handleUpdateSelectedItemProperty({ property: 'marginLeft', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'marginRight', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'marginTop', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'marginBottom', value: '' });
            }
          }
        }
        
        if (key === 'setAllInnerPadding') {
          console.log('📊 setAllInnerPadding changed to:', value);
          if (!value) {
            // When turning off "Set All", clear the general inner padding value
            this.paddingInnerValue = '';
            this.$nextTick(() => {
              console.log('✅ Inner padding individual controls should now be visible');
            });
          } else {
            // When turning on "Set All", clear individual inner padding values
            if (this.selectedItem) {
              this.handleUpdateSelectedItemProperty({ property: 'paddingInnerLeft', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'paddingInnerRight', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'paddingInnerTop', value: '' });
              this.handleUpdateSelectedItemProperty({ property: 'paddingInnerBottom', value: '' });
            }
          }
        }
      } else {
        console.warn(`Attempted to update non-existent local data property: ${key}`);
      }
    },
    
    /**
     * Handle updates to Set All values (paddingValue, marginValue, paddingInnerValue)
     * These values apply to all sides when setAll mode is enabled
     */
    handleSetAllValueUpdate({ key, value }) {
      console.log('📊 handleSetAllValueUpdate:', key, '=', value);
      
      // Update the local value first
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        this[key] = value;
      }
      
      // Apply the value to all appropriate individual properties
      if (key === 'paddingValue' && this.setAllPadding && this.selectedItem) {
        this.handleUpdateSelectedItemProperty({ property: 'padding', value: value });
        // Clear individual values when using setAll
        this.handleUpdateSelectedItemProperty({ property: 'paddingLeft', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'paddingRight', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'paddingTop', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'paddingBottom', value: '' });
      }
      
      if (key === 'marginValue' && this.setAllMargin && this.selectedItem) {
        this.handleUpdateSelectedItemProperty({ property: 'margin', value: value });
        // Clear individual values when using setAll
        this.handleUpdateSelectedItemProperty({ property: 'marginLeft', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'marginRight', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'marginTop', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'marginBottom', value: '' });
      }
      
      if (key === 'paddingInnerValue' && this.setAllInnerPadding && this.selectedItem) {
        this.handleUpdateSelectedItemProperty({ property: 'paddingInner', value: value });
        // Clear individual values when using setAll
        this.handleUpdateSelectedItemProperty({ property: 'paddingInnerLeft', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'paddingInnerRight', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'paddingInnerTop', value: '' });
        this.handleUpdateSelectedItemProperty({ property: 'paddingInnerBottom', value: '' });
      }
    },
    handleDeleteLogicItem({ index }) {
      if (this.selectedItem && this.selectedItem.logics && this.selectedItem.logics[index]) {
        const logicItemToDelete = this.selectedItem.logics[index];
        
        // ใช้ Controller method สำหรับการลบแบบ Bidirectional
        if (this.controller && typeof this.controller.removeLogicItem === 'function') {
          const success = this.controller.removeLogicItem(logicItemToDelete.uid, this.selectedItem);
          if (success) {
            // อัปเดต selectedItem หลังจากลบสำเร็จ
            const updatedLogics = [...this.selectedItem.logics];
            updatedLogics.splice(index, 1);
            const newSelectedItem = { ...this.selectedItem, logics: updatedLogics };
            this.handleUpdateItem(newSelectedItem);
          }
        } else {
          // Fallback: ลบแบบเดิม (แค่ที่ต้นทาง)
          const updatedLogics = [...this.selectedItem.logics];
          updatedLogics.splice(index, 1);
          const newSelectedItem = { ...this.selectedItem, logics: updatedLogics };
          this.handleUpdateItem(newSelectedItem);
        }
      }
    },
    handleUpdateLogicItemProperty({ index, property, value }) {
      if (this.selectedItem && this.selectedItem.logics && this.selectedItem.logics[index]) {
        const logicItem = this.selectedItem.logics[index];
        
        // ใช้ Controller method สำหรับการอัปเดตแบบ Bidirectional
        if (this.controller && typeof this.controller.updateLogicItem === 'function') {
          const updates = { [property]: value };
          const success = this.controller.updateLogicItem(logicItem.uid, updates, this.selectedItem);
          if (success) {
            // อัปเดต selectedItem หลังจากอัปเดตสำเร็จ
            const updatedLogics = this.selectedItem.logics.map((item, i) => {
              if (i === index) {
                return { ...item, [property]: value };
              }
              return item;
            });
            const newSelectedItem = { ...this.selectedItem, logics: updatedLogics };
            this.handleUpdateItem(newSelectedItem);
          }
        } else {
          // Fallback: อัปเดตแบบเดิม (แค่ที่ต้นทาง)
          const updatedLogics = this.selectedItem.logics.map((item, i) => {
            if (i === index) {
              return { ...item, [property]: value };
            }
            return item;
          });
          const newSelectedItem = { ...this.selectedItem, logics: updatedLogics };
          this.handleUpdateItem(newSelectedItem);
        }
      }
    },
    handleSetLogicItemMethod({ index, methodValue, originalSelectedItem }) {
      if (originalSelectedItem && originalSelectedItem.logics && originalSelectedItem.logics[index]) {
        const logicItem = originalSelectedItem.logics[index];
        
        // ใช้ Controller method สำหรับการอัปเดตแบบ Bidirectional
        if (this.controller && typeof this.controller.updateLogicItem === 'function') {
          const updates = { method: methodValue };
          const success = this.controller.updateLogicItem(logicItem.uid, updates, originalSelectedItem);
          if (success) {
            // อัปเดต selectedItem หลังจากอัปเดตสำเร็จ
            const newLogics = originalSelectedItem.logics.map((item, i) => {
              if (i === index) {
                return { ...item, method: methodValue };
              }
              return item;
            });
            const newSelectedItem = { ...originalSelectedItem, logics: newLogics };
            this.handleUpdateItem(newSelectedItem);
          }
        } else {
          // Fallback: อัปเดตแบบเดิม
          const newLogics = originalSelectedItem.logics.map((item, i) => {
            if (i === index) {
              return { ...item, method: methodValue };
            }
            return item;
          });
          const newSelectedItem = { ...originalSelectedItem, logics: newLogics };

          // Call controller or local addLogicItem after updating the method
          if (this.controller && typeof this.controller.addLogicItem === 'function') {
              this.controller.addLogicItem(newSelectedItem.logics[index], newSelectedItem); 
          }
          this.handleUpdateItem(newSelectedItem);
        }
      }
    },
    handleAddNewLogicRule({ selectedItemOriginal }) {
        // ใช้ Controller method สำหรับการเพิ่มแบบ Bidirectional
        if (this.controller && typeof this.controller.addLogicItem === 'function') {
            const success = this.controller.addLogicItem(null, selectedItemOriginal);
            if (success) {
              // อัปเดต selectedItem หลังจากเพิ่มสำเร็จ
              this.handleUpdateItem(selectedItemOriginal);
            }
        } else {
            // Fallback: if no controller method, try to append a default structure locally
            const newLogicItem = { uid: `logic-${Date.now()}`, default: '', destination: null, method: '' };
            const newLogics = selectedItemOriginal.logics ? [...selectedItemOriginal.logics, newLogicItem] : [newLogicItem];
            const newSelectedItem = { ...selectedItemOriginal, logics: newLogics };
            this.handleUpdateItem(newSelectedItem);
        }
    },

    boundGetParentLogicObjectName(logicItem) {
        if (this.controller && typeof this.controller.getParentLogicObjectName === 'function') {
            return this.controller.getParentLogicObjectName(logicItem);
        }
        // Fallback local implementation if controller does not provide the method
        if (logicItem && logicItem.request === true && logicItem._metadata) {
            const parentName = logicItem._metadata.parentName || 'Unknown';
            const parentUid = logicItem._metadata.parentUid || 'N/A';
            return `${parentName} (${parentUid})`;
        }
        // รองรับรูปแบบเก่า
        if (logicItem && logicItem.request && typeof logicItem.request === 'object') {
            const parentName = logicItem.request.parentName || 'Unknown';
            return `${parentName} (${logicItem.request.parentUid})`;
        }
        return 'Unknown Parent (Builder fallback)';
    },
    
    // Grid controls
    toggleGridLines() {
      this.showGridLines = !this.showGridLines;
    },
    handleSaveData() {
      this.$emit("save-data", this.controller.state.getState());
    },
    handleReloadData() {
      this.$emit("reload-data", this.controller.state.getState());
    },
    
    // Undo/Redo methods for toolbar
    undo() {
      this.$emit('undo');
    },
    
    redo() {
      this.$emit('redo');
    },
    
    // Active tool setter
    setActiveTool(tool) {
      this.builderTools.selectedTool = tool;
    },
    
    // Export/Import methods for toolbar
    exportData() {
      this.exportBuilderData();
    },
    
    importDataFromToolbar() {
      this.importBuilderData();
    },
    
    // Clear all content
    clearAll() {
      if (this.controller?.state?.getState) {
        this.controller.state.showConfirmationDialog(
          "คุณต้องการลบเนื้อหาทั้งหมดหรือไม่?", 
          "ยืนยันการลบข้อมูล"
        );
        this.controller.state.getState().deletionData = { type: "clearAll" };
      }
    },
    
    // Save/Load template methods for toolbar
    saveTemplate() {
      // Open save template modal
      this.showSaveTemplateModal = true;
      this.templateName = '';
      this.templateDescription = '';
    },
    
    loadTemplate() {
      this.openBlockTemplateModal();
    },
    
    // Revision History Modal Methods
    openRevisionHistoryModal() {
      this.showRevisionHistoryModal = true;
      this.loadRevisionHistory();
    },
    closeRevisionHistoryModal() {
      this.showRevisionHistoryModal = false;
    },
    async loadRevisionHistory() {
      this.loadingRevisionHistory = true;
      try {
        // เรียกใช้ข้อมูล revisions จาก parent component
        this.$emit('load-revisions');
        
        // รอให้ parent component โหลดข้อมูลเสร็จ
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // ข้อมูล revision จะถูกส่งมาผ่าน props จาก parent
        // ไม่ต้องใช้ mock data แล้ว
        console.log('Revision history loaded from parent');
      } catch (error) {
        console.error('Error loading revision history:', error);
      } finally {
        // No need to set loading state here since it comes from props
      }
    },
    handleRevisionRollback(revision) {
      // ส่งข้อมูลไปยัง parent component หรือ controller
      console.log('Rolling back to revision:', revision);
      this.closeRevisionHistoryModal();
      // Emit event หรือเรียก controller method
      this.$emit('revision-rollback', revision);
    },
    handleRevisionBranch(revision) {
      // สร้าง branch จาก revision
      console.log('Creating branch from revision:', revision);
      this.closeRevisionHistoryModal();
      // Emit event หรือเรียก controller method
      this.$emit('revision-branch', revision);
    },
    handleRevisionDelete(revisionId) {
      // ลบ revision
      console.log('Deleting revision:', revisionId);
      // Emit event ไปยัง parent component
      this.$emit('revision-delete', revisionId);
    },
    refreshRevisionHistory() {
      this.loadRevisionHistory();
    },
    
    // Sticky Toolbar Methods
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // เปลี่ยนเป็น sticky เมื่อ scroll ลงมามากกว่า 100px
      this.isToolbarSticky = scrollTop > 100;
    },
    
    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
    },
    
    removeScrollListener() {
      window.removeEventListener('scroll', this.handleScroll);
    },
    
    // Keyboard Event Listeners (without fullscreen)
    addKeyboardListeners() {
      window.addEventListener('keydown', this.handleKeydown, { passive: false });
    },
    
    removeKeyboardListeners() {
      window.removeEventListener('keydown', this.handleKeydown);
    },
    
    handleKeydown(event) {
      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (this.canUndo) {
          this.$emit('undo');
        }
        return;
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
        event.preventDefault();
        if (this.canRedo) {
          this.$emit('redo');
        }
        return;
      }
    },
    
    // Device Preview Toggle Method
    toggleDevicePreview() {
      this.showDevicePreview = !this.showDevicePreview;
      
      // เมื่อเปิด device preview ให้เปิด preview ด้วย
      if (this.showDevicePreview) {
        this.showPreview(this.post._id);
      } else {
        // เมื่อปิด device preview ให้ปิด preview ด้วย
        this.hidePreview();
      }
    },
    
    // Device Viewport Methods
    setViewport(viewport) {
      this.currentViewport = viewport;
    },
    
    // Fit to Screen Method (without fullscreen)
    fitToScreen() {
      console.log('📏 Fitting builder to screen size');
      
      // Reset zoom level to 100%
      if (this.builderTools) {
        this.builderTools.zoom = 100;
      }
      
      // Center the viewport
      this.currentViewport = 'desktop';
      
      // Scroll to top of the builder
      const builderContainer = document.querySelector('.builder-canvas');
      if (builderContainer) {
        builderContainer.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      // Optional: Show a brief notification
      if (this.$toast) {
        this.$toast.info('ปรับขนาดให้พอดีหน้าจอแล้ว');
      } else {
        console.log('✅ Builder fitted to screen');
      }
    },
    exportBuilderData() {
      try {
        // รวบรวมข้อมูลจาก controller state และ builderData
        const exportData = {
          metadata: {
            title: this.builderData?.title || 'Untitled',
            type: this.builderData?.type || 'page',
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            exportedBy: 'Builder System'
          },
          builder: this.controller?.state?.getState()?.rows || this.rows || [],
          css: this.controller?.state?.getCssCode() || this.cssCode || '',
          settings: {
            // เพิ่ม settings อื่นๆ ที่ต้องการ export
            responsive: true,
            gridLines: this.showGridLines
          }
        };

        // สร้างชื่อไฟล์ตามชื่อ title และวันที่
        const fileName = `${(exportData.metadata.title || 'builder').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
        
        // สร้าง Blob และ download link
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(dataBlob);
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // แสดงข้อความสำเร็จ
        console.log('Builder data exported successfully:', fileName);
        
        // แสดง toast notification (ถ้ามี)
        if (this.$toast) {
          this.$toast.success(`ส่งออกข้อมูลสำเร็จ: ${fileName}`);
        }
        
      } catch (error) {
        console.error('Error exporting builder data:', error);
        if (this.$toast) {
          this.$toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
        }
      }
    },
    
    importBuilderData() {
      // สร้าง file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.style.display = 'none';
      
      fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // ตรวจสอบประเภทไฟล์
        if (!file.name.toLowerCase().endsWith('.json')) {
          if (this.$toast) {
            this.$toast.error('กรุณาเลือกไฟล์ JSON เท่านั้น');
          }
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            
            // ตรวจสอบโครงสร้างของข้อมูล
            if (!this.validateImportData(importedData)) {
              if (this.$toast) {
                this.$toast.error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
              }
              return;
            }
            
            // เก็บข้อมูลไว้ใน state และแสดง confirmation modal
            this.importData = importedData;
            this.importFileName = file.name;
            this.showImportModal = true;
            
          } catch (error) {
            console.error('Error parsing JSON file:', error);
            if (this.$toast) {
              this.$toast.error('ไม่สามารถอ่านไฟล์ JSON ได้');
            }
          }
        };
        
        reader.readAsText(file);
      };
      
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    },
    
    validateImportData(data) {
      // ตรวจสอบโครงสร้างพื้นฐานของข้อมูล
      if (!data || typeof data !== 'object') return false;
      
      // ตรวจสอบว่ามี builder array
      if (!Array.isArray(data.builder)) return false;
      
      // ตรวจสอบว่ามี css string (อนุญาตให้เป็น empty string)
      if (typeof data.css !== 'string') return false;
      
      // ตรวจสอบ metadata (optional)
      if (data.metadata && typeof data.metadata !== 'object') return false;
      
      return true;
    },
    
    confirmImport() {
      try {
        if (!this.importData) return;
        
        // สร้างข้อมูลสำหรับ import รวมกับ mode
        const importPayload = {
          ...this.importData,
          importMode: this.importMode // เพิ่ม import mode
        };
        
        // ส่ง event ไปที่ parent component (MainBuilderContainer) แทนการจัดการเอง
        this.$emit('import-json', importPayload);
        
        // ปิด modal
        this.showImportModal = false;
        this.importData = null;
        this.importFileName = '';
        this.importMode = 'replace'; // รีเซ็ต mode เป็นค่าเริ่มต้น
        
        console.log('Builder data imported successfully with mode:', this.importMode);
        
        // แสดงข้อความสำเร็จตาม mode
        const modeText = this.importMode === 'replace' ? 'แทนที่' : 'เพิ่มต่อท้าย';
        if (this.$toast) {
          this.$toast.success(`นำเข้าข้อมูลสำเร็จ (${modeText})`);
        }
        
      } catch (error) {
        console.error('Error importing builder data:', error);
        if (this.$toast) {
          this.$toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
        }
      }
    },

    cancelImport() {
      this.showImportModal = false;
      this.importData = null;
      this.importFileName = '';
      this.importMode = 'replace'; // รีเซ็ต mode เป็นค่าเริ่มต้น
    },
    
    // Save Row as Template Methods
    openSaveTemplateModal(rowIndex) {
      this.savingRowIndex = rowIndex;
      this.templateName = '';
      this.templateDescription = '';
      this.showSaveTemplateModal = true;
    },
    
    closeSaveTemplateModal() {
      this.showSaveTemplateModal = false;
      this.savingRowIndex = null;
      this.templateName = '';
      this.templateDescription = '';
      this.savingTemplate = false;
    },
    
    async saveRowAsTemplate() {
      if (!this.templateName.trim()) {
        if (this.$toast) {
          this.$toast.error('กรุณาระบุชื่อ Template');
        }
        return;
      }
      
      if (this.savingRowIndex === null || !this.rows[this.savingRowIndex]) {
        if (this.$toast) {
          this.$toast.error('ไม่พบข้อมูล Row ที่ต้องการบันทึก');
        }
        return;
      }
      
      this.savingTemplate = true;
      
      try {
        const rowData = this.rows[this.savingRowIndex];
        
        // สร้างข้อมูล template
        const templateData = {
          name: this.templateName.trim(),
          description: this.templateDescription.trim() || '',
          type: 'row_template',
          data: {
            ...rowData
          },
          created_at: new Date().toISOString(),
          created_by: 'Builder System',
          category: 'row',
          tags: ['row', 'template', 'builder']
        };
        
        // ส่งข้อมูลไปยัง parent component
        this.$emit('save-row-as-template', templateData);
        
        // แสดงข้อความสำเร็จ
        if (this.$toast) {
          this.$toast.success(`บันทึก Template "${this.templateName}" สำเร็จแล้ว`);
        }
        
        // ปิด modal
        this.closeSaveTemplateModal();
        
      } catch (error) {
        console.error('Error saving row as template:', error);
        if (this.$toast) {
          this.$toast.error('เกิดข้อผิดพลาดในการบันทึก Template');
        }
      } finally {
        this.savingTemplate = false;
      }
    },
    
    // Block Template Methods
    openBlockTemplateModal() {
      this.showBlockTemplateModal = true;
      this.loadBlockTemplates();
    },
    
    closeBlockTemplateModal() {
      this.showBlockTemplateModal = false;
      // ไม่ต้อง reset blockTemplates เพราะใช้ props
      this.selectedTemplate = null;
      this.showTemplatePreview = false;
    },
    
    async loadBlockTemplates() {
      try {
        // ส่ง event ไปยัง parent เพื่อโหลด block templates
        this.$emit('load-block-templates');
        
        // รอให้ parent โหลดข้อมูลเสร็จ (ใช้ props)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Block templates loading requested');
        
      } catch (error) {
        console.error('Error loading block templates:', error);
        if (this.$toast) {
          this.$toast.error('เกิดข้อผิดพลาดในการโหลด Block Templates');
        }
      }
    },
    
    async selectBlockTemplate(template) {
      try {
        console.log('Selected block template:', template);
        
        if (!template || !template.data) {
          console.error('Invalid template data:', template);
          throw new Error('Invalid template data');
        }
        
        // ตรวจสอบ controller
        if (!this.controller?.rowController) {
          console.error('Controller or rowController not available');
          throw new Error('Controller not available');
        }
        
        console.log('Adding new row...');
        
        // เพิ่ม row ใหม่แล้วแทนที่ข้อมูลด้วย template data
        this.controller.rowController.addRow();
        
        // ได้ index ของ row ที่เพิ่มใหม่ (row สุดท้าย)
        const newRowIndex = this.rows.length - 1;
        console.log('New row index:', newRowIndex);
        
        // แทนที่ข้อมูล row ใหม่ด้วยข้อมูลจาก template
        if (this.rows[newRowIndex] && template.data) {
          // สร้าง uid ใหม่สำหรับ row
          const newRowId = `row-${Date.now()}`;
          
          // คัดลอกข้อมูลจาก template แต่ใช้ uid ใหม่
          const templateRowData = {
            ...template.data,
            uid: newRowId
          };
          
          // สร้าง uid ใหม่สำหรับ columns ด้วย
          if (templateRowData.columns && Array.isArray(templateRowData.columns)) {
            templateRowData.columns = templateRowData.columns.map((col, index) => ({
              ...col,
              uid: `${newRowId}-col-${index}`
            }));
          }
          
          console.log('Template row data:', templateRowData);
          
          // แทนที่ข้อมูล row ที่เพิ่มใหม่
          this.controller.state.getState().rows[newRowIndex] = templateRowData;
          
          console.log('Row replaced with template data');
        }
        
        // อัปเดตข้อมูลให้ parent
        this.updateDataForParent();
        console.log('Data updated for parent');
        
        // แสดงข้อความสำเร็จ
        const successMessage = `เพิ่ม Row จาก Template "${template.name}" สำเร็จแล้ว`;
        if (this.$toast) {
          this.$toast.success(successMessage);
        } else {
          console.log('SUCCESS:', successMessage); // Fallback
        }
        
        // ปิด modal
        this.closeBlockTemplateModal();
        console.log('Modal closed');
        
        
      } catch (error) {
        console.error('Error selecting block template:', error);
        const errorMessage = 'เกิดข้อผิดพลาดในการเพิ่ม Row จาก Template';
        
        if (this.$toast) {
          this.$toast.error(errorMessage);
        } else {
          console.error('ERROR:', errorMessage);
          alert(errorMessage); // Fallback
        }
      }
    },
    
    // แสดงรายละเอียด template
    showTemplateDetails(template) {
      console.log('Showing template details for:', template);
      this.selectedTemplate = template;
      this.showTemplatePreview = true;
    },
    
    // ปิด template preview
    closeTemplatePreview() {
      this.selectedTemplate = null;
      this.showTemplatePreview = false;
    },
    
    // กลับไปหน้ารายการ template
    backToTemplateList() {
      this.closeTemplatePreview();
    },
    
    // ใช้ template (method เดิมที่แก้ไขแล้ว)
    async useTemplate(template) {
      await this.selectBlockTemplate(template || this.selectedTemplate);
    },
    /**
     * Reset ค่า local state ทั้งหมดให้ตรงกับ selectedItem ใหม่
     * เมื่อเปิด edit popup หรือเปลี่ยน selectedItem
     * ฟังก์ชันนี้จะถูกเรียกจาก:
     * 1. selectedItem watcher เมื่อ uid เปลี่ยน
     * 2. resetTabStateCallback จาก MainController.openEditPopup()
     */
    resetTabLocalState() {
      if (!this.selectedItem) return;
      
      console.log('🔄 Resetting tab local state for selectedItem:', this.selectedItem.uid);
      
      // Helper function to safely get string value from potentially object values
      const getStringValue = (value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'object' && value !== null) {
          // If it's an object, try to extract meaningful value or return empty string
          console.warn('Found object value when expecting string:', value);
          return '';
        }
        return value || '';
      };
      
      // Reset padding values from selectedItem - ensure they are strings
      this.paddingValue = getStringValue(this.selectedItem.padding);
      this.marginValue = getStringValue(this.selectedItem.margin);
      this.paddingInnerValue = getStringValue(this.selectedItem.paddingInner);
      this.marginInnerValue = getStringValue(this.selectedItem.marginInner);
      
      // Reset "set all" checkboxes based on proper logic
      // Only set to true if there's a general padding/margin value AND no individual values are set
      this.setAllPadding = !!(
        this.selectedItem.padding && 
        this.selectedItem.padding !== '' && 
        this.selectedItem.padding !== '0' &&
        !this.selectedItem.paddingLeft && 
        !this.selectedItem.paddingRight && 
        !this.selectedItem.paddingTop && 
        !this.selectedItem.paddingBottom
      );
        
      this.setAllMargin = !!(
        this.selectedItem.margin && 
        this.selectedItem.margin !== '' && 
        this.selectedItem.margin !== '0' &&
        !this.selectedItem.marginLeft && 
        !this.selectedItem.marginRight && 
        !this.selectedItem.marginTop && 
        !this.selectedItem.marginBottom
      );
        
      this.setAllInnerPadding = !!(
        this.selectedItem.paddingInner && 
        this.selectedItem.paddingInner !== '' && 
        this.selectedItem.paddingInner !== '0' &&
        !this.selectedItem.paddingInnerLeft && 
        !this.selectedItem.paddingInnerRight && 
        !this.selectedItem.paddingInnerTop && 
        !this.selectedItem.paddingInnerBottom
      );
      
      // Additional logic: if individual values exist but no general value,
      // default to individual mode (setAll = false)
      const hasIndividualPadding = !!(
        this.selectedItem.paddingLeft || 
        this.selectedItem.paddingRight || 
        this.selectedItem.paddingTop || 
        this.selectedItem.paddingBottom
      );
      if (hasIndividualPadding && !this.selectedItem.padding) {
        this.setAllPadding = false;
      }
      
      const hasIndividualMargin = !!(
        this.selectedItem.marginLeft || 
        this.selectedItem.marginRight || 
        this.selectedItem.marginTop || 
        this.selectedItem.marginBottom
      );
      if (hasIndividualMargin && !this.selectedItem.margin) {
        this.setAllMargin = false;
      }
      
      const hasIndividualInnerPadding = !!(
        this.selectedItem.paddingInnerLeft || 
        this.selectedItem.paddingInnerRight || 
        this.selectedItem.paddingInnerTop || 
        this.selectedItem.paddingInnerBottom
      );
      if (hasIndividualInnerPadding && !this.selectedItem.paddingInner) {
        this.setAllInnerPadding = false;
      }
      
      // If no padding/margin values exist, make sure setAll is false and values are empty
      if (!this.selectedItem.padding && 
          !this.selectedItem.paddingLeft && 
          !this.selectedItem.paddingRight && 
          !this.selectedItem.paddingTop && 
          !this.selectedItem.paddingBottom) {
        this.setAllPadding = false;
        this.paddingValue = '';
      }
      
      if (!this.selectedItem.margin && 
          !this.selectedItem.marginLeft && 
          !this.selectedItem.marginRight && 
          !this.selectedItem.marginTop && 
          !this.selectedItem.marginBottom) {
        this.setAllMargin = false;
        this.marginValue = '';
      }
      
      if (!this.selectedItem.paddingInner && 
          !this.selectedItem.paddingInnerLeft && 
          !this.selectedItem.paddingInnerRight && 
          !this.selectedItem.paddingInnerTop && 
          !this.selectedItem.paddingInnerBottom) {
        this.setAllInnerPadding = false;
        this.paddingInnerValue = '';
      }
      
      // Reset color picker state
      this.showColorPickerField = null;
      
      // Reset flow tab if selectedItem is flow type
      if (this.selectedItem.type === 'flow') {
        this.activeFlowTab = "button";
        this.newStep = { type: "", options: {} };
        this.newMapping = { keyword: "", values: [] };
        this.selectedOption = "";
      }
      
      // Reset gateway form if selectedItem has gateways
      if (this.selectedItem.gateways) {
        this.newGateway = { name: "", description: "" };
      }
      
      // Reset other form state variables
      this.selectedOption = "";
      
      // Reset viewport if needed
      if (this.currentViewport !== 'desktop') {
        this.currentViewport = 'desktop';
      }
      
      // Log the reset values for debugging
      console.log('✅ Tab local state reset completed:', {
        uid: this.selectedItem.uid,
        paddingValue: this.paddingValue,
        marginValue: this.marginValue,
        paddingInnerValue: this.paddingInnerValue,
        marginInnerValue: this.marginInnerValue,
        setAllPadding: this.setAllPadding,
        setAllMargin: this.setAllMargin,
        setAllInnerPadding: this.setAllInnerPadding,
        selectedItem: {
          padding: this.selectedItem.padding,
          margin: this.selectedItem.margin,
          paddingLeft: this.selectedItem.paddingLeft,
          marginLeft: this.selectedItem.marginLeft
        }
      });
      
      // Force a re-render by updating a reactive property
      this.$nextTick(() => {
        console.log('✅ Tab local state reset completed for:', this.selectedItem.uid);
      });
    },
    
    /**
     * Auto-generate CSS สำหรับ custom ID หรือ custom class
     */
    autoGenerateCSS(property, value) {
      if (!value || !value.trim()) return;
      
      const trimmedValue = value.trim();
      let selector = '';
      let selectorType = '';
      
      // กำหนด selector ตามประเภท
      if (property === 'customId') {
        selector = `#${trimmedValue}`;
        selectorType = 'ID';
      } else if (property === 'customClass') {
        selector = `.${trimmedValue}`;
        selectorType = 'Class';
      }
      
      if (!selector) return;
      
      // ดึง CSS ปัจจุบัน
      const currentCSS = this.controller?.state?.getCssCode() || '';
      
      // ตรวจสอบว่ามี selector นี้อยู่ใน CSS แล้วหรือไม่
      const selectorExists = this.checkCSSSelector(currentCSS, selector);
      
      if (!selectorExists) {
        // สร้าง CSS template สำหรับ selector ใหม่
        const newCSSRule = this.generateCSSTemplate(selector, selectorType);
        
        // เพิ่ม CSS ใหม่เข้าไป
        const updatedCSS = this.addCSSRule(currentCSS, newCSSRule);
        
        // อัพเดต CSS ใน controller
        this.controller?.state?.setCssCode(updatedCSS);
        
        console.log(`✅ Auto-generated CSS for ${selectorType}: ${selector}`);
        
        // แสดงข้อความแจ้งเตือน (ถ้ามี toast)
        if (this.$toast) {
          this.$toast.success(`เพิ่ม CSS สำหรับ ${selectorType} "${trimmedValue}" แล้ว`);
        }
      } else {
        console.log(`ℹ️ CSS selector ${selector} already exists, skipping auto-generation`);
      }
    },
    
    /**
     * ตรวจสอบว่ามี CSS selector อยู่แล้วหรือไม่
     */
    checkCSSSelector(cssCode, selector) {
      if (!cssCode || !selector) return false;
      
      // สร้าง regex pattern สำหรับหา selector
      // ต้องระวัง special characters ใน CSS selector
      const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Pattern สำหรับหา selector ที่อาจมี whitespace หรือ comment รอบๆ
      const patterns = [
        new RegExp(`^\\s*${escapedSelector}\\s*\\{`, 'm'),           // Exact match at start of line
        new RegExp(`\\}\\s*${escapedSelector}\\s*\\{`, 'm'),        // After another rule
        new RegExp(`,\\s*${escapedSelector}\\s*\\{`, 'm'),          // In selector list
        new RegExp(`\\s${escapedSelector}\\s*\\{`, 'm'),            // With space before
        new RegExp(`^${escapedSelector}\\s*\\{`, 'm')               // At very start
      ];
      
      return patterns.some(pattern => pattern.test(cssCode));
    },
    
    /**
     * สร้าง CSS template สำหรับ selector ใหม่
     */
    generateCSSTemplate(selector, selectorType) {
      const timestamp = new Date().toISOString();
      
      let template = `\n/* Auto-generated ${selectorType} - ${timestamp} */\n`;
      template += `${selector} {\n`;
      
      // เพิ่ม CSS properties เริ่มต้นตามประเภท element
      if (this.selectedItem?.type) {
        template += this.getDefaultCSSProperties(this.selectedItem.type);
      } else {
        // สำหรับ element ที่ไม่มี type หรือไม่รู้จัก ให้เว้นว่างไว้
        template += `  \n`;
      }
      
      template += `}\n`;
      
      return template;
    },
    
    /**
     * ได้ CSS properties เริ่มต้นตามประเภท element
     */
    getDefaultCSSProperties(elementType) {
      const defaultStyles = {
        'text': ``,
        'heading': ``,
        'button': ``,
        'image': ``,
        'video': ``,
        'form': ``,
        'input': ``,
        'select': ``,
        'textarea': ``,
        'row': ``,
        'column': ``,
      };
      
      return defaultStyles[elementType] || `  \n`;
    },
    
    /**
     * เพิ่ม CSS rule เข้าไปใน CSS code
     */
    addCSSRule(currentCSS, newRule) {
      if (!currentCSS) {
        return newRule;
      }
      
      // ถ้ามี CSS อยู่แล้ว ให้เพิ่มท้าย
      let updatedCSS = currentCSS.trim();
      
      // เพิ่ม newline ถ้าไม่มี
      if (!updatedCSS.endsWith('\n')) {
        updatedCSS += '\n';
      }
      
      updatedCSS += newRule;
      
      return updatedCSS;
    },
    
    /**
     * ประมวลผล auto-generate CSS สำหรับ custom ID และ class
     */
    processCustomCSSGeneration() {
      if (!this.selectedItem) return;
      
      const { customId, customClass } = this.selectedItem;
      
      // Auto-generate CSS สำหรับ custom ID
      if (customId && this.isValidCSSIdentifier(customId)) {
        this.autoGenerateCSS('customId', customId);
      }
      
      // Auto-generate CSS สำหรับ custom class  
      if (customClass && this.isValidCSSIdentifier(customClass)) {
        this.autoGenerateCSS('customClass', customClass);
      }
    },
    
    /**
     * ตรวจสอบว่า identifier ถูกต้องและเหมาะสมสำหรับการสร้าง CSS
     */
    isValidCSSIdentifier(value) {
      if (!value || typeof value !== 'string') return false;
      
      const trimmed = value.trim();
      
      // ต้องมีอย่างน้อย 2 ตัวอักษร
      if (trimmed.length < 2) return false;
      
      // ต้องไม่เป็นแค่ตัวเลข
      if (/^\d+$/.test(trimmed)) return false;
      
      // ต้องเป็น valid CSS identifier (เริ่มด้วยตัวอักษรหรือ _ หรือ -)
      if (!/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(trimmed)) return false;
      
      // ไม่ควรเป็นคำศัพท์ CSS reserved
      const reservedWords = ['initial', 'inherit', 'unset', 'revert', 'auto', 'none'];
      if (reservedWords.includes(trimmed.toLowerCase())) return false;
      
      return true;
    },
    
    // ContentSelectorModal event handlers
    handleContentModalItemClick(payload) {
      this.handleItemClick(payload.item, payload.rowIndex, payload.columnIndex);
    },
    handleContentModalClose() {
      this.closeLightbox();
    },
    selectObject(rowIndex, columnIndex, itemIndex) {
      // กำหนด selectedItem เป็น object ที่เลือก
      const item = this.rows[rowIndex]?.columns?.[columnIndex]?.object?.[itemIndex];
      if (item) {
        this.controller?.state?.setSelectedItem(item); // ถ้าใช้ controller
        // Active row/column panel ให้ตรงกับ object ที่เลือก
        this.controller?.state?.setActiveRowPanel(rowIndex);
        this.controller?.state?.setActiveColumnPanel(rowIndex, columnIndex);
      }
    },
  },
  watch: {
    // WATCHER ใหม่สำหรับ builderData
    builderData: {
      async handler(newVal) { 
        console.log("INNER BUILDER WATCHER: builderData prop changed!");
        let loggableNewVal = newVal;
        try {
          loggableNewVal = JSON.parse(JSON.stringify(newVal));
        } catch (e) { /* ignore, use raw for logging if stringify fails */ }
        console.log("INNER BUILDER WATCHER: New builderData:", loggableNewVal);

        if (this.controller) {
          console.log("INNER BUILDER WATCHER: Re-initializing MainController with new builderData.");
          try {
            await this.controller.initialize(newVal); 
            console.log("INNER BUILDER WATCHER: MainController re-initialized successfully.");
            this.updateDataForParent(); 
          } catch (error) {
            console.error("INNER BUILDER WATCHER: Error during MainController re-initialization:", error);
          }
        } else {
          console.warn("INNER BUILDER WATCHER: Controller is not yet available. Re-initialization skipped.");
        }
      },
      deep: true, 
    },

    // WATCHER เดิมที่มีอยู่ (สำคัญ: ต้องคง watcher นี้ไว้ด้วย)
    'controller.state.state.editPopupOpen': function(newVal) {
      if (newVal) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
    },
    'selectedItem': {
      handler(newSelectedItem, oldSelectedItem) {
        // Reset local state when selectedItem changes (different uid or first time)
        if (newSelectedItem && oldSelectedItem && newSelectedItem.uid !== oldSelectedItem.uid) {
          this.resetTabLocalState();
        } else if (newSelectedItem && !oldSelectedItem) {
          // Reset when selectedItem is set for the first time
          this.resetTabLocalState();
        }
        
        // Load component based on selectedItem type
        if (!newSelectedItem || !this.controller || !newSelectedItem.type) {
          if (this.controller?.state?.getState) this.controller.state.getState().componentImport = null;
          return;
        }
        if (this.controller.state.getValidTypes().includes(newSelectedItem.type)) {
          this.controller.loadComponentWatch(newSelectedItem.type);
        } else {
          if (this.controller?.state?.getState) this.controller.state.getState().componentImport = null;
        }
      },
      deep: true, // เปลี่ยนกลับเป็น true เพื่อให้ watch การเปลี่ยนแปลงใน properties
      immediate: true // เปลี่ยนกลับเป็น true เพื่อให้ trigger ทันทีที่ component mount
    },
    'selectedItem.bgType': function (newBgType) {
      if(this.controller && this.selectedItem) this.updateBackgroundProperties(newBgType, "bg");
    },
    'selectedItem.bgInnerType': function (newBgType) {
      if(this.controller && this.selectedItem) this.updateBackgroundProperties(newBgType, "bgInner");
    },
    paddingValue(value) { 
        if(this.controller && this.selectedItem) this.updateAllSides(value, 'padding');
    },
    marginValue(value) { 
        if(this.controller && this.selectedItem) this.updateAllSides(value, 'margin');
    },
    paddingInnerValue(value) { 
        if(this.controller && this.selectedItem && this.selectedItem.type === 'row') this.updateAllSides(value, 'paddingInner');
    },
  },
};
</script>

<template>

  <!-- Professional Builder Toolbar -->
  <BuilderToolbar
    :class="[
      'transition-all duration-300 w-full',
      isToolbarSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : 'relative'
    ]"
    :is-sticky="isToolbarSticky"
    :show-grid-lines="showGridLines"
    :show-device-preview="showDevicePreview"
    :current-viewport="currentViewport"
    :back-url="backUrl"
    :can-undo="canUndo"
    :can-redo="canRedo"
    @add-row="addRow"
    @add-from-template="openBlockTemplateModal"
    @toggle-grid="toggleGridLines"
    @undo="undo"
    @redo="redo"
    @open-css-modal="openCssModal"
    @open-revision-history="openRevisionHistoryModal"
    @reload-data="handleReloadData"
    @zoom-in="() => {}"
    @zoom-out="() => {}"
    @fit-to-screen="fitToScreen"
    @toggle-device-preview="toggleDevicePreview"
    @set-viewport="setViewport"
    @save-data="handleSaveData"
    @export-json="exportData"
    @import-json="importDataFromToolbar"
  />

  <custom-confirmation
    v-if="showConfirmation"
    :message="confirmationMessage"
    :header="confirmationHeader"
    @confirm="handleConfirmation"
    @cancel="handleConfirmCancel"
  />

  <!-- CSS Editor Modal -->
  <CssEditorModal
    :visible="showCssModal"
    :initial-css-code="cssCode"
    @save="handleCssSave"
    @close="handleCssClose"
  />

  

  <FileBrowser
    class="z-[9999]"
    v-if="FileBrowserOpen"
    :isWindowsOpen="true"
    :callbackFunction="'cover'"
    :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
    @file-browser-trigger="changeFileTrigger"
    @file-browser-callback="selectFileTrigger"
  />

  <FileBrowser
    class="z-[9999]"
    v-if="FileImageBrowserOpen"
    :isWindowsOpen="true"
    :callbackFunction="'document'"
    :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
    @file-browser-trigger="changeFileImageTrigger"
    @file-browser-callback="selectFileImageTrigger"
  />

  <FileBrowser
    class="z-[9999]"
    v-if="FilePreviewBrowserOpen"
    :isWindowsOpen="true"
    :callbackFunction="'preview'"
    :allowFileType="['pdf']"
    @file-browser-trigger="changeFilePreviewTrigger"
    @file-browser-callback="selectFilePreviewTrigger"
  />

  <div 
    :class="[
      'flex-1 pb-8 bg-gray-100 pb-5 border-t builder-content',
      { 'pt-16': isToolbarSticky }
    ]"
  >
    <div class="">
      <!-- Preview Mode -->
      <div 
        v-if="previewVisible" 
        :class="[
          'relative mx-auto px-6 sm:px-6 lg:px-6',
          showGridLines ? 'grid-overlay' : ''
        ]"
      >
        <Preview
          :visible="true"
          :data-item="post._id"
          :viewport="currentViewport"
          @close="hidePreview"
        />
      </div>

      <!-- Builder Mode -->
      <div
        v-else
        :class="[
          'relative mx-auto px-6 sm:px-6 lg:px-6 builder-canvas',
          showGridLines ? 'grid-overlay' : '',
          activeBlock ? 'isblock' : 'isunblock'
        ]"
        :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'"
      >
        <div v-if="rows && rows.length > 0">
          <div
            class="relative bg-slate-50 mb-3 border border-slate-200 hover:shadow-md hover:border-slate-400 rounded-lg"
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :ref="(el) => setRowRef(el, rowIndex)"
            :class="[
              { 'border-slate-400 shadow-lg': isRowPanelActive(rowIndex), 'active-panel': isRowPanelActive(rowIndex) },
              `mt-${row.marginTop || '0'}`,
              `mr-${row.marginRight || '0'}`,
              `mb-${row.marginBottom || '0'}`,
              `ml-${row.marginLeft || '0'}`,
              { 'opacity-50': row.visible === false },
            ]"
          >
            <div
              class="z-10 bg-white rounded-lg absolute right-[0px] top-0 mt-[6px] mr-[6px] mb-[2px] flex p-[8px] shadow-lg border border-gray-200"
              v-if="isRowPanelActive(rowIndex)"
            >
              <div class="grid gap-2 grid-flow-col auto-cols-auto justify-end">
                <button
                  @click="moveRowUp(rowIndex)"
                  v-show="rowIndex > 0"
                  class="bg-gray-600 hover:bg-gray-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'เลื่อนแถวขึ้น'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'chevron-up']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="moveRowDown(rowIndex)"
                  v-show="rowIndex < rows.length - 1"
                  class="bg-gray-600 hover:bg-gray-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'เลื่อนแถวลง'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'chevron-down']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="addColumn(rowIndex)"
                  class="bg-emerald-600 hover:bg-emerald-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'เพิ่มคอลัมน์'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'plus']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="cloneRow(rowIndex)"
                  class="bg-blue-600 hover:bg-blue-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'ทำซ้ำแถว'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'clone']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="openSaveTemplateModal(rowIndex)"
                  class="bg-purple-600 hover:bg-purple-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'บันทึกแถวเป็นเทมเพลต'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'save']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="openEditPopup(rowIndex)"
                  class="bg-indigo-600 hover:bg-indigo-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'แก้ไขแถว'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'pencil']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="removeRow(rowIndex)"
                  class="bg-rose-600 hover:bg-rose-500 w-7 h-7 text-xs rounded-md transition-colors"
                  v-mytooltip="'ลบแถว'"
                >
                  <font-awesome-icon
                    :icon="['fas', 'times']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
              </div>
            </div>

            <div
              class="flex items-center justify-between mb-0 p-4 cursor-pointer border-b border-slate-200 bg-slate-50 rounded-t-lg"
              @click="toggleRowPanel(rowIndex)"
              :class="[
                isDragActive && draggedItemType === 'column' && isValidDropTarget('row', { rowIndex }) ? getDropZoneClass('row', { rowIndex }) : ''
              ]"
              @dragover="handleDragOver($event, 'row', { rowIndex })"
              @dragleave="handleDragLeave($event)"
              @drop="handleDrop($event, 'row', { rowIndex })"
            >
              <div class="text-left">
                <h1 class="text-sm text-gray-700 font-medium flex items-center">
                  <font-awesome-icon :icon="['fas', 'bars']" class="h-3 w-3 text-gray-500 mr-3" />
                  ROW
                  <span class="bg-gray-700 px-2 py-1 text-white mr-3 ml-3 rounded-md text-xs font-mono">{{
                    rowIndex
                  }}</span>
                  <span class="text-gray-500 text-xs font-normal">{{ row.text }}</span>
                </h1>
              </div>
            </div>

            <div
              class="flex-1 p-4"
              :class="[
                `pt-${row.paddingTop || '0'}`,
                `pr-${row.paddingRight || '0'}`,
                `pb-${row.paddingBottom || '0'}`,
                `pl-${row.paddingLeft || '0'}`,
              ]"
              :style="{
                backgroundColor: row.bgType === 'color' && row.bgColor ? row.bgColor : '',
                backgroundImage:
                  row.bgType === 'image' && row.bgImage
                    ? `url(${row.bgImage})`
                    : row.bgType === 'gradient' &&
                      row.bgGradientColor1 &&
                      row.bgGradientColor2
                    ? `linear-gradient(to bottom, ${row.bgGradientColor1}, ${row.bgGradientColor2})`
                    : '',
              }"
            >
              <div v-if="row.visible != false">
                <div
                  :class="[
                    'p-1',
                    'font-normal',
                    {
                      'mx-auto': row.width !== 'max-w-full',
                      [row.width]: row.width !== 'max-w-full',
                    },
                  ]"
                  :style="row.bgInnerColor ? { backgroundColor: row.bgInnerColor } : {}"
                >
                  <div :class="['grid', `grid-cols-${row.col}`, 'gap-1']">
                    <div
                      v-for="(column, columnIndex) in row.columns"
                      :key="columnIndex"
                      :ref="(el) => setColumnRef(el, rowIndex, columnIndex)"
                      :class="[
                        'sm:col-span-' + column.colspan,
                        getColumnDivClass(columnIndex, rowIndex),
                      ]"
                    >
                      <div
                        class="relative bg-white border border-gray-300 hover:shadow-md hover:border-gray-400 rounded-lg"
                        :class="[
                          `mt-${column.marginTop || '0'}`,
                          `mr-${column.marginRight || '0'}`,
                          `mb-${column.marginBottom || '0'}`,
                          `ml-${column.marginLeft || '0'}`,
                          isColumnPanelActive(rowIndex, columnIndex)
                            ? 'border-gray-400 shadow-md active-panel'
                            : 'border border-gray-300 hover:border-gray-400',
                        ]"
                      >
                        <div
                          class="z-10 bg-white rounded-lg absolute right-[0px] top-0 mt-[6px] mr-[6px] mb-[2px] flex p-[8px] shadow-lg border border-gray-200"
                          v-if="isColumnPanelActive(rowIndex, columnIndex)"
                        >
                          <div
                            class="grid gap-2 grid-flow-col auto-cols-auto justify-end"
                          >
                            <button
                              @click="cloneColumn(rowIndex, columnIndex)"
                              v-mytooltip="'ทำซ้ำคอลัมน์'"
                              class="bg-blue-600 hover:bg-blue-500 w-7 h-7 text-xs rounded-md transition-colors"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'clone']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="openAddContentAndLightbox(rowIndex, columnIndex)"
                              v-mytooltip="'เพิ่มเนื้อหา'"
                              class="bg-emerald-600 hover:bg-emerald-500 w-7 h-7 text-xs rounded-md transition-colors"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'plus']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="moveColumnLeft(rowIndex, columnIndex)"
                              v-show="columnIndex > 0"
                              v-mytooltip="'เลื่อนคอลัมน์ซ้าย'"
                              class="bg-gray-600 hover:bg-gray-500 w-7 h-7 text-xs rounded-md transition-colors"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'chevron-left']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="moveColumnRight(rowIndex, columnIndex)"
                              v-show="columnIndex < row.columns.length - 1"
                              v-mytooltip="'เลื่อนคอลัมน์ขวา'"
                              class="bg-gray-600 hover:bg-gray-500 w-7 h-7 text-xs rounded-md transition-colors"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'chevron-right']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>

                            <button
                              @click="openEditPopup(rowIndex, columnIndex)"
                              v-mytooltip="'แก้ไขคอลัมน์'"
                              class="bg-indigo-600 hover:bg-indigo-500 w-7 h-7 text-xs rounded-md transition-colors"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'pencil']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="removeColumn(rowIndex, columnIndex)"
                              v-mytooltip="'ลบคอลัมน์'"
                              class="bg-rose-600 hover:bg-rose-500 w-7 h-7 text-xs rounded-md transition-colors"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'times']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                          </div>
                        </div>

                        <div class="flex items-center justify-between mb-0 border-b border-gray-200 p-4 cursor-pointer bg-white rounded-t-lg"
                          @click="toggleColumnPanel(rowIndex, columnIndex)"
                          :draggable="true"
                          @dragstart="startDragColumn(rowIndex, columnIndex, $event)"
                          @dragend="handleDragEnd"
                          :class="[
                            isDragActive && isValidDropTarget('column', { rowIndex, columnIndex }) ? getDropZoneClass('column', { rowIndex, columnIndex }) : ''
                          ]"
                          @dragover="handleDragOver($event, 'column', { rowIndex, columnIndex })"
                          @dragleave="handleDragLeave($event)"
                          @drop="handleDrop($event, 'column', { rowIndex, columnIndex })"
                        >
                          <div class="text-left">
                            <h1 class="text-sm text-gray-700 font-medium flex items-center">
                              <font-awesome-icon :icon="['fas', 'bars']" class="h-3 w-3 text-gray-500 mr-3" />
                              COLUMN
                              <span class="bg-gray-700 px-2 py-1 text-white mr-3 ml-3 rounded-md text-xs font-mono">{{
                                columnIndex
                              }}</span>
                              <span class="text-gray-500 text-xs font-normal">{{ column.text }}</span>
                            </h1>
                          </div>
                        </div>

                        <div
                          class="px-2 border-l border-r border-gray-200 font-normal"
                          :class="[`${column.bg}`]"
                          v-html="column.content"
                        ></div>
                        <div
                          :class="[
                            `pt-${column.paddingTop || '0'}`,
                            `pr-${column.paddingRight || '0'}`,
                            `pb-${column.paddingBottom || '0'}`,
                            `pl-${column.paddingLeft || '0'}`,
                          ]"
                        >
                          <div
                            v-for="(item, itemIndex) in column.object"
                            :key="item.id"
                            class="content-item p-1"
                            :class="[
                              isDragActive && isValidDropTarget('object', { rowIndex, columnIndex, itemIndex }) ? getDropZoneClass('object', { rowIndex, columnIndex, itemIndex }) : ''
                            ]"
                            @click="selectObject(rowIndex, columnIndex, itemIndex)"
                            :draggable="true"
                            @dragstart="startDragObject(rowIndex, columnIndex, itemIndex, $event)"
                            @dragend="handleDragEnd"
                            @dragover="handleDragOver($event, 'object', { rowIndex, columnIndex, itemIndex })"
                            @dragleave="handleDragLeave($event)"
                            @drop="handleDrop($event, 'object', { rowIndex, columnIndex, itemIndex })"
                          >
                            <div
                              class="bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm"
                              :class="selectedItem && selectedItem.uid === item.uid ? 'active-object' : ''"
                            >
                              <div
                                class="flex items-center bg-gray-100 pl-3 pt-3 pr-3 pb-3 mb-3 rounded-lg border border-gray-200"
                              >
                                <div class="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center mr-3">
                                  <font-awesome-icon
                                    :icon="['fas', item.icon]"
                                    class="h-4 w-4 text-gray-600"
                                  />
                                </div>
                                <div class="text-gray-700 text-sm font-medium flex-1">
                                  <div class="flex items-center">
                                    <span class="bg-gray-700 px-2 py-1 text-white mr-3 rounded-md text-xs font-mono">{{
                                      itemIndex
                                    }}</span>
                                    <span class="uppercase text-gray-800 font-semibold text-xs tracking-wide">OBJECT</span>
                                    <span class="text-gray-500 text-xs ml-2">{{ item.type }}</span>
                                  </div>
                                  <span class="text-gray-500 text-xs font-mono mt-1 block">[{{ item.uid }}]</span>
                                </div>
                                <button
                                  @click="removeItem(rowIndex, columnIndex, itemIndex)"
                                  class="bg-rose-500 hover:bg-rose-600 w-8 h-8 text-xs rounded-lg ml-3 transition-colors"
                                  v-mytooltip="'ลบเนื้อหา'"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'times']"
                                    class="mx-auto h-3 w-3 text-white"
                                  />
                                </button>
                              </div>

                              <template v-if="isValidType(item.type)">
                                <component
                                  v-if="loadComponentLoop(item.type, index)"
                                  :is="componentsCache[item.type]"
                                  :item="item"
                                  mode="preview"
                                />
                                <div v-else>
                                  <p>Loading...</p>
                                </div>
                              </template>

                              <template v-if="item.type === 'slideshow'">
                                <vueper-slides
                                  autoplay
                                  :pauseOnHover="true"
                                  :duration="item.interval || 4000"
                                  :touchable="false"
                                >
                                  <vueper-slide
                                    v-for="(slide, i) in item.slides"
                                    :key="i"
                                    :image="slide.image"
                                  >
                                    <template #content>
                                      <div
                                        v-if="
                                          slide.content !== false &&
                                          typeof slide.content !== 'undefined'
                                        "
                                        class="vueperslide__content-wrapper"
                                      >
                                        <div
                                          class="vueperslide__title bg-black p-3 text-white text-[24px]"
                                        >
                                          {{ slide.title }}
                                        </div>
                                        <div
                                          class="vueperslide__content mt-3 text-[18px]"
                                        >
                                          {{ slide.subtitle }}
                                        </div>
                                        <button
                                          v-if="slide.button"
                                          @click="openNewWindow(slide.link)"
                                          class="bg-white hover:bg-gray-300 text-black text-lg font-normal py-2 px-4 rounded mt-4"
                                        >
                                          <font-awesome-icon
                                            :icon="['fas', 'eye']"
                                            class="w-3 h-3"
                                          />
                                          ดูรายละเอียด
                                        </button>
                                      </div>
                                    </template>
                                  </vueper-slide>
                                </vueper-slides>
                              </template>

                              <div class="pt-3 border-t border-gray-200">
                                <div class="flex items-center gap-2">
                                  <button
                                    v-if="item.type === 'form'"
                                    @click="
                                      openAddContentAndLightbox(rowIndex, columnIndex)
                                    "
                                    class="bg-emerald-600 hover:bg-emerald-500 w-7 h-7 text-xs rounded-md transition-colors"
                                    title="Add Content"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'plus']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>

                                  <button
                                    @click="cloneItem(rowIndex, columnIndex, itemIndex)"
                                    class="bg-blue-600 hover:bg-blue-500 w-7 h-7 text-xs rounded-md transition-colors"
                                    v-mytooltip="'ทำซ้ำเนื้อหา'"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'clone']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>

                                  <button
                                    @click="moveItemUp(rowIndex, columnIndex, itemIndex)"
                                    v-show="itemIndex > 0"
                                    class="bg-gray-600 hover:bg-gray-500 w-7 h-7 text-xs rounded-md transition-colors"
                                    v-mytooltip="'เลื่อนขึ้น'"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'chevron-up']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>

                                  <button
                                    @click="
                                      moveItemDown(rowIndex, columnIndex, itemIndex)
                                    "
                                    v-show="itemIndex < column.object.length - 1"
                                    class="bg-gray-600 hover:bg-gray-500 w-7 h-7 text-xs rounded-md transition-colors"
                                    v-mytooltip="'เลื่อนลง'"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'chevron-down']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>

                                  <button
                                    @click="
                                      openEditPopup(rowIndex, columnIndex, itemIndex)
                                    "
                                    class="bg-indigo-600 hover:bg-indigo-500 w-7 h-7 text-xs rounded-md transition-colors"
                                    v-mytooltip="'แก้ไขเนื้อหา'"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'pencil']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="bg-gray-50 border-t border-gray-200 px-4 py-2 rounded-b-lg">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                              <div
                                class="w-3 h-3 border border-gray-300 rounded-full"
                                :class="column.bg ? [column.bg] : ''"
                                :style="column.bgColor ? { backgroundColor: column.bgColor } : {}"
                              ></div>
                              <div class="flex items-center space-x-1">
                                <span class="device-icon">
                                  <i class="fas fa-mobile-alt text-xs" :class="[column.mobile ? 'text-slate-500' : 'text-gray-300']"></i>
                                </span>
                                <span class="device-icon">
                                  <i class="fas fa-tablet-alt text-xs" :class="[column.tablet ? 'text-slate-500' : 'text-gray-300']"></i>
                                </span>
                                <span class="device-icon">
                                  <i class="fas fa-laptop text-xs" :class="[column.laptop ? 'text-slate-500' : 'text-gray-300']"></i>
                                </span>
                                <span class="device-icon">
                                  <i class="fas fa-desktop text-xs" :class="[column.desktop ? 'text-slate-500' : 'text-gray-300']"></i>
                                </span>
                              </div>
                            </div>
                            <span class="text-xs text-gray-500 font-mono">{{ column.uid }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-200 px-4 py-3 rounded-b-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <div
                    class="w-5 h-5 border border-gray-300 rounded-full"
                    :class="row.bg ? [row.bg] : ''"
                    :style="row.bgColor ? { backgroundColor: row.bgColor } : {}"
                  ></div>

                  <!-- Inner Circle -->
                  <div
                    class="w-5 h-5 border border-gray-300 rounded-full"
                    :class="row.bgInnerColor ? [row.bgInnerColor] : ''"
                    :style="row.bgInnerColor ? { backgroundColor: row.bgInnerColor } : {}"
                  ></div>
                    <span class="text-xs text-slate-500">Backgrounds</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <i class="fas fa-mobile-alt text-xs" :class="[row.mobile ? 'text-slate-500' : 'text-slate-300']"></i>
                    <i class="fas fa-tablet-alt text-xs" :class="[row.tablet ? 'text-slate-500' : 'text-slate-300']"></i>
                    <i class="fas fa-laptop text-xs" :class="[row.laptop ? 'text-slate-500' : 'text-slate-300']"></i>
                    <i class="fas fa-desktop text-xs" :class="[row.desktop ? 'text-slate-500' : 'text-slate-300']"></i>
                  </div>
                </div>
                <span class="text-xs text-slate-400 font-mono">{{ row.uid }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-12 mx-auto text-center max-w-md">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <font-awesome-icon :icon="['fas', 'plus']" class="h-8 w-8 text-blue-600" />
            </div>
            <h1 class="text-xl font-semibold text-gray-900 mb-2">ยินดีต้อนรับสู่ระบบการจัดการเนื้อหา</h1>
            <p class="text-sm text-gray-600 mb-6">เริ่มต้นสร้างเนื้อหาของคุณหรือเลือกจากเทมเพลตที่มีอยู่</p>
            <div class="flex flex-col space-y-3">
              <button 
                @click="addRow" 
                class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4 mr-2" />
                เพิ่มเนื้อหาใหม่
              </button>
              <button
                @click="openTemplateModal"
                class="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <font-awesome-icon :icon="['fas', 'layer-group']" class="h-4 w-4 mr-2" />
                เลือกจาก Template
              </button>
            </div>
          </div>

          <!-- Template Modal -->
          <div
            v-if="isModalOpen"
            class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <div class="bg-white w-full max-w-2xl shadow-xl border border-gray-200 rounded-lg overflow-hidden">
              <!-- Modal Header -->
              <div class="bg-white border-b border-gray-200 px-4 py-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <div class="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
                      <font-awesome-icon :icon="['fas', 'layer-group']" class="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <h2 class="text-base font-semibold text-gray-900">เลือกจาก Template</h2>
                      <p class="text-xs text-gray-500">เลือกเทมเพลตที่ต้องการใช้เป็นพื้นฐาน</p>
                    </div>
                  </div>
                  <button
                    @click="closeModal"
                    class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <!-- Modal Content -->
              <div class="px-4 py-4 max-h-[60vh] overflow-y-auto">
                <div v-if="loading" class="flex items-center justify-center py-12">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="text-sm text-gray-500 mt-3">กำลังโหลด...</p>
                  </div>
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="(item, index) in template"
                    :key="index"
                    @click="selectTemplate(item)"
                    class="group flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                        <font-awesome-icon 
                          :icon="['fas', item.type === 'page' ? 'file-alt' : 'layer-group']" 
                          class="h-4 w-4 text-gray-500"
                        />
                      </div>
                      <div>
                        <h3 class="text-sm font-medium text-gray-900">{{ item.title }}</h3>
                        <div class="flex items-center space-x-2">
                          <span class="text-xs text-gray-500">{{ item.type }}</span>
                          <span v-if="item.display" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{{ item.display }}</span>
                        </div>
                      </div>
                    </div>
                    <font-awesome-icon 
                      :icon="['fas', 'chevron-right']" 
                      class="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end">
                <button
                  @click="closeModal"
                  class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <template v-if="editPopupOpen">
    <div
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div
        class="bg-white shadow-xl border border-gray-200 flex flex-col w-full max-w-3xl h-[85vh] relative rounded-lg overflow-hidden"
      >
        <!-- Compact Header -->
        <div class="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'edit']" class="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900">Content Editor</h2>
                <p class="text-xs text-gray-500">แก้ไขเนื้อหาและการตั้งค่า</p>
              </div>
            </div>
            <div class="flex items-center space-x-1">
              <button
                @click="cancelEditPopup"
                class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Close"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Compact Tab Navigation -->
        <div class="bg-gray-50 border-b border-gray-200 px-4 flex-shrink-0">
          <nav class="flex space-x-6" aria-label="Tabs">
            <button
              @click="controller.state.setActiveTab('content')"
              :class="[
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'file-alt']" class="h-3.5 w-3.5 mr-1.5" />
              Content
            </button>
            <button
              @click="controller.state.setActiveTab('style')"
              :class="[
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'style'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'palette']" class="h-3.5 w-3.5 mr-1.5" />
              Style
            </button>
            <button
              @click="controller.state.setActiveTab('options')"
              :class="[
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'options'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'cog']" class="h-3.5 w-3.5 mr-1.5" />
              Options
            </button>
            <button
              @click="controller.state.setActiveTab('responsive')"
              :class="[
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'responsive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'mobile-alt']" class="h-3.5 w-3.5 mr-1.5" />
              Responsive
            </button>
            <button
              @click="controller.state.setActiveTab('logic')"
              :class="[
                'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'logic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'code-branch']" class="h-3.5 w-3.5 mr-1.5" />
              Logic
            </button>
          </nav>
        </div>

        <!-- Content Area - Flex Grow to Fill Available Space -->
        <div class="flex-1 overflow-y-auto bg-white min-h-0">
          <div v-if="activeTab === 'content'" class="tab-content h-full">
            <template v-if="isValidType(selectedItem.type)">
              <component v-if="componentImport"
                :is="componentImport"
                :item="selectedItem"
                :parent-row="editingRow"
                :flattened-categories="flattenedCategories"
                :selected-item="selectedItem"
                :menu-items="menuData"
                @update-item="handleUpdateItem"
                mode="edit"
              />
              <div v-else class="flex items-center justify-center py-6">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p class="text-gray-500 text-sm mt-2">Loading...</p>
                </div>
              </div>
            </template>
          </div>

          <div v-else-if="activeTab === 'style'" class="tab-content h-full">
            <style-tab
              :selected-item="selectedItem"
              :show-color-picker-field="showColorPickerField"
              @show-color-picker="showColorPicker"
              @update-selected-item-property="handleUpdateSelectedItemProperty"
              @update-color-value="handleUpdateColorValue"
            />
          </div>

          <div v-else-if="activeTab === 'options'" class="tab-content h-full">
            <options-tab
              :selected-item="selectedItem"
              :padding-value="paddingValue"
              :margin-value="marginValue"
              :padding-inner-value="paddingInnerValue"
              :set-all-padding="setAllPadding"
              :set-all-margin="setAllMargin"
              :set-all-inner-padding="setAllInnerPadding"
              @update-selected-item-property="handleUpdateSelectedItemProperty"
              @update-local-data="handleUpdateLocalBuilderData"
              @update-set-all-value="handleSetAllValueUpdate"
            />
          </div>

          <div v-else-if="activeTab === 'logic'" class="tab-content h-full">
            <logic-tab
              :selected-item="selectedItem"
              :all-builder-options="computedAllBuilderOptions"
              :get-parent-logic-object-name-function="boundGetParentLogicObjectName"
              @delete-logic-item="handleDeleteLogicItem"
              @update-logic-item-property="handleUpdateLogicItemProperty"
              @set-logic-item-method="handleSetLogicItemMethod"
              @add-new-logic-rule="handleAddNewLogicRule"
            />
          </div>

          <div v-else-if="activeTab === 'responsive'" class="tab-content h-full">
            <responsive-tab
              :selected-item="selectedItem"
              @update-selected-item-property="handleUpdateSelectedItemProperty"
            />
          </div>
        </div>

        <!-- Fixed Footer at Bottom -->
        <div class="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
          <div class="flex items-center justify-between">
            <div class="text-xs text-gray-500">
              <span>{{ selectedItem.type || 'Unknown' }}</span>
              <span class="ml-3">{{ selectedItem.uid || 'N/A' }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="cancelEditPopup"
                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                @click.prevent="saveEditedItem"
                class="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'save']" class="h-3.5 w-3.5 mr-1.5" />
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- Revision History Modal -->
  <RevisionHistoryModal
    :visible="showRevisionHistoryModal"
    :revisions="revisionHistory"
    :loading="loadingRevisions"
    @close="closeRevisionHistoryModal"
    @refresh="refreshRevisionHistory"
    @rollback="handleRevisionRollback"
    @create-branch="handleRevisionBranch"
    @delete-revision="handleRevisionDelete"
  />

  <!-- Import Confirmation Modal -->
  <ImportModal
    :visible="showImportModal"
    :import-data="importData"
    :import-file-name="importFileName"
    :import-mode="importMode"
    :rows-count="rows.length"
    @confirm="confirmImport"
    @cancel="cancelImport"
    @update:importMode="importMode = $event"
  />

  <!-- Save Row as Template Modal -->
  <SaveTemplateModal
    :visible="showSaveTemplateModal"
    :saving-row-index="savingRowIndex"
    v-model:templateName="templateName"
    v-model:templateDescription="templateDescription"
    :saving-template="savingTemplate"
    :row-info="rows[savingRowIndex]"
    @save="saveRowAsTemplate"
    @cancel="closeSaveTemplateModal"
  />

  <!-- Block Template Selection Modal -->
  <BlockTemplateModal
    :visible="showBlockTemplateModal"
    :is-loading="isLoadingBlockTemplates"
    :templates="availableBlockTemplates"
    :selected-template="selectedTemplate"
    :show-template-preview="showTemplatePreview"
    @show-details="showTemplateDetails"
    @close="closeBlockTemplateModal"
    @close-preview="closeTemplatePreview"
    @use-template="useTemplate"
    @back-to-list="backToTemplateList"
  />

  <!-- Content Selector Modal -->
  <ContentSelectorModal
    :visible="lightboxOpen"
    :items="hierarchicalContentItems"
    :row-index="lightboxRowIndex"
    :column-index="lightboxColumnIndex"
    @item-click="handleContentModalItemClick"
    @close="handleContentModalClose"
  />

</template>

<style>


/* Builder Canvas - Base Styles (ไม่รวม grid) */
.builder-canvas {
  padding-top: 35px;
  background-color: #f8fafc;
  min-height: 100vh;
  position: relative;
  transition: all 0.3s ease-in-out;
}

/* Grid Overlay - เฉพาะ grid styles */
.grid-overlay {
  background-image: 
    linear-gradient(rgba(71, 85, 105, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(71, 85, 105, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 0 0, 0 0;
  background-attachment: local;
}

.grid-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(71, 85, 105, 0.03) 2px, transparent 2px),
    linear-gradient(90deg, rgba(71, 85, 105, 0.03) 2px, transparent 2px);
  background-size: 120px 120px;
  background-position: 0 0, 0 0;
  pointer-events: none;
  z-index: 0;
  transition: all 0.3s ease-in-out;
}

.grid-overlay > * {
  position: relative;
  z-index: 1;
}

/* Enhance grid visibility on hover */
.grid-overlay:hover {
  background-image: 
    linear-gradient(rgba(71, 85, 105, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(71, 85, 105, 0.12) 1px, transparent 1px);
}

.grid-overlay:hover::before {
  background-image: 
    linear-gradient(rgba(71, 85, 105, 0.05) 2px, transparent 2px),
    linear-gradient(90deg, rgba(71, 85, 105, 0.05) 2px, transparent 2px);
}

/* Professional dot grid overlay */
.grid-overlay::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 24px 24px, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 0 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.grid-overlay:hover::after {
  opacity: 0.3;
}

/* Drag and Drop Styles */
.drag-handle {
  cursor: grab;
  transition: all 0.2s ease;
}

.drag-handle:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.drag-handle:active {
  cursor: grabbing;
}

.drop-zone-available {
  background-color: rgba(59, 130, 246, 0.1) !important;
  border: 2px dashed rgba(59, 130, 246, 0.3) !important;
  transition: all 0.2s ease;
}

.drag-over-active {
  background-color: rgba(59, 130, 246, 0.2) !important;
  border: 2px solid rgba(59, 130, 246, 0.6) !important;
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.column-drop-zone {
  position: relative;
}

.column-drop-zone::before {
  content: '📋 Drop Column Here';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.column-drop-zone.drag-over-active::before {
  opacity: 1;
}

.object-drop-zone {
  position: relative;
}

.object-drop-zone::before {
  content: '🔗 Drop Object Here';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.object-drop-zone.drag-over-active::before {
  opacity: 1;
}

.dragging-item {
  opacity: 0.5;
  transform: rotate(2deg);
  transition: all 0.2s ease;
}

.row-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  background-color: #ccc;
  font-size: 16px;
}

.bg-1 {
  background-color: #ccc;
}

.bg-2 {
  background-color: #eee;
}

.bg-3 {
  background-color: #fff;
}

.grid-1 {
  width: calc(100% - 0px);
}

.grid-2 {
  width: calc(50% - 5px);
}

.row-padding {
  padding-top: 1px;
  padding-right: 1px;
  padding-bottom: 1px;
  padding-left: 1px;
}

.row-margin {
  margin-top: 1px;
  margin-right: 1px;
  margin-bottom: 1px;
  margin-left: 1px;
}

.body-scroll-lock {
  overflow: hidden;
}

.table-layout {
  display: flex;
}

.table-columns,
.table-rows {
  flex: 1;
  padding: 0 10px;
}

.table-column,
.table-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.content-item ul {
  list-style-type: disc; /* Default bullet points */
  padding-left: 1.5rem; /* Indentation */
  margin: 0 0 1rem 0;
}

.content-item ul li {
  margin-bottom: 0.5rem; /* Space between list items */
  font-size: 1rem; /* Default font size */
  line-height: 1.5;
  color: #333; /* Default text color */
}

.content-item ol {
  list-style-type: decimal; /* Default numbered list */
  padding-left: 1.5rem; /* Indentation */
  margin: 0 0 1rem 0;
}

.content-item ol li {
  margin-bottom: 0.5rem; /* Space between list items */
  font-size: 1rem; /* Default font size */
  line-height: 1.5;
  color: #333; /* Default text color */
}

.activePanel {
  border: 1px solid #ff0000;
}

.object-drop-zone.drag-over-active::before {
  opacity: 1;
}

.row-drop-zone {
  position: relative;
}

.row-drop-zone::before {
  content: '📋 Drop Column Here';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(168, 85, 247, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.row-drop-zone.drag-over-active::before {
  opacity: 1;
}

/* Sticky Toolbar Styles */
.sticky-toolbar {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

.sticky-toolbar.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Smooth entrance animation for sticky toolbar */
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toolbar-sticky-enter {
  animation: slideDown 0.3s ease-out;
}

/* Ensure toolbar content is above other content */
.sticky-toolbar {
  z-index: 50;
}

/* Sticky Toolbar Styles */
.builder-content {
  transition: padding-top 0.3s ease;
}

/* When toolbar is sticky, add padding to content */
.builder-content.pt-16 {
  padding-top: 4rem; /* 64px space for fixed toolbar */
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s ease;
}

/* Modal Tab Content Full Height */
.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-content > * {
  flex: 1;
  min-height: 0;
}

/* Content Editor Scrollbar Styling */
.content-editor {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.content-editor::-webkit-scrollbar {
  width: 6px;
}

.content-editor::-webkit-scrollbar-track {
  background: transparent;
}

.content-editor::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.content-editor::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.active-object {
  border: 2px solid #2563eb !important; /* ขอบน้ำเงิน */
  box-shadow: 0 0 0 2px #93c5fd;
  background: #f0f6ff;
}
</style>
