<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Institution 		from '../../component/course/Institution';
import storageManager from '@/plugins/storage';

export default {
	name: 'Lesson Edit',
	components: {
		Institution
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
<Institution v-if="this.login"/>
</template>