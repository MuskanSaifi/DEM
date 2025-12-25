import React, { useState } from "react";
import { IndianLocation } from "../Indianlocation"; // Import the location list

const LocationSelector = ({ formData, setFormData }) => {
    const selectedState = IndianLocation.find((state) => state.state === formData.basicDetails?.state);
    const cities = selectedState ? selectedState.cities : [];
  
    return (
      <div className="d-flex justify-content-between">
        {/* State Dropdown */}
        <div className="mb-3">
          <label className="form-label">State</label>
          <select
            className="form-control"
            name="state"
            value={formData.basicDetails?.state || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                basicDetails: { ...prev.basicDetails, state: e.target.value, city: "" } // ✅ Preserve all fields
              }))
            }
          >
            <option value="">Select State</option>
            {IndianLocation.map((state) => (
              <option key={state.state} value={state.state}>
                {state.state}
              </option>
            ))}
          </select>
        </div>
  
        {/* City Dropdown */}
        <div className="mb-3">
          <label className="form-label">City</label>
          <select
            className="form-control"
            name="city"
            value={formData.basicDetails?.city || ""}
            disabled={!formData.basicDetails?.state}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                basicDetails: { ...prev.basicDetails, city: e.target.value } // ✅ Preserve all fields
              }))
            }
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };
  

export default LocationSelector;
