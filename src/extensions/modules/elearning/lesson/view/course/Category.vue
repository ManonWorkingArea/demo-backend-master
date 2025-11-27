<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Category 		from '../../component/course/Category';
import storageManager from '@/plugins/storage';

export default {
	name: 'Lesson Edit',
	components: {
		Category
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
<Category v-if="this.login"/>
</template>