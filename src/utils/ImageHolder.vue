<template>
  <div class="image-holder">
    <img v-if="!hasError" :src="src" alt="Image" />
    <div v-else class="dummy-image">No Image</div>
  </div>
</template>

<script>
export default {
  name: 'ImageHolder',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      hasError: false
    };
  },
  mounted() {
    this.checkImage(this.src);
  },
  methods: {
    checkImage(url) {
      const img = new Image();
      img.onload = () => {
        this.hasError = false; // Image loaded successfully
      };
      img.onerror = () => {
        this.hasError = true; // Image failed to load
      };
      img.src = url;
    }
  },
  watch: {
    src(newSrc) {
      this.hasError = false; // Reset error state when src changes
      this.checkImage(newSrc);
    }
  }
};
</script>

<style scoped>
.image-holder {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.image-holder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dummy-image {
  width: 100%;
  height: 100%;
  background-color: #cccccc;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999999;
  font-size: 1.5rem;
  font-family: Arial, sans-serif;
  user-select: none; /* Make text unselectable */
}
</style>
