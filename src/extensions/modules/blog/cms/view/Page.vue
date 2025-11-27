<template>
    <component :is="componentName" />
    </template>
    
    <script>
    import { useTitle }   from 'vue-page-title';
    import { useRoute }   from 'vue-router';
    import storageManager from '@/plugins/storage';
    import Backend 		  from '../component/Pages.vue';
    import Frontend       from '../component/frontend/Page.vue';
    
    export default {
    name: 'Page Item',
    components: {
        Backend,
        Frontend,
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
        