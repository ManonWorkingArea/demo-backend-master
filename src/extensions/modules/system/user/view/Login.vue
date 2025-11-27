<template>
    <component :is="componentName" />
    </template>
    
    <script>
    import { useTitle } from 'vue-page-title';
    import { useRoute } from 'vue-router';
    import storageManager from '@/plugins/storage';
    import Login from '../component/frontend/Login';
    import LoginDOA from '../component/frontend/LoginDOA';
    
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
            return LoginDOA; // Use ProfileDOA component
          } else {
            // Fallback to static import (Profile.vue)
            return Login;
          }
        } else {
          // Fallback to static import (Profile.vue)
          return Login;
        }
      },
    },
  };
  </script>
        