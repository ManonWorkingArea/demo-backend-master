<template>
  <div v-if="isVisible" class="fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center z-50">
    <div class="absolute w-full h-full bg-black bg-opacity-80"></div>
    <div class="text-white text-center z-20">
      <div class="text-2xl text-green-500 font-bold mb-2">## {{ processName }} ##</div>
      <div class="text-xl">{{ progressText }}</div>
      <div class="mt-2" v-if="startTime && endTime">
        <div class="text-lg">Usage Time : {{ calculateUsageTime(startTime, endTime) }}</div>
      </div>
      <button v-if="startTime && endTime" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded" @click="closeProgress">Close</button>
    </div>
    <div class="fixed top-0 left-0 w-full h-1 bg-gray-600">
      <div :style="{ width: progressBarWidth }" class="h-full bg-green-500"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    processName: String,
    progressText: String,
    progressTotal: Number,
    progressCurrent: Number,
    isVisible: Boolean,
    startTime: String,
    endTime: String,
  },
  computed: {
    progressBarWidth() {
      return (this.progressCurrent / this.progressTotal) * 100 + '%';
    },
  },
  methods: {
    calculateUsageTime(startTime, endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMilliseconds = end - start;
      const seconds = Math.floor(diffMilliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    },
    closeProgress() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
/* Add any custom styling here */
</style>
