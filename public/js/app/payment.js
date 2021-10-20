$('.input-cart-number').on('keyup change', function(){
  let $t = $(this);

  if ($t.val().length > 3) {
    $t.next().focus();
  }

  var card_number = '';
  $('.input-cart-number').each(function(){
    card_number += $(this).val() + ' ';
    if ($(this).val().length == 4) {
      $(this).next().focus();
    }
  })

  $('.credit-card-box .number').html(card_number);
});

$('#card-holder').on('keyup change', function(){
  let $t = $(this);
  $('.credit-card-box .card-holder div').html($t.val());
});

$('#card-holder').on('keyup change', function(){
  let $t = $(this);
  $('.credit-card-box .card-holder div').html($t.val());
});

$('#card-expiration-month, #card-expiration-year').change(function(){
  let m = $('#card-expiration-month option').index($('#card-expiration-month option:selected'));
  let m = (m < 10) ? '0' + m : m;
  let y = $('#card-expiration-year').val().substr(2,2);
  $('.card-expiration-date div').html(m + '/' + y);
})

$('#card-ccv').on('focus', function(){
  $('.credit-card-box').addClass('hover');
}).on('blur', function(){
  $('.credit-card-box').removeClass('hover');
}).on('keyup change', function(){
  $('.ccv div').html($(this).val());
});

/*function getCreditCardType(accountNumber) {
  if (/^5[1-5]/.test(accountNumber)) {
    result = 'mastercard';
  } else if (/^4/.test(accountNumber)) {
    result = 'visa';
  } else if ( /^(5018|5020|5038|6304|6759|676[1-3])/.test(accountNumber)) {
    result = 'maestro';
  } else {
    result = 'unknown'
  }
  return result;
}

$('#card-number').change(function(){
  console.log(getCreditCardType($(this).val()));
})*/



// Create and initialize a payment form object
const paymentForm = new SqPaymentForm({
 // Initialize the payment form elements

 //TODO: Replace with your sandbox application ID
 applicationId: "sandbox-sq0idb-TIowVbX4u3Jo-GHu5RohoQ",
 locationId:"ZENSPQYB2PKEG",
 inputClass: 'sq-input',
 autoBuild: false,
 // Customize the CSS for SqPaymentForm iframe elements
 inputStyles: [{
     fontSize: '16px',
     lineHeight: '24px',
     padding: '16px',
     placeholderColor: '#a0a0a0',
     backgroundColor: 'transparent',
 }],
 // Initialize the credit card placeholders
 cardNumber: {
     elementId: 'sq-card-number',
     placeholder: 'Card Number'
 },
 cvv: {
     elementId: 'sq-cvv',
     placeholder: 'CVV'
 },
 expirationDate: {
     elementId: 'sq-expiration-date',
     placeholder: 'MM/YY'
 },
 postalCode: {
     elementId: 'sq-postal-code',
     placeholder: 'Postal'
 },
 // SqPaymentForm callback functions
 callbacks: {
     /*
     * callback function: cardNonceResponseReceived
     * Triggered when: SqPaymentForm completes a card nonce request
     */
     cardNonceResponseReceived: function (errors, nonce, cardData) {
       $('#error-grouper').empty()
     if (errors) {
         // Log errors from nonce generation to the browser developer console.
         errors.forEach(function (error) {
             $('#error-grouper').append(`<li>${error.message}</li>`)
         });
         return;
     }
              // alert(`The generated nonce is:\n${nonce}`);
          fetch('process-payment', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              nonce: nonce
            })
          })
          .catch(err => {
            $('#error-grouper').append(`<li>Network error: ${err}</li>`)
          })
          .then(response => {
            if (!response.ok) {
              return response.text().then(errorInfo => Promise.reject(errorInfo));
            }
            return response.text();
          })
          .then(data => {
            var inputObj = {
                "data": data,
                "cardData": cardData,
                "transactionStatus": "success"
            }
            $.ajax({
                   url: "/savePaymentDetails",
                   type:"POST",
                   contentType: "application/json",
                   dataType: 'json',
                   data: JSON.stringify(inputObj),
                   success: function(result){
                     var data = result;
                     if(data.status ==="success"){
                       // console.log(JSON.stringify(data));
                       window.location.href = `/paymentResult?card_brand=${data.result.card_brand}&card_last_4_digit=${data.result.card_last_4_digit}`;
                     }
                   },
                   error: function(err){
                     var data = err;
                   }
               });
            // alert('Payment complete successfully!\nCheck browser developer consolf form more details');
          })
          .catch(err => {
            var inputObj = {
                "data": err,
                "cardData": cardData,
                "transactionStatus": "failed"
            }
            $.ajax({
                   url: "/savePaymentDetails",
                   type:"POST",
                   contentType: "application/json",
                   dataType: 'json',
                   data: JSON.stringify(inputObj),
                   success: function(result){
                     var data = result;
                   },
                   error: function(err){
                     var data = err;
                   }
               });
            // console.error(err);
            $('#error-grouper').append(`<li>Payment failed to complete!</li>`)
            // alert('Payment failed to complete!\nCheck browser developer consolf form more details');
          });


        //TODO: Replace alert with code in step 2.1
     }
 }
});
//TODO: paste code from step 1.2.4
    //TODO: paste code from step 1.2.5
// onGetCardNonce is triggered when the "Pay $1.00" button is clicked
function onGetCardNonce(event) {
 // Don't submit the form until SqPaymentForm returns with a nonce
 event.preventDefault();
 // Request a nonce from the SqPaymentForm object
 paymentForm.requestCardNonce();
}
    paymentForm.build();
