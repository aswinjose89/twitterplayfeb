let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine +'/keyword_cloud_tweet',{
      "path": '/keyword_cloud_tweet',
      "force new connection" : true,
      "reconnection": true,
      "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
      "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
      "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
      "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
      "autoConnect": true
});

class KeywordWordCloud{
  constructor(){
  }
  urlify(text) {
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, function(url) {
          return `<span class="anchor"><a href='${url}' target="_blank">${url}</a></span>`;
      })
  }
}

const keywordCloudClass = new KeywordWordCloud();
$("#loading-indicator").show();
$("#loadMore").show();

var currPage = 1, pageSize = 10;
socket.on("keywordCloudTweets", function(keywordTweets, keywordCloudName, totalKeywordTwtCnt, endIndex){
  //var keywordTweets = keywordCloud.tweets.children.find(x=>x.name == keywordCloud.name);
  $("#loading-indicator").hide();
  $(".pagingRatio").text(` (${currPage}/${Math.ceil(totalKeywordTwtCnt/pageSize)})`);
  keywordTweets.forEach((val)=>{
    val.text= keywordCloudClass.urlify(val.full_text || val.text);
    var regEx = new RegExp(keywordCloudName, "ig");
    val.text= val.text.replace(regEx, `<span class="anchor"><a href="https://twitter.com/intent/tweet?hashtags=${keywordCloudName.split('#').pop()}" target="_blank">${keywordCloudName}</a></span>`)
    $("#content").append(dyTemplates.tweet_profile_card(val, keywordCloudName, 'KEYWORD'));
  })
  currPage++;
  if(totalKeywordTwtCnt<=endIndex){
    $("#loadMore").hide();
  }
});

function loadMoreItems(){    
  socket.emit("LoadMoreKeywordCloudTweets", currPage, pageSize);  
}
loadMoreItems();
