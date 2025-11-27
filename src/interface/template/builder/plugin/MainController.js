/**
 * MainController.js - Controller หลักที่รวมการทำงานของ Controllers ทั้งหมด
 * แยกออกมาจาก Builder.vue เพื่อให้จัดการได้ง่ายขึ้น
 */

import BuilderState from './BuilderState.js';
import RowController from './RowController.js';
import ColumnController from './ColumnController.js';
import DataController from './DataController.js';

export class MainController {
  constructor(stateInstance, props = {}) {
    console.log("MAIN CONTROLLER CONSTRUCTOR CALLED. Raw props:", JSON.parse(JSON.stringify(props)));
    console.log("MainController CONSTRUCTOR CALLED. Raw props:", JSON.parse(JSON.stringify(props)));
    try {
      // รับ State Management ที่สร้างแบบ async
      this.state = stateInstance;
      // สร้าง Controllers
      this.rowController = new RowController(this.state);
      this.columnController = new ColumnController(this.state);
      this.dataController = new DataController(this.state);
      // ตั้งค่า Properties
      this.props = props;
      // ตั้งค่า Callbacks
      this.setupCallbacks();
      // Add updateDataCallback for external data sync
      this.updateDataCallback = null;
      console.log("MainController constructed successfully");
      console.log("MainController initialized");
    } catch (e) {
      console.error("ERROR IN MainController CONSTRUCTOR:", e);
      console.log("ERROR IN MainController CONSTRUCTOR:", e);
    }
  }

  /**
   * ตั้งค่า Callbacks ระหว่าง Controllers
   */
  setupCallbacks() {
    // ตั้งค่า preview callback สำหรับ controllers
    const previewCallback = () => this.dataController.previewLayout();
    
    this.rowController.setPreviewCallback(previewCallback);
    this.columnController.setPreviewCallback(previewCallback);
    
    // ตั้งค่า updateData callback สำหรับ controllers
    const updateDataCallback = () => this.triggerDataUpdate();
    this.rowController.setUpdateDataCallback(updateDataCallback);
    this.columnController.setUpdateDataCallback(updateDataCallback);
    
    // ตั้งค่า state update callback
    this.state.setUpdateCallback(updateDataCallback);
  }

  /**
   * เริ่มต้นระบบ
   */
  async initialize(builderData) {
    console.log("MAIN CONTROLLER INITIALIZE CALLED. Raw builderData:", JSON.stringify(builderData));

    try {
      let initializedRows = [];
      let initializedCss = "";
      let dataItemId = null;

      if (builderData) {
        console.log("MainController.initialize: builderData received.");
        dataItemId = builderData._id || null;
        // Ensure builderData.builder is an array before processing
        const rawRows = Array.isArray(builderData.builder) ? builderData.builder : [];
        
        // Data migration/normalization logic
        initializedRows = rawRows.map(row => {
          const newRow = { ...row };
          // Ensure row.uid exists and is in the new format
          if (!newRow.uid || (typeof newRow.uid === 'string' && !newRow.uid.startsWith('row-uid-'))) {
            newRow.uid = this.rowController.generateUID("row");
          }
          // Ensure row.id exists (optional, based on new data structure, uncomment if needed)
          /* if (!newRow.id) {
             newRow.id = `row-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          } */

          if (Array.isArray(newRow.columns)) {
            newRow.columns = newRow.columns.map(column => {
              const newColumn = { ...column };
              // Ensure column.uid exists and is in the new format
              if (!newColumn.uid || (typeof newColumn.uid === 'string' && !newColumn.uid.startsWith('column-uid-'))) {
                newColumn.uid = this.columnController.generateUID("column");
              }

              if (Array.isArray(newColumn.object)) {
                newColumn.object = newColumn.object.map(item => {
                  const newItem = { ...item };
                  // Ensure item.uid exists and is in the new format
                  // Check if UID is purely numeric (old format) or doesn't match new format for items
                  if (!newItem.uid || /^\d+$/.test(newItem.uid) || (typeof newItem.uid === 'string' && !newItem.uid.includes('-uid-'))) {
                    newItem.uid = this.columnController.generateUID(item.type || "item");
                  }
                  // Ensure item.id exists (based on new data structure)
                  // Old data might not have 'id', new data seems to use timestamp-like 'id' for items
                  if (newItem.id === undefined) { 
                    // Generate a unique ID, Date.now() might not be unique enough if items are processed quickly
                    newItem.id = Date.now() + Math.random().toString(36).substr(2, 9); 
                  }
                  return newItem;
                });
              } else {
                // If column.object is not an array (e.g. null or undefined), initialize as empty array
                newColumn.object = [];
              }
              return newColumn;
            });
          } else {
            // If row.columns is not an array, initialize as empty array
            newRow.columns = [];
          }
          return newRow;
        });
        
        initializedCss = typeof builderData.css === 'string' ? builderData.css : "";
        
        console.log(`MainController.initialize (normalized): dataItemId: ${dataItemId}, rows count: ${initializedRows.length}, css: ${initializedCss}`);
      } else {
        console.warn("MainController.initialize: builderData is null or undefined. Using default empty state.");
      }

      this.state.getState().rows = initializedRows;
      this.state.setCssCode(initializedCss);
      this.state.getState().dataItem = dataItemId;

      console.log("MainController.initialize: State updated. dataItem:", this.state.getState().dataItem);
      
      // โหลดข้อมูลที่จำเป็นอื่นๆ
      const results = await Promise.all([
        this.dataController.getMenuData(),
        this.dataController.getContentData(),
        this.dataController.fetchFlowData(),
        this.dataController.getCategoryData() // getCategoryData จะ set state ภายในตัวมันเอง
      ]);

      const menuDataResult = results[0];
      if (menuDataResult && menuDataResult.success) {
        this.state.getState().menuItems = menuDataResult.data; // เก็บ menuItems เข้า state
        console.log("MainController.initialize: menuItems set in state:", this.state.getState().menuItems);
      }
/*
      const contentDataResult = results[1];
      if (contentDataResult && contentDataResult.success) {
        // สมมติว่า contentItems (หรือชื่ออื่นที่เหมาะสม) ควรถูกเก็บใน state ด้วย
        this.state.getState().contentItems = contentDataResult.data;
         console.log("MainController.initialize: contentItems set in state:", this.state.getState().contentItems);
      }
      */
      
      const flowDataResult = results[2];
       if (flowDataResult && flowDataResult.success) {
        this.state.getState().flowOptions = flowDataResult.data; // สมมติว่า flowOptions เก็บใน state
        console.log("MainController.initialize: flowOptions set in state:", this.state.getState().flowOptions);
      }
      // getCategoryData() น่าจะ set state ของตัวเองแล้ว ไม่ต้องทำอะไรเพิ่ม
      
      console.log("MainController initialized successfully");
      return { success: true };

    } catch (error) {
      console.log("Error initializing MainController:", error);
      console.error("Error initializing MainController:", error); // แสดง error ใน console ด้วย
      // กรณีเกิด error, ก็ควรตั้งค่า default เพื่อป้องกันปัญหา downstream
      this.state.getState().rows = [];
      this.state.setCssCode("");
      this.state.getState().dataItem = null;
      return { success: false, error: error.message };
    }
  }

  /**
   * เปิด Edit Popup
   */
  openEditPopup(rowIndex, columnIndex = null, itemIndex = null) {
    let selectedItem = null;
    
    if (itemIndex !== null) {
      // แก้ไข item
      selectedItem = this.columnController.getColumn(rowIndex, columnIndex)?.object?.[itemIndex];
      this.state.getState().selectedItemIndex = itemIndex;
    } else if (columnIndex !== null) {
      // แก้ไข column
      selectedItem = this.columnController.getColumn(rowIndex, columnIndex);
    } else {
      // แก้ไข row
      selectedItem = this.rowController.getRow(rowIndex);
    }
    
    if (selectedItem) {
      // Reset activeTab to content first
      this.state.setActiveTab("content");
      
      // Set selectedItem (this will trigger the watcher to reset local state)
      this.state.setSelectedItem(selectedItem);
      
      // Open the popup
      this.state.openEditPopup();
      
      // Set popup data
      this.state.getState().popupDataRow = rowIndex;
      this.state.getState().popupDataColumn = columnIndex;
      
      // Force trigger reset callback if available
      if (this.resetTabStateCallback && typeof this.resetTabStateCallback === 'function') {
        try {
          this.resetTabStateCallback();
        } catch (error) {
          console.error('Error calling resetTabStateCallback:', error);
        }
      }
      
      console.log('[MainController] openEditPopup: Opening popup for item:', selectedItem.uid || selectedItem.type);
    }
  }

  /**
   * เปิด Content Lightbox
   */
  openContentLightbox(rowIndex, columnIndex) {
    this.state.openLightbox(rowIndex, columnIndex);
  }

  /**
   * จัดการการคลิก Item
   */
  handleItemClick(item, rowIndex, columnIndex) {
    if (item.type === "form") {
      this.state.getState().showFormSubMenu = true;
    } else if (item.type === "lesson") {
      this.state.getState().showLessonSubMenu = true;
    } else if (item.type === "nav") {
      this.state.getState().showNavSubMenu = true;
    } else if (item.type === "dashboard") {
      this.state.getState().showDashboardSubMenu = true;
    } else {
      this.columnController.addContentItem(rowIndex, columnIndex, item);
      this.state.closeLightbox();
      this.triggerDataUpdate(); // Add data update trigger
    }
  }

  /**
   * โหลด Component แบบ Watch
   */
  async loadComponentWatch(componentName) {
    try {
      const module = await import(`../element/${componentName}.vue`);
      this.state.getState().componentImport = module.default || module;
    } catch (error) {
      console.error(`Failed to load component: ${componentName}`, error);
      this.state.getState().componentImport = null;
    }
  }

  /**
   * โหลด Component แบบ Loop
   */
  loadComponentLoop(componentName) {
    if (this.state.isComponentCached(componentName)) {
      return true;
    }
    
    import(`../element/${componentName}.vue`)
      .then((module) => {
        this.state.addToComponentCache(componentName, module.default || module);
      })
      .catch((error) => {
        console.error(`Failed to load component: ${componentName}`, error);
      });
    
    return false;
  }

  /**
   * อัปเดตข้อมูล
   */
  handleUpdate({ field, value }) {
    this.state.updateSelectedItem(field, value);
  }

  /**
   * อัปเดต Item
   */
  handleUpdateItem(updatedItem) {
    this.state.setSelectedItem(updatedItem);
  }

  /**
   * แยก YouTube ID
   */
  extractYouTubeId(url) {
    if (!url || typeof url !== "string") {
      return "";
    }

    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : "";
  }

  /**
   * Flatten Categories
   */
  flattenCategories(categories) {
    return categories.reduce((result, category) => {
      result.push(category);
      if (category.type === "main") {
        const subcategories = categories.filter(
          (subcategory) =>
            subcategory.type === "sub" && subcategory.parent === category._id
        );
        result.push(...subcategories);
      }
      return result;
    }, []);
  }

  /**
   * Get all builder options for logic destination
   */
  getAllBuilderOptions() {
    const options = [];
    const selectedItem = this.state.getState().selectedItem;
    const rows = this.state.getState().rows;

    if (!selectedItem || !rows) {
      return options; // Return empty if no selected item or rows
    }

    const selectedItemUid = selectedItem.uid; // Get UID of the currently selected item for exclusion

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row && Array.isArray(row.columns)) { // Ensure row.columns is an array
        for (let columnIndex = 0; columnIndex < row.columns.length; columnIndex++) {
          const column = row.columns[columnIndex];
          if (column && Array.isArray(column.object)) { // Ensure column.object is an array
            for (let objIndex = 0; objIndex < column.object.length; objIndex++) {
              const obj = column.object[objIndex];
              if (obj && obj.name && obj.uid) { // Ensure obj, obj.name, and obj.uid exist
                // Exclude the selectedItem itself from the list of options
                if (obj.uid === selectedItemUid) {
                    continue;
                }

                const option = {
                  name: obj.name,
                  uid: obj.uid, 
                  rowIndex,
                  columnIndex,
                  objIndex,
                  obj: objIndex, // เพิ่ม obj เพื่อความเข้ากันได้กับฝั่ง render
                };

                let isSelectedInLogics = false;
                if (selectedItem.logics && Array.isArray(selectedItem.logics)) {
                  isSelectedInLogics = selectedItem.logics.some(
                    (logicItem) =>
                      logicItem.destination &&
                      logicItem.destination.uid === option.uid // Compare by UID
                  );
                }
                
                // This check seems redundant if we already exclude by selectedItemUid above
                // const isSameAsSelectedItem = option.uid === selectedItemUid;

                if (!isSelectedInLogics) { // Removed isSameAsSelectedItem check as it's covered
                  options.push(option);
                }
              }
            }
          }
        }
      }
    }
    return options;
  }

  /**
   * เพิ่ม Logic Item แบบ Bidirectional (สองทาง)
   * บันทึกข้อมูลทั้งที่ต้นทางและปลายทาง
   */
  addLogicItem(logicItem, sourceElement) {
    console.log('MainController.addLogicItem called with:', logicItem, sourceElement);
    
    if (!sourceElement || !sourceElement.uid) {
      console.error('addLogicItem: Source element is required');
      return false;
    }

    // สร้าง Logic Item ใหม่ถ้าไม่ได้ส่งมา
    if (!logicItem) {
      logicItem = {
        uid: `logic-${Date.now()}`,
        default: '',
        destination: null,
        method: ''
      };
    }

    // เพิ่ม Logic Item ใน Source Element
    if (!sourceElement.logics) {
      sourceElement.logics = [];
    }
    
    if (!sourceElement.logics.some(item => item.uid === logicItem.uid)) {
      sourceElement.logics.push(logicItem);
      console.log(`Added logic item to source element (${sourceElement.uid}):`, logicItem);
    }

    // ถ้ามี destination แล้ว ให้เพิ่มข้อมูล request ที่ element ปลายทาง
    if (logicItem.destination && logicItem.destination.uid && logicItem.method) {
      this.addLogicRequestToTarget(logicItem, sourceElement);
    }

    this.triggerDataUpdate();
    return true;
  }

  /**
   * ลบ Logic Item แบบ Bidirectional (สองทาง)
   * ลบข้อมูลทั้งที่ต้นทางและปลายทาง
   */
  removeLogicItem(logicItemUid, sourceElement) {
    console.log('MainController.removeLogicItem called with:', logicItemUid, sourceElement);
    
    if (!sourceElement || !sourceElement.logics) {
      console.error('removeLogicItem: Source element or logics not found');
      return false;
    }

    // หา Logic Item ที่จะลบ
    const logicItemIndex = sourceElement.logics.findIndex(item => item.uid === logicItemUid);
    if (logicItemIndex === -1) {
      console.error('removeLogicItem: Logic item not found');
      return false;
    }

    const logicItem = sourceElement.logics[logicItemIndex];

    // ลบข้อมูล request จาก element ปลายทาง (ถ้ามี)
    if (logicItem.destination && logicItem.destination.uid) {
      this.removeLogicRequestFromTarget(logicItem, sourceElement);
    }

    // ลบ Logic Item จาก Source Element
    sourceElement.logics.splice(logicItemIndex, 1);
    console.log(`Removed logic item from source element (${sourceElement.uid}):`, logicItem);

    this.triggerDataUpdate();
    return true;
  }

  /**
   * อัปเดต Logic Item แบบ Bidirectional (สองทาง)
   */
  updateLogicItem(logicItemUid, updates, sourceElement) {
    console.log('MainController.updateLogicItem called with:', logicItemUid, updates, sourceElement);
    
    if (!sourceElement || !sourceElement.logics) {
      console.error('updateLogicItem: Source element or logics not found');
      return false;
    }

    // หา Logic Item ที่จะอัปเดต
    const logicItem = sourceElement.logics.find(item => item.uid === logicItemUid);
    if (!logicItem) {
      console.error('updateLogicItem: Logic item not found');
      return false;
    }

    // เก็บข้อมูลเดิมไว้เพื่อตรวจสอบการเปลี่ยนแปลง
    const oldDestination = logicItem.destination;
    const oldMethod = logicItem.method;

    // อัปเดตข้อมูลใน Logic Item
    Object.assign(logicItem, updates);

    // ตรวจสอบการเปลี่ยนแปลง destination หรือ method
    const destinationChanged = JSON.stringify(oldDestination) !== JSON.stringify(logicItem.destination);
    const methodChanged = oldMethod !== logicItem.method;

    // ถ้า destination หรือ method เปลี่ยน ต้องอัปเดตข้อมูลที่ปลายทาง
    if (destinationChanged || methodChanged) {
      // ลบข้อมูลเก่าจากปลายทางเดิม (ถ้ามี)
      if (oldDestination && oldDestination.uid) {
        this.removeLogicRequestFromTarget({ 
          ...logicItem, 
          destination: oldDestination, 
          method: oldMethod 
        }, sourceElement);
      }

      // เพิ่มข้อมูลใหม่ที่ปลายทางใหม่ (ถ้ามี)
      if (logicItem.destination && logicItem.destination.uid && logicItem.method) {
        this.addLogicRequestToTarget(logicItem, sourceElement);
      }
    }

    console.log(`Updated logic item in source element (${sourceElement.uid}):`, logicItem);
    this.triggerDataUpdate();
    return true;
  }

  /**
   * เพิ่มข้อมูล Logic Request ไปยัง Element ปลายทาง
   */
  addLogicRequestToTarget(logicItem, sourceElement) {
    console.log('MainController.addLogicRequestToTarget called with:', logicItem, sourceElement);
    
    if (!logicItem.destination || !logicItem.destination.uid) {
      console.error('addLogicRequestToTarget: Destination not specified');
      return false;
    }

    // หา Element ปลายทาง
    const targetElement = this.findElementByUid(logicItem.destination.uid);
    if (!targetElement) {
      console.error('addLogicRequestToTarget: Target element not found');
      return false;
    }

    // สร้าง request object ตามรูปแบบที่ระบบ render ต้องการ
    const request = {
      request: true,
      default: logicItem.default,
      method: logicItem.method,
      rowIndex: this.findElementPosition(sourceElement).rowIndex,
      columnIndex: this.findElementPosition(sourceElement).columnIndex,
      objectIndex: this.findElementPosition(sourceElement).objIndex,
      // เก็บข้อมูล metadata สำหรับการ debug
      _metadata: {
        uid: `request-${Date.now()}`,
        parentUid: sourceElement.uid,
        parentName: sourceElement.name,
        sourceLogicUid: logicItem.uid,
        targetRowIndex: logicItem.destination.rowIndex,
        targetColumnIndex: logicItem.destination.columnIndex,
        targetObjIndex: logicItem.destination.objIndex
      }
    };

    // เพิ่ม request ไปที่ logics ของ element ปลายทาง
    if (!targetElement.logics) {
      targetElement.logics = [];
    }

    // ตรวจสอบว่ามี request จาก source element นี้อยู่แล้วหรือไม่
    const existingRequestIndex = targetElement.logics.findIndex(
      logic => logic.request === true && logic._metadata && logic._metadata.sourceLogicUid === logicItem.uid
    );

    if (existingRequestIndex !== -1) {
      // อัปเดต request ที่มีอยู่
      targetElement.logics[existingRequestIndex] = request;
      console.log(`Updated request in target element (${targetElement.uid}):`, request);
    } else {
      // เพิ่ม request ใหม่
      targetElement.logics.push(request);
      console.log(`Added request to target element (${targetElement.uid}):`, request);
    }

    return true;
  }

  /**
   * ลบข้อมูล Logic Request จาก Element ปลายทาง
   */
  removeLogicRequestFromTarget(logicItem, sourceElement) {
    console.log('MainController.removeLogicRequestFromTarget called with:', logicItem, sourceElement);
    
    if (!logicItem.destination || !logicItem.destination.uid) {
      console.error('removeLogicRequestFromTarget: Destination not specified');
      return false;
    }

    // หา Element ปลายทาง
    const targetElement = this.findElementByUid(logicItem.destination.uid);
    if (!targetElement || !targetElement.logics) {
      console.error('removeLogicRequestFromTarget: Target element or logics not found');
      return false;
    }

    // หาและลบ request ที่เกี่ยวข้อง
    const requestIndex = targetElement.logics.findIndex(
      logic => logic.request === true && logic._metadata && logic._metadata.sourceLogicUid === logicItem.uid
    );

    if (requestIndex !== -1) {
      const removedRequest = targetElement.logics.splice(requestIndex, 1)[0];
      console.log(`Removed request from target element (${targetElement.uid}):`, removedRequest);
      return true;
    }

    console.warn('removeLogicRequestFromTarget: Request not found in target element');
    return false;
  }

  /**
   * ค้นหา Element ด้วย UID
   */
  findElementByUid(uid) {
    const rows = this.state.getState().rows;
    if (!rows) return null;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row && Array.isArray(row.columns)) {
        for (let columnIndex = 0; columnIndex < row.columns.length; columnIndex++) {
          const column = row.columns[columnIndex];
          if (column && Array.isArray(column.object)) {
            for (let objIndex = 0; objIndex < column.object.length; objIndex++) {
              const obj = column.object[objIndex];
              if (obj && obj.uid === uid) {
                return obj;
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * ค้นหาตำแหน่งของ Element ในโครงสร้าง Builder
   */
  findElementPosition(element) {
    const rows = this.state.getState().rows;
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (row.columns && Array.isArray(row.columns)) {
        for (let columnIndex = 0; columnIndex < row.columns.length; columnIndex++) {
          const column = row.columns[columnIndex];
          if (column.object && Array.isArray(column.object)) {
            for (let objIndex = 0; objIndex < column.object.length; objIndex++) {
              const obj = column.object[objIndex];
              if (obj.uid === element.uid) {
                return {
                  rowIndex,
                  columnIndex,
                  objIndex
                };
              }
            }
          }
        }
      }
    }
    
    console.warn('findElementPosition: Element not found:', element.uid);
    return { rowIndex: -1, columnIndex: -1, objIndex: -1 };
  }

  /**
   * ดึงชื่อ Parent Object สำหรับ Logic Request
   */
  getParentLogicObjectName(logicItem) {
    console.log('getParentLogicObjectName called with:', logicItem);
    
    // ตรวจสอบรูปแบบใหม่ (request: true)
    if (logicItem && logicItem.request === true) {
      if (logicItem._metadata) {
        const parentName = logicItem._metadata.parentName || 'Unknown';
        console.log(`Found parent name from metadata: ${parentName}`);
        return parentName;
      }
      
      // หากไม่มี _metadata ให้พยายามค้นหาจากตำแหน่ง
      if (logicItem.rowIndex !== undefined && logicItem.columnIndex !== undefined && logicItem.objectIndex !== undefined) {
        const parentElement = this.findElementByPosition(logicItem.rowIndex, logicItem.columnIndex, logicItem.objectIndex);
        if (parentElement) {
          console.log(`Found parent element by position: ${parentElement.name}`);
          return parentElement.name || `Element at [${logicItem.rowIndex}][${logicItem.columnIndex}][${logicItem.objectIndex}]`;
        }
      }
    }
    
    // Fallback สำหรับรูปแบบเก่า
    if (logicItem && logicItem.request && typeof logicItem.request === 'object') {
      const parentName = logicItem.request.parentName || 'Unknown';
      return parentName;
    }
    
    console.warn('getParentLogicObjectName: Unable to determine parent name', logicItem);
    return 'Unknown Parent Object';
  }

  /**
   * ค้นหา Element ด้วยตำแหน่ง
   */
  findElementByPosition(rowIndex, columnIndex, objIndex) {
    const rows = this.state.getState().rows;
    
    try {
      if (rows[rowIndex] && rows[rowIndex].columns && rows[rowIndex].columns[columnIndex] && 
          rows[rowIndex].columns[columnIndex].object && rows[rowIndex].columns[columnIndex].object[objIndex]) {
        return rows[rowIndex].columns[columnIndex].object[objIndex];
      }
    } catch (error) {
      console.error('findElementByPosition: Error accessing element', error);
    }
    
    return null;
  }

  /**
   * แปลงข้อมูล Builder format เป็น Render format สำหรับ Logic Configuration
   * @param {Array} builderRows - ข้อมูลจาก Builder
   * @returns {Array} - ข้อมูลในรูปแบบที่ Render สามารถใช้ได้
   */
  convertBuilderDataToRenderFormat(builderRows) {
    if (!builderRows || !Array.isArray(builderRows)) {
      console.warn('convertBuilderDataToRenderFormat: Invalid input data');
      return [];
    }

    return builderRows.map((row, rowIndex) => {
      return {
        ...row,
        columns: row.columns ? row.columns.map((column, columnIndex) => {
          return {
            ...column,
            // แปลง "object" เป็น "objects" เพื่อความเข้ากันได้กับฝั่ง render
            objects: column.object ? column.object.map((obj, objIndex) => {
              const convertedObj = {
                ...obj,
                // แปลง logics format
                logics: this.convertLogicsToRenderFormat(obj.logics, rowIndex, columnIndex, objIndex)
              };
              
              return convertedObj;
            }) : []
          };
        }) : []
      };
    });
  }

  /**
   * แปลง Logic Configuration จาก Builder format เป็น Render format
   */
  convertLogicsToRenderFormat(logics, sourceRowIndex, sourceColumnIndex, sourceObjIndex) {
    if (!logics || !Array.isArray(logics)) {
      return [];
    }

    return logics.map(logic => {
      // ถ้าเป็น request object (element ปลายทาง)
      if (logic.request) {
        return {
          ...logic,
          // แปลง request structure เพื่อความเข้ากันได้
          default: logic.request.default,
          method: logic.request.method,
          destination: {
            rowIndex: sourceRowIndex,
            columnIndex: sourceColumnIndex,
            obj: sourceObjIndex // ใช้ obj แทน objIndex สำหรับฝั่ง render
          }
        };
      }
      
      // ถ้าเป็น logic item ปกติ (element ต้นทาง)
      if (logic.destination) {
        return {
          ...logic,
          destination: {
            ...logic.destination,
            obj: logic.destination.objIndex // เพิ่ม obj field สำหรับความเข้ากันได้
          }
        };
      }

      return logic;
    });
  }

  /**
   * สร้าง Logic Pairs สำหรับ Render Engine
   * @param {Array} renderData - ข้อมูลในรูปแบบ Render format
   * @returns {Array} - Logic pairs สำหรับการทำงานใน Render
   */
  buildLogicPairsForRender(renderData) {
    const logicPairs = [];
    
    if (!renderData || !Array.isArray(renderData)) {
      console.warn('buildLogicPairsForRender: Invalid render data');
      return logicPairs;
    }

         renderData.forEach((row) => {
       if (row.columns && Array.isArray(row.columns)) {
         row.columns.forEach((column) => {
           if (column.objects && Array.isArray(column.objects)) {
             column.objects.forEach((obj) => {
              if (obj.logics && Array.isArray(obj.logics)) {
                obj.logics.forEach((logic) => {
                  // ข้าม request objects (element ปลายทาง)
                  if (logic.request) {
                    return;
                  }

                  // สร้าง logic pairs สำหรับ source elements
                  if (logic.destination) {
                    const sourceObj = obj;
                    const destinationObj = this.getObjectByRenderPath(logic.destination, renderData);

                    if (sourceObj && destinationObj) {
                      logicPairs.push({
                        sourceObj,
                        destinationObj,
                        logic
                      });
                      console.log(`[LOGIC PAIR] Created: ${sourceObj.name} -> ${destinationObj.name} (${logic.method})`);
                    } else {
                      console.warn('[LOGIC PAIR] Failed to create pair:', {
                        source: sourceObj?.name,
                        destination: logic.destination,
                        logic
                      });
                    }
                  }
                });
              }
            });
          }
        });
      }
    });

    console.log(`[LOGIC PAIRS] Total created: ${logicPairs.length}`);
    return logicPairs;
  }

  /**
   * ค้นหา Object ด้วย path ในรูปแบบ Render format
   */
  getObjectByRenderPath(path, renderData) {
    if (!path || !renderData) {
      console.warn('getObjectByRenderPath: Invalid parameters');
      return null;
    }

    const { rowIndex, columnIndex, obj } = path;
    
    if (rowIndex === undefined || columnIndex === undefined || obj === undefined) {
      console.warn('getObjectByRenderPath: Invalid path:', path);
      return null;
    }

    try {
      const targetObj = renderData[rowIndex]?.columns[columnIndex]?.objects[obj];
      
      if (!targetObj) {
        console.warn(`getObjectByRenderPath: Object not found at [${rowIndex}][${columnIndex}][${obj}]`);
        return null;
      }

      console.log(`getObjectByRenderPath: Found object "${targetObj.name}" at [${rowIndex}][${columnIndex}][${obj}]`);
      return targetObj;
    } catch (error) {
      console.error('getObjectByRenderPath: Error accessing path:', error);
      return null;
    }
  }

  /**
   * ดึงข้อมูล Logic Configuration สำหรับ Render Engine
   */
  getLogicConfigurationForRender() {
    const builderRows = this.state.getState().rows;
    const renderData = this.convertBuilderDataToRenderFormat(builderRows);
    const logicPairs = this.buildLogicPairsForRender(renderData);

    return {
      renderData,
      logicPairs,
      // ส่งฟังก์ชั่นที่ render สามารถเรียกใช้ได้
      runLogic: (logics) => this.runLogicForRender(logics),
      extractValue: (value) => this.extractValueForRender(value)
    };
  }

  /**
   * แยกค่าสำหรับการเปรียบเทียบใน Logic (รองรับรูปแบบต่างๆ)
   */
  extractValueForRender(value) {
    if (value && typeof value === 'object' && value.value !== undefined) {
      return value.value;
    }
    
    if (Array.isArray(value)) {
      return value.map(v => v.label || v.name || v).join(', ');
    }
    
    if (typeof value === 'object' && value !== null) {
      return value.label || value.name || value;
    }
    
    return value;
  }

  /**
   * ทำงาน Logic สำหรับ Render Engine
   */
  runLogicForRender(logicPairs) {
    if (!logicPairs || !Array.isArray(logicPairs)) {
      console.warn('runLogicForRender: Invalid logic pairs');
      return;
    }

    logicPairs.forEach(({ sourceObj, destinationObj, logic }) => {
      if (!sourceObj || !destinationObj || !logic) {
        console.warn('runLogicForRender: Invalid logic pair components');
        return;
      }

      const { default: expectedValue, method } = logic;
      const sourceValue = this.extractValueForRender(sourceObj.value);

             console.log(`[LOGIC EXECUTION] ${sourceObj.name}: "${sourceValue}" ${method === 'show' ? '===' : '!=='} "${expectedValue}" => ${destinationObj.name}`);

      if (method === 'show') {
        const shouldShow = sourceValue === expectedValue;
        destinationObj.hidden = !shouldShow;
        console.log(`[LOGIC RESULT] ${destinationObj.name}: hidden = ${destinationObj.hidden}`);
      } else if (method === 'hide') {
        const shouldHide = sourceValue === expectedValue;
        destinationObj.hidden = shouldHide;
        console.log(`[LOGIC RESULT] ${destinationObj.name}: hidden = ${destinationObj.hidden}`);
      }
    });
  }

  /**
   * อัปเดต All Sides (padding, margin)
   */
  updateAllSides(value, type) {
    const selectedItem = this.state.getState().selectedItem;
    if (selectedItem) {
      selectedItem[`${type}Top`] = value;
      selectedItem[`${type}Right`] = value;
      selectedItem[`${type}Bottom`] = value;
      selectedItem[`${type}Left`] = value;
    }
  }

  /**
   * อัปเดต Background Properties
   */
  updateBackgroundProperties(bgType, prefix) {
    const selectedItem = this.state.getState().selectedItem;
    if (selectedItem) {
      if (bgType !== "color") {
        selectedItem[`${prefix}Color`] = "";
      }
      if (bgType !== "image") {
        selectedItem[`${prefix}Image`] = "";
      }
      if (bgType !== "gradient") {
        selectedItem[`${prefix}GradientColor1`] = "";
        selectedItem[`${prefix}GradientColor2`] = "";
      }
      if (bgType !== "video") {
        selectedItem[`${prefix}Video`] = "";
      }
    }
  }

  /**
   * เปิด File Browser
   */
  openFileBrowser(index) {
    this.state.getState().selectedSlideItemIndex = index;
    this.state.openFileBrowser();
  }

  /**
   * ทำลาย Controller
   */
  destroy() {
    console.log("MainController destroyed");
  }

  /**
   * Export สำหรับใช้ใน Vue Component
   */
  getControllerInterface() {
    return {
      // state: this.getVueState(), // Method was removed
      // methods: this.getVueMethods(), // Method was removed
      initialize: (data) => this.initialize(data),
      destroy: () => this.destroy()
    };
  }

  /**
   * Set callback for external data updates
   */
  setUpdateDataCallback(callback) {
    this.updateDataCallback = callback;
  }

  /**
   * Set callback for resetting tab state
   */
  setResetTabStateCallback(callback) {
    this.resetTabStateCallback = callback;
  }

  /**
   * Trigger data update
   */
  triggerDataUpdate() {
    if (this.updateDataCallback && typeof this.updateDataCallback === 'function') {
      this.updateDataCallback();
    }
  }

  /**
   * Get current builder data for saving
   */
  getCurrentBuilderData() {
    return {
      rows: this.state.getState().rows || [],
      css: this.state.getCssCode() || "",
      selectedItem: this.state.getState().selectedItem || {}
    };
  }

  // Drag and Drop Methods

  /**
   * เริ่ม drag operation
   */
  startDrag(itemType, itemData, item, event) {
    this.state.startDrag(itemType, itemData, item);
    
    // ตั้งค่า drag effect
    if (event && event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({ itemType, itemData }));
      
      // สร้าง drag image แบบ custom
      const dragImage = this.createDragImage(itemType, item);
      if (dragImage) {
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => document.body.removeChild(dragImage), 0);
      }
    }
    
    console.log(`Started dragging ${itemType}:`, itemData);
  }

  /**
   * จบ drag operation
   */
  endDrag() {
    this.state.endDrag();
  }

  /**
   * จัดการ drag over event
   */
  handleDragOver(event, targetType, targetData) {
    event.preventDefault();
    console.log('MainController handleDragOver:', { targetType, targetData });
    
    if (this.state.isValidDropTarget(targetType, targetData)) {
      event.dataTransfer.dropEffect = 'move';
      this.state.setDragOverTarget(targetType, targetData);
      console.log('Set drag over target:', targetType, targetData);
    } else {
      event.dataTransfer.dropEffect = 'none';
      console.log('Invalid drop target:', targetType, targetData);
    }
  }

  /**
   * จัดการ drag leave event
   */
  handleDragLeave() {
    this.state.clearDragOverTarget();
  }

  /**
   * จัดการ drop event
   */
  handleDrop(event, targetType, targetData) {
    event.preventDefault();
    
    const draggedItemType = this.state.getState().draggedItemType;
    const draggedItemData = this.state.getState().draggedItemData;
    
    if (!this.state.isValidDropTarget(targetType, targetData)) {
      this.endDrag();
      return false;
    }
    
    let success = false;
    
    try {
      if (draggedItemType === 'column') {
        success = this.handleColumnDrop(targetType, targetData, draggedItemData);
      } else if (draggedItemType === 'object') {
        success = this.handleObjectDrop(targetType, targetData, draggedItemData);
      }
      
      if (success) {
        console.log(`Successfully dropped ${draggedItemType}:`, draggedItemData, 'to', targetType, targetData);
      }
    } catch (error) {
      console.error('Error during drop operation:', error);
    }
    
    this.endDrag();
    return success;
  }

  /**
   * จัดการ drop column
   */
  handleColumnDrop(targetType, targetData, draggedColumnData) {
    if (targetType === 'row') {
      // Dropping a column into a row (usually at the end, or determined by RowController)
      return this.rowController.handleColumnDrop(targetData.rowIndex, draggedColumnData);
    } else if (targetType === 'column-slot') {
      // Dropping a column into a specific slot within a row
      return this.rowController.handleColumnDropAtPosition(
        targetData.rowIndex, 
        targetData.position, // position indicates the index for the new column
        draggedColumnData
      );
    }
    console.warn('[MainController] Unhandled column drop targetType:', targetType);
    return false;
  }

  /**
   * จัดการ drop object
   */
  handleObjectDrop(targetType, targetData, draggedObjectData) {
    console.log('[MainController] handleObjectDrop called with:', 
      'targetType:', targetType, 
      'targetData:', JSON.parse(JSON.stringify(targetData)), 
      'draggedObjectData:', JSON.parse(JSON.stringify(draggedObjectData))
    );

    if (targetType === 'column') {
      // Dropping an object into a column (e.g., empty column or end of existing objects)
      // targetData.position should ideally be 'end' or the count of existing objects
      const position = targetData.position === 'end' || targetData.position === undefined 
                       ? (this.columnController.getColumn(targetData.rowIndex, targetData.columnIndex)?.object?.length || 0) 
                       : targetData.position;
      return this.columnController.handleObjectDrop(
        targetData.rowIndex, 
        targetData.columnIndex, 
        draggedObjectData,
        position 
      );
    } else if (targetType === 'object-slot') {
      // Dropping an object into a specific slot between/before/after existing objects
      return this.columnController.handleObjectDrop(
        targetData.rowIndex, 
        targetData.columnIndex, 
        draggedObjectData,
        targetData.position // position indicates the index for the new object
      );
    }
    console.warn('[MainController] Unhandled object drop targetType:', targetType);
    return false;
  }

  /**
   * สร้าง drag image แบบ custom
   */
  createDragImage(itemType, item) {
    const dragImage = document.createElement('div');
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      pointer-events: none;
    `;
    
    switch (itemType) {
      case 'column':
        dragImage.textContent = `📋 Column: ${item.text || 'Untitled'}`;
        break;
      case 'object':
        dragImage.textContent = `🔗 Object: ${item.type || 'Unknown'}`;
        break;
      default:
        dragImage.textContent = `📦 ${itemType}`;
    }
    
    return dragImage;
  }

  /**
   * เริ่ม drag column
   */
  startDragColumn(rowIndex, columnIndex, event) {
    const column = this.columnController.getColumn(rowIndex, columnIndex);
    if (column) {
      this.startDrag('column', { rowIndex, columnIndex }, column, event);
    }
  }

  /**
   * เริ่ม drag object
   */
  startDragObject(rowIndex, columnIndex, itemIndex, event) {
    const column = this.columnController.getColumn(rowIndex, columnIndex);
    const object = column?.object?.[itemIndex];
    if (object) {
      this.startDrag('object', { rowIndex, columnIndex, itemIndex }, object, event);
    }
  }

  /**
   * ตรวจสอบว่าสามารถ drop ได้หรือไม่
   */
  canDrop(targetType, targetData) {
    return this.state.isValidDropTarget(targetType, targetData);
  }

  /**
   * รับ drag state ปัจจุบัน
   */
  getDragState() {
    return {
      isDragging: this.state.getState().isDragging,
      draggedItemType: this.state.getState().draggedItemType,
      draggedItemData: this.state.getState().draggedItemData,
      dragOverTarget: this.state.getState().dragOverTarget,
      dragOverTargetType: this.state.getState().dragOverTargetType
    };
  }

  // เพิ่ม async factory function สำหรับสร้าง MainController
  static async createInstance(props = {}) {
    const stateInstance = await BuilderState.createInstance();
    return new MainController(stateInstance, props);
  }
}

export default MainController; 