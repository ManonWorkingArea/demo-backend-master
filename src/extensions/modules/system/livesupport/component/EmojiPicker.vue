<template>
    <div v-if="isOpen" class="emoji-picker">
      <div class="emoji" v-for="emoji in emojis" :key="emoji" @click="selectEmoji(emoji)">
        {{ emoji }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isOpen: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        emojis: [
          '😊', '😂', '😍', '😎', '😭', '👍', '👎', '❤️', '🔥', '🎉', // Existing emojis
          '🙌', '👏', '🤔', '😢', '😡', '😇', '🥳', '😴', '🤯', '🤩', // Additional emojis
          '😜', '🤗', '😏', '😤', '🤫', '😌', '🤭', '🙈', '🙉', '🙊', // More emojis
        ], 
      };
    },
    methods: {
      selectEmoji(emoji) {
        this.$emit('select-emoji', emoji);
      },
    },
  };
  </script>
  
  <style scoped>
  .emoji-picker {
    position: absolute;
    bottom: 60px; /* Adjust to position above the button */
    left: 0; /* Align left */
    background-color: white;
    border: 1px solid #d1d5db;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: grid; /* Use grid for layout */
    grid-template-columns: repeat(5, 1fr); /* 5 columns */
    gap: 8px; /* Adjust gap between emojis */
  }
  .emoji {
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
  