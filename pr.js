var products = ['Playstation 4', 'Palystation VR', '折價-1000'];
var prices = [12900,9900,-1000];
var total = 0;
price.forEach( function(element) {
  total += element;
} );

document.querySelector('#checkout').addEventListener('click', () =>{
  if (!window.PaymentRequest) {

    const msg = '此瀏覽器不支援Payment Request API!';
    document.querySelector('#feedback').innerHTML = msg;
    console.log(msg);
    return;
  }

  //支援付款方式
  const supportedInstruments = [{
      supportedMethods: ['visa', 'mastercard', 'amex', 'discover','diners', 'jcb', 'unionpay']
  },{
    //整合Android Pay
    supportedMethods: ['https://android.com/pay'],
    data: {
      //要在https://androidpay.developers.google.com/signup申請merchantId
      merchantId: '02510116604241796260',
      environment: 'TEST',
      //Android Pay接受的信用卡種類
      allowedCardNetworks: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
      paymentMethodTokenizationParameters: {
        tokenizationType: 'GATEWAY_TOKEN',
        parameters: {
          'gateway': 'stripe',
          //公用key
          'stripe:publishableKey': 'pk_live_fD7ggZCtrB0vJNApRX5TyJ9T',
          'stripe:version': '2016-07-06'
        }
      }
    }
  }];

  //結帳細節
  const details = {
    displayItems: [{
      label: products[0],
      amount: { currency: 'TWD', value: prices[0] }
    }, {
      label: products[1],
      amount: { currency: 'TWD', value: prices[1] }
    }],
    total: {
      label: '總金額',
      amount: { currency: 'TWD', value : total }
    }
  };

  //設定要向用戶收取運費的電子郵件，地址和類型
  const options = {
    requestShipping: true,
    requestPayerEmail: true
  };

  //使用之前收集的交易設定
  //建立一個PaymentRequest
  const request = new PaymentRequest(supportedInstruments, details, options);

  //根據用戶所在的地區配置貨運類型
  request.addEventListener('shippingaddresschange', function(evt) {
    evt.updateWith(new Promise(function(resolve) {

      const shippingOption = {
        id: '',
        label: '',
        amount: {currency: 'TWD', value: '0'},
        selected: true
      };

      if (request.shippingAddress.region === '桃園市') {
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

  //免運費最後通過show()方法顯示原生界面
  request.show()
  .then(result => {
    //Demo: 將數據提交給伺服器
    return fetch('/pay', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result.toJSON())
    }).then(response => {
      //查看付款狀態
      if (response.status === 200) {
        //付款成功
        return result.complete('success');
      } else {
        //付款失敗
        return result.complete('fail');
      }
    }).catch(() => {
      return result.complete('fail');
    });
  });
});
