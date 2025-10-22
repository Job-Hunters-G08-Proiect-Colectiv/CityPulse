import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
  onClose: () => void;
  onFilterClick: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  showFilters: boolean;
  isOpen: boolean;
}

const SearchBar = ({ 
  onClose,
  onFilterClick, 
  searchTerm, 
  onSearchChange,
  showFilters,
  isOpen
}: SearchBarProps) => {
  return (
    <>
      {!isOpen && (
        <div className="app-branding">
          <MapPin size={20} className="brand-icon" />
          <span className="brand-name">CityPulse</span>
        </div>
      )}
      <div className={`search-bar-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}>
        <div className="search-bar-content">
          <span className="search-icon-wrapper">
            <Search size={isOpen ? 18 : 20} />
          </span>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {isOpen && (
            <>
              <button 
                className={`icon-button filter-button ${showFilters ? 'active' : ''}`} 
                onClick={onFilterClick}
                aria-label="Toggle filters"
                title="Toggle filters"
              >
                <SlidersHorizontal size={18} />
              </button>
              <button 
                className="icon-button close-button" 
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                <X size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBar;