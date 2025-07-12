"use client";

import CheckoutForm from "@/components/CheckoutForm";
import { CheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

// Define product type
interface Product {
  name: string;
  price: number;
  isPurchased: boolean;
}

const CheckoutPage: React.FC = () => {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY;

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({
    name: "",
    price: 0,
    isPurchased: false,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Optional: you can safely enable Stripe loading here if needed
  // const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

  const createCheckoutSession = async (
    productName: string,
    price: number,
    id:number,
  ): Promise<string | undefined> => {
    try {
      const res = await axios.post<{ redirectUrl: string }>("/api/stripe", {
        productName,
        price,
        id
      });
      console.log(res.data);
      return res.data.redirectUrl;
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    if (editIndex !== null) {
      const updated = [...products];
      updated[editIndex] = form;
      setProducts(updated);
      setEditIndex(null);
    } else {
      setProducts([...products, form]);
    }

    setForm({ name: "", price: 0, isPurchased: false });
  };

  const handleEdit = (index: number) => {
    setForm(products[index]);
    setEditIndex(index);
  };

  const handleDelete = (index: number) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const handleBuy = async (index: number) => {
    const { name, price } = products[index];
    const url = await createCheckoutSession(name, price, index);
    if(url) window.open(url);
  };

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts)) {
          setProducts(parsedProducts);
        }
      } catch (error) {
        console.error("Error parsing products from localStorage", error);
      }
    }
  }, []);

  // Save products to localStorage whenever products state changes
  useEffect(() => {
    if (products.length > 0) {
      try {
        localStorage.setItem("products", JSON.stringify(products));
      } catch (error) {
        console.error("Error saving products to localStorage", error);
      }
    }
  }, [products]);

  return (
    <div>
      <h2 className="text-center text-2xl mt-3 font-medium">
        Products Checkout Page
      </h2>
      <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editIndex !== null ? "Edit" : "Add"} Product
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {editIndex !== null ? "Update" : "Add"} Product
          </button>
        </form>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Product List</h3>
          {products.length === 0 ? (
            <p className="text-gray-500">No products added yet.</p>
          ) : (
            <ul className="space-y-2">
              {products.map((product, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded border"
                >
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    {product.isPurchased ? (
                      <button className="text-cyan-600 hover:underline">
                        Purchased
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(index)}
                        className="text-cyan-600 hover:underline"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
