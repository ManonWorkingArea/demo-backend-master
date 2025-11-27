<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'

import Add 			from '../../component/player/AddSub';
import storageManager from '@/plugins/storage';

export default {
	name: 'AddSub',
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