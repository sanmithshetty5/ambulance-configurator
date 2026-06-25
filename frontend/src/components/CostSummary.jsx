import React, { useState } from 'react';

const CostSummary = ({ 
  selectedVehicle, 
  selectedPackage, 
  selectedEquipmentItems, 
  totalCost, 
  onSaveConfiguration,
  isSaving
}) => {
  const [configName, setConfigName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!configName.trim()) return;
    onSaveConfiguration(configName.trim());
    setConfigName('');
  };

  const equipmentCost = selectedEquipmentItems.reduce((sum, item) => sum + Number(item.unit_cost), 0);

  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>💳</span> Cost Estimation
      </div>
      <div className="cost-breakdown">
        {selectedVehicle && (
          <div className="cost-row">
            <span>Base Vehicle ({selectedVehicle.name})</span>
            <span>₹{Number(selectedVehicle.base_cost).toLocaleString('en-IN')}</span>
          </div>
        )}
        {selectedPackage && (
          <div className="cost-row">
            <span>Package ({selectedPackage.name})</span>
            <span>₹{Number(selectedPackage.package_cost).toLocaleString('en-IN')}</span>
          </div>
        )}
        {selectedEquipmentItems.length > 0 && (
          <div className="cost-row">
            <span>Equipment ({selectedEquipmentItems.length} items)</span>
            <span>+ ₹{equipmentCost.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="cost-row total">
          <span>Estimated Total</span>
          <span className="total-value">₹{Number(totalCost).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="save-form">
        <input 
          type="text" 
          placeholder="Name this configuration..." 
          className="text-input"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          disabled={isSaving || !selectedVehicle}
          required
        />
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSaving || !selectedVehicle || !selectedPackage || !configName.trim()}
        >
          {isSaving ? (
            <>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </form>
    </div>
  );
};

export default CostSummary;
