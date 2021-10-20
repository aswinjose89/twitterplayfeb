$( document ).ready(function() {
  initialize()
});

function initialize(){
  $.invokeAPI = {
    "saveAppSetup": function(query, setAttrValues){
      $.ajax({
          url: "/admin/getAppSetup?"+query,
          method: "GET",
          contentType: "application/json",
          dataType: 'json',
          success: function(result){
              if(result && result.status ==="success")
                setAttrValues(result.data);
              else
                console.log(result.msg);
          }
      })
      return false;
    }
  }
  $.appSetupFn = {
    "setAttrValues": function(data){
        let footer = $('[name=footer]');
        if(data.hasOwnProperty("footer")){
          footer.val(data.footer);
          footer.parent().addClass("focused");
        }
    }
  }
}

$('#footer_form').submit(function(event){
    event.preventDefault();
    $.invokeAPI.saveAppSetup($(this).serialize(), $.appSetupFn.setAttrValues);
});
