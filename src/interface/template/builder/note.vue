<template>
    <div class="note-widgets">
        <div class="note-widget rounded-lg shadow-lg" :style="{ backgroundColor: contentBgColor, borderColor: contentLineColor }">
        <div class="note-header flex items-center p-2 rounded-t-lg" :style="{ backgroundColor: headerBgColor }">
            <i class="icon fas fa-folder mr-2 text-white"></i>
            <span class="header-title text-white">{{ headerTitle }}</span>
        </div>
        <div class="note-content p-4">
            <p class="note-subtitle" :style="{ color: contentTextColor }">{{ subtitle }}</p>
            <p v-if="showDate" class="note-time text-gray-400 mt-2">{{ time }}</p>
        </div>
        </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        headerTitle: this.data.headerTitle || 'Recipes',
        headerBgColor: this.data.headerBgColor || '#fbbf24', // Default yellow
        contentTextColor: this.data.contentTextColor || '#4b5563', // Default gray
        contentBgColor: this.data.contentBgColor || 'white',
        contentLineColor: this.data.contentLineColor || '#e5e7eb',
        subtitle: this.data.subtitle || '2 boneless, skinless chicken breasts 2 boneless, skinless chicken breasts',
        time: this.data.time || '7:59 AM',
        showDate: this.data.showDate !== undefined ? this.data.showDate : true
      };
    }
  };
  </script>
  
  <style scoped>
  .note-widgets {margin:5px;}
  .note-widget {
    width: 100%;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .note-header {
    height: 40px;
    border-bottom: 1px solid #e5e7eb;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  .icon {
    font-size: 1.25rem;
  }
  
  .header-title {
    font-size: 1rem;
  }
  
  .note-content {
    background: repeating-linear-gradient(
      to bottom,
      white,
      white 29px,
      #e5e7eb 30px
    );
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
  }
  
  .note-title {
    font-size: 1rem;
    margin-bottom: 4px;
  }
  
  .note-subtitle {
    font-size: 0.875rem;
    margin-bottom: 0px;
    line-height: 30px;
  }
  
  .note-time {
    font-size: 0.75rem;
    color: #6b7280; /* Lighter gray */
  }
  </style>
  