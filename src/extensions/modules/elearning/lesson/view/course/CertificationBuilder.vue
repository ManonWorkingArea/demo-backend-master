<template>
    <component :is="componentName" />
    </template>
    
    <script>
    import { useTitle } from 'vue-page-title';
    import { useRoute } from 'vue-router';
    import storageManager from '@/plugins/storage';
    import BackendIndex from '../../component/course/Builder.vue';
    import FrontendIndex from '../../component/course/frontend/Bill.vue';
    
    export default {
    name: 'Lesson Index',
    components: {
        BackendIndex,
        FrontendIndex,
    },
    data() {
        return {
            session: storageManager.get('session')
        };
    },
    setup() {
        const route = useRoute();
        const routeName = route.meta.title;
        useTitle(routeName);
    },
    computed: {
        componentName() {
            if (this.session.interface === 'backend') {
                return 'BackendIndex';
            } else if (this.session.interface === 'frontend') {
                return 'FrontendIndex';
            } else {
                console.error('Invalid interface:', this.session.interface);
                return null;
            }
        }
    }
    };
    </script>
    