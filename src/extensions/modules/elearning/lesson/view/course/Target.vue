<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Target 		from '../../component/course/Target';
import storageManager from '@/plugins/storage';

export default {
	name: 'Lesson Edit',
	components: {
		Target
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
<Target v-if="this.login"/>
</template>