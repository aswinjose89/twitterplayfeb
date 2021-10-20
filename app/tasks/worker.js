var app_settings = require('../../config/app_settings.json');
require('../../environment.js')(app_settings);
app_settings= appSettings || app_settings;
const amqp = require('amqplib/callback_api');
var DataCollectionHandler = require('../helpers/data_collection_handler')
var collectionHandler = new DataCollectionHandler()

var MQ_CONN_URL = `amqp://${app_settings['appConfig']['rabbit_mq_machine']}`;
amqp.connect(MQ_CONN_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    if (err) {
      logger.log("error", "Exception in the MQ channel: %s", err,{"fileName":"sender.js", "connection": MQ_CONN_URL});
      throw err;
    }
    consumers(ch)
  });
});

function consumers(ch){
    liveTweetsStore(ch);
    bufferedTweetsStore(ch);
    balancedTweetsStore(ch);
    storeTopKeywords(ch);
    storeTopHashtags(ch);
    storeTopMostInfluentialUsers(ch);
    storeTopMostActiveUsers(ch);
    storeTopMaxRetweets(ch);
    storeFullReTweets(ch);
    storePosTweets(ch);
    storeNegTweets(ch);
    fetchPeliasMapData(ch);
    DeletePeliasMapDataFromTemp(ch);
}
function liveTweetsStore(ch){
  const q = 'liveTweetsStore';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    var content = msg.content.toString(), tweetsStore = null, loggedin_user = null, tweetsFlag = null;
    logger.log("info", " [x] Received in the Queue %s", q);
    if(content && content.length>0){
      content = JSON.parse(content);
      tweetsStore = content.tweetsStore;
      let keywordMapToStore = content.keywordMapToStore;
      loggedin_user = content.loggedin_user;
      tweetsFlag = content.tweetsFlag;
      collectionHandler.liveTweetsStore(tweetsStore, keywordMapToStore, loggedin_user, tweetsFlag)
    }
    ch.ack(msg);
  }, { noAck: false });
}

function bufferedTweetsStore(ch){
  const q = 'bufferedTweetsStore';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    var content = msg.content.toString(), tweetsStore = null, loggedin_user = null, tweetsFlag = null;
    logger.log("info", " [x] Received in the Queue %s", q);
    if(content && content.length>0){
      content = JSON.parse(content);
      tweetsStore = content.tweetsStore;
      let keywordMapToStore = content.keywordMapToStore;
      loggedin_user = content.loggedin_user;
      tweetsFlag = content.tweetsFlag;
      collectionHandler.liveTweetsStore(tweetsStore, keywordMapToStore, loggedin_user, tweetsFlag)
    }
    ch.ack(msg);
  }, { noAck: false });
}

function balancedTweetsStore(ch){
  const q = 'balancedLiveTweetsStore';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    var content = msg.content.toString(), tweetsStore = null, loggedin_user = null, tweetsFlag = null;
    logger.log("info", " [x] Received in the Queue %s", q);
    if(content && content.length>0){
      content = JSON.parse(content);
      tweetsStore = content.tweetsStore;
      let keywordMapToStore = content.keywordMapToStore;
      loggedin_user = content.loggedin_user;
      tweetsFlag = content.tweetsFlag;
      collectionHandler.liveTweetsStore(tweetsStore, keywordMapToStore, loggedin_user, tweetsFlag)
    }
    ch.ack(msg);
  }, { noAck: false });
}
function storeTopKeywords(ch){
  const q = 'topKeywordsStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeTopKeywords();
    ch.ack(msg);
  }, { noAck: false });
}

function storeTopHashtags(ch){
  const q = 'topHashtagsStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeTopHashtags();
    ch.ack(msg);
  }, { noAck: false });
}

function storeTopMostInfluentialUsers(ch){
  const q = 'topMostInfluentialUsersStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {

    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeTopKMostInfluentialUsers(); //Parameters are shared using shared service
    ch.ack(msg);
  }, { noAck: false });
}

function storeTopMostActiveUsers(ch){
  const q = 'topMostActiveUsersStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {

    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeTopKMostActiveUsers(); //Parameters are shared using shared service
    ch.ack(msg);
  }, { noAck: false });
}
function storeTopMaxRetweets(ch){
  const q = 'topKMaxReTweetsStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {

    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeTopKMaxReTweets(); //Parameters are shared using shared service
    ch.ack(msg);
  }, { noAck: false });
}
function storeFullReTweets(ch){
  const q = 'fullReTweetsStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeFullReTweets();
    ch.ack(msg);
  }, { noAck: false });
}

function storePosTweets(ch){
  const q = 'storePosTweetsStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storePosTweets();
    ch.ack(msg);
  }, { noAck: false });
}

function storeNegTweets(ch){
  const q = 'storeNegTweetsStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.storeNegTweets();
    ch.ack(msg);
  }, { noAck: false });
}

function fetchPeliasMapData(ch){
  const q = 'fetchPeliasMapStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.getPeliasMapData(ch, msg);
    ch.ack(msg);
  }, { noAck: false });
}

function DeletePeliasMapDataFromTemp(ch){
  const q = 'deletePeliasMapStoreQueue';
  ch.assertQueue(q, { durable: true });
  logger.log("info"," [*] Waiting for messages in the queue %s. To exit press CTRL+C", q );
  ch.consume(q, function(msg) {
    logger.log("info", " [x] Received in the Queue %s", q);
    collectionHandler.deleteTempMapStore(ch, msg);
    ch.ack(msg);
  }, { noAck: false });
}
//Testing Code
// amqp.connect(MQ_CONN_URL, function(err, conn) {
//
//   conn.createChannel(function(err, ch) {
//
//     const q = 'hello';
//     ch.assertQueue(q, { durable: true });
//
//     logger.log("info"," [*] Waiting for messages in %s. To exit press CTRL+C", q);
//
//     ch.consume(q, function(msg) {
//       logger.log("info", " [x] Received %s", msg.content.toString());
//       setTimeout(function(){},2000)
//       ch.ack(msg);
//     }, { noAck: false });
//   });
// });
