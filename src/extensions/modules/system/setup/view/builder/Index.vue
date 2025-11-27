<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Render 		from '@/components/setup/builder/Builder';
import storageManager from '@/plugins/storage';

export default {
	name: 'BuilderRender',
	components: {
		Render
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
<Render v-if="this.login"/>
</template>