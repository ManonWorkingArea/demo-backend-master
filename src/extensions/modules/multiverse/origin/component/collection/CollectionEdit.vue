<script>
import CollectionForm from './CollectionForm.vue';
import { loadAndStoreConfigData } from '@/plugins/config';

export default {
  name: 'CollectionEdit',
  data() {
    return {
      hostkey: this.$Key,
      activeBlock: false,
      initialData: {},
      dataItem: this.$route.params.id,
    };
  },
  components: {
    CollectionForm,
  },
  methods: {
    async fetchData() {
      try {
        let item = this.$route.params.id;
        const response = await fetch('https://gateway.cloudrestfulapi.com/api/hostname/' + item, {
          method: 'GET',
          headers: {'Content-Type':'application/json','client-token-key':this.hostkey}
        });
        const data = await response.json();

        // Map the API response to the form data structure
        this.initialData = {
          hostname: data.hostname,
          siteName: data.siteName,
          siteLogo: data.siteLogo,
          siteFavicon: data.siteFavicon,
          siteStyle: data.siteStyle,
          selectedDesign: data.siteStyle,
          loginLogo: data.loginLogo,
          loginBg: data.loginBg,
          sitePlugin: data.plugins,
          defaultPlugin: data.defaultPlugin,
          id: data._id,
          s3Key: data.s3Key,
          s3Endpoint: data.s3Endpoint,
          s3Hosting: data.s3Hosting,
          s3Secret: data.s3Secret,
          s3Region: data.s3Region,
          s3EndpointDefault: data.s3EndpointDefault,
          s3Bucket: data.s3Bucket,
          spaceId: data.spaceId,
          clientId: data.key,
          packageId: data.packageId,
        };

      } catch (error) {
        console.error(error);
      }
    },

    async handleSubmit(formData) {
      try {
        this.activeBlock = true;
        const response = await fetch('https://gateway.cloudrestfulapi.com/api/hostname/' + formData.id, {
          method: 'PUT',
          headers: {
            'Content-Type':'application/json',
            'client-token-key':this.hostkey
          },
          body: JSON.stringify({
            data: {
              hostname: formData.hostname,
              siteName: formData.siteName,
              siteLogo: formData.siteLogo,
              siteFavicon: formData.siteFavicon,
              siteStyle: formData.selectedDesign,
              siteSubStyle: formData.selectedDesign?.match(/bg-(\w+)-\d+/)?.[1] || 'gray',
              loginLogo: formData.loginLogo,
              loginBg: formData.loginBg,
              plugins: formData.sitePlugin,
              defaultPlugin: formData.defaultPlugin,
              s3Key: formData.s3Key,
              s3Endpoint: formData.s3Endpoint,
              s3Hosting: formData.s3Hosting,
              s3Secret: formData.s3Secret,
              s3Region: formData.s3Region,
              s3EndpointDefault: formData.s3EndpointDefault,
              s3Bucket: formData.s3Bucket,
              spaceId: formData.spaceId,
              packageId: formData.packageId
            },
            options: {
              unique: 'hostname'
            }
          })
        });
        const data = await response.json();
        this.activeBlock = false;
        
        if (data.success || data._id) {
          console.log('Collection updated successfully:', data);
          await loadAndStoreConfigData(true);
          // You can add navigation here if needed
          // this.$router.push('/origin/collection');
        } else {
          console.error('Error updating collection:', data);
        }
      } catch (error) {
        this.activeBlock = false;
        console.error('Error updating collection:', error);
      }
    }
  },
  
  async mounted() {
    await this.fetchData();
  }
};
</script>

<template>
  <div>
    <main class="flex-1 pb-8">
      <div class="">
        <div class="flex-1 bg-gray-100">
          <div class="">
            <div class="">
              <div class="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
                <CollectionForm 
                  mode="edit" 
                  :initial-data="initialData"
                  @submit="handleSubmit"
                  :class="[(activeBlock ? 'isblock' : 'isunblock')]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
