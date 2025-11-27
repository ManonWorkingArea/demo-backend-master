<template>
  <div>
    <UnderConstruction v-if="!dataItem" />
    <Render v-else :dataItem="dataItem" :mode="'id'"/>
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
      dataItem: configs.homepage,
    };
  },
  components: { Render, UnderConstruction },
  async mounted() {
    try {
      // await this.getData();
    } catch (error) {
      console.log(error);
    }
  },
  methods: {},
  setup() {},
  computed: {},
};
</script>
