"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
const PaymentSuccesPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  useEffect(() => {
    const LSproducts = localStorage.getItem("products");

    if (LSproducts) {
      const parsedProducts = JSON.parse(LSproducts);
      if (!!parsedProducts.length && id) {
        const product = parsedProducts[id];
        if (product) {
          product.isPurchased = true;
          localStorage.setItem("products", JSON.stringify(parsedProducts));
          setIsSuccess(true);
        }
      }
    }
  }, []);

  if (!id) {
    return <h2>Id not found</h2>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      {isSuccess ? (
        <h1 className="text-green-500 text-3xl font-semibold">
          Payment Success
        </h1>
      ) : (
        <h1 className="text-red-500 text-3xl font-semibold">Payment Failed</h1>
      )}
    </div>
  );
};

export default PaymentSuccesPage;
