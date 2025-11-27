<script>
import storageManager from '@/plugins/storage';
import Render from '@/interface/template/BuilderRender.vue';
export default {
    data() {
        const configs = storageManager.get('configs');
        const session = storageManager.get('session');
        return {
		configs,
		session,
		dataItem: this.$route.params.id,
    }},
    components: {Render},
    methods: {
    },
    setup() {},
    computed: {
    },
};
</script>

<template>
<Render :dataItem="dataItem" :mode="'id'"/>
</template>