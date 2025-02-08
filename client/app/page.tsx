"use client";
import { useEffect } from "react";
import LandingPage from "./components/LandingPage";

export default function Home() {
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/apr");

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      console.log("Protocol data:", JSON.stringify(data, null, 2));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  return (
    <div>
      <LandingPage />
    </div>
  );
}
