if(typeof(sharedInfluentialUsersFBHeap) === undefined){
  var sharedInfluentialUsersFBHeap = null;
}
var getInfluentialUsersFBHeap = function(){
  return sharedInfluentialUsersFBHeap;
}
var setInfluentialUsersFBHeap = function(data){
  sharedInfluentialUsersFBHeap = data;
}

if(typeof(sharedActiveUsersFBHeap) === undefined){
  var sharedActiveUsersFBHeap = null;
}
var getActiveUsersFBHeap = function(){
  return sharedActiveUsersFBHeap;
}
var setActiveUsersFBHeap = function(data){
  sharedActiveUsersFBHeap = data;
}

if(typeof(sharedTopRetweetsFBHeap) === undefined){
  var sharedTopRetweetsFBHeap = null;
}
var getTopRetweetsFBHeap = function(){
  return sharedTopRetweetsFBHeap;
}
var setTopRetweetsFBHeap = function(data){
  sharedTopRetweetsFBHeap = data;
}

if(typeof(sharedFullReTweets) === undefined){
  var sharedFullReTweets = null;
}
var getFullReTweets = function(){
  return sharedFullReTweets;
}
var setFullReTweets = function(data){
  sharedFullReTweets = data;
}



if(typeof(sharedbufferedTweets) === undefined){
  var sharedbufferedTweets = null;
}
var getBufferedTweets = function(){
  return sharedbufferedTweets;
}
var setBufferedTweets = function(data){
  sharedbufferedTweets = data;
}

if(typeof(sharedBalancedTweets) === undefined){
  var sharedBalancedTweets = null;
}
var getBalancedTweets = function(){
  return sharedBalancedTweets;
}
var setBalancedTweets = function(data){
  sharedBalancedTweets = data;
}


if(typeof(sharedTopKeywords) === undefined){
  var sharedTopKeywords = null;
}
var getTopKeywords = function(){
  return sharedTopKeywords;
}
var setTopKeywords = function(data){
  sharedTopKeywords = data;
}

if(typeof(sharedTopHashtags) === undefined){
  var sharedTopHashtags = null;
}
var getTopHashtags = function(){
  return sharedTopHashtags;
}
var setTopHashtags = function(data){
  sharedTopHashtags = data;
}

if(typeof(sharedPosTweets) === undefined){
  var sharedPosTweets = null;
}
var getPosTweets = function(){
  return sharedPosTweets;
}
var setPosTweets = function(data){
  sharedPosTweets = data;
}

if(typeof(sharedNegTweets) === undefined){
  var sharedNegTweets = null;
}
var getNegTweets = function(){
  return sharedNegTweets;
}
var setNegTweets = function(data){
  sharedNegTweets = data;
}

if(typeof(sharedPeliasMap) === undefined){
  var sharedPeliasMap = null;
}
var getMapCoordinates = function(){
  return sharedPeliasMap;
}
var setMapCoordinates = function(data){
  sharedPeliasMap = data;
}



module.exports = {
  getInfluentialUsersFBHeap : getInfluentialUsersFBHeap,
  setInfluentialUsersFBHeap : setInfluentialUsersFBHeap,

  getActiveUsersFBHeap      : getActiveUsersFBHeap,
  setActiveUsersFBHeap      : setActiveUsersFBHeap,

  getTopRetweetsFBHeap      : getTopRetweetsFBHeap,
  setTopRetweetsFBHeap      : setTopRetweetsFBHeap,

  getFullReTweets           : getFullReTweets,
  setFullReTweets           : setFullReTweets,

  getBufferedTweets         : getBufferedTweets,
  setBufferedTweets         : setBufferedTweets,

  getBalancedTweets         : getBalancedTweets,
  setBalancedTweets         : setBalancedTweets,

  getTopKeywords            : getTopKeywords,
  setTopKeywords            :  setTopKeywords,

  getTopHashtags            : getTopHashtags,
  setTopHashtags            :  setTopHashtags,

  getPosTweets              : getPosTweets,
  setPosTweets              : setPosTweets,

  getNegTweets              : getNegTweets,
  setNegTweets              : setNegTweets,

  getMapCoordinates         : getMapCoordinates,
  setMapCoordinates         : setMapCoordinates
}
