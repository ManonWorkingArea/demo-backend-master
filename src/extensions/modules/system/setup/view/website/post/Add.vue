<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import New 			from '@/components/setup/website/post/Add';
import storageManager from '@/plugins/storage';

export default {
	name: 'WebsiteAddPage',
	components: {
		New
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
<New v-if="this.login"/>
</template>