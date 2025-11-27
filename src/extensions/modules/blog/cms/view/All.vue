<template>
<component 
  :is="componentName" 
  :key="routeKey"
/>
</template>

<script>
import { useTitle }   from 'vue-page-title';
import { useRoute }   from 'vue-router';
import storageManager from '@/plugins/storage';
import Backend 		  from '../component/All.vue';
import Frontend       from '../component/frontend/Page.vue';

export default {
name: 'Page All',
components: {
    Backend,
    Frontend,
},
props: {
    id: {
        type: String,
        default: null
    }
},
data() {
    return {
        session: storageManager.get('session'),
        routeKey: Date.now()
    };
},
created() {
    const route = useRoute();
    useTitle(route.meta.title);
},
watch: {
    '$route.params.id': {
        immediate: true,
        handler() {
            // Update key to force re-render
            this.routeKey = Date.now();
        }
    }
},
computed: {
    componentName() {
        if (this.session.interface === 'backend') {
            return 'Backend';
        } else if (this.session.interface === 'frontend') {
            return 'Frontend';
        } else {
            console.error('Invalid interface:', this.session.interface);
            return null;
        }
    }
}
};
</script>
    