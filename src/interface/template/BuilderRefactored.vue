<script>
// Import Components ที่จำเป็น
import Subhead from "@/interface/template/outline/Subhead.vue";
import CustomConfirmation from "@/utils/Confirmation.vue";
import FileBrowser from "@/interface/modal/FileBrowser.vue";
import FloatingPanel from "@/interface/template/builder/plugin/FloatingPanel.vue";
import Preview from "@/interface/template/Preview.vue";

// Import MainController
import MainController from "./builder/plugin/MainController.js";
import debug from "@/plugins/Logger.js";

export default {
  emits: ["update-layout"],
  name: "BuilderRefactored", 
  components: {
    Subhead,
    CustomConfirmation,
    FileBrowser,
    FloatingPanel,
    Preview,
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
      // --- Data properties that were in original Builder.vue and might be needed by template or local logic ---
      // These should ideally be moved to controller state if they represent application state,
      // or kept here if they are purely for local component UI state not managed by the controller.
      paddingValue: "", // For global padding input, if still used
      marginValue: "",  // For global margin input, if still used
      paddingInnerValue: "", // For global inner padding input, if still used
      // selectedSlideIndex: undefined, // If VueperSlides is used directly in this template and not through controller
      // componentsCache: {}, // Managed by controller state
      // activeColumnIndex: null, // From controller state
      // visibleRowIndex: null, // Likely managed by controller or not used
    };
  },
  async mounted() {
    try {
      this.controller = await MainController.createInstance({
        builderData: this.builderData,
        getBuilder: this.getBuilder,
        backUrl: this.backUrl
      });
      await this.controller.initialize(this.builderData);
      // Copy CSS from builderData if present (original Builder.vue did this in mounted)
      if (this.builderData && this.builderData.css) {
        this.controller.state.setCssCode(this.builderData.css);
      }
      debug.log("BuilderRefactored.vue initialized with MainController");
    } catch (error) {
      debug.log("Error initializing BuilderRefactored.vue:", error);
    }
  },
  beforeUnmount() {
    if (this.controller) {
      this.controller.destroy();
    }
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
      // Prioritize controller state, fallback to initial prop data if controller not ready
      return this.controller?.state?.getState()?.rows || this.builderData?.builder || [];
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
    fullScreenMode() { return this.controller?.state?.getState()?.fullScreenMode || false; },
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
    filteredContentItems() {
      const allContentItems = this.contentItems; // Uses the computed contentItems
      if (this.builderData?.type === "form") {
        return allContentItems;
      } else {
        return allContentItems.filter((item) => item.type !== "form");
      }
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
    divStyles() { // Retained from original, ensure fullScreenMode is from controller state
      if (this.fullScreenMode) {
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
    selectedColumn() { 
        const state = this.controller?.state?.getState();
        if (!state || state.popupDataRow === undefined || state.popupDataColumn === undefined) return null;
        const currentRows = state.rows || [];
        return currentRows[state.popupDataRow]?.columns?.[state.popupDataColumn];
    },
  },
  methods: {
    // --- Methods Delegated to Controller ---
    addRow() { this.controller?.rowController?.addRow(); },
    addColumn(rowIndex) { this.controller?.columnController?.addColumn(rowIndex); },
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
    cloneRow(index) { this.controller?.rowController?.cloneRow(index); },
    cloneColumn(rowIndex, colIndex) { this.controller?.columnController?.cloneColumn(rowIndex, colIndex); },
    cloneItem(rowIndex, colIndex, itemIndex) { this.controller?.columnController?.cloneContentItem(rowIndex, colIndex, itemIndex); },
    moveRowUp(index) { this.controller?.rowController?.moveRowUp(index); },
    moveRowDown(index) { this.controller?.rowController?.moveRowDown(index); },
    moveColumnLeft(rowIndex, colIndex) { this.controller?.columnController?.moveColumnLeft(rowIndex, colIndex); },
    moveColumnRight(rowIndex, colIndex) { this.controller?.columnController?.moveColumnRight(rowIndex, colIndex); },
    moveItemUp(rowIndex, colIndex, itemIndex) { this.controller?.columnController?.moveContentItemUp(rowIndex, colIndex, itemIndex); },
    moveItemDown(rowIndex, colIndex, itemIndex) { this.controller?.columnController?.moveContentItemDown(rowIndex, colIndex, itemIndex); },
    toggleRowPanel(index) { this.controller?.rowController?.toggleRowPanel(index); },
    toggleColumnPanel(rowIndex, colIndex) { this.controller?.columnController?.toggleColumnPanel(rowIndex, colIndex); },
    previewLayout() { this.controller?.dataController?.previewLayout(); this.updateDataForParent(); }, // Added updateDataForParent
    getDataFromParent() { 
        this.controller?.dataController?.getDataFromParent(); 
        const data = this.getBuilder(); // Original Builder.vue behavior
        if (data && data.builder) this.controller.state.getState().rows = data.builder;
        if (data && data.css) this.controller.state.setCssCode(data.css);
    },
    saveCss() { this.controller?.dataController?.saveCss(); this.updateDataForParent(); }, // Added updateDataForParent
    openCssModal() { this.controller?.state?.openCssModal(); },
    closeCssModal() { this.controller?.state?.closeCssModal(); },
    openAddContentAndLightbox(rowIndex, columnIndex) { this.controller?.openContentLightbox(rowIndex, columnIndex); },
    closeLightbox() { this.controller?.state?.closeLightbox(); },
    openEditPopup(rowIndex, columnIndex, itemIndex) { this.controller?.openEditPopup(rowIndex, columnIndex, itemIndex); },
    saveEditedItem() { 
        this.controller?.dataController?.saveEditedItem(); 
        this.updateDataForParent(); // Added updateDataForParent
    },
    cancelEditPopup() { this.controller?.state?.closeEditPopup(); },
    handleItemClick(item, rowIndex, columnIndex) { this.controller?.handleItemClick(item, rowIndex, columnIndex); },
    toggleFullScreenMode() { this.controller?.state?.toggleFullScreenMode(); },
    handleUpdate(data) { this.controller?.handleUpdate(data); },
    handleUpdateItem(item) { this.controller?.handleUpdateItem(item); },
    updateAllSides(value, type) { this.controller?.updateAllSides(value, type); },
    updateBackgroundProperties(bgType, prefix) { this.controller?.updateBackgroundProperties(bgType, prefix); },
    openTemplateModal() { this.controller?.dataController?.openTemplateModal(); },
    closeModal() { this.controller?.dataController?.closeTemplateModal(); }, 
    selectTemplate(template) { this.controller?.dataController?.selectTemplate(template).then(() => this.updateDataForParent()); },
    
    // Method to inform parent about data changes (like original Builder.vue's previewLayout -> updateData)
    updateDataForParent(){
        if(this.controller) {
            const layoutData = {
                builder: this.controller.state.getState().rows,
                css: this.controller.state.getCssCode()
            };
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
        // If selectedSlideIndex is part of controller state, then call controller method
        // For now, assuming it might be local data `this.selectedSlideIndex` if VueperSlides is direct.
        // this.selectedSlideIndex = index; 
        // If selectedSlideIndex is from controller:
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
    // ... Table functions, Flow Step functions, Mapping functions etc. from original Builder.vue that modify selectedItem directly
    // They will work as `selectedItem` computed property points to controller's state object.
    // Make sure `newGateway`, `newStep`, `newMapping`, `selectedOption` (for flow/mapping) are local data if they are form inputs.
    // For simplicity, some are omitted but should be added if the template part for them is used.

    // Sub-menu closing methods
    closeFormSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showFormSubMenu = false; },
    closeLessonSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showLessonSubMenu = false; },
    closeNavSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showNavSubMenu = false; },
    closeDashboardSubMenu() { if (this.controller?.state?.getState) this.controller.state.getState().showDashboardSubMenu = false; },
  },
  watch: {
    'controller.state.state.editPopupOpen': function(newVal) {
      if (newVal) document.body.style.overflow = "hidden";
      else document.body.style.overflow = "";
    },
    'selectedItem': { // Watch the computed selectedItem which comes from controller
      immediate: true,
      deep: true, 
      handler(newVal) {
        if (!newVal || !this.controller || !newVal.type) {
          if (this.controller?.state?.getState) this.controller.state.getState().componentImport = null;
          return;
        }
        if (this.controller.state.getValidTypes().includes(newVal.type)) {
          this.controller.loadComponentWatch(newVal.type);
        } else {
          if (this.controller?.state?.getState) this.controller.state.getState().componentImport = null;
        }
      },
    },
    'selectedItem.bgType': function (newBgType) {
      if(this.controller && this.selectedItem) this.updateBackgroundProperties(newBgType, "bg");
    },
    'selectedItem.bgInnerType': function (newBgType) {
      if(this.controller && this.selectedItem) this.updateBackgroundProperties(newBgType, "bgInner");
    },
    paddingValue(value) { // Local data watcher
        if(this.controller && this.selectedItem) this.updateAllSides(value, 'padding');
    },
    marginValue(value) { // Local data watcher
        if(this.controller && this.selectedItem) this.updateAllSides(value, 'margin');
    },
    paddingInnerValue(value) { // Local data watcher
        if(this.controller && this.selectedItem && this.selectedItem.type === 'row') this.updateAllSides(value, 'paddingInner');
    },
  },
};
</script>

// NO COMMENTS OR OTHER TEXT HERE BEFORE <template>
// <template> and <style> will be added later by copying from original Builder.vue
</script> 