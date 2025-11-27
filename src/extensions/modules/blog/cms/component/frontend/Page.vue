<template>
<div>
	<UnderConstruction v-if="!page" />
	<Render v-else :dataItem="page" :mode="'slug'" />
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
	};
},
components: { Render, UnderConstruction },
methods: {},
setup() {},
computed: {},
};
</script>
  