"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";

const InitiatePayment = () => {
  const searchParams = useSearchParams();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const initiatePayment = async () => {
      const amount = searchParams.get("amount");
      const packageName = searchParams.get("packageName");
      const totalAmount = searchParams.get("totalAmount");

      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          totalAmount,
          email: user.email,
          phone: user.mobileNumber,
          name: user.fullname,
          userId: user._id,
          packageName,
          productInfo: `${packageName}`,
        }),
      });
      
      const data = await response.json();
      console.log("Payment Initiate Response:", data);

      if (data?.action) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.action;

        for (const key in data.params) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = data.params[key];
          form.appendChild(input);
        }

        console.log("Form Data Sent to PayU:", data.params);
        document.body.appendChild(form);
        form.submit();
      }
    };

    if (user) initiatePayment();
  }, [user, searchParams]);

  return <div>Redirecting to payment...</div>;
};

export default InitiatePayment;
