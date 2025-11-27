<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import fileImport 	from '../../component/branch/List';
import Authen 		from '@/utils/authen.vue';
import storageManager from '@/plugins/storage';

export default {
	name: 'TransactionSingle',
	components: {
		fileImport,
		Authen
	},
	data() { return { login: storageManager.get('session','login') } },
	methods: {},
	mounted() {},
	setup() {
        const route     = useRoute();
        const routeName = route.meta.title;
        useTitle(routeName);
    },
};
</script>

<template>
<Authen/> 
<fileImport v-if="this.login"/> 
</template>