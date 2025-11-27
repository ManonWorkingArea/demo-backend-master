import storageManager from '@/plugins/storage';
const session = storageManager.get('session');

import convertUtils from "@/plugins/convertUtils";

export default class Logger {
  static routerData = null;
  static showLogs = false; // Default is now dynamically set below.
  static maxLogEntries = 50;
  static logEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
  static userID = session ? session.userID : null;

  // Dynamically set showLogs based on the hostname
  static initialize() {
    Logger.showLogs = window.location.hostname === 'localhost';
  }

  static option(data) {
    Logger.routerData = data;
  }

  static formatObject(obj) {
    return JSON.stringify(obj, null, 2);
  }

  static formatThaidate(date) {
    return convertUtils.toThaiDatetime(date);
  }

  // Updated toggleLogs to respect the hostname check
  static toggleLogs(show) {
    if (window.location.hostname === 'localhost') {
      Logger.showLogs = show;
    } else {
      Logger.showLogs = false;
    }
  }

  static log(...args) {
    if (!Logger.showLogs) return; // Exit early if logging is disabled

    const date = new Date();
    const timestamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const messages = [`LOG : ${timestamp}`];

    args.forEach((arg) => {
      if (typeof arg === 'object' && arg !== null) {
        const formattedObject = Logger.formatObject(arg);
        messages.push(formattedObject);
      } else {
        if (arg !== undefined && arg !== null) {
          messages.push(`|-- ` + arg.toString());
        } else {
          messages.push(`|-- undefined or null`);
        }
      }
    });

    console.log(`LOG : ${timestamp}`);
    messages.forEach((message) => {
      console.log(message);
    });

    Logger.logEntries.unshift({ timestamp, messages });

    if (Logger.logEntries.length > Logger.maxLogEntries) {
      Logger.logEntries.pop();
    }
    localStorage.setItem('logEntries', JSON.stringify(Logger.logEntries));
  }

  static slack(...args) {
    // URL of the Slack webhook
    const webhookUrl = 'https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-34d16f42-4718-42b0-814e-08d23fecd2ce/default/slack';
    
    // Format the messages into a single string or structured format
    let messageText = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2); // Pretty print objects
      }
      return arg.toString();
    }).join('\n');

    // Current date and time formatted using formatThaidate
    const currentDate = new Date();
    const formattedDate = Logger.formatThaidate(currentDate);

    // Prepare the payload for the POST request
    const payload = {
      text: "`UID:"+this.userID+"`\n`DATE:" + formattedDate + "` \n" + messageText
    };

    // Use fetch to send a POST request to the Slack webhook
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.text())
    .then(text => console.log('Slack webhook response:', text))
    .catch(error => console.error('Failed to send log to Slack:', error));
  }

  static error(...args) {
    console.error(args);
  }

  static destroy() {
    Logger.logEntries = [];
    localStorage.removeItem('logEntries');
  }

  static display(format = 'array') {
    const storedEntries = JSON.parse(localStorage.getItem('logEntries')) || [];
    if (format === 'json') {
      return JSON.stringify(storedEntries, null, 2);
    } else {
      return storedEntries;
    }
  }
}

// Initialize Logger to set showLogs based on the current hostname
Logger.initialize();
