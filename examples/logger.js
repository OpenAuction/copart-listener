const CopartListener = require('../index');

const main = () => {
  const myAuction = CopartListener({ auctionKey: 'COPART023A' });

  myAuction.on('connect', () => {
    console.log('Connected to auction');
  });
  myAuction.on('error', console.error);
  myAuction.on('BIDREC', ({ messageEventData: { LOTNO, CURBID } }) => {
    console.log(`A bid of $${CURBID} was placed on lot number ${LOTNO}`);
  });
  myAuction.on('end', ({ endMessage }) => {
    console.log(endMessage);
  });
};

main();
