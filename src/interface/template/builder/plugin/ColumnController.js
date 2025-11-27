/**
 * ColumnController.js - จัดการการทำงานของ Columns ในระบบ Builder
 * แยกออกมาจาก Builder.vue เพื่อให้จัดการได้ง่ายขึ้น
 */


export class ColumnController {
  constructor(builderState) {
    this.state = builderState;
    this.updateDataCallback = null; // Add callback for data updates
  }

  /**
   * สร้าง Column พื้นฐาน
   */
  createBaseColumn() {
    return {
      uid: this.generateUID("column"),
      type: "column",
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
      object: [],

      bgType: "none",
      bgColor: "",
      bgImage: "",
      bgGradientColor1: "",
      bgGradientColor2: "",
      bgVideo: "",

      position: "relative",
      customClass: "",
      customId: "",
      colspan: "1",
      sz: "block",
      bsz: "block",
    };
  }

  /**
   * เพิ่ม Column ใหม่ใน Row
   */
  addColumn(rowIndex) {
    const rows = this.state.getState().rows;
    if (rows && rows[rowIndex]) {
      const newColumn = this.createBaseColumn();
      rows[rowIndex].columns.push(newColumn);
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Added column to row ${rowIndex}:`, newColumn);
    }
  }

  /**
   * ลบ Column
   */
  removeColumn(rowIndex, columnIndex) {
    const rows = this.state.getState().rows;
    if (rows && rows[rowIndex] && rows[rowIndex].columns[columnIndex]) {
      rows[rowIndex].columns.splice(columnIndex, 1);
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Removed column ${columnIndex} from row ${rowIndex}`);
    }
  }

  /**
   * คัดลอก Column
   */
  cloneColumn(rowIndex, columnIndex) {
    const rows = this.state.getState().rows;
    const originalColumn = rows?.[rowIndex]?.columns?.[columnIndex];
    
    if (originalColumn) {
      const clonedColumn = JSON.parse(JSON.stringify(originalColumn));
      clonedColumn.uid = this.generateUID("column");
      
      // อัปเดต UIDs สำหรับ objects ใน column
      clonedColumn.object = clonedColumn.object?.map(item => ({
        ...item,
        uid: this.generateUID(item.type)
      })) || [];

      rows[rowIndex].columns.splice(columnIndex + 1, 0, clonedColumn);
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Cloned column ${columnIndex} in row ${rowIndex}:`, clonedColumn);
    }
  }

  /**
   * เลื่อน Column ไปซ้าย
   */
  moveColumnLeft(rowIndex, columnIndex) {
    const rows = this.state.getState().rows;
    const columns = rows?.[rowIndex]?.columns;
    
    if (columns && columnIndex > 0) {
      [columns[columnIndex - 1], columns[columnIndex]] = 
        [columns[columnIndex], columns[columnIndex - 1]];
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Moved column ${columnIndex} left in row ${rowIndex}`);
    }
  }

  /**
   * เลื่อน Column ไปขวา
   */
  moveColumnRight(rowIndex, columnIndex) {
    const rows = this.state.getState().rows;
    const columns = rows?.[rowIndex]?.columns;
    
    if (columns && columnIndex < columns.length - 1) {
      [columns[columnIndex], columns[columnIndex + 1]] = 
        [columns[columnIndex + 1], columns[columnIndex]];
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Moved column ${columnIndex} right in row ${rowIndex}`);
    }
  }

  /**
   * อัปเดต Column properties
   */
  updateColumnProperty(rowIndex, columnIndex, property, value) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      column[property] = value;
      this.previewLayout();
      console.log(`Updated column ${rowIndex}:${columnIndex} ${property}:`, value);
    }
  }

  /**
   * ตั้งค่า responsive สำหรับ Column
   */
  setColumnResponsive(rowIndex, columnIndex, device, visible) {
    this.updateColumnProperty(rowIndex, columnIndex, device, visible);
  }

  /**
   * ตั้งค่า background ของ Column
   */
  setColumnBackground(rowIndex, columnIndex, bgConfig) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      Object.assign(column, bgConfig);
      this.previewLayout();
      console.log(`Updated column ${rowIndex}:${columnIndex} background:`, bgConfig);
    }
  }

  /**
   * ตั้งค่า padding ของ Column
   */
  setColumnPadding(rowIndex, columnIndex, paddingConfig) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      Object.assign(column, paddingConfig);
      this.previewLayout();
      console.log(`Updated column ${rowIndex}:${columnIndex} padding:`, paddingConfig);
    }
  }

  /**
   * ตั้งค่า margin ของ Column
   */
  setColumnMargin(rowIndex, columnIndex, marginConfig) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      Object.assign(column, marginConfig);
      this.previewLayout();
      console.log(`Updated column ${rowIndex}:${columnIndex} margin:`, marginConfig);
    }
  }

  /**
   * ตั้งค่า colspan ของ Column
   */
  setColumnSpan(rowIndex, columnIndex, colspan) {
    this.updateColumnProperty(rowIndex, columnIndex, "colspan", colspan);
  }

  /**
   * แสดง/ซ่อน Column
   */
  toggleColumnVisibility(rowIndex, columnIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      column.visible = !column.visible;
      this.previewLayout();
      console.log(`Toggled column ${rowIndex}:${columnIndex} visibility:`, column.visible);
    }
  }

  /**
   * ตั้งค่า Panel ที่ active
   */
  toggleColumnPanel(rowIndex, columnIndex) {
    const currentActive = this.state.getState().activeColumnPanel;
    if (currentActive.row === rowIndex && currentActive.col === columnIndex) {
      this.state.setActiveColumnPanel(null, null);
      this.state.setActiveRowPanel(null);
    } else {
      this.state.setActiveColumnPanel(rowIndex, columnIndex);
      this.state.setActiveRowPanel(null);
    }
  }

  /**
   * ตรวจสอบว่า Column Panel active หรือไม่
   */
  isColumnPanelActive(rowIndex, columnIndex) {
    const activePanel = this.state.getState().activeColumnPanel;
    return activePanel.row === rowIndex && activePanel.col === columnIndex;
  }

  /**
   * เพิ่ม Content Item ลงใน Column
   */
  addContentItem(rowIndex, columnIndex, item) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      const newItem = {
        ...item,
        uid: this.generateUID(item.type),
        id: Date.now()
      };
      
      column.object = column.object || [];
      column.object.push(newItem);
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Added content item to column ${rowIndex}:${columnIndex}:`, newItem);
    }
  }

  /**
   * ลบ Content Item จาก Column
   */
  removeContentItem(rowIndex, columnIndex, itemIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column && column.object && column.object[itemIndex]) {
      column.object.splice(itemIndex, 1);
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Removed content item ${itemIndex} from column ${rowIndex}:${columnIndex}`);
    }
  }

  /**
   * คัดลอก Content Item
   */
  cloneContentItem(rowIndex, columnIndex, itemIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    const originalItem = column?.object?.[itemIndex];
    
    if (originalItem) {
      const clonedItem = JSON.parse(JSON.stringify(originalItem));
      clonedItem.uid = this.generateUID(originalItem.type);
      clonedItem.id = Date.now();
      
      column.object.splice(itemIndex + 1, 0, clonedItem);
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Cloned content item ${itemIndex} in column ${rowIndex}:${columnIndex}:`, clonedItem);
    }
  }

  /**
   * เลื่อน Content Item ขึ้น
   */
  moveContentItemUp(rowIndex, columnIndex, itemIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    const items = column?.object;
    
    if (items && itemIndex > 0) {
      [items[itemIndex - 1], items[itemIndex]] = 
        [items[itemIndex], items[itemIndex - 1]];
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Moved content item ${itemIndex} up in column ${rowIndex}:${columnIndex}`);
    }
  }

  /**
   * เลื่อน Content Item ลง
   */
  moveContentItemDown(rowIndex, columnIndex, itemIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    const items = column?.object;
    
    if (items && itemIndex < items.length - 1) {
      [items[itemIndex], items[itemIndex + 1]] = 
        [items[itemIndex + 1], items[itemIndex]];
      
      this.previewLayout();
      this.triggerDataUpdate(); // Add data update trigger
      console.log(`Moved content item ${itemIndex} down in column ${rowIndex}:${columnIndex}`);
    }
  }

  /**
   * รับข้อมูล Column
   */
  getColumn(rowIndex, columnIndex) {
    const rows = this.state.getState().rows;
    return rows?.[rowIndex]?.columns?.[columnIndex];
  }

  /**
   * รับข้อมูล columns ทั้งหมดใน row
   */
  getColumnsInRow(rowIndex) {
    const rows = this.state.getState().rows;
    return rows?.[rowIndex]?.columns || [];
  }

  /**
   * นับจำนวน columns ใน row
   */
  getColumnCount(rowIndex) {
    return this.getColumnsInRow(rowIndex).length;
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
   * ตั้งค่า content ของ Column
   */
  setColumnContent(rowIndex, columnIndex, content) {
    this.updateColumnProperty(rowIndex, columnIndex, "content", content);
  }

  /**
   * เคลียร์ content items ทั้งหมดใน Column
   */
  clearColumnContent(rowIndex, columnIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      column.object = [];
      this.previewLayout();
      console.log(`Cleared content in column ${rowIndex}:${columnIndex}`);
    }
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
   * เริ่ม drag operation สำหรับ column
   */
  startDragColumn(rowIndex, columnIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column) {
      this.state.startDrag('column', { rowIndex, columnIndex }, column);
    }
  }

  /**
   * เริ่ม drag operation สำหรับ object
   */
  startDragObject(rowIndex, columnIndex, itemIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    const object = column?.object?.[itemIndex];
    if (object) {
      this.state.startDrag('object', { rowIndex, columnIndex, itemIndex }, object);
    }
  }

  /**
   * รับ object ที่ถูก drop เข้า column
   */
  handleObjectDrop(targetRowIndex, targetColumnIndex, draggedObjectData, targetPosition = null) {
    console.log('[ColumnController] handleObjectDrop called with:', 
      'target:', targetRowIndex, targetColumnIndex, 'pos:', targetPosition, 
      'draggedData:', JSON.parse(JSON.stringify(draggedObjectData)) 
    );

    const { rowIndex: sourceRowIndex, columnIndex: sourceColumnIndex, itemIndex: sourceItemIndex } = draggedObjectData;
    
    const sourceColumn = this.getColumn(sourceRowIndex, sourceColumnIndex);
    const targetColumn = this.getColumn(targetRowIndex, targetColumnIndex);

    console.log('[ColumnController] sourceColumn:', sourceColumn ? JSON.parse(JSON.stringify(sourceColumn.object)) : null);
    console.log('[ColumnController] targetColumn before op:', targetColumn ? JSON.parse(JSON.stringify(targetColumn.object)) : null);
    console.log('[ColumnController] sourceItemIndex:', sourceItemIndex);
    console.log('[ColumnController] item to move:', sourceColumn?.object?.[sourceItemIndex] ? JSON.parse(JSON.stringify(sourceColumn.object[sourceItemIndex])) : 'NOT FOUND');

    if (sourceColumn && targetColumn && sourceColumn.object && sourceColumn.object[sourceItemIndex]) {
      // ลบ object จาก column เดิม
      const movedObject = sourceColumn.object.splice(sourceItemIndex, 1)[0];
      console.log('[ColumnController] movedObject:', JSON.parse(JSON.stringify(movedObject)));
      console.log('[ColumnController] sourceColumn.object after splice:', JSON.parse(JSON.stringify(sourceColumn.object)));
      
      // เพิ่ม object ไป column ใหม่
      targetColumn.object = targetColumn.object || [];
      
      if (targetPosition !== null && targetPosition >= 0 && targetPosition <= targetColumn.object.length) { // Added boundary check
        targetColumn.object.splice(targetPosition, 0, movedObject);
        console.log(`[ColumnController] Spliced object at targetPosition: ${targetPosition}`);
      } else {
        targetColumn.object.push(movedObject);
        console.log(`[ColumnController] Pushed object to end of targetColumn. targetPosition was: ${targetPosition}`);
      }
      
      console.log('[ColumnController] targetColumn.object after splice/push:', JSON.parse(JSON.stringify(targetColumn.object)));

      this.previewLayout();
      this.triggerDataUpdate();
      
      console.log(`[ColumnController] Successfully moved object from column ${sourceRowIndex}:${sourceColumnIndex}:${sourceItemIndex} to column ${targetRowIndex}:${targetColumnIndex} at position ${targetPosition !== null ? targetPosition : 'end'}`);
      return true;
    } else {
      console.error('[ColumnController] Condition for moving object not met:', 
        { 
          sourceColumnExists: !!sourceColumn, 
          targetColumnExists: !!targetColumn, 
          sourceColumnHasObjectArray: !!sourceColumn?.object, 
          sourceItemExists: !!sourceColumn?.object?.[sourceItemIndex] 
        }
      );
    }
    
    return false;
  }

  /**
   * ตรวจสอบว่า column สามารถรับ object ได้หรือไม่
   */
  canAcceptObject(targetRowIndex, targetColumnIndex, draggedObjectData) {
    const targetColumn = this.getColumn(targetRowIndex, targetColumnIndex);
    const { rowIndex: sourceRowIndex, columnIndex: sourceColumnIndex } = draggedObjectData;
    
    // ไม่สามารถ drop object ใน column เดิมได้
    if (sourceRowIndex === targetRowIndex && sourceColumnIndex === targetColumnIndex) {
      return false;
    }
    
    return !!targetColumn;
  }

  /**
   * หา drop zones ที่ available สำหรับ object
   */
  getObjectDropZones(draggedObjectData) {
    const dropZones = [];
    const rows = this.state.getState().rows || [];
    
    rows.forEach((row, rowIndex) => {
      if (row.columns) {
        row.columns.forEach((column, columnIndex) => {
          if (this.canAcceptObject(rowIndex, columnIndex, draggedObjectData)) {
            // เพิ่ม drop zone สำหรับ column
            dropZones.push({
              type: 'column',
              rowIndex,
              columnIndex,
              position: 'end'
            });
            
            // เพิ่ม drop zones ระหว่าง objects
            if (column.object && column.object.length > 0) {
              column.object.forEach((_, objectIndex) => {
                dropZones.push({
                  type: 'object-slot',
                  rowIndex,
                  columnIndex,
                  position: objectIndex
                });
              });
            }
          }
        });
      }
    });
    
    return dropZones;
  }

  /**
   * จัดการ reorder objects ภายใน column เดียวกัน
   */
  reorderObjectsInColumn(rowIndex, columnIndex, fromIndex, toIndex) {
    const column = this.getColumn(rowIndex, columnIndex);
    if (column && column.object && column.object[fromIndex]) {
      const movedObject = column.object.splice(fromIndex, 1)[0];
      column.object.splice(toIndex, 0, movedObject);
      
      this.previewLayout();
      this.triggerDataUpdate();
      
      console.log(`Reordered object in column ${rowIndex}:${columnIndex} from ${fromIndex} to ${toIndex}`);
      return true;
    }
    
    return false;
  }

  /**
   * จัดการ reorder columns ภายใน row เดียวกัน
   */
  reorderColumnsInRow(rowIndex, fromIndex, toIndex) {
    const rows = this.state.getState().rows;
    const row = rows?.[rowIndex];
    
    if (row && row.columns && row.columns[fromIndex]) {
      const movedColumn = row.columns.splice(fromIndex, 1)[0];
      row.columns.splice(toIndex, 0, movedColumn);
      
      this.previewLayout();
      this.triggerDataUpdate();
      
      console.log(`Reordered column in row ${rowIndex} from ${fromIndex} to ${toIndex}`);
      return true;
    }
    
    return false;
  }
}

export default ColumnController; 