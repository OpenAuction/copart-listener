const WebSocket = require('ws');
const atob = require('atob');
const convertToEpochMillis = require('./convertToEpochMillis');
const {
  CLIENT_CLOSE,
  KEEP_ALIVE,
  BUYER_TOKEN,
  MINUTE,
} = require('./constants');
const EventEmitter = require('events');

const generateLoginMessage = auctionKey =>
  `F=5&R=4&E=1&N=/${auctionKey}/outbound,0,,F`;

const getServerAddress = serverId => {
  // 204, 205, 206 are valid ids
  const selectedServerId = serverId || Math.floor(Math.random() * 3) + 4;

  return `nirvanarn20${selectedServerId}.copart.com/sv/ws`;
};

const now = () => new Date().valueOf();

const worker = ({ auctionKey, serverId }) => {
  const eventEmitter = new EventEmitter();
  const serverAddress = getServerAddress(serverId);

  try {
    const ws = new WebSocket(`wss://${serverAddress}`);
    let pongInterval;
    let lastMessageTime = now();
    let messageId = 5;

    const handleEndConnection = endCondition => {
      eventEmitter.emit('end', { endCondition });
      clearInterval(pongInterval);
      ws.terminate();
    };

    ws.on('open', function open() {
      ws.send(
        `F=1&Connection-Type=JC&Y=10&V=Netscape&P=nws&W=81457-81457&X=February-12 2016&Z=MacIntel&S=${BUYER_TOKEN}&A=VB3.5&G=T&D=T&B=&R=2&1Date=${Date.now().valueOf()}&`,
      );

      setTimeout(() => {
        ws.send(generateLoginMessage(auctionKey));
      }, 10);

      pongInterval = setInterval(() => {
        ws.send(`F=3&R=${messageId}&`);
        messageId++;
        eventEmitter.emit('keep-alive');
        if (now() - lastMessageTime >= MINUTE * 10) {
          handleEndConnection('No messages in 10 minutes');
        }
      }, MINUTE);
    });

    ws.on('message', function incoming(messageRecieved) {
      eventEmitter.emit('raw-message', messageRecieved);

      const message = JSON.parse(messageRecieved);

      if (/Channel Not Found/.test(messageRecieved)) {
        handleEndConnection('Channel not found');
        return;
      }

      if (!message.length || !message[0].d) {
        return;
      }

      if (message[0].d[0] === CLIENT_CLOSE) {
        handleEndConnection('CLIENT_CLOSE');
        return;
      }

      if (message[0].d[0] === KEEP_ALIVE) {
        eventEmitter.emit('server-keep-alive');
        return;
      }

      const messageData = message[0].d[1];

      if (!messageData.h || !messageData.Data) {
        return;
      }

      const messageEventData = atob(messageData.Data);
      const timestampSent = convertToEpochMillis(
        messageData.h.timeStamp[0],
        messageData.h.timeStamp[1],
      );
      const eventTag = atob(messageData.Tag);
      const eventId = messageData.EID[1];
      const saleId = messageData.Dictionary.sale[1];

      eventEmitter.emit(eventTag, {
        eventTag,
        eventId,
        saleId,
        timestampSent,
        messageEventData,
      });

      if (eventTag === 'ENDAUC') {
        handleEndConnection('ENDAUC');
      }

      lastMessageTime = now();
    });

    ws.on('error', error => {
      eventEmitter.emit('error', {
        message: 'WS Error',
        serverAddress,
        error,
      });
      handleEndConnection('WS Error');
    });
  } catch (error) {
    eventEmitter.emit(
      'error',

      { message: 'Uncaught error', error },
    );
  }

  return eventEmitter;
};

module.exports = worker;
