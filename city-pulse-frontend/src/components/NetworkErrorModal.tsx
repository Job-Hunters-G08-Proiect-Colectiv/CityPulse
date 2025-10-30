import React from "react";
import "./NetworkErrorModal.css";

interface Props {
  open: boolean;
  onRetry: () => void;
}

const NetworkErrorModal: React.FC<Props> = ({ open, onRetry }) => {
  if (!open) return null;
  return (
    <div className="network-error-modal">
      <div className="modal-content">
        <h2>Connection Error</h2>
        <p>Cannot connect to the server. Please check your internet connection.</p>
        <button 
          className="retry-button"
          onClick={onRetry}
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default NetworkErrorModal;