'use client';

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [txnid, setTxnid] = useState(null);
  const [amount, setAmount] = useState(null);
  const [packageName, setPackageName] = useState(null);

  useEffect(() => {
    const txnidParam = searchParams.get("txnid");
    const amountParam = searchParams.get("amount");
    const packageParam = searchParams.get("package");

    setTxnid(txnidParam);
    setAmount(amountParam);
    setPackageName(packageParam);

    // Redirect to homepage after 5 seconds
    const timer = setTimeout(() => {
      router.push("/");
    }, 20000);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  if (!txnid || !amount || !packageName) {
    return <p className="text-red-600 text-center mt-10">Loading payment information...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center pt-5 pb-5 bg-green-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Payment Successful!</h1>
        <p className="text-gray-700 mb-2">Thank you for your payment.</p>
        <p className="text-gray-600">Transaction ID:</p>
        <p className="font-mono bg-gray-100 rounded px-3 py-1 mt-1 mb-4">{txnid}</p>
        <p className="text-lg font-semibold text-green-700">₹{amount} paid for {packageName}</p>

        <div className="mt-6 text-sm text-gray-600">
          To check your payment details,{" "}
          <Link href="/userdashboard" className="text-blue-600 hover:underline">
            go to Dashboard
          </Link>.
          <br />
          If you face any issue,  logout
          and login again. For help, visit our{" "}
          <Link href="/contact-us" className="text-blue-600 hover:underline">
            Help Center
          </Link>.
        </div>
      </div>
    </div>
  );
}
