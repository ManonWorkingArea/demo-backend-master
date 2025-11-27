<template>
    <div class="terminal-container">
        <div class="terminal">
            <div class="terminal-header">
                <h1 class="terminal-title">Log Data</h1>
                <div class="button-group">
                    <div class="terminal-button red" @click="clearLogs"></div>
                    <div class="terminal-button yellow"></div>
                    <div class="terminal-button green"></div>
                </div>
            </div>
            <div class="terminal-body">
                <div class="terminal-log-content">
                    <!-- Log content goes here -->
                    <ul class="terminal-list">
                        <li v-for="(log, index) in logs" :key="index">
                            <ul class="terminal-messages">
                                <li v-for="(message, msgIndex) in log.messages" :key="msgIndex">
                                    <pre v-if="msgIndex === 0" style="font-weight: bold;color: rgb(58 223 64);">{{ formatMessage(message) }}</pre>
                                    <pre v-else>{{ formatMessage(message) }}</pre>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import debug from '@/plugins/Logger.js';

export default {
    data() {
        return {
            logs: [],
            loading: false, // Add a loading indicator
            error: null, // Add an error indicator
        };
    },
    methods: {
        async fetchLogs() {
            this.loading = true;
            this.error = null;

            try {
                const newLogs = await debug.display();
                // Uncomment the following line to log the fetched data for debugging
                // console.log("Fetched new logs:", newLogs);

                this.logs = newLogs;
                console.log("Logs loaded successfully");
            } catch (error) {
                console.error("Error fetching logs:", error);
                this.error = "Error fetching logs. Please try again.";
            } finally {
                this.loading = false;
            }
        },
        formatMessage(message) {
            if (message) {
                try {
                    const parsedValue = JSON.parse(message);
                    return JSON.stringify(parsedValue, null, 2);
                } catch (e) {
                    return message;
                }
            }
            return message;
        },
        clearLogs() {
          // Call the clearLogs function from your Logger.js module
          debug.destroy();
          // Clear the logs array in your component's state
          this.logs = [];
      },
    },
    mounted() {
        this.fetchLogs();
        setInterval(this.fetchLogs, 1000);
    },
};
</script>

  
<style scoped>
.terminal-container {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: #212121;
    overflow: hidden;
}

.terminal {
    background-color: #333;
    color: #fff;
    font-family: "Courier New", monospace;
    border: 2px solid #555;
    border-radius: 0px;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    max-height: 100%;
    height: 100%;
    /* Set a maximum height */
}

.terminal-header {
    background-color: #444;
    padding: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.button-group {
    display: flex;
}

.terminal-button {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 5px;
}

.terminal-body {
    flex-grow: 1;
    overflow: hidden;
    /* Hide overflow from header */
    display: flex;
    flex-direction: column;
}

.terminal-log-content {
    overflow-y: auto;
    /* Enable vertical scrolling for log content */
    flex-grow: 1;
    padding: 10px 5px 0px 0px;
    /* Add padding for better readability, adjust as needed */
}

.terminal-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.terminal-list li {
  margin-bottom: 20px;
  border-bottom: 1px dashed rgb(153 153 153 / 25%);
  padding-bottom: 10px;
}

.terminal-timestamp {
    font-weight: bold;
    color: #49f54a;
}

.terminal-messages {
    list-style: none;
    padding: 0;
    margin: 0;
    padding-left: 5px;
}

.terminal-messages li {
    padding-left: 5px;
    font-weight: normal;
    margin-bottom: 0px;
    border-bottom: 0px dashed #999;
    padding-bottom: 0px;
}

.red {
    background-color: #f55448;
}

.yellow {
    background-color: #f5d24a;
}

.green {
    background-color: #49f54a;
}

.terminal-title {
    font-size: 18px;
    margin: 0;
    color: #00d123;
}
</style>
