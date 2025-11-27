<template>
    <Footer :dataItem="dataItem" :mode="'id'"/>
  </template>
  
  <script>
  import storageManager from '@/plugins/storage';
  import Footer from '@/interface/template/BuilderRender.vue';
  
  export default {
    components: {
      Footer,
    },
    data() {
      const configs = storageManager.get('configs');
      return {
        configs,
        dataItem: configs.footer,
      };
    },
  };
  </script>  