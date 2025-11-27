<template>
    <div>
      <div v-html="htmlContent" ref="htmlContainer"></div>
  
      <div v-if="showPopup" class="overlay-backdrop"></div>
      <div v-if="showPopup" class="popup-box" ref="popupBox">
        <div class="box" v-bind:class="{ hidden: !showTextPopup }">
          <h3>Edit Text</h3>
          <textarea v-model="editingText"></textarea>
          <button @click="saveEditingText">Save</button>
          <button @click="showTextPopup = false; showPopup = false">
            Cancel
          </button>
        </div>
        <div class="box" v-bind:class="{ hidden: !showUploadPopup }">
          <h3>Upload Image</h3>
          <!-- Add image processing buttons -->
          <div class="image-processing-buttons">
            <button @click="rotate">Rotate</button>
            <button @click="flip">Flip</button>
            <input
              type="range"
              v-model="resizeValue"
              min="0.5"
              max="2"
              step="0.1"
              @input="resize"
            />
            <button @click="crop">Crop</button>
          </div>
          <input
            type="file"
            ref="uploadInput"
            @change="previewImg"
            accept="image/*"
          />
  
          <img v-if="editingImg" :src="editingImg" style="max-width: 100%" />
  
          <button @click="move('up')">Up</button>
          <button @click="move('down')">Down</button>
          <button @click="move('left')">Left</button>
          <button @click="move('right')">Right</button>
  
          <button @click="saveEditingImg">Save</button>
          <button @click="showUploadPopup = false; showPopup = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { editText } from './text.js';
  import { uploadImg } from './image.js';
  import './style.css';
  
  export default {
    data() {
      return {
        htmlContent: '<p>Not Edit</p><p class="edit">html data to edit content</p> <img class="upload" src="https://picsum.photos/id/237/200/300"> <img class="upload" src="https://picsum.photos/id/250/400/500">',
        showPopup: false,
        showTextPopup: false,
        editingText: '',
        resizeValue: 1,
        ...uploadImg('.upload').data()
      }
    },
    mounted() {
      this.addEditButtons();
      this.addUploadButtons();
    },
    methods: {
      ...uploadImg('.upload').methods,
    },
    mixins: [
      editText('.edit'),
    ],
  }
  </script>
  