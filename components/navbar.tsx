"use client";

import React from "react";
import { ModeToggle } from "./mode-toggle";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  return (
    <div className="flex w-full  justify-between items-center">
      <div
        className="text-lg cursor-pointer"
        onClick={() => router.push("/")}
      >{`< Travis Ang />`}</div>
      <ModeToggle />
    </div>
  );
};

export default Navbar;
