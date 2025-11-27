<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Single 		from '../component/Profile.vue';
import storageManager from '@/plugins/storage';

export default {
	name: 'Home',
	components: {
		
		Single
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

<Single v-if="this.login"/>
</template>