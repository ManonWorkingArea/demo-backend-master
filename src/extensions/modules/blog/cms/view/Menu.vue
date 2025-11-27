<template>
    <component :is="componentName" />
    </template>
    
    <script>
    import { useTitle }   from 'vue-page-title';
    import { useRoute }   from 'vue-router';
    import storageManager from '@/plugins/storage';
    import Backend 		  from '../component/Menu.vue';
    
    export default {
    name: 'Page Index',
    components: {
        Backend,
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
            return 'Backend';
        }
    }
    };
    </script>
    