<script>
// Plugin
import FileManager from '@/interface/template/FileManager.vue';
import storageManager from '@/plugins/storage';

export default {
    data() {
      return {
        accessSession: [],
        selectSession: false,
        mode: 'static'
      }
    },
    components: {
      FileManager
    },
    methods: {
      changeSession() {
        this.selectSession = true;
      }
	},
  async mounted () {
    try {
      this.accessSession  = storageManager.get('session','current');
    } catch (error) {
      console.log(Error);
    }
  },
  setup() {},
};
</script>

<template>
  <FileManager :Mode="mode"/>
</template>