<template>
  <div class="grid grid-cols-5 gap-4">
    <div v-for="app in apps" :key="app.id">
      <div class="app-icon" :style="{ backgroundColor: app.backgroundColor }">
        <img :src="app.icon" alt="App Icon" class="app-icon__image" />
        <span class="app-icon__label">{{ app.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      apps: [
        {
          id: 1,
          label: 'My App 1',
          backgroundColor: '#007AFF',
          icon: 'https://example.com/app1-icon.png'
        },
        {
          id: 2,
          label: 'My App 2',
          backgroundColor: '#34C759',
          icon: 'https://example.com/app2-icon.png'
        },
        {
          id: 3,
          label: 'My App 3',
          backgroundColor: '#FF2D55',
          icon: 'https://example.com/app3-icon.png'
        },
        // add more app data as needed
      ]
    };
  }
};
</script>

<style scoped>
.app-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  margin: 8px;
}

.app-icon__image {
  width: 32px;
  height: 32px;
}

.app-icon__label {
  font-size: 12px;
  font-weight: bold;
  margin-top: 8px;
  text-align: center;
  width: 64px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
