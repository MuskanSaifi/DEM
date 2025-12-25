"use client";

import React from "react";
import { FaSearch, FaSlidersH } from "react-icons/fa";

const CitySearchBar = () => {
  return (
    <div className="mt-1 mb-3">
      <div className="row bg-light p-2 rounded shadow-sm align-items-center">
        
        {/* Filter Button */}
        <div className="col-auto">
          <button className="btn btn-light">
            <FaSlidersH />
          </button>
        </div>

        {/* Search Input */}
        <div className="col-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-0">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control border-0"
              placeholder="Please Enter Your City Name"
            />
          </div>
        </div>

        {/* Cities List - Scrollable */}
        <div className="col-7 overflow-auto city-scroll">
          <div className="d-flex flex-nowrap">
            <strong className="me-3">All Results</strong>
            {[
              "Delhi", "Mumbai", "Kolkata", "Chennai", "Pune", 
              "Bengaluru", "Hyderabad", "Jaipur", "Ahmedabad", "Surat",
              "Lucknow", "Patna", "Bhopal", "Indore", "Chandigarh"
            ].map((city, index) => (
              <span key={index} className="me-3 text-muted city-name">
                {city}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CitySearchBar;
