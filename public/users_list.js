var totalItems = result.length;
console.log(result.length);
var start = -1;
var end = -1;
var reachedEnd=false;
var groupId = -1;

$(function () {
    Example.init({
        "selector": ".bb-alert"
    });
});

/**
 * This tiny script just helps us demonstrate
 * what the various example callbacks are doing
 */
var Example = (function() {
    "use strict";

    var elem,
        hideHandler,
        that = {};

    that.init = function(options) {
        elem = $(options.selector);
    };

    that.show = function(text) {
        clearTimeout(hideHandler);

        elem.find("span").html(text);
        elem.delay(200).fadeIn().delay(10000).fadeOut();
    };

    return that;
}());

// var socket = io.connect('http://10.6.9.32:8090/', {'force new connection': true});
// var socket = io.connect('http://10.6.9.32:8090');
// var socket = io.connect('https://followserver.azurewebsites.net/');

let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine,{'force new connection': true});

socket.on("followResult", function(resultLocal, error=false, errTwtUsr=false, folTweetDtls){
    if(resultLocal == 'success'){
        // for(var i=0; i<result.length; i++){
        //   if($("#item_"+i).is(':checked')){
        //   }
        // }
        folTweetDtls.forEach(function(val,key){
            $('#'+val.screen_name).find('span').text("Following")
        })
        Example.show("Now you are following selected users!");
    }else{
        // Example.show("Could not follow all users because of Twitter Rate Limit");
        Example.show('ErrCode: '+error[0].code+', Message: '+error[0].message+', ScreenName: '+ errTwtUsr.screen_name);
    }
});

socket.on("unfollowResult", function(resultLocal, error=false, errTwtUsr=false, folTweetDtls){
  if(resultLocal == 'success'){
      folTweetDtls.forEach(function(val,key){
          $('#'+val.screen_name).find('span').text("Follow")
      });
      Example.show("Now you are not following selected users!");
  }else{
      // Example.show("Could not unfollow all users because of Twitter Rate Limit");
      Example.show('ErrCode: '+error[0].code+', Message: '+error[0].message+', ScreenName: '+ errTwtUsr.screen_name);
  }
});

function loadMoreItems(isTopK, K){
  //If it is topK load then load top K users
  if(isTopK){
    $("#number_validate_msg").empty();
    if($.isNumeric(K)){
      $('#mainRow').empty();
      start = 0;
      end = K-1;
    }else{
      $("#number_validate_msg").append('<font color="red">*Enter valid number!</font>');
      return false;
    }

  } else{ //Else load next 10 users
    start = end+1;
    end = end+10;
  }

  if(end>totalItems)
    end = totalItems-1;

  groupId++;

  if(!(start>=totalItems)){
    for(var i=start; i<=end; i++){

      var name = result[i].name;
      var user_id = result[i].user_id;
      var screen_name = result[i].screen_name;
      var followers_count = result[i].followers_count_display;
      var friends_count = result[i].friends_count_display;
      var profile_banner_url = result[i].profile_banner_url;
      var statuses_count = result[i].statuses_count_display;
      var profile_image_url = result[i].profile_image_url_https;
      var freq = result[i].freq;
      if(typeof freq === 'undefined'){
        freq = 'N/A';
      }

      $('#mainRow').append(''+
      '<div class="row" style="margin: 25px 0px 25px 0px; width:100%">'+
      '  <div class="col-md-4">'+
      '   <font color="#337ab7" size="6" style="float: right;">'+(i+1)+'.</font>'+
      '  </div>'+
      '  <div class="col-md-4">'+
              '<div class="twPc-div">'+
              '    <a class="twPc-bg twPc-block" style="background-image: url('+profile_banner_url+'/600x200);" >'+
              '    </a>'+
              '  <div>'+
              '    <div class="twPc-button">'+
              '               <a id='+screen_name+' style="z-index: 1;" href=https://twitter.com/intent/follow?screen_name='+screen_name+' class="btn-twitter"><i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span></a>'+
              '    </div>'+
              ''+
              '    <a title="Mert Salih Kaplan" href="https://twitter.com/mertskaplan" class="twPc-avatarLink">'+
              '      <img alt="Mert Salih Kaplan" style="z-index: 1;" src='+profile_image_url+' class="twPc-avatarImg">'+
              '    </a>'+
              ''+
              '    <div class="twPc-divUser">'+
              '      <div class="twPc-divName">'+
              '        <a href="https://twitter.com/mertskaplan">'+name+'</a>'+
              '      </div>'+
              '      <span>'+
              '        <a href="https://twitter.com/mertskaplan">@<span>'+screen_name+'</span></a>'+
              '      </span>'+
              '    </div>'+
              ''+
              '    <div class="twPc-divStats">'+
              '      <ul class="twPc-Arrange">'+
              '        <li class="twPc-ArrangeSizeFit">'+
              '          <a href="https://twitter.com/mertskaplan" title="9.840 Tweet">'+
              '            <span class="twPc-StatLabel twPc-block">Tweets</span>'+
              '            <span class="twPc-StatValue">'+statuses_count+'</span>'+
              '          </a>'+
              '        </li>'+
              '        <li class="twPc-ArrangeSizeFit">'+
              '          <a href="https://twitter.com/mertskaplan/following" title="885 Following">'+
              '            <span class="twPc-StatLabel twPc-block">Following</span>'+
              '            <span class="twPc-StatValue">'+friends_count+'</span>'+
              '          </a>'+
              '        </li>'+
              '        <li class="twPc-ArrangeSizeFit">'+
              '          <a href="https://twitter.com/mertskaplan/followers" title="1.810 Followers">'+
              '            <span class="twPc-StatLabel twPc-block">Followers</span>'+
              '            <span class="twPc-StatValue">'+followers_count+'</span>'+
              '          </a>'+
              '        </li>'+
              '        <li class="twPc-ArrangeSizeFit">'+
              '          <a href="https://twitter.com/mertskaplan/followers" title="1.810 Followers">'+
              '            <span class="twPc-StatLabel twPc-block">Mentions</span>'+
              '            <span class="twPc-StatValue">'+freq+'</span>'+
              '          </a>'+
              '        </li>'+
              '      </ul>'+
              '    </div>'+
              '  </div>'+
              '</div>'+
      '  </div>'+
      '  <div class="col-md-4">'+
      '     <input type="checkbox" name="list_group_'+groupId+'" id="item_'+i+'" style="width: 30px; height: 30px;" unchecked>'+
      '     <input type="hidden" id=hidden_"'+i+'" value="'+screen_name+'">'+
      '  </div>'+
      '</div>'
      );
    }

    $("#mainRow").append(''+
    '<div class="row">'+
    '  <div class="col-md-4">'+
    '    '+
    '  </div>'+
    '  <div class="col-md-4">'+
    '    <hr>'+
    '  </div>'+
    '  <div class="col-md-4">'+
    '    '+
    '  </div>    '+
    '</div>'+
    '<div class="row">'+
    '  <div class="col-md-4">'+
    '    '+
    '  </div>'+
    '  <div class="col-md-4">'+
    '    <div class="row">'+
    '      <div class="col-md-6">'+
    '          <button type="button" class="btn btn-primary" style="width:100%" onclick="invertSelectionCurrentPage('+start+', '+end+')">Invert selection in current set</button>'+
    '      </div>'+
    '      <div class="col-md-6">'+
    '          <button type="button" id="select_all" class="btn btn-primary" style="width:100%" onclick="selectAllUsersCurrentPage('+start+', '+end+')">Select all in current set</button>'+
    '      </div>      '+
    '      <div class="col-md-6">'+
    '          <button type="button" id="deselect_all" class="btn btn-primary" style="width:100%; display: none;" onclick="deselectAllUsersCurrentPage('+start+', '+end+')">Deselect all in current set</button>'+
    '      </div>      '+
    '    </div>'+
    '  <div class="col-md-4">'+
    '    '+
    '  </div>    '+
    '</div>'
    );

    $("#mainRow").append(''+
    '<div class="row">'+
    '  <div class="col-md-12">'+
    '    <hr>'+
    '  </div>'+
    '</div>'
    );

  }else{
      if(!reachedEnd){
          reachedEnd = true;
          $('#mainRow').append(''+
                '<div class="row" style="margin: 25px 0px 25px 0px;">'+
                '  <div class="col-md-4">'+
                '  </div>'+
                '  <div class="col-md-4">'+
                '    <div class="panel panel-info">'+
                '      <div class="panel-body">No more items to show!</div>'+
                '    </div>'+
                '  </div>'+
                '  <div class="col-md-4">'+
                '  </div>'+
                '</div>'
          );
      }

  }

}


function selectAllUsersCurrentPage(startLocal, endLocal){
    for(var i=startLocal; i<=endLocal; i++){
        $("#item_"+i).prop("checked", true);
    }
    $("#select_all").hide();
    $("#deselect_all").show();
}

function deselectAllUsersCurrentPage(startLocal, endLocal){
    for(var i=startLocal; i<=endLocal; i++){
        $("#item_"+i).prop("checked", false);
    }
    $("#deselect_all").hide();
    $("#select_all").show();
}

function invertSelectionCurrentPage(startLocal, endLocal){
    for(var i=startLocal; i<=endLocal; i++){
        $("#item_"+i).prop("checked", !$("#item_"+i).is(":checked"));
    }
}

function changeFriendship(friendship){
  bootbox.confirm("Excessive use of Follow/Unfollow options may result in your account getting blocked by Twitter. Do you want to continue?", function(confirmation) {
    if(confirmation){
      var user_id_arr=[];
      var flag = true;
      for(var i=0; i<result.length; i++){
        if($("#item_"+i).is(':checked')){
          if($('#'+result[i].screen_name).find('span').text() && $('#'+result[i].screen_name).find('span').text().toUpperCase()==="FOLLOWING" && friendship === 'create'){
              Example.show("User <b>@"+result[i].screen_name+"</b> is already in your following list.");
              return;
          }
          else if($('#'+result[i].screen_name).find('span').text() && $('#'+result[i].screen_name).find('span').text().toUpperCase()==="FOLLOW" && friendship == 'destroy'){
              Example.show("User <b>@"+result[i].screen_name+"</b> is already in your following list.");
              return;
          }
          else{
            user_id_arr.push({"user_id": result[i].user_id, "screen_name": result[i].screen_name});
            flag = false;
          }
        }
      }

      if(flag){
        Example.show("You have not selected any user!");
      }else{
        if(friendship === 'create'){
          socket.emit("follow", user_id_arr);
        }else if(friendship == 'destroy'){
          socket.emit("unfollow", user_id_arr);
        }
      }
    }else{

    }
  });
}

function followSelected(){
  bootbox.confirm("Excessive use of Follow/Unfollow options may result in your account getting blocked by Twitter. Do you want to continue?", function(confirmation) {
    if(confirmation){
      var screen_name_arr=[];
      var flag = true;
      for(var i=0; i<result.length; i++){
        if($("#item_"+i).is(':checked')){
          if($('#'+result[i].screen_name).find('span').text() && $('#'+result[i].screen_name).find('span').text().toUpperCase()==="FOLLOWING"){
              Example.show("User <b>@"+result[i].screen_name+"</b> is already in your following list.");
              return;
          }else{
            screen_name_arr.push({"sn": result[i].screen_name});
            flag = false;
          }

        }
      }

      if(flag){
        Example.show("You have not selected any user!");
      }else{
        var screen_name_arr_json_str = JSON.stringify(screen_name_arr);
        socket.emit("follow", screen_name_arr_json_str);
      }
    }else{

    }
  });
}

function unfollowSelected(){

  bootbox.confirm("Excessive use of Follow/Unfollow options may result in your account getting blocked by Twitter. Do you want to continue?", function(confirmation) {
    if(confirmation){
      var screen_name_arr=[];
      var flag = true;
      for(var i=0; i<result.length; i++){
        if($("#item_"+i).is(':checked')){
          if($('#'+result[i].screen_name).find('span').text() && $('#'+result[i].screen_name).find('span').text().toUpperCase()==="FOLLOW"){
              Example.show("User "+result[i].screen_name+" is already UnFollowed.");
              return;
          }
          else{
            screen_name_arr.push({"sn": result[i].screen_name});
            flag = false;
          }

        }
      }

      if(flag){
        Example.show("You have not selected any user!");
      }else{
        var screen_name_arr_json_str = JSON.stringify(screen_name_arr);
        socket.emit("unfollow", screen_name_arr_json_str);
      }
    }else{

    }
  });
}


$(window).on('beforeunload', function(){
      socket.emit("abort", "No Data!");
});
