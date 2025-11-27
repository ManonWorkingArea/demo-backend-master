<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">
            <img v-if="localItem.slides && localItem.slides.length > 0 && localItem.slides[0].image" :src="localItem.slides[0].image" alt="First slide" class="w-16 h-10 object-cover rounded-md bg-gray-200"/>
            <div v-else class="w-16 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">Slideshow</p>
            <p class="text-xs text-gray-500">{{ localItem.slides ? localItem.slides.length : 0 }} slides</p>
            <p v-if="localItem.slides && localItem.slides.length > 0 && localItem.slides[0].title" class="text-xs text-gray-500 truncate" :title="localItem.slides[0].title">
              First: {{ localItem.slides[0].title }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <FileBrowser
        class="z-[9999]"
        v-if="slideImageBrowserOpenForIndex !== null"
        :isWindowsOpen="true"
        :callbackFunction="'slideshow_image_' + slideImageBrowserOpenForIndex"
        :allowFileType="['jpg', 'gif', 'png', 'jpeg']"
        @file-browser-trigger="handleSlideFileBrowserClose"
        @file-browser-callback="handleSlideImageSelected"
      />

      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-images text-blue-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Slideshow Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของสไลด์โชว์</p>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 space-y-6">
          <!-- Slides List -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div
              v-for="(slide, index) in localItem.slides"
              :key="index"
              class="slide-item flex items-start border-b border-gray-200 py-4 pr-4"
            >
              <div
                class="slide-thumbnail w-1/5 relative mr-3 cursor-pointer"
                @click="openSlideImageBrowser(index)"
              >
                <div v-if="slide.image" class="thumbnail-wrapper h-24 w-24 relative overflow-hidden rounded border bg-gray-100">
                  <img
                    :src="slide.image"
                    alt="Slide Thumbnail"
                    class="w-full h-full object-cover"
                  />
                  <div
                    class="upload-icon absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-75 bg-black bg-opacity-25 transition-opacity"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'upload']"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                </div>
                <div
                  v-else
                  class="thumbnail-placeholder flex items-center justify-center h-24 w-24 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300"
                >
                  <font-awesome-icon
                    :icon="['fas', 'image']"
                    class="h-8 w-8 text-gray-400"
                  />
                </div>
              </div>

              <div class="slide-details-container w-4/5 ml-4">
                <div v-if="editingSlideIndex !== index" class="slide-summary">
                  <div class="slide-content">
                    <h3 class="font-semibold text-base">{{ slide.title || 'Untitled Slide' }}</h3>
                    <p class="text-gray-600 text-sm">{{ slide.subtitle }}</p>
                    <p class="text-gray-600 text-xs italic">{{ slide.link }}</p>
                  </div>
                  <div class="slide-actions flex items-center mt-2 space-x-1">
                    <button @click="showSlideActionPanel(index)" class="p-1 bg-gray-200 hover:bg-gray-300 rounded" title="Edit Slide">
                      <font-awesome-icon :icon="['fas', 'pencil']" class="h-3 w-3 text-gray-700"/>
                    </button>
                    <button @click="cloneSlide(index)" class="p-1 bg-gray-200 hover:bg-gray-300 rounded" title="Clone Slide">
                      <font-awesome-icon :icon="['fas', 'clone']" class="h-3 w-3 text-gray-700" />
                    </button>
                    <button @click="moveSlideUp(index)" :disabled="index === 0" class="p-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed" title="Move Up">
                      <font-awesome-icon :icon="['fas', 'chevron-up']" class="h-3 w-3 text-gray-700" />
                    </button>
                    <button @click="moveSlideDown(index)" :disabled="index === localItem.slides.length - 1" class="p-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed" title="Move Down">
                      <font-awesome-icon :icon="['fas', 'chevron-down']" class="h-3 w-3 text-gray-700" />
                    </button>
                    <button @click="deleteSlide(index)" class="p-1 bg-red-200 hover:bg-red-300 rounded ml-auto" title="Delete Slide">
                      <font-awesome-icon :icon="['fas', 'times']" class="h-3 w-3 text-red-700" />
                    </button>
                  </div>
                </div>

                <div v-if="editingSlideIndex === index" class="slide-action-panel space-y-2">
                  <input
                    v-model="slide.title"
                    type="text"
                    class="slide-input text-base border border-gray-300 rounded-md w-full p-2"
                    placeholder="Slide Title"
                  />
                  <input
                    v-model="slide.subtitle"
                    type="text"
                    class="slide-input text-sm border border-gray-300 rounded-md w-full p-2"
                    placeholder="Slide Subtitle"
                  />
                  <input
                    v-model="slide.link"
                    type="text"
                    class="slide-input text-sm border border-gray-300 rounded-md w-full p-2"
                    placeholder="Slide URL (e.g., https://example.com)"
                  />
                  <div class="grid grid-cols-2 gap-x-4">
                    <label class="inline-flex items-center">
                      <input v-model="slide.button" type="checkbox" class="form-checkbox rounded"/>
                      <span class="ml-2 text-sm">Show Button</span>
                    </label>
                    <label class="inline-flex items-center">
                      <input v-model="slide.content" type="checkbox" class="form-checkbox rounded" />
                      <span class="ml-2 text-sm">Show Content Text</span>
                    </label>
                  </div>
                  <div class="slide-action-buttons flex space-x-2 mt-2">
                    <button @click="saveSlideChanges" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Save</button>
                    <button @click="cancelSlideEdit" class="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm">Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="addSlide"
              class="w-full border pt-2 pb-2 border-gray-300 hover:bg-gray-100 text-center add-slide-btn mt-4 text-gray-600 rounded flex items-center justify-center text-sm"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-2 h-3 w-3"/>Add Slide
            </button>
          </div>

          <!-- Slideshow Options -->
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="popup-label text-sm font-semibold">Interval (ms):</label>
              <input
                v-model.number="localItem.interval"
                type="number"
                class="popup-input border border-gray-300 rounded-md w-full p-2 text-sm"
                placeholder="e.g., 4000"
              />
            </div>
            <div class="flex items-center pt-5">
              <input
                v-model="localItem.autoplay"
                type="checkbox"
                class="form-checkbox rounded"
                id="slideshow_autoplay"
              />
              <label for="slideshow_autoplay" class="ml-2 popup-label text-sm">Autoplay</label>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import FileBrowser from "@/interface/modal/FileBrowser.vue";

export default {
  name: 'SlideshowElement',
  components: {
    FileBrowser,
  },
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
      localItem: JSON.parse(JSON.stringify(this.item)),
      editingSlideIndex: null,
      slideImageBrowserOpenForIndex: null, 
    };
  },
  watch: {
    item: {
      handler(newItem) {
        if (JSON.stringify(newItem) !== JSON.stringify(this.localItem)) {
          this.localItem = JSON.parse(JSON.stringify(newItem));
        }
      },
      deep: true,
    },
    localItem: {
      handler(updatedLocalItem) {
        if (JSON.stringify(updatedLocalItem) !== JSON.stringify(this.item)) {
          this.$emit('update-item', JSON.parse(JSON.stringify(updatedLocalItem)));
        }
      },
      deep: true,
    },
  },
  methods: {
    addSlide() {
      const newSlide = { title: "New Slide", subtitle: "", image: "", link: "", button: false, content: true };
      
      // Ensure localItem.slides is an array and update it reactively
      const currentSlides = Array.isArray(this.localItem.slides) ? this.localItem.slides : [];
      const updatedSlides = currentSlides.concat(newSlide);
      
      this.localItem = {
        ...this.localItem,
        slides: updatedSlides
      };
      
      this.editingSlideIndex = this.localItem.slides.length - 1; // Optionally edit new slide
    },
    deleteSlide(index) {
      if (this.localItem.slides && this.localItem.slides[index]) {
        this.localItem.slides.splice(index, 1);
        if (this.editingSlideIndex === index) {
          this.editingSlideIndex = null;
        } else if (this.editingSlideIndex > index) {
          this.editingSlideIndex--;
        }
      }
    },
    moveSlideUp(index) {
      if (this.localItem.slides && index > 0) {
        const slide = this.localItem.slides.splice(index, 1)[0];
        this.localItem.slides.splice(index - 1, 0, slide);
        if (this.editingSlideIndex === index) {
            this.editingSlideIndex = index -1;
        } else if (this.editingSlideIndex === index - 1) {
            this.editingSlideIndex = index;
        }
      }
    },
    moveSlideDown(index) {
      if (this.localItem.slides && index < this.localItem.slides.length - 1) {
        const slide = this.localItem.slides.splice(index, 1)[0];
        this.localItem.slides.splice(index + 1, 0, slide);
         if (this.editingSlideIndex === index) {
            this.editingSlideIndex = index + 1;
        } else if (this.editingSlideIndex === index + 1) {
            this.editingSlideIndex = index;
        }
      }
    },
    cloneSlide(index) {
      if (this.localItem.slides && this.localItem.slides[index]) {
        const slide = this.localItem.slides[index];
        const clonedSlide = JSON.parse(JSON.stringify(slide));
        this.localItem.slides.splice(index + 1, 0, clonedSlide);
      }
    },
    showSlideActionPanel(index) {
      this.editingSlideIndex = index;
    },
    saveSlideChanges() {
      this.editingSlideIndex = null;
      // Watcher on localItem will emit the update
    },
    cancelSlideEdit() {
      // Potentially revert changes if needed, for now just closes edit panel
      // If reverting: need to store a copy of slide before editing
      this.editingSlideIndex = null;
    },
    openSlideImageBrowser(index) {
      this.slideImageBrowserOpenForIndex = index;
    },
    handleSlideFileBrowserClose() {
        // This method is called by file-browser-trigger when the browser itself is closed by user action
        // (e.g. escape key or cancel button within the FileBrowser component, if it has one)
        this.slideImageBrowserOpenForIndex = null;
    },
    handleSlideImageSelected(payload) {
      console.log('[Slideshow] handleSlideImageSelected PAYLOAD:', JSON.stringify(payload));

      let slideIndexFromCallback = null;
      if (payload && typeof payload.callback === 'string') {
        const parts = payload.callback.split('_');
        const potentialIndex = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(potentialIndex)) {
          slideIndexFromCallback = potentialIndex;
        }
      }
      console.log('[Slideshow] Extracted slideIndexFromCallback:', slideIndexFromCallback);

      if (payload && typeof payload.file === 'string' && payload.file.trim() !== '' && slideIndexFromCallback !== null) {
        const slideIndex = slideIndexFromCallback; // Use index from callback

        if (this.localItem && Array.isArray(this.localItem.slides) && this.localItem.slides[slideIndex]) {
          console.log('[Slideshow] BEFORE update, slide image for index', slideIndex, ':', this.localItem.slides[slideIndex].image);

          const updatedSlides = this.localItem.slides.map((slide, idx) => {
            if (idx === slideIndex) {
              return {
                ...slide,
                image: payload.file,
              };
            }
            return slide;
          });

          this.localItem = {
            ...this.localItem,
            slides: updatedSlides,
          };

          console.log('[Slideshow] AFTER update, localItem.slides[' + slideIndex + '].image:', this.localItem.slides[slideIndex].image);
        } else {
          console.error('[Slideshow] Condition not met for update (using slideIndexFromCallback):', {
            localItemExists: !!this.localItem,
            slidesIsArray: Array.isArray(this.localItem && this.localItem.slides),
            slideExistsAtIndex: !!(this.localItem && this.localItem.slides && this.localItem.slides[slideIndex]),
            slideIndexUsed: slideIndex
          });
        }
      } else {
        console.warn('[Slideshow] Invalid payload, file, or could not extract slideIndexFromCallback for update:', {
            payloadReceived: !!payload,
            payloadFile: payload ? payload.file : 'payload_undefined',
            payloadCallback: payload ? payload.callback : 'payload_undefined',
            slideIndexFromCallback: slideIndexFromCallback
        });
      }
      // Ensure browser is marked for closure, as this instance completed its job or failed to get needed info.
      this.slideImageBrowserOpenForIndex = null;
    }
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
  color: #4a5568; /* gray-700 */
  margin-bottom: 0.25rem;
}
.popup-input, .slide-input {
  border-width: 1px;
  border-color: #e2e8f0; /* gray-300 */
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
}
.form-checkbox {
  color: #4f46e5; /* indigo-600 */
  border-radius: 0.25rem; /* rounded */
}
.form-checkbox:focus {
  ring-color: #818cf8; /* indigo-300 */
}
.section-group {
  margin-bottom: 1rem;
}
.slide-item:last-child {
  border-bottom: none;
}
</style> 