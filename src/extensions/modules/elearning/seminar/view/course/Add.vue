<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Add 			from '../../component/course/Add';
import storageManager from '@/plugins/storage';

export default {
	name: 'Lesson Add',
	components: {
		
		Add
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

<Add v-if="this.login"/>
</template>