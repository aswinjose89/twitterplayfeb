let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine +'/hashtag_cloud_tweets',{
      "path": '/hashtag_cloud_tweets',
      "force new connection" : true,
      "reconnection": true,
      "reconnectionDelay": 2000,                  //starts with 2 secs delay, then 4, 6, 8, until 60 where it stays forever until it reconnects
      "reconnectionDelayMax" : 60000,             //1 minute maximum delay between connections
      "reconnectionAttempts": "Infinity",         //to prevent dead clients, having the user to having to manually reconnect after a server restart.
      "timeout" : 10000,                           //before connect_error and connect_timeout are emitted.
      "autoConnect": true
});

class HashtagWordCloud{
  constructor(){
  }
  urlify(text) {
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      return text.replace(urlRegex, function(url) {
          return `<span class="anchor"><a href='${url}' target="_blank">${url}</a></span>`;
      })
  }
}
//var nextPagingHastagEndCnt = null;
const hashtagCloudClass = new HashtagWordCloud();
$("#loading-indicator").show();
$("#loadMore").show();

var currPage = 1, pageSize = 10;
socket.on("hashtagCloudTweets", function(hashtagTweets, hastagCloudName, totalHashtagTwtCnt, endIndex){
  $("#loading-indicator").hide();
  $(".pagingRatio").text(` (${currPage}/${Math.ceil(totalHashtagTwtCnt/pageSize)})`);
   hashtagTweets.forEach((val)=>{
    val.text= hashtagCloudClass.urlify(val.full_text || val.text);
    var regEx = new RegExp(hastagCloudName, "ig");
    val.text= val.text.replace(regEx, `<a href="https://twitter.com/intent/tweet?hashtags=${hastagCloudName.split('#').pop()}" target="_blank">${hastagCloudName}</a>`)
    $("#content").append(dyTemplates.tweet_profile_card(val, hastagCloudName, 'HASHTAG'));
  });  
  currPage++;
  if(totalHashtagTwtCnt<=endIndex){
    $("#loadMore").hide();
  }
})

function loadMoreItems(){    
  socket.emit("LoadMoreHashtagCloudTweets", currPage, pageSize);  
}
loadMoreItems();
