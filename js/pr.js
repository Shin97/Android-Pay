var products = [{name:'Playstation 4', price:12900},
                 {name:'Playstation VR', price:9900},
                 {name:'折價$1000', price:-1000}];
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
    modifiers: [{
      supportedMethods: ['basic-card'],
      data: {
        supportedTypes: ['debit'],
      },
      total: {
        label: 'Debit card discounted donation',
        amount: {
          currency: 'TWD',
          value: '45.00',
        },
      },
      additionalDisplayItems: [{
        label: 'Debit card discount',
        amount: {
          currency: 'TWD',
          value: '-10.00',
        },
      }],
    }, {
      supportedMethods: ['basic-card'],
      data: {
        supportedNetworks: ['mastercard'],
      },
      total: {
        label: 'MasterCard discounted donation',
        amount: {
          currency: 'TWD',
          value: '50.00',
        },
      },
      additionalDisplayItems: [{
        label: 'MasterCard discount',
        amount: {
          currency: 'TWD',
          value: '-5.00',
        },
      }],
    }],
  };

  //設定要向用戶收取運費的電子郵件，地址和類型
  const options = {
    requestShipping: true,
    requestPayerEmail: true
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
//根據用戶所在的地區配置貨運類型
request.addEventListener('shippingaddresschange', function(evt) {
  evt.updateWith(new Promise(function(resolve) {

    const shippingOption = {
      id: '',
      label: '',
      amount: {currency: 'TWD', value: '0'},
      selected: true
    };

    if (request.shippingAddress.country === '桃園市') {
      shippingOption.id = 'mg';
      shippingOption.label = '免運費';
      details.total.amount.value = '1';
    } else {
      shippingOption.id = 'world';
      shippingOption.label = '快遞';
      shippingOption.amount.value = '5';
      details.total.amount.value = '6';
    }

    details.displayItems.splice(2, 1, shippingOption);
    details.shippingOptions = [shippingOption];

    resolve(details);
  }));
});

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