<template>
  <div class="color-picker w-full">
    <div :class="['color-display', selectedColor]" @click="toggleColorList"><div class="text-white text-center w-full pt-2">{{selectedColor.replace('bg-', 'text-')}}</div></div>
    <ul v-if="showColorList" class="color-list grid grid-cols-10">
    <li v-for="color in colors" :key="color" @click="selectColor(color)" :class="[color, 'border border-gray-500 transition-transform duration-300 hover:scale-110']"></li>
    </ul>
  </div>
  <div v-if="showColorList" class="fixed inset-0 bg-black bg-opacity-0" @click="hideColorList"></div>
</template>

<script>
export default {
  data() {
    return {
      selectedColor: this.defaultColor.replace('text-', 'bg-'),
      showColorList: false,
      colors: [
        'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900',
        'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900',
        'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700', 'bg-yellow-800', 'bg-yellow-900',
        'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900',
        'bg-yellow-300', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-600', 'bg-yellow-700',
        'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700',
        'bg-indigo-500', 'bg-indigo-600', 'bg-indigo-700', 'bg-indigo-800', 'bg-indigo-900',
        'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900',
        'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800', 'bg-orange-900',
        'bg-teal-500', 'bg-teal-600', 'bg-teal-700', 'bg-teal-800', 'bg-teal-900',
        'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
      ],
    };
  },
  props: {
    defaultColor: {
      type: String,
      default: 'bg-green-500', // Set the default color here
    },
  },
  methods: {
    toggleColorList() {
      this.showColorList = !this.showColorList;
    },
    selectColor(color) {
      this.selectedColor = color;
      this.showColorList = false;
      this.$emit('selectColor', color.replace('bg-', 'text-'));
    },
    hideColorList() {
      this.showColorList = false;
    },
  },
};
</script>

<style>
.color-picker {
  position: relative;
  display: inline-block;
}

.color-display {
  min-width: 100px;
  height: 40px;
  cursor: pointer;
}

.color-list {
  width: 240px;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  padding: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 0px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.color-list li {
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
