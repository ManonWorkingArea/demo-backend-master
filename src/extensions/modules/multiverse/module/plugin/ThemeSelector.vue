<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
    <div class="border-b border-gray-200 pb-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🎨 เลือกธีมสี</h2>
      <p class="text-base text-gray-700 font-medium">เลือกชุดสีที่เหมาะสมกับแบรนด์และสไตล์ของคุณ</p>
      <p class="text-sm text-gray-500 mt-1">ธีมสีจะกำหนดโทนสีหลักของเว็บไซต์และส่วนต่าง ๆ ในระบบ</p>
    </div>

    <div v-if="colorOptions.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"/>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">ไม่มีธีมสีที่พร้อมใช้งาน</h3>
      <p class="mt-1 text-sm text-gray-500">กรุณาเพิ่มธีมสีหรือติดต่อผู้ดูแลระบบ</p>
    </div>

    <div v-else>
      <div class="mb-4 text-sm text-gray-600">
        <span class="font-medium">{{ colorOptions.length }}</span> ธีมสีที่พร้อมใช้งาน
      </div>
      
      <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-3">
        <div v-for="colorOption in colorOptions" :key="colorOption.value" 
             class="cursor-pointer border-2 rounded-lg p-2 transition-all duration-200 hover:shadow-md"
             :class="{'border-blue-500 ring-2 ring-blue-200': selectedTheme === colorOption.value, 'border-gray-200 hover:border-gray-300': selectedTheme !== colorOption.value}"
             @click="selectTheme(colorOption.value)"
             :title="`${colorOption.color} - ${colorOption.description}`">
          
          <div :class="colorOption.value" class="w-full h-8 rounded mb-1 shadow-sm"></div>
          <p class="text-xs text-gray-600 text-center truncate font-medium">{{ colorOption.color }}</p>
          
          <!-- Check mark for selected theme -->
          <div v-if="selectedTheme === colorOption.value" class="flex justify-center mt-1">
            <svg class="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Selected theme preview -->
      <div v-if="selectedThemeInfo" class="mt-6 p-4 bg-gray-50 rounded-lg border">
        <div class="flex items-center space-x-3">
          <div :class="selectedThemeInfo.value" class="w-8 h-8 rounded shadow-sm"></div>
          <div>
            <h4 class="font-medium text-gray-900">{{ selectedThemeInfo.color }}</h4>
            <p class="text-sm text-gray-600">{{ selectedThemeInfo.description }}</p>
            <p class="text-xs text-gray-500 mt-1">Code: {{ selectedThemeInfo.code }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThemeSelector',
  props: {
    selectedTheme: {
      type: String,
      default: null
    },
    themes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      colorOptions: [
        {
          color: "Mountain",
          description: "A rich, deep indigo",
          value: "bg-indigo-900",
          code: "indigo",
        },
        {
          color: "Ocean",
          description: "A cool, calming blue",
          value: "bg-blue-900",
          code: "blue",
        },
        {
          color: "Midnight",
          description: "A deep, dark blue, like the night sky",
          value: "bg-indigo-600",
          code: "indigo",
        },
        {
          color: "Sky",
          description: "A light, airy blue, like a clear sky",
          value: "bg-blue-700",
          code: "blue",
        },
        {
          color: "Sunset",
          description: "A warm, fiery red",
          value: "bg-red-900",
          code: "red",
        },
        {
          color: "Sunrise",
          description: "A soft, rosy pink",
          value: "bg-pink-900",
          code: "pink",
        },
        {
          color: "Desert Sun",
          description: "A warm, sandy yellow",
          value: "bg-yellow-900",
          code: "yellow",
        },
        {
          color: "Mustard",
          description: "Warm yellow with a hint of brown",
          value: "bg-yellow-700",
          code: "yellow",
        },
        {
          color: "Banana",
          description: "Bright, yellow, like bananas",
          value: "bg-yellow-600",
          code: "yellow",
        },
        {
          color: "Lemon",
          description: "Fresh, bright yellow, like a juicy lemon",
          value: "bg-yellow-500",
          code: "yellow",
        },
        {
          color: "Forest",
          description: "A deep green, reminiscent of a dense forest",
          value: "bg-green-800",
          code: "green",
        },
        {
          color: "Meadow",
          description: "A bright green, like a lush meadow on a sunny",
          value: "bg-green-700",
          code: "green",
        },
        {
          color: "Lime",
          description: "A bright, zesty green, like a freshly squeezed lime",
          value: "bg-green-600",
          code: "green",
        },
        {
          color: "Midnight",
          description: "A deep, dark black like a midnight sky",
          value: "bg-gray-900",
          code: "gray",
        },
        {
          color: "Charcoal",
          description: "A rich, dark black with gray undertones",
          value: "bg-gray-700",
          code: "gray",
        },
      ]
    };
  },
  computed: {
    selectedThemeInfo() {
      if (!this.selectedTheme) return null;
      return this.colorOptions.find(option => option.value === this.selectedTheme);
    }
  },
  methods: {
    selectTheme(themeValue) {
      this.$emit('theme-selected', themeValue);
    }
  },
  mounted() {
    // Use custom themes if provided, otherwise use default color options
    if (this.themes && this.themes.length > 0) {
      this.colorOptions = this.themes;
    }
  }
};
</script>

<style scoped>
/* Custom grid for theme colors */
@media (min-width: 1280px) {
  .xl\:grid-cols-15 {
    grid-template-columns: repeat(15, minmax(0, 1fr));
  }
}
</style> 