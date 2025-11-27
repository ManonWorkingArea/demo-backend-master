<template>
    <component :is="componentName" />
    </template>
    
    <script>
    import { useTitle } from 'vue-page-title';
    import { useRoute } from 'vue-router';
    import storageManager from '@/plugins/storage';
    import Frontend from '../component/frontend/Reset.vue';
    
    export default {
    name: 'Lesson Detail',
    components: {
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
            return 'Frontend';
        }
    }
    };
    </script>
        