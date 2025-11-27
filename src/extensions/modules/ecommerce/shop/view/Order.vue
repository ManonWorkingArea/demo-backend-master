<template>
    <component :is="componentName" />
</template>
    
<script>
    import { useTitle } from 'vue-page-title';
    import { useRoute } from 'vue-router';
    import storageManager from '@/plugins/storage';
    import Backend from '../component/Order.vue';
    import Frontend from '../component/Order.vue';
    
    export default {
    name: 'Order List',
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