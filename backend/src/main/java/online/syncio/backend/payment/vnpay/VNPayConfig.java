package online.syncio.backend.payment.vnpay;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.text.SimpleDateFormat;
import java.util.*;

@Configuration
public class VNPayConfig {

    @Value("${url.backend}")
    private String urlBackend;

    @Getter
    public String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public String vnp_ReturnUrl = urlBackend + "api/v1/payment/vnpay-callback";

    public String vnp_TmnCode = "FT91TB2X";
    @Getter
    public String secretKey = "MF98URJP1EVWBE9PHV96QFLLRW16KQ2M";
    public String vnp_ApiUrl = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
    public String vnp_Version = "2.1.0";
    public String vnp_Command = "pay";
    public String orderType = "other";

    @PostConstruct
    public void init() {
        this.vnp_ReturnUrl = urlBackend + "api/v1/payment/vnpay-callback";
    }

    public Map<String, String> getVNPayConfig() {
        System.out.println("vnp_ReturnUrl: " + this.vnp_ReturnUrl);
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", this.vnp_Version);
        vnp_Params.put("vnp_Command", this.vnp_Command);
        vnp_Params.put("vnp_TmnCode", this.vnp_TmnCode);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef",  VNPayUtil.getRandomNumber(8));
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" +  VNPayUtil.getRandomNumber(8));
        vnp_Params.put("vnp_OrderType", this.orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", this.vnp_ReturnUrl);
        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnpCreateDate = formatter.format(calendar.getTime());
        vnp_Params.put("vnp_CreateDate", vnpCreateDate);
        calendar.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(calendar.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        return vnp_Params;
    }


}
