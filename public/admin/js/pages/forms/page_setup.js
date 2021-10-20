$( document ).ready(function() {
  initialize()
});

function initialize(){
  $.invokeAPI = {
    "savePageSetup": function(query, setAttrValues){
      $.ajax({
          url: "/admin/getPageSetup?"+query,
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
  $.pageSetupFn = {
    "setAttrValues": function(data){
        let footer = $('[name=footer]');
        if(data.hasOwnProperty("footer")){
          footer.val(data.footer);
          footer.parent().addClass("focused");
        }

    }
  }
  $.invokeAPI.savePageSetup($(this).serialize(), $.pageSetupFn.setAttrValues);
}

$('#footer_form').submit(function(event){
    event.preventDefault();
    $.invokeAPI.savePageSetup($(this).serialize(), $.pageSetupFn.setAttrValues);
});
// var span_field = ".spn_data"
//     var btn_edit = "#footerEdit"
//     var btn_save = "#btnsave"
// $(#footerEdit).click(function(){
//     $(span_field).each(function(){
//         $(this).replaceWith("<input type='text' value='" + $(this).html() + "' class='spn_data' />");
//     });
// });
//
// $(btn_save).click(function(){
//     $(span_field).each(function(){
//         $(this).replaceWith("<span  class='spn_data'>" + $(this).val() + "'</span>");
//     });
//     // do save
// });
