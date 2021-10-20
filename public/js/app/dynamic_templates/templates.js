class BaseComponent {
    constructor() {
    }
}
class DynamicTemplates extends BaseComponent{
    influentialUsers(){
      var [index, user_account_url, profile_image_url_https, profile_banner_url, screen_name, followers_count, friends_count, last_refreshed, user_id, obj] = arguments
      var tweets_cloud_url =`/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${screen_name}&followers_count=${followers_count}&friends_count=${friends_count}&location=${obj.location}&statuses_count=${obj.statuses_count}&name=${obj.name}&language=${obj.language}&profile_image_url_https=${profile_image_url_https}`;
      var temp = `
      <div class="col-sm-4 col-md-2 ${(index > 11)?'hideInfluentialUsrCard':null}">
              <div class="panel panel-default panel-card">
                  <div class="panel-heading">
                      <img id="max_followers_img_banner_${index}" src="${profile_banner_url}" onerror="this.src='/static/img/avatars/avatar-profile_1280×1280.png'" style="height:100% !important" />
                      <div class="row">
                          <div class="col-md-12">
                              <div class="col-md-5">
                                  <a class="btn-twitter" id="max_followers_analysis_${index}" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" target="_blank" href="${tweets_cloud_url}">
                                      <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Analyze</span>
                                  </a>
                              </div>
                              <div class="col-md-2">
                              </div>
                              <div class="col-md-5">
                                  <a class="btn-twitter" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" onclick="SinglefollowOrUnfollowUser(this, event, ${user_id})">
                                      <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span>
                                  </a>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="panel-figure">
                      <img id="max_followers_img_${index}" class="img-responsive img-circle" src="${profile_image_url_https}" onerror="this.src='/static/img/avatars/avatar-profile_640×640.png'"/>
                  </div>
                  <div class="panel-body text-center">
                      <div class="panel-header"><a id="max_followers_a_${index}" href="${user_account_url}" target="_blank">@${screen_name}</a></div>
                      <label style="font-weight: bold;color: #1DA1F2;">Followers</label><small id="max_followers_fol_cnt_${index}" style="margin-left:6px">${followers_count}</small>
                  </div>
                  <div class="panel-thumbnails">
                      <div class="row">
                          <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                              <label style="font-weight: bold;">Last Refreshed At</label>
                              <span style="display:block;padding-top:3px" id="max_followers_lastref_${index}">${last_refreshed}</span>
                          </div>
                          <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                            <label style="font-weight: bold;">Following</label>
                            <span style="display:block;padding-top:3px" id="max_followers_fnd_cnt_${index}">${friends_count}</span>
                          </div>
                      </div>
                </div>
              </div>
          </div>
      `
      return temp
    }
    activeUsers(){
      var [index, user_account_url, profile_image_url_https, profile_banner_url, screen_name, followers_count, friends_count, last_refreshed, user_id, obj] = arguments
      var tweets_cloud_url =`/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${screen_name}&followers_count=${followers_count}&friends_count=${friends_count}&location=${obj.location}&statuses_count=${obj.statuses_count}&name=${obj.name}&language=${obj.language}&profile_image_url_https=${profile_image_url_https}`;
      var temp = `
      <div class="col-sm-4 col-md-2 ${(index > 11)?'hideActiveUsrCard':null}">
              <div class="panel panel-default panel-card">
                  <div class="panel-heading">
                      <img id="max_tweets_img_banner_${index}" src="${profile_banner_url}" onerror="this.src='/static/img/avatars/avatar-profile_1280×1280.png'" style="height:100% !important" />
                      <div class="row">
                          <div class="col-md-12">
                              <div class="col-md-5">
                                  <a class="btn-twitter" id="max_tweets_analysis_${index}" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" target="_blank" href="${tweets_cloud_url}">
                                      <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Analyze</span>
                                  </a>
                              </div>
                              <div class="col-md-2">
                              </div>
                              <div class="col-md-5">
                                <a class="btn-twitter" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" onclick="SinglefollowOrUnfollowUser(this, event, ${user_id})">
                                    <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span>
                                </a>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="panel-figure">
                      <img id="max_tweets_img_${index}" class="img-responsive img-circle" src="${profile_image_url_https}" onerror="this.src='/static/img/avatars/avatar-profile_640×640.png'" />
                  </div>
                  <div class="panel-body text-center">
                      <div class="panel-header"><a id="max_tweets_active_a_${index}" href="${user_account_url}" target="_blank">@${screen_name}</a></div>
                      <label style="font-weight: bold;color: #1DA1F2;">Followers</label><small id="max_tweets_fol_cnt_${index}" style="margin-left:6px">${followers_count}</small>
                  </div>
                  <div class="panel-thumbnails">
                      <div class="row">
                          <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                              <label style="font-weight: bold;">Last Refreshed At</label>
                              <span style="display:block;padding-top:3px" id="max_tweets_lastref_${index}">${last_refreshed}</span>
                          </div>
                          <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                            <label style="font-weight: bold;">Following</label>
                            <span style="display:block;padding-top:3px" id="max_tweets_fnd_cnt_${index}">${friends_count}</span>
                          </div>
                      </div>
                </div>
              </div>
          </div>
      `
      return temp
    }
    mostMentionedUsers(){
      var [index, user_account_url, profile_image_url_https, profile_banner_url, screen_name,followers_count, friends_count, last_refreshed, user_id, obj] = arguments
      var tweets_cloud_url =`/tweetsCloud?profile_banner_url=${profile_banner_url}&screen_name=${screen_name}&followers_count=${followers_count}&friends_count=${friends_count}&location=${obj.location}&statuses_count=${obj.statuses_count}&name=${obj.name}&language=${obj.language}&profile_image_url_https=${profile_image_url_https}`;
      var temp = `
        <div class="col-sm-4 col-md-2 ${(index > 11)?'hideUsrMentionCard':null}">
              <div class="panel panel-default panel-card">
                  <div class="panel-heading">
                      <img id="most_mentioned_img_banner_${index}" src="${profile_banner_url}" onerror="this.src='/static/img/avatars/avatar-profile_1280×1280.png'" style="height:100% !important" />
                      <div class="row">
                          <div class="col-md-12">
                              <div class="col-md-5">
                                  <a class="btn-twitter" id="most_mentioned_analysis_${index}" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" target="_blank" href="${tweets_cloud_url}">
                                      <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Analyze</span>
                                  </a>
                              </div>
                              <div class="col-md-2">
                              </div>
                              <div class="col-md-5">
                                <a class="btn-twitter" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" onclick="SinglefollowOrUnfollowUser(this, event, ${user_id})">
                                    <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span>
                                </a>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="panel-figure">
                      <img id="most_mentioned_img_${index}" class="img-responsive img-circle" src="${profile_image_url_https}" onerror="this.src='/static/img/avatars/avatar-profile_640×640.png'"/>
                  </div>
                  <div class="panel-body text-center">
                      <div class="panel-header"><a id="most_mentioned_a_${index}" href="${user_account_url}" target="_blank">${screen_name}</a></div>
                      <label style="font-weight: bold;color: #1DA1F2;">Followers</label><small id="most_mentioned_fol_cnt_${index}" style="margin-left:6px">${followers_count}</small>
                  </div>
                  <div class="panel-thumbnails">
                      <div class="row">
                          <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                              <label style="font-weight: bold;">Last Refreshed At</label>
                              <span style="display:block;padding-top:3px" id="most_mentioned_lastref_${index}">${last_refreshed}</span>
                          </div>
                          <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                            <label style="font-weight: bold;">Following</label>
                            <span style="display:block;padding-top:3px" id="most_mentioned_fnd_cnt_${index}">${friends_count}</span>
                          </div>
                      </div>
                </div>
              </div>
          </div>
      `
      return temp
    }
    tweet_cloud_cards(){
      var [tweet, hashName] = arguments;
      var temp =`
      <div class="twPc-div" style="height:100%;margin-bottom: 15px;box-shadow: 1px 0px 4px 3px #171719;">
          <a class="twPc-bg twPc-block" style="${(tweet.profile_banner_url)?'background-image: url('+tweet.profile_banner_url+'/600x200);':""}" >
          </a>
          <div>
            <div class="twPc-button">
                    <!-- Twitter Button | you can get from: https://about.twitter.com/tr/resources/buttons#follow -->
                    <a href="https://twitter.com/${tweet.screen_name}" class="twitter-follow-button" data-show-count="false" data-size="large" data-show-screen-name="false" data-dnt="true">Follow @${tweet.user.screen_name}</a>
                    <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
                    <!-- Twitter Button -->
            </div>

            <a title="${tweet.name}" href="https://twitter.com/${tweet.screen_name}" class="twPc-avatarLink" target="_blank">
              <img alt="${tweet.name}" src="${tweet.profile_image_url_https}" class="twPc-avatarImg">
            </a>

            <div class="twPc-divUser">
              <div class="twPc-divName">
                <a href="https://twitter.com/${tweet.screen_name}" target="_blank">${tweet.name}</a>
              </div>
              <span>
                <a href="https://twitter.com/${tweet.screen_name}" target="_blank" style="font-size: 14px;">@<span>${tweet.screen_name}</span></a>
              </span>
            </div>

              <div class="twPc-divStats">
                <ul class="twPc-Arrange">
                  <li class="twPc-ArrangeSizeFit">
                    <a target="_blank" href="https://twitter.com/${tweet.screen_name}" title="${tweet.statuses_count} Tweet">
                      <span class="twPc-StatLabel twPc-block">Tweets</span>
                      <span class="twPc-StatValue">${tweet.statuses_count}</span>
                    </a>
                  </li>
                  <li class="twPc-ArrangeSizeFit">
                    <a target="_blank" href="https://twitter.com/${tweet.screen_name}/following" title="${tweet.friends_count} Following">
                      <span class="twPc-StatLabel twPc-block">Following</span>
                      <span class="twPc-StatValue">${tweet.friends_count}</span>
                    </a>
                  </li>
                  <li class="twPc-ArrangeSizeFit">
                    <a href="https://twitter.com/${tweet.screen_name}/followers" title="${tweet.followers_count} Followers" target="_blank">
                      <span class="twPc-StatLabel twPc-block">Followers</span>
                      <span class="twPc-StatValue">${tweet.followers_count}</span>
                    </a>
                  </li>
                  <li class="twPc-ArrangeSizeFit">
                    <a href="https://twitter.com/intent/tweet?hashtags=${hashName.split('#').pop()}" title="${hashName}">
                      <span class="twPc-StatLabel twPc-block">HashTag</span>
                      <span class="twPc-StatValue">${hashName}</span>
                    </a>
                  </li>
                  <li class="twPc-ArrangeSizeFit">
                    <a href="#" title="${tweet.location}">
                      <span class="twPc-StatLabel twPc-block">Location</span>
                      <span class="twPc-StatValue" style="display:flex">
                            <img src="/static/images/location2.png" height="auto" width="auto">
                            <span class="twPc-StatValue" style="margin-left:4px">${(tweet.location)?tweet.location:"Not available"}</span>
                      </span>
                    </a>
                  </li>
                </ul>
              </div>
              <div style="padding:8px;background: #f0e8e8;;line-height: normal;border-top: 1px solid #ded9d9;border-radius: 0px 0px 6px 6px;">
                  <font color="#060606">${tweet.text}
                  </font>
                  <div class="row">
                      <script type="text/javascript" async src="https://platform.twitter.com/widgets.js"></script>
                      <div class="col-md-3 pull-right" style="left: 46px;">
                            <a class="btn-twitter" style="box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.75);" href="https://twitter.com/intent/tweet?in_reply_to=${tweet.twtIdstr}"><i class="fa fa-twitter fa_logo fa-lg"></i> Reply</a>
                            <a class="btn-twitter" style="box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.75);" href="https://twitter.com/intent/retweet?tweet_id=${tweet.twtIdstr}"><i class="fa fa-twitter fa_logo fa-lg"></i> Retweet</a>
                      </div>
                  </div>
              </div>
          </div>
          </div>
      `
      return temp;
    }

    tweet_profile_card(){
      var [tweet, name, type] = arguments;
      var custom_temp = '';
      if(type === 'HASHTAG'){
        custom_temp = `
            <a href="https://twitter.com/intent/tweet?hashtags=${name.split('#').pop()}" title="${name}">
              <span class="twPc-StatLabel twPc-block">HashTag</span>
              <span class="twPc-StatValue">${name}</span>
            </a>
        `
      }
      else if(type === 'KEYWORD'){
        custom_temp = `
            <a href="#" title="${name}">
              <span class="twPc-StatLabel twPc-block">KEYWORD</span>
              <span class="twPc-StatValue">${name}</span>
            </a>
        `
      }

      var temp =`
      <div class="row">
        <div class="twPc-div" style="height:100%;margin-bottom: 15px;box-shadow: -5px 4px 5px -2px rgba(0,0,0,0.61);">
            <a class="twPc-bg twPc-block" style="${(tweet.profile_banner_url)?'background-image: url('+tweet.profile_banner_url+'/600x200);':""}" >
            </a>
            <div>
              <div class="twPc-button">
                      <!-- Twitter Button | you can get from: https://about.twitter.com/tr/resources/buttons#follow -->
                      <a href="https://twitter.com/${tweet.screen_name}" class="twitter-follow-button" data-show-count="false" data-size="large" data-show-screen-name="false" data-dnt="true">Follow @${tweet.screen_name}</a>
                      <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
                      <!-- Twitter Button -->
              </div>

              <a title="${tweet.name}" href="https://twitter.com/${tweet.screen_name}" class="twPc-avatarLink" target="_blank">
                <img alt="${tweet.name}" src="${tweet.profile_image_url_https}" class="twPc-avatarImg">
              </a>

              <div class="twPc-divUser">
                <div class="twPc-divName">
                  <a href="https://twitter.com/${tweet.screen_name}" target="_blank">${tweet.name}</a>
                </div>
                <span>
                  <a href="https://twitter.com/${tweet.screen_name}" target="_blank" style="font-size: 14px;">@<span>${tweet.screen_name}</span></a>
                </span>
              </div>

                <div class="twPc-divStats">
                  <ul class="twPc-Arrange">
                    <li class="twPc-ArrangeSizeFit">
                      <a target="_blank" href="https://twitter.com/${tweet.screen_name}" title="${tweet.statuses_count} Tweet">
                        <span class="twPc-StatLabel twPc-block">Tweets</span>
                        <span class="twPc-StatValue">${tweet.statuses_count}</span>
                      </a>
                    </li>
                    <li class="twPc-ArrangeSizeFit">
                      <a target="_blank" href="https://twitter.com/${tweet.screen_name}/following" title="${tweet.friends_count} Following">
                        <span class="twPc-StatLabel twPc-block">Following</span>
                        <span class="twPc-StatValue">${tweet.friends_count}</span>
                      </a>
                    </li>
                    <li class="twPc-ArrangeSizeFit">
                      <a href="https://twitter.com/${tweet.screen_name}/followers" title="${tweet.followers_count} Followers" target="_blank">
                        <span class="twPc-StatLabel twPc-block">Followers</span>
                        <span class="twPc-StatValue">${tweet.followers_count}</span>
                      </a>
                    </li>
                    <li class="twPc-ArrangeSizeFit">
                      ${custom_temp}
                    </li>
                    <li class="twPc-ArrangeSizeFit">
                      <a href="#" title="${tweet.location}">
                        <span class="twPc-StatLabel twPc-block">Location</span>
                        <span class="twPc-StatValue" style="display:flex">
                              <img src="/static/images/location2.png" height="auto" width="auto">
                              <span class="twPc-StatValue" style="margin-left:4px">${(tweet.location)?tweet.location:"Not available"}</span>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
                <div style="padding:8px;background: #f0e8e8;;line-height: normal;border-top: 1px solid #ded9d9;border-radius: 0px 0px 6px 6px;">
                    <font color="#060606">${tweet.text}
                    </font>
                    <div class="row">
                        <script type="text/javascript" async src="https://platform.twitter.com/widgets.js"></script>
                        <div class="col-md-3 pull-right" style="left: 46px;">
                              <a class="btn-twitter" style="box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.75);" href="https://twitter.com/intent/tweet?in_reply_to=${tweet.twtIdstr}"><i class="fa fa-twitter fa_logo fa-lg"></i> Reply</a>
                              <a class="btn-twitter" style="box-shadow: 2px 2px 0px 0px rgba(0,0,0,0.75);" href="https://twitter.com/intent/retweet?tweet_id=${tweet.twtIdstr}"><i class="fa fa-twitter fa_logo fa-lg"></i> Retweet</a>
                        </div>
                    </div>
                </div>
            </div>
            </div>
          </div>
      `
      return temp;
    }

}
var dyTemplates = new DynamicTemplates();
