<template>
    <component :is="componentName" />
  </template>
  
  <script>
  import { useTitle } from 'vue-page-title';
  import { useRoute } from 'vue-router';
  import storageManager from '@/plugins/storage';
  import Profile from '../component/frontend/Profile'; // Corrected import statement
  import ProfileDOA from '../component/frontend/Profile_doa'; // Corrected import statement
  
  export default {
    name: 'LessonDetail',
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
        if (this.configs && this.configs.layout && this.configs.layout.userDashboard) {
          // Check if the userDashboard is "DOA"
          if (this.configs.layout.userDashboard === 'DOA') {
            return ProfileDOA; // Use ProfileDOA component
          } else {
            // Fallback to static import (Profile.vue)
            return Profile;
          }
        } else {
          // Fallback to static import (Profile.vue)
          return Profile;
        }
      },
    },
  };
  </script>
  