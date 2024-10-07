import React, { useState, useEffect } from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
  const [showModal, setShowModal] = useState(false);

  // Trigger the animation on mount
  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div
        className={`bg-white rounded-xl shadow-2xl w-11/12 md:w-3/4 lg:w-2/3 max-h-screen overflow-y-auto transform transition-all duration-300 ${
          showModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="p-4 flex justify-end border-b">
          <button
            onClick={() => {
              // Trigger the closing animation
              setShowModal(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-600 hover:text-gray-800 text-3xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
