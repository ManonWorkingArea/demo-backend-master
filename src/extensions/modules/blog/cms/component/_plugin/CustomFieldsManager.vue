<template>
  <div class="bg-white shadow-sm rounded-md border border-gray-200">
    <div class="p-3">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold text-gray-900">
          <i class="fas fa-cogs text-purple-600 mr-2"></i>
          Custom Fields Management
        </h2>
        <button
          @click="addNewField"
          type="button"
          class="inline-flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-1.5 rounded-md transition-colors text-xs"
        >
          <i class="fas fa-plus text-xs"></i>
          เพิ่ม Field
        </button>
      </div>

      <!-- Fields List -->
      <div v-if="localCustomFields.length === 0" class="text-center py-8 text-gray-500">
        <i class="fas fa-layer-group text-3xl mb-3 text-gray-300"></i>
        <p class="text-sm">ยังไม่มี Custom Fields</p>
        <p class="text-xs mt-1">คลิก "เพิ่ม Field" เพื่อเริ่มต้น</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(field, index) in localCustomFields"
          :key="field.id"
          class="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors"
          :class="{ 'border-purple-400 bg-purple-50': editingField === field.id }"
        >
          <!-- Field Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <i :class="getFieldIcon(field.type)" class="text-purple-600 text-sm"></i>
                <span class="font-medium text-sm text-gray-900">{{ field.label || `Field ${index + 1}` }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="field.position === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'"
                >
                  {{ field.position === 'main' ? 'Main' : 'Sidebar' }}
                </span>
                <span
                  v-if="field.required"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
                >
                  Required
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="editField(field.id)"
                type="button"
                class="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors"
                title="แก้ไข"
              >
                <i class="fas fa-edit text-xs"></i>
              </button>
              <button
                @click="duplicateField(field.id)"
                type="button"
                class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="คัดลอก"
              >
                <i class="fas fa-copy text-xs"></i>
              </button>
              <button
                @click="deleteField(field.id)"
                type="button"
                class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                title="ลบ"
              >
                <i class="fas fa-trash text-xs"></i>
              </button>
              <button
                @click="moveField(index, index - 1)"
                :disabled="index === 0"
                type="button"
                class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="ย้ายขึ้น"
              >
                <i class="fas fa-chevron-up text-xs"></i>
              </button>
              <button
                @click="moveField(index, index + 1)"
                :disabled="index === localCustomFields.length - 1"
                type="button"
                class="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="ย้ายลง"
              >
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Field Preview -->
          <div v-if="editingField !== field.id" class="text-xs text-gray-600 mb-2">
            <div v-if="field.description" class="mb-1">{{ field.description }}</div>
            <div class="flex items-center gap-4">
              <span>Type: <strong>{{ getFieldTypeLabel(field.type) }}</strong></span>
              <span v-if="field.placeholder">Placeholder: "{{ field.placeholder }}"</span>
              <span v-if="field.defaultValue">Default: "{{ field.defaultValue }}"</span>
            </div>
          </div>

          <!-- Field Edit Form -->
          <div v-if="editingField === field.id" class="space-y-3 border-t border-gray-200 pt-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Field Label -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Label</label>
                <input
                  v-model="field.label"
                  type="text"
                  class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs"
                  placeholder="Field Label"
                />
              </div>

              <!-- Field Name -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                <input
                  v-model="field.name"
                  type="text"
                  class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs font-mono"
                  placeholder="field_name"
                />
              </div>

              <!-- Field Type -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select
                  v-model="field.type"
                  class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs"
                >
                  <option value="input">Text Input</option>
                  <option value="textarea">Textarea</option>
                  <option value="datetime">Date/Time</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="image">Image Upload</option>
                </select>
              </div>

              <!-- Position -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Position</label>
                <select
                  v-model="field.position"
                  class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs"
                >
                  <option value="main">Main Content</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="field.description"
                rows="2"
                class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs resize-none"
                placeholder="Field description..."
              ></textarea>
            </div>

            <!-- Options for Radio/Checkbox -->
            <div v-if="field.type === 'radio' || field.type === 'checkbox'" class="space-y-2">
              <label class="block text-xs font-medium text-gray-700">Options</label>
              <div class="space-y-2">
                <div
                  v-for="(option, optIndex) in field.options"
                  :key="optIndex"
                  class="flex items-center gap-2"
                >
                  <input
                    v-model="option.value"
                    type="text"
                    class="flex-1 rounded border border-gray-300 py-1 px-2 text-xs focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    placeholder="Option value"
                  />
                  <input
                    v-model="option.label"
                    type="text"
                    class="flex-1 rounded border border-gray-300 py-1 px-2 text-xs focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
                    placeholder="Option label"
                  />
                  <button
                    @click="removeOption(field.id, optIndex)"
                    type="button"
                    class="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                  >
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </div>
                <button
                  @click="addOption(field.id)"
                  type="button"
                  class="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-xs"
                >
                  <i class="fas fa-plus text-xs"></i>
                  Add Option
                </button>
              </div>
            </div>

            <!-- Additional Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Placeholder -->
              <div v-if="['input', 'textarea'].includes(field.type)">
                <label class="block text-xs font-medium text-gray-700 mb-1">Placeholder</label>
                <input
                  v-model="field.placeholder"
                  type="text"
                  class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs"
                  placeholder="Placeholder text"
                />
              </div>

              <!-- Default Value -->
              <div v-if="!['image'].includes(field.type)">
                <label class="block text-xs font-medium text-gray-700 mb-1">Default Value</label>
                <input
                  v-model="field.defaultValue"
                  type="text"
                  class="block w-full rounded border border-gray-300 py-1.5 px-2 shadow-sm focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600 text-xs"
                  placeholder="Default value"
                />
              </div>
            </div>

            <!-- Field Options -->
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input
                  v-model="field.required"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span class="text-xs text-gray-700">Required Field</span>
              </label>

              <label v-if="field.type === 'input'" class="flex items-center gap-2">
                <input
                  v-model="field.validation.unique"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span class="text-xs text-gray-700">Unique Values</span>
              </label>

              <label v-if="['input', 'textarea'].includes(field.type)" class="flex items-center gap-2">
                <input
                  v-model="field.searchable"
                  type="checkbox"
                  class="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                />
                <span class="text-xs text-gray-700">Searchable</span>
              </label>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                @click="cancelEditField"
                type="button"
                class="px-3 py-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                @click="saveField(field.id)"
                type="button"
                class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-xs"
              >
                Save Field
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Templates -->
      <div v-if="localCustomFields.length === 0" class="mt-4 pt-4 border-t border-gray-200">
        <h3 class="text-xs font-medium text-gray-700 mb-2">Quick Templates</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            @click="addTemplateFields('contact')"
            type="button"
            class="p-2 text-left border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <i class="fas fa-address-book text-purple-600 mb-1"></i>
            <div class="text-xs font-medium">Contact Form</div>
            <div class="text-xs text-gray-500">Name, Email, Phone</div>
          </button>

          <button
            @click="addTemplateFields('blog')"
            type="button"
            class="p-2 text-left border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <i class="fas fa-blog text-purple-600 mb-1"></i>
            <div class="text-xs font-medium">Blog Post</div>
            <div class="text-xs text-gray-500">Author, Category, Tags</div>
          </button>

          <button
            @click="addTemplateFields('news')"
            type="button"
            class="p-2 text-left border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <i class="fas fa-newspaper text-purple-600 mb-1"></i>
            <div class="text-xs font-medium">News Article</div>
            <div class="text-xs text-gray-500">Reporter, Source, Date</div>
          </button>

          <button
            @click="addTemplateFields('event')"
            type="button"
            class="p-2 text-left border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <i class="fas fa-calendar text-purple-600 mb-1"></i>
            <div class="text-xs font-medium">Event</div>
            <div class="text-xs text-gray-500">Date, Location, Price</div>
          </button>

          <button
            @click="addTemplateFields('product')"
            type="button"
            class="p-2 text-left border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <i class="fas fa-shopping-bag text-purple-600 mb-1"></i>
            <div class="text-xs font-medium">Product</div>
            <div class="text-xs text-gray-500">Price, SKU, Gallery</div>
          </button>

          <button
            @click="addTemplateFields('team')"
            type="button"
            class="p-2 text-left border border-gray-200 rounded hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <i class="fas fa-users text-purple-600 mb-1"></i>
            <div class="text-xs font-medium">Team Member</div>
            <div class="text-xs text-gray-500">Position, Bio, Social</div>
          </button>
        </div>
      </div>

      <!-- Field Summary -->
      <div v-if="localCustomFields.length > 0" class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-600">
          <div class="flex items-center gap-4">
            <span>Total Fields: <strong>{{ localCustomFields.length }}</strong></span>
            <span>Main: <strong>{{ localCustomFields.filter(f => f.position === 'main').length }}</strong></span>
            <span>Sidebar: <strong>{{ localCustomFields.filter(f => f.position === 'sidebar').length }}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="exportFields"
              type="button"
              class="text-purple-600 hover:text-purple-700"
              title="Export Fields"
            >
              <i class="fas fa-download"></i>
            </button>
            <label class="text-purple-600 hover:text-purple-700 cursor-pointer" title="Import Fields">
              <i class="fas fa-upload"></i>
              <input
                type="file"
                accept=".json"
                @change="importFields"
                class="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomFieldsManager',
  props: {
    customFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localCustomFields: [],
      editingField: null,
      fieldIdCounter: 1
    }
  },
  watch: {
    customFields: {
      handler(newFields) {
        // Only update if the arrays are actually different to prevent recursion
        if (JSON.stringify(newFields) !== JSON.stringify(this.localCustomFields)) {
          this.localCustomFields = JSON.parse(JSON.stringify(newFields));
          this.fieldIdCounter = Math.max(...newFields.map(f => f.id || 0), 0) + 1;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // Helper method to emit updates with debounce
    emitUpdate() {
      this.$emit('update:customFields', JSON.parse(JSON.stringify(this.localCustomFields)));
    },

    addNewField() {
      const newField = {
        id: this.fieldIdCounter++,
        name: '',
        label: '',
        type: 'input',
        position: 'main',
        description: '',
        placeholder: '',
        defaultValue: '',
        required: false,
        searchable: false,
        options: [],
        validation: {
          unique: false,
          min: null,
          max: null,
          pattern: ''
        }
      };
      
      this.localCustomFields.push(newField);
      this.editField(newField.id);
      this.emitUpdate();
    },

    editField(fieldId) {
      this.editingField = fieldId;
    },

    cancelEditField() {
      this.editingField = null;
    },

    saveField(fieldId) {
      const field = this.localCustomFields.find(f => f.id === fieldId);
      if (field) {
        // Auto-generate field name if empty
        if (!field.name && field.label) {
          field.name = this.slugify(field.label).replace(/-/g, '_');
        }
        
        // Validate required fields
        if (!field.label || !field.name) {
          this.$toast?.error('กรุณากรอก Label และ Field Name');
          return;
        }
        
        // Check for duplicate field names
        const duplicateName = this.localCustomFields.find(f => f.id !== fieldId && f.name === field.name);
        if (duplicateName) {
          this.$toast?.error('Field Name ซ้ำกัน กรุณาใช้ชื่ออื่น');
          return;
        }
      }
      
      this.editingField = null;
      this.emitUpdate();
      this.$toast?.success('บันทึก Field สำเร็จ');
    },

    deleteField(fieldId) {
      this.$swal({
        title: 'ลบ Field นี้?',
        text: 'การกระทำนี้ไม่สามารถย้อนกลับได้',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#ef4444'
      }).then((result) => {
        if (result.isConfirmed) {
          this.localCustomFields = this.localCustomFields.filter(f => f.id !== fieldId);
          this.emitUpdate();
          this.$toast?.success('ลบ Field สำเร็จ');
        }
      });
    },

    duplicateField(fieldId) {
      const originalField = this.localCustomFields.find(f => f.id === fieldId);
      if (originalField) {
        const duplicatedField = {
          ...JSON.parse(JSON.stringify(originalField)),
          id: this.fieldIdCounter++,
          name: originalField.name + '_copy',
          label: originalField.label + ' (Copy)'
        };
        
        this.localCustomFields.push(duplicatedField);
        this.emitUpdate();
        this.$toast?.success('คัดลอก Field สำเร็จ');
      }
    },

    moveField(fromIndex, toIndex) {
      if (toIndex < 0 || toIndex >= this.localCustomFields.length) return;
      
      const field = this.localCustomFields.splice(fromIndex, 1)[0];
      this.localCustomFields.splice(toIndex, 0, field);
      this.emitUpdate();
    },

    addOption(fieldId) {
      const field = this.localCustomFields.find(f => f.id === fieldId);
      if (field) {
        if (!field.options) field.options = [];
        field.options.push({ value: '', label: '' });
        this.emitUpdate();
      }
    },

    removeOption(fieldId, optionIndex) {
      const field = this.localCustomFields.find(f => f.id === fieldId);
      if (field && field.options) {
        field.options.splice(optionIndex, 1);
        this.emitUpdate();
      }
    },

    getFieldIcon(type) {
      const icons = {
        input: 'fas fa-font',
        textarea: 'fas fa-align-left',
        datetime: 'fas fa-calendar-alt',
        radio: 'fas fa-dot-circle',
        checkbox: 'fas fa-check-square',
        image: 'fas fa-image'
      };
      return icons[type] || 'fas fa-question';
    },

    getFieldTypeLabel(type) {
      const labels = {
        input: 'Text Input',
        textarea: 'Textarea',
        datetime: 'Date/Time',
        radio: 'Radio Buttons',
        checkbox: 'Checkbox',
        image: 'Image Upload'
      };
      return labels[type] || type;
    },

    addTemplateFields(template) {
      const templates = {
        contact: [
          {
            id: this.fieldIdCounter++,
            name: 'full_name',
            label: 'ชื่อ-นามสกุล',
            type: 'input',
            position: 'main',
            required: true,
            placeholder: 'กรอกชื่อ-นามสกุล'
          },
          {
            id: this.fieldIdCounter++,
            name: 'email',
            label: 'อีเมล',
            type: 'input',
            position: 'main',
            required: true,
            placeholder: 'example@email.com'
          },
          {
            id: this.fieldIdCounter++,
            name: 'phone',
            label: 'เบอร์โทรศัพท์',
            type: 'input',
            position: 'sidebar',
            placeholder: '0XX-XXX-XXXX'
          }
        ],
        blog: [
          {
            id: this.fieldIdCounter++,
            name: 'author',
            label: 'ผู้เขียน',
            type: 'input',
            position: 'sidebar',
            required: true,
            placeholder: 'ชื่อผู้เขียน'
          },
          {
            id: this.fieldIdCounter++,
            name: 'category',
            label: 'หมวดหมู่',
            type: 'radio',
            position: 'sidebar',
            required: true,
            options: [
              { value: 'technology', label: 'เทคโนโลยี' },
              { value: 'lifestyle', label: 'ไลฟ์สไตล์' },
              { value: 'business', label: 'ธุรกิจ' },
              { value: 'education', label: 'การศึกษา' },
              { value: 'health', label: 'สุขภาพ' }
            ]
          },
          {
            id: this.fieldIdCounter++,
            name: 'tags',
            label: 'แท็ก',
            type: 'input',
            position: 'sidebar',
            placeholder: 'แยกด้วยเครื่องหมายจุลภาค',
            description: 'แท็กสำหรับการค้นหาและจัดหมวดหมู่'
          },
          {
            id: this.fieldIdCounter++,
            name: 'excerpt',
            label: 'บทสรุป',
            type: 'textarea',
            position: 'main',
            placeholder: 'เขียนบทสรุปสั้นๆ ของบทความ...',
            description: 'ข้อความสรุปที่จะแสดงในหน้ารายการบทความ'
          },
          {
            id: this.fieldIdCounter++,
            name: 'reading_time',
            label: 'เวลาอ่าน (นาที)',
            type: 'input',
            position: 'sidebar',
            placeholder: '5',
            description: 'ระยะเวลาโดยประมาณในการอ่านบทความ'
          },
          {
            id: this.fieldIdCounter++,
            name: 'featured_image_alt',
            label: 'คำอธิบายรูปภาพหลัก',
            type: 'input',
            position: 'main',
            placeholder: 'อธิบายเนื้อหาของรูปภาพ',
            description: 'สำหรับการเข้าถึงและ SEO'
          }
        ],
        news: [
          {
            id: this.fieldIdCounter++,
            name: 'reporter',
            label: 'ผู้สื่อข่าว',
            type: 'input',
            position: 'sidebar',
            required: true,
            placeholder: 'ชื่อผู้สื่อข่าว'
          },
          {
            id: this.fieldIdCounter++,
            name: 'news_source',
            label: 'แหล่งข่าว',
            type: 'input',
            position: 'sidebar',
            placeholder: 'หน่วยงาน หรือ บริษัท',
            description: 'แหล่งที่มาของข่าว'
          },
          {
            id: this.fieldIdCounter++,
            name: 'publish_date',
            label: 'วันที่เผยแพร่',
            type: 'datetime',
            position: 'sidebar',
            required: true,
            description: 'วันที่และเวลาที่ต้องการเผยแพร่ข่าว'
          },
          {
            id: this.fieldIdCounter++,
            name: 'news_category',
            label: 'ประเภทข่าว',
            type: 'radio',
            position: 'sidebar',
            required: true,
            options: [
              { value: 'breaking', label: 'ข่าวด่วน' },
              { value: 'politics', label: 'การเมือง' },
              { value: 'economy', label: 'เศรษฐกิจ' },
              { value: 'society', label: 'สังคม' },
              { value: 'sports', label: 'กีฬา' },
              { value: 'entertainment', label: 'บันเทิง' }
            ]
          },
          {
            id: this.fieldIdCounter++,
            name: 'location',
            label: 'สถานที่เกิดเหตุ',
            type: 'input',
            position: 'main',
            placeholder: 'จังหวัด หรือ พื้นที่ที่เกิดเหตุการณ์'
          },
          {
            id: this.fieldIdCounter++,
            name: 'urgency_level',
            label: 'ระดับความสำคัญ',
            type: 'radio',
            position: 'sidebar',
            options: [
              { value: 'low', label: 'ต่ำ' },
              { value: 'medium', label: 'ปานกลาง' },
              { value: 'high', label: 'สูง' },
              { value: 'urgent', label: 'เร่งด่วน' }
            ],
            defaultValue: 'medium'
          },
          {
            id: this.fieldIdCounter++,
            name: 'related_links',
            label: 'ลิงก์ที่เกี่ยวข้อง',
            type: 'textarea',
            position: 'main',
            placeholder: 'URL ของข่าวที่เกี่ยวข้อง (แยกด้วย Enter)',
            description: 'ลิงก์ไปยังข่าวหรือเอกสารที่เกี่ยวข้อง'
          }
        ],
        event: [
          {
            id: this.fieldIdCounter++,
            name: 'event_date',
            label: 'วันที่จัดงาน',
            type: 'datetime',
            position: 'main',
            required: true
          },
          {
            id: this.fieldIdCounter++,
            name: 'location',
            label: 'สถานที่',
            type: 'input',
            position: 'main',
            placeholder: 'สถานที่จัดงาน'
          },
          {
            id: this.fieldIdCounter++,
            name: 'price',
            label: 'ราคาบัตร',
            type: 'input',
            position: 'sidebar',
            placeholder: '0.00'
          }
        ],
        product: [
          {
            id: this.fieldIdCounter++,
            name: 'price',
            label: 'ราคา',
            type: 'input',
            position: 'sidebar',
            required: true,
            placeholder: '0.00'
          },
          {
            id: this.fieldIdCounter++,
            name: 'sku',
            label: 'รหัสสินค้า',
            type: 'input',
            position: 'sidebar',
            placeholder: 'SKU-001'
          },
          {
            id: this.fieldIdCounter++,
            name: 'gallery',
            label: 'แกลเลอรี่',
            type: 'image',
            position: 'main'
          }
        ],
        team: [
          {
            id: this.fieldIdCounter++,
            name: 'position',
            label: 'ตำแหน่ง',
            type: 'input',
            position: 'sidebar',
            placeholder: 'ตำแหน่งงาน'
          },
          {
            id: this.fieldIdCounter++,
            name: 'bio',
            label: 'ประวัติ',
            type: 'textarea',
            position: 'main',
            placeholder: 'เล่าเกี่ยวกับตัวเอง...'
          },
          {
            id: this.fieldIdCounter++,
            name: 'social_links',
            label: 'Social Media',
            type: 'textarea',
            position: 'sidebar',
            placeholder: 'Facebook, Twitter, LinkedIn...'
          }
        ]
      };

      if (templates[template]) {
        // Add validation and default properties
        const fieldsToAdd = templates[template].map(field => ({
          ...field,
          description: field.description || '',
          defaultValue: field.defaultValue || '',
          searchable: false,
          options: field.options || [],
          validation: {
            unique: false,
            min: null,
            max: null,
            pattern: ''
          }
        }));

        this.localCustomFields.push(...fieldsToAdd);
        this.emitUpdate();
        this.$toast?.success(`เพิ่ม ${this.getTemplateLabel(template)} template สำเร็จ`);
      }
    },

    getTemplateLabel(template) {
      const labels = {
        contact: 'Contact Form',
        blog: 'Blog Post',
        news: 'News Article',
        event: 'Event',
        product: 'Product',
        team: 'Team Member'
      };
      return labels[template] || template;
    },

    exportFields() {
      const exportData = {
        timestamp: new Date().toISOString(),
        fields: this.localCustomFields,
        metadata: {
          version: '1.0',
          type: 'custom-fields'
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-fields-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.$toast?.success('ส่งออก Fields สำเร็จ');
    },

    importFields(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.fields && Array.isArray(importData.fields)) {
            // Update field IDs to avoid conflicts
            const importedFields = importData.fields.map(field => ({
              ...field,
              id: this.fieldIdCounter++
            }));

            this.localCustomFields.push(...importedFields);
            this.emitUpdate();
            this.$toast?.success(`นำเข้า ${importedFields.length} fields สำเร็จ`);
          } else {
            this.$toast?.error('รูปแบบไฟล์ไม่ถูกต้อง');
          }
        } catch (error) {
          console.error('Import error:', error);
          this.$toast?.error('เกิดข้อผิดพลาดในการนำเข้า');
        }
      };
      reader.readAsText(file);

      // Clear the input
      event.target.value = '';
    },

    slugify(str) {
      if (!str || typeof str !== "string") {
        return "";
      }
      str = str.trim().toLowerCase();
      var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }
      str = str
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      var lastDotIndex = str.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        str = str.substring(0, lastDotIndex);
      }
      return str;
    }
  },
  emits: ['update:customFields']
}
</script>
