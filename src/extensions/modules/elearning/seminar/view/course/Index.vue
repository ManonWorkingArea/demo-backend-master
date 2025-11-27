<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Index 		from '../../component/course/Index';
import storageManager from '@/plugins/storage';
export default {
	name: 'Lesson Index',
	components: {
		
		Index
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

<Index v-if="this.login"/>
</template>