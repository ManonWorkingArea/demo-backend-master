<script>
import feather from 'feather-icons';
import {useRoute} 	from 'vue-router'
export default {
	name: 'Product Index Backend',
  data() {
    const route     = useRoute();
    return {
        dataItem: this.$route.params.code,
        PageName: route.meta.title,
        PageIcon: route.meta.icon,
        PagePath: route.meta.path,
        ParentName: route.meta.parent,
        ParentPage: route.meta.page,
        routeName:this.routeName,
    }
  },
	components: {},
	methods: {},
  updated() {
    feather.replace();
  },
  setup() {
      
  },
};
</script>

<template>
 {{ dataItem }}
</template>