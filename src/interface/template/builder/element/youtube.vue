<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 text-gray-400">
            <!-- Heroicon name: solid/play -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">YouTube Video</p>
            <p class="text-xs text-gray-500 truncate" :title="localItem.youtubeurl || 'No URL'">
              {{ localItem.youtubeurl || 'No URL provided' }}
            </p>
            <p class="text-xs text-gray-500">
              Autoplay: {{ localItem.autoplay ? 'Yes' : 'No' }} | Controls: {{ localItem.controls ? 'Yes' : 'No' }}
            </p>
          </div>
        </div>
        <div v-if="localItem.youtubeurl && extractYouTubeId(localItem.youtubeurl)" class="mt-4">
          <div class="aspect-w-16 aspect-h-9">
            <iframe 
              :src="'https://www.youtube.com/embed/' + extractYouTubeId(localItem.youtubeurl) + '?autoplay=' + (localItem.autoplay ? 1 : 0) + '&controls=' + (localItem.controls ? 1 : 0) + '&loop=' + (localItem.loop ? 1 : 0) + (localItem.loop ? '&playlist=' + extractYouTubeId(localItem.youtubeurl) : '')"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="fab fa-youtube text-red-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">YouTube Video Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของ YouTube Video</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-4">
            <label for="youtubeUrl" class="popup-label block font-semibold mb-1">YouTube URL:</label>
            <input
              type="text"
              id="youtubeUrl"
              v-model.trim="localItem.youtubeurl"
              @input="updateLocalItem"
              class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            />
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <label class="inline-flex items-center">
                <input v-model="localItem.autoplay" type="checkbox" @change="updateLocalItem" class="form-checkbox rounded" />
                <span class="ml-2 popup-label">Autoplay</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="localItem.controls" type="checkbox" @change="updateLocalItem" class="form-checkbox rounded" />
                <span class="ml-2 popup-label">Show Controls</span>
              </label>
              <label class="inline-flex items-center">
                <input v-model="localItem.loop" type="checkbox" @change="updateLocalItem" class="form-checkbox rounded" />
                <span class="ml-2 popup-label">Loop</span>
              </label>
            </div>
            <div v-if="localItem.youtubeurl && extractYouTubeId(localItem.youtubeurl)" class="mt-4 p-2 border rounded-md bg-gray-100">
              <h4 class="text-sm font-semibold mb-2">Live Preview:</h4>
              <div class="aspect-w-16 aspect-h-9">
                <iframe 
                  :src="'https://www.youtube.com/embed/' + extractYouTubeId(localItem.youtubeurl) + '?autoplay=' + (localItem.autoplay ? 1 : 0) + '&controls=' + (localItem.controls ? 1 : 0) + '&loop=' + (localItem.loop ? 1 : 0) + (localItem.loop ? '&playlist=' + extractYouTubeId(localItem.youtubeurl) : '')"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'YoutubeElement',
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
      localItem: {},
    };
  },
  watch: {
    item: {
      handler(newItem) {
        const defaultValues = {
          youtubeurl: '',
          autoplay: false,
          controls: true,
          loop: false,
        };
        const initialData = { ...defaultValues, ...newItem };
        if (JSON.stringify(initialData) !== JSON.stringify(this.localItem)) {
          this.localItem = JSON.parse(JSON.stringify(initialData));
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    updateLocalItem() {
      this.$emit('update-item', JSON.parse(JSON.stringify(this.localItem)));
    },
    extractYouTubeId(url) {
      if (!url) return null;
      let videoId = null;
      const regex = new RegExp("(?:https?://)?(?:www\\.)?(?:youtube\\.com/(?:[^/\\n\\s]+/\\S+/|(?:v|e(?:mbed)?)/|\\S*?[?&]v=)|youtu\\.be/)([a-zA-Z0-9_-]{11})");
      const match = url.match(regex);
      if (match && match[1]) {
        videoId = match[1];
      }
      return videoId;
    },
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
  color: #4a5568; /* gray-700 */
}
.popup-input {
  border-width: 1px;
  border-color: #e2e8f0; /* gray-300 */
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
  border-radius: 0.25rem; 
}
.form-checkbox {
  color: #4f46e5; /* indigo-600 */
}
.form-checkbox:focus {
  ring-color: #818cf8; /* indigo-300 */
}
.section-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
}
.aspect-w-16 {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
}
.aspect-h-9 iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}
</style> 