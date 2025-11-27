/**
 * Logic Configuration Debug Helper
 * ใช้สำหรับ debug และตรวจสอบ Logic Configuration
 */

export class LogicDebugHelper {
  
  /**
   * ตรวจสอบและแสดงข้อมูล Logic Configuration
   */
  static debugLogicConfiguration(controller) {
    console.group('🔍 Logic Configuration Debug');
    
    try {
      const rows = controller.state.getState().rows;
      console.log('Total rows:', rows.length);
      
      let totalLogics = 0;
      let sourceElements = 0;
      let targetElements = 0;
      
      rows.forEach((row, rowIndex) => {
        if (row.columns && Array.isArray(row.columns)) {
          row.columns.forEach((column, columnIndex) => {
            if (column.object && Array.isArray(column.object)) {
              column.object.forEach((obj, objIndex) => {
                if (obj.logics && Array.isArray(obj.logics)) {
                  totalLogics += obj.logics.length;
                  
                  console.group(`📍 Element [${rowIndex}][${columnIndex}][${objIndex}]: ${obj.name}`);
                  console.log('Element UID:', obj.uid);
                  console.log('Total logics:', obj.logics.length);
                  
                  obj.logics.forEach((logic, logicIndex) => {
                    console.group(`Logic ${logicIndex}:`);
                    
                    if (logic.request === true) {
                      // Target element
                      targetElements++;
                      console.log('🎯 TARGET ELEMENT');
                      console.log('Request:', logic.request);
                      console.log('Default:', logic.default);
                      console.log('Method:', logic.method);
                      console.log('Source position:', `[${logic.rowIndex}][${logic.columnIndex}][${logic.objectIndex}]`);
                      
                      if (logic._metadata) {
                        console.log('Metadata:', logic._metadata);
                        console.log('Parent name:', logic._metadata.parentName);
                        console.log('Parent UID:', logic._metadata.parentUid);
                      } else {
                        console.warn('❌ Missing _metadata in request object');
                      }
                      
                    } else if (logic.destination) {
                      // Source element
                      sourceElements++;
                      console.log('🎪 SOURCE ELEMENT');
                      console.log('Logic UID:', logic.uid);
                      console.log('Default:', logic.default);
                      console.log('Method:', logic.method);
                      console.log('Destination:', logic.destination);
                      console.log('Target position:', `[${logic.destination.rowIndex}][${logic.destination.columnIndex}][${logic.destination.objIndex}]`);
                      
                    } else {
                      console.warn('❓ UNKNOWN LOGIC TYPE:', logic);
                    }
                    
                    console.groupEnd();
                  });
                  
                  console.groupEnd();
                }
              });
            }
          });
        }
      });
      
      console.log('📊 Summary:');
      console.log(`Total logic items: ${totalLogics}`);
      console.log(`Source elements: ${sourceElements}`);
      console.log(`Target elements: ${targetElements}`);
      
    } catch (error) {
      console.error('❌ Error debugging logic configuration:', error);
    }
    
    console.groupEnd();
  }
  
  /**
   * ตรวจสอบ Logic pairs
   */
  static debugLogicPairs(controller) {
    console.group('🔗 Logic Pairs Debug');
    
    try {
      const logicConfig = controller.getLogicConfigurationForRender();
      const { logicPairs } = logicConfig;
      
      console.log(`Total logic pairs: ${logicPairs.length}`);
      
      logicPairs.forEach((pair, index) => {
        console.group(`Pair ${index + 1}:`);
        console.log('Source:', pair.sourceObj.name, '(UID:', pair.sourceObj.uid, ')');
        console.log('Destination:', pair.destinationObj.name, '(UID:', pair.destinationObj.uid, ')');
        console.log('Logic:', pair.logic);
        console.log('Expected value:', pair.logic.default);
        console.log('Method:', pair.logic.method);
        console.groupEnd();
      });
      
    } catch (error) {
      console.error('❌ Error debugging logic pairs:', error);
    }
    
    console.groupEnd();
  }
  
  /**
   * ทดสอบฟังก์ชั่น getParentLogicObjectName
   */
  static testParentLogicObjectName(controller) {
    console.group('🏷️ Parent Logic Object Name Test');
    
    try {
      const rows = controller.state.getState().rows;
      
             rows.forEach((row) => {
         if (row.columns && Array.isArray(row.columns)) {
           row.columns.forEach((column) => {
             if (column.object && Array.isArray(column.object)) {
               column.object.forEach((obj) => {
                 if (obj.logics && Array.isArray(obj.logics)) {
                   obj.logics.forEach((logic) => {
                    if (logic.request === true) {
                      console.group(`Testing element: ${obj.name}`);
                      console.log('Logic item:', logic);
                      
                      const parentName = controller.getParentLogicObjectName(logic);
                      console.log('Result:', parentName);
                      
                      if (parentName === 'Unknown Parent Object') {
                        console.warn('❌ Failed to get parent name');
                        console.log('Debug info:');
                        console.log('- request:', logic.request);
                        console.log('- _metadata:', logic._metadata);
                        console.log('- rowIndex:', logic.rowIndex);
                        console.log('- columnIndex:', logic.columnIndex);
                        console.log('- objectIndex:', logic.objectIndex);
                      } else {
                        console.log('✅ Success:', parentName);
                      }
                      
                      console.groupEnd();
                    }
                  });
                }
              });
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Error testing parent logic object name:', error);
    }
    
    console.groupEnd();
  }
  
  /**
   * รันการ debug ทั้งหมด
   */
  static runFullDebug(controller) {
    if (!controller) {
      console.error('❌ Controller not provided for debug');
      return;
    }
    
    console.log('🚀 Starting Logic Configuration Full Debug...');
    
    this.debugLogicConfiguration(controller);
    this.debugLogicPairs(controller);
    this.testParentLogicObjectName(controller);
    
    console.log('✅ Full debug completed');
  }
}

// Export สำหรับใช้ใน global scope
if (typeof window !== 'undefined') {
  window.LogicDebugHelper = LogicDebugHelper;
} 