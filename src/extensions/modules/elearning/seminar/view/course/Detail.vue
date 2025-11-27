<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Detail 		from '../../component/course/Detail';
import storageManager from '@/plugins/storage';

export default {
	name: 'Lesson Detail',
	components: {
		
		Detail
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

<Detail v-if="this.login"/>
</template>