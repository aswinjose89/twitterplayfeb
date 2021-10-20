String.prototype.insertTextAtIndices = function(text) {
    return this.replace(/./g, function(character, index) {
        return text[index] ? text[index] + character : character;
    });
};

class Utilizer {

    constructor() {
    }

    htmlElementBinder(){
        let [customKey, fullTextClone] = arguments;
        var regExMatch = new RegExp(customKey, "ig");
        let match = null;
        let fullTextMatchClone = fullTextClone.slice();
        let count = 0;
        while (match = regExMatch.exec(fullTextMatchClone)) {
            let precedenceElement = '<span style="background-color: yellow">';
            let succeedenceElement = '</span>';
            let indexWithElement = (count*(precedenceElement.length + succeedenceElement.length));
            let insertElement = {};
            insertElement[match.index + indexWithElement] = precedenceElement;
            insertElement[match.index + customKey.length + indexWithElement] = succeedenceElement;
            fullTextClone = fullTextClone.insertTextAtIndices(insertElement);
            count++;
        }
        return fullTextClone
    }
}
class MixinComponent extends Utilizer{

    stringReplace(){
        let [fullText,searchText, replaceText] = arguments;
        var regEx = new RegExp(searchText, "ig");
        return fullText.replace(regEx, replaceText)
    }

    colorHighlight(){
        let [fullText, searchText, replaceText] = arguments;
        var regEx = new RegExp(searchText, "ig");
        return fullText.replace(regEx, `<span style="background-color: yellow">${replaceText}</span>`)
    }

    tweetsHighlight(){
        let [fullText, replaceStrList] = arguments;
        try {
            let fullTextClone = fullText.slice();
            replaceStrList = [...new Set(replaceStrList)];
            replaceStrList.forEach((val, key)=>{
               let re = new RegExp(val, 'ig');
               let test_match_words = fullTextClone.match(re);
               if(test_match_words){
                 test_match_words.forEach((word)=>{
                   fullTextClone = this.colorHighlight(fullTextClone,val,word);
                 });
               }
            });
            return fullTextClone;
        }
        catch(err) {
            console.log('Exception at tweetsHighlight:', err.message)
            return fullText
        }
    }
    urlify(text) {
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return `<span class="anchor"><a href='${url}' target="_blank">${url}</a></span>`;
        })
    }
    sideBar(){
        $(document).ready(function() {
            /*Side bar*/
            $('#sidebar').toggleClass('active');
            $('#sidebarCollapse').on('click', function () {
                $('#sidebar').toggleClass('active');
            });
        });
    }
   subMenuDropDownToggle(element,e){
      $(element).next('ul').toggle();
      e.stopPropagation();
      e.preventDefault();
    }
    get_tweet_text(tweet){
      return (tweet.extended_tweet && tweet.extended_tweet.full_text)?tweet.extended_tweet.full_text:
                      (tweet.retweeted_status && tweet.retweeted_status.extended_tweet && tweet.retweeted_status.extended_tweet.full_text)?tweet.retweeted_status.extended_tweet.full_text:
                      tweet.text;
    }
}
var mixin = new MixinComponent();
mixin.sideBar();
