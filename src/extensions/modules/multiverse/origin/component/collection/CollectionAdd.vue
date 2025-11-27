<script>
import CollectionForm from './CollectionForm.vue';
import { loadAndStoreConfigData } from '@/plugins/config';
import storageManager from '@/plugins/storage';

export default {
  name: 'CollectionAdd',
  data() {
    const configs = storageManager.get('configs');
    return {
      hostkey: this.$Key,
      activeBlock: false,
      parent: configs.siteID,
      initialData: {},
    };
  },
  components: {
    CollectionForm,
  },
  methods: {
    async handleSubmit(formData) {
      try {
        this.activeBlock = true;
        const response = await fetch('https://gateway.cloudrestfulapi.com/api/hostname', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'client-token-key': this.hostkey
          },
          body: JSON.stringify({
            data: {
              hostname: formData.hostname,
              siteName: formData.siteName,
              siteLogo: formData.siteLogo,
              siteFavicon: formData.siteFavicon,
              siteStyle: formData.selectedDesign,
              siteType: "collection",
              siteSubStyle: formData.selectedDesign?.match(/bg-(\w+)-\d+/)?.[1] || 'gray',
              loginLogo: formData.loginLogo,
              loginBg: formData.loginBg,
              plugins: formData.sitePlugin,
              parent: this.parent,
              defaultPlugin: formData.defaultPlugin,
              packageId: formData.packageId,
              s3Key: formData.s3Key,
              s3Endpoint: formData.s3Endpoint,
              s3Hosting: formData.s3Hosting,
              s3Secret: formData.s3Secret,
              s3Region: formData.s3Region,
              s3EndpointDefault: formData.s3EndpointDefault,
              s3Bucket: formData.s3Bucket
            },
            options: {
              fieldType: [],
              uniqueFields: [
                ["hostname"]
              ]
            }
          })
        });
        const data = await response.json();
        this.activeBlock = false;
        
        if (data.success || data._id) {
          // Success handling - redirect or show success message
          console.log('Collection created successfully:', data);
          await loadAndStoreConfigData(true);
          // You can add navigation here if needed
          // this.$router.push('/origin/collection');
        } else {
          console.error('Error creating collection:', data);
        }
      } catch (error) {
        this.activeBlock = false;
        console.error('Error creating collection:', error);
      }
    }
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
                  mode="add" 
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