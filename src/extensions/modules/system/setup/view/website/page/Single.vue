<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import Detail 		from '@/components/setup/website/page/Detail';
import storageManager from '@/plugins/storage';

export default {
	name: 'WebsiteListPage',
	components: {
		Detail
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
<Detail v-if="this.login"/>
</template>