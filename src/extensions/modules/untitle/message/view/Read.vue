<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import Dashboard 	from '../component/Read.vue';
import Authen 		from '@/utils/authen.vue';
import storageManager from '@/plugins/storage';

export default {
	name: 'Read',
	components: {
		Dashboard,
		Authen
	},
	data() { return { login: storageManager.get('session','login') } },
	methods: {},
	mounted() {},
	setup() {
        const route     = useRoute();
        const routeName = route.meta.title;
        useTitle(routeName);
		console.log("Dashboard");
    },
};
</script>

<template>
<Authen/> 
<Dashboard v-if="this.login"/> 
</template>