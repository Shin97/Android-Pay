<?php
$notLogin = 1;
include_once('config.inc.php');
$OrderMf = new OrderMf($web_lang); //訂單主檔

//$paymentToken       = $_POST["Token"];

$paymentToken  = "Test Token";
$file = fopen("../../test.txt","w");
echo fwrite($file, $paymentToken);
fclose($file);
