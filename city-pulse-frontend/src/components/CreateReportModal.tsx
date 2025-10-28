import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Report, ReportCategory, SeverityLevel } from '../types/report';
import './CreateReportModal.css';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Report, 'id' | 'date' | 'status' | 'upvotes'>) => void;
}

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

const CreateReportModal = ({ isOpen, onClose, onSubmit }: CreateReportModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    location: { lat: 0, lng: 0 },
    address: '',
    category: 'OTHER' as ReportCategory,
    severityLevel: 'LOW' as SeverityLevel,
    description: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResult[]>([]);
  const [locationMode, setLocationMode] = useState<'address' | 'coordinates'>('address');
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.address.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        const fetchSuggestions = async () => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${formData.address}&format=json&limit=5`
            );
            const data = await response.json();
            setAddressSuggestions(data);
          } catch (error) {
            console.error('Error fetching address suggestions:', error);
          }
        };
        fetchSuggestions();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setAddressSuggestions([]);
    }
  }, [formData.address]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeocodingError(null);

    let submissionData = { ...formData };

    if (locationMode === 'address') {
      try {
        const hasCoords = submissionData.location.lat !== 0 || submissionData.location.lng !== 0;
        if (!hasCoords) {
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(submissionData.address)}&limit=1`);
          const results: NominatimResult[] = await resp.json();
          if (results && results.length > 0) {
            submissionData = {
              ...submissionData,
              location: {
                lat: parseFloat(results[0].lat),
                lng: parseFloat(results[0].lon)
              }
            };
          } else {
            setGeocodingError('Address not found. Please refine or switch to coordinates.');
            return;
          }
        }
      } catch (err) {
        setGeocodingError('Failed to geocode address. Try again or use coordinates.');
        return;
      }
    }

    onSubmit({ ...submissionData, images });
    // Reset form
    setFormData({
      name: '',
      location: { lat: 0, lng: 0 },
      address: '',
      category: 'OTHER' as ReportCategory,
      severityLevel: 'LOW' as SeverityLevel,
      description: ''
    });
    setImages([]);
    setLocationMode('address');
    setGeocodingError(null);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      location: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      },
    });
    setAddressSuggestions([]);
    setGeocodingError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Report</h2>
          <button 
            type="button"
            className="close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Report Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ReportCategory })}
                required
              >
                <option value="POTHOLE">Pothole</option>
                <option value="WASTE">Waste Management</option>
                <option value="POLLUTION">Pollution</option>
                <option value="LIGHTING">Street Lighting</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity Level *</label>
              <select
                value={formData.severityLevel}
                onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value as SeverityLevel })}
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Location mode toggle + conditional inputs */}
            <div className="form-group">
              <label>Location Input *</label>
              <div className="location-toggle" style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="radio"
                    name="locationMode"
                    checked={locationMode === 'address'}
                    onChange={() => setLocationMode('address')}
                  />
                  Address
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="radio"
                    name="locationMode"
                    checked={locationMode === 'coordinates'}
                    onChange={() => setLocationMode('coordinates')}
                  />
                  Coordinates
                </label>
              </div>

              {locationMode === 'address' && (
                <>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => { setFormData({ ...formData, address: e.target.value }); setGeocodingError(null); }}
                    placeholder="Street address, City, Country"
                    required
                  />
                  {addressSuggestions.length > 0 && (
                    <ul className="address-suggestions">
                      {addressSuggestions.map((suggestion) => (
                        <li key={suggestion.place_id} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {geocodingError && (
                    <div className="form-hint" style={{ color: '#ef4444', marginTop: '6px' }}>{geocodingError}</div>
                  )}
                </>
              )}

              {locationMode === 'coordinates' && (
                <>
                  <div className="form-hint">Enter coordinates or use map to select</div>
                  <div className="location-input">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.location.lat || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, lat: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.location.lng || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        location: { ...formData.location, lng: parseFloat(e.target.value) || 0 }
                      })}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide additional details about the issue..."
              />
            </div>

            <div className="form-group">
              <label>Upload Photos</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="upload-text">Click to upload or drag and drop</div>
                <div className="upload-subtext">PNG, JPG, GIF up to 10MB</div>
              </div>
              {images.length > 0 && (
                <div className="image-preview">
                  {images.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={img} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportModal;