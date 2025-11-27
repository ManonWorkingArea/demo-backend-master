<template>
  <div class="pdf-container mx-auto p-4 bg-gray-100 rounded-lg shadow relative">
    <button @click="openModal" class="px-2 py-2 bg-blue-500 text-white rounded text-sm">ดูตัวอย่าง</button>
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="modal-content bg-white w-full h-full relative rounded-lg shadow-lg z-60">
        <div class="modal-header flex justify-between items-center p-2">
          <h2 class="text-sm font-semibold">{{ fileName }}</h2>
          <button @click="closeModal" class="px-2 py-2 bg-red-500 text-white rounded text-sm">ปิด</button>
        </div>
        <div class="modal-body flex-grow relative">
          <div class="watermark" v-if="watermarkText">{{ watermarkText }}</div>
          <PDF :src="pdfSrc" class="w-full h-full border-1 border-gray-300" />
        </div>
        <div class="modal-footer flex justify-end p-2" v-if="downloadable">
          <a :href="pdfSrc" :download="fileName" class="px-2 py-2 bg-green-500 text-white rounded text-sm">ดาวน์โหลด PDF</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PDF from 'pdf-vue3';

export default {
  components: {
    PDF,
  },
  props: {
    pdfSrc: {
      type: String,
      required: true,
      default: 'https://doa-academy.sgp1.digitaloceanspaces.com/2024/07/1720571567983.pdf',
    },
    fileName: {
      type: String,
      required: false,
      default: 'document.pdf',
    },
    downloadable: {
      type: Boolean,
      required: false,
      default: true,
    },
    watermarkText: {
      type: String,
      required: false,
      default: 'Digital License by FTI Academy Only',
    },
  },
  data() {
    return {
      isModalOpen: false,
    };
  },
  methods: {
    openModal() {
      this.isModalOpen = true;
      document.body.classList.add('overflow-hidden');
    },
    closeModal() {
      this.isModalOpen = false;
      document.body.classList.remove('overflow-hidden');
    },
  },
};
</script>

<style scoped>
.pdf-container {
  max-width: 800px;
  height: 100vh;
}

.overflow-hidden {
  overflow: hidden;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 20px; /* Add padding to the bottom */
}

.modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 10px;
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  position: relative;
}

.modal-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
}

.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 48px;
  color: rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  pointer-events: none;
  z-index: 999;
}
</style>
