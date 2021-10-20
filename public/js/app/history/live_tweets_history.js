let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine,{'force new connection': true});
var role_map_twt_dtls = null, live_twts_selected_usrs = null;
var tweets_classifications= (sessionStorage.mongoFieldData)? JSON.parse(sessionStorage.mongoFieldData).tweets_classifications: null;    

/* AngularJS Starts Here */
(function () {
  var app = angular.module("tweetHistory", ['ngMaterial', 'ngMessages','Twitterplay.services', 'twitter.directives']);
  app.controller("tweetHistoryController",tweetHistoryController)
  .service("$tweetHstrySvc", tweetHstryService);
  function tweetHstryService(){    
    this.wordChart= function(chartName, wordFunction, data, title){      
      Highcharts.chart(chartName, {
          plotOptions: {
              wordcloud: {
                  minFontSize: 45,
                  maxFontSize: 100
              },
              series: {
                  cursor: 'pointer',
                  events: {
                      click: function(event) {
                        wordFunction(event.target, event, event.target.textContent)
                      }
                  }
              }
          },
          series: [{
              type: 'wordcloud',
              data: data,
              name: 'Occurrences'
          }],
          title: {
              text: title
          }
      });
    }

    
    this.loadDateRangePicker = function(tagId, createdDateRange ={}, callback){
      var start = moment().subtract(29, 'days');
      var end = moment();

      function cb(start, end) {
          if(start & end){
            createdDateRange['startDate'] = start.format('MMMM D, YYYY');
            createdDateRange['endDate'] = end.format('MMMM D, YYYY');
          }
          $(`#${tagId} span`).html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
          callback(createdDateRange);
      }
      $(`#${tagId}`).daterangepicker({
          startDate: start,
          endDate: end,
          ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
          }
      }, cb);
      //
      cb(start, end);
      $(`#${tagId}`).on('cancel.daterangepicker', function(ev, picker) {
        //do something, like clearing an input
        $(`#${tagId}`).val('');
        createdDateRange = {};
      });

    }
    this.Example = (function() {
        "use strict";

        var elem,
            hideHandler,
            that = {};

        that.init = function(options) {
            elem = $(options.selector);
        };

        that.show = function(text, type) {
            clearTimeout(hideHandler);
            elem.removeClass("alert-danger alert-success alert-info alert-warning").addClass((type=="danger")?"alert-danger":(type=="success")?"alert-success":(type=="warning")?"alert-warning":"alert-info");
            elem.find("span").html(text);
            elem.delay(200).fadeIn().delay(10000).fadeOut();
        };
        // that.danger = function(text) {
        //     clearTimeout(hideHandler);
        //     elem = $(".bb-alert-dg");
        //     elem.find("span").html(text);
        //     elem.delay(200).fadeIn().delay(10000).fadeOut();
        // };
        // that.success = function(text) {
        //     clearTimeout(hideHandler);
        //     elem = $(".bb-alert-success");
        //     elem.find("span").html(text);
        //     elem.delay(200).fadeIn().delay(10000).fadeOut();
        // };

        return that;
    }());
    this.downloadURI= function(uri, filename) {
        var link = document.createElement("a");
        link.download = filename;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        // document.body.removeChild(link);
        // delete link;
    }
  }

  function tweetHistoryController(remoteCall, $tweetHstrySvc, $mdToast, $log, $compile, $scope){
    var vm = this;  
    vm.createdDateRange ={}; 
    vm.sessionDateRange ={}; 
    vm.isDateWiseKeywords= false;
    vm.isSessionWiseKeywords= false;
    vm.searchObject= null;
    var Example= $tweetHstrySvc.Example;
    vm.searchHistory= function(element){
      let inputObject= {};
      inputObject.custom_keys= $("#date_custom_keys").val();
      inputObject.tweet_created_date=vm.createdDateRange;
      vm.searchObject = inputObject;
      localStorage.setItem("HstrysearchInput", JSON.stringify(inputObject));
      topHashtagData(vm.createdDateRange);
      topKeywordData(vm.createdDateRange);
      influentialUsersData(vm.createdDateRange);
      activeUsersData(vm.createdDateRange);
      liveTwtsHstry.searchHistory(inputObject);
    }

    vm.searchHistorySessionWise= function(element){
      let inputObject= {};
      inputObject.custom_keys= $("#session_custom_keys").val();
      inputObject.session_ids= $("#all_keyword_sessions").val();      
      inputObject.tweet_created_date= vm.sessionDateRange;
      vm.searchObject = inputObject;
      localStorage.setItem("HstrysearchInput", JSON.stringify(inputObject));
      topHashtagData(vm.sessionDateRange);
      topKeywordData(vm.sessionDateRange);
      influentialUsersData(vm.sessionDateRange);
      activeUsersData(vm.sessionDateRange);
      liveTwtsHstry.searchHistory(inputObject);
    }
    function topHashtagData(dateRange){
      let dataInput= {};
      dataInput.dateRange= dateRange;
      remoteCall.get("/topHashtagData",dataInput).then((result)=>{
        if(result.data.status === "success"){
          $tweetHstrySvc.wordChart('hashtag_wordcloud', showHashtagTweetsFromBubble, result.data.data, 'Tweets Hashtag Cloud');
          function showHashtagTweetsFromBubble(element, evt, name) {
                socket.emit('hastag_cloud_tweets', result.data.data, name);
          }
          socket.on('hastag_cloud_processed', function(msg) {
              window.open(protocol + '://' + node_machine + "/historyHashtagCloud");
          })
        }
      });
    }
    
    function topKeywordData(dateRange){
      let dataInput= {};
      dataInput.dateRange= dateRange;
      remoteCall.get("/topKeywordData", dataInput).then((result)=>{
        if(result.data.status === "success"){
          $tweetHstrySvc.wordChart('wordcloud', showKeywordTweetsFromBubble, result.data.data, 'Tweets Keyword Cloud');
          function showKeywordTweetsFromBubble(element, evt, name) {
            socket.emit('keyword_cloud_tweets', result.data.data, name);
          }
          socket.on('keyword_cloud_processed', function(msg) {
              window.open(protocol + '://' + node_machine + "/historyKeywordCloud");
          })
        }
      });
    }

    function influentialUsersData(dateRange){
      let dataInput= {};
      dataInput.dateRange= dateRange;
      dataInput.skip= 0;
      dataInput.limit= 50;
      remoteCall.get("/getInfluentialUsers", dataInput).then((result)=>{
        if(result.data.status === "success"){
            vm.influentialData= result.data.data;
        }
      });
    }
    

    function activeUsersData(dateRange){
      let dataInput= {};
      dataInput.dateRange= dateRange;
      dataInput.skip= 0;
      dataInput.limit= 50;
      remoteCall.get("/getActiveUsers", dataInput).then((result)=>{
        if(result.data.status === "success"){
          vm.activeData= result.data.data;
        }
      });
    }

   
    function rendercustomKeywordSessions(tagId){
      let $select= $(tagId).selectize({
        maxItems: null,
        options: [],
        optgroups: [],
        labelField: 'sessionName',
        valueField: 'session_id',
        optgroupField: 'createdAt',
        optgroupLabelField: 'createdAt',
        optgroupValueField: 'createdAt',
        searchField: ['sessionName'],
        sortField: [
          {
              field: 'createdAt',
              direction: 'desc'
          },
          {
              field: 'session_order_id'
          }
      ],
        plugins: ['optgroup_columns', 'remove_button']
      });
      $(`#all_keyword_sessions`).on('change', function(ev, picker) {
          let sessionIdList= $(tagId).val();
          getSessionWiseCustomKeywords("#session_custom_keys", sessionIdList)
      });
        return $select;
    }
    rendercustomKeywordSessions("#all_keyword_sessions");
    function customKeywordSessions(tagId, dateRange){
      let dataInput= {};
      dataInput.dateRange= dateRange;
      remoteCall.get("/getCustomKeywordSessions", dataInput).then((result)=>{
        if(result.data.status === "success"){
          let data= result.data.data;
          let $selectGroup= rendercustomKeywordSessions("#all_keyword_sessions");
          var selectize = $selectGroup[0].selectize;
          selectize.clearOptions();
          selectize.clearOptionGroups();
          data.options.forEach((val)=>{
            selectize.addOption(val);
          })      
          data.optgroups.forEach((val)=>{
            selectize.addOptionGroup(val.createdAt, {
                label: val.createdAt
            });
          });  
        }
      });
    }
    
    function renderCustomKeywords(tagId){
      let $select= $(tagId).selectize({
        plugins: ['remove_button'],
          maxItems: null,
          valueField: 'label',
          labelField: 'label',
          searchField: 'label',
          sortField: 'label',
          options: [],
          create: false
        });
        return $select;
    }
    renderCustomKeywords("#date_custom_keys");
    // renderCustomKeywords("#session_custom_keys");

    function getDateWiseCustomKeywords(tagId, dateRange){
      let dataInput= {};
      dataInput.dateRange= dateRange;
      dataInput.flag= "DATEWISE";
      remoteCall.get("/getCustomKeywords",dataInput).then((result)=>{
        if(result.data.status === "success"){          
          let $select= renderCustomKeywords(tagId);          
          let selectize = $select[0].selectize;
          selectize.clearOptions();
          selectize.addOption(result.data.data);
          if(result.data.data.length>0){
            vm.isDateWiseKeywords= true;
          }
        }
      });  
    }    
    function getSessionWiseCustomKeywords(tagId, sessionIdList){
      let dataInput= {};      
      dataInput.flag= "SESSIONWISE";
      if(sessionIdList){
        dataInput.sessionIdList= sessionIdList.join(',');
        vm.isSessionWiseKeywords= true 
      }
      else{
        dataInput.sessionIdList= undefined;
        vm.isSessionWiseKeywords= false; 
      }
      remoteCall.get("/getCustomKeywords",dataInput).then((result)=>{
        if(result.data.status === "success"){        
          let $select= renderCustomKeywords(tagId);          
          let selectize = $select[0].selectize;
          selectize.clearOptions();
          selectize.addOption(result.data.data);
        }
      });  
    }
    function dateWiseRangeOnChange(dateRange){
      getDateWiseCustomKeywords("#date_custom_keys", vm.createdDateRange);
    }
    function sessionWiseRangeOnChange(dateRange){
      customKeywordSessions("#all_keyword_sessions", vm.sessionDateRange);
    }  
    $(document).ready(function() {      
      $(function() {
          Example.init({
              "selector": ".bb-alert"
          });
      });
      $tweetHstrySvc.loadDateRangePicker("date_reportrange", vm.createdDateRange, dateWiseRangeOnChange);
      $tweetHstrySvc.loadDateRangePicker("session_reportrange", vm.sessionDateRange, sessionWiseRangeOnChange);
      topHashtagData(vm.createdDateRange);
      topKeywordData(vm.createdDateRange);
      influentialUsersData(vm.createdDateRange);
      activeUsersData(vm.createdDateRange);
      localStorage.setItem("HstrysearchInput",JSON.stringify({"tweet_created_date": vm.createdDateRange}));
      $("#loading-indicator").hide();
    });    

    vm.SinglefollowOrUnfollowUser= function(data) {
        let [evt, user_id]= [data.evt, data.user_id];
        evt.preventDefault();
        vm.selectedFollowUserEvent= evt.target;
        if ($(evt.target).text().trim() == 'Following') {
            socket.emit("singleunfollow", user_id);
        } else {
            socket.emit("singlefollow", user_id);
        }
    }
    socket.on("singlefollowResult", function(resultLocal, error) {
      if (resultLocal == 'success') {
          $(vm.selectedFollowUserEvent).text("Following")
          // Example.show("Now you are following selected users!");
          $mdToast.show(
            $mdToast.simple()
            .textContent('Now you are following selected user!')
            .position("bottom right")
            .hideDelay(3000))
          .then(function() {
            $log.log('Toast dismissed.');
          }).catch(function() {
            $log.log('Toast failed or was forced to close early by another toast.');
          });
      } else {
          // alert("Could not follow selected user.");
          alert("Twitter code:" + error[0].code + ' Message:' + error[0].message)
      }
  });

  socket.on("singleunfollowResult", function(resultLocal, error) {
      if (resultLocal == 'success') {
          $(vm.selectedFollowUserEvent).text("Follow")
          // Example.show("Now you are Unfollowing selected users!");
          $mdToast.show(
            $mdToast.simple()
            .textContent('Now you are Unfollowing selected user!')
            .position("bottom right")
            .hideDelay(3000))
      } else {
          // alert("Could not Unfollow selected user.");
          alert("Twitter code:" + error[0].code + ' Message:' + error[0].message)
      }
  });    
    $scope.downloadTweets= function(){
        let date_range = vm.searchObject.tweet_created_date,
            custom_keys = vm.searchObject.custom_keys,
            session_ids = vm.searchObject.session_ids;        
        let downlInput= {
          "date_range":date_range,
          "custom_keys":custom_keys,
          "session_ids": session_ids
        }        
        let historyTableInfo = vm.historyTable.page.info();
        if (historyTableInfo.recordsTotal>25000) {
          if(confirm("Total records are more than 25k.Are you sure to continue?")){
            $(".download-spinner").show();
            socket.emit("tweetsDownload", downlInput);
          }             
        }
        else{
          $(".download-spinner").show();
          socket.emit("tweetsDownload", downlInput); 
        }
        
             
    }

    socket.on("histTweetsDownload",function(filename, download_path){
      $(".download-spinner").hide();
      if(download_path && filename){        
        $tweetHstrySvc.downloadURI(download_path, filename);            
      }
      else{
        Example.show("No Tweets Exists to Download!!!", "warning");            
      }
    });
    socket.on("histTweetsDownloadError",function(err){
      console.log(err);
      Example.show("Found Error..Contact Admin!!!", "danger");
    });



      socket.on('disconnect', function() {
          $(location).attr('href', '/logout');
      });
      $('#historyTable').hide();
      class TwtHstryBaseComponent {
          constructor() {
              var self = this;
          }
          renderColumns(){
            function live_twt_classification_binder(){
                var [tweets_classifications] = arguments;
                var strConcat = "";
                if(tweets_classifications){
                  tweets_classifications.forEach((val)=>{
                    strConcat=`<li><a tabindex="-1" style="cursor: pointer;" onclick='tweetActions(this,"CLASSIFICATION", event, ${JSON.stringify(val)})'>${val.label}</a></li>`+ strConcat
                  })
                }                
                return strConcat;
            }
            function tooltipUpdateStatus(){
              let [data, type, row, meta] = arguments;
              if (data){
                  let imp = "",category = "",classification = "",users = "";
                  if(data.is_important){
                    imp = `
                          <tr>
                              <th scope="row">Important</th>
                              <td>${data.is_important}</td>
                          </tr>
                    `;
                  }
                  if(data.category){
                    category = `
                          <tr>
                              <th scope="row">Category</th>
                              <td>${data.category}</td>
                          </tr>
                    `;
                  }
                  if(data.classification){
                    classification = `
                          <tr>
                              <th scope="row">Classification</th>
                              <td>${data.classification}</td>
                          </tr>
                    `;
                  }
                  if(data.users && data.users.length>0){
                    users = `
                          <tr>
                              <th scope="row">UserId</th>
                              <td>${data.users.join(',')}</td>
                          </tr>
                    `;
                  }
                  let contentHtml = `
                      <table class="toolTipCrossTable">
                          <tbody>
                              ${imp}
                              ${category}
                              ${classification}
                              ${users}
                          </tbody>
                      </table>
                  `
                  $(meta.settings.aoData[meta.row].nTr.children[meta.col]).tooltipster({
                            position: 'top',
                            contentAsHTML:true,
                            content: contentHtml,
                            interactive: true,
                            animation: 'fade',
                            delay: 200,
                            theme: 'tooltipster-punk'
                    });
                  $(meta.settings.aoData[meta.row].nTr.children[meta.col]).hover(function(e) {
                      $(this).css("background-color",e.type === "mouseenter"?"#acd6f7":"transparent");
                  });
              }
            }
            function renderUpdateStatus(){
              let [data, type, row, meta] = arguments;
              tooltipUpdateStatus(...[data, type, row, meta]);
              let render = `<span class="updateStatus dot ${(data)?'bg-dark-blue':''}"></span>`;
              return render;
            }
            function getTweetCard(row){
              if(row.custom_matching_keywords.filter(x=>x !=="unreliable_key").length>0){
                row.text = mixin.tweetsHighlight(row.text, row.custom_matching_keywords);
                row.text = mixin.urlify(row.text);
              }
              let strRow = JSON.stringify(row);
              var tweet_card = `
                      <div class="tweet-card-hst well well-lg col-xs-12" style="width:98%">
                            <div class="btn-group pull-right">
                                <button type="button" class="btn dropdown-toggle tweets-btn-menu btn-info" title="Select to update status.." style="color:black" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="ion-chevron-down"></i>
                                </button>
                                <ul class="dropdown-menu live_twt_dropdown">
                                  <li><a style="cursor: pointer;" onclick="tweetActions(this,&quot;IMP&quot;,event)"><img src="https://img.icons8.com/color/48/000000/box-important.png" style=" width: 25px;margin-right: 6px;float:left">Mark Important</a></li>
                                  <li class="dropdown-submenu">
                                    <a tabindex="-1" href="#" onclick="subMenuToggle(this, event)">Category</a>
                                    <ul class="dropdown-menu live_twt_dropdown_submenu">
                                      <li><a tabindex="-1" style="cursor: pointer;" onclick="tweetActions(this,&quot;CAT_IGN&quot;, event)">Ignore</a></li>
                                      <li><a tabindex="-1" style="cursor: pointer;" onclick="tweetActions(this,&quot;CAT_FOL&quot;, event)">FollowUp</a></li>
                                      <li><a tabindex="-1" style="cursor: pointer;" onclick="tweetActions(this,&quot;CAT_RES&quot;, event)">Research</a></li>
                                    </ul>
                                  </li>
                                  <li class="dropdown-submenu">
                                    <a tabindex="-1" href="#" onclick="subMenuToggle(this, event)">Classifications</a>
                                    <ul class="dropdown-menu live_twt_dropdown_submenu">
                                    ${live_twt_classification_binder(tweets_classifications)}
                                    </ul>
                                  </li>
                                  <li role="separator" class="divider"></li>
                                  <li><a style="cursor: pointer;" data-toggle="modal" data-target="#role_mapping_modal" onclick="get_twts_dtl_from_role_mapping(this)"><img style="width: 30px; margin-right: 6px;float:left" src="https://img.icons8.com/bubbles/50/000000/groups.png">Assign to</a></li>
                                </ul>
                            </div>
                          <div style="float: left; width: 6%"><img src=${row.profile_image_url_https} onerror="this.src='/static/images/default_profile_normal.png';" height=35 width=35></img>
                          </div><span style="width: 86%"><b>${row.name}</b> @${row.screen_name}    <font color="#0099CC"> ${(row.location!=='' && row.location!==null)?row.location: 'Not available'}</font></br> <font color="#060606"> ${row.text}</span>
                          <div class="row pull-right" style="width:100%">
                              <script type="text/javascript" async="" src="https://platform.twitter.com/widgets.js"></script>
                              <div style="margin-top: 6px;margin-right: 5px;float:right">
                                    <a class="btn-twitter" href="https://twitter.com/intent/tweet?in_reply_to=${row.tweet_id_str}"><i class="fa fa-twitter fa_logo fa-lg"></i> Reply</a>
                              </div>
                              <div style="margin-top: 6px;margin-right: 5px;float:right">
                                    <a class="btn-twitter" href="https://twitter.com/intent/retweet?tweet_id=${row.tweet_id_str}"><i class="fa fa-twitter fa_logo fa-lg"></i> Retweet</a>
                              </div>
                              <div>
                                  <div class="twPc-button" style="margin-top: 6px;margin-right: 5px;float:right">
                                        <a id='${row.screen_name}' style="z-index: 1;" href=https://twitter.com/intent/follow?screen_name=${row.screen_name} class="btn-twitter"><i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span></a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  `;
                  return tweet_card;
            }

              var columns = [
                  { 'data': null },
                  { "data": "profile_image_url_https" ,"className": "text-center",
                        render: function (data, type, row, meta) {
                            var account_url = "https://twitter.com/"+ row.screen_name;
                            var element = `
                              <a href=${account_url} class="img-thumbnail img-responsive img-rounded img-circle" target="_blank">
                                <img src=${data} alt="Profile Picture" class="img-circle" onerror="this.src='/static/images/default_profile_normal.png';">
                              </a>
                            `;
                            return element
                        // return $('<img>')
                        //    .attr('src', data)
                        //    .attr('width', '50')
                        //    .attr('height', '50')
                        //    .attr('class', 'img-circle')
                        //    .wrap('<div></div>')
                        //    .parent()
                        //    .html();
                          }
                  },
                  { "data": "name", "className": "text-center" },
                  { "data": "screen_name"  ,"className": "text-center",
                        render: function (data, type, row, meta) {
                            var tweets_cloud_url = `/tweetsCloud?screen_name=${data}&followers_count=${row.followers_count}&friends_count=${row.friends_count}&location=${row.location}&statuses_count=${row.statuses_count}&name=${row.name}&language=${row.language}&profile_image_url_https=${row.profile_image_url_https}&profile_banner_url=${row.profile_banner_url}`;
                            return $('<a style="text-decoration:underline;cursor:pointer">')
                              .attr('href', tweets_cloud_url)
                              .attr('target', '_blank')
                              .text(data)
                              .wrap('<div></div>')
                              .parent()
                              .html();
                        }
                  },
                  { "data": "custom_matching_keywords" ,"className": "text-center",
                        render: function (data, type, row, meta) {
                            if(data && data.includes("unreliable_key")){
                              return `<span style="background:yellow;text-decoration: line-through;">${row.custom_keywords}</span></br></br><span style="float:right;color:red;font-style: italic;font-family: cursive;text-decoration: overline;">No Exact Match</span>`
                            }
                            else{
                              return `<span style="background:yellow">${data}</span>`
                            }
                        // return $('<img>')
                        //    .attr('src', data)
                        //    .attr('width', '50')
                        //    .attr('height', '50')
                        //    .attr('class', 'img-circle')
                        //    .wrap('<div></div>')
                        //    .parent()
                        //    .html();
                          }
                  },
                  { "data": "text" ,
                  "width": "40%",
                            render: function (data, type, row, meta) {
                                return getTweetCard(row);
                            }
                  },
                  { "data": "friends_count" ,"className": "text-center",
                      render: function (data, type, row, meta) {
                          var tweets_cloud_url = `/tweetsCloud?screen_name=${data}&followers_count=${row.followers_count}&friends_count=${row.friends_count}&location=${row.location}&statuses_count=${row.statuses_count}&name=${row.name}&language=${row.language}&profile_image_url_https=${row.profile_image_url_https}&profile_banner_url=${row.profile_banner_url}`;
                          return $('<a style="text-decoration:underline;cursor:pointer">')
                            .attr('href', tweets_cloud_url)
                            .attr('target', '_blank')
                            .text(data)
                            .wrap('<div></div>')
                            .parent()
                            .html();
                      }
                  },
                  { "data": "followers_count" ,"className": "text-center",
                    render: function (data, type, row, meta) {
                        var tweets_cloud_url = `/tweetsCloud?screen_name=${data}&followers_count=${row.followers_count}&friends_count=${row.friends_count}&location=${row.location}&statuses_count=${row.statuses_count}&name=${row.name}&language=${row.language}&profile_image_url_https=${row.profile_image_url_https}&profile_banner_url=${row.profile_banner_url}`;
                        return $('<a style="text-decoration:underline;cursor:pointer">')
                          .attr('href', tweets_cloud_url)
                          .attr('target', '_blank')
                          .text(data)
                          .wrap('<div></div>')
                          .parent()
                          .html();
                    }
                  },
                  { "data": "actions" ,"className": "text-center",
                            render: function (data, type, row, meta) {
                                return renderUpdateStatus(...[data, type, row, meta])
                            }
                  },
                  { "data": "created_at", "className": "text-center" }
              ]
              return columns;
          }
      }
      class LiveTweetsHistory extends TwtHstryBaseComponent{
          constructor(){
            super();
          }
          loadDatatable(){
            var [date_range, custom_keys, session_ids] = arguments;
            var datatable = {
                    "dom": '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-tl ui-corner-tr hstry-header-toolbar"lipfr>'+
                            't'+
                            '<"fg-toolbar ui-toolbar ui-widget-header ui-helper-clearfix ui-corner-bl ui-corner-br"ip>',
                    "select": {
                           style:    'os',   //default but you have to specify it, no idea why
                           selector: 'tr:not(.no-select) td'
                       },
                    "processing": true,
                    "serverSide": true,
                    "pagingType": "full_numbers",
                    "ajax": {
                          "url": 'live_twts_data',
                          "type": "GET",
                          "contentType": "application/json; charset=utf-8",
                          "datatype": "json",
                          "data": {
                            "date_range":date_range,
                            "custom_keys":custom_keys,
                            "session_ids": session_ids
                          },
                          "dataFilter": function(reps) {
                            return reps;
                          },
                          "error":function(err){
                          }
                      },
                    "columns": super.renderColumns(),
                  'responsive': {
                    'details': {
                        'type': 'column',
                        'target': 0
                    }
                  },
                  'columnDefs': [
                      {
                        'data': null,
                        'defaultContent': '',
                        'className': 'control',
                        'orderable': false,
                        'targets': 0
                      }
                  ],
                  'select': {
                      'style': 'multi',
                      'selector': 'td:not(.control)'
                  },
                  'order': [[9, 'desc']],
                  'retrieve': true,
                }
            var historyTable = $('#tweet_histry_dt').DataTable(datatable);
            vm.historyTable = historyTable;
            let elements= $("#tweet_histry_dt_wrapper").find(".hstry-header-toolbar");
            elements.prepend(`
              <button type="button" style="padding:.4em 1em;line-height: 1.3;" class="btn btn-info btn-sm-custom pull-right" ng-click="downloadTweets()" [iframe]="">
              <i class="fa fa-refresh fa-spin download-spinner"></i> <i class="fa fa-download" aria-hidden="true"></i>
              </button>
            `);
            $compile( elements.contents() )( $scope );
            
          }
          searchHistory(inputObject){ 
                var custom_keys = inputObject.custom_keys;
                var tweet_created_date = inputObject.tweet_created_date;
                var session_ids= (inputObject.session_ids)?inputObject.session_ids: undefined;
                $('#historyTable').show();
                $('#tweet_histry_dt').DataTable().destroy();
                if ( $.fn.dataTable.isDataTable( '#tweet_histry_dt' ) ) {
                  $('#tweet_histry_dt').DataTable().destroy();
                  this.loadDatatable(tweet_created_date, custom_keys, session_ids);
                }
                else {
                    this.loadDatatable(tweet_created_date, custom_keys, session_ids);
                }
                $("#tweet_histry_dt_filter").hide();
                $(".download-spinner").hide();
          }
      }
      const liveTwtsHstry = new LiveTweetsHistory();     
    
  }
}());



$(document).ready(function() {
  socket.on('disconnect', function() {
      $(location).attr('href', '/logout');
  });
  $('#historyTable').hide();
  $(function() {
      Example.init({
          "selector": ".bb-alert"
      });
  });
});

class TwtHstryBaseComponent {
    constructor() {
        var self = this;
    }
}
class LiveTweetsHistory extends TwtHstryBaseComponent{
    constructor(){
      super();
      // super.loadDateRangePicker()
    }
    updateTweetsActions(){
          var [self, flag, event, tweet_obj, classification] = arguments;
          var twts_act_obj = {
                actions: {},
                users: null
            }
          if(flag === 'ROL_MAP' && role_map_twt_dtls){
            twts_act_obj.tweet_id= role_map_twt_dtls.tweet_id
            twts_act_obj.tweet_id_str= role_map_twt_dtls.tweet_id_str
          }
          else{
            twts_act_obj.tweet_id= tweet_obj.tweet_id
            twts_act_obj.tweet_id_str= tweet_obj.tweet_id_str
          }
          switch (flag) {
            case 'IMP':
              twts_act_obj.actions.is_important = true;
              break;
            case 'CAT_IGN':
              twts_act_obj.actions.category = 'IGNORE';
              break;
            case 'CAT_FOL':
              twts_act_obj.actions.category = 'FOLLOWUP';
              break;
            case 'CAT_RES':
              twts_act_obj.actions.category = 'RESEARCH';
              break;
            case 'CLASSIFICATION':
            twts_act_obj.actions.classification = classification.field;
            break;
            case 'ROL_MAP':
              twts_act_obj.actions.users = live_twts_selected_usrs;
              break;
            default:
        }
        $.ajax({
              url: "/updateTwtsHstryActions",
              type:"POST",
              contentType: "application/json",
              dataType: 'json',
              data:JSON.stringify(twts_act_obj),
              success: function(result){
                var data = result;
                if(data.status ==="success"){
                  $('#tweet_histry_dt').DataTable().ajax.reload();
                  Example.show("Updated Successfully..");  
                }
              },
              error: function(err){
                var data = err;
              }
          })
    }
}
const liveTwtsHstry = new LiveTweetsHistory();

function subMenuToggle(element,e){
  $(".live_twt_dropdown_submenu").hide();
  mixin.subMenuDropDownToggle(element,e)
}
function get_twts_dtl_from_role_mapping(element){
role_map_twt_dtls = $('#tweet_histry_dt').DataTable().row( $(element).parentsUntil("tr").parent("tr") ).data();
}
function tweetActions(){
  let [self, flag, event, classification] = arguments;
  let tweet_obj = $('#tweet_histry_dt').DataTable().row( $(self).parentsUntil("tr").parent("tr") ).data();
  liveTwtsHstry.updateTweetsActions(...[self, flag, event, tweet_obj, classification]);
  var selection = '<img src="https://img.icons8.com/color/48/000000/ok.png" style="width: 25px;float: right;">';
  $(self).append(selection);
  $(self).addClass('selected_dropdown_option');
  // socket.emit('storeTwtsActions', twts_act_obj);
}
Example = (function() {
  "use strict";

  var elem,
      hideHandler,
      that = {};

  that.init = function(options) {
      elem = $(options.selector);
  };

  that.show = function(text, type) {
      clearTimeout(hideHandler);
      elem.removeClass("alert-danger alert-success alert-info alert-warning").addClass((type=="danger")?"alert-danger":(type=="success")?"alert-success":(type=="warning")?"alert-warning":"alert-info");
      elem.find("span").html(text);
      elem.delay(200).fadeIn().delay(10000).fadeOut();
  };

  return that;
}());