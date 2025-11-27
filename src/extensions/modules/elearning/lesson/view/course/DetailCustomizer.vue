<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Edit 		from '../../component/course/customize/DetailCustomizer';
import storageManager from '@/plugins/storage';

export default {
	name: 'DetailCustomizer',
	components: {
		
		Edit
	},
	data() {
		return {
			login: storageManager.get('session','login'),
		}
	},
	methods: {
	},
	setup() {
        const route     = useRoute();
        const routeName = route.meta.title;
        useTitle(routeName);
    },
};
</script>

<template>

<Edit v-if="this.login"/>
</template>