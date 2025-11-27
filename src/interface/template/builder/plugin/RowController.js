/**
 * RowController.js - จัดการการทำงานของ Rows ในระบบ Builder
 * แยกออกมาจาก Builder.vue เพื่อให้จัดการได้ง่ายขึ้น
 */


export class RowController {
  constructor(builderState) {
    this.state = builderState;
    this.updateDataCallback = null; // Add callback for data updates
  }

  /**
   * สร้าง Row พื้นฐาน
   */
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
  }

  /**
   * เพิ่ม Row ใหม่
   */
  addRow() {
    console.log("RowController.addRow: Called. Current state.rows BEFORE any modification:", JSON.parse(JSON.stringify(this.state.getState().rows)));
    
    const newRow = this.createBaseRow();
    
    // ตรวจสอบค่า rows ก่อนที่จะทำ || []
    const currentRows = this.state.getState().rows;
    if (!Array.isArray(currentRows)) {
      console.log("RowController.addRow: state.rows was NOT an array before '|| []'. Value:", currentRows);
      this.state.getState().rows = []; // ถ้าไม่ใช่ array ให้ตั้งเป็น array ว่าง
      console.log("RowController.addRow: state.rows has been RESET to [] because it wasn't an array.");
    }
    // บรรทัดเดิม: this.state.getState().rows = this.state.getState().rows || []; 
    // สามารถพิจารณาเอาออกได้เนื่องจากมีการตรวจสอบ !Array.isArray(currentRows) และกำหนดค่า [] ไปแล้วหากจำเป็น
    // แต่การคงไว้ก็ไม่เสียหาย เพราะถ้า currentRows เป็น array อยู่แล้ว มันจะไม่ทำอะไร
    // เพื่อความปลอดภัย อาจจะยังคงไว้ หรือเปลี่ยนเป็น if (this.state.getState().rows === null || this.state.getState().rows === undefined) this.state.getState().rows = [];
    this.state.getState().rows = this.state.getState().rows || []; // คงบรรทัดนี้ไว้ก่อนเพื่อความใกล้เคียงกับโค้ดเดิมที่สุด แต่มีการ log เพิ่มเติม

    this.state.getState().rows.push(newRow);
    console.log("RowController.addRow: state.rows AFTER push:", JSON.parse(JSON.stringify(this.state.getState().rows)));
    
    this.previewLayout(); // This is usually dataController.previewLayout()
    this.triggerDataUpdate(); // Add data update trigger
    console.log("Added new row (object):", JSON.parse(JSON.stringify(newRow)));
    console.log("RowController.addRow: Called previewLayout. Total rows now:", this.state.getState().rows.length);
  }

  /**
   * ลบ Row
   */
  removeRow(rowIndex) {
    if (this.state.getState().rows && this.state.getState().rows[rowIndex]) {
      this.state.getState().rows.splice(rowIndex, 1);
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log("Removed row at index:", rowIndex);
    }
  }

  /**
   * คัดลอก Row
   */
  cloneRow(rowIndex) {
    const originalRow = this.state.getState().rows[rowIndex];
    if (originalRow) {
      const clonedRow = JSON.parse(JSON.stringify(originalRow));
      clonedRow.uid = this.generateUID("row");
      
      // Update UIDs for columns and their objects
      clonedRow.columns = clonedRow.columns.map(column => {
        const newColumn = { ...column };
        newColumn.uid = this.generateUID("column");
        newColumn.object = newColumn.object?.map(item => ({
          ...item,
          uid: this.generateUID(item.type)
        })) || [];
        return newColumn;
      });

      this.state.getState().rows.splice(rowIndex + 1, 0, clonedRow);
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log("Cloned row:", clonedRow);
    }
  }

  /**
   * เลื่อน Row ขึ้น
   */
  moveRowUp(rowIndex) {
    if (rowIndex > 0) {
      const rows = this.state.getState().rows;
      [rows[rowIndex - 1], rows[rowIndex]] = [rows[rowIndex], rows[rowIndex - 1]];
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log("Moved row up from index:", rowIndex);
    }
  }

  /**
   * เลื่อน Row ลง
   */
  moveRowDown(rowIndex) {
    const rows = this.state.getState().rows;
    if (rowIndex < rows.length - 1) {
      [rows[rowIndex], rows[rowIndex + 1]] = [rows[rowIndex + 1], rows[rowIndex]];
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log("Moved row down from index:", rowIndex);
    }
  }

  /**
   * อัปเดต Row properties
   */
  updateRowProperty(rowIndex, property, value) {
    const row = this.state.getState().rows[rowIndex];
    if (row) {
      row[property] = value;
      this.previewLayout();
      console.log(`Updated row ${rowIndex} ${property}:`, value);
    }
  }

  /**
   * ตั้งค่าความกว้างของ Row
   */
  setRowWidth(rowIndex, width) {
    this.updateRowProperty(rowIndex, "width", width);
  }

  /**
   * ตั้งค่า responsive สำหรับ Row
   */
  setRowResponsive(rowIndex, device, visible) {
    this.updateRowProperty(rowIndex, device, visible);
  }

  /**
   * ตั้งค่า background ของ Row
   */
  setRowBackground(rowIndex, bgConfig) {
    const row = this.state.getState().rows[rowIndex];
    if (row) {
      Object.assign(row, bgConfig);
      this.previewLayout();
      console.log(`Updated row ${rowIndex} background:`, bgConfig);
    }
  }

  /**
   * ตั้งค่า padding ของ Row
   */
  setRowPadding(rowIndex, paddingConfig) {
    const row = this.state.getState().rows[rowIndex];
    if (row) {
      Object.assign(row, paddingConfig);
      this.previewLayout();
      console.log(`Updated row ${rowIndex} padding:`, paddingConfig);
    }
  }

  /**
   * ตั้งค่า margin ของ Row
   */
  setRowMargin(rowIndex, marginConfig) {
    const row = this.state.getState().rows[rowIndex];
    if (row) {
      Object.assign(row, marginConfig);
      this.previewLayout();
      console.log(`Updated row ${rowIndex} margin:`, marginConfig);
    }
  }

  /**
   * แสดง/ซ่อน Row
   */
  toggleRowVisibility(rowIndex) {
    const row = this.state.getState().rows[rowIndex];
    if (row) {
      row.visible = !row.visible;
      this.previewLayout();
      console.log(`Toggled row ${rowIndex} visibility:`, row.visible);
    }
  }

  /**
   * อัปเดตจำนวน columns ใน Row
   */
  updateRowColumns(rowIndex, columnCount) {
    const row = this.state.getState().rows[rowIndex];
    if (row) {
      row.col = columnCount.toString();
      this.previewLayout();
      console.log(`Updated row ${rowIndex} column count:`, columnCount);
    }
  }

  /**
   * ตั้งค่า Panel ที่ active
   */
  toggleRowPanel(rowIndex) {
    const currentActive = this.state.getState().activeRowPanel;
    if (currentActive === rowIndex) {
      this.state.setActiveRowPanel(null);
      this.state.setActiveColumnPanel(null, null);
    } else {
      this.state.setActiveRowPanel(rowIndex);
      this.state.setActiveColumnPanel(null, null);
    }
  }

  /**
   * ตรวจสอบว่า Row Panel active หรือไม่
   */
  isRowPanelActive(rowIndex) {
    return this.state.getState().activeRowPanel === rowIndex;
  }

  /**
   * สร้าง UID สำหรับ element
   */
  generateUID(type) {
    return `${type}-uid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * อัปเดต preview (ให้ implement ใน main component)
   */
  previewLayout() {
    // This should be implemented in the main component
    // or passed as a callback
    console.log("Preview layout updated");
  }

  /**
   * ตั้งค่า callback สำหรับ preview
   */
  setPreviewCallback(callback) {
    this.previewLayout = callback;
  }

  /**
   * รับข้อมูล rows ทั้งหมด
   */
  getAllRows() {
    return this.state.getState().rows || [];
  }

  /**
   * รับข้อมูล row ตาม index
   */
  getRow(rowIndex) {
    return this.state.getState().rows?.[rowIndex];
  }

  /**
   * ตรวจสอบว่ามี row หรือไม่
   */
  hasRows() {
    const rows = this.state.getState().rows;
    return rows && rows.length > 0;
  }

  /**
   * นับจำนวน rows
   */
  getRowCount() {
    return this.state.getState().rows?.length || 0;
  }

  /**
   * เคลียร์ rows ทั้งหมด
   */
  clearAllRows() {
    this.state.getState().rows = [];
    this.previewLayout();
    console.log("Cleared all rows");
  }

  /**
   * ตั้งค่า callback สำหรับ data update
   */
  setUpdateDataCallback(callback) {
    this.updateDataCallback = callback;
  }

  /**
   * Trigger data update to parent
   */
  triggerDataUpdate() {
    if (this.updateDataCallback && typeof this.updateDataCallback === 'function') {
      this.updateDataCallback();
    }
  }

  // Drag and Drop Methods

  /**
   * เริ่ม drag operation สำหรับ row
   */
  startDragRow(rowIndex) {
    const row = this.getRow(rowIndex);
    if (row) {
      this.state.startDrag('row', { rowIndex }, row);
    }
  }

  /**
   * รับ column ที่ถูก drop เข้า row
   */
  handleColumnDrop(targetRowIndex, draggedColumnData) {
    const { rowIndex: sourceRowIndex, columnIndex: sourceColumnIndex } = draggedColumnData;
    
    // ย้าย column จาก row เดิมไป row ใหม่
    const sourceRow = this.getRow(sourceRowIndex);
    const targetRow = this.getRow(targetRowIndex);
    
    if (sourceRow && targetRow && sourceRow.columns && sourceRow.columns[sourceColumnIndex]) {
      // ลบ column จาก row เดิม
      const movedColumn = sourceRow.columns.splice(sourceColumnIndex, 1)[0];
      
      // เพิ่ม column ไป row ใหม่
      targetRow.columns = targetRow.columns || [];
      targetRow.columns.push(movedColumn);
      
      this.previewLayout();
      this.triggerDataUpdate();
      
      console.log(`Moved column from row ${sourceRowIndex}:${sourceColumnIndex} to row ${targetRowIndex}`);
      return true;
    }
    
    return false;
  }

  /**
   * รับ column ที่ถูก drop ในตำแหน่งเฉพาะของ row
   */
  handleColumnDropAtPosition(targetRowIndex, targetPosition, draggedColumnData) {
    const { rowIndex: sourceRowIndex, columnIndex: sourceColumnIndex } = draggedColumnData;
    
    const sourceRow = this.getRow(sourceRowIndex);
    const targetRow = this.getRow(targetRowIndex);
    
    if (sourceRow && targetRow && sourceRow.columns && sourceRow.columns[sourceColumnIndex]) {
      // ลบ column จาก row เดิม
      const movedColumn = sourceRow.columns.splice(sourceColumnIndex, 1)[0];
      
      // เพิ่ม column ไป row ใหม่ในตำแหน่งที่กำหนด
      targetRow.columns = targetRow.columns || [];
      targetRow.columns.splice(targetPosition, 0, movedColumn);
      
      this.previewLayout();
      this.triggerDataUpdate();
      
      console.log(`Moved column from row ${sourceRowIndex}:${sourceColumnIndex} to row ${targetRowIndex} at position ${targetPosition}`);
      return true;
    }
    
    return false;
  }

  /**
   * ตรวจสอบว่า row สามารถรับ column ได้หรือไม่
   */
  canAcceptColumn(targetRowIndex, draggedColumnData) {
    const targetRow = this.getRow(targetRowIndex);
    const { rowIndex: sourceRowIndex } = draggedColumnData;
    
    // ไม่สามารถ drop column ใน row เดิมได้
    if (sourceRowIndex === targetRowIndex) {
      return false;
    }
    
    return !!targetRow;
  }

  /**
   * หา drop zones ที่ available สำหรับ column
   */
  getColumnDropZones(draggedColumnData) {
    const dropZones = [];
    const rows = this.getAllRows();
    
    rows.forEach((row, rowIndex) => {
      if (this.canAcceptColumn(rowIndex, draggedColumnData)) {
        // เพิ่ม drop zone สำหรับ row
        dropZones.push({
          type: 'row',
          rowIndex,
          position: 'end'
        });
        
        // เพิ่ม drop zones ระหว่าง columns
        if (row.columns && row.columns.length > 0) {
          row.columns.forEach((_, columnIndex) => {
            dropZones.push({
              type: 'column-slot',
              rowIndex,
              position: columnIndex
            });
          });
        }
      }
    });
    
    return dropZones;
  }
}

export default RowController; 