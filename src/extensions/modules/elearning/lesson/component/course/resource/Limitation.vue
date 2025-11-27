<template>

    <!-- Button to open modal -->
    <button @click="showModal = true" class="mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-1 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
      <font-awesome-icon :icon="['fas','key']" class="text-black mt-[3px] mr-2 text-md"/>
      <span>สิทธิ์การใช้งาน</span>
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" @click.self="showModal = false">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
        <div class="flex items-center justify-between border-b pb-2 mb-4">
          <div class="flex items-center">
            <font-awesome-icon :icon="['fas','key']" class="text-black mt-[3px] mr-2 text-md"/>
            <h2 class="text-lg font-semibold">จำกัดสิทธิ์ในการใช้งานของผู้เรียน : Limitation</h2>
          </div>
          <span class="text-xl cursor-pointer" @click="showModal = false">&times;</span>
        </div>
        
        <!-- Original content goes here -->
        <div>
          <div v-for="(item, index) in limitation" :key="index" class="mb-4">
            <div class="flex items-center mb-2">
              <input :id="getItemId(item)" v-model="item.checked" @change="checkAll(item, item.checked)" type="checkbox" class="mr-2" />
              <label :for="getItemId(item)" class="font-semibold">{{ item.name }}</label>
            </div>
            <div v-if="item.hasSub">
              <div :class="item.code === 'exam' && item.subItems.length > 2 ? 'grid grid-cols-4 gap-4 ml-4' : 'ml-4'">
                <div v-for="(subItem, subIndex) in item.subItems" :key="subIndex" class="mb-2">
                  <div class="flex items-center mb-2">
                    <input :id="getItemId(subItem, item)" v-model="subItem.checked" @change="checkAll(subItem, subItem.checked)" type="checkbox" class="mr-2" />
                    <label :for="getItemId(subItem, item)">{{ subItem.name }}</label>
                  </div>
                  <div v-if="subItem.hasSub" class="ml-4">
                    <div v-for="(nestedItem, nestedIndex) in subItem.subItems" :key="nestedIndex" class="mb-2">
                      <div class="flex items-center">
                        <input :id="getItemId(nestedItem, subItem, item)" v-model="nestedItem.checked" @change="checkAll(nestedItem, nestedItem.checked)" type="checkbox" class="mr-2" />
                        <label :for="getItemId(nestedItem, subItem, item)">{{ nestedItem.name }}</label>
                      </div>
                      <div v-if="nestedItem.hasSub" class="ml-4">
                        <div v-for="(deeperItem, deeperIndex) in nestedItem.subItems" :key="deeperIndex" class="mb-2">
                          <div class="flex items-center">
                            <input :id="getItemId(deeperItem, nestedItem, subItem, item)" v-model="deeperItem.checked" @change="checkAll(deeperItem, deeperItem.checked)" type="checkbox" class="mr-2" />
                            <label :for="getItemId(deeperItem, nestedItem, subItem, item)">{{ deeperItem.name }}</label>
                          </div>
                          <div v-if="deeperItem.hasSub" class="ml-4">
                            <!-- Further recursion if needed -->
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Displaying path check results for testing -->
          <div>
            <h3 class="font-bold mb-2">Check Path Result:</h3>
            <p>Path "lesson.create": {{ checkPathResult('lesson.access') }}</p>
            <p>Path "exam.pretest.create": {{ checkPathResult('exam.pretest.take') }}</p>
          </div>

        </div>
      </div>
    </div>

</template>

<script>
import { checkPath } from './Limitation';

export default {
  data() {
    return {
      showModal: false,
      limitation: [
        {
          code: 'lesson', name: 'หลักสูตร (Lesson)', hasSub: true, subItems: [
            { code: 'access', name: 'เข้าเรียน' },
            { code: 'access_not_record', name: 'เข้าเรียนไม่บันทึกความคืบหน้า' },
            { code: 'view', name: 'ดูเนื้อหาเข้าเรียนไม่ได้' }
          ]
        },
        {
          code: 'exam', name: 'การวัดผล (Exam)', hasSub: true, subItems: [
            {
              code: 'pretest', name: 'แบบทดสอบก่อนเรียน', hasSub: true, subItems: [
                { code: 'take', name: 'ทำแบบทดสอบ' },
                { code: 'score', name: 'แสดงคะแนน' },
                { code: 'cert', name: 'แสดงใบรับรอง' },
                { code: 'download', name: 'ดาวน์โหลดใบรับรอง' },
              ]
            },
            {
              code: 'posttest', name: 'แบบทดสอบวัดผล', hasSub: true, subItems: [
                { code: 'take', name: 'ทำแบบทดสอบ' },
                { code: 'score', name: 'แสดงคะแนน' },
                { code: 'cert', name: 'แสดงใบรับรอง' },
                { code: 'download', name: 'ดาวน์โหลดใบรับรอง' },
              ]
            },
            {
              code: 'retest', name: 'สอบซ่อม', hasSub: true, subItems: [
                { code: 'take', name: 'ทำแบบทดสอบ' },
                { code: 'score', name: 'แสดงคะแนน' },
                { code: 'cert', name: 'แสดงใบรับรอง' },
                { code: 'download', name: 'ดาวน์โหลดใบรับรอง' },
              ]
            }
          ]
        }
      ],
      checkedItems: []
    };
  },
  watch: {
    limitation: {
      handler() {
        this.updateCheckedItems();
      },
      deep: true
    }
  },
  methods: {
    getItemId(item, parentItem, grandParentItem, greatGrandParentItem) {
      let id = item.code;
      if (parentItem) id = parentItem.code + '-' + id;
      if (grandParentItem) id = grandParentItem.code + '-' + id;
      if (greatGrandParentItem) id = greatGrandParentItem.code + '-' + id;
      return id;
    },
    checkAll(item, checked) {
      if (item.hasSub && item.subItems) {
        item.subItems.forEach(subItem => {
          subItem.checked = checked;
          this.checkAll(subItem, checked); // Recursively check/uncheck sub-items
        });
      }
      this.updateCheckedItems();
    },
    updateCheckedItems() {
      const result = [];
      const traverse = (items, path = '') => {
        items.forEach(item => {
          const currentPath = path ? `${path}.${item.code}` : item.code;
          if (!item.hasSub) {
            result.push({ path: currentPath, checked: item.checked });
          }
          if (item.hasSub && item.subItems) {
            traverse(item.subItems, currentPath);
          }
        });
      };
      traverse(this.limitation);
      this.checkedItems = result;
    },
    checkPathResult(path) {
      return checkPath(this.checkedItems, path);
    }
  }
};
</script>

<style scoped>
/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  position: relative;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
}

.sub-items {
  margin-left: 20px;
}
</style>
