import { Plus } from 'lucide-react';
import './NewReportButton.css';

interface NewReportButtonProps {
  onClick: () => void;
  isListOpen?: boolean;
}

const NewReportButton = ({ onClick, isListOpen = false }: NewReportButtonProps) => {
  return (
    <button 
      className={`new-report-fab ${isListOpen ? 'hidden-mobile' : ''}`}
      onClick={onClick} 
      aria-label="Create new report"
    >
      <Plus size={24} />
    </button>
  );
};

export default NewReportButton;