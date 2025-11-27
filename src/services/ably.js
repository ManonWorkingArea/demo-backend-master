import Ably from 'ably';

const ably = new Ably.Realtime({ key: 'OX3SiA.b0JzzA:FzMUNXotKroiTLihr_g_Co0dBoqZsHGRcD2bUOqfs4s' });

function getAblyChannel(channelName) {
  return ably.channels.get(channelName);
}

async function publishMessage(ablyChannel, message) {
  return new Promise((resolve, reject) => {
    ablyChannel.publish('message', message, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function subscribeToMessages(ablyChannel, callback) {
  ablyChannel.subscribe('message', (msg) => {
    callback(msg);
  });
}

function unsubscribeFromMessages(ablyChannel) {
  ablyChannel.unsubscribe();
}

export { getAblyChannel, publishMessage, subscribeToMessages, unsubscribeFromMessages };
