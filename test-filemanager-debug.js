// Test script สำหรับ FileManager multi-file drag & drop
// วางสคริปต์นี้ใน browser console เพื่อทดสอบ

console.log('🧪 FileManager Multi-File Drag & Drop Test');

// ฟังก์ชันสำหรับทดสอบการเลือกไฟล์
function testFileSelection() {
    console.log('\n=== Testing File Selection ===');
    
    // ค้นหา FileManager component
    const fileManagerEl = document.querySelector('[data-component="file-manager"]') || 
                         document.querySelector('.file-manager') ||
                         document.body;
    
    // ค้นหา checkboxes ของไฟล์
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    console.log(`Found ${checkboxes.length} checkboxes`);
    
    // เลือกไฟล์ 3 ไฟล์แรก
    checkboxes.forEach((checkbox, index) => {
        if (index < 3) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ Selected file ${index + 1}`);
        }
    });
}

// ฟังก์ชันสำหรับทดสอบการลาก
function testDragStart() {
    console.log('\n=== Testing Drag Start ===');
    
    // ค้นหาไฟล์ที่สามารถลากได้
    const draggableFiles = document.querySelectorAll('[draggable="true"]');
    console.log(`Found ${draggableFiles.length} draggable files`);
    
    if (draggableFiles.length > 0) {
        const firstFile = draggableFiles[0];
        
        // สร้าง drag event
        const dragStartEvent = new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            dataTransfer: new DataTransfer()
        });
        
        console.log('🎯 Triggering drag start on first file');
        firstFile.dispatchEvent(dragStartEvent);
    }
}

// ฟังก์ชันสำหรับดู Vue component data
function checkVueData() {
    console.log('\n=== Checking Vue Component Data ===');
    
    // ค้นหา Vue instance
    const vueElements = document.querySelectorAll('[data-v-*]');
    console.log(`Found ${vueElements.length} Vue elements`);
    
    // ลองหา Vue instance จาก window object
    if (window.Vue) {
        console.log('Vue found on window');
    }
    
    // ตรวจสอบ console.log messages ที่เกี่ยวข้อง
    console.log('📝 Check browser console for FileManager Debug messages');
    console.log('📝 Look for messages starting with [FileManager Debug]');
}

// ฟังก์ชันสำหรับแสดงคำแนะนำ
function showInstructions() {
    console.log('\n🔧 Manual Testing Instructions:');
    console.log('1. เปิด FileManager ในเบราว์เซอร์');
    console.log('2. เลือกไฟล์หลายๆไฟล์โดยคลิก checkbox');
    console.log('3. ลากไฟล์ใดไฟล์หนึ่งที่เลือกไว้');
    console.log('4. วางลงในโฟลเดอร์');
    console.log('5. ดู console log ที่เริ่มต้นด้วย [FileManager Debug]');
    console.log('\n📊 Expected Debug Messages:');
    console.log('- [FileManager Debug] === File Selection Toggle ===');
    console.log('- [FileManager Debug] === Drag Start ===');
    console.log('- [FileManager Debug] ✅ Multi-drag condition met');
    console.log('- [FileManager Debug] === File Drop ===');
    console.log('- [FileManager Debug] 🎯 Multi-drag detected');
}

// รันการทดสอบ
console.log('🚀 Starting automated tests...');
testFileSelection();
setTimeout(() => {
    testDragStart();
    setTimeout(() => {
        checkVueData();
        showInstructions();
    }, 1000);
}, 1000);

// Export functions for manual use
window.FileManagerTest = {
    testFileSelection,
    testDragStart,
    checkVueData,
    showInstructions
};

console.log('\n💡 Available manual test functions:');
console.log('- FileManagerTest.testFileSelection()');
console.log('- FileManagerTest.testDragStart()');
console.log('- FileManagerTest.checkVueData()');
console.log('- FileManagerTest.showInstructions()');
