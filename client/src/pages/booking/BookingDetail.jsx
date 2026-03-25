import React, { useState } from 'react';
import './BookingDetail.css';
import VenueCalendar from './VenueCalendar';

/* ─── Mock Kitchen Menu Data ─── */
const KITCHEN_MENU = {
  appetizers: [
    { id: 'app1', name: 'Paneer Tikka', price: 320, category: 'veg' },
    { id: 'app2', name: 'Chicken Seekh', price: 380, category: 'non-veg' },
    { id: 'app3', name: 'Veg Spring Roll', price: 280, category: 'veg' },
    { id: 'app4', name: 'Fish Amritsari', price: 420, category: 'non-veg' },
  ],
  mainCourse: [
    { id: 'main1', name: 'Butter Chicken', price: 480, category: 'non-veg' },
    { id: 'main2', name: 'Paneer Butter Masala', price: 420, category: 'veg' },
    { id: 'main3', name: 'Dal Makhani', price: 380, category: 'veg' },
    { id: 'main4', name: 'Lamb Rogan Josh', price: 520, category: 'non-veg' },
    { id: 'main5', name: 'Mixed Veg Curry', price: 360, category: 'veg' },
  ],
  desserts: [
    { id: 'des1', name: 'Gulab Jamun', price: 120, category: 'veg' },
    { id: 'des2', name: 'Rasmalai', price: 150, category: 'veg' },
    { id: 'des3', name: 'Ice Cream', price: 100, category: 'veg' },
  ],
  beverages: [
    { id: 'bev1', name: 'Soft Drinks', price: 80, category: 'veg' },
    { id: 'bev2', name: 'Fresh Juice', price: 120, category: 'veg' },
    { id: 'bev3', name: 'Mineral Water', price: 60, category: 'veg' },
  ]
};

/* ─── Component ─── */
export default function BookingDetail({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    phone: '',
    company: '',
    gstNumber: '',
    
    // Event Details
    eventType: '',
    expectedGuests: '',
    preferredDate: '',
    preferredTime: '',
    venue: '',
    
    // Menu Selection
    selectedMenu: {
      appetizers: [],
      mainCourse: [],
      desserts: [],
      beverages: []
    },
    customizations: '',
    
    // Additional Requirements
    budget: '',
    specialRequests: '',
    cateringPreferences: '',
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const venues = [
    { id: 'grand-ballroom', name: 'Grand Ballroom', capacity: 500, rate: 150000 },
    { id: 'terrace-garden', name: 'Terrace Garden', capacity: 200, rate: 80000 },
    { id: 'crystal-hall', name: 'Crystal Hall', capacity: 300, rate: 100000 },
    { id: 'banquet-suite-a', name: 'Banquet Suite A', capacity: 150, rate: 60000 },
    { id: 'rooftop-lounge', name: 'Rooftop Lounge', capacity: 100, rate: 50000 },
  ];

  const eventTypes = [
    'Wedding Reception', 'Birthday Party', 'Corporate Event', 
    'Anniversary', 'Engagement', 'Conference', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMenuSelection = (category, itemId) => {
    setFormData(prev => ({
      ...prev,
      selectedMenu: {
        ...prev.selectedMenu,
        [category]: prev.selectedMenu[category].includes(itemId)
          ? prev.selectedMenu[category].filter(id => id !== itemId)
          : [...prev.selectedMenu[category], itemId]
      }
    }));
  };

  const calculateEstimatedCost = () => {
    let menuCost = 0;
    Object.entries(formData.selectedMenu).forEach(([category, items]) => {
      const categoryItems = category === 'appetizers' ? KITCHEN_MENU.appetizers :
                           category === 'mainCourse' ? KITCHEN_MENU.mainCourse :
                           category === 'desserts' ? KITCHEN_MENU.desserts :
                           KITCHEN_MENU.beverages;
      
      items.forEach(itemId => {
        const item = categoryItems.find(i => i.id === itemId);
        if (item) menuCost += item.price;
      });
    });

    const venueCost = venues.find(v => v.id === formData.venue)?.rate || 0;
    const totalCost = (menuCost * parseInt(formData.expectedGuests || 0)) + venueCost;
    
    return totalCost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare selected menu items
      const selectedItems = [];
      Object.entries(formData.selectedMenu).forEach(([category, itemIds]) => {
        const categoryItems = category === 'appetizers' ? KITCHEN_MENU.appetizers :
                             category === 'mainCourse' ? KITCHEN_MENU.mainCourse :
                             category === 'desserts' ? KITCHEN_MENU.desserts :
                             KITCHEN_MENU.beverages;
        
        itemIds.forEach(id => {
          const item = categoryItems.find(item => item.id === id);
          if (item) {
            selectedItems.push({
              id: item.id,
              name: item.name,
              price: item.price,
              category: item.category,
              quantity: 1
            });
          }
        });
      });

      // Create booking enquiry object for backend
      const bookingEnquiry = {
        personalDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          gstNumber: formData.gstNumber
        },
        eventDetails: {
          eventType: formData.eventType,
          guests: parseInt(formData.expectedGuests),
          date: new Date(formData.preferredDate),
          time: formData.preferredTime,
          venue: formData.venue
        },
        menuSelection: {
          selectedItems: selectedItems,
          customRequirements: formData.customMenuRequirements,
          catering: 'both'
        },
        additionalRequirements: {
          budget: formData.budget ? parseInt(formData.budget) : undefined,
          specialRequests: formData.specialRequests,
          decoration: formData.decoration,
          entertainment: formData.entertainment,
          photography: formData.photography
        },
        source: 'website',
        priority: formData.budget && formData.budget > 500000 ? 'high' : 'medium'
      };

      // Send to backend
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingEnquiry)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to submit booking');
      }

      // Show success message with enquiry ID
      alert(`Booking enquiry submitted successfully! Your enquiry ID is ${result.data.enquiryId}. Our sales team will contact you within 24 hours.`);
      
      // Reset form or go back
      onBack();
      
    } catch (error) {
      console.error('Booking submission error:', error);
      
      // Fallback to localStorage if backend fails
      console.log('Backend unavailable, using localStorage fallback...');
      
      const fallbackEnquiry = {
        id: `BK-${Date.now()}`,
        enquiryId: `ENQ${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        ...formData,
        estimatedCost: calculateEstimatedCost(),
        status: 'enquiry',
        createdAt: new Date().toISOString(),
        // Add selected menu items details
        menuDetails: Object.entries(formData.selectedMenu).reduce((acc, [category, itemIds]) => {
          acc[category] = itemIds.map(id => {
            const categoryItems = category === 'appetizers' ? KITCHEN_MENU.appetizers :
                                 category === 'mainCourse' ? KITCHEN_MENU.mainCourse :
                                 category === 'desserts' ? KITCHEN_MENU.desserts :
                                 KITCHEN_MENU.beverages;
            return categoryItems.find(item => item.id === id);
          });
          return acc;
        }, {})
      };

      // Store in localStorage for sales dashboard to pick up
      const existingEnquiries = JSON.parse(localStorage.getItem('bookingEnquiries') || '[]');
      localStorage.setItem('bookingEnquiries', JSON.stringify([...existingEnquiries, fallbackEnquiry]));
      
      // Show success message with fallback enquiry ID
      alert(`Booking enquiry submitted successfully! Your enquiry ID is ${fallbackEnquiry.enquiryId}. Our sales team will contact you within 24 hours.`);
      
      // Reset form or go back
      onBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="booking-step">
            <h2>Personal Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  placeholder="Optional for corporate bookings"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="booking-step">
            <h2>Event Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Event Type *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  required
                >
                  <option value="">Select Event Type</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Expected Guests *</label>
                <input
                  type="number"
                  value={formData.expectedGuests}
                  onChange={(e) => handleInputChange('expectedGuests', e.target.value)}
                  min="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preferred Time *</label>
                <input
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Venue Preference</label>
                <select
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                >
                  <option value="">Select Venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} (Capacity: {venue.capacity}, Rate: ₹{venue.rate.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <button 
                  type="button" 
                  className="calendar-btn"
                  onClick={() => setShowCalendar(true)}
                >
                  📅 Check Venue Availability
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="booking-step">
            <h2>Menu Selection</h2>
            <div className="menu-sections">
              {Object.entries(KITCHEN_MENU).map(([category, items]) => (
                <div key={category} className="menu-category">
                  <h3>{category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}</h3>
                  <div className="menu-items">
                    {items.map(item => (
                      <label key={item.id} className="menu-item">
                        <input
                          type="checkbox"
                          checked={formData.selectedMenu[category].includes(item.id)}
                          onChange={() => handleMenuSelection(category, item.id)}
                        />
                        <div className="menu-item-info">
                          <span className="menu-item-name">{item.name}</span>
                          <span className="menu-item-price">₹{item.price}</span>
                          <span className="menu-item-category">{item.category}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Custom Menu Requirements</label>
              <textarea
                value={formData.customizations}
                onChange={(e) => handleInputChange('customizations', e.target.value)}
                placeholder="Any specific dietary requirements or custom menu items..."
                rows="3"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="booking-step">
            <h2>Additional Requirements</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Estimated Budget</label>
                <input
                  type="text"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="e.g., ₹2,00,000"
                />
              </div>
              <div className="form-group">
                <label>Special Requests</label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special arrangements or requirements..."
                  rows="3"
                />
              </div>
              <div className="form-group full-width">
                <label>Catering Preferences</label>
                <textarea
                  value={formData.cateringPreferences}
                  onChange={(e) => handleInputChange('cateringPreferences', e.target.value)}
                  placeholder="Service style, staffing requirements, etc..."
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="booking-detail">
      <div className="booking-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Book Your Event</h1>
      </div>

      <div className="booking-progress">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
            onClick={() => setCurrentStep(step)}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Personal Details'}
              {step === 2 && 'Event Details'}
              {step === 3 && 'Menu Selection'}
              {step === 4 && 'Requirements'}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="booking-form">
        {renderStep()}

        <div className="booking-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              Submit Booking Enquiry
            </button>
          )}
        </div>

        {currentStep === 4 && (
          <div className="cost-estimate">
            <h3>Estimated Cost: ₹{calculateEstimatedCost().toLocaleString()}</h3>
            <p>*This is an estimate. Final quote will be provided by our sales team.</p>
          </div>
        )}
      </form>

      {showCalendar && (
        <VenueCalendar
          onClose={() => setShowCalendar(false)}
          onDateSelect={(date) => {
            handleInputChange('preferredDate', date.toISOString().split('T')[0]);
            setShowCalendar(false);
          }}
        />
      )}
    </div>
  );
}
