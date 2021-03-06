var products = [{name:'Playstation 4', price:1},
                 {name:'Playstation VR', price:1},
                 {name:'折價', price:-1}];
var total = 0;
products.forEach( function(element) {
  total += element.price;
} );

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }

  const supportedInstruments = [{
    supportedMethods: ['https://android.com/pay'],
    data: {
      merchantName: 'Rouslan Solomakhin',
      merchantId: '00184145120947117657',
      environment: 'TEST',
      allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
      paymentMethodTokenizationParameters: {
        tokenizationType: 'GATEWAY_TOKEN',
        parameters: {
          'gateway': 'stripe',
          'stripe:publishableKey': 'pk_live_lNk21zqKM2BENZENh3rzCUgo',
          'stripe:version': '2016-07-06',
        },
      },
    },
  }, {
    supportedMethods: ['basic-card'],
  }];

  var details = {
    total: {
      label: '總金額',
      amount: {
        currency: 'TWD',
        value: total,
      },
    },

    displayItems: [],

    shippingOptions: [{
      id: 'freeShippingOption',
      label: 'Free worldwide shipping',
      amount: {currency: 'TWD', value: '0.00'},
      selected: true
    }]
  };

  //設定要向用戶收取運費的電子郵件，地址和類型
  const options = {
    requestShipping: true,
    requestPayerEmail: false
  };

  //填訂單資料
  products.forEach(function(element){
    var dItem = {
      label: element.name,
      amount: {
        currency: 'TWD',
        value: element.price,
      },
    }
    details.displayItems.push(dItem)
  });
  

  let request = null;

  try {
    request = new PaymentRequest(supportedInstruments, details, options);
    if (request.canMakePayment) {
      request.canMakePayment().then(function(result) {
        info(result ? 'Can make payment' : 'Cannot make payment');
      }).catch(function(err) {
        error(err);
      });
    }
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
  }

  return request;
}

let request = buildPaymentRequest();

/**
 * Launches payment request that does not require shipping.
 */
function onBuyClicked() { // eslint-disable-line no-unused-vars
  if (!window.PaymentRequest || !request) {
    error('PaymentRequest API is not supported.');
    return;
  }

  try {
    request.show()
      .then(function(instrumentResponse) {
        window.setTimeout(function() {
          instrumentResponse.complete('success')
            .then(function() {
              done('This is a demo website. No payment will be processed.',
                instrumentResponse);
            })
            .catch(function(err) {
              error(err);
              request = buildPaymentRequest();
            });
        }, 2000);
      })
      .catch(function(err) {
        error(err);
        request = buildPaymentRequest();
      });
  } catch (e) {
    error('Developer mistake: \'' + e + '\'');
    request = buildPaymentRequest();
  }
}