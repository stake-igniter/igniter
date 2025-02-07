"use client";

import { redirect } from "next/navigation";

export default function BootstrapButton() {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={() => redirect("/admin/bootstrap")}
    >
      Get Started
    </button>
  );
}
