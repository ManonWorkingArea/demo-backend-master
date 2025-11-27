<script>
import { translate } from '@/plugins/language.js';
import feather from 'feather-icons';
import {loadAndStoreConfigData} from '@/plugins/config';
import { useRouter } from 'vue-router';
export default {
  components: {},
  data() {
    return {
      copyrightDate: new Date().getFullYear(),
      copyrightName: ''
    }
  },
  methods: {
    translate
  },
  async mounted() {
    feather.replace();
    const configuration = await loadAndStoreConfigData();
    this.copyrightName 	= configuration.siteName;
  },
  updated() {
    feather.replace();
  },
  setup() {
      const router = useRouter();
      const routes = router.options.routes.filter((route) => {
      return !route.children || route.children.length === 0;
    });

    return {
      routes,
    };
  },
};
</script>

<template>
<div v-if="!$route.meta.fullscreen">
  <footer class="bg-gray-100">
    <div class="mx-auto py-3 px-2 sm:px-3 md:flex md:items-center md:justify-between lg:px-8">
      <div class="flex justify-center space-x-6 md:order-2">
      </div>
      <div class="mt-8 md:order-1 md:mt-0">
        <p class="text-center text-base text-gray-400">&copy; {{ copyrightDate }} <span class="text-gray-500 font-semibold"> {{ copyrightName }}</span>. {{translate('general-copyright')}}</p>
      </div>
    </div>
  </footer>
</div>
</template>

<style scoped></style>
