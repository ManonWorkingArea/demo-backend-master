<template>
    <div class="overlay" v-bind:class="{ hidden: !showOverlay }">
      <div class="box">
        <h3>{{ title }}</h3>
        <textarea v-if="input" v-bind:value="textareaInput" @input="updateInput"></textarea>
        <img v-if="img" :src="img" style="max-width: 100%" />
        <div class="button-container">
          <button v-if="save" @click="save">Save</button>
          <button v-if="cancel" @click="cancel">Cancel</button>
        </div>
      </div>
    </div>
  </template>
  
  <style>
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10;
    }
    .hidden {
      display: none;
    }
    .box {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      border: 1px solid #ccc;
      background-color: #fff;
      z-index: 20;
      padding: 20px;
      box-sizing: border-box;
    }
    h3 {
      margin: 0 0 10px 0;
    }
    textarea {
      width: 100%;
      height: 200px;
      box-sizing: border-box;
      border: 1px solid #ccc;
    }
    img {
      margin: 10px 0;
    }
    .button-container {
      display: flex;
      justify-content: flex-end;
    }
    button {
      padding: 10px 20px;
      border: none;
      cursor: pointer;
    }
    button:nth-of-type(1) {
      background-color: #4caf50;
      color: #fff;
    }
    button:nth-of-type(2) {
      background-color: #fff;
      color: #000;
    }
  </style>
  
  <script>
export default {
  data() {
    return {
      showOverlay: false
    }
  },
  props: {
    title: String,
    input: String,
    img: String,
    save: Function,
    cancel: Function
  },
  computed: {
    textareaInput: {
      get() {
        return this.input;
      },
      set(value) {
        this.updateInput(value);
      }
    }
  },
  methods: {
    updateInput(value) {
      this.$emit('update:input', value);
    }
  }
}
</script>