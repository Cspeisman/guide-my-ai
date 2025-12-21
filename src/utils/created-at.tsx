import React from "react";

interface CreatedAtProps {
  date: Date | string;
  className?: string;
}

export const CreatedAt: React.FC<CreatedAtProps> = ({
  date,
  className = "",
}) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return (
    <div className={`text-[10px] text-gray-400 font-mono ${className}`}>
      created: {dateObj.toLocaleDateString()}
    </div>
  );
};
