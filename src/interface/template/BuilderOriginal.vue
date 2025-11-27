<script>
import Subhead from "@/interface/template/outline/Subhead.vue";
import storageManager from "@/plugins/storage";
import CustomConfirmation from "@/utils/Confirmation.vue";
import FileBrowser from "@/interface/modal/FileBrowser.vue";

import FloatingPanel from "@/interface/template/builder/plugin/FloatingPanel.vue";

import Preview from "@/interface/template/Preview.vue";

import debug from "@/plugins/Logger.js";
import {
  contentItems,
  formItems,
  lessonItems,
  navItems,
  dashboardItems,
} from "./builder/builderItems.js";

import requestClient from "@/plugins/requestClient";
const Request = new requestClient(false);

import ColorPicker from "@/utils/Color.vue";

import { VueperSlides, VueperSlide } from "vueperslides";
import "vueperslides/dist/vueperslides.css";

function updateItemProperties(item, selectedItem, row, col, index) {
  console.log("row", row);
  console.log("col", col);
  console.log("index", index);

  // List of properties to map
  const properties = [
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "marginTop",
    "marginRight",
    "marginBottom",
    "marginLeft",
    "borderLeftWidth",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderColor",
    "borderStyle",
    "mobile",
    "tablet",
    "laptop",
    "desktop",
    "position",
    "bgType",
    "bgColor",
    "bgImage",
    "bgGradientColor1",
    "bgGradientColor2",
    "bgVideo",
    "gapSize",
    "bgInnerType",
    "bgInnerColor",
    "bgInnerImage",
    "bgInnerGradientColor1",
    "bgInnerGradientColor2",
    "bgInnerVideo",
    "borderRadiusTopLeft",
    "borderRadiusTopRight",
    "borderRadiusBottomRight",
    "borderRadiusBottomLeft",
    "logics",
    "flows",
    "mappings",
    "width",
    "dataMode",
    "dataSetName",
    "dataSetLimit",
    "colspan",
  ];

  // Dynamically assign properties
  properties.forEach((property) => {
    if (Object.prototype.hasOwnProperty.call(selectedItem, property)) {
      item[property] = selectedItem[property];
    }
  });
}

export default {
  emits: ["update-layout"],
  name: "MyRows",
  components: {
    Subhead,
    CustomConfirmation,
    FileBrowser,
    VueperSlides,
    VueperSlide,
    ColorPicker,
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
  computed: {
    isRowPanelActive() {
      return (rowIndex) => {
        const isActive = this.activeRowPanel === rowIndex;
        //this.toggleClass(this.rowRefs[rowIndex], 'activePanel', isActive);
        return isActive;
      };
    },
    isColumnPanelActive() {
      return (rowIndex, colIndex) => {
        const isActive =
          this.activeColumnPanel.row === rowIndex &&
          this.activeColumnPanel.col === colIndex;
        //this.toggleClass(this.columnRefs[rowIndex]?.[colIndex], 'activePanel', isActive);
        return isActive;
      };
    },
    flattenedCategories() {
      return this.flattenCategories(this.lesson_categories);
    },
    getMainCategories() {
      return this.lesson_categories.filter((category) => category.type === "main");
    },
    getColumnDivClass() {
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
    post() {
      return this.builderData;
    },
    rows() {
      return this.builderData.builder;
    },
    selectedColumn() {
      return this.rows[this.popupDataRow].columns[this.popupDataColumn];
    },
    filteredContentItems() {
      if (this.builderData.type === "form") {
        return this.contentItems;
      } else {
        return this.contentItems.filter((item) => item.type !== "form");
      }
    },
  },
  data() {
    return {
      rowRefs: {},
      columnRefs: {},
      componentImport: null,
      activeRowPanel: null,
      activeColumnPanel: { row: null, col: null },

      showCssModal: false,
      cssCode: "", // CSS code entered by the user
      flowOptions: [],
      showButtonPanel: false,
      activeColumnIndex: null,
      visibleRowIndex: null,
      columnPanels: [],
      rowPanels: [],
      configs: storageManager.get("configs"),
      session: storageManager.get("session"),
      dataItem: this.$route.params.slug,
      builder: "web",
      previewRows: [],
      previewHtml: "",
      showPopup: false,
      activeBlock: false,
      popupData: {},
      popupDataRow: "",
      popupDataColumn: "",
      selectedOption: "",
      popupStage: false,
      popupdata: [],
      paddingValue: "",
      marginValue: "",
      paddingInnerValue: "",
      marginInnerValue: "",
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
      lesson_categories: [],
      selectedCode: null,
      selectedItem: {
        bgType: "none",
        bgColor: "",
        bgImage: "",
        bgGradientColor1: "",
        bgGradientColor2: "",
        bgVideo: "",
      },
      newStep: {
        type: "", // Temporary storage for selected step type
        options: {}, // Options for the step
      },
      flow: [], // Array to store the steps in the flow
      activeFlowTab: "button",
      newMapping: { keyword: "", values: [] }, // New mapping input
      newGateway: {
        name: "",
        description: "",
      },

      template: [],
      isModalOpen: false,
      loading: false,

      contentItems: contentItems,
      formItems: formItems,
      lessonItems: lessonItems,
      navItems: navItems,
      dashboardItems: dashboardItems,
      confirmationMessage: "",
      confirmationHeader: "",
      showConfirmation: false,
      deletionData: null,
      showFormSubMenu: false,

      showLessonSubMenu: false,
      showNavSubMenu: false,
      showDashboardSubMenu: false,

      FileBrowserOpen: false,
      FileImageBrowserOpen: false,
      setAllMargin: false,
      setAllPadding: false,
      setAllInnerPadding: false,

      FilePreviewBrowserOpen: false,

      dataSourceType: "manual",
      apiEndpoint: "",
      selectedMethodType: "GET",
      apiResponseError: "",
      componentsCache: {},
      validTypes: [
        "news_ticker",
        "note",
        "order_counter",
        "enroll_counter",
        "html",
        "usernav",
        "authen",
        "lesson_categories",
        "paragraph",
        "popup",
        "header",
        "datetime",
        "user_profile",
        "user_nav",
        "upload",
      ],
      previewVisible: false,
    };
  },
  async mounted() {
    try {
      await this.getMenuData();
      await this.getContentData();
      await this.fetchFlowData();
      await this.getCategoryData();
      window.addEventListener("scroll", this.togglePanel);
    } catch (error) {
      debug.log(error);
    }
  },
  methods: {
    // Remove Function
    showPreview(id) {
      this.dataItem = id;
      this.previewVisible = true;
    },
    hidePreview() {
      this.previewVisible = false;
    },
    setRowRef(el, index) {
      if (el) {
        this.rowRefs[index] = el; // Direct assignment
      }
    },
    setColumnRef(el, rowIndex, columnIndex) {
      if (el) {
        if (!this.columnRefs[rowIndex]) {
          this.columnRefs[rowIndex] = {}; // Initialize row if not exists
        }
        this.columnRefs[rowIndex][columnIndex] = el; // Store reference
      }
    },
    toggleClass(element, className, condition) {
      if (element) {
        if (condition) {
          element.classList.add(className);
        } else {
          element.classList.remove(className);
        }
      }
    },
    handleUpdate({ field, value }) {
      // Directly update the selectedItem property
      this.selectedItem[field] = value;
    },
    extractYouTubeId(url) {
      if (!url || typeof url !== "string") {
        // Return an empty string or a default value if the URL is not defined or not a string
        return "";
      }

      const match = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      return match ? match[1] : "";
    },
    isValidType(type) {
      return this.validTypes.includes(type);
    },
    loadComponentWatch(componentName) {
      import(`./builder/element/${componentName}.vue`)
        .then((module) => {
          this.componentImport = module.default || module;
        })
        .catch((error) => {
          console.error(`Failed to load component: ${componentName}`, error);
          this.componentImport = null;
        });
    },
    loadComponentLoop(componentName) {
      if (!this.componentsCache) {
        this.componentsCache = {};
      }
      if (this.componentsCache[componentName]) {
        return true;
      }
      import(`./builder/element/${componentName}.vue`)
        .then((module) => {
          this.componentsCache[componentName] = module.default || module;
        })
        .catch((error) => {
          console.error(`Failed to load component: ${componentName}`, error);
        });
      return false;
    },
    handleUpdateItem(updatedItem) {
      //console.log("updatedItem",updatedItem);
      this.selectedItem = updatedItem;
      //this.getBuilder();
    },
    openCssModal() {
      this.showCssModal = true;
    },
    closeCssModal() {
      this.showCssModal = false;
    },
    saveCss() {
      // Handle saving CSS code, emit event, etc.
      this.closeCssModal();
    },
    toggleRowPanel(rowIndex) {
      if (this.activeRowPanel === rowIndex) {
        this.activeRowPanel = null;
        this.activeColumnPanel = { row: null, col: null };
      } else {
        this.activeRowPanel = rowIndex;
        this.activeColumnPanel = { row: null, col: null };
      }
    },
    toggleColumnPanel(rowIndex, colIndex) {
      if (
        this.activeColumnPanel.row === rowIndex &&
        this.activeColumnPanel.col === colIndex
      ) {
        this.activeColumnPanel = { row: null, col: null };
        this.activeRowPanel = null;
      } else {
        this.activeColumnPanel = { row: rowIndex, col: colIndex };
        this.activeRowPanel = null;
      }
    },
    async getCategoryData() {
      try {
        const requestData = {
          method: "find",
          args: [
            {
              $and: [{ unit: this.session.current._id }],
            },
          ],
          paging: { page: 1, limit: 200 },
        };

        const resAPI = await Request.POST(
          "category/query",
          requestData,
          this.configs.key
        );

        if (resAPI.status === 200) {
          const finalRes = resAPI.data;
          debug.log("finalRes", finalRes);
          this.lesson_categories = finalRes.data;
        } else {
          // Handle error condition
        }
      } catch (error) {
        console.error(error);
      }
    },
    getMainCategoryIndex(category) {
      const mainCategories = this.flattenedCategories.filter(
        (cat) => cat.type === "main"
      );
      return mainCategories.findIndex((cat) => cat._id === category._id) + 1;
    },
    flattenCategories(categories) {
      return categories.reduce((result, category) => {
        result.push(category);
        if (category.type === "main") {
          const subcategories = this.lesson_categories.filter(
            (subcategory) =>
              subcategory.type === "sub" && subcategory.parent === category._id
          );
          result.push(...subcategories);
        }
        return result;
      }, []);
    },
    getSubcategories(parentId) {
      return this.lesson_categories.filter(
        (category) => category.type === "sub" && category.parent === parentId
      );
    },
    toggleFullScreenMode() {
      this.fullScreenMode = !this.fullScreenMode;
    },
    async getMenuData() {
      if (storageManager.get("session", "login")) {
        try {
          const requestData = {
            method: "find",
            args: [
              {
                $and: [{ owner: this.session.current._id }, { type: { $in: ["menu"] } }],
              },
            ],
            paging: { page: this.currentPage, limit: this.limitItem },
          };

          const resAPI = await Request.POST("post/query", requestData, this.configs.key);

          const response = resAPI.data;
          if (resAPI.status === 200) {
            this.menuItems = response.data;
            console.log("Menu", this.menuItems);
          }
        } catch (error) {
          debug.log(error);
        }
      }
    },
    async getContentData() {
      if (storageManager.get("session", "login")) {
        try {
          const requestData = {
            method: "find",
            args: [
              {
                $and: [
                  { owner: this.session.current._id },
                  { type: { $in: ["page", "layout", "form"] } },
                ],
              },
            ],
            paging: { page: this.currentPage, limit: this.limitItem },
          };

          const resAPI = await Request.POST("post/query", requestData, this.configs.key);

          const response = resAPI.data;
          if (resAPI.status === 200) {
            this.postItems = response.data;
            console.log("Content", this.postItems);
          }
        } catch (error) {
          debug.log(error);
        }
      }
    },
    showColorPicker(field) {
      this.showColorPickerField = field;
    },
    updateColor(field) {
      this.selectedItem[field] = event.target.value;
    },
    handleItemClick(item, lightboxRowIndex, lightboxColumnIndex) {
      if (item.type === "form") {
        this.showFormSubMenu = true;
        // Perform additional actions for form type
        // ...
      } else if (item.type === "lesson") {
        this.showLessonSubMenu = true;
        // Perform additional actions for form type
        // ...
      } else if (item.type === "nav") {
        this.showNavSubMenu = true;
        // Perform additional actions for form type
        // ...
      } else if (item.type === "dashboard") {
        this.showDashboardSubMenu = true;
        // Perform additional actions for form type
        // ...
      } else {
        // Perform original function for other item types
        this.addContentItem(item, lightboxRowIndex, lightboxColumnIndex);
      }
    },
    getDataFromParent() {
      const data = this.getBuilder();
      debug.log(data); // Use the retrieved data as needed
    },
    getContentIcon(type) {
      const itemsMap = {
        form: this.formItems,
        lesson: this.lessonItems,
        nav: this.navItems,
        dashboard: this.dashboardItems,
        default: this.contentItems,
      };

      const items = itemsMap[this.builderData.type] || this.contentItems;
      const contentItem = items.find((item) => item.type === type);
      return contentItem ? contentItem.icon : "";
    },
    // File Preview Browser Function
    OpenFilePreviewBrowser() {
      this.FilePreviewBrowserOpen = true;
    },
    changeFilePreviewTrigger(payload) {
      this.FilePreviewBrowserOpen = payload;
    },
    selectFilePreviewTrigger(payload) {
      debug.log("selectFilePreviewTrigger");
      if (payload != undefined) {
        this.selectFilePreview = payload;
        debug.log("selectFilePreview", payload.file);
        this.selectedItem.fileurl = payload.file;
      }
    },
    // File Preview Browser Function

    OpenFileBrowser(index) {
      this.selectedSlideItemIndex = index;
      this.FileBrowserOpen = true;
    },
    changeFileTrigger(payload) {
      this.FileBrowserOpen = payload;
    },
    selectFileTrigger(payload) {
      debug.log("selectFileTrigger");
      if (payload != undefined) {
        this.selectCourseCover = payload;
        debug.log("selectFileReturnFunction", payload.file);
        this.selectedItem.slides[this.selectedSlideItemIndex].image = payload.file;
        this.selectedSlideItemIndex = undefined;
      }
    },
    OpenFileImageBrowser(index) {
      debug.log("SlideIndex", index);
      debug.log("lightboxRowIndex", this.lightboxRowIndex);
      debug.log("lightboxColumnIndex", this.lightboxColumnIndex);
      this.FileImageBrowserOpen = true;
    },
    changeFileImageTrigger(payload) {
      this.FileImageBrowserOpen = payload;
    },
    selectFileImageTrigger(payload) {
      debug.log("selectFileTrigger");
      if (payload != undefined) {
        this.selectCourseCover = payload;
        debug.log("selectFileReturnFunction", payload.file);
        this.selectedItem.url = payload.file;
      }
    },
    openPopup(rowIndex, columnIndex, Mode, Position, title) {
      this.popupPosition = Position;
      this.popupTitle = title;
      this.popupMode = Mode;
      this.popupData = {
        row: rowIndex,
        col: columnIndex,
        data: "Popup Data",
      };
      this.popupStage = true;
    },
    handleSave(data) {
      debug.log("Save data:", data);
      this.popupStage = false;
    },
    handleCancel() {
      debug.log("Popup cancelled");
      this.popupStage = false;
    },
    handleTrigger(data) {
      debug.log("Popup triggered:", data);
    },
    showPopupWithData(newData, row, column) {
      this.popupData = newData;
      this.popupDataRow = row;
      this.popupDataColumn = column;
      this.showPopup = true;
    },
    saveData(keyword, row, column) {
      debug.log(keyword, row, column);
      this.rows[row].columns[column].keywords = keyword;
    },
    closePopup() {
      this.popupVisible = false;
    },
    updateData(layout) {
      this.$emit("update-layout", layout);
    },
    generateUID(type) {
      return `${type}-uid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    addRow() {
      const newRow = this.createBaseRow();
      this.rows.push(newRow);
      this.previewLayout();
    },
    addColumn(rowIndex) {
      const newColumn = this.createBaseColumn();
      this.rows[rowIndex].columns.push(newColumn);
      this.previewLayout();
    },
    createBaseRow() {
      return {
        uid: this.generateUID("row"),
        text: "Row",
        col: "1",
        bgType: "none",
        padding: { l: 0, r: 0, b: 0, t: 0 },
        margin: { l: 0, r: 0, b: 0, t: 0 },

        paddingTop: "",
        paddingRight: "",
        paddingBottom: "",
        paddingLeft: "",

        marginTop: "",
        marginBottom: "",
        marginRight: "",
        marginLeft: "",

        paddingInnerTop: "",
        paddingInnerRight: "",
        paddingInnerBottom: "",
        paddingInnerLeft: "",

        mobile: true,
        tablet: true,
        laptop: true,
        desktop: true,

        visible: true,

        position: "relative",
        width: "max-w-full",
        sz: "w-full",
        bsz: "block",
        type: "row",
        alignment: "left",
        mode: "standard",
        customClass: "",
        gapSize: "0",
        customId: "",

        dataMode: "standalone",
        dataSetName: "",

        columns: [],
      };
    },
    createBaseColumn() {
      return {
        uid: this.generateUID("column"),
        text: "Column",
        content: "",
        padding: { l: 0, r: 0, b: 0, t: 0 },
        margin: { l: 0, r: 0, b: 0, t: 0 },

        paddingTop: "",
        paddingRight: "",
        paddingBottom: "",
        paddingLeft: "",

        marginTop: "",
        marginBottom: "",
        marginRight: "",
        marginLeft: "",

        mobile: true,
        tablet: true,
        laptop: true,
        desktop: true,

        visible: true,

        type: "column",
        sz: "block",
        bsz: "block",
        colspan: "1",
        position: "relative",
        alignment: "left",
        customClass: "",
        customId: "",
        object: [], // Initialize the object property as an empty array
      };
    },
    openConfig(index) {
      this.rows[index].configOpen = true;
    },
    closeConfig(index) {
      this.rows[index].configOpen = false;
    },
    updateRow(index, row) {
      const newRow = {
        ...row,
        padding: { ...row.padding },
        margin: { ...row.margin },
      };
      this.rows[index] = newRow;
      this.previewLayout();
    },
    removeRow(index) {
      this.confirmationMessage = "คุณต้องการลบแถวแนวนอน (Row) นี้ ?";
      this.confirmationHeader = "ยืนยันการทำรายการ";
      this.deletionData = {
        type: "row",
        rowIndex: index,
      };
      this.showConfirmation = true;
    },
    removeColumn(rowIndex, columnIndex) {
      this.confirmationMessage = "คุณต้องการลบแถวแนวตั้ง (Column) นี้ ?";
      this.confirmationHeader = "ยืนยันการทำรายการ";
      this.deletionData = {
        type: "column",
        rowIndex,
        columnIndex,
      };
      this.showConfirmation = true;
    },
    removeItem(rowIndex, columnIndex, itemIndex) {
      this.confirmationMessage = "คุณต้องการลบเนื้อหา (Content) นี้ ?";
      this.confirmationHeader = "ยืนยันการทำรายการ";
      this.deletionData = {
        type: "item",
        rowIndex,
        columnIndex,
        itemIndex,
      };
      this.showConfirmation = true;
    },
    confirmRemoveRow() {
      const { rowIndex } = this.deletionData;
      this.rows.splice(rowIndex, 1);
      this.handleConfirmCancel();
    },
    confirmRemoveColumn() {
      const { rowIndex, columnIndex } = this.deletionData;
      this.rows[rowIndex].columns.splice(columnIndex, 1);
      this.handleConfirmCancel();
    },
    confirmRemoveItem() {
      const { rowIndex, columnIndex, itemIndex } = this.deletionData;
      this.rows[rowIndex].columns[columnIndex].object.splice(itemIndex, 1);
      this.handleConfirmCancel();
    },
    handleConfirmation() {
      if (this.deletionData) {
        const { type } = this.deletionData;
        if (type === "item") {
          this.confirmRemoveItem();
        } else if (type === "row") {
          this.confirmRemoveRow();
        } else if (type === "column") {
          this.confirmRemoveColumn();
        }
      }
    },
    handleConfirmCancel() {
      this.deletionData = null;
      this.confirmationMessage = "";
      this.confirmationHeader = "";
      this.showConfirmation = false;
    },
    async previewLayout() {
      this.previewRows = this.rows;
      //debug.log('rows', this.rows);
      setConfigOpenToFalse(this.rows);
      this.updateData(this.rows);
    },
    cloneColumn(rowIndex, columnIndex) {
      const columnToClone = this.rows[rowIndex].columns[columnIndex];
      const clonedColumn = JSON.parse(JSON.stringify(columnToClone));

      // Assign new UID to the cloned column
      clonedColumn.uid = this.generateUID("column");

      // Assign new UID to each object inside the column
      if (clonedColumn.object && Array.isArray(clonedColumn.object)) {
        clonedColumn.object.forEach((item) => {
          item.uid = this.generateUID("object");
        });
      }

      this.rows[rowIndex].columns.splice(columnIndex + 1, 0, clonedColumn);
    },
    cloneRow(rowIndex) {
      const rowToClone = this.rows[rowIndex];
      const clonedRow = JSON.parse(JSON.stringify(rowToClone));

      // Assign new UID to the cloned row
      clonedRow.uid = this.generateUID("row");

      // Assign new UIDs to all columns and objects inside the row
      clonedRow.columns.forEach((column) => {
        column.uid = this.generateUID("column");
        if (column.object && Array.isArray(column.object)) {
          column.object.forEach((item) => {
            item.uid = this.generateUID("object");
          });
        }
      });

      this.rows.splice(rowIndex + 1, 0, clonedRow);
    },
    saveContent(rowIndex, columnIndex, contentData) {
      const oldKeywords = this.rows[rowIndex].columns[columnIndex].keywords;
      const newKeywords = contentData.keywords;
      debug.log(newKeywords);
      if (!oldKeywords) {
        this.rows[rowIndex].columns[columnIndex].content = contentData.content;
        this.rows[rowIndex].columns[columnIndex].keywords = newKeywords;
      } else {
        Object.keys(newKeywords).forEach((keyword) => {
          if (
            !(keyword in oldKeywords) &&
            Object.prototype.hasOwnProperty.call(newKeywords, keyword)
          ) {
            oldKeywords[keyword] = newKeywords[keyword];
          }
        });

        Object.keys(oldKeywords).forEach((keyword) => {
          if (
            !(keyword in newKeywords) &&
            Object.prototype.hasOwnProperty.call(oldKeywords, keyword)
          ) {
            delete oldKeywords[keyword];
          }
        });

        this.rows[rowIndex].columns[columnIndex].content = contentData.content;
      }
      this.closeAddContent(rowIndex, columnIndex);
      this.previewLayout();
    },
    openColumnConfig(rowIndex, columnIndex) {
      this.rows[rowIndex].columns[columnIndex].configOpen = true;
    },
    closeColumnConfig(rowIndex, columnIndex) {
      this.rows[rowIndex].columns[columnIndex].configOpen = false;
    },
    updateColumn(rowIndex, columnIndex, column) {
      const newColumn = {
        ...column,
        padding: { ...column.padding },
        margin: { ...column.margin },
      };
      this.rows[rowIndex].columns[columnIndex] = newColumn;
      this.previewLayout();
    },
    moveRowUp(index) {
      if (index > 0) {
        const tempRow = this.rows[index];
        this.rows.splice(index, 1);
        this.rows.splice(index - 1, 0, tempRow);
        this.previewLayout();
      }
    },
    moveRowDown(index) {
      if (index < this.rows.length - 1) {
        const tempRow = this.rows[index];
        this.rows.splice(index, 1);
        this.rows.splice(index + 1, 0, tempRow);
        this.previewLayout();
      }
    },
    moveColumnLeft(rowIndex, columnIndex) {
      if (columnIndex > 0) {
        const tempColumn = this.rows[rowIndex].columns[columnIndex];
        this.rows[rowIndex].columns.splice(columnIndex, 1);
        this.rows[rowIndex].columns.splice(columnIndex - 1, 0, tempColumn);
        this.previewLayout();
      }
    },
    moveColumnRight(rowIndex, columnIndex) {
      if (columnIndex < this.rows[rowIndex].columns.length - 1) {
        const tempColumn = this.rows[rowIndex].columns[columnIndex];
        this.rows[rowIndex].columns.splice(columnIndex, 1);
        this.rows[rowIndex].columns.splice(columnIndex + 1, 0, tempColumn);
        this.previewLayout();
      }
    },
    editColumnText(rowIndex, columnIndex) {
      const column = this.rows[rowIndex].columns[columnIndex];
      column.editing = true;
      this.$forceUpdate();
    },
    saveColumnText(rowIndex, columnIndex) {
      const column = this.rows[rowIndex].columns[columnIndex];
      column.editing = false;
      // Perform any necessary save logic here, such as making an API request
      debug.log("Saved column text:", column.text);
    },
    show() {
      // Example show function
      debug.log("Showing...");
    },
    openAddContent(rowIndex, columnIndex) {
      this.rows[rowIndex].columns[columnIndex].addContentOpen = true;
    },
    addContentItem(item, rowIndex, columnIndex) {
      debug.log("item", item);

      if (!this.rows[rowIndex].columns[columnIndex].object) {
        this.rows[rowIndex].columns[columnIndex].object = [];
      }

      // Generate a timestamp as a unique ID
      const uid = this.generateUID("obj");

      // Add the unique ID to the item
      item.uid = uid;

      this.rows[rowIndex].columns[columnIndex].object.push(item);
      this.lightboxOpen = false;
    },
    openAddContentAndLightbox(rowIndex, columnIndex) {
      this.lightboxRowIndex = rowIndex;
      this.lightboxColumnIndex = columnIndex;
      this.lightboxOpen = true;
    },
    closeLightbox() {
      this.lightboxRowIndex = undefined;
      this.lightboxColumnIndex = undefined;
      this.selectedItemIndex = undefined;
      this.lightboxOpen = false;
    },
    openEditPopup(rowIndex, columnIndex, itemIndex) {
      this.selectedItem = {};
      this.selectedItemIndex = undefined;
      this.lightboxRowIndex = undefined;
      this.lightboxColumnIndex = undefined;
      this.setAllPadding = false;

      console.log(
        "rowIndex",
        rowIndex,
        "columnIndex",
        columnIndex,
        "itemIndex",
        itemIndex
      );

      if (this.rows[rowIndex]) {
        this.lightboxRowIndex = rowIndex;

        if (this.rows[rowIndex].columns?.[columnIndex]) {
          this.lightboxColumnIndex = columnIndex;

          if (this.rows[rowIndex].columns[columnIndex].object?.[itemIndex]) {
            this.selectedItem = {
              ...this.rows[rowIndex].columns[columnIndex].object[itemIndex],
            };
            this.selectedItemIndex = itemIndex;
          } else {
            this.selectedItem = { ...this.rows[rowIndex].columns[columnIndex] };
          }
        } else {
          this.selectedItem = { ...this.rows[rowIndex] };
        }

        this.activeTab = "content";
        console.log("selectedItem", this.selectedItem);
        this.editPopupOpen = true;
        this.fullScreenMode = false;

        if (this.selectedItem?.tablet !== undefined) {
          debug.log(this.selectedItem.tablet);
        }
      } else {
        console.warn("Invalid row index:", rowIndex);
      }
    },
    updateMenuName(title) {
      this.selectedItem.menuName = title;
    },
    updatePageName(title) {
      this.selectedItem.pageName = title;
    },
    updateFlowName(title) {
      this.selectedItem.flowName = title;
    },
    saveEditedItem() {
      console.log("Saved:", this.selectedItem);

      const rowIdx = this.lightboxRowIndex;
      const colIdx = this.lightboxColumnIndex;
      const objectIdx = this.selectedItemIndex;

      if (rowIdx !== undefined) {
        const row = this.rows[rowIdx];

        if (colIdx !== undefined && objectIdx !== undefined) {
          const column = row.columns[colIdx];
          if (objectIdx >= 0 && objectIdx < column.object.length) {
            const selectedItem = this.selectedItem;
            const editedItem = column.object[objectIdx];

            this.updateSpecificProperties(editedItem, selectedItem);
            updateItemProperties(editedItem, selectedItem, rowIdx, colIdx, objectIdx);
          }
        } else if (colIdx !== undefined) {
          console.log("Edit Column");
          const selectedColumn = this.selectedItem;
          const editedColumn = row.columns[colIdx];

          Object.assign(editedColumn, {
            sz: selectedColumn.sz,
            bsz: selectedColumn.bsz,
          });

          updateItemProperties(editedColumn, selectedColumn, rowIdx, colIdx);
        } else {
          console.log("Edit Row");
          const selectedRow = this.selectedItem;
          const editedRow = this.rows[rowIdx];

          Object.assign(editedRow, {
            sz: selectedRow.sz,
            bsz: selectedRow.bsz,
            col: selectedRow.col,
            width: selectedRow.width,
          });

          updateItemProperties(editedRow, selectedRow, rowIdx);

          console.log("editedRow", editedRow);
        }

        this.cancelEditPopup();
      }
    },
    updateSpecificProperties(editedItem, selectedItem) {
      const propertyMapping = {
        paragraph: ["text", "displayType", "customId", "customClass"],
        header: [
          "text",
          "align",
          "fontSize",
          "fontWeight",
          "color",
          "heightOption",
          "height",
          "heightUnit",
          "alignH",
        ],
        image: [
          "url",
          "alt",
          "canLink",
          "link",
          "target",
          "showShadow",
          "showHome",
          "width",
          "alignment",
        ],
        preview: ["filename", "fileurl", "url", "canDownload", "display"],
        slideshow: ["slides", "interval", "autoplay"],
        video: ["url", "autoplay"],
        youtube: ["youtubeurl", "autoplay"],
        hidden: ["name", "value", "type"],
        news_ticker: ["text", "speed", "direction", "textColor"],
        html: ["content"],
        upload: [
          "name",
          "fileSizeLimit",
          "itemLimit",
          "fileTypeLimit",
          "required",
          "uploadFolder",
          "showPreview",
          "multipleFiles",
        ],
        usernav: ["showLogin", "logicUrl", "showRegister", "registerUrl"],
        navigation: ["menu", "alignment", "display", "fontSize", "fontColor", "hoverColor", "itemSpace"],
        iframe_internal: ["mode", "page", "pageName"],
        input: [
          "name",
          "inputType",
          "placeholder",
          "required",
          "pattern",
          "minLength",
          "maxLength",
          "remoteValid",
          "remoteValidCollection",
          "remoteValidKey",
          "SyncData",
          "SyncDataLocation",
          "SyncDataKey",
          "reqError",
        ],
        checkbox: ["name", "options", "required", "inline", "reqError"],
        address: ["name", "inputType", "required"],
        button: ["name", "label", "style", "textSize", "flows", "mappings"],
        select: [
          "name",
          "options",
          "required",
          "multiple",
          "disableFirstOption",
          "placeholder",
          "reqError",
        ],
        popup: [
          "title",
          "delay",
          "contentType",
          "imageUrl",
          "videoUrl",
          "textContent",
          "displayType",
          "autoclose",
          "autocloseDelay",
        ],
      };

      const itemType = editedItem.type;

      if (propertyMapping[itemType]) {
        propertyMapping[itemType].forEach((property) => {
          if (Object.prototype.hasOwnProperty.call(selectedItem, property)) {
            editedItem[property] = selectedItem[property];
          }
        });
      } else {
        console.warn("Unknown item type:", itemType);
      }
    },
    cloneItem(rowIndex, columnIndex, itemIndex) {
      const clonedItem = {
        ...this.rows[rowIndex].columns[columnIndex].object[itemIndex],
      };

      // Assign new UID to the cloned item
      clonedItem.uid = this.generateUID("object");

      this.rows[rowIndex].columns[columnIndex].object.splice(
        itemIndex + 1,
        0,
        clonedItem
      );
    },
    cancelEditPopup() {
      this.selectedItem = undefined;
      this.lightboxRowIndex = undefined;
      this.lightboxColumnIndex = undefined;
      this.selectedItemIndex = undefined;
      this.editPopupOpen = false;
      this.setAllPadding = false;
    },
    moveItemUp(rowIndex, columnIndex, itemIndex) {
      const column = this.rows[rowIndex].columns[columnIndex];
      const objectArray = column.object;

      if (itemIndex > 0) {
        const tempItem = objectArray[itemIndex];
        objectArray.splice(itemIndex, 1);
        objectArray.splice(itemIndex - 1, 0, tempItem);
        this.reIndexObjectArray(column);
      }
    },
    moveItemDown(rowIndex, columnIndex, itemIndex) {
      const column = this.rows[rowIndex].columns[columnIndex];
      const objectArray = column.object;

      if (itemIndex < objectArray.length - 1) {
        const tempItem = objectArray[itemIndex];
        objectArray.splice(itemIndex, 1);
        objectArray.splice(itemIndex + 1, 0, tempItem);
        this.reIndexObjectArray(column);
      }
    },
    addSlide(selectedItem) {
      debug.log("selectedItem", selectedItem);
      selectedItem.slides.push({
        title: "",
        subtitle: "",
        image: "",
        link: "",
      });
    },
    deleteSlide(index) {
      this.selectedItem.slides.splice(index, 1);
    },
    moveSlideUp(index) {
      if (index > 0) {
        const slide = this.selectedItem.slides.splice(index, 1)[0];
        this.selectedItem.slides.splice(index - 1, 0, slide);
      }
    },
    moveSlideDown(index) {
      if (index < this.selectedItem.slides.length - 1) {
        const slide = this.selectedItem.slides.splice(index, 1)[0];
        this.selectedItem.slides.splice(index + 1, 0, slide);
      }
    },
    cloneSlide(index) {
      const slide = this.selectedItem.slides[index];
      const clonedSlide = { ...slide }; // Shallow clone the slide object

      this.selectedItem.slides.splice(index + 1, 0, clonedSlide);
    },
    showSlideActionPanel(index) {
      this.selectedSlideIndex = index;
    },
    saveSlideChanges() {
      this.selectedSlideIndex = null;
    },
    cancelSlideEdit() {
      this.selectedSlideIndex = null;
    },
    reIndexObjectArray(column) {
      column.object.forEach((item, index) => {
        item.index = index + 1;
      });
    },
    closeAddContent(rowIndex, columnIndex) {
      this.rows[rowIndex].columns[columnIndex].addContentOpen = false;
    },
    cancelAddContent(rowIndex, columnIndex) {
      this.closeAddContent(rowIndex, columnIndex);
    },
    handleFunction1() {
      debug.log("Function 1");
    },
    handleFunction2() {
      debug.log("Function 2");
    },
    handleCallFunctions(functions) {
      functions.forEach((func) => {
        this[func]();
      });
    },

    addRadioOption(selectedItem) {
      selectedItem.options.push({
        label: "",
        value: "",
      });
    },
    deleteRadioOption(index) {
      this.selectedItem.options.splice(index, 1);
    },
    moveRadioOptionUp(index) {
      if (index > 0) {
        const option = this.selectedItem.options.splice(index, 1)[0];
        this.selectedItem.options.splice(index - 1, 0, option);
      }
    },
    moveRadioOptionDown(index) {
      if (index < this.selectedItem.options.length - 1) {
        const option = this.selectedItem.options.splice(index, 1)[0];
        this.selectedItem.options.splice(index + 1, 0, option);
      }
    },
    cloneRadioOption(index) {
      const option = this.selectedItem.options[index];
      const clonedOption = { ...option }; // Shallow clone the option object

      this.selectedItem.options.splice(index + 1, 0, clonedOption);
    },

    addCheckboxOption(selectedItem) {
      selectedItem.options.push({
        label: "",
        value: "",
      });
    },
    deleteCheckboxOption(index) {
      this.selectedItem.options.splice(index, 1);
    },
    moveCheckboxOptionUp(index) {
      if (index > 0) {
        const option = this.selectedItem.options.splice(index, 1)[0];
        this.selectedItem.options.splice(index - 1, 0, option);
      }
    },
    moveCheckboxOptionDown(index) {
      if (index < this.selectedItem.options.length - 1) {
        const option = this.selectedItem.options.splice(index, 1)[0];
        this.selectedItem.options.splice(index + 1, 0, option);
      }
    },
    cloneCheckboxOption(index) {
      const option = this.selectedItem.options[index];
      const clonedOption = { ...option }; // Shallow clone the option object

      this.selectedItem.options.splice(index + 1, 0, clonedOption);
    },

    // Add a new payment gateway to the list
    addPaymentGateway() {
      if (!this.newGateway.name || !this.newGateway.description) {
        alert("Please provide both the gateway name and description.");
        return;
      }
      if (!this.selectedItem.gateways) {
        this.selectedItem.gateways = []; // Initialize the gateways array if it doesn't exist
      }
      this.selectedItem.gateways.push({
        name: this.newGateway.name,
        description: this.newGateway.description,
      });
      // Clear the input fields after adding
      this.newGateway.name = "";
      this.newGateway.description = "";
    },
    // Delete a payment gateway from the list
    deletePaymentGateway(index) {
      this.selectedItem.gateways.splice(index, 1);
    },

    addSelectOption(selectedItem) {
      selectedItem.options.push({
        label: "",
        value: "",
      });
    },
    deleteSelectOption(index) {
      this.selectedItem.options.splice(index, 1);
    },
    moveSelectOptionUp(index) {
      if (index > 0) {
        const option = this.selectedItem.options.splice(index, 1)[0];
        this.selectedItem.options.splice(index - 1, 0, option);
      }
    },
    moveSelectOptionDown(index) {
      if (index < this.selectedItem.options.length - 1) {
        const option = this.selectedItem.options.splice(index, 1)[0];
        this.selectedItem.options.splice(index + 1, 0, option);
      }
    },
    cloneSelectOption(index) {
      const option = this.selectedItem.options[index];
      const clonedOption = { ...option };
      this.selectedItem.options.splice(index + 1, 0, clonedOption);
    },
    getAllBuilderOptions() {
      const options = [];
      const selectedItemName = this.selectedItem.name;
      for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
        const row = this.rows[rowIndex];
        for (let columnIndex = 0; columnIndex < row.columns.length; columnIndex++) {
          const column = row.columns[columnIndex];
          for (let objIndex = 0; objIndex < column.object.length; objIndex++) {
            const obj = column.object[objIndex];
            const option = {
              name: obj.name,
              rowIndex,
              columnIndex,
              obj: objIndex,
            };
            const isSelectedInLogics = this.selectedItem.logics.some(
              (logicItem) =>
                logicItem.destination &&
                logicItem.destination.name === option.name &&
                logicItem.destination.rowIndex === option.rowIndex &&
                logicItem.destination.columnIndex === option.columnIndex &&
                logicItem.destination.obj === option.obj
            );
            const isSameAsSelectedItem = option.name === selectedItemName;
            if (!isSelectedInLogics && !isSameAsSelectedItem) {
              options.push(option);
            }
          }
        }
      }
      return options;
    },
    getSelectedOptionLabel(value) {
      if (!this.selectedItem.options) {
        return "";
      }
      const selectedOption = this.selectedItem.options.find(
        (option) => option.value === value
      );
      return selectedOption ? selectedOption.label : "";
    },
    getParentLogicObjectName(logicItem) {
      const rowIndex = logicItem.rowIndex;
      const columnIndex = logicItem.columnIndex;
      const objectIndex = logicItem.objectIndex;
      const parentObject = this.rows[rowIndex].columns[columnIndex].object[objectIndex];
      return parentObject.name;
    },
    addLogicItem(logicItem, selectedItem) {
      if (logicItem.destination) {
        const column = this.rows[logicItem.destination.rowIndex].columns[
          logicItem.destination.columnIndex
        ];
        const objectArray = column.object;
        debug.log("objectArray", objectArray);
        if (objectArray) {
          const destinationObject = objectArray[logicItem.destination.obj];
          if (!destinationObject.logics) {
            destinationObject.logics = [];
          }
          let foundObject = null;
          let rowIndex = -1;
          let columnIndex = -1;
          let objectIndex = -1;
          for (let i = 0; i < this.rows.length; i++) {
            const row = this.rows[i];
            for (let j = 0; j < row.columns.length; j++) {
              const column = row.columns[j];
              const objIndex = column.object.findIndex(
                (obj) => obj.name === selectedItem.name
              );
              if (objIndex !== -1) {
                foundObject = column.object[objIndex];
                rowIndex = i;
                columnIndex = j;
                objectIndex = objIndex;
                break;
              }
            }
            if (foundObject) {
              break;
            }
          }
          if (foundObject) {
            const existingLogicIndex = destinationObject.logics.findIndex(
              (logic) => logic.request === true
            );
            if (existingLogicIndex !== -1) {
              destinationObject.logics.splice(existingLogicIndex, 1);
            }
            destinationObject.logics.push({
              request: true,
              default: logicItem.default,
              method: logicItem.method,
              rowIndex: rowIndex,
              columnIndex: columnIndex,
              objectIndex: objectIndex,
            });
          } else {
            debug.log("Object not found.");
          }
        }
      } else {
        if (!logicItem.logics) {
          logicItem.logics = [];
        }
        logicItem.logics.push({
          destination: "",
          default: "",
          method: "",
        });
      }
    },
    findDestinationObject(name, rowIndex, columnIndex) {
      if (
        this.rows.length > rowIndex &&
        this.rows[rowIndex].columns.length > columnIndex
      ) {
        const column = this.rows[rowIndex].columns[columnIndex];
        const objectArray = column.object;
        for (const obj of objectArray) {
          if (obj.name === name && obj.uid === `row_${rowIndex}_column_${columnIndex}`) {
            return obj;
          }
        }
      }
      return null;
    },
    deleteLogicItem(index, logicItem) {
      if (logicItem.destination) {
        const column = this.rows[logicItem.destination.rowIndex]?.columns[
          logicItem.destination.columnIndex
        ];
        if (column) {
          const objectArray = column.object[logicItem.destination.obj];
          if (objectArray) {
            objectArray.logics = [];
          }
        }
      }
      this.selectedItem.logics.splice(index, 1);
    },
    handlefontColorSelection(color) {
      this.selectedItem.fontColor = color;
    },
    handlehoverColorSelection(color) {
      this.selectedItem.hoverColor = color;
    },
    handletextColorSelection(color) {
      this.selectedItem.textColor = color;
    },
    // Table Function Code
    addRowItem() {
      const newRow = {
        id: Date.now().toString(),
        content: this.selectedItem.columns.map((column) => ({ [column.field]: "" })),
      };
      this.selectedItem.rows.push(newRow);
    },
    deleteRow(rowId) {
      const index = this.selectedItem.rows.findIndex((row) => row.id === rowId);
      if (index !== -1) {
        this.selectedItem.rows.splice(index, 1);
      }
    },
    addColumnItem(columnIndex) {
      const newColumn = {
        id: Date.now().toString(),
        label: "New Column",
        field: "newColumn",
      };
      this.selectedItem.columns.splice(columnIndex, 0, newColumn);
      this.selectedItem.rows.forEach((row) => {
        const newContent = {};
        this.selectedItem.columns.forEach((column, index) => {
          if (index === columnIndex) {
            newContent[column.field] = "";
          } else if (index < columnIndex) {
            newContent[column.field] = row.content[index][column.field];
          } else {
            newContent[column.field] = "";
          }
        });
        row.content.splice(columnIndex, 0, newContent);
      });
    },
    deleteColumn(columnId) {
      const columnIdx = this.selectedItem.columns.findIndex(
        (column) => column.id === columnId
      );
      if (columnIdx !== -1) {
        const field = this.selectedItem.columns[columnIdx].field;
        this.selectedItem.columns.splice(columnIdx, 1);
        this.selectedItem.rows.forEach((row) => {
          if (row.content[columnIdx]) {
            row.content.splice(columnIdx, 1);
          } else {
            delete row.content[columnIdx];
          }
          Object.values(row.content).forEach((cell) => {
            if (cell[columnId]) {
              delete cell[columnId][field];
            }
          });
        });
      }
    },
    toggleEditMode(columnId) {
      const column = this.selectedItem.columns.find((column) => column.id === columnId);
      if (column) {
        column.editMode = !column.editMode;
      }
    },
    editColumnName(columnId, newName) {
      const column = this.selectedItem.columns.find((column) => column.id === columnId);
      if (column) {
        column.label = newName;
      }
    },
    moveColumnItemLeft(columnId) {
      const index = this.selectedItem.columns.findIndex(
        (column) => column.id === columnId
      );
      if (index > 0) {
        const column = this.selectedItem.columns.splice(index, 1)[0];
        this.selectedItem.columns.splice(index - 1, 0, column);
        this.moveRowColumnDataLeft(index);
      }
    },
    moveColumnItemRight(columnId) {
      const index = this.selectedItem.columns.findIndex(
        (column) => column.id === columnId
      );
      if (index < this.selectedItem.columns.length - 1) {
        const column = this.selectedItem.columns.splice(index, 1)[0];
        this.selectedItem.columns.splice(index + 1, 0, column);
        this.moveRowColumnDataRight(index);
      }
    },
    moveRowColumnDataRight(columnIndex) {
      this.selectedItem.rows.forEach((row) => {
        const columnData = row.content.splice(columnIndex, 1)[0];
        row.content.splice(columnIndex + 1, 0, columnData);
      });
    },
    clearTableData() {
      this.selectedItem.columns = [];
      this.selectedItem.rows = [];
    },
    async fetchFlowData() {
      try {
        const response = await Request.POST(
          "flow/query",
          {
            method: "find",
            args: [{ unit: this.session.current._id || this.configs.siteID }],
          },
          this.configs.key
        );
        if (response.status === 200) {
          this.flowOptions = response.data;
        }
      } catch (error) {
        console.error("Error fetching flow data:", error);
      }
    },
    async getDataFromAPI() {
      try {
        const response = await fetch(this.selectedItem.apiEndpoint, {
          method: this.selectedItem.selectedMethodType,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const data = await response.json();
        this.selectedItem.columns = [];
        this.selectedItem.rows = [];
        const allKeys = data.reduce((keys, record) => {
          Object.keys(record).forEach((key) => {
            if (!keys.includes(key)) {
              keys.push(key);
            }
          });
          return keys;
        }, []);
        let Ccounter = 1;
        allKeys.forEach((key) => {
          let uniqueId = Date.now() + Ccounter;
          const newColumn = {
            id: uniqueId.toString(),
            label: key,
            field: key,
            editMode: false,
          };
          Ccounter++;
          this.selectedItem.columns.push(newColumn);
        });
        let Rcounter = 1;
        data.forEach((record) => {
          let uniqueId = Date.now() + Rcounter;
          const newRow = {
            id: uniqueId.toString(),
            content: this.selectedItem.columns.map((column) => ({
              [column.field]: record[column.field] || "",
            })),
          };
          Rcounter++;
          this.selectedItem.rows.push(newRow);
        });

        this.apiResponseError = "";
      } catch (error) {
        this.apiResponseError = "Error fetching data from API";
        console.error("Error fetching data from API:", error);
      }
    },

    // Flow Step Function
    //
    addStep() {
      if (!this.newStep.type) {
        alert("Please select a step to add.");
        return;
      }

      // Check and initialize selectedItem and flows if they are undefined
      if (!this.selectedItem) {
        this.selectedItem = {};
      }
      if (!this.selectedItem.flows) {
        this.selectedItem.flows = []; // Initialize flows as an empty array
      }

      // Define default options for each step type
      const stepOptions = {
        database: { collection: "" },
        alert: { text: "" },
        email: { subject: "", body: "" },
        redirect: { url: "" },
        modal: { title: "" },
        delay: { duration: "" },
        trigger: { element: "", cssClass: "" },
      };

      // Add new step with default options and isEditing state
      this.selectedItem.flows.push({
        type: this.newStep.type,
        options: stepOptions[this.newStep.type] || {},
        isEditing: false, // Default to not editing
      });

      // Reset the step selector
      this.newStep = { type: "", options: {} };
    },
    removeStep(index) {
      if (confirm("Are you sure you want to delete this step?")) {
        this.selectedItem.flows.splice(index, 1);
      }
    },
    duplicateStep(index) {
      const step = { ...this.selectedItem.flows[index], isEditing: false };
      this.selectedItem.flows.splice(index + 1, 0, step);
    },
    moveStep(index, direction) {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= this.selectedItem.flows.length) return; // Prevent out-of-bounds movement
      const [movedStep] = this.selectedItem.flows.splice(index, 1); // Remove the step
      this.selectedItem.flows.splice(newIndex, 0, movedStep); // Re-insert it at the new position
    },
    toggleEdit(index) {
      this.selectedItem.flows[index].isEditing = !this.selectedItem.flows[index]
        .isEditing;
    },
    getAllBuilderOptionsFlow() {
      const options = [];

      for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
        const row = this.rows[rowIndex];
        for (let columnIndex = 0; columnIndex < row.columns.length; columnIndex++) {
          const column = row.columns[columnIndex];
          for (let objIndex = 0; objIndex < column.object.length; objIndex++) {
            const obj = column.object[objIndex];
            const option = {
              name: obj.name,
              rowIndex,
              columnIndex,
              obj: objIndex,
            };
            options.push(option);
          }
        }
      }

      return options;
    },

    addKeyword(step) {
      if (!step || !step.options) {
        console.error("Step or step.options is undefined");
        return;
      }

      // Ensure step.options.keyword is initialized as an array
      if (!Array.isArray(step.options.keyword)) {
        step.options.keyword = [];
      }

      if (this.selectedOption) {
        // Avoid duplicate entries
        if (
          !step.options.keyword.some(
            (keyword) =>
              keyword.name === this.selectedOption.name &&
              keyword.rowIndex === this.selectedOption.rowIndex &&
              keyword.columnIndex === this.selectedOption.columnIndex &&
              keyword.obj === this.selectedOption.obj
          )
        ) {
          step.options.keyword.push({ ...this.selectedOption });
          this.selectedOption = null; // Reset the dropdown
        } else {
          alert("This keyword is already added.");
        }
      }
    },

    removeKeyword(step, idx) {
      if (!step || !step.options) {
        console.error("Step or step.options is undefined");
        return;
      }

      // Ensure step.options.keyword is an array
      if (Array.isArray(step.options.keyword)) {
        step.options.keyword.splice(idx, 1); // Remove the keyword at the specified index
      } else {
        console.warn("Keyword is not an array. Nothing to remove.");
      }
    },

    addMappingItem() {
      if (!this.newMapping.keyword || !this.selectedOption) {
        alert("Both keyword and value must be provided.");
        return;
      }

      // Ensure the mappings array is initialized
      if (!Array.isArray(this.selectedItem.mappings)) {
        this.selectedItem.mappings = [];
      }

      // Check if the keyword already exists in mappings
      const existingMapping = this.selectedItem.mappings.find(
        (mapping) => mapping.keyword === this.newMapping.keyword
      );

      if (existingMapping) {
        // Prevent duplicate items within the same mapping
        if (
          existingMapping.values.some(
            (item) =>
              item.name === this.selectedOption.name &&
              item.rowIndex === this.selectedOption.rowIndex &&
              item.columnIndex === this.selectedOption.columnIndex &&
              item.obj === this.selectedOption.obj
          )
        ) {
          alert("This item is already added to the keyword.");
          return;
        }

        // Add the new value to the existing mapping
        existingMapping.values.push({ ...this.selectedOption });
      } else {
        // Add a new mapping entry with the keyword and the first value
        this.selectedItem.mappings.push({
          keyword: this.newMapping.keyword,
          values: [{ ...this.selectedOption }],
        });
      }

      // Reset input fields
      this.newMapping.keyword = "";
      this.selectedOption = null;
    },

    removeMapping(index) {
      if (confirm("Are you sure you want to delete this keyword and all its values?")) {
        this.selectedItem.mappings.splice(index, 1);
      }
    },
    removeMappingItem(mappingIndex, itemIndex) {
      const mapping = this.selectedItem.mappings[mappingIndex];
      if (mapping) {
        mapping.values.splice(itemIndex, 1);
        if (mapping.values.length === 0) {
          // Remove the entire mapping if it has no more values
          this.selectedItem.mappings.splice(mappingIndex, 1);
        }
      }
    },
    updateBackgroundProperties(type, prefix) {
      const keys = {
        none: [
          `${prefix}Color`,
          `${prefix}Image`,
          `${prefix}GradientColor1`,
          `${prefix}GradientColor2`,
          `${prefix}Video`,
        ],
        color: [
          `${prefix}Image`,
          `${prefix}GradientColor1`,
          `${prefix}GradientColor2`,
          `${prefix}Video`,
        ],
        image: [
          `${prefix}Color`,
          `${prefix}GradientColor1`,
          `${prefix}GradientColor2`,
          `${prefix}Video`,
        ],
        gradient: [`${prefix}Color`, `${prefix}Image`, `${prefix}Video`],
        video: [
          `${prefix}Color`,
          `${prefix}Image`,
          `${prefix}GradientColor1`,
          `${prefix}GradientColor2`,
        ],
      };

      // Clear properties dynamically
      const clearKeys = keys[type] || [];
      clearKeys.forEach((key) => {
        this.selectedItem[key] = "";
      });
    },

    updateAllSides(value, property) {
      ["Left", "Top", "Right", "Bottom"].forEach((side) => {
        this.selectedItem[`${property}${side}`] = value;
      });
    },

    async openTemplateModal() {
      this.isModalOpen = true;
      this.loading = true;
      try {
        const response = await Request.POST(
          "post/query",
          {
            method: "find",
            args: [{ isTemplate: true }],
          },
          this.configs.key
        );
        if (response.status === 200) {
          this.template = response.data; // Assuming the API returns a list of templates
        }
      } catch (error) {
        console.error("Error fetching flow data:", error);
      } finally {
        this.loading = false;
      }
    },
    closeModal() {
      this.isModalOpen = false;
    },
    selectTemplate(item) {
      console.log("Selected template:", item);
      this.updateData(item.builder);
      this.getBuilder();
      // Handle the selected template logic here
      this.closeModal();
    },
    handlePanelAction(action) {
      if (action === "addRow") {
        this.addRow();
      } else if (action === "save") {
        this.previewLayout();
      } else if (action === "reload") {
        this.getDataFromParent();
      }
    },
  },
  watch: {
    editPopupOpen(newVal) {
      if (newVal) {
        document.body.style.overflow = "hidden"; // Disable scrolling
      } else {
        document.body.style.overflow = ""; // Restore scrolling
      }
    },
    selectedItem: {
      immediate: true,
      handler(newVal) {
        if (!newVal) {
          this.componentImport = null;
          return;
        }
        if (this.validTypes.includes(newVal.type)) {
          this.loadComponentWatch(newVal.type);
        } else {
          this.componentImport = null;
        }
      },
    },
    "selectedItem.bgType": function (newBgType) {
      this.updateBackgroundProperties(newBgType, "bg");
    },
    "selectedItem.bgInnerType": function (newBgType) {
      this.updateBackgroundProperties(newBgType, "bgInner");
    },
    paddingValue(value) {
      this.updateAllSides(value, "padding");
    },
    marginValue(value) {
      this.updateAllSides(value, "margin");
    },
    paddingInnerValue(value) {
      this.updateAllSides(value, "paddingInner");
    },
  },
};

function setConfigOpenToFalse(rows) {
  rows.forEach((row) => {
    row.configOpen = false;
    if (row.sub && row.sub.length > 0) {
      setConfigOpenToFalse(row.sub);
    }
  });
}
</script>

<template>
  <Preview
    :visible="this.previewVisible"
    :data-item="post._id"
    @close="hidePreview"
  ></Preview>

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

  <div v-if="showCssModal" class="fixed z-50 inset-0 overflow-y-auto">
    <div class="flex items-center justify-center w-full h-full">
      <div class="fixed inset-0 bg-black opacity-50"></div>
      <div class="z-10 modal w-full h-full flex flex-col items-center justify-center">
        <div
          class="bg-white rounded-lg overflow-hidden shadow-xl w-3/4 flex flex-col h-full"
        >
          <!-- Adjust width here -->
          <div class="p-4 flex-1">
            <textarea
              v-model="cssCode"
              class="w-full h-full px-3 py-2 placeholder-gray-400 text-gray-700 bg-white rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            ></textarea>
            <!-- Adjust height here -->
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

  <div
    v-if="lightboxOpen"
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white w-[600px] p-2 relative">
      <button
        v-if="
          !showFormSubMenu &&
          !showLessonSubMenu &&
          !showNavSubMenu &&
          !showDashboardSubMenu
        "
        @click="closeLightbox"
        class="absolute top-0 right-0 mt-2 mr-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
      </button>
      <h2
        v-if="
          !showFormSubMenu &&
          !showLessonSubMenu &&
          !showNavSubMenu &&
          !showDashboardSubMenu
        "
        class="text-lg font-semibold mt-3 mb-1"
      >
        เลือกประเภทเนื้อหาที่ต้องการเพิ่ม
      </h2>
      <h2 v-else class="text-lg font-semibold mt-3 mb-1">เลือกประเภทเนื้อหาในแบบฟอร์ม</h2>
      <p
        class="mb-4 text-gray-500"
        v-if="
          !showFormSubMenu &&
          !showLessonSubMenu &&
          !showNavSubMenu &&
          !showDashboardSubMenu
        "
      >
        เนื้อหาแต่ละประเภทจะมีการตั้งค่าที่แตกต่างกันตามประเภทของข้อมูลนั้นๆ
      </p>
      <ul
        class="grid grid-cols-4 gap-2"
        v-if="
          !showFormSubMenu &&
          !showLessonSubMenu &&
          !showNavSubMenu &&
          !showDashboardSubMenu
        "
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
        <button @click="showFormSubMenu = false" class="text-gray-500 mt-4 underline">
          Back to Main Menu
        </button>
      </div>

      <div v-if="showLessonSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="formItem in lessonItems"
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
        <button @click="showLessonSubMenu = false" class="text-gray-500 mt-4 underline">
          Back to Main Menu
        </button>
      </div>

      <div v-if="showNavSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="formItem in navItems"
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
        <button @click="showNavSubMenu = false" class="text-gray-500 mt-4 underline">
          Back to Main Menu
        </button>
      </div>

      <div v-if="showDashboardSubMenu">
        <ul class="grid grid-cols-4 gap-2">
          <li
            v-for="formItem in dashboardItems"
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
          @click="showDashboardSubMenu = false"
          class="text-gray-500 mt-4 underline"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  </div>

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

  <!-- <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
      <div class="mt-8">
        <div class="relative mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">

          <h1 class="text-2xl font-bold text-gray-900"> {{ post.title }}</h1>
          <h1 class="text-lg font-normal text-gray-500 mb-2"> {{ post.slug }}</h1>

        </div>
      </div>
    </div> -->
  <!-- {{activeRowPanel}} : {{activeColumnPanel}}  - {{rowRefs}} -->

  <div class="relative mx-auto bg-gray-50">
    <div class="mx-auto max-w-7xl px-7 py-2 flex justify-between items-center">
      <!-- Left Button -->
      <button
        @click="showPreview(post._id)"
        class="text-black hover:text-gray-600 text-md font-medium flex items-center"
      >
        <font-awesome-icon
          :icon="['fas', 'eye']"
          class="text-black mt-[3px] mr-2 text-md"
        />
        <span>ดูตัวอย่าง</span>
      </button>

      <!-- Right Button -->
      <button
        @click="showPreview(post._id)"
        class="text-black hover:text-gray-600 text-md font-medium flex items-center"
      >
        <font-awesome-icon
          :icon="['fas', 'globe']"
          class="text-black mt-[3px] mr-2 text-md"
        />
        <span>เปิดหน้านี้</span>
      </button>
    </div>
  </div>

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
    <div class="mt-8">
      <div
        class="relative mx-auto px-6 sm:px-6 lg:px-6"
        :data-content="'กำลังติดต่อฐานข้อมูล กรุณารอสักครู่.....'"
        :class="[activeBlock ? 'isblock' : 'isunblock']"
      >
        <div v-if="rows && rows.length > 0">
          <div
            class="relative bg-white mb-2 border border-gray-200 hover:shadow-lg hover:border-gray-400"
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :ref="(el) => setRowRef(el, rowIndex)"
            :class="[
              { 'border-gray-500 border-2': isRowPanelActive(rowIndex) },
              { 'shadow-lg': isRowPanelActive(rowIndex) },
              `mt-${row.marginTop || '0'}`,
              `mr-${row.marginRight || '0'}`,
              `mb-${row.marginBottom || '0'}`,
              `ml-${row.marginLeft || '0'}`,
              { 'opacity-50': row.visible === false },
            ]"
          >
            <div
              class="z-10 bg-gray-300 rounded-sm absolute right-[0px] top-0 mt-[4px] mr-[4px] mb-[2px] flex p-[6px]"
              v-if="isRowPanelActive(rowIndex)"
            >
              <div class="grid gap-1 grid-flow-col auto-cols-auto justify-end">
                <button
                  @click="moveRowUp(rowIndex)"
                  v-show="rowIndex > 0"
                  class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                >
                  <font-awesome-icon
                    :icon="['fas', 'chevron-up']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="moveRowDown(rowIndex)"
                  v-show="rowIndex < rows.length - 1"
                  class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                >
                  <font-awesome-icon
                    :icon="['fas', 'chevron-down']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="addColumn(rowIndex)"
                  class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                >
                  <font-awesome-icon
                    :icon="['fas', 'plus']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="cloneRow(rowIndex)"
                  class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                >
                  <font-awesome-icon
                    :icon="['fas', 'clone']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="openEditPopup(rowIndex)"
                  class="bg-gray-400 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                >
                  <font-awesome-icon
                    :icon="['fas', 'pencil']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
                <button
                  @click="removeRow(rowIndex)"
                  class="bg-red-500 hover:bg-red-700 w-5 h-5 text-xs rounded"
                >
                  <font-awesome-icon
                    :icon="['fas', 'times']"
                    class="mx-auto h-3 w-3 text-white"
                  />
                </button>
              </div>
            </div>

            <div
              class="flex items-center justify-between mb-0 p-3 cursor-pointer border-b border-gray-200 bg-white"
              @click="toggleRowPanel(rowIndex)"
            >
              <div class="text-left">
                <h1 class="text-xs text-gray-500 font-normal">
                  {{ row.text }}
                  <span class="bg-gray-400 px-1 text-white mr-1">{{ rowIndex }}</span>
                </h1>
              </div>
            </div>

            <div
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
                        class="relative bg-gray-100 border border-gray-200 hover:shadow-lg hover:border-gray-400"
                        :class="[
                          `mt-${column.marginTop || '0'}`,
                          `mr-${column.marginRight || '0'}`,
                          `mb-${column.marginBottom || '0'}`,
                          `ml-${column.marginLeft || '0'}`,
                          isColumnPanelActive(rowIndex, columnIndex)
                            ? 'border-gray-500 border-2'
                            : 'border border-gray-200 hover:border-gray-400',
                        ]"
                      >
                        <div
                          class="z-10 bg-gray-300 rounded-sm absolute right-[0px] top-0 mt-[4px] mr-[4px] mb-[2px] flex p-[6px]"
                          v-if="isColumnPanelActive(rowIndex, columnIndex)"
                        >
                          <div
                            class="grid gap-1 grid-flow-col auto-cols-auto justify-end"
                          >
                            <button
                              @click="cloneColumn(rowIndex, columnIndex)"
                              v-custom-tooltip="{ text: 'ทำซ้ำ', position: 'right' }"
                              class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'clone']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="openAddContentAndLightbox(rowIndex, columnIndex)"
                              v-custom-tooltip="{
                                text: 'เพิ่มคอลั่ม',
                                position: 'right',
                              }"
                              class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'plus']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="moveColumnLeft(rowIndex, columnIndex)"
                              v-show="columnIndex > 0"
                              v-custom-tooltip="{ text: 'เลื่อนซ้าย', position: 'right' }"
                              class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'chevron-up']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="moveColumnRight(rowIndex, columnIndex)"
                              v-show="columnIndex < row.columns.length - 1"
                              v-custom-tooltip="{ text: 'เลื่อนขวา', position: 'right' }"
                              class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'chevron-down']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>

                            <button
                              @click="openEditPopup(rowIndex, columnIndex)"
                              v-custom-tooltip="{ text: 'แก้ไข', position: 'right' }"
                              class="bg-gray-400 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'pencil']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                            <button
                              @click="removeColumn(rowIndex, columnIndex)"
                              v-custom-tooltip="{ text: 'ลบ', position: 'right' }"
                              class="bg-red-500 hover:bg-red-700 w-5 h-5 text-xs rounded"
                            >
                              <font-awesome-icon
                                :icon="['fas', 'times']"
                                class="mx-auto h-3 w-3 text-white"
                              />
                            </button>
                          </div>
                        </div>

                        <!-- <div class="bg-black bg-opacity-0 fixed w-full h-full z-10 top-0 left-0"  v-if="activeColumnIndex === columnIndex && activeRowIndex === rowIndex"></div> -->

                        <div
                          class="flex items-center justify-between mb-0 border-b border-gray-200 p-3 cursor-pointer"
                          @click="toggleColumnPanel(rowIndex, columnIndex)"
                        >
                          <div class="text-left">
                            <h1 class="text-xs text-gray-500 font-normal">
                              {{ column.text }}
                              <span class="bg-gray-400 px-1 text-white mr-1">{{
                                columnIndex
                              }}</span>
                            </h1>
                          </div>
                          <!-- <div class="w-1/6">
                            </div>
                            <div class="w-4/6 text-center">
                              
                              <h1 class="text-sm font-semibold text-gray-600">
                                <template v-if="!column.editing">
                                  {{ column.text }} ({{ columnIndex }})
                                  <button @click="editColumnText(rowIndex, columnIndex)" class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded ml-1">
                                    <font-awesome-icon :icon="['fas','pencil']" class="mx-auto h-3 w-3 text-white"/>
                                  </button>
                                </template>
                                <template v-else>
                                  <input type="text" v-model="column.text" class="text-sm font-semibold text-gray-600 rounded-sm border border-gray-200" @keyup.enter="saveColumnText(rowIndex, columnIndex)">
                                  <button @click="saveColumnText(rowIndex, columnIndex)" class="bg-green-500 hover:bg-green-700 w-5 h-5 text-xs rounded ml-1">
                                    <font-awesome-icon :icon="['fas','check']" class="mx-auto h-3 w-3 text-white"/>
                                  </button>
                                </template>
                              </h1>                              

                            </div>
                            <div class="w-1/6 flex justify-end">
                            </div> -->
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
                          >
                            <div class="bg-white border border-gray-200 p-1">
                              <div
                                class="flex items-center bg-indigo-50 pl-1 pt-2 pr-1 pb-1 mb-2"
                              >
                                <font-awesome-icon
                                  :icon="['fas', item.icon]"
                                  class="h-4 w-4 text-gray-400 border-r border-gray-300 pr-1 mb-2 mt-1"
                                />
                                <p class="ml-1 -mt-1 text-gray-400 text-xs">
                                  <span class="bg-gray-400 px-1 text-white mr-1">{{
                                    itemIndex
                                  }}</span>
                                  <span class="uppercase text-gray-600">{{
                                    item.type
                                  }}</span>
                                  : [{{ item.uid }}]
                                </p>
                                <button
                                  @click="removeItem(rowIndex, columnIndex, itemIndex)"
                                  class="bg-red-400 hover:bg-red-700 w-5 h-5 text-xs rounded ml-auto -mt-2"
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


                              <template v-if="item.type === 'navigation'">
                                <div class="p-2">
                                  <h1>{{ item.menuName || "ยังไม่ได้เลือกเมนู" }}</h1>
                                </div>
                              </template>

                              <template v-if="item.type === 'iframe_internal'">
                                <div class="p-2">
                                  <h1>{{ item.pageName || "ยังไม่ได้เลือกเมนู" }}</h1>
                                </div>
                              </template>

                              <template v-if="item.type === 'image'">
                                <div class="p-2">
                                  <img
                                    :src="item.url"
                                    :alt="item.alt"
                                    :style="{ width: item.width + 'px' }"
                                    v-if="item.url"
                                  />
                                  <div class="no-content" v-else>No Image</div>
                                </div>
                              </template>

                              <template v-if="item.type === 'preview'">
                                <div class="p-2">
                                  <img
                                    :src="item.url"
                                    :alt="item.alt"
                                    :style="{ width: item.width + 'px' }"
                                    v-if="item.url"
                                  />
                                  <div class="no-content" v-else>No Image</div>
                                </div>
                              </template>

                              <template v-if="item.type === 'address'">
                                <div class="p-2">
                                  <div v-html="item.name || 'None'"></div>
                                  <div v-html="item.inputType || 'None'"></div>
                                </div>
                              </template>

                              <template v-if="item.type === 'input'">
                                <div class="p-2">
                                  <!-- {{ item.logics }} -->
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium"
                                    >{{ item.name }}</label
                                  >
                                  <input
                                    :type="item.inputType"
                                    :name="item.name"
                                    :placeholder="item.placeholder"
                                    :required="item.required"
                                    :maxlength="item.maxLength"
                                    :pattern="item.pattern"
                                    class="block w-full px-4 py-2 mt-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                              </template>

                              <template v-if="item.type === 'hidden'">
                                <div class="p-2">
                                  <!-- {{ item.logics }} -->
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium"
                                    >{{ item.name }}</label
                                  >
                                  <input
                                    :type="item.inputType"
                                    :name="item.name"
                                    :value="item.value"
                                    class="block w-full px-4 py-2 mt-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    readonly
                                  />
                                </div>
                              </template>

                              <template v-if="item.type === 'button'">
                                <div class="p-2 flex justify-between items-center">
                                  <!-- Flow Label -->
                                  <div>
                                    <div class="text-sm text-gray-500">
                                      <i class="fas fa-code-fork text-md mr-2"></i>
                                      <!-- Conditionally Render Button Text -->
                                      {{
                                        item.flows && item.flows.length > 0
                                          ? `Flow Button (${item.flows.length} Steps)`
                                          : "Default Button"
                                      }}
                                    </div>
                                  </div>

                                  <!-- Button -->
                                  <div>
                                    <button
                                      :class="[
                                        'px-4 py-2 text-sm font-medium rounded',
                                        {
                                          'bg-blue-500 text-white':
                                            item.style === 'primary',
                                          'bg-gray-500 text-white':
                                            item.style === 'secondary',
                                          'bg-green-500 text-white':
                                            item.style === 'success',
                                          'bg-red-500 text-white':
                                            item.style === 'danger',
                                        },
                                      ]"
                                      :style="{ fontSize: item.textSize }"
                                    >
                                      {{ item.label }}
                                    </button>
                                  </div>
                                </div>
                              </template>

                              <template v-if="item.type === 'flow_button'">
                                <div class="p-2">
                                  {{ item.flowName }}
                                  <button
                                    :class="[
                                      'px-4 py-2 text-sm font-medium rounded',
                                      {
                                        'bg-blue-500 text-white':
                                          item.style === 'primary',
                                        'bg-gray-500 text-white':
                                          item.style === 'secondary',
                                        'bg-green-500 text-white':
                                          item.style === 'success',
                                        'bg-red-500 text-white': item.style === 'danger',
                                      },
                                    ]"
                                    :style="{ fontSize: item.textSize }"
                                  >
                                    {{ item.label }}
                                  </button>
                                </div>
                              </template>

                              <template v-if="item.type === 'flow_run'">
                                <div class="p-2">
                                  {{ item.flowName }}
                                </div>
                              </template>

                              <template v-if="item.type === 'textarea'">
                                <div class="p-2">
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium"
                                    >{{ item.name }}</label
                                  >
                                  <textarea
                                    :name="item.name"
                                    :placeholder="item.placeholder"
                                    :rows="item.rows"
                                    :cols="item.cols"
                                    class="block w-full px-4 py-2 mt-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                  ></textarea>
                                </div>
                              </template>

                              <template v-if="item.type === 'radiobox'">
                                <div class="p-2">
                                  <!-- {{ item.logics }} -->
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium"
                                    >{{ item.name }}</label
                                  >
                                  <div class="mt-1 space-y-2">
                                    <template
                                      v-for="(option, index) in item.options"
                                      :key="index"
                                    >
                                      <div class="flex items-center">
                                        <input
                                          :id="`${item.name}-${index}`"
                                          :name="item.name"
                                          :value="option.value"
                                          type="radio"
                                          class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label
                                          :for="`${item.name}-${index}`"
                                          class="ml-2 text-sm"
                                          >{{ option.label }}</label
                                        >
                                        <span class="ml-2 text-xs">{{
                                          option.description
                                        }}</span>
                                      </div>
                                    </template>
                                  </div>
                                </div>
                              </template>

                              <template v-if="item.type === 'checkbox'">
                                <div class="p-2">
                                  <!-- {{ item.logics }} -->
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium"
                                    >{{ item.name }}</label
                                  >
                                  <div class="mt-1 space-y-2">
                                    <template
                                      v-for="(option, index) in item.options"
                                      :key="index"
                                    >
                                      <div class="flex items-center">
                                        <input
                                          :id="`${item.name}-${index}`"
                                          :name="item.name"
                                          :value="option.value"
                                          type="checkbox"
                                          class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label
                                          :for="`${item.name}-${index}`"
                                          class="ml-2 text-sm"
                                          >{{ option.label }}</label
                                        >
                                      </div>
                                    </template>
                                  </div>
                                </div>
                              </template>

                              <template v-if="item.type === 'select'">
                                <div class="p-2">
                                  <!-- {{ item.logics }} -->
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium"
                                    >{{ item.name }}</label
                                  >
                                  <div class="mt-1">
                                    <select
                                      :id="item.name"
                                      :name="item.name"
                                      class="block w-full focus:ring-indigo-500 border-gray-300"
                                    >
                                      <template
                                        v-for="(option, index) in item.options"
                                        :key="index"
                                      >
                                        <option
                                          :value="option.value"
                                          :selected="option.selected"
                                        >
                                          {{ option.label }}
                                        </option>
                                      </template>
                                    </select>
                                  </div>
                                </div>
                              </template>

                              <template v-if="item.type === 'checkout_payment'">
                                <div class="p-2">
                                  <label
                                    :for="item.name"
                                    class="block text-sm font-medium mb-2"
                                    >{{ item.name }}</label
                                  >
                                  <div class="space-y-2">
                                    <template
                                      v-for="(option, index) in item.gateways"
                                      :key="index"
                                    >
                                      <div class="flex items-center">
                                        <input
                                          type="radio"
                                          :id="`${item.name}-${index}`"
                                          :name="item.name"
                                          :value="option.value"
                                          :checked="option.selected"
                                          class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label
                                          :for="`${item.name}-${index}`"
                                          class="ml-2 text-sm text-gray-700"
                                        >
                                          <span class="block font-bold">{{
                                            option.name
                                          }}</span>
                                          <span class="block">{{
                                            option.description
                                          }}</span>
                                        </label>
                                      </div>
                                    </template>
                                  </div>
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

                              <template v-if="item.type === 'html'">
                                <div class="video" v-html="item.content"></div>
                              </template>

                              <template v-if="item.type === 'video'">
                                <div class="video">
                                  <video
                                    :src="item.url"
                                    :autoplay="item.autoplay"
                                    v-if="item.url"
                                  ></video>
                                </div>
                              </template>

                              <template v-if="item.type === 'youtube'">
                                <div class="video">
                                  <iframe
                                    :src="
                                      'https://www.youtube.com/embed/' +
                                      extractYouTubeId(item.youtubeurl)
                                    "
                                    :allow="item.autoplay ? 'autoplay' : ''"
                                    class="w-full aspect-video"
                                    frameborder="0"
                                    allowfullscreen
                                  ></iframe>
                                </div>
                              </template>

                              <div class="pt-1 border-t border-gray-200">
                                <div class="flex items-center">
                                  <button
                                    v-if="item.type === 'form'"
                                    @click="
                                      openAddContentAndLightbox(rowIndex, columnIndex)
                                    "
                                    class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'plus']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>

                                  <button
                                    @click="cloneItem(rowIndex, columnIndex, itemIndex)"
                                    class="bg-gray-400 hover:bg-gray-700 w-5 h-5 text-xs rounded ml-1"
                                  >
                                    <font-awesome-icon
                                      :icon="['fas', 'clone']"
                                      class="mx-auto h-3 w-3 text-white"
                                    />
                                  </button>

                                  <button
                                    @click="moveItemUp(rowIndex, columnIndex, itemIndex)"
                                    v-show="itemIndex > 0"
                                    class="bg-gray-400 hover:bg-gray-700 w-5 h-5 text-xs rounded ml-1"
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
                                    class="bg-gray-400 hover:bg-gray-700 w-5 h-5 text-xs rounded ml-1"
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
                                    class="bg-gray-400 hover:bg-gray-700 w-5 h-5 text-xs rounded ml-1"
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

                        <div
                          class="flex items-center justify-between mt-0 border border-r border-gray-200 p-2"
                        >
                          <div class="w-1/2">
                            <div class="flex items-center">
                              <div
                                class="w-5 h-5 border border-gray-300 rounded-full"
                                :class="column.bg ? [column.bg] : ''"
                                :style="
                                  column.bgColor
                                    ? { backgroundColor: column.bgColor }
                                    : {}
                                "
                              ></div>
                              <div
                                class="border-l border-gray-200 pl-2 ml-2 flex items-center"
                              >
                                <span class="device-icon pr-2">
                                  <i
                                    class="fas fa-mobile-alt text-xs"
                                    :class="
                                      column.mobile ? 'text-gray-600' : 'text-gray-300'
                                    "
                                  ></i>
                                </span>
                                <span class="device-icon pr-2">
                                  <i
                                    class="fas fa-tablet-alt text-xs"
                                    :class="
                                      column.tablet ? 'text-gray-600' : 'text-gray-300'
                                    "
                                  ></i>
                                </span>
                                <span class="device-icon pr-2">
                                  <i
                                    class="fas fa-laptop text-xs"
                                    :class="
                                      column.laptop ? 'text-gray-600' : 'text-gray-300'
                                    "
                                  ></i>
                                </span>
                                <span class="device-icon pr-2">
                                  <i
                                    class="fas fa-desktop text-xs"
                                    :class="
                                      column.desktop ? 'text-gray-600' : 'text-gray-300'
                                    "
                                  ></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          class="border-t border-gray-200 bg-gray-50 p-1 text-xs text-gray-400"
                        >
                          Column : [{{ column.uid }}]
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between mt-0 border-t border-gray-200 p-2"
            >
              <div class="w-full">
                <div class="text-sm text-gray-500 flex items-center gap-2">
                  <!-- Outer Circle -->
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

                  <div class="border-l border-gray-200 pl-2 ml-2 flex items-center">
                    <span class="device-icon pr-2">
                      <i
                        class="fas fa-mobile-alt text-xs"
                        :class="row.mobile ? 'text-gray-600' : 'text-gray-300'"
                      ></i>
                    </span>
                    <span class="device-icon pr-2">
                      <i
                        class="fas fa-tablet-alt text-xs"
                        :class="row.tablet ? 'text-gray-600' : 'text-gray-300'"
                      ></i>
                    </span>
                    <span class="device-icon pr-2">
                      <i
                        class="fas fa-laptop text-xs"
                        :class="row.laptop ? 'text-gray-600' : 'text-gray-300'"
                      ></i>
                    </span>
                    <span class="device-icon pr-2">
                      <i
                        class="fas fa-desktop text-xs"
                        :class="row.desktop ? 'text-gray-600' : 'text-gray-300'"
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 bg-gray-50 p-1 text-xs text-gray-400">
              Row : [{{ row.uid }}]
            </div>
          </div>
        </div>

        <div v-else>
          <div class="bg-white border border-gray-200 rounded-sm p-8 mx-auto text-center">
            <h1 class="text-2xl font-bold mb-4">ยินดีต้อนรับสู่ระบบการจัดการเนื้อหา</h1>
            <p class="text-xl text-gray-600 mb-4">ยังไม่มีเนื้อหาในขณะนี้</p>
            <button @click="addRow" class="px-8 py-3 bg-indigo-500 text-white rounded">
              <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4 text-white" />
              เพิ่มเนื้อหาใหม่
            </button>
            <button
              @click="openTemplateModal"
              class="px-8 py-3 bg-indigo-500 text-white rounded ml-2"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4 text-white" />
              เลือกจาก Template
            </button>
          </div>

          <!-- Modal -->
          <div
            v-if="isModalOpen"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <div class="bg-white rounded-lg p-6 w-1/2">
              <h2 class="text-lg font-bold mb-4">เลือกจาก Template</h2>
              <div v-if="loading" class="text-center">Loading...</div>
              <div v-else>
                <ul>
                  <li
                    v-for="(item, index) in template"
                    :key="index"
                    class="py-2 px-4 border-b last:border-none hover:bg-gray-100 cursor-pointer"
                    @click="selectTemplate(item)"
                  >
                    {{ item.title }} {{ item.type }} {{ item.display }}
                  </li>
                </ul>
              </div>
              <button
                @click="closeModal"
                class="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                Close
              </button>
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
        :class="[
          'bg-white',
          { 'w-screen h-screen': fullScreenMode },
          { 'w-[600px]': !fullScreenMode },
          'relative',
        ]"
      >
        <div class="bg-gray-300 p-5 pt-3 pb-3 w-full">
          <div class="flex justify-between">
            <h2 class="text-lg font-semibold">Content Builder</h2>
            <div>
              <button
                @click="toggleFullScreenMode"
                class="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <font-awesome-icon :icon="['fas', 'window-maximize']" class="h-4 w-4" />
              </button>
              <button
                @click="cancelEditPopup"
                class="text-gray-600 hover:text-gray-800 focus:outline-none ml-2"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="popup-form">
          <div class="flex mb-2 bg-gray-300 pl-2 pr-2">
            <button
              class="w-1/4 py-2 px-4 text-center hover:bg-blue-600 focus:outline-none border-t border-r border-l border-b rounded-t-sm mr-1"
              :class="[
                'h-' + (activeTab === 'content' ? '12' : '10'),
                activeTab === 'content'
                  ? 'bg-white text-gray-700 font-semibold hover:bg-white'
                  : 'text-white bg-blue-500',
                activeTab === 'content' ? 'border-white' : 'border-blue-500',
              ]"
              @click="activeTab = 'content'"
              :style="{ 'margin-top': activeTab === 'content' ? '-8px' : '0' }"
            >
              Content
            </button>
            <button
              class="w-1/4 py-2 px-4 text-center hover:bg-blue-600 focus:outline-none border-t border-r border-l border-b rounded-t-sm mr-1"
              :class="[
                'h-' + (activeTab === 'style' ? '12' : '10'),
                activeTab === 'style'
                  ? 'bg-white text-gray-700 font-semibold hover:bg-white'
                  : 'text-white bg-blue-500',
                activeTab === 'style' ? 'border-white' : 'border-blue-500',
              ]"
              @click="activeTab = 'style'"
              :style="{ 'margin-top': activeTab === 'style' ? '-8px' : '0' }"
            >
              Style
            </button>
            <button
              class="w-1/4 py-2 px-4 text-center hover:bg-blue-600 focus:outline-none border-t border-r border-l border-b rounded-t-sm mr-1"
              :class="[
                'h-' + (activeTab === 'options' ? '12' : '10'),
                activeTab === 'options'
                  ? 'bg-white text-gray-700 font-semibold hover:bg-white'
                  : 'text-white bg-blue-500',
                activeTab === 'options' ? 'border-white' : 'border-blue-500',
              ]"
              @click="activeTab = 'options'"
              :style="{ 'margin-top': activeTab === 'options' ? '-8px' : '0' }"
            >
              Options
            </button>
            <button
              class="w-1/4 py-2 px-4 text-center hover:bg-blue-600 focus:outline-none border-t border-r border-l border-b rounded-t-sm mr-1"
              :class="[
                'h-' + (activeTab === 'responsive' ? '12' : '10'),
                activeTab === 'responsive'
                  ? 'bg-white text-gray-700 font-semibold hover:bg-white'
                  : 'text-white bg-blue-500',
                activeTab === 'responsive' ? 'border-white' : 'border-blue-500',
              ]"
              @click="activeTab = 'responsive'"
              :style="{ 'margin-top': activeTab === 'responsive' ? '-8px' : '0' }"
            >
              Responsive
            </button>
            <button
              class="w-1/4 py-2 px-4 text-center hover:bg-blue-600 focus:outline-none border-t border-r border-l border-b rounded-t-sm"
              :class="[
                'h-' + (activeTab === 'logic' ? '12' : '10'),
                activeTab === 'logic'
                  ? 'bg-white text-gray-700 font-semibold hover:bg-white'
                  : 'text-white bg-blue-500',
                activeTab === 'logic' ? 'border-white' : 'border-blue-500',
              ]"
              @click="activeTab = 'logic'"
              :style="{ 'margin-top': activeTab === 'logic' ? '-8px' : '0' }"
            >
              Logic
            </button>
          </div>

          <div class="p-2">
            <div v-if="activeTab === 'content'" class="tab-content">
              <template v-if="isValidType(selectedItem.type)">
                <component
                  v-if="componentImport"
                  :is="componentImport"
                  :item="selectedItem"
                  :flattened-categories="flattenedCategories"
                  :selected-item="selectedItem"
                  @update-item="handleUpdateItem"
                  mode="edit"
                />
                <div v-else>
                  <p>Loading...</p>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'lesson_categories_dropdown'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Lesson Categories Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <div class="section-group flex flex-col h-full pl-1">
                    <!-- Load the child component -->
                    <lesson_categories_dropdown
                      :selected-item="selectedItem"
                      @update="handleUpdate"
                    />
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'image'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >ตั้งค่ารูปภาพ</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <div class="section-group">
                    <div class="relative w-full">
                      <div class="aspect-w-16 aspect-h-6">
                        <div
                          class="absolute inset-0 flex items-center justify-center cursor-pointer"
                          @click="OpenFileImageBrowser"
                        >
                          <div
                            class="w-full h-full bg-gray-200 flex items-center justify-center"
                          >
                            <span class="text-gray-400" v-if="!selectedItem.url"
                              >ยังไม่ได้เลือกรูป</span
                            >
                            <img
                              v-else
                              :src="selectedItem.url"
                              alt="Selected Image"
                              class="object-cover object-center w-full h-full"
                            />
                          </div>
                          <div
                            class="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100"
                          >
                            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                            <span class="text-white bg-black p-2"
                              ><i class="fas fa-upload text-white text-lg mr-2"></i>
                              คลิ๊กเพื่อเลือกรูปภาพ</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-2 grid grid-cols-2 gap-4">
                      <div class="ml-2">
                        <label class="inline-flex items-center pt-8">
                          <input
                            v-model="selectedItem.showShadow"
                            type="checkbox"
                            class="form-checkbox"
                          />
                          <span class="ml-2">แสดงเงาของรูป</span>
                        </label>
                      </div>

                      <div class="ml-2">
                        <label class="inline-flex items-center pt-8">
                          <input
                            v-model="selectedItem.showHome"
                            type="checkbox"
                            class="form-checkbox"
                          />
                          <span class="ml-2">Home Link</span>
                        </label>
                      </div>

                      <div class="col-span-2">
                        <div class="grid grid-cols-1 gap-4">
                          <div class="ml-2">
                            <label class="inline-flex items-center">
                              <input
                                v-model="selectedItem.canLink"
                                type="checkbox"
                                class="form-checkbox"
                              />
                              <span class="ml-2">สร้างลิงค์</span>
                            </label>
                          </div>
                          <div v-if="selectedItem.canLink">
                            <div class="mt-2 grid grid-cols-3 gap-4">
                              <div class="col-span-2">
                                <label class="popup-label"
                                  >ระบุลิงค์ปลายทางที่ต้องการ:</label
                                >
                                <input
                                  v-model="selectedItem.link"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                />
                              </div>

                              <div>
                                <label class="popup-label">เปิดลิงค์ใน:</label>
                                <select
                                  v-model="selectedItem.target"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                >
                                  <option disabled value="">เลือกปลายทาง</option>
                                  <option value="_self">หน้าเดิม</option>
                                  <option value="_blank">หน้าใหม่</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div class="grid grid-cols-2 gap-4">
                              <div>
                                <label class="popup-label">คำอธิบายรูปภาพ:</label>
                                <input
                                  v-model="selectedItem.alt"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                />
                              </div>
                              <div>
                                <label class="popup-label">ขนาด:</label>
                                <input
                                  v-model="selectedItem.width"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                />
                              </div>
                            </div>
                          </div>

                          <div class="section-group mt-3">
                            <label class="popup-label block font-semibold"
                              >Image Alignment</label
                            >
                            <div class="grid grid-cols-3 gap-4 mt-3">
                              <label
                                v-for="alignment in ['left', 'center', 'right']"
                                :key="alignment"
                                class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                                :class="{
                                  'bg-gray-200': selectedItem.alignment === alignment,
                                }"
                                @click="selectedItem.alignment = alignment"
                              >
                                <input
                                  type="radio"
                                  v-model="selectedItem.alignment"
                                  :value="alignment"
                                  class="radio-input hidden"
                                />
                                <span class="text-center text-sm text-gray-500">{{
                                  alignment
                                }}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'preview'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >ตั้งค่าแสดงตัวอย่างไฟล์</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <div class="section-group">
                    <div class="relative w-full">
                      <div>
                        <label class="popup-label">ชื่อไฟล์:</label>
                        <input
                          v-model="selectedItem.filename"
                          type="text"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        />
                      </div>

                      <!-- New input row starts here -->
                      <div class="mt-2">
                        <label class="popup-label">ไฟล์:</label>
                        <div class="flex">
                          <input
                            v-model="selectedItem.fileurl"
                            type="text"
                            class="popup-input flex-grow rounded-sm border border-gray-200"
                          />
                          <button
                            @click="OpenFilePreviewBrowser"
                            class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-sm"
                          >
                            Select File
                          </button>
                        </div>
                      </div>
                      <!-- New input row ends here -->

                      <div class="mt-2">
                        <label class="popup-label">รูปตัวอย่าง:</label>
                      </div>
                      <div class="aspect-w-16 aspect-h-6 mt-2">
                        <div
                          class="absolute inset-0 flex items-center justify-center cursor-pointer"
                          @click="OpenFileImageBrowser"
                        >
                          <div
                            class="w-full h-full bg-gray-200 flex items-center justify-center"
                          >
                            <span class="text-gray-400" v-if="!selectedItem.url"
                              >ยังไม่ได้เลือกรูป</span
                            >
                            <img
                              v-else
                              :src="selectedItem.url"
                              alt="Selected Image"
                              class="object-cover object-center w-full h-full"
                            />
                          </div>
                          <div
                            class="absolute inset-0 flex flex-col items-center justify-center opacity-0 hover:opacity-100"
                          >
                            <div class="absolute inset-0 bg-black bg-opacity-20"></div>
                            <span class="text-white bg-black p-2"
                              ><i class="fas fa-upload text-white text-lg mr-2"></i>
                              คลิ๊กเพื่อเลือกรูปภาพ</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-2 grid grid-cols-2 gap-4">
                      <div class="ml-2 col-span-2">
                        <label class="popup-label">การแสดงผล :</label>
                        <div class="">
                          <label class="inline-flex items-center">
                            <input
                              v-model="selectedItem.canDownload"
                              type="checkbox"
                              class="form-checkbox"
                            />
                            <span class="ml-2">Allow Download File</span>
                          </label>
                        </div>
                      </div>

                      <div class="ml-2 col-span-2">
                        <label class="popup-label">การแสดงผล :</label>
                        <div class="grid grid-cols-2">
                          <div>
                            <input
                              type="radio"
                              id="display-download"
                              value="download"
                              v-model="selectedItem.display"
                            />
                            <label for="manual" class="ml-1">Direct Download</label>
                          </div>
                          <div>
                            <input
                              type="radio"
                              id="display-preview"
                              value="preview"
                              v-model="selectedItem.display"
                            />
                            <label for="api" class="ml-1">Preview</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'slideshow'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Slideshow Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <div
                      v-for="(slide, index) in selectedItem.slides"
                      :key="index"
                      class="slide-item flex items-center border-b border-gray-200 py-4 pr-4"
                    >
                      <div
                        class="slide-thumbnail w-1/5 relative mr-3"
                        @click="OpenFileBrowser(index)"
                      >
                        <div v-if="slide.image" class="thumbnail-wrapper h-24 w-24">
                          <img
                            :src="slide.image"
                            alt="Slide Thumbnail"
                            class="w-full h-full object-cover"
                          />
                          <div
                            class="upload-icon absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'upload']"
                              class="mx-auto h-3 w-3 text-black"
                            />
                          </div>
                        </div>
                        <div
                          v-else
                          class="thumbnail-placeholder flex items-center justify-center h-24 w-24 bg-gray-200 border border-gray-300"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'image']"
                            class="mx-auto h-3 w-3 text-black"
                          />
                        </div>
                      </div>

                      <div
                        class="slide-details w-4/5 ml-4"
                        v-if="selectedSlideIndex !== index"
                      >
                        <div class="slide-content">
                          <h3 class="font-semibold">{{ slide.title }}</h3>
                          <p class="text-gray-600">{{ slide.subtitle }}</p>
                          <p class="text-gray-600">{{ slide.link }}</p>
                        </div>
                        <div class="slide-actions flex items-center">
                          <button
                            @click="showSlideActionPanel(index)"
                            class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded edit-slide-btn mr-2"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'pencil']"
                              class="mx-auto h-3 w-3 text-white"
                            />
                          </button>
                          <button
                            @click="cloneSlide(index)"
                            class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded edit-slide-btn mr-2"
                            title="Clone Slide"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'clone']"
                              class="mx-auto h-3 w-3 text-white"
                            />
                          </button>
                          <button
                            @click="moveSlideUp(index)"
                            :disabled="index === 0"
                            class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded slide-action-btn mr-2"
                            title="Move Up"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'chevron-up']"
                              class="mx-auto h-3 w-3 text-white"
                            />
                          </button>
                          <button
                            @click="moveSlideDown(index)"
                            :disabled="index === selectedItem.slides.length - 1"
                            class="bg-gray-500 hover:bg-gray-700 w-5 h-5 text-xs rounded slide-action-btn mr-2"
                            title="Move Down"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'chevron-down']"
                              class="mx-auto h-3 w-3 text-white"
                            />
                          </button>
                          <button
                            @click="deleteSlide(index)"
                            class="bg-red-500 hover:bg-red-700 w-5 h-5 text-xs rounded delete-slide-btn ml-auto"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'times']"
                              class="mx-auto h-3 w-3 text-white"
                            />
                          </button>
                        </div>
                      </div>

                      <div v-if="selectedSlideIndex === index" class="slide-action-panel">
                        <div class="slide-details w-4/5 ml-4">
                          <div class="slide-content">
                            <input
                              v-model="selectedItem.slides[selectedSlideIndex].title"
                              type="text"
                              class="slide-input text-[16px] border border-gray-300 rounded-sm w-full p-1 mb-1"
                              placeholder="Slide Title"
                            />
                            <input
                              v-model="selectedItem.slides[selectedSlideIndex].subtitle"
                              type="text"
                              class="slide-input text-[16px] border border-gray-300 rounded-sm w-full p-1 mb-1"
                              placeholder="Slide Subtitle"
                            />
                            <input
                              v-model="selectedItem.slides[selectedSlideIndex].link"
                              type="text"
                              class="slide-input text-[16px] border border-gray-300 rounded-sm w-full p-1"
                              placeholder="Slide URL"
                            />
                          </div>
                          <div class="slideshow-options mt-2">
                            <div class="slideshow-option">
                              <label class="popup-label">แสดงปุ่ม : </label>
                              <input
                                v-model="selectedItem.slides[selectedSlideIndex].button"
                                type="checkbox"
                                class="popup-checkbox"
                              />
                              <span class="ml-2">
                                <label class="popup-label">แสดงข้อความ : </label>
                                <input
                                  v-model="
                                    selectedItem.slides[selectedSlideIndex].content
                                  "
                                  type="checkbox"
                                  class="popup-checkbox"
                                />
                              </span>
                            </div>
                          </div>
                          <div class="slide-action-buttons">
                            <button @click="saveSlideChanges" class="save-slide-btn mr-2">
                              บันทึก
                            </button>
                            <button @click="cancelSlideEdit" class="cancel-slide-btn">
                              ปิด
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      @click="addSlide(selectedItem)"
                      class="w-full border pt-2 pb-2 border-gray-200 hover:bg-gray-100 hover:text-gray-700 text-center add-slide-btn mt-4 text-gray-500"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'plus']"
                        class="mx-auto h-3 w-3"
                      />เพิ่มสไลด์
                    </button>

                    <div class="slideshow-options mb-5 mt-4 grid grid-cols-2 gap-4">
                      <div class="slideshow-option">
                        <label class="popup-label">Interval : </label>
                        <input
                          v-model="selectedItem.interval"
                          type="number"
                          class="popup-input border border-gray-300 rounded-sm"
                        />
                      </div>
                      <div class="slideshow-option pt-3">
                        <input
                          v-model="selectedItem.autoplay"
                          type="checkbox"
                          class="popup-checkbox"
                        />
                        <label class="popup-label"> Autoplay</label>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'video'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Video Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <label class="popup-label">Video URL:</label>
                    <input v-model="selectedItem.url" type="text" class="popup-input" />
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'youtube'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Youtube Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <label class="popup-label block mb-1 font-semibold"
                      >Youtube URL:</label
                    >
                    <input
                      v-model="selectedItem.youtubeurl"
                      type="text"
                      class="popup-input w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-300 focus:outline-none"
                    />
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'iframe_internal'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Iframe Internal Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <!-- Dropdown Selection -->
                  <div class="section-group mb-4">
                    <label class="popup-label block mb-3 font-semibold"
                      >เลือกมาตรฐานหรือหน้าเว็บ :</label
                    >
                    <select v-model="selectedItem.mode" class="popup-input">
                      <option value="form">แบบฟอร์ม</option>
                      <option value="standalone">หน้าเว็บ</option>
                    </select>
                  </div>

                  <div class="section-group">
                    <label class="popup-label block mb-3 font-semibold"
                      >เลือกหน้าเว็บที่ต้องการใช้งาน :</label
                    >
                    <div class="grid grid-cols-2 gap-2">
                      <div
                        v-for="item in postItems"
                        :key="item._id"
                        class="p-2 bg-gray-100 border border-gray-200 rounded-sm"
                      >
                        <input
                          v-model="selectedItem.page"
                          :value="item._id"
                          :id="selectedItem.page + '-' + item._id"
                          @change="updatePageName(item.title)"
                          type="radio"
                          class="popup-radiobox"
                        />
                        <label
                          :for="selectedItem.page + '-' + item._id"
                          class="popup-label ml-2"
                          >{{ item.title }}</label
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'table'">
                <!-- rows
                <pre> {{ selectedItem.rows }}</pre>
                columns
                <pre>{{ selectedItem.columns }}</pre> -->

                <div :class="['content-editor', 'overflow-auto']" :style="divStyles">
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Table Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <div>
                      <input
                        type="radio"
                        id="manual"
                        value="manual"
                        v-model="selectedItem.dataSourceType"
                      />
                      <label for="manual">Manual Input</label>
                      <input
                        type="radio"
                        id="api"
                        value="api"
                        v-model="selectedItem.dataSourceType"
                      />
                      <label for="api">API</label>
                    </div>

                    <div v-if="selectedItem.dataSourceType === 'manual'">
                      <div>
                        <button
                          v-if="
                            selectedItem.columns &&
                            selectedItem.columns.length &&
                            selectedItem.rows &&
                            selectedItem.rows.length
                          "
                          @click="clearTableData"
                          class="ml-2 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
                        >
                          Clear Table
                        </button>

                        <table class="">
                          <thead class="">
                            <tr class="">
                              <th
                                v-for="column in selectedItem.columns"
                                :key="column.id"
                                class="table-column"
                              >
                                <input
                                  v-model="column.label"
                                  type="text"
                                  class="popup-input"
                                />
                                <button @click="deleteColumn(column.id)">del</button>
                              </th>
                            </tr>
                          </thead>
                          <tbody class="">
                            <tr>
                              <td
                                class="p-2 bg-gray-100 border border-gray-200"
                                v-for="(column, columnIndex) in selectedItem.columns"
                                :key="column.id"
                              >
                                <template v-if="!column.editMode">
                                  <div>
                                    <div class="flex items-center justify-between">
                                      <button @click="addColumnItem(columnIndex - 1)">
                                        <font-awesome-icon
                                          :icon="['fas', 'plus']"
                                          class="mx-auto h-3 w-3 text-green-500"
                                        />
                                      </button>
                                      <div class="text-center">{{ column.label }}</div>
                                      <div class="space-x-1">
                                        <button @click="toggleEditMode(column.id)">
                                          <font-awesome-icon
                                            :icon="['fas', 'pencil']"
                                            class="mx-auto h-3 w-3 text-black"
                                          />
                                        </button>
                                        <button @click="deleteColumn(column.id)">
                                          <font-awesome-icon
                                            :icon="['fas', 'trash']"
                                            class="mx-auto h-3 w-3 text-red-500"
                                          />
                                        </button>
                                        <button @click="addColumnItem(columnIndex + 1)">
                                          <font-awesome-icon
                                            :icon="['fas', 'plus']"
                                            class="mx-auto h-3 w-3 text-green-500"
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </template>
                                <template v-else>
                                  <input
                                    v-model="column.label"
                                    @input="
                                      editColumnName(column.id, $event.target.value)
                                    "
                                    type="text"
                                    class="popup-input w-full rounded-sm border border-gray-200"
                                  />
                                  <button @click="toggleEditMode(column.id)">Save</button>
                                </template>
                              </td>
                              <td
                                v-if="
                                  selectedItem.columns &&
                                  selectedItem.columns.length &&
                                  selectedItem.rows &&
                                  selectedItem.rows.length
                                "
                                class="bg-gray-100 border border-gray-200"
                              >
                                <button disabled>เครื่องมือ</button>
                              </td>
                            </tr>
                            <tr v-for="row in selectedItem.rows" :key="row.id">
                              <td
                                v-for="(column, columnIndex) in selectedItem.columns"
                                :key="column.id"
                                class="border border-gray-200"
                              >
                                <input
                                  v-model="row.content[columnIndex][column.field]"
                                  :key="column.field + row.id"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-white"
                                />
                              </td>
                              <td class="border border-gray-200 text-center">
                                <button @click="deleteRow(row.id)">
                                  <font-awesome-icon
                                    :icon="['fas', 'trash']"
                                    class="mx-auto h-3 w-3 text-black"
                                  />
                                </button>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="100%">
                                <button
                                  @click="addColumnItem"
                                  class="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'plus']"
                                    class="mx-auto h-3 w-3 text-white"
                                  />เพิ่มแถว
                                </button>
                                <button
                                  @click="addRowItem"
                                  class="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'plus']"
                                    class="mx-auto h-3 w-3 text-white"
                                  />เพิ่มข้อมูล
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div v-else-if="selectedItem.dataSourceType === 'api'">
                      <div>
                        <div class="mb-3">
                          <input
                            type="text"
                            v-model="selectedItem.apiEndpoint"
                            placeholder="API Endpoint"
                            class="popup-input"
                          />
                          <select
                            v-model="selectedItem.selectedMethodType"
                            class="popup-input"
                          >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                          </select>
                          <button
                            @click="getDataFromAPI"
                            class="ml-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'download']"
                              class="mx-auto h-3 w-3 text-white"
                            />
                            Get Data
                          </button>
                          <button
                            v-if="
                              selectedItem.columns &&
                              selectedItem.columns.length &&
                              selectedItem.rows &&
                              selectedItem.rows.length
                            "
                            @click="clearTableData"
                            class="ml-2 bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
                          >
                            Clear Table
                          </button>
                        </div>
                        <div v-if="apiResponseError" class="text-red-500">
                          {{ apiResponseError }}
                        </div>
                      </div>

                      <table class="">
                        <thead class="">
                          <tr class="">
                            <th
                              v-for="column in selectedItem.columns"
                              :key="column.id"
                              class="table-column"
                            >
                              <input
                                v-model="column.label"
                                type="text"
                                class="popup-input"
                              />
                              <button @click="deleteColumn(column.id)">del</button>
                            </th>
                          </tr>
                        </thead>
                        <tbody class="">
                          <tr>
                            <td
                              class="p-2 bg-gray-100 border border-gray-200"
                              v-for="(column, columnIndex) in selectedItem.columns"
                              :key="column.id"
                            >
                              <template v-if="!column.editMode">
                                <div>
                                  <div class="flex items-center justify-between">
                                    <button @click="addColumnItem(columnIndex - 1)">
                                      <font-awesome-icon
                                        :icon="['fas', 'plus']"
                                        class="mx-auto h-3 w-3 text-green-500"
                                      />
                                    </button>
                                    <div class="text-center">{{ column.label }}</div>
                                    <div class="space-x-1">
                                      <button @click="toggleEditMode(column.id)">
                                        <font-awesome-icon
                                          :icon="['fas', 'pencil']"
                                          class="mx-auto h-3 w-3 text-black"
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </template>
                              <template v-else>
                                <input
                                  v-model="column.label"
                                  @input="editColumnName(column.id, $event.target.value)"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                />
                                <button @click="toggleEditMode(column.id)">Save</button>
                              </template>
                            </td>
                            <td
                              v-if="
                                selectedItem.columns &&
                                selectedItem.columns.length &&
                                selectedItem.rows &&
                                selectedItem.rows.length
                              "
                              class="bg-gray-100 border border-gray-200"
                            >
                              <button disabled>เครื่องมือ</button>
                            </td>
                          </tr>
                          <tr v-for="row in selectedItem.rows" :key="row.id">
                            <td
                              v-for="(column, columnIndex) in selectedItem.columns"
                              :key="column.id"
                              class="border border-gray-200"
                            >
                              <input
                                v-model="row.content[columnIndex][column.field]"
                                :key="column.field + row.id"
                                type="text"
                                class="popup-input w-full rounded-sm border border-white"
                              />
                            </td>
                            <td class="border border-gray-200 text-center">
                              <button @click="deleteRow(row.id)">
                                <font-awesome-icon
                                  :icon="['fas', 'trash']"
                                  class="mx-auto h-3 w-3 text-black"
                                />
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'button'">
                <div
                  class="content-editor overflow-auto min-h-[600px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent right-[-20px]"
                >
                  <div>
                    <!-- Tabs -->
                    <div class="tabs border-b border-gray-200 flex">
                      <button
                        :class="{
                          'border-b-2 border-blue-500 font-bold':
                            activeFlowTab === 'button',
                          'text-gray-500': activeFlowTab !== 'button',
                        }"
                        class="px-4 py-2"
                        @click="activeFlowTab = 'button'"
                      >
                        Button Config
                      </button>
                      <button
                        :class="{
                          'border-b-2 border-blue-500 font-bold':
                            activeFlowTab === 'flow',
                          'text-gray-500': activeFlowTab !== 'flow',
                        }"
                        class="px-4 py-2"
                        @click="activeFlowTab = 'flow'"
                      >
                        Flow Config
                      </button>
                      <button
                        :class="{
                          'border-b-2 border-blue-500 font-bold':
                            activeFlowTab === 'mapping',
                          'text-gray-500': activeFlowTab !== 'mapping',
                        }"
                        class="px-4 py-2"
                        @click="activeFlowTab = 'mapping'"
                      >
                        Data Mapping
                      </button>
                    </div>

                    <!-- Tab Content -->
                    <div v-show="activeFlowTab === 'button'" class="p-4">
                      <!-- Button Config Section -->
                      <div class="section-group border-b border-gray-200 pb-3 mb-3">
                        <span class="block font-bold text-md">Button Config</span>
                        <span class="text-gray-500 text-sm"
                          >Configuration options for the button</span
                        >
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="section-group">
                          <label class="block popup-label font-semibold">Name:</label>
                          <input
                            v-model="selectedItem.name"
                            type="text"
                            class="popup-input w-full rounded-sm border border-gray-200"
                          />
                          <label class="block popup-label mt-3 font-semibold"
                            >Label:</label
                          >
                          <input
                            v-model="selectedItem.label"
                            type="text"
                            class="popup-input w-full rounded-sm border border-gray-200"
                          />
                        </div>
                        <div class="section-group">
                          <label class="block popup-label font-semibold"
                            >Button Style:</label
                          >
                          <select
                            v-model="selectedItem.style"
                            class="popup-select w-full rounded-sm border border-gray-200"
                          >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="success">Success</option>
                            <option value="danger">Danger</option>
                          </select>
                          <label class="block popup-label mt-3 font-semibold"
                            >Button Text Size:</label
                          >
                          <select
                            v-model="selectedItem.textSize"
                            class="popup-select w-full rounded-sm border border-gray-200"
                          >
                            <option value="text-xs">Extra Small</option>
                            <option value="text-sm">Small</option>
                            <option value="text-base">Base</option>
                            <option value="text-lg">Large</option>
                            <option value="text-xl">Extra Large</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div v-show="activeFlowTab === 'flow'" class="p-4">
                      <!-- Flow Config Section -->
                      <div class="section-group border-b border-gray-200 pb-3 mb-3">
                        <span class="block font-bold text-md">Flow Config</span>
                        <span class="text-gray-500 text-sm"
                          >Configuration options for the button</span
                        >
                      </div>
                      <div class="section-group grid grid-cols-3 gap-4 mt-3 items-center">
                        <div>
                          <label class="popup-label font-semibold">Add Step:</label>
                        </div>
                        <div>
                          <select
                            v-model="newStep.type"
                            class="popup-select w-full rounded-sm border border-gray-200"
                          >
                            <option disabled value="">Select a Step</option>
                            <option value="database">Save Data to DB</option>
                            <option value="alert">Alert</option>
                            <option value="modal">Show Modal</option>
                            <option value="email">Send Email</option>
                            <option value="redirect">Redirect</option>
                            <option value="delay">Delay</option>
                            <option value="trigger">Trigger</option>
                          </select>
                        </div>
                        <div>
                          <button
                            @click="addStep"
                            class="py-2 px-4 bg-blue-500 text-white rounded-sm"
                          >
                            Add Step
                          </button>
                        </div>
                      </div>

                      <div class="section-group mt-5">
                        <span class="block popup-label font-semibold">Flow Steps:</span>
                        <ul class="flow-steps list-none p-0 text-sm">
                          <li
                            v-for="(step, index) in selectedItem.flows"
                            :key="index"
                            class="border-b border-gray-200 py-2"
                          >
                            <div class="flex items-center justify-between w-full block">
                              <span>{{ index + 1 }}. {{ step.type }}</span>
                              <div>
                                <button
                                  @click="toggleEdit(index)"
                                  class="px-2 py-1 bg-gray-300 rounded-sm mr-2 text-sm"
                                >
                                  {{ step.isEditing ? "Collapse" : "Edit" }}
                                </button>
                                <button
                                  @click="duplicateStep(index)"
                                  class="px-2 py-1 bg-blue-500 text-white rounded-sm mr-2"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'clone']"
                                    class="h-3 w-3"
                                  />
                                </button>
                                <button
                                  @click="moveStep(index, -1)"
                                  :disabled="index === 0"
                                  class="px-2 py-1 bg-gray-300 rounded-sm mr-2"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'arrow-up']"
                                    class="h-3 w-3"
                                  />
                                </button>
                                <button
                                  @click="moveStep(index, 1)"
                                  :disabled="index === selectedItem.flows.length - 1"
                                  class="px-2 py-1 bg-gray-300 rounded-sm mr-2"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'arrow-down']"
                                    class="h-3 w-3"
                                  />
                                </button>
                                <button
                                  @click="removeStep(index)"
                                  class="px-2 py-1 bg-red-500 text-white rounded-sm"
                                >
                                  <font-awesome-icon
                                    :icon="['fas', 'trash']"
                                    class="h-3 w-3"
                                  />
                                </button>
                              </div>
                            </div>
                            <div
                              v-if="step.isEditing"
                              class="mt-3 bg-gray-100 p-3 rounded-sm w-full block text-sm"
                            >
                              <div v-if="step.type === 'delay'">
                                <label class="block popup-label font-semibold"
                                  >Delay Duration (seconds):</label
                                >
                                <input
                                  v-model="step.options.duration"
                                  type="number"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter delay duration"
                                  min="0"
                                />
                              </div>

                              <div v-if="step.type === 'database'">
                                <label class="block popup-label font-semibold"
                                  >Database Collection:</label
                                >
                                <input
                                  v-model="step.options.collection"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter collection name"
                                />
                              </div>

                              <div v-if="step.type === 'alert'">
                                <label class="block popup-label font-semibold"
                                  >Alert Text:</label
                                >
                                <textarea
                                  v-model="step.options.text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter alert text"
                                ></textarea>
                              </div>

                              <div v-if="step.type === 'modal'">
                                <!-- Modal Title -->
                                <label class="block popup-label font-semibold"
                                  >Modal Title:</label
                                >
                                <input
                                  v-model="step.options.title"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter modal title"
                                />

                                <!-- Modal Message -->
                                <label class="block popup-label font-semibold"
                                  >Modal Message:</label
                                >
                                <textarea
                                  v-model="step.options.message"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter modal message"
                                ></textarea>

                                <!-- Render Keywords as List -->
                                <div class="mt-4">
                                  <label class="block popup-label font-semibold"
                                    >Keywords:</label
                                  >
                                  <ul
                                    class="list-disc ml-4 space-y-2 text-sm text-gray-800"
                                  >
                                    <li
                                      v-for="(keyword, index) in step.options.keyword"
                                      :key="index"
                                    >
                                      [{{ keyword.name }}]
                                    </li>
                                  </ul>
                                </div>

                                <!-- Keyword Dropdown -->
                                <label class="block popup-label font-semibold"
                                  >Keyword:</label
                                >
                                <div class="flex gap-2 items-center">
                                  <select
                                    v-model="selectedOption"
                                    class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                  >
                                    <option value="" disabled>เลือกเป้าหมาย</option>
                                    <option
                                      v-for="option in getAllBuilderOptionsFlow(
                                        flow,
                                        index
                                      )"
                                      :value="option"
                                      :key="`${option.name}-${option.rowIndex}-${option.columnIndex}-${option.obj}`"
                                    >
                                      {{ option.name }}
                                    </option>
                                  </select>
                                  <button
                                    class="px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600"
                                    @click="addKeyword(step)"
                                    :disabled="!selectedOption"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              <div v-if="step.type === 'email'">
                                <label class="block popup-label font-semibold"
                                  >Email Received Name:</label
                                >
                                <input
                                  v-model="step.options.received"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter email Received name"
                                />
                                <label class="block popup-label font-semibold"
                                  >Email Received Email:</label
                                >
                                <input
                                  v-model="step.options.received_email"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter email Received Email"
                                />
                                <label class="block popup-label font-semibold"
                                  >Email Sender Name:</label
                                >
                                <input
                                  v-model="step.options.sender"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter email sender name"
                                />
                                <label class="block popup-label font-semibold mt-2"
                                  >Email Subject:</label
                                >
                                <input
                                  v-model="step.options.subject"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter email subject"
                                />
                                <label class="block popup-label font-semibold mt-2"
                                  >Email Body:</label
                                >
                                <textarea
                                  v-model="step.options.body"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter email body"
                                ></textarea>

                                <!-- Render Keywords as List -->
                                <div class="mt-2">
                                  <label class="block popup-label font-semibold"
                                    >Keywords:</label
                                  >
                                  <ul
                                    class="list-disc ml-4 space-y-2 text-sm text-gray-800"
                                  >
                                    <li
                                      v-for="(keyword, index) in step.options.keyword"
                                      :key="index"
                                    >
                                      [{{ keyword.name }}]
                                    </li>
                                  </ul>
                                </div>

                                <!-- Keyword Dropdown -->
                                <label class="block popup-label font-semibold mt-2"
                                  >Keyword:</label
                                >
                                <div class="flex gap-2 items-center">
                                  <select
                                    v-model="selectedOption"
                                    class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                  >
                                    <option value="" disabled>เลือกเป้าหมาย</option>
                                    <option
                                      v-for="option in getAllBuilderOptionsFlow(
                                        flow,
                                        index
                                      )"
                                      :value="option"
                                      :key="`${option.name}-${option.rowIndex}-${option.columnIndex}-${option.obj}`"
                                    >
                                      {{ option.name }}
                                    </option>
                                  </select>
                                  <button
                                    class="px-4 py-2 bg-blue-500 text-white rounded shadow-sm hover:bg-blue-600"
                                    @click="addKeyword(step)"
                                    :disabled="!selectedOption"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>

                              <div v-if="step.type === 'redirect'">
                                <label class="block popup-label font-semibold"
                                  >Redirect URL:</label
                                >
                                <input
                                  v-model="step.options.url"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter redirect URL"
                                />
                              </div>

                              <div v-if="step.type === 'trigger'">
                                <label class="block popup-label font-semibold"
                                  >Element:</label
                                >
                                <input
                                  v-model="step.options.element"
                                  type="text"
                                  class="popup-input w-full rounded-sm border border-gray-200"
                                  placeholder="Enter element selector"
                                />

                                <div class="grid grid-cols-2 gap-4 mt-4">
                                  <div>
                                    <label class="block popup-label font-semibold"
                                      >CSS Class:</label
                                    >
                                    <input
                                      v-model="step.options.cssClass"
                                      type="text"
                                      class="popup-input w-full rounded-sm border border-gray-200"
                                      placeholder="Enter CSS class"
                                    />
                                  </div>
                                  <div>
                                    <label class="block popup-label font-semibold"
                                      >Mode:</label
                                    >
                                    <select
                                      v-model="step.options.mode"
                                      class="popup-select w-full rounded-sm border border-gray-200"
                                    >
                                      <option value="add">Add</option>
                                      <option value="remove">Remove</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Tab Content -->
                    <div v-show="activeFlowTab === 'mapping'" class="p-4">
                      <!-- Data Mapping Section -->
                      <div class="section-group flex flex-wrap gap-4 mt-3">
                        <div class="flex flex-col w-full md:w-1/3">
                          <label class="block popup-label font-semibold">Keyword:</label>
                          <input
                            v-model="newMapping.keyword"
                            type="text"
                            class="popup-input flex-grow rounded-sm border border-gray-200"
                            placeholder="Enter keyword"
                          />
                        </div>
                        <div class="flex flex-col w-full md:w-1/3">
                          <label class="block popup-label font-semibold">Value:</label>
                          <select
                            v-model="selectedOption"
                            class="popup-select flex-grow rounded-sm border border-gray-200"
                          >
                            <option value="" disabled>Select a Value</option>
                            <option
                              v-for="option in getAllBuilderOptionsFlow()"
                              :value="option"
                              :key="`${option.name}-${option.rowIndex}-${option.columnIndex}-${option.obj}`"
                            >
                              {{ option.name }}
                            </option>
                          </select>
                        </div>
                        <div class="flex items-end w-full md:w-auto">
                          <button
                            @click="addMappingItem"
                            class="py-2 px-4 bg-blue-500 text-white rounded-sm"
                            :disabled="!newMapping.keyword || !selectedOption"
                          >
                            Add Mapping
                          </button>
                        </div>
                      </div>

                      <!-- Mapping List -->
                      <div class="section-group mt-5">
                        <span class="block popup-label font-semibold">Mappings:</span>
                        <ul class="mapping-list list-none p-0 text-sm">
                          <li
                            v-for="(mapping, index) in selectedItem.mappings"
                            :key="index"
                            class="border-b border-gray-200 py-2"
                          >
                            <div class="flex items-center justify-between">
                              <span class="font-bold">Keyword:{{ mapping.keyword }}</span>
                              <!-- <button
                                  @click="removeMapping(index)"
                                  class="px-2 py-1 bg-red-500 text-white rounded-sm"
                                >
                                  Remove Keyword
                                </button> -->
                            </div>
                            <ul class="list-disc mt-2">
                              <li
                                v-for="(item, itemIndex) in mapping.values"
                                :key="itemIndex"
                                class="flex items-center justify-between"
                              >
                                <span>Value:{{ item.name }}</span>
                                <button
                                  @click="removeMappingItem(index, itemIndex)"
                                  class="px-2 py-1 bg-red-500 text-white rounded-sm"
                                >
                                  Remove Item
                                </button>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'flow_button'">
                <div
                  class="content-editor overflow-auto min-h-[600px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent right-[-20px]"
                >
                  <div class="section-group border-b border-gray-200 pb-3 mb-3">
                    <span class="block font-bold text-md">Button Config</span>
                    <span class="text-gray-500 text-sm"
                      >Configuration options for the button</span
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 section-group">
                      <label class="popup-label block mb-3 font-semibold"
                        >เลือก flow ที่ต้องการใช้งาน :</label
                      >
                      <div class="grid grid-cols-2 gap-2">
                        <div
                          v-for="item in flowOptions"
                          :key="item._id"
                          class="p-2 bg-gray-100 border border-gray-200 rounded-sm"
                        >
                          <input
                            v-model="selectedItem.flow"
                            :value="item._id"
                            :id="selectedItem.flow + '-' + item._id"
                            @change="updateFlowName(item.name)"
                            type="radio"
                            class="popup-radiobox"
                          />
                          <label
                            :for="selectedItem.flow + '-' + item._id"
                            class="popup-label ml-2"
                            >{{ item.name }}</label
                          >
                        </div>
                      </div>
                    </div>

                    <div class="section-group">
                      <label class="block popup-label font-semibold">Name:</label>
                      <input
                        v-model="selectedItem.name"
                        type="text"
                        class="popup-input w-full rounded-sm border border-gray-200"
                      />

                      <label class="block popup-label mt-3 font-semibold">Label:</label>
                      <input
                        v-model="selectedItem.label"
                        type="text"
                        class="popup-input w-full rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="block popup-label font-semibold">Button Style:</label>
                      <select
                        v-model="selectedItem.style"
                        class="popup-select w-full rounded-sm border border-gray-200"
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="success">Success</option>
                        <option value="danger">Danger</option>
                      </select>

                      <label class="block popup-label mt-3 font-semibold"
                        >Button Text Size:</label
                      >
                      <select
                        v-model="selectedItem.textSize"
                        class="popup-select w-full rounded-sm border border-gray-200"
                      >
                        <option value="text-xs">Extra Small</option>
                        <option value="text-sm">Small</option>
                        <option value="text-base">Base</option>
                        <option value="text-lg">Large</option>
                        <option value="text-xl">Extra Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'flow_run'">
                <div
                  class="content-editor overflow-auto min-h-[600px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent right-[-20px]"
                >
                  <div class="section-group border-b border-gray-200 pb-3 mb-3">
                    <span class="block font-bold text-lg">Autorun Flow Config</span>
                    <span class="text-gray-500"
                      >Configuration options for the button</span
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-2 section-group">
                      <label class="popup-label block mb-3 font-semibold"
                        >เลือก flow ที่ต้องการใช้งาน :</label
                      >
                      <div class="grid grid-cols-2 gap-2">
                        <div
                          v-for="item in flowOptions"
                          :key="item._id"
                          class="p-2 bg-gray-100 border border-gray-200 rounded-sm"
                        >
                          <input
                            v-model="selectedItem.flow"
                            :value="item._id"
                            :id="selectedItem.flow + '-' + item._id"
                            @change="updateFlowName(item.name)"
                            type="radio"
                            class="popup-radiobox"
                          />
                          <label
                            :for="selectedItem.flow + '-' + item._id"
                            class="popup-label ml-2"
                            >{{ item.name }}</label
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'address'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Form Config</span>
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">ชื่อ:</label>
                      <input
                        v-model="selectedItem.name"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >ประเภทที่อยู่ :</label
                      >
                      <select
                        v-model="selectedItem.inputType"
                        class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="standard">ที่อยู่มาตรฐาน</option>
                        <option value="contact">[Form] ที่อยู่สำหรับติดต่อ</option>
                        <option value="billing">[Form] ที่อยู่สำหรับออกใบเสร็จ</option>
                        <option value="tax">[Form] ที่อยู่สำหรับออกใบกำกับภาษี</option>
                        <option value="delivery">[Form] ที่อยู่สำหรับจัดส่งเอกสาร</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-5">
                    <div class="section-group">
                      <div class="flex items-center mb-2">
                        <input
                          v-model="selectedItem.required"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label font-semibold">ต้องกรอกข้อมูลนี้</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'hidden'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Form Config</span>
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">ชื่อ:</label>
                      <input
                        v-model="selectedItem.name"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">Value:</label>
                      <input
                        v-model="selectedItem.value"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'input'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Form Config</span>
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">ชื่อ:</label>
                      <input
                        v-model="selectedItem.name"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >Placeholder:</label
                      >
                      <input
                        v-model="selectedItem.placeholder"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >ข้อความเมื่อผิดพลาด:</label
                      >
                      <input
                        v-model="selectedItem.reqError"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >ประเภทฟอร์ม:</label
                      >
                      <select
                        v-model="selectedItem.inputType"
                        class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="text">Text</option>
                        <option value="password">Password</option>
                        <option value="name">[Form] Name</option>
                        <option value="email">[Form] Email</option>
                        <option value="mobile">[Form] Mobile</option>
                        <option value="taxID">[Form] Tax ID</option>
                        <option value="taxName">[Form] Tax Name</option>
                        <option value="number">Number</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >ความยาวสูงสุด:</label
                      >
                      <input
                        v-model="selectedItem.maxLength"
                        type="number"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >ความยาวขั้นต่ำ:</label
                      >
                      <input
                        v-model="selectedItem.minLength"
                        type="number"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4 mt-3">
                    <div class="section-group">
                      <div class="flex items-center mb-2">
                        <input
                          v-model="selectedItem.required"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">ต้องกรอกข้อมูลนี้</span>
                      </div>
                    </div>
                    <div class="section-group">
                      <div class="flex items-center mb-2 mb-2">
                        <input
                          v-model="selectedItem.remoteValid"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">Remote Valid</span>
                      </div>
                    </div>
                    <div class="section-group">
                      <div class="flex items-center mb-2 mb-2">
                        <input
                          v-model="selectedItem.SyncData"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">Sync Data</span>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4" v-if="selectedItem.remoteValid">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >Collection:</label
                      >
                      <input
                        v-model="selectedItem.remoteValidCollection"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">Key:</label>
                      <input
                        v-model="selectedItem.remoteValidKey"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4" v-if="selectedItem.SyncData">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >Location:</label
                      >
                      <input
                        v-model="selectedItem.SyncDataLocation"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>

                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">Key:</label>
                      <input
                        v-model="selectedItem.SyncDataKey"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'textarea'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Form Config</span>
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4 mt-5">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">ชื่อ:</label>
                      <input
                        v-model="selectedItem.name"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                      <span class="popup-helper text-gray-500 text-sm"
                        >เพิ่มชื่อเพื่อระบุข้อมูล</span
                      >
                    </div>
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >ข้อความเมื่อผิดพลาด:</label
                      >
                      <input
                        v-model="selectedItem.reqError"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                      <span class="popup-helper text-gray-500 text-sm"
                        >เพิ่มข้อความที่จะแสดงเมื่อข้อมูลไม่ถูกต้อง</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-5">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold"
                        >Placeholder:</label
                      >
                      <input
                        v-model="selectedItem.placeholder"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                      <span class="popup-helper text-gray-500 text-sm"
                        >เพิ่มข้อความแสดงตัวอย่างในช่องป้อนข้อมูล</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-5">
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">Rows:</label>
                      <input
                        v-model="selectedItem.rows"
                        type="number"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                      <span class="popup-helper text-gray-500 text-sm"
                        >กำหนดจำนวนแถวสำหรับช่องข้อมูล</span
                      >
                    </div>
                    <div class="section-group">
                      <label class="popup-label block mb-2 font-semibold">Cols:</label>
                      <input
                        v-model="selectedItem.cols"
                        type="number"
                        class="w-full popup-input rounded-sm border border-gray-200"
                      />
                      <span class="popup-helper text-gray-500 text-sm"
                        >กำหนดจำนวนคอลัมน์สำหรับช่องข้อมูล</span
                      >
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mt-5">
                    <div class="section-group">
                      <div class="flex items-center mb-2">
                        <input
                          v-model="selectedItem.required"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">ต้องกรอกข้อมูลนี้</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'radiobox'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group border-b border-gray-200 pb-3 mb-3">
                    <span class="popup-label block font-bold text-lg">Form Config</span>
                    <span class="popup-label text-gray-500"
                      >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                    >
                  </div>

                  <div class="section-group">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="popup-label block font-semibold">ชื่อ:</label>
                        <input
                          v-model="selectedItem.name"
                          type="text"
                          class="w-full popup-input rounded-sm border border-gray-200"
                        />
                      </div>
                      <div>
                        <label class="popup-label block font-semibold"
                          >ข้อความเมื่อผิดพลาด:</label
                        >
                        <input
                          v-model="selectedItem.reqError"
                          type="text"
                          class="w-full popup-input rounded-sm border border-gray-200"
                        />
                      </div>
                    </div>

                    <label class="popup-label block mt-3 mb-2 font-semibold"
                      >Radio Options:</label
                    >

                    <div
                      v-for="(option, index) in selectedItem.options"
                      :key="index"
                      class="flex items-center mb-1"
                    >
                      <div
                        :class="[
                          'border border-gray-200 flex w-full p-2',
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-200',
                        ]"
                      >
                        <!-- First column -->
                        <div class="w-full">
                          <!-- First row - Grid Layout -->
                          <div class="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <span class="popup-label block text-sm text-gray-600"
                                >{{ index + 1 }}.ชื่อตัวเลือก :
                              </span>
                              <input
                                v-model="option.label"
                                type="text"
                                class="w-full text-sm popup-input rounded-sm border border-gray-200"
                              />
                            </div>
                            <div>
                              <span class="popup-label block text-sm text-gray-600"
                                >ข้อมูล :
                              </span>
                              <input
                                v-model="option.value"
                                type="text"
                                class="w-full text-sm popup-input rounded-sm border border-gray-200"
                              />
                            </div>
                          </div>

                          <!-- Second row - Grid Layout (2 Columns) -->
                          <div class="grid grid-cols-2 gap-2 items-center">
                            <!-- Left Column - Description -->
                            <div>
                              <span class="popup-label block text-sm text-gray-600"
                                >คำอธิบาย :
                              </span>
                              <input
                                v-model="option.description"
                                type="text"
                                class="w-full text-sm popup-input rounded-sm border border-gray-200"
                              />
                            </div>

                            <!-- Right Column - Controls -->
                            <div class="flex items-center pt-5">
                              <label
                                ><input
                                  v-model="selectedItem.defaultOption"
                                  :value="index"
                                  type="radio"
                                  class="popup-radio pr-1"
                                /><span class="pl-1 text-sm">ค่าเริ่มต้น</span></label
                              >
                              <button
                                @click="deleteRadioOption(index)"
                                class="ml-2 text-red-500 hover:text-red-700 focus:outline-none text-sm"
                              >
                                <font-awesome-icon
                                  :icon="['fas', 'trash']"
                                  class="h-4 w-4"
                                />
                                ลบ
                              </button>

                              <button
                                @click="cloneRadioOption(index)"
                                class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none text-sm"
                              >
                                <font-awesome-icon
                                  :icon="['fas', 'clone']"
                                  class="h-4 w-4"
                                />
                                สำเนา
                              </button>

                              <button
                                @click="moveRadioOptionUp(index)"
                                :disabled="index === 0"
                                class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                <font-awesome-icon
                                  :icon="['fas', 'arrow-up']"
                                  class="h-4 w-4"
                                />
                              </button>
                              <button
                                @click="moveRadioOptionDown(index)"
                                :disabled="index === selectedItem.options.length - 1"
                                class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                              >
                                <font-awesome-icon
                                  :icon="['fas', 'arrow-down']"
                                  class="h-4 w-4"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      @click="addRadioOption(selectedItem)"
                      class="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                      <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
                      เพิ่มตัวเลือก
                    </button>
                  </div>
                  <div class="section-group mt-3">
                    <label class="popup-label block mb-2 font-semibold"
                      >การตั้งค่าเพิ่มเติม:</label
                    >
                    <div class="flex flex-wrap">
                      <div class="w-1/2">
                        <div class="flex items-center mb-2">
                          <input
                            v-model="selectedItem.required"
                            type="checkbox"
                            class="popup-checkbox mr-2"
                          />
                          <span class="popup-label text-sm">Required</span>
                        </div>
                      </div>
                      <div class="w-1/2">
                        <div class="flex items-center mb-2">
                          <input
                            v-model="selectedItem.inline"
                            type="checkbox"
                            class="popup-checkbox mr-2"
                          />
                          <span class="popup-label text-sm">Inline Display</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'checkbox'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Form Config</span>
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <label class="popup-label">ชื่อ:</label>
                    <input v-model="selectedItem.name" type="text" class="popup-input" />
                    <label class="popup-label">Checkbox Options:</label>
                    <div
                      v-for="(option, index) in selectedItem.options"
                      :key="index"
                      class="flex items-center mb-2"
                    >
                      <input v-model="option.value" type="text" class="popup-input" />
                      <span class="popup-label ml-2">Label:</span>
                      <input v-model="option.label" type="text" class="popup-input" />
                      <button
                        @click="deleteCheckboxOption(index)"
                        class="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
                      </button>
                      <button
                        @click="moveCheckboxOptionUp(index)"
                        :disabled="index === 0"
                        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <font-awesome-icon :icon="['fas', 'arrow-up']" class="h-4 w-4" />
                      </button>
                      <button
                        @click="moveCheckboxOptionDown(index)"
                        :disabled="index === selectedItem.options.length - 1"
                        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'arrow-down']"
                          class="h-4 w-4"
                        />
                      </button>
                      <button
                        @click="cloneCheckboxOption(index)"
                        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <font-awesome-icon :icon="['fas', 'clone']" class="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      @click="addCheckboxOption(selectedItem)"
                      class="mt-2 text-green-500 hover:text-green-700 focus:outline-none"
                    >
                      <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
                      Add Option
                    </button>
                  </div>
                  <div class="section-group">
                    <label class="popup-label">Additional Configuration:</label>
                    <div class="flex items-center mb-2">
                      <span class="popup-label">Required:</span>
                      <input
                        v-model="selectedItem.required"
                        type="checkbox"
                        class="popup-checkbox ml-2"
                      />
                    </div>
                    <div class="flex items-center mb-2">
                      <span class="popup-label">Inline Display:</span>
                      <input
                        v-model="selectedItem.inline"
                        type="checkbox"
                        class="popup-checkbox ml-2"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'select'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Form Config</span>
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <label class="popup-label">ชื่อ:</label>
                    <input v-model="selectedItem.name" type="text" class="popup-input" />

                    <label class="popup-label">ข้อความเมื่อผิดพลาด:</label>
                    <input
                      v-model="selectedItem.reqError"
                      type="text"
                      class="popup-input"
                    />

                    <label class="popup-label">Select Options:</label>
                    <div
                      v-for="(option, index) in selectedItem.options"
                      :key="index"
                      :class="index % 2 === 0 ? 'bg-gray-100' : 'bg-white'"
                      class="flex items-center p-2"
                    >
                      <input v-model="option.value" type="text" class="popup-input" />
                      <span class="popup-label ml-2">Label:</span>
                      <input v-model="option.label" type="text" class="popup-input" />
                      <button
                        @click="deleteSelectOption(index)"
                        class="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
                      </button>
                      <button
                        @click="moveSelectOptionUp(index)"
                        :disabled="index === 0"
                        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <font-awesome-icon :icon="['fas', 'arrow-up']" class="h-4 w-4" />
                      </button>
                      <button
                        @click="moveSelectOptionDown(index)"
                        :disabled="index === selectedItem.options.length - 1"
                        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'arrow-down']"
                          class="h-4 w-4"
                        />
                      </button>
                      <button
                        @click="cloneSelectOption(index)"
                        class="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        <font-awesome-icon :icon="['fas', 'clone']" class="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      @click="addSelectOption(selectedItem)"
                      class="mt-2 text-green-500 hover:text-green-700 focus:outline-none"
                    >
                      <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" />
                      Add Option
                    </button>
                  </div>
                  <div class="section-group">
                    <label class="popup-label block mb-3 font-bold text-lg"
                      >Additional Configuration:</label
                    >

                    <div class="grid grid-cols-2 gap-4">
                      <!-- Checkbox Group -->
                      <div class="flex items-center bg-gray-100 p-3 rounded-md">
                        <input
                          v-model="selectedItem.required"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">Required</span>
                      </div>

                      <div class="flex items-center bg-gray-100 p-3 rounded-md">
                        <input
                          v-model="selectedItem.multiple"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">Multiple Select</span>
                      </div>

                      <div class="flex items-center bg-gray-100 p-3 rounded-md">
                        <input
                          v-model="selectedItem.disableFirstOption"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">Disable First Option</span>
                      </div>

                      <!-- Placeholder Input -->
                      <div class="flex items-center bg-gray-100 p-3 rounded-md min-w-0">
                        <span class="popup-label flex-shrink-0 mr-2">Placeholder:</span>
                        <input
                          v-model="selectedItem.placeholder"
                          type="text"
                          class="popup-input flex-1 w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'checkout_payment'">
                <div
                  class="content-editor overflow-auto p-4"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <!-- Header Section -->
                  <div class="section-group mb-4">
                    <div class="p-4 bg-gray-100 rounded-lg shadow">
                      <h2 class="text-xl font-bold text-gray-800">
                        Payment Gateway Configuration
                      </h2>
                      <p class="text-sm text-gray-600">
                        Configure the list of payment gateways available for this form.
                      </p>
                    </div>
                  </div>

                  <!-- Add Payment Gateway Section -->
                  <div class="section-group mb-6">
                    <div class="p-4 bg-white rounded-lg shadow border">
                      <h3 class="text-lg font-semibold text-gray-800 mb-3">
                        Add New Gateway
                      </h3>

                      <div class="mb-4">
                        <label
                          class="popup-label block text-sm font-medium text-gray-700 mb-1"
                          >Gateway Name:</label
                        >
                        <input
                          v-model="newGateway.name"
                          type="text"
                          class="popup-input w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300"
                          placeholder="Enter gateway name"
                        />
                      </div>

                      <div class="mb-4">
                        <label
                          class="popup-label block text-sm font-medium text-gray-700 mb-1"
                          >Gateway Description:</label
                        >
                        <input
                          v-model="newGateway.description"
                          type="text"
                          class="popup-input w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300"
                          placeholder="Enter gateway description"
                        />
                      </div>

                      <button
                        @click="addPaymentGateway"
                        class="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
                      >
                        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4 mr-2" />
                        Add Gateway
                      </button>
                    </div>
                  </div>

                  <!-- Gateway List Section -->
                  <div class="section-group">
                    <div class="p-4 bg-white rounded-lg shadow border">
                      <h3 class="text-lg font-semibold text-gray-800 mb-3">
                        Gateway List
                      </h3>

                      <ul>
                        <li
                          v-for="(gateway, index) in selectedItem.gateways"
                          :key="index"
                          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3 border hover:shadow"
                        >
                          <div>
                            <h4 class="text-sm font-semibold text-gray-800">
                              {{ gateway.name }}
                            </h4>
                            <p class="text-xs text-gray-600">{{ gateway.description }}</p>
                          </div>

                          <button
                            @click="deletePaymentGateway(index)"
                            class="text-red-500 hover:text-red-700 focus:outline-none"
                            title="Delete Gateway"
                          >
                            <font-awesome-icon :icon="['fas', 'times']" class="h-5 w-5" />
                          </button>
                        </li>
                      </ul>

                      <div
                        v-if="
                          !selectedItem.gateways || selectedItem.gateways.length === 0
                        "
                        class="text-sm text-gray-500 text-center"
                      >
                        No gateways added yet. Use the form above to add a new gateway.
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4 mt-3">
                    <div class="section-group">
                      <div class="flex items-center mb-2">
                        <input
                          v-model="selectedItem.required"
                          type="checkbox"
                          class="popup-checkbox mr-2"
                        />
                        <span class="popup-label">ต้องกรอกข้อมูลนี้</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'navigation'">
                <div
                  class="content-editor overflow-auto min-h-[600px] max-h-[600px] scrollbar-thin scrollbar-transparent right-[-20px]"
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Navigation Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >แสดงเนื้อหานี้ในหน้าจอของอุปกรณ์</span
                      >
                    </div>
                  </div>
                  <div class="section-group">
                    <label class="popup-label block mb-3 font-semibold"
                      >เลือกเมนูที่ต้องการใช้งาน :</label
                    >
                    <div class="grid grid-cols-2 gap-2">
                      <div
                        v-for="item in menuItems"
                        :key="item._id"
                        class="p-2 bg-gray-100 border border-gray-200 rounded-sm"
                      >
                        <input
                          v-model="selectedItem.menu"
                          :value="item._id"
                          :id="selectedItem.menu + '-' + item._id"
                          @change="updateMenuName(item.title)"
                          type="radio"
                          class="popup-radiobox"
                        />
                        <label
                          :for="selectedItem.menu + '-' + item._id"
                          class="popup-label ml-2"
                          >{{ item.title }}</label
                        >
                      </div>
                    </div>
                  </div>

                  <div class="section-group mt-5 pt-3 border-t border-gray-100">
                    <label class="popup-label block mb-3 font-semibold"
                      >Style Configuration:</label
                    >
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <label class="popup-label">Text Alignment:</label>
                        <select
                          v-model="selectedItem.alignment"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div>
                        <label class="popup-label">Display:</label>
                        <select
                          v-model="selectedItem.display"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        >
                          <option value="horizontal">Horizontal</option>
                          <option value="vertical">Vertical</option>
                        </select>
                      </div>

                      <div>
                        <label class="popup-label">Font Size: (px)</label>
                        <input
                          v-model="selectedItem.fontSize"
                          type="number"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-3 mt-3 gap-2">
                      <div>
                        <label class="popup-label block">Font Color: </label>
                        <ColorPicker
                          :defaultColor="selectedItem.fontColor"
                          @selectColor="handlefontColorSelection"
                          class="w-full"
                        />
                        <div
                          class="selected-color"
                          :style="{ background: selectedItem.fontColor }"
                        ></div>
                      </div>

                      <div>
                        <label class="popup-label block">Hover Color: </label>
                        <ColorPicker
                          :defaultColor="selectedItem.hoverColor"
                          @selectColor="handlehoverColorSelection"
                          class="w-full"
                        />
                        <div
                          class="selected-color"
                          :style="{ background: selectedItem.hoverColor }"
                        ></div>
                      </div>

                      <div>
                        <label class="popup-label">Menu Item Space:</label>
                        <input
                          v-model="selectedItem.itemSpace"
                          type="number"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'row'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg">Row Config</span>
                      <span class="popup-label text-gray-500"
                        >ตั่งค่าการแสดงผลของแถวแนวนอน</span
                      >
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                      <div class="section-group mt-3">
                        <label class="popup-label block font-semibold"
                          >Visible : {{ selectedItem.visible }}</label
                        >
                        <div class="grid grid-cols-3 gap-4 mt-3">
                          <label class="popup-label">การแสดงผล :</label>
                          <div class="grid grid-cols-2">
                            <div>
                              <input
                                type="radio"
                                id="visible-show"
                                :value="true"
                                v-model="selectedItem.visible"
                              />
                              <label for="visible-show" class="ml-1">Show</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                id="visible-hide"
                                :value="false"
                                v-model="selectedItem.visible"
                              />
                              <label for="visible-hide" class="ml-1">Hide</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="section-group mt-3">
                        <label class="popup-label block font-semibold">Data Set :</label>
                        <div class="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <label class="popup-label font-medium">Mode:</label>
                            <select
                              v-model="selectedItem.dataMode"
                              class="popup-select w-full mb-3 rounded-sm border border-gray-200"
                            >
                              <option value="standalone">Standalone</option>
                              <option value="set">Set</option>
                            </select>
                          </div>
                          <template v-if="selectedItem.dataMode === 'set'">
                            <div class="w-full">
                              <label class="popup-label font-medium">Set Name:</label>
                              <input
                                v-model="selectedItem.dataSetName"
                                type="text"
                                class="popup-input w-full mb-3 rounded-sm border border-gray-200"
                              />
                            </div>
                            <div class="w-full">
                              <label class="popup-label font-medium">Set Limit:</label>
                              <input
                                v-model="selectedItem.dataSetLimit"
                                type="text"
                                class="popup-input w-full mb-3 rounded-sm border border-gray-200"
                              />
                            </div>
                          </template>
                        </div>
                      </div>

                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >วิธีการแสดงผล (Mode)</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.mode === 'standard' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png"
                                alt="Unset"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.mode"
                              value="standard "
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500"
                              >Standard</span
                            >
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.mode === 'tab' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png"
                                alt="Block"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.mode"
                              value="tab"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Tab</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.mode === 'accordion' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.mode"
                              value="accordion"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500"
                              >Accordion</span
                            >
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >การแสดงผลของแถวแนวนอน (Row)</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.sz === 'unset' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png"
                                alt="Unset"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.sz"
                              value="unset"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Unset</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.sz === 'block' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png"
                                alt="Block"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.sz"
                              value="block"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Block</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.sz === 'w-full' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.sz"
                              value="w-full"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500"
                              >Full Width</span
                            >
                          </label>
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div class="section-group">
                          <label class="popup-label block mb-2 pb-2 font-semibold"
                            >การแสดงผลของเนื้อหาด้านใน (Inner)</label
                          >
                          <div class="grid grid-cols-3 gap-2">
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.bsz === 'unset' }"
                            >
                              <span>
                                <img
                                  src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png"
                                  alt="Unset"
                                  class="w-10 h-10 mb-2"
                                />
                              </span>
                              <input
                                type="radio"
                                v-model="selectedItem.bsz"
                                value="unset"
                                class="radio-input hidden"
                              />
                              <span class="text-center text-sm text-gray-500">Unset</span>
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.bsz === 'block' }"
                            >
                              <span>
                                <img
                                  src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png"
                                  alt="Block"
                                  class="w-10 h-10 mb-2"
                                />
                              </span>
                              <input
                                type="radio"
                                v-model="selectedItem.bsz"
                                value="block"
                                class="radio-input hidden"
                              />
                              <span class="text-center text-sm text-gray-500">Block</span>
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.bsz === 'w-full' }"
                            >
                              <span>
                                <img
                                  src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png"
                                  alt="Full Width"
                                  class="w-10 h-10 mb-2"
                                />
                              </span>
                              <input
                                type="radio"
                                v-model="selectedItem.bsz"
                                value="w-full"
                                class="radio-input hidden"
                              />
                              <span class="text-center text-sm text-gray-500"
                                >Full Width</span
                              >
                            </label>
                          </div>
                        </div>

                        <div class="section-group">
                          <label class="popup-label block mb-2 pb-2 font-semibold"
                            >ความกว้าง (Inner)</label
                          >
                          <label class="popup-label font-medium">Width:</label>
                          <select
                            v-model="selectedItem.width"
                            class="popup-select w-full mb-3 rounded-sm border border-gray-200"
                          >
                            <option value="max-w-full">100%</option>
                            <option value="max-w-7xl">70%</option>
                            <option value="max-w-6xl">60%</option>
                            <option value="max-w-5xl">50%</option>
                            <option value="max-w-4xl">40%</option>
                            <option value="max-w-3xl">30%</option>
                            <option value="max-w-2xl">20%</option>
                            <option value="max-w-xl">10%</option>
                          </select>
                        </div>

                        <!-- Row Alignment -->
                        <div class="section-group mt-3">
                          <label class="popup-label block font-semibold"
                            >Row Alignment</label
                          >
                          <div class="grid grid-cols-3 gap-4 mt-3">
                            <label
                              v-for="alignment in ['left', 'center', 'right']"
                              :key="alignment"
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{
                                'bg-gray-200': selectedItem.alignment === alignment,
                              }"
                              @click="selectedItem.alignment = alignment"
                            >
                              <input
                                type="radio"
                                v-model="selectedItem.alignment"
                                :value="alignment"
                                class="radio-input hidden"
                              />
                              <span class="text-center text-sm text-gray-500">{{
                                alignment
                              }}</span>
                            </label>
                          </div>
                        </div>

                        <!-- Configuration for row height -->
                        <div class="section-group">
                          <label class="popup-label block mb-2 pb-2 font-semibold"
                            >ความสูงของแถว (Row Height)</label
                          >
                          <div class="grid grid-cols-4 gap-2">
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-96' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-96</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-96"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-80' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-80</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-80"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-64' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-64</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-64"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-48' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-48</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-48"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-40' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-40</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-40"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-32' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-32</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-32"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-24' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-24</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-24"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-12' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-12</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-12"
                                class="radio-input hidden"
                              />
                            </label>

                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-10' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-10</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-10"
                                class="radio-input hidden"
                              />
                            </label>

                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-8' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-8</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-8"
                                class="radio-input hidden"
                              />
                            </label>
                            <label
                              class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                              :class="{ 'bg-gray-200': selectedItem.height === 'h-6' }"
                            >
                              <span class="text-center text-sm text-gray-500">h-6</span>
                              <input
                                type="radio"
                                v-model="selectedItem.height"
                                value="h-6"
                                class="radio-input hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >จำนวนแถวแนวตั้ง (Column)</label
                        >
                        <div class="grid grid-cols-6 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.col === '1' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/1png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.col"
                              value="1"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">1</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.col === '2' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/2png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.col"
                              value="2"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">2</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.col === '3' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/3png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.col"
                              value="3"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">3</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.col === '4' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/4png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.col"
                              value="4"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">4</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.col === '5' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/5png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.col"
                              value="5"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">5</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.col === '6' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/6png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.col"
                              value="6"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">6</span>
                          </label>
                        </div>
                      </div>

                      <div class="section-group" v-if="selectedItem.tablet">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >จำนวนแถวแนวตั้ง (Column) Tablet</label
                        >
                        <div class="grid grid-cols-6 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colTablet === '1' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/1png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colTablet"
                              value="1"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">1</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colTablet === '2' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/2png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colTablet"
                              value="2"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">2</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colTablet === '3' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/3png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colTablet"
                              value="3"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">3</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colTablet === '4' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/4png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colTablet"
                              value="4"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">4</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colTablet === '5' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/5png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colTablet"
                              value="5"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">5</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colTablet === '6' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/6png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colTablet"
                              value="6"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">6</span>
                          </label>
                        </div>
                      </div>

                      <div class="section-group" v-if="selectedItem.mobile">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >จำนวนแถวแนวตั้ง (Column) Mobile</label
                        >
                        <div class="grid grid-cols-6 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colMobile === '1' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/1png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colMobile"
                              value="1"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">1</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colMobile === '2' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/2png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colMobile"
                              value="2"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">2</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colMobile === '3' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/3png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colMobile"
                              value="3"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">3</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colMobile === '4' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/4png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colMobile"
                              value="4"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">4</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colMobile === '5' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/5png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colMobile"
                              value="5"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">5</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{ 'bg-gray-200': selectedItem.colMobile === '6' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/6png.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colMobile"
                              value="6"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">6</span>
                          </label>
                        </div>
                      </div>

                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >ช่องว่าง Column (Gap)</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                          <input
                            v-model="selectedItem.gapSize"
                            type="number"
                            class="popup-input w-full rounded-sm border border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else-if="selectedItem.type === 'column'">
                <div
                  class="content-editor overflow-auto"
                  style="
                    min-height: 600px;
                    max-height: 600px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                    right: -20px;
                  "
                >
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Column Config</span
                      >
                      <span class="popup-label block text-gray-500"
                        >ตั้งค่าการแสดงผลของแถวแนวตั้ง</span
                      >

                      <div class="border-t border-gray-200 pt-2 mt-2">
                        <span class="popup-label block text-gray-400 text-sm"
                          ><span class="text-gray-800 font-bold">Column UID</span> :
                          {{ selectedItem.uid }}</span
                        >
                      </div>
                    </div>
                    <div class="grid grid-cols-1 gap-4">
                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >การแสดงผลของแถว (Column)</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.sz === 'unset' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png"
                                alt="Unset"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.sz"
                              value="unset"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Unset</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.sz === 'block' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png"
                                alt="Block"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.sz"
                              value="block"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Block</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.sz === 'w-full' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.sz"
                              value="w-full"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500"
                              >Full Width</span
                            >
                          </label>
                        </div>
                      </div>

                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >ความกว้างของแถวแนวตั้ง (Column)</label
                        >
                        <div class="grid grid-cols-6 gap-2">
                          <label
                            v-for="col in parseInt(this.rows[this.lightboxRowIndex].col)"
                            :key="col"
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm hover:bg-gray-200"
                            :class="{
                              'bg-gray-200': selectedItem.colspan === col.toString(),
                            }"
                          >
                            <span>
                              <img
                                :src="
                                  'https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/' +
                                  col +
                                  'png.png'
                                "
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.colspan"
                              :value="col.toString()"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">{{
                              col
                            }}</span>
                          </label>
                        </div>
                      </div>

                      <div class="section-group mt-3">
                        <label class="popup-label block font-semibold"
                          >Column Alignment</label
                        >
                        <div class="grid grid-cols-3 gap-4 mt-3">
                          <label
                            v-for="alignment in ['left', 'center', 'right']"
                            :key="alignment"
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{
                              'bg-gray-200': selectedItem.alignment === alignment,
                            }"
                            @click="selectedItem.alignment = alignment"
                          >
                            <input
                              type="radio"
                              v-model="selectedItem.alignment"
                              :value="alignment"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">{{
                              alignment
                            }}</span>
                          </label>
                        </div>
                      </div>

                      <div class="section-group mt-3">
                        <label class="popup-label block font-semibold">Inline</label>
                        <div class="flex items-center mt-3">
                          <span class="mr-2">Inline:</span>
                          <input
                            type="checkbox"
                            v-model="selectedItem.inline"
                            class="checkbox-input"
                          />
                        </div>
                      </div>

                      <div class="section-group mt-3">
                        <label class="popup-label block font-semibold">Spacing</label>
                        <div class="flex items-center mt-3">
                          <span class="mr-2">Spacing:</span>
                          <select v-model="selectedItem.spacing" class="select-input">
                            <option value="none">None</option>
                            <option value="space">Space</option>
                            <option value="margin">Margin</option>
                            <option value="padding">Padding</option>
                          </select>
                        </div>
                      </div>

                      <div class="section-group">
                        <label class="popup-label block mb-2 pb-2 font-semibold"
                          >การแสดงผลของเนื้อหาด้านใน (Innner)</label
                        >
                        <div class="grid grid-cols-3 gap-2">
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.bsz === 'unset' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/unsetpng.png"
                                alt="Unset"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.bsz"
                              value="unset"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Unset</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.bsz === 'block' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/blockpng.png"
                                alt="Block"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.bsz"
                              value="block"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500">Block</span>
                          </label>
                          <label
                            class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                            :class="{ 'bg-gray-200': selectedItem.bsz === 'w-full' }"
                          >
                            <span>
                              <img
                                src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/w-fullpng.png"
                                alt="Full Width"
                                class="w-10 h-10 mb-2"
                              />
                            </span>
                            <input
                              type="radio"
                              v-model="selectedItem.bsz"
                              value="w-full"
                              class="radio-input hidden"
                            />
                            <span class="text-center text-sm text-gray-500"
                              >Full Width</span
                            >
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div v-else-if="activeTab === 'style'" class="tab-content">
              <div
                class="content-editor overflow-auto"
                style="
                  min-height: 600px;
                  max-height: 600px;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                  right: -20px;
                "
              >
                <div class="section-group">
                  <div class="border-b border-gray-200 pb-3 mb-3">
                    <span class="popup-label block font-bold text-lg">Style Config</span>
                    <span class="popup-label text-gray-500"
                      >ตั้งค่าการแสดงผลของเนื้อหา</span
                    >
                  </div>
                </div>

                <div class="section-group mt-3">
                  <label class="popup-label block mb-2 pb-2 font-semibold"
                    >ตำแหน่งของวัตถุ (Position)</label
                  >
                  <div class="grid grid-cols-4 gap-2">
                    <label
                      class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                      :class="{ 'bg-gray-200': selectedItem.position === 'static' }"
                    >
                      <span>
                        <img
                          src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/staticpng.png"
                          alt="Unset"
                          class="w-10 h-10 mb-2"
                        />
                      </span>
                      <input
                        type="radio"
                        v-model="selectedItem.position"
                        value="static"
                        class="radio-input hidden"
                      />
                      <span class="text-center text-sm text-gray-500">Static</span>
                    </label>
                    <label
                      class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                      :class="{ 'bg-gray-200': selectedItem.position === 'relative' }"
                    >
                      <span>
                        <img
                          src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/relativepng.png"
                          alt="Block"
                          class="w-10 h-10 mb-2"
                        />
                      </span>
                      <input
                        type="radio"
                        v-model="selectedItem.position"
                        value="relative"
                        class="radio-input hidden"
                      />
                      <span class="text-center text-sm text-gray-500">Relative</span>
                    </label>
                    <label
                      class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                      :class="{ 'bg-gray-200': selectedItem.position === 'absolute' }"
                    >
                      <span>
                        <img
                          src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/absolutepng.png"
                          alt="Full Width"
                          class="w-10 h-10 mb-2"
                        />
                      </span>
                      <input
                        type="radio"
                        v-model="selectedItem.position"
                        value="absolute"
                        class="radio-input hidden"
                      />
                      <span class="text-center text-sm text-gray-500">Absolute</span>
                    </label>
                    <label
                      class="radio-label p-2 flex flex-col items-center justify-center cursor-pointer border border-gray-300 rounded-sm"
                      :class="{ 'bg-gray-200': selectedItem.position === 'fixed' }"
                    >
                      <span>
                        <img
                          src="https://vue-project.sgp1.digitaloceanspaces.com/ui-icon/fixedpng.png"
                          alt="Full Width"
                          class="w-10 h-10 mb-2"
                        />
                      </span>
                      <input
                        type="radio"
                        v-model="selectedItem.position"
                        value="fixed"
                        class="radio-input hidden"
                      />
                      <span class="text-center text-sm text-gray-500">Fixed</span>
                    </label>
                  </div>
                </div>

                <div class="section-group mt-3">
                  <label class="popup-label block font-semibold">Background</label>
                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label class="popup-label font-medium">Background Type:</label>
                      <select
                        v-model="selectedItem.bgType"
                        class="popup-select w-full mb-3 rounded-sm border border-gray-200"
                      >
                        <option value="none">None</option>
                        <option value="color">Color</option>
                        <option value="image">Image</option>
                        <option value="gradient">Gradient</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <div v-if="selectedItem.bgType === 'color'">
                        <div class="relative">
                          <label class="block popup-label">Color:</label>
                          <input
                            v-model="selectedItem.bgColor"
                            type="text"
                            class="w-full popup-input rounded-sm border border-gray-200"
                            @click="showColorPicker('bgColor')"
                          />
                          <div v-if="showColorPickerField === 'bgColor'">
                            <input
                              class="absolute right-2 top-[32px] w-35 h-35"
                              type="color"
                              v-model="selectedItem.bgColor"
                              @input="updateColor('bgColor')"
                              @click.stop
                            />
                          </div>
                        </div>
                      </div>

                      <div v-else-if="selectedItem.bgType === 'image'">
                        <label class="block popup-label">Image URL:</label>
                        <input
                          v-model="selectedItem.bgImage"
                          type="text"
                          class="w-full popup-input rounded-sm border border-gray-200"
                        />
                      </div>
                      <div
                        v-else-if="selectedItem.bgType === 'gradient'"
                        class="grid grid-cols-2 gap-4"
                      >
                        <div class="relative">
                          <label class="block popup-label">Gradient Color 1:</label>
                          <input
                            v-model="selectedItem.bgGradientColor1"
                            type="text"
                            class="w-full popup-input rounded-sm border border-gray-200"
                            @click="showColorPicker('bgGradientColor1')"
                          />
                          <div v-if="showColorPickerField === 'bgGradientColor1'">
                            <input
                              class="absolute right-2 top-[32px] w-35 h-35"
                              type="color"
                              v-model="selectedItem.bgGradientColor1"
                              @input="updateColor('bgGradientColor1')"
                              @click.stop
                            />
                          </div>
                        </div>
                        <div class="relative">
                          <label class="block popup-label">Gradient Color 2:</label>
                          <input
                            v-model="selectedItem.bgGradientColor2"
                            type="text"
                            class="w-full popup-input rounded-sm border border-gray-200"
                            @click="showColorPicker('bgGradientColor2')"
                          />
                          <div v-if="showColorPickerField === 'bgGradientColor2'">
                            <input
                              class="absolute right-2 top-[32px] w-35 h-35"
                              type="color"
                              v-model="selectedItem.bgGradientColor2"
                              @input="updateColor('bgGradientColor2')"
                              @click.stop
                            />
                          </div>
                        </div>
                      </div>

                      <div v-else-if="selectedItem.bgType === 'video'">
                        <label class="block popup-label">Video URL:</label>
                        <input
                          v-model="selectedItem.bgVideo"
                          type="text"
                          class="w-full popup-input rounded-sm border border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section-group mt-3" v-if="selectedItem.type === 'row'">
                  <label class="popup-label block font-semibold">Inner Background</label>
                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label class="popup-label font-medium">Background Type:</label>
                      <select
                        v-model="selectedItem.bgInnerType"
                        class="popup-select w-full mb-3 rounded-sm border border-gray-200"
                      >
                        <option value="none">None</option>
                        <option value="color">Color</option>
                        <option value="image">Image</option>
                        <option value="gradient">Gradient</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <div v-if="selectedItem.bgInnerType === 'color'">
                        <div class="relative">
                          <label class="block popup-label">Color:</label>
                          <input
                            v-model="selectedItem.bgInnerColor"
                            type="text"
                            class="w-full popup-input rounded-sm border border-gray-200"
                            @click="showColorPicker('bgInnerColor')"
                          />
                          <div v-if="showColorPickerField === 'bgInnerColor'">
                            <input
                              class="absolute right-2 top-[32px] w-35 h-35"
                              type="color"
                              v-model="selectedItem.bgInnerColor"
                              @input="updateColor('bgInnerColor')"
                              @click.stop
                            />
                          </div>
                        </div>
                      </div>

                      <div v-else-if="selectedItem.bgInnerType === 'image'">
                        <label class="block popup-label">Image URL:</label>
                        <input
                          v-model="selectedItem.bgInnerImage"
                          type="text"
                          class="w-full popup-input rounded-sm border border-gray-200"
                        />
                      </div>
                      <div
                        v-else-if="selectedItem.bgInnerType === 'gradient'"
                        class="grid grid-cols-2 gap-4"
                      >
                        <div class="relative">
                          <label class="block popup-label">Gradient Color 1:</label>
                          <input
                            v-model="selectedItem.bgInnerGradientColor1"
                            type="text"
                            class="w-full popup-input rounded-sm border border-gray-200"
                            @click="showColorPicker('bgInnerGradientColor1')"
                          />
                          <div v-if="showColorPickerField === 'bgInnerGradientColor1'">
                            <input
                              class="absolute right-2 top-[32px] w-35 h-35"
                              type="color"
                              v-model="selectedItem.bgInnerGradientColor1"
                              @input="updateColor('bgInnerGradientColor1')"
                              @click.stop
                            />
                          </div>
                        </div>
                        <div class="relative">
                          <label class="block popup-label">Gradient Color 2:</label>
                          <input
                            v-model="selectedItem.bgInnerGradientColor2"
                            type="text"
                            class="w-full popup-input rounded-sm border border-gray-200"
                            @click="showColorPicker('bgInnerGradientColor2')"
                          />
                          <div v-if="showColorPickerField === 'bgInnerGradientColor2'">
                            <input
                              class="absolute right-2 top-[32px] w-35 h-35"
                              type="color"
                              v-model="selectedItem.bgInnerGradientColor2"
                              @input="updateColor('bgInnerGradientColor2')"
                              @click.stop
                            />
                          </div>
                        </div>
                      </div>

                      <div v-else-if="selectedItem.bgInnerType === 'video'">
                        <label class="block popup-label">Video URL:</label>
                        <input
                          v-model="selectedItem.bgInnerVideo"
                          type="text"
                          class="w-full popup-input rounded-sm border border-gray-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section-group">
                  <label class="popup-label block font-semibold">Border</label>
                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label class="popup-label block font-medium">Style:</label>
                      <select
                        v-model="selectedItem.borderStyle"
                        class="w-full popup-select rounded-sm border border-gray-200"
                      >
                        <option value="none">None</option>
                        <option value="solid">Solid</option>
                        <option value="dotted">Dotted</option>
                        <option value="dashed">Dashed</option>
                        <option value="double">Double</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    <div class="relative">
                      <label class="block popup-label">Color:</label>
                      <input
                        v-model="selectedItem.borderColor"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        @click="showColorPicker('borderColor')"
                      />
                      <div v-if="borderStyle != 'None'">
                        <input
                          class="absolute right-2 top-[32px] w-35 h-35"
                          type="color"
                          v-model="selectedItem.borderColor"
                          @input="updateColor('borderColor')"
                          @click.stop
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="section-group mt-3">
                  <label class="popup-label font-semibold">Width</label>
                  <div class="grid grid-cols-4 gap-2">
                    <div>
                      <label class="block popup-label">Left:</label>
                      <input
                        v-model="selectedItem.borderLeftWidth"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Left Width"
                      />
                    </div>
                    <div>
                      <label class="block popup-label">Top:</label>
                      <input
                        v-model="selectedItem.borderTopWidth"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Top Width"
                      />
                    </div>
                    <div>
                      <label class="block popup-label">Right:</label>
                      <input
                        v-model="selectedItem.borderRightWidth"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Right Width"
                      />
                    </div>
                    <div>
                      <label class="block popup-label">Bottom:</label>
                      <input
                        v-model="selectedItem.borderBottomWidth"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Bottom Width"
                      />
                    </div>
                  </div>
                </div>

                <div class="section-group mt-3">
                  <label class="popup-label font-semibold">Radius</label>
                  <div class="grid grid-cols-4 gap-2">
                    <div>
                      <label class="block popup-label">Top Left:</label>
                      <input
                        v-model="selectedItem.borderRadiusTopLeft"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Top Left Radius"
                      />
                    </div>
                    <div>
                      <label class="block popup-label">Top Right:</label>
                      <input
                        v-model="selectedItem.borderRadiusTopRight"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Top Right Radius"
                      />
                    </div>
                    <div>
                      <label class="block popup-label">Bottom Right:</label>
                      <input
                        v-model="selectedItem.borderRadiusBottomRight"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Bottom Right Radius"
                      />
                    </div>
                    <div>
                      <label class="block popup-label">Bottom Left:</label>
                      <input
                        v-model="selectedItem.borderRadiusBottomLeft"
                        type="text"
                        class="w-full popup-input rounded-sm border border-gray-200"
                        placeholder="Bottom Left Radius"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'options'" class="tab-content">
              <div
                class="content-editor overflow-auto"
                style="
                  min-height: 600px;
                  max-height: 600px;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                  right: -20px;
                "
              >
                <div class="section-group">
                  <div class="border-b border-gray-200 pb-3 mb-3">
                    <span class="popup-label block font-bold text-lg">Option Config</span>
                    <span class="popup-label text-gray-500"
                      >ตั้งค่าช่องว่างและระยะห่างของเนื้อหา</span
                    >
                  </div>

                  <div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="popup-label font-semibold">Custom ID</label>
                        <input
                          v-model="selectedItem.customId"
                          type="text"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        />
                      </div>
                      <div>
                        <label class="popup-label font-semibold">Custom Class:</label>
                        <input
                          v-model="selectedItem.customClass"
                          type="text"
                          class="popup-input w-full rounded-sm border border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  <label class="popup-label block mt-5 font-semibold">Padding</label>
                  <div class="grid grid-cols-5 gap-2">
                    <div>
                      <label class="block popup-label">
                        <input type="checkbox" v-model="setAllPadding" /> Set All
                      </label>
                    </div>
                    <div v-if="!setAllPadding">
                      <label class="block popup-label">Left:</label>
                      <input
                        v-model="selectedItem.paddingLeft"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Padding Left"
                      />
                    </div>
                    <div v-if="!setAllPadding">
                      <label class="block popup-label">Top:</label>
                      <input
                        v-model="selectedItem.paddingTop"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Padding Top"
                      />
                    </div>
                    <div v-if="!setAllPadding">
                      <label class="block popup-label">Right:</label>
                      <input
                        v-model="selectedItem.paddingRight"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Padding Right"
                      />
                    </div>
                    <div v-if="!setAllPadding">
                      <label class="block popup-label">Bottom:</label>
                      <input
                        v-model="selectedItem.paddingBottom"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Padding Bottom"
                      />
                    </div>
                    <div v-else class="col-span-2">
                      <label class="block popup-label">All Padding</label>
                      <input
                        v-model="paddingValue"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Padding All"
                      />
                    </div>
                  </div>
                </div>

                <div class="section-group mt-5 mb-5">
                  <label class="popup-label mt-3 mb-3 font-semibold">Margin</label>
                  <div class="grid grid-cols-5 gap-2">
                    <div>
                      <label class="block popup-label">
                        <input type="checkbox" v-model="setAllMargin" /> Set All
                      </label>
                    </div>

                    <div v-if="!setAllMargin">
                      <label class="block popup-label">Left:</label>
                      <input
                        v-model="selectedItem.marginLeft"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Margin Left"
                      />
                    </div>
                    <div v-if="!setAllMargin">
                      <label class="block popup-label">Top:</label>
                      <input
                        v-model="selectedItem.marginTop"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Margin Top"
                      />
                    </div>
                    <div v-if="!setAllMargin">
                      <label class="block popup-label">Right:</label>
                      <input
                        v-model="selectedItem.marginRight"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Margin Right"
                      />
                    </div>
                    <div v-if="!setAllMargin">
                      <label class="block popup-label">Bottom:</label>
                      <input
                        v-model="selectedItem.marginBottom"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Margin Bottom"
                      />
                    </div>
                    <div v-else class="col-span-2">
                      <label class="block popup-label">All Margin</label>
                      <input
                        v-model="marginValue"
                        type="text"
                        class="w-full popup-input text-sm rounded-sm border border-gray-200"
                        placeholder="Margin All"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="selectedItem.type === 'row'">
                  <div class="section-group">
                    <div class="border-b border-gray-200 pb-3 mb-3">
                      <span class="popup-label block font-bold text-lg"
                        >Option Config</span
                      >
                      <span class="popup-label text-gray-500"
                        >ตั้งค่าช่องว่างและระยะห่างของเนื้อหาด้านใน</span
                      >
                    </div>
                    <label class="popup-label mt-5 font-semibold">Padding</label>

                    <div class="grid grid-cols-5 gap-2">
                      <div>
                        <label class="block popup-label">
                          <input type="checkbox" v-model="setAllInnerPadding" /> Set All
                        </label>
                      </div>

                      <div v-if="!setAllInnerPadding">
                        <label class="block popup-label">Left:</label>
                        <input
                          v-model="selectedItem.paddingInnerLeft"
                          type="text"
                          class="w-full popup-input text-sm rounded-sm border border-gray-200"
                          placeholder="Padding Left"
                        />
                      </div>
                      <div v-if="!setAllInnerPadding">
                        <label class="block popup-label">Top:</label>
                        <input
                          v-model="selectedItem.paddingInnerTop"
                          type="text"
                          class="w-full popup-input text-sm rounded-sm border border-gray-200"
                          placeholder="Padding Top"
                        />
                      </div>
                      <div v-if="!setAllInnerPadding">
                        <label class="block popup-label">Right:</label>
                        <input
                          v-model="selectedItem.paddingInnerRight"
                          type="text"
                          class="w-full popup-input text-sm rounded-sm border border-gray-200"
                          placeholder="Padding Right"
                        />
                      </div>
                      <div v-if="!setAllInnerPadding">
                        <label class="block popup-label">Bottom:</label>
                        <input
                          v-model="selectedItem.paddingInnerBottom"
                          type="text"
                          class="w-full popup-input text-sm rounded-sm border border-gray-200"
                          placeholder="Padding Bottom"
                        />
                      </div>
                      <div v-else class="col-span-2">
                        <label class="block popup-label">All Inner Padding</label>
                        <input
                          v-model="selectedItem.paddingInnerBottom"
                          type="text"
                          class="w-full popup-input text-sm rounded-sm border border-gray-200"
                          placeholder="Padding All"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeTab === 'logic'" class="tab-content">
              <div
                class="content-editor overflow-auto"
                style="
                  min-height: 600px;
                  max-height: 600px;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                  right: -20px;
                "
              >
                <div class="border-b border-gray-200 pb-3 mb-3">
                  <span class="popup-label block font-bold text-lg">Logic Config</span>
                  <span class="popup-label text-gray-500"
                    >การตั้งค่าเงื่อนไขการแดสงผลจาก Element</span
                  >
                  <!-- <pre>{{ selectedItem.logics }} | {{selectedItem.logics.some(logic => logic.hasOwnProperty('request'))}}</pre> -->
                </div>

                <template
                  v-if="
                    !selectedItem.logics ||
                    !selectedItem.logics.some((logic) => logic.hasOwnProperty('request'))
                  "
                >
                  <div class="mt-5">
                    <div class="grid grid-cols-3 gap-1 text-center">
                      <div class="bg-blue-200 pb-2 pl-2 pr-2 pt-2 mb-1 font-bold">
                        เมื่อเลือกตัวเลือกนี้
                      </div>
                      <div class="bg-blue-200 pb-2 pl-2 pr-2 pt-2 mb-1 font-bold">
                        กำหนดให้ฟอร์มนี้
                      </div>
                      <div class="bg-blue-200 pb-2 pl-2 pr-2 pt-2 mb-1 font-bold">
                        แสดงผลตามเงื่อนไข
                      </div>
                    </div>
                    <div
                      v-for="(logicItem, index) in selectedItem.logics"
                      :key="logicItem.uid"
                      class="grid grid-cols-3 gap-1"
                    >
                      <div class="bg-gray-100 p-2 mb-1">
                        <div class="flex items-center">
                          <button
                            @click="deleteLogicItem(index, logicItem)"
                            class="mr-2 bg-red-500 hover:bg-red-700 w-5 h-5 text-xs rounded delete-slide-btn"
                          >
                            <font-awesome-icon
                              :icon="['fas', 'times']"
                              class="h-3 w-3 text-white"
                            />
                          </button>

                          <template v-if="!logicItem.default">
                            <select
                              v-model="logicItem.default"
                              class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            >
                              <option value="" disabled>เลือกตัวเลือก</option>
                              <option
                                v-for="option in selectedItem.options"
                                :value="option.value"
                                :key="option.value"
                                :disabled="logicItem.default !== ''"
                              >
                                {{ option.label }}
                              </option>
                            </select>
                          </template>
                          <template v-else>
                            <input
                              :value="getSelectedOptionLabel(logicItem.default)"
                              class="p-2 w-full bg-white border rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              disabled
                            />
                          </template>
                        </div>
                      </div>

                      <div v-if="logicItem.default" class="bg-gray-100 p-2 mb-1">
                        <template v-if="!logicItem.destination">
                          <select
                            v-model="logicItem.destination"
                            class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          >
                            <option value="" disabled>เลือกเป้าหมาย</option>
                            <option
                              v-for="option in getAllBuilderOptions()"
                              :value="option"
                              :key="option.name"
                            >
                              {{ option.name }}
                            </option>
                          </select>
                        </template>
                        <template v-else>
                          <input
                            v-model="logicItem.destination.name"
                            class="p-2 w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            disabled
                          />
                        </template>
                      </div>

                      <div v-if="logicItem.destination" class="bg-gray-100 p-2 mb-1">
                        <template v-if="!logicItem.method">
                          <select
                            v-model="logicItem.method"
                            class="w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            @change="addLogicItem(logicItem, selectedItem)"
                          >
                            <option value="" disabled>เลือกเงื่อนไข</option>
                            <option value="show">แสดง</option>
                            <option value="hide">ซ่อน</option>
                          </select>
                        </template>
                        <template v-else>
                          <input
                            v-model="logicItem.method"
                            class="p-2 w-full rounded-sm border border-gray-300 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            disabled
                          />
                        </template>
                      </div>
                    </div>
                  </div>

                  <div class="mt-5">
                    <button
                      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="addLogicItem(selectedItem)"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'plus']"
                        class="h-3 w-3 text-white"
                      />
                      เพิ่มเงื่อนไข
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="mt-5">
                    <span class="popup-label text-gray-600 block mb-3"
                      >ฟอร์มนี้ถูกตั้งให้มีการแสดงผลตามเงื่อนไขของแบบฟอร์มอื่น</span
                    >
                    <div class="grid grid-cols-3 gap-2 text-center font-bold">
                      <div class="bg-gray-200 border border-gray-300 p-2">
                        เมื่อฟอร์มด้านล่าง
                      </div>
                      <div class="bg-gray-200 border border-gray-300 p-2">
                        ถูกเลือกเป็น
                      </div>
                      <div class="bg-gray-200 border border-gray-300 p-2">ฟอร์มนี้จะ</div>
                    </div>

                    <div
                      v-for="logicItem in selectedItem.logics"
                      :key="logicItem.uid"
                      class="grid grid-cols-3 gap-2"
                    >
                      <div class="border border-gray-300 p-2">
                        <div class="flex items-center justify-center h-full">
                          {{ getParentLogicObjectName(logicItem) }}
                        </div>
                      </div>
                      <div class="border border-gray-300 p-2">
                        <div class="flex items-center justify-center h-full">
                          {{ logicItem.default }}
                        </div>
                      </div>
                      <div class="border border-gray-300 p-2">
                        <div class="flex items-center justify-center h-full">
                          {{ logicItem.method === "show" ? "แสดงผล" : "ซ่อน" }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div v-else-if="activeTab === 'responsive'" class="tab-content">
              <div
                class="content-editor overflow-auto"
                style="
                  min-height: 600px;
                  max-height: 600px;
                  scrollbar-width: thin;
                  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                  right: -20px;
                "
              >
                <div class="border-b border-gray-200 pb-3 mb-3">
                  <span class="popup-label block font-bold text-lg"
                    >Responsive Config</span
                  >
                  <span class="popup-label text-gray-500"
                    >การตั้งค่าการแสดงผลในขนาดหน้าจอต่างๆ</span
                  >
                </div>

                <div class="mt-5 checkbox-group grid grid-cols-4 gap-2">
                  <label
                    class="checkbox-label flex flex-col items-center justify-center cursor-pointer p-4 border border-gray-300 rounded-sm hover:bg-gray-100"
                  >
                    <span class="device-icon text-4xl pb-2"
                      ><i class="fas fa-mobile-alt"></i
                    ></span>
                    <span>
                      <input
                        type="checkbox"
                        v-model="selectedItem.mobile"
                        class="checkbox-input"
                      />
                      <span class="device-text text-sm text-gray-500"> Mobile</span>
                    </span>
                  </label>

                  <label
                    class="checkbox-label flex flex-col items-center justify-center cursor-pointer p-4 border border-gray-300 rounded-sm hover:bg-gray-100"
                  >
                    <span class="device-icon text-4xl pb-2"
                      ><i class="fas fa-tablet-alt"></i
                    ></span>
                    <span>
                      <input
                        type="checkbox"
                        v-model="selectedItem.tablet"
                        class="checkbox-input"
                      />
                      <span class="device-text text-sm text-gray-500"> Tablet</span>
                    </span>
                  </label>

                  <label
                    class="checkbox-label flex flex-col items-center justify-center cursor-pointer p-4 border border-gray-300 rounded-sm hover:bg-gray-100"
                  >
                    <span class="device-icon text-4xl pb-2"
                      ><i class="fas fa-laptop"></i
                    ></span>
                    <span>
                      <input
                        type="checkbox"
                        v-model="selectedItem.laptop"
                        class="checkbox-input"
                      />
                      <span class="device-text text-sm text-gray-500"> Laptop</span>
                    </span>
                  </label>

                  <label
                    class="checkbox-label flex flex-col items-center justify-center cursor-pointer p-4 border border-gray-300 rounded-sm hover:bg-gray-100"
                  >
                    <span class="device-icon text-4xl pb-2"
                      ><i class="fas fa-desktop"></i
                    ></span>
                    <span>
                      <input
                        type="checkbox"
                        v-model="selectedItem.desktop"
                        class="checkbox-input"
                      />
                      <span class="device-text text-sm text-gray-500"> Desktop</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div
            :class="[
              'flex',
              { 'justify-end': !fullScreenMode },
              'bg-gray-100 p-4 border-t border-gray-200',
              { 'fixed inset-x-0 bottom-0': fullScreenMode },
            ]"
          >
            <button
              @click.prevent="saveEditedItem"
              class="popup-button mr-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              <font-awesome-icon
                :icon="['fas', 'save']"
                class="mx-auto h-4 w-4 text-white"
              />
              บันทึกข้อมูล
            </button>
            <button
              @click="cancelEditPopup"
              class="popup-button bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style>
.active-panel {
  border: 1px solid gray; /* You can adjust the border properties here */
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
</style>
