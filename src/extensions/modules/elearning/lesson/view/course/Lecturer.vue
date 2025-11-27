<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Lecturer 		from '../../component/course/Lecturer';
import storageManager from '@/plugins/storage';

export default {
	name: 'Lesson Edit',
	components: {
		Lecturer
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
<Lecturer v-if="this.login"/>
</template>