let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine+'/tweet_cloud_nsp', { //nsp = namespace
      "path": '/tweet_cloud',
      "force new connection" : true,
      "reconnection": true,
      "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
      "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
      "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
      "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
});
socket.on('disconnect', function() {
    $(location).attr('href', '/logout');
});
var hastag_cloud_tweets = null;
var keywords_cloud_tweets = null;
var WORD_CLOUD_REFRESH_DELAY;
$.getJSON('/static/default_values.json' ,function(data){
  WORD_CLOUD_REFRESH_DELAY = data["WORD_CLOUD_REFRESH_DELAY"];
});

class TweetsCloud{
  constructor(){
    this.WORD_CLOUD_REFRESH_DELAY = WORD_CLOUD_REFRESH_DELAY
  }
  urlify(text) {
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, function(url) {
          return `<span class="anchor"><a href='${url}' target="_blank">${url}</a></span>`;
      })
  }
  updateWordCloud(){
    socket.emit("getTopKKeywordsAndHashTags", "No Data!");
    setTimeout(updateWordCloud, WORD_CLOUD_REFRESH_DELAY);
  }
  colores_google(n) {
    var colores_g = ["#3276B1", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
  }
  showHashtagTweetsFromBubble(element,evt,name){
    if(hastag_cloud_tweets){
      socket.emit('hastag_cloud_tweets', hastag_cloud_tweets, name);
    }
  }
  classes(root) {
    var classes = [];
    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: node.color, className: node.name, value: node.size});
    }
    recurse(null, root);
    return {children: classes};
  }
  drawKeywordBubbles(jsonString){
      var jsonObject = JSON.parse(jsonString);
      keywords_cloud_tweets = jsonObject;
      Highcharts.chart('wordcloud', {
        plotOptions: {
              wordcloud: {
                minFontSize:25,
                maxFontSize:100
              },
              series: {
                  cursor: 'pointer',
                  events: {
                      click: function (event) {
                        showKeywordTweetsFromBubble(event.target, event, event.target.textContent)
                      }
                  }
              }
          },
        series: [{
          type: 'wordcloud',
          data: jsonObject.children,
          name: 'Occurrences'
        }],
        title: {
          text: 'Tweets Keyword Cloud'
        }
      });
  }
  drawHashTagBubbles(jsonString){
        var jsonObject = JSON.parse(jsonString);
        hastag_cloud_tweets = jsonObject;
        Highcharts.chart('hashtag_wordcloud', {
          plotOptions: {
                wordcloud: {
                  minFontSize:25,
                  maxFontSize:100
                },
                series: {
                    cursor: 'pointer',
                    events: {
                        click: function (event) {
                          showHashtagTweetsFromBubble(event.target, event, event.target.textContent)
                            // alert(
                            //     this.name + ' clicked\n' +
                            //     'Alt: ' + event.altKey + '\n' +
                            //     'Control: ' + event.ctrlKey + '\n' +
                            //     'Meta: ' + event.metaKey + '\n' +
                            //     'Shift: ' + event.shiftKey
                            // );
                        }
                    }
                }
            },
          series: [{
            type: 'wordcloud',
            data: jsonObject.children,
            name: 'Occurrences'
          }],
          title: {
            text: 'Tweets Hashtags Cloud'
          }
        });
  }
}

const tweetsCloudClass = new TweetsCloud()

function showHashtagTweetsFromBubble(element,evt,name){
  if(hastag_cloud_tweets){
    socket.emit('hastag_cloud_tweets', hastag_cloud_tweets, name);
  }
}
function getKeywordsAndHashtags(){
  var twtsCnt = $('#totalTwts').val()
  if(twtsCnt){
    socket.emit('latestKeywordsAndHashTagsOnDays', parseInt(twtsCnt));
  }

}


socket.on('takeTopKKeywords', function(jsonString){
  if(jsonString.length>35)
    tweetsCloudClass.drawKeywordBubbles(jsonString)
});

socket.on('takeTopKHashtags', function(jsonString){
  if(jsonString.length>35)
    tweetsCloudClass.drawHashTagBubbles(jsonString);
});
socket.on('hastag_cloud_processed',function(hastagCloud, msg){
  $("#tweets_cloud_cards").empty()
  $("#tweets_cloud_cards").append("<h1>Hashtag Tweets</h1>");
  setTimeout(function(){
    $('html, body').animate({
          scrollTop: $("#tweets_cloud_cards div").offset().top
      }, 1000);
  },50)
  var hashtagTweets = hastagCloud.tweets.children.find(x=>x.name == hastagCloud.name);
  hashtagTweets.tweet.forEach((val)=>{
    val.text= tweetsCloudClass.urlify(val.full_text || val.text);
    var regEx = new RegExp(hastagCloud.name, "ig");
    val.text= val.text.replace(regEx, `<span class="anchor"><a href="https://twitter.com/intent/tweet?hashtags=${hastagCloud.name.split('#').pop()}" target="_blank">${hastagCloud.name}</a></span>`);
    $("#tweets_cloud_cards").append(dyTemplates.tweet_cloud_cards(val, hastagCloud.name));
  })
})


function showKeywordTweetsFromBubble(element,evt,name){
  if(keywords_cloud_tweets){
    socket.emit('keyword_cloud_tweets', keywords_cloud_tweets, name);
  }
}
socket.on('keyword_cloud_processed',function(keywordCloud, msg){
  $("#tweets_cloud_cards").empty()
  $("#tweets_cloud_cards").append("<h1 style='text-align:center'>Keyword Tweets</h1>");
  setTimeout(function(){
    $('html, body').animate({
          scrollTop: $("#tweets_cloud_cards div").offset().top
      }, 1000);
  },50)
  var keywordTweets = keywordCloud.tweets.children.find(x=>x.name == keywordCloud.name);
  keywordTweets.tweet.forEach((val)=>{
    val.text= tweetsCloudClass.urlify(val.full_text || val.text);
    var regEx = new RegExp(keywordCloud.name, "ig");
    val.text= val.text.replace(regEx, `<span class="anchor"><a href="https://twitter.com/intent/tweet?hashtags=${keywordCloud.name.split('#').pop()}" target="_blank">${keywordCloud.name}</a></span>`)
    $("#tweets_cloud_cards").append(dyTemplates.tweet_cloud_cards(val, keywordCloud.name));
  })
})
