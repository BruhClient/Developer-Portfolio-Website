import { Check } from "lucide-react";
import React from "react";

const CheckText = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-green-400 w-fit p-1 rounded-full">
        <Check size={18} color="black" />
      </div>
      <div>{text}</div>
    </div>
  );
};

export default CheckText;
