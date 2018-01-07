<?php
/**
 * Android Pay 銀行端串接
 * 先解密PaymentData
 * 工廠模式
 */


 /**
 * Interface bank
 */
interface Bank {
    public function androidPay($paymentData);
}

/**
 * 台新 
 * 交換格式:json
 * 交易金額包含兩位小數,如 100 代表 1 元
 */
class TaishinBank implements Bank {

    public function androidPay($paymentData){

    }

}

/**
 * 國泰
 */
class CathayBank implements Bank {

    public function androidPay($paymentData){

    }

}