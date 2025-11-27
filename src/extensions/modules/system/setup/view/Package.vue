<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import Config 		from '@/components/setup/PackageConfig';

export default {
	name: 'PackageConfig',
	components: {
		Config
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