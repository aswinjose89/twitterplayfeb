
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '';
    })
}

var Twitter = require('node-tweet-stream')
  , t = new Twitter({
    consumer_key: 'aanFGgdZiPJGNbdLizRYjP1Qs',
    consumer_secret: 't2Ld7foLzhOaBZy6pM97PaQ1w7gqEgtHR1D9N0Cw17n5rywC2w',
    token: '3194262680-5x9VdFIfwxIJ1JhDbxx2KE5yglaKamJOKfvgU3K',
    token_secret: 'Lq9G3b5yyrQQ98BAEXwvWZaWsQr6a3DuMtdQYwAMBLm8P'
  })

t.on('tweet', function (tweet) {
  var text = tweet.text;
  var hashtags = tweet.entities.hashtags;
  var user_mentions = tweet.entities.user_mentions;
  var urls = tweet.entities.urls;
  var symbols = tweet.entities.symbols
  console.log("Before Text: "+tweet.text)
  //console.log('HashTags: ', tweet.entities.hashtags)

  //console.log('Mentions: ', tweet.entities.user_mentions)
  // console.log('Urls: ', tweet.entities.urls)
  //console.log('Symbols: ', tweet.entities.symbols)
  if(hashtags.length != 0){
    for(var i=0; i<hashtags.length; i++){
      var hashtag = '#'+hashtags[i].text;
      text = text.replace(hashtag, '');
    }
  }

  if(user_mentions.length != 0){
    for(var i=0; i<user_mentions.length; i++){
      var user_mention = '@'+user_mentions[i].screen_name;
      text = text.replace(user_mention, '');
    }
  }

  if(urls.length != 0){
    for(var i=0; i<urls.length; i++){
      var urlT = urls[i].url;
      text = text.replace('/'+urlT+'/g', '');
    }
  }
  text = urlify(text);
  text = text.toLowerCase();
  text = text.trim().replace(/["~!$%^&*\(\)_+=`{}\[\]\|\\:;'<>,.\/?"\- \t\r\n]+/g, '-'); //Remove all special characters except #
  //text = text.replace(/\s{2,}/g, ' ');
  //var strArray = text.split('-');

  console.log("After Text: "+text)
  //console.log(user_mentions);
  //console.log("------------------------------------------\n\n")

})

t.on('error', function (err) {
  console.log('Oh no')
})

t.track('india')
