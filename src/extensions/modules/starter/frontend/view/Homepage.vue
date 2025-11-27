<script>
import {useTitle} 		from 'vue-page-title';
import {useRoute} 		from 'vue-router'
import Homepage 		from '../component/Homepage.vue';

export default {
	name: 'Home',
	components: {
		Homepage,
	},
	data() { return {} },
	methods: {},
	mounted() {},
	setup() {
        const route     = useRoute();
        const routeName = route.meta.title;
        useTitle(routeName);
		console.log("FrontPage Module");
    },
};
</script>

<template>
<Homepage/> 
</template>