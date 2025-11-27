<script>
import Subhead from '@/interface/template/outline/Subhead.vue';
import storageManager from '@/plugins/storage';
import { translate } from '@/plugins/language.js';
export default {
  components: {
    Subhead
  },
  data() {
    return {
      // กำหนดค่าที่จำเป็นสำหรับเลย์เอาต์ใหม่
      rows: [
  {
    "title": "Row 1",
    "columns": [
      {
        "id": 1,
        "items": [
          {
            "name": "Title",
            "code": "title",
            "colspan": 1
          }
        ],
        "colspan": 2
      },
      {
        "id": 2,
        "items": [
          {
            "name": "Cover",
            "code": "cover",
            "colspan": 1
          }
        ],
        "colspan": 1
      }
    ],
    "columnCount": "3",
    "visible": true
  },
  {
    "title": "Row 2",
    "columns": [
      {
        "id": 2,
        "items": [
          {
            "name": "Navigator",
            "code": "navigator",
            "colspan": 1
          }
        ],
        "colspan": 1
      }
    ],
    "columnCount": 1,
    "visible": true
  },
  {
    "title": "Row 3",
    "columns": [
      {
        "id": 3,
        "items": [
          {
            "name": "Detail",
            "code": "detail",
            "colspan": 1
          }
        ],
        "colspan": 1
      },
      {
        "id": 2,
        "items": [
          {
            "name": "Inspection",
            "code": "inspection",
            "colspan": 1
          }
        ],
        "colspan": 1
      }
    ],
    "columnCount": "2",
    "visible": true
  },
  {
    "title": "Row 5",
    "columns": [
      {
        "id": 5,
        "items": [
          {
            "name": "Description",
            "code": "description",
            "colspan": 1
          }
        ],
        "colspan": 1
      }
    ],
    "columnCount": 1,
    "visible": true
  },
  {
    "title": "Row 4",
    "columns": [
      {
        "id": 4,
        "items": [
          {
            "name": "Playlist",
            "code": "playlist",
            "colspan": 1
          }
        ],
        "colspan": 1
      }
    ],
    "columnCount": 1,
    "visible": true
  }
],
      draggableItems: [
        { id: 1, name: 'Cover', code: 'cover', type: 'single' },
        { id: 2, name: 'Title', code: 'title', type: 'single' },
        { id: 3, name: 'Navigator', code: 'navigator', type: 'single' },
        { id: 4, name: 'Detail', code: 'detail', type: 'single' },
        { id: 5, name: 'Inspection', code: 'inspection', type: 'single' },
        { id: 6, name: 'Description', code: 'description', type: 'single' },
        { id: 7, name: 'Playlist', code: 'playlist', type: 'single' }
      ]
    };
  },
  computed: {
    visibleRows() {
      return this.rows.filter(row => row.visible);
    },
    disabledItems() {
      return this.rows.some(row => 
        row.columns.some(column => column.items && column.items.includes('Single Item'))
      );
    }
  },
  methods: {
    translate,
    toggleVisibility(index) {
      this.rows[index].visible = !this.rows[index].visible;
    },
    updateColumnItems(rowIndex) {
        const row = this.rows[rowIndex];
        
        // แปลง columnCount เป็นตัวเลข
        const columnCount = Number(row.columnCount);

        // คำนวณ totalColspan ของ columns
        let totalColspan = row.columns.reduce((sum, col) => sum + col.colspan, 0);

        console.log("totalColspan", totalColspan); // แสดง totalColspan

        // ถ้า totalColspan เกิน columnCount ของแถว ให้ลบ column ที่เกินออก
        while (totalColspan > columnCount) {
            const lastColumn = row.columns.pop(); // ลบ column สุดท้าย
            totalColspan -= lastColumn.colspan; // ปรับ totalColspan
        }

        // เพิ่มคอลัมน์ใหม่ถ้าจำเป็น
        while (totalColspan < columnCount) {
            row.columns.push({ id: row.columns.length + 1, items: [], colspan: 1 }); // เพิ่มคอลัมน์ใหม่
            totalColspan += 1; // ปรับ totalColspan
        }

        // รีเซ็ต colspan ของทุก item ในทุกคอลัมน์ให้เป็น 1 ถ้าจำเป็น
        row.columns.forEach(col => {
            col.items.forEach(item => {
                item.colspan = 1; // ตั้งค่า colspan เป็น 1
            });
        });
    },
    addItemToColumn(rowIndex, columnIndex, item) {
        const column = this.rows[rowIndex].columns[columnIndex];
        
        // ตรวจสอบให้แน่ใจว่า items ถูกกำหนดค่า
        if (!column.items) {
            column.items = []; 
        }

        // ตรวจสอบประเภทของ item ที่จะเพิ่ม
        if (item.type === 'single') {
            if (column.items.length === 0) {
                column.items.push({ name: item.name, code: item.code}); // เพิ่ม colspan เป็น 2
            } else {
                alert('Only one single item can be added to this column.');
            }
        } else if (item.type === 'multiple') {
            column.items.push({ name: item.name, code: item.code}); // เพิ่มอ็อบเจ็กต์ประเภท multiple พร้อม colspan
        }

        // อัปเดตคอลัมน์หลังจากเพิ่ม item
        this.updateColumnItems(rowIndex);
    },
    handleDrop(event, rowIndex, columnIndex) {
        event.preventDefault(); // ป้องกันการกระทำเริ่มต้น
        const itemId = event.dataTransfer.getData('text/plain');
        const item = this.draggableItems.find(i => i.id == itemId);
        if (item) {
            this.addItemToColumn(rowIndex, columnIndex, item);
        }
    },
    handleDragStart(event, item) {
        event.dataTransfer.setData('text/plain', item.id);
    },
    moveUp(index) {
      if (index > 0) {
        const temp = this.rows[index];
        this.rows[index] = this.rows[index - 1];
        this.rows[index - 1] = temp;
      }
    },
    moveDown(index) {
      if (index < this.rows.length - 1) {
        const temp = this.rows[index];
        this.rows[index] = this.rows[index + 1];
        this.rows[index + 1] = temp;
      }
    },
    changeColumnCount(rowIndex, count) {
        const row = this.rows[rowIndex];
        const currentColumnCount = row.columns.length;

        // เพิ่มหรือลดคอลัมน์ตามจำนวนที่เลือก
        if (count > currentColumnCount) {
            for (let i = currentColumnCount; i < count; i++) {
                row.columns.push({ id: i + 1, items: [], colspan: 1 }); // ตั้งค่า colspan เป็น 1 สำหรับคอลัมน์ใหม่
            }
        } else {
            row.columns.splice(count); // ลดจำนวนคอลัมน์
        }

        // รีเซ็ต colspan ของทุกคอลัมน์ให้เป็น 1
        row.columns.forEach(col => {
            col.colspan = 1; // ตั้งค่า colspan เป็น 1
        });

        // อัปเดต columnCount ที่ระดับแถว
        row.columnCount = count;
    },
    addNewRow() {
        const newRowIndex = this.rows.length + 1;
        this.rows.push({
            title: `Row ${newRowIndex}`,
            columns: [
                { 
                    id: newRowIndex, 
                    items: [], 
                    colspan: 1 // ตรวจสอบให้แน่ใจว่าไม่มี columnCount ที่นี่
                }
            ],
            columnCount: 1, // กำหนด columnCount ที่ระดับแถว
            visible: true
        });
    },
    removeItemFromColumn(rowIndex, columnIndex, itemIndex) {
      const column = this.rows[rowIndex].columns[columnIndex];
      if (column.items && column.items.length > itemIndex) {
        column.items.splice(itemIndex, 1);
      }
    },
    getColspanOptions(columnCount) {
        const options = [];
        if (columnCount === 3) {
            options.push(1, 2); // ถ้าจำนวนคอลัมน์เป็น 3 ให้ตัวเลือก colspan เป็น 1 และ 2
        } else if (columnCount === 4) {
            options.push(1, 2, 3); // ถ้าจำนวนคอลัมน์เป็น 4 ให้ตัวเลือก colspan เป็น 1, 2 และ 3
        } else {
            options.push(1); // ค่าเริ่มต้น
        }
        return options;
    }
  },
  created() {
    this.configs = storageManager.get('configs') || {};
    this.session = storageManager.get('session') || {};
  },
  mounted() {
    // ฟังก์ชันที่ต้องการเมื่อคอมโพเนนต์ถูกติดตั้ง
  }
};
</script>

<template>
    <Subhead :navigation="
        [
            {
                name: 'หลักสูตร',
                link: '/lesson',
                style: 'home',
                class: 'default-btn',
                //visible: this.master,
                type: 'button',
            },
            {
                name: 'Player',
                link: '/lesson/player-customize',
                style: 'play',
                class: 'default-btn',
                //visible: this.master,
                type: 'button',
            },
            {
                name: 'Course Detail',
                link: '/lesson/detail-customize',
                style: 'paint-roller',
                class: 'default-btn',
                //visible: this.master,
                type: 'button',
            },
        ]"
    />
    <div class="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mt-4 p-2">

        <div class="flex">
            <div class="w-4/6">
            <!-- คอลัมน์ซ้าย: Layout Builder -->
            <h3 class="text-gray-900 text-lg mb-4 font-semibold">Layout Builder</h3>
            <button @click="addNewRow" class="bg-green-500 text-white rounded p-2 mb-4">Add New Row</button>

            <!-- แถวที่มีขอบ -->
            <div class="mt-4 p-5 bg-gray-500">
                <div class="grid grid-cols-1 gap-1">
                    <!-- เรนเดอร์แถวจากอาร์เรย์ที่มองเห็นได้ -->
                    <div v-for="(row, rowIndex) in visibleRows" :key="rowIndex" class="border p-4 bg-white">
                        <h5>{{ row.title }}</h5>
                        <div :class="`grid grid-cols-${row.columnCount} gap-2`">
                            <template v-for="(column, columnIndex) in row.columns" :key="columnIndex">
                                <div class="border p-2 flex flex-col" :class="`col-span-${column.colspan}`" >
                                    <!-- Header -->
                                    <div class="flex justify-between items-center">
                                        <h5 class="font-semibold">Column {{ column.id }}</h5>
                                        <select v-model="column.colspan" class="ml-2" @change="updateColumnItems(rowIndex)">
                                            <option v-for="colspan in getColspanOptions(row.columns.length)" :key="colspan" :value="colspan">
                                                {{ colspan }}
                                            </option>
                                        </select>
                                    </div>
                                    
                                    <!-- Content Area -->
                                    <div :class="`flex justify-between items-center col-span-${column.colspan}`"  @drop="handleDrop($event, rowIndex, columnIndex)" 
                                    @dragover.prevent>
                                        <div v-if="column.items.length === 0" class="text-gray-500 p-3 border w-full">No items in this column.</div>
                                        <div v-for="(item, itemIndex) in column.items" :key="itemIndex" 
                                            class="border p-5 flex justify-between items-center" 
                                            :style="{ flex: item.colspan }">
                                            {{ item.name }}
                                            <button @click="removeItemFromColumn(rowIndex, columnIndex, itemIndex)" class="text-red-500">Remove</button>
                                        </div>
                                    </div>
                                    
                                    <!-- Footer -->
                                    <div class="mt-2">
                                        Footer Panel
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div class="flex justify-between mt-2">
                            <button @click="moveUp(rowIndex)" :disabled="rowIndex === 0">Up</button>
                            <button @click="moveDown(rowIndex)" :disabled="rowIndex === visibleRows.length - 1">Down</button>
                            <select v-model="row.columnCount" @change="changeColumnCount(rowIndex, row.columnCount)">
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <div class="w-2/6">
                <div class="p-5">
                    <!-- คอลัมน์ขวา: Config Panel -->
                    <h3 class="text-gray-900 text-lg mb-4 font-semibold">Config Panel</h3>
                    <div class="flex flex-col gap-2">
                        <h4 class="text-lg font-semibold">Draggable Items</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <div v-for="item in draggableItems" :key="item.id" 
                                class="border p-2 cursor-pointer" 
                                :class="{ 'opacity-50 cursor-not-allowed': disabledItems && item.type === 'single' }"
                                :disabled="disabledItems && item.type === 'single'"
                                draggable="true" 
                                @dragstart="handleDragStart($event, item)">
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
  </div>
</template>
