<template>
    <Framework :loader="loader" :navigation="navigationData" :title="title">
        <ChatFlowBuilder/>
    </Framework>

  </template>
  
  <script>
  
  import Framework from '@/utils/Framework/Body.vue';
  import ChatFlowBuilder from './ChatFlowBuilder.vue'; // Import the Chat component
  
  export default {
    components: {
      Framework,
      ChatFlowBuilder
    },
    data() {
      return {
        loader: true,
        title: 'Live Support Chatflow',
        navigationData: [
        {
            name: 'Add Note',
            function: 'callFunction',
            style: 'plus',
            class: 'primary-btn',
            visible: true,
            type: 'call-function',
        },
        ],
      };
    },

  };
  </script>
  