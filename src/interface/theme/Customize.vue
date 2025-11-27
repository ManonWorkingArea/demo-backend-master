<template>
  <div>

    <Header v-if="layout && layout.selectedlayout" 
    :headerLayout="layout.selectedlayout" 
    :headerPosition="layout.selectedposition" 
    
    :logo="{ 
    type: layout.selectedlogotype, 
    size: layout.logosize}" 

    :userbar="{ 
    type: layout.usermenutype, 
    endpoint: layout.usermenuendpoint}" 

    :topbar="{ 
    show: true,
    bg: 'bg-black', 
    color: 'text-white', 
    columns: [
      { text: this.config.siteName, url: '/' }, 
      { text: this.config.layout.topbarRight, url: this.config.layout.topbarRightUrl }]
    }
    "/>

  </div>
</template>

<script>
import storageManager from '@/plugins/storage';
import Header from "./HeaderCustomize.vue";

export default {
  components: { Header },
  data() {
    return {
      config: null,
      layout: null,
    };
  },
  created() {
    this.config = storageManager.get('configs');
    this.layout = storageManager.get('configs', 'layout');
  },
};
</script>
