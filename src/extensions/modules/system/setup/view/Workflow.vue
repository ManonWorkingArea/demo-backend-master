<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import Config 		from '../component/Flow.vue';

import storageManager from '@/plugins/storage';
export default {
	name: 'GeneralConfig',
	components: {
		Config,
	},
	data() {
		return {
			login: storageManager.get('session','login'),
		}
	},
	methods: {
		showAlert() {
		this.$swal('Hello Vue world!!!');
		}
	},
	setup() {
		const route     = useRoute();
		const routeName = route.meta.title;
		useTitle(routeName);
    },
};
</script>
<template>
<Config v-if="this.login"/>
</template>