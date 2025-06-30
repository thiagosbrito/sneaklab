import React from "react";

const AddToBagButton = () => {
    return (
        <button className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full hover:bg-gray-800 transition">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                className="w-6 h-6"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    );
};

export default AddToBagButton;
