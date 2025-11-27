/**
 * DataController.js - จัดการข้อมูล การบันทึก และ API ในระบบ Builder
 * แยกออกมาจาก Builder.vue เพื่อให้จัดการได้ง่ายขึ้น
 */

import requestClient from "@/plugins/requestClient";

const Request = new requestClient(false);

export class DataController {
  constructor(builderState) {
    this.state = builderState;
    this.currentPage = 1;
    this.limitItem = 100;
  }

  /**
   * บันทึกข้อมูล Builder
   */
  async previewLayout() {
    try {
      this.state.getState().activeBlock = true;
      
      const state = this.state.getState();
      const selectedItem = state.selectedItem;
      const rowIndex = state.popupDataRow;
      const columnIndex = state.popupDataColumn;
      const itemIndex = state.selectedItemIndex; // Make sure selectedItemIndex is correctly set for items

      if (selectedItem && selectedItem.uid && rowIndex !== undefined && rowIndex !== null && state.rows && state.rows[rowIndex]) {
        const targetRow = state.rows[rowIndex];
        if (columnIndex !== undefined && columnIndex !== null && targetRow.columns && targetRow.columns[columnIndex]) {
          const targetColumn = targetRow.columns[columnIndex];
          if (itemIndex !== undefined && itemIndex !== null && targetColumn.object && targetColumn.object[itemIndex]) {
            // Updating a specific content item within a column
            targetColumn.object[itemIndex] = JSON.parse(JSON.stringify(selectedItem));
            console.log(`[DataController] Updated contentItem at [${rowIndex}][${columnIndex}][${itemIndex}] with selectedItem.`);
          } else {
            // Updating a column: Merge selectedItem into the existing column data
            state.rows[rowIndex].columns[columnIndex] = { 
              ...state.rows[rowIndex].columns[columnIndex], 
              ...JSON.parse(JSON.stringify(selectedItem)) 
            };
            console.log(`[DataController] Updated column at [${rowIndex}][${columnIndex}] by merging selectedItem.`);
          }
        } else {
          // Updating a row (assuming selectedItem is the full row object)
          state.rows[rowIndex] = JSON.parse(JSON.stringify(selectedItem));
          console.log(`[DataController] Updated row at [${rowIndex}] with selectedItem.`);
        }
      }
      
      console.log("DataController.previewLayout: state.rows AFTER potential update from selectedItem:", JSON.parse(JSON.stringify(this.state.getState().rows)));

      const builderData = {
        builder: this.state.getState().rows || [],
        _id: this.state.getState().dataItem,
        css: this.state.getCssCode()
      };

      const requestData = {
        method: "updateOne",
        args: [
          { _id: builderData._id },
          { $set: { builder: builderData.builder, css: builderData.css } }
        ]
      };

      const resAPI = await Request.POST(
        "post/query", 
        requestData, 
        this.state.getConfigs().key
      );

      if (resAPI.status === 200) {
        console.log("Layout saved successfully");
        this.state.getState().activeBlock = false;
        return { success: true, data: resAPI.data };
      } else {
        throw new Error("Failed to save layout");
      }
    } catch (error) {
      console.log("Error saving layout:", error);
      this.state.getState().activeBlock = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * ดึงข้อมูลเมนู
   */
  async getMenuData() {
    if (this.state.getSession()?.login) {
      try {
        const requestData = {
          method: "find",
          args: [
            {
              $and: [
                { owner: this.state.getSession().current._id },
                { type: { $in: ["menu"] } }
              ]
            }
          ],
          paging: { page: this.currentPage, limit: this.limitItem }
        };

        const resAPI = await Request.POST(
          "post/query", 
          requestData, 
          this.state.getConfigs().key
        );

        if (resAPI.status === 200) {
          const menuItems = resAPI.data.data;
          console.log("Menu data loaded:", menuItems);
          return { success: true, data: menuItems };
        }
      } catch (error) {
        console.log("Error loading menu data:", error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: "User not logged in" };
  }

  /**
   * ดึงข้อมูลเนื้อหา
   */
  async getContentData() {
    if (this.state.getSession()?.login) {
      try {
        const requestData = {
          method: "find",
          args: [
            {
              $and: [
                { owner: this.state.getSession().current._id },
                { type: { $in: ["page", "layout", "form"] } }
              ]
            }
          ],
          paging: { page: this.currentPage, limit: this.limitItem }
        };

        const resAPI = await Request.POST(
          "post/query", 
          requestData, 
          this.state.getConfigs().key
        );

        if (resAPI.status === 200) {
          const postItems = resAPI.data.data;
          console.log("Content data loaded:", postItems);
          return { success: true, data: postItems };
        }
      } catch (error) {
        console.log("Error loading content data:", error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: "User not logged in" };
  }

  /**
   * ดึงข้อมูลหมวดหมู่บทเรียน
   */
  async getCategoryData() {
    try {
      const requestData = {
        method: "find",
        args: [
          {
            $and: [{ unit: this.state.getSession().current._id }]
          }
        ],
        paging: { page: 1, limit: 200 }
      };

      const resAPI = await Request.POST(
        "category/query",
        requestData,
        this.state.getConfigs().key
      );

      if (resAPI.status === 200) {
        const categories = resAPI.data.data;
        this.state.setLessonCategories(categories);
        console.log("Category data loaded:", categories);
        return { success: true, data: categories };
      }
    } catch (error) {
      console.log("Error loading category data:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ดึงข้อมูล Flow
   */
  async fetchFlowData() {
    try {
      const requestData = {
        method: "find",
        args: [
          {
            $and: [
              { owner: this.state.getSession().current._id },
              { type: { $in: ["flow"] } }
            ]
          }
        ],
        paging: { page: 1, limit: 100 }
      };

      const resAPI = await Request.POST(
        "post/query",
        requestData,
        this.state.getConfigs().key
      );

      if (resAPI.status === 200) {
        const flowOptions = resAPI.data.data.map(flow => ({
          value: flow._id,
          label: flow.title
        }));
        
        this.state.getState().flowOptions = flowOptions;
        console.log("Flow data loaded:", flowOptions);
        return { success: true, data: flowOptions };
      }
    } catch (error) {
      console.log("Error loading flow data:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ดึงข้อมูล Template
   */
  async loadTemplateData() {
    this.state.setLoading(true);
    
    try {
      const requestData = {
        method: "find",
        args: [
          {
            $and: [
              { owner: this.state.getSession().current._id },
              { type: { $in: ["layout"] } },
              { display: { $in: ["template"] } }
            ]
          }
        ],
        paging: { page: 1, limit: 50 }
      };

      const resAPI = await Request.POST(
        "post/query",
        requestData,
        this.state.getConfigs().key
      );

      if (resAPI.status === 200) {
        const templates = resAPI.data.data;
        this.state.setTemplate(templates);
        console.log("Template data loaded:", templates);
        return { success: true, data: templates };
      }
    } catch (error) {
      console.log("Error loading template data:", error);
      return { success: false, error: error.message };
    } finally {
      this.state.setLoading(false);
    }
  }

  /**
   * เลือก Template
   */
  async selectTemplate(template) {
    try {
      console.log("Selected template:", template);
      
      if (template.builder && Array.isArray(template.builder)) {
        // คัดลอก builder data และสร้าง UID ใหม่
        const clonedBuilder = this.cloneBuilderData(template.builder);
        this.state.getState().rows = clonedBuilder;
        
        await this.previewLayout();
        this.closeTemplateModal();
        
        console.log("Template applied successfully");
        return { success: true };
      }
    } catch (error) {
      console.log("Error applying template:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * คัดลอกข้อมูล Builder และสร้าง UID ใหม่
   */
  cloneBuilderData(builderData) {
    return builderData.map(row => {
      const newRow = { ...row };
      newRow.uid = this.generateUID("row");
      
      if (newRow.columns && Array.isArray(newRow.columns)) {
        newRow.columns = newRow.columns.map(column => {
          const newColumn = { ...column };
          newColumn.uid = this.generateUID("column");
          
          if (newColumn.object && Array.isArray(newColumn.object)) {
            newColumn.object = newColumn.object.map(item => ({
              ...item,
              uid: this.generateUID(item.type || "item")
            }));
          }
          
          return newColumn;
        });
      }
      
      return newRow;
    });
  }

  /**
   * บันทึก CSS
   */
  async saveCss() {
    try {
      const cssCode = this.state.getCssCode();
      
      const requestData = {
        method: "updateOne",
        args: [
          { _id: this.state.getState().dataItem },
          { $set: { css: cssCode } }
        ]
      };

      const resAPI = await Request.POST(
        "post/query",
        requestData,
        this.state.getConfigs().key
      );

      if (resAPI.status === 200) {
        this.state.closeCssModal();
        console.log("CSS saved successfully");
        return { success: true };
      }
    } catch (error) {
      console.log("Error saving CSS:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * บันทึก Item ที่แก้ไข
   */
  async saveEditedItem() {
    try {
      await this.previewLayout();
      this.state.closeEditPopup();
      console.log("Edited item saved successfully");
      return { success: true };
    } catch (error) {
      console.log("Error saving edited item:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * รีเฟรชข้อมูลจาก Parent
   */
  getDataFromParent() {
    try {
      // This should be implemented to refresh data from parent component
      console.log("Refreshing data from parent");
      return { success: true };
    } catch (error) {
      console.log("Error refreshing data:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * เปิด Modal Template
   */
  openTemplateModal() {
    this.state.getState().isModalOpen = true;
    this.loadTemplateData();
  }

  /**
   * ปิด Modal Template
   */
  closeTemplateModal() {
    this.state.getState().isModalOpen = false;
  }

  /**
   * ส่งออกข้อมูล Builder
   */
  exportBuilderData() {
    const exportData = {
      rows: this.state.getState().rows,
      css: this.state.getCssCode(),
      version: "1.0",
      exportedAt: new Date().toISOString()
    };
    
    console.log("Exported builder data:", exportData);
    return exportData;
  }

  /**
   * นำเข้าข้อมูล Builder
   */
  importBuilderData(importData) {
    try {
      if (importData.rows && Array.isArray(importData.rows)) {
        this.state.getState().rows = this.cloneBuilderData(importData.rows);
      }
      
      if (importData.css) {
        this.state.setCssCode(importData.css);
      }
      
      this.previewLayout();
      console.log("Imported builder data successfully");
      return { success: true };
    } catch (error) {
      console.log("Error importing builder data:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ตรวจสอบสถานะการบันทึก
   */
  isDataSaved() {
    // Implement logic to check if data has been saved
    return !this.state.getState().activeBlock;
  }

  /**
   * รีเซ็ตข้อมูล Builder
   */
  resetBuilderData() {
    this.state.getState().rows = [];
    this.state.setCssCode("");
    this.state.clearActivePanels();
    console.log("Builder data reset");
  }

  /**
   * สร้าง UID
   */
  generateUID(type) {
    return `${type}-uid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * ตั้งค่า callback สำหรับการอัปเดตข้อมูล
   */
  setUpdateCallback(callback) {
    this.updateCallback = callback;
  }

  /**
   * เรียก callback เมื่อมีการอัปเดต
   */
  triggerUpdate(data) {
    if (this.updateCallback) {
      this.updateCallback(data);
    }
  }
}

export default DataController; 