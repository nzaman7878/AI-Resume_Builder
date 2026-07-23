"use client";

import axios from "axios";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/auth/login");
      router.refresh(); // Refresh to update server components like Header
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900 font-medium"
    >
      Logout
    </button>
  );
}
