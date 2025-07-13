"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchWithAuth } from "@/utils/auth";
import { useAxios } from "@/axios/axoisInstance";

const Dashboard = () => {
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const axios = useAxios()
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await axios("/api/users");
        setUserData(data.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {userData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Data</h2>
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
              {JSON.stringify(userData)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
