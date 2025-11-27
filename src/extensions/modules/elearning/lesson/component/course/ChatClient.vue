<template>
  <div>
    <h1>Pusher Test</h1>
    <div>
      <label for="channel">Channel:</label>
      <input type="text" id="channel" v-model="channelName">
    </div>
    <div>
      <label for="event">Event:</label>
      <input type="text" id="event" v-model="eventName">
    </div>
    <button @click="clearMessages">Clear Messages</button>
    <ul>
      <li v-for="message in messages" :key="message.id">
        {{ message }}
      </li>
    </ul>
  </div>
</template>

<script>
import Pusher from 'pusher-js';
export default {
  data() {
    return {
      messages: [],
      channelName: 'my-channel', // Default channel name
      eventName: 'my-event',     // Default event name
      pusher: null,              // Store the Pusher instance
      channel: null,             // Store the channel instance
    };
  },
  created() {
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    this.pusher = new Pusher('5389701e908eb3724318', {
      cluster: 'ap1',
    });
    // Subscribe to the default channel and event
    this.subscribeToChannelAndEvent();
  },
  methods: {
    subscribeToChannelAndEvent() {
      if (this.channel) {
        this.channel.unbind(); // Unbind from the previous channel
        this.channel.unsubscribe(); // Unsubscribe from the previous channel
      }
      this.channel = this.pusher.subscribe(this.channelName);
      this.channel.bind(this.eventName, (data) => {
        this.messages.push(JSON.stringify(data));
      });
    },
    clearMessages() {
      this.messages = [];
    },
  },
  watch: {
    // Watch for changes in channelName and eventName and update the subscription
    channelName(newChannelName, oldChannelName) {
      if (newChannelName !== oldChannelName) {
        this.subscribeToChannelAndEvent();
      }
    },
    eventName(newEventName, oldEventName) {
      if (newEventName !== oldEventName) {
        this.subscribeToChannelAndEvent();
      }
    },
  },
};
</script>
