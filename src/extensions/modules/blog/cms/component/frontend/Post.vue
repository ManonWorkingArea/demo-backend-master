<template>
	<div>
		<UnderConstruction v-if="!post" />
		<Render v-else :dataItem="post" :mode="'slug'" />
	</div>
	</template>
	
	<script>
	import storageManager from '@/plugins/storage';
	import Render from '@/interface/template/BuilderRender.vue';
	import UnderConstruction from '@/interface/template/UnderConstruction.vue';
	
	export default {
	data() {
		const configs = storageManager.get('configs');
		const session = storageManager.get('session');
		return {
		configs,
		session,
		page: this.$route.params.page,
		post: this.$route.params.post,
		};
	},
	components: { Render, UnderConstruction },
	methods: {},
	setup() {},
	computed: {},
	};
	</script>
 