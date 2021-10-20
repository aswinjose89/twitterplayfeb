var app_settings = require('../../config/app_settings.json');
require('../../environment.js')(app_settings);
app_settings= appSettings || app_settings;
const amqp = require('amqplib/callback_api');
var MQ_CONN_URL = `amqp://${app_settings['appConfig']['rabbit_mq_machine']}`;
var channel = null;
amqp.connect(MQ_CONN_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {
    if (err) {
      logger.log("error", "Exception in the MQ channel: %s", err, {"fileName":"sender.js", "connection": MQ_CONN_URL});
      throw err;
    }
    channel = ch;
  });
});

//Testing code
// amqp.connect(MQ_CONN_URL, function(err, conn) {
//
//   conn.createChannel(function(err, ch) {
//     const q = 'hello';
//     ch.assertQueue(q, { durable: true });
//     // Note: on Node 6 Buffer.from(msg) should be used
//     ch.sendToQueue(q,
//      new Buffer('Hello World test1!'),
//      { persistent: true }
//     );
//     console.log(" [x] Sent 'Hello World test1!'");
//
//     const q1 = 'hello';
//     ch.assertQueue(q1, { durable: true });
//     // Note: on Node 6 Buffer.from(msg) should be used
//     ch.sendToQueue(q1,
//      new Buffer('Hello World test2!'),
//      { persistent: true }
//     );
//     console.log(" [x] Sent 'Hello World test2!'");
//   });
// });

process.on('exit', function(code) {
   channel.close();
   logger.log("info", `Closing rabbitmq channel`);
});

var publishToQueue = function(queueName, data) {
  if(data === undefined){
    data = '';
  }
  else if(data && typeof(data) === "object"){
    data = JSON.stringify(data)   //Pass only low weighted data, maximum 5 mb data
  }

  channel.assertQueue(queueName, {
    durable: true  //While asserting the queue, we pass an option { durable: true } which makes the queue to persist even after the connection is closed
  });
  channel.sendToQueue(queueName, new Buffer(data), { persistent: true });
  logger.log("info", `MQ produced a queue with queueName: %s`, queueName);
}
// setTimeout(function(){
//   publishToQueue("liveTweetsStore",JSON.stringify({"tweetsStore":[1,2,3],"keywordMapToStore":"store aswin","loggedin_user":"aswin"}))
// },2000)
module.exports = {
    publishToQueue: publishToQueue
}
