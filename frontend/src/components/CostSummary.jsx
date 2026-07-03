import React, { useState } from 'react';

const CostSummary = ({ 
  selectedVehicle, 
  selectedPackage, 
  activeConversion,
  selectedEquipmentItems, 
  optionalEquipmentCost,
  totalCost, 
  isUnsupported,
  onSaveConfiguration,
  isSaving
}) => {
  const [configName, setConfigName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!configName.trim() || isUnsupported) return;
    onSaveConfiguration(configName.trim());
    setConfigName('');
  };

  const bundledItems = activeConversion && activeConversion.default_equipment 
    ? selectedEquipmentItems.filter(item => activeConversion.default_equipment.some(d => d.id === item.id))
    : [];
  const optionalItems = selectedEquipmentItems.filter(item => !bundledItems.some(d => d.id === item.id));

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
        {activeConversion && (
          <div className="cost-row">
            <span>Conversion Cost ({selectedPackage?.name})</span>
            <span>₹{Number(activeConversion.conversion_cost).toLocaleString('en-IN')}</span>
          </div>
        )}
        {bundledItems.length > 0 && (
          <div className="cost-row" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>└ Bundled Tools ({bundledItems.length} items)</span>
            <span style={{ color: '#22c55e', fontWeight: 500 }}>Included</span>
          </div>
        )}
        {optionalItems.length > 0 && (
          <div className="cost-row">
            <span>Optional Upgrades ({optionalItems.length} items)</span>
            <span>+ ₹{optionalEquipmentCost.toLocaleString('en-IN')}</span>
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
          disabled={isSaving || isUnsupported || !selectedVehicle}
          required
        />
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isSaving || isUnsupported || !selectedVehicle || !selectedPackage || !configName.trim()}
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
