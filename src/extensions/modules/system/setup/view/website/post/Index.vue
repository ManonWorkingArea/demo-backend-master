<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import List 			from '@/components/setup/website/page/List';
import storageManager from '@/plugins/storage';

export default {
	name: 'WebsiteListPage',
	components: {
		List
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
<List v-if="this.login"/>
</template>