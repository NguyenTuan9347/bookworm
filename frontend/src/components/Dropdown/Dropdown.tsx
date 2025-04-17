import { DropdownProps } from "@/shared/interfaces";
import { useState } from "react";

const Dropdown = ({ trigger, menu }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className="absolute z-10 mt-2 bg-white border rounded shadow-md min-w-[150px]"
          onMouseLeave={() => setIsOpen(false)}
        >
          {menu}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
