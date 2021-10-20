let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine,{'force new connection': true});
var role_map_twt_dtls = null, live_twts_selected_usrs = null;
var tweets_classifications= (sessionStorage.mongoFieldData)? JSON.parse(sessionStorage.mongoFieldData).tweets_classifications: null;    

/* AngularJS Starts Here */
(function () {
  var app = angular.module("auditLogs", ['ngMaterial', 'ngMessages']);
  app.controller("auditLogController",auditLogController)

  function auditLogController($compile, $scope){
    var vm = this;  
    vm.createdDateRange ={}; 
    vm.sessionDateRange ={}; 
    vm.isDateWiseKeywords= false;
    vm.isSessionWiseKeywords= false;
    vm.searchObject= null;

   


    $("#loading-indicator").hide();
    socket.on('disconnect', function() {
        $(location).attr('href', '/logout');
    });
    class AuditLogBaseComponent {
        constructor() {
            var self = this;
        }
        renderColumns(){
            var columns = [
                { 'data': null },   
                { "data": "username", "className": "text-center" },               
                { "data": "total_tweets", "className": "text-center" },
                { "data": "session_id", "className": "text-center" },
                { "data": "logoutStatus", "className": "text-center" },
                { "data": "logoutAt", "className": "text-center" },
                { "data": "createdAt", "className": "text-center" },
                { "data": "updatedAt", "className": "text-center" }
            ]
            return columns;
        }
    }
    class AuditLogDetails extends AuditLogBaseComponent{
        constructor(){
        super();
        }
        loadDatatable(){
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
                        "url": 'audit_logs_data',
                        "type": "GET",
                        "contentType": "application/json; charset=utf-8",
                        "datatype": "json",
                        "data": {
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
                'order': [[1, 'desc']],
                'retrieve': true,
            }
            var auditTable = $('#audit_logs_dt').DataTable(datatable);
        
        }
        getAuditDetails(){ 
            $('#audit_logs_dt').DataTable().destroy();
            if ( $.fn.dataTable.isDataTable( '#audit_logs_dt' ) ) {
                $('#audit_logs_dt').DataTable().destroy();
                this.loadDatatable();                  
            }
            else {
                this.loadDatatable();
            }
            $("#audit_logs_dt_filter").hide();
        }
    }
    const auditLog = new AuditLogDetails();     

    vm.loadAuditDetails= function(element){
        auditLog.getAuditDetails();
    }
    vm.loadAuditDetails()
    
  }
}());



$(document).ready(function() {
  socket.on('disconnect', function() {
      $(location).attr('href', '/logout');
  });
  $(function() {
      Example.init({
          "selector": ".bb-alert"
      });
  });
});

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