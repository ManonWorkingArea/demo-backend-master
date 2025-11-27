<template>
  <div class="w-full h-full">
    <PackageManagement :collectionId="collectionId" />
  </div>
</template>

<script>
import PackageManagement from '../../component/package/module/PackageManagement.vue';

export default {
  name: 'PackageManagementView',
  components: {
    PackageManagement
  },
  computed: {
    collectionId() {
      return this.$route.params.collectionId || this.getDefaultCollectionId();
    }
  },
  methods: {
    getDefaultCollectionId() {
      // Get collection ID from current session or default
      const session = this.$store?.state?.session || {};
      return session.current?._id || null;
    }
  }
}
</script>
