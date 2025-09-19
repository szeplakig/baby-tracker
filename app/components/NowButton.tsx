import React from "react";

interface NowButtonProps {
  onClick: () => void;
}

const NowButton: React.FC<NowButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-2 rounded bg-blue-500 px-2 py-1 text-sm text-white"
    >
      Most
    </button>
  );
};

export default NowButton;
