<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import Dashboard 	from '@/extensions/modules/starter/home/view/Router';
import Authen 		from '@/utils/authen.vue';
import storageManager from '@/plugins/storage';

export default {
	name: 'Page',
	components: {
		Dashboard,
		Authen
	},
	data() {
		console.log("Load Home Page");
		return {
			login: storageManager.get('session','login'),
		}
	},
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
<Dashboard v-if="this.login"/> 
</template>