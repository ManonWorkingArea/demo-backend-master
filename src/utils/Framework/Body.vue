<template>
    <!-- Header Component with title and navigation passed as props -->
    <Header :navigation="navigation" :title="title" @callFunction="handleOpenPopup"/>
    <!-- Loader displayed when loader is false -->
    <div v-if="!loader" class="text-center"><Loader /></div>
    <!-- Main content when loader is true -->
    <div v-else class="flex-1 pb-8 bg-gray-100 pt-2 pb-5">
        <div class="mt-4">
            <div class="mx-auto px-6 sm:px-6 lg:px-6">
                <div class="mt-4 flex flex-col">
                    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <slot></slot>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </template>
  
  <script>
  import Loader from './Loader.vue';
  import Header from './Header.vue';
  
  export default {
    components: {
      Loader,
      Header
    },
    props: {
      loader: {
        type: Boolean,
        default: true,
        required: true
      },
      title: {
        type: String,
        default: null,
        required: true
      },
      navigation: {
        type: Array,
        required: true
      }
    },
    methods: {
        handleOpenPopup() {
            this.$emit('callFunction');
        },
    }
  }
  </script>
  