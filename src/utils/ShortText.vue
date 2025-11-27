<template>
  <div>
    <div v-if="showShortText" class="">{{ getShortText(value) }}</div>
    <div v-else>{{ value }}</div>
    <button
      v-if="showShortText && value.length > maxLength"
      @click="showFullText = true"
      class="mt-2 text-center text-blue-500 hover:underline"
    >
      Show More
    </button>
    <div v-if="showFullText" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
      <div class="relative bg-white rounded-sm p-4 max-w-xl">
        <span class="absolute top-2 right-2 text-lg text-gray-600 cursor-pointer" @click="closeFullText">&times;</span>
        <div>{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    maxLength: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      showShortText: true,
      showFullText: false,
    };
  },
  methods: {
    getShortText(text) {
      if (text && text.length > this.maxLength) {
        return text.substring(0, this.maxLength) + '...';
      }
      return text;
    },
    closeFullText() {
      this.showFullText = false;
    },
  },
};
</script>

<style>
/* No custom styles required with Tailwind CSS */
</style>
