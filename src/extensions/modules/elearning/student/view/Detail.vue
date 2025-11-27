<script>
import { useTitle } from 'vue-page-title';
import { useRoute } from 'vue-router';
import storageManager from '@/plugins/storage';

const requireComponent = require.context('../component/Single/', false, /\.vue$/);
const components = {};
const componentMap = {};

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = fileName
    .replace(/^\.\//, '')
    .replace(/\.\w+$/, '')
    .split('/')
    .pop();

  components[componentName] = componentConfig.default || componentConfig;

  const splitName = componentName.split('-');
  const mapKey = splitName.length > 1 ? splitName[1] : componentName;
  componentMap[mapKey] = componentName;
});

console.log();

export default {
  name: 'StudentSingle',
  components: components,
  data() {
    return {
      login: storageManager.get('session', 'login'),
      session: storageManager.get('session'),
      componentMap: componentMap
    };
  },
  methods: {
  },
  computed: {
    componentName() {
      if (this.session && this.session.current && this.session.current.layout.userDetail) {
        const userDetail = this.session.current.layout.userDetail;
        const componentToLoad = this.componentMap[userDetail] || 'Single';
        console.log("2",componentToLoad);
        return components[componentToLoad] || components['Single'];
      } else {
        console.log("3",components['Single']);
        return components['Single'];
      }
    },
  },
  setup() {
    const route = useRoute();
    const routeName = route.meta.title;
    useTitle(routeName);
  },
};

</script>

<template>
	<component v-if="this.login" :is="componentName" />
</template>