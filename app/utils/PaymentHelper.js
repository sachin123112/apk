
import CommonService from "../services/CommonService";
import { getObjectData } from "../sharedComp/AsyncData";
import { SiteConstants } from "../SiteConstants";


export const verifyCashfreePayment = async (navigation, orderID, chitDetailsParam = null) => {
  try {
    const chitDetails = chitDetailsParam || (await getObjectData("chitPaymentDetails"));
    if (!chitDetails) throw new Error("Missing chit details");

    const statusBody = {
      chitId: chitDetails?.achitId || null,
      orderId: orderID,
      paymentGateway: "cashfree",
      paymentGatewayRefId: chitDetails?.CFOrderId || null,
      memberId: chitDetails?.memberId || null,
      subscriberId: chitDetails?.subscriberId || null,
      ticketNumber: chitDetails?.ticketNumber || null,
    };

    console.log("[verifyCashfreePayment] Payload:", statusBody);

    const myChitUrl = `${SiteConstants.API_URL}payment/v2/getOrderStatusForPayment`;
    const newChitUrl = `${SiteConstants.API_URL}payment/v2/getOrderStatus`;
    const url = chitDetails?.myChit ? myChitUrl : newChitUrl;

    console.log("[verifyCashfreePayment] URL:", url);

    const data = await CommonService.commonPostOld(navigation, url, statusBody);

    console.log("[verifyCashfreePayment] Backend Response:", data);


    return {
      success: data?.orderStatus === "PAID",
      data,
    };
  } catch (error) {
    console.error("❌ [verifyCashfreePayment] Error:", error);
    return { success: false, error };
  }
};
