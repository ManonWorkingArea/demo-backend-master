<template>
    <div>
      <div class="modal-overlay" v-bind:class="{ 'is-active': active }"></div>
      <div class="modal" tabindex="-1" role="dialog" id="myModal" v-bind:class="{ 'is-active': active }">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-body">
              <button type="button" class="btn btn-secondary" data-dismiss="modal" v-on:click="closeModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isActive: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      active() {
        return this.isActive;
      }
    },
    methods: {
      closeModal() {
        this.active = false;
      }
    }
  }
  </script>
  