import React from 'react';

const AmbulanceTypeSelector = ({ packages, selectedPackageId, onSelectPackage }) => {
  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🚑</span> Ambulance Package
      </div>
      <div className="package-options">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`package-option ${selectedPackageId === pkg.id ? 'active' : ''}`}
            onClick={() => onSelectPackage(pkg.id)}
          >
            <div className="package-info">
              <span className="package-name">{pkg.name}</span>
            </div>
            <span className="package-cost">+ ₹{Number(pkg.package_cost).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbulanceTypeSelector;
