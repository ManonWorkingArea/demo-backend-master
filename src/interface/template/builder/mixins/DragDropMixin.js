/**
 * DragDropMixin.js - Mixin สำหรับ Drag and Drop functionality
 */

export const DragDropMixin = {
  computed: {
    // Drag and Drop Computed Properties
    dragState() {
      return this.controller?.getDragState() || {
        isDragging: false,
        draggedItemType: null,
        draggedItemData: null,
        dragOverTarget: null,
        dragOverTargetType: null
      };
    },
    isDragActive() {
      return this.dragState.isDragging;
    }
  },

  methods: {
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
    
    isValidDropTarget(targetType, targetData) {
      return this.controller?.canDrop(targetType, targetData) || false;
    },

    // Helper methods for drag and drop styling
    getDropZoneClass(targetType, targetData) {
      const { isDragging, draggedItemType, dragOverTarget, dragOverTargetType } = this.dragState;
      
      let classes = [];
      
      if (isDragging && this.isValidDropTarget(targetType, targetData)) {
        classes.push('drop-zone-available');
      }
      
      if (dragOverTargetType === targetType && 
          JSON.stringify(dragOverTarget) === JSON.stringify(targetData)) {
        classes.push('drag-over-active');
      }
      
      if (isDragging && draggedItemType === 'column' && targetType === 'row') {
        classes.push('column-drop-zone');
      }
      
      if (isDragging && draggedItemType === 'object' && targetType === 'column') {
        classes.push('object-drop-zone');
      }
      
      return classes.join(' ');
    },

    getDragHandleClass(itemType) {
      return `drag-handle drag-handle-${itemType}`;
    }
  }
};

export default DragDropMixin; 