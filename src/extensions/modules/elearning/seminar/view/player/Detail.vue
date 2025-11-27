<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Detail 		from '../../component/player/Detail';
import storageManager from '@/plugins/storage';

export default {
	name: 'PlayerDetail',
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