<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.name || 'Gallery' }}</label>
        </div>
        <div v-if="localItem.style === 'grid'" class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div v-for="(img, idx) in galleryImages" :key="idx" class="overflow-hidden rounded-md border border-gray-200 bg-white">
            <img :src="img.url" :alt="img.alt || 'Gallery Image'" class="w-full h-32 object-cover" />
          </div>
        </div>
        <div v-else-if="localItem.style === 'masonry'" class="columns-2 md:columns-3 gap-2">
          <div v-for="(img, idx) in galleryImages" :key="idx" class="mb-2 break-inside-avoid rounded-md border border-gray-200 bg-white overflow-hidden">
            <img :src="img.url" :alt="img.alt || 'Gallery Image'" class="w-full object-cover" />
          </div>
        </div>
        <div v-else-if="localItem.style === 'slider'" class="relative w-full">
          <div class="flex items-center justify-center">
            <button @click="prevSlide" class="px-2 py-1 text-gray-600 hover:text-blue-600" :disabled="galleryImages.length <= 1">
              <i class="fas fa-chevron-left"></i>
            </button>
            <img :src="galleryImages[sliderIndex]?.url" :alt="galleryImages[sliderIndex]?.alt || 'Gallery Image'" class="w-64 h-40 object-cover rounded-md border border-gray-200 mx-2" />
            <button @click="nextSlide" class="px-2 py-1 text-gray-600 hover:text-blue-600" :disabled="galleryImages.length <= 1">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="text-center text-xs text-gray-500 mt-1">{{ sliderIndex + 1 }} / {{ galleryImages.length }}</div>
        </div>
        <div v-else class="text-gray-400 text-sm">No images to display.</div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-else-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-images text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Gallery Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลและแหล่งข้อมูลของแกลเลอรี่</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <label class="popup-label block font-semibold mb-1">ชื่อ Gallery:</label>
              <input v-model="localItem.name" type="text" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="e.g., Product Gallery" />
            </div>
            <div>
              <label class="popup-label block font-semibold mb-1">รูปแบบแหล่งข้อมูล:</label>
              <select v-model="localItem.sourceType" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                <option value="single">เลือกรูปทีละรูป</option>
                <option value="folder">เลือกเป็นโฟลเดอร์</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="popup-label block font-semibold mb-1">สไตล์การแสดงผล:</label>
              <select v-model="localItem.style" class="w-full popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="slider">Slider</option>
              </select>
            </div>
          </div>
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-3">
            <div v-if="localItem.sourceType === 'single'">
              <label class="popup-label block font-semibold mb-2">เลือกรูปภาพ (เพิ่ม/ลบ/เรียงลำดับ):</label>
              <div v-if="!localItem.images || localItem.images.length === 0" class="text-sm text-gray-500 py-2 px-3 border rounded-md bg-gray-50">ยังไม่มีรูปภาพในแกลเลอรี่</div>
              <div v-for="(img, idx) in localItem.images" :key="idx" class="flex items-center mb-2">
                <img :src="img.url" :alt="img.alt || 'Gallery Image'" class="w-16 h-16 object-cover rounded border border-gray-200 mr-3" />
                <input v-model="img.alt" type="text" class="popup-input w-32 text-xs mr-2" placeholder="คำอธิบาย alt" />
                <button @click="moveImageUp(idx)" :disabled="idx === 0" class="option-btn"><i class="fas fa-arrow-up"></i></button>
                <button @click="moveImageDown(idx)" :disabled="idx === localItem.images.length - 1" class="option-btn"><i class="fas fa-arrow-down"></i></button>
                <button @click="removeImage(idx)" class="option-btn text-red-600 hover:text-red-700"><i class="fas fa-trash"></i></button>
              </div>
              <button @click="addImage" class="mt-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"><i class="fas fa-plus mr-1"></i> เพิ่มรูป</button>
            </div>
            <div v-else-if="localItem.sourceType === 'folder'">
              <label class="popup-label block font-semibold mb-2">เลือกโฟลเดอร์รูปภาพ:</label>
              <input v-model="localItem.folderPath" type="text" class="popup-input w-full" placeholder="ระบุ path หรือเลือกโฟลเดอร์ (mockup)" />
              <div class="text-xs text-gray-500 mt-1">* ระบบนี้เป็น mockup: ในระบบจริงควรเชื่อมต่อกับ file picker หรือ media manager</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'GalleryElement',
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {
        name: '',
        sourceType: 'single',
        style: 'grid',
        images: [],
        folderPath: '',
      },
      sliderIndex: 0,
    };
  },
  computed: {
    galleryImages() {
      if (this.localItem.sourceType === 'single') {
        return this.localItem.images || [];
      } else if (this.localItem.sourceType === 'folder') {
        // Mockup: return 6 placeholder images if folderPath is set
        if (this.localItem.folderPath) {
          return Array.from({ length: 6 }, (_, i) => ({ url: `https://picsum.photos/seed/${encodeURIComponent(this.localItem.folderPath + '-' + i)}/400/300`, alt: `Folder Image ${i + 1}` }));
        }
        return [];
      }
      return [];
    },
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          name: '',
          sourceType: 'single',
          style: 'grid',
          images: [],
          folderPath: '',
        };
        const currentItem = newItem && typeof newItem === 'object' ? newItem : {};
        this.localItem = { ...defaults, ...JSON.parse(JSON.stringify(currentItem)) };
        this.sliderIndex = 0;
      },
      deep: true,
      immediate: true,
    },
    localItem: {
      handler(newItem) {
        this.$emit('update-item', JSON.parse(JSON.stringify(newItem)));
      },
      deep: true,
    },
    'localItem.style'(val) {
      if (val === 'slider') this.sliderIndex = 0;
    },
    galleryImages(val) {
      if (this.sliderIndex >= val.length) this.sliderIndex = 0;
    },
  },
  methods: {
    addImage() {
      if (!this.localItem.images) this.localItem.images = [];
      this.localItem.images.push({ url: 'https://picsum.photos/seed/' + Math.random().toString(36).substring(2, 8) + '/400/300', alt: '' });
    },
    removeImage(idx) {
      this.localItem.images.splice(idx, 1);
    },
    moveImageUp(idx) {
      if (idx > 0) {
        const img = this.localItem.images.splice(idx, 1)[0];
        this.localItem.images.splice(idx - 1, 0, img);
      }
    },
    moveImageDown(idx) {
      if (idx < this.localItem.images.length - 1) {
        const img = this.localItem.images.splice(idx, 1)[0];
        this.localItem.images.splice(idx + 1, 0, img);
      }
    },
    prevSlide() {
      if (this.galleryImages.length > 0) {
        this.sliderIndex = (this.sliderIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
      }
    },
    nextSlide() {
      if (this.galleryImages.length > 0) {
        this.sliderIndex = (this.sliderIndex + 1) % this.galleryImages.length;
      }
    },
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem;
}
.popup-input {
  border-width: 1px;
  border-color: #d1d5db;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
  background-color: white;
  line-height: 1.25;
}
.option-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #374151;
  margin-left: 0.25rem;
  transition: background-color 0.15s;
}
.option-btn:hover:not(:disabled) {
  background-color: #e5e7eb;
}
.option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 