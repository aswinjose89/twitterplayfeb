(function(){
    var dir= angular.module("twitter.directives",[]);
    dir.directive("profileCard", fnProfileCard);
    function fnProfileCard(){
        let template= `
        <span>
        <div ng-repeat="data in allProfileData track by $index" class="col-sm-4 col-md-2">
        <div class="panel panel-default panel-card">
            <div class="panel-heading">
                <img id="max_followers_img_banner_{{$index}}" src="{{data.profile_banner_url}}" style="height:100% !important" />
                <div class="row">
                    <div class="col-md-12">
                        <div class="col-md-5">
                            <a class="btn-twitter" id="max_followers_analysis_{{$index}}" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" target="_blank" href="{{data.tweets_cloud_url}}">
                                <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Analyze</span>
                            </a>
                        </div>
                        <div class="col-md-2">
                        </div>
                        <div class="col-md-5">
                            <a class="btn-twitter" style="position:absolute;box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.75);right:0px" ng-click="fnUserFollowUp($event, data.user_id)">
                                <i class="fa fa-twitter fa_logo fa-lg"></i> <span>Follow</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel-figure">
                <img id="max_followers_img_{{$index}}" class="img-responsive img-circle" ng-src="{{data.profile_image_url_https}}" />
            </div>
            <div class="panel-body text-center">
                <div class="panel-header"><a id="max_followers_a_{{$index}}" href="https://twitter.com/{{data.screen_name}}" target="_blank">@{{data.screen_name}}</a></div>
                <label style="font-weight: bold;color: #1DA1F2;">Followers</label><small id="max_followers_fol_cnt_{{$index}}" style="margin-left:6px">{{data.followers_count}}</small>
            </div>
            <div class="panel-thumbnails">
                <div class="row">
                    <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                        <label style="font-weight: bold;">Last Refreshed At</label>
                        <span style="display:block;padding-top:3px" id="max_followers_lastref_{{$index}}">{{data.last_refreshed}}</span>
                    </div>
                    <div class="col-xs-6 text-center" style="color: #1DA1F2;">
                    <label style="font-weight: bold;">Following</label>
                    <span style="display:block;padding-top:3px" id="max_followers_fnd_cnt_{{$index}}">{{data.friends_count}}</span>
                    </div>
                </div>
        </div>
        </div>
    </div>
        </span>
        `;
        let directive= {
            restrict: 'E',
            scope: {
                profileData: "=",
                userFollowUp: "&"
            },
            template: template,
            link: function(scope, elm, attrs, ctrl){
                scope.profileData.forEach((data)=>{
                    data.tweets_cloud_url= `/tweetsCloud?profile_banner_url=${data.profile_banner_url}&screen_name=${data.screen_name}&followers_count=${data.followers_count}&friends_count=${data.friends_count}&location=${data.location}&statuses_count=${data.statuses_count}&name=${data.name}&language=${data.language}&profile_image_url_https=${data.profile_image_url_https}`;
                });
                scope.allProfileData= scope.profileData;

                scope.fnUserFollowUp= function(evt, user_id) {
                    evt.preventDefault()
                    bootbox.confirm("Excessive use of Follow/Unfollow options may result in your account getting blocked by Twitter. Do you want to continue?", function(confirmation) {
                        if (confirmation) {
                            let data= {
                                evt,
                                user_id
                            };
                            scope.userFollowUp({data});
                        } else {
            
                        }
                    });
                }
                

            }
        };
        return directive;
    }
}())