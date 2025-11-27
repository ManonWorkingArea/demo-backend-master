<template>
    <div>
      <!-- The target div without CSS filter -->
      <div ref="targetDiv">Hello, world!</div>
  
      <!-- Canvas where you want to draw the grayscale clone -->
      <canvas ref="canvas"></canvas>
  
      <button @click="cloneAndDrawGrayscale">Clone and Draw Grayscale</button>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      cloneAndDrawGrayscale() {
        const targetDiv = this.$refs.targetDiv;
        const canvas = this.$refs.canvas;
        const context = canvas.getContext('2d');
  
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
  
        // Create a clone of the target div
        const clone = targetDiv.cloneNode(true);
  
        // Convert the clone to grayscale
        clone.style.filter = 'grayscale(100%)';
  
        // Draw the grayscale clone onto the canvas
        context.drawImage(clone, 0, 0);
  
        // Reset the filter on the clone
        clone.style.filter = 'none';
      },
    },
  };
  </script>
  