"use strict"

let node_machine = appSettings['appConfig']['node_machine'];
let protocol = appSettings['appConfig']['protocol'];
var socket = io.connect(protocol + '://'+ node_machine,{'force new connection': true});
class Pricing {
    constructor() {
    }
    proceedBasicPricing(){
      let [e] =  arguments
      e.preventDefault
      socket.emit("validateBasicLicense","No Data")
    }
    proceedEnterprisePricing(){
      let [e] =  arguments
      e.preventDefault
      socket.emit("validateEnterpriseLicense","No Data")
    }
}



var pricingObj = new Pricing();
function proceedBasicPricing(){
  pricingObj.proceedBasicPricing(arguments)
}
function proceedEnterprisePricing(){
  pricingObj.proceedEnterprisePricing(arguments)
}


/*All Socket Listening Starts*/
socket.on('redirectToProfile',function(){
    window.location.href="/profile";
});
