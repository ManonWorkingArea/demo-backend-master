<template>
    <component :is="componentName" />
    </template>
    
    <script>
    import { useTitle } from 'vue-page-title';
    import { useRoute } from 'vue-router';
    import storageManager from '@/plugins/storage';
    import Register from '../component/frontend/Register';
    import RegisterDOA from '../component/frontend/Register/Register-DOA';
    import RegisterSACRED from '../component/frontend/Register/Register-SACRED';
    
    export default {
    name: 'userLoginLoader',
    components: {},
    data() {
      return {
        session: storageManager.get('session'),
        configs: storageManager.get('configs'),
      };
    },
    setup() {
      const route = useRoute();
      const routeName = route.meta.title;
      useTitle(routeName);
    },
    computed: {
      componentName() {
        // Check if configs.layout.userDashboard exists
        if (this.configs && this.configs.layout && this.configs.layout.userLogin) {
          // Check if the userDashboard is "DOA"
          if (this.configs.layout.userLogin === 'DOA') {
            return RegisterDOA; // Use ProfileDOA component
          } else if (this.configs.layout.userLogin === 'SACRED') {
            return RegisterSACRED; // Use ProfileDOA component
          } else {
            // Fallback to static import (Profile.vue)
            return Register;
          }
        } else {
          // Fallback to static import (Profile.vue)
          return Register;
        }
      },
    },
  };
  </script>
        