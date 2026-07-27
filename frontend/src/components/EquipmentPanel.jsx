import React from 'react';

const EquipmentPanel = ({ equipment, instances, mountLimits, activeConversion, onAddInstance, onRemoveInstance }) => {
  // Determine minimum limits based on default_equipment
  const rules = {};
  if (activeConversion && activeConversion.default_equipment) {
      activeConversion.default_equipment.forEach(item => {
          rules[item.id] = (rules[item.id] || 0) + 1;
      });
  }

  // --- Dynamic Volume & Weight Logic ---
  const HUMAN_WEIGHT = 75; // kg
  const RESERVED_VOLUME = 2000; // Liters reserved for movement
  const MIN_HUMANS = 3;
  const RESERVED_WEIGHT = MIN_HUMANS * HUMAN_WEIGHT; 

  let usedVolume = 0;
  let usedWeight = 0;

  instances.forEach(inst => {
    const eq = equipment.find(e => e.id === inst.equipmentId);
    if (eq) {
       usedWeight += eq.weight_kg || 0;
       const volLiters = ((eq.width_mm || 0) * (eq.height_mm || 0) * (eq.depth_mm || 0)) / 1000000;
       usedVolume += volLiters;
    }
  });

  const totalVolume = (activeConversion?.patient_volume_liters || 5000) * 0.85; // Account for wheel arches and paneling
  const totalPayload = activeConversion?.payload_capacity_kg || 800;

  const availableVolume = totalVolume - RESERVED_VOLUME - usedVolume;
  const availablePayload = totalPayload - usedWeight;
  const maxPossibleHumans = Math.max(0, Math.floor(availablePayload / HUMAN_WEIGHT));
  // -------------------------------------

  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🛠️</span> Interior Equipment
      </div>
      
      {/* Dynamic Limits Display */}
      <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span><strong>Payload:</strong> {usedWeight.toFixed(1)}kg / {totalPayload}kg</span>
          <span style={{ color: availablePayload < RESERVED_WEIGHT ? '#ef4444' : '#10b981' }}>
            {maxPossibleHumans} Humans Allowed
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>Volume:</strong> {usedVolume.toFixed(1)}L / {totalVolume}L</span>
          <span style={{ color: availableVolume < 0 ? '#ef4444' : '#10b981' }}>
            {availableVolume > 0 ? `${availableVolume.toFixed(0)}L free` : 'Volume full'}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '8px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${Math.min(100, (usedWeight / totalPayload) * 100)}%`, background: '#3b82f6' }}></div>
        </div>
      </div>

      <div className="equipment-list">
        {equipment.map((item) => {
          const itemInstances = instances.filter((i) => i.equipmentId === item.id);
          
          const count = itemInstances.length;
          const minLimit = rules[item.id] || 0;
          const stockQty = (item.stock_quantity !== undefined && item.stock_quantity !== null) ? item.stock_quantity : 10;
          const spaceLimit = mountLimits && mountLimits[item.mount_point] !== undefined ? mountLimits[item.mount_point] : 10;
          const effectiveMaxLimit = Math.min(spaceLimit, stockQty);
          
          const isMinReached = count <= minLimit;
          const isMaxReached = count >= effectiveMaxLimit;

          const itemVolLiters = ((item.width_mm || 0) * (item.height_mm || 0) * (item.depth_mm || 0)) / 1000000;
          const itemWeight = item.weight_kg || 0;

          const isVolumeExceeded = (availableVolume - itemVolLiters) < 0;
          const isWeightExceeded = (availablePayload - itemWeight) < RESERVED_WEIGHT;
          
          const isAddDisabled = isMaxReached || isVolumeExceeded || isWeightExceeded;

          const handleRemoveLast = () => {
            if (!isMinReached) {
              onRemoveInstance(itemInstances[count - 1].instanceId);
            }
          };
          
          const handleAdd = () => {
            if (isMaxReached) {
              if (stockQty < spaceLimit && count >= stockQty) {
                alert(`Cannot add more ${item.name}. Out of stock. The inventory stock limit (${stockQty} units) has been reached.`);
              } else {
                alert(`Cannot add more ${item.name}. The physical capacity limit for this ambulance model has been reached.`);
              }
              return;
            }
            if (isWeightExceeded) {
                alert(`Cannot add ${item.name}. Exceeds payload capacity while reserving weight for minimum 3 humans.`);
                return;
            }
            if (isVolumeExceeded) {
                alert(`Cannot add ${item.name}. Insufficient cabin volume available.`);
                return;
            }
            onAddInstance(item);
          };

          let addBtnTitle = "Add one";
          if (isAddDisabled) {
            if (isMaxReached) {
                addBtnTitle = (stockQty < spaceLimit && count >= stockQty) ? "Out of stock" : "Maximum physical slots reached";
            } else if (isWeightExceeded) {
                addBtnTitle = "Weight limit exceeded";
            } else if (isVolumeExceeded) {
                addBtnTitle = "Volume limit exceeded";
            }
          }

          return (
            <div 
              key={item.id} 
              className={`equipment-item ${count > 0 ? 'active' : ''}`}
              style={{ flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="equipment-info">
                  <span className="equipment-name">{item.name}</span>
                  <span className="equipment-cost">
                    ₹{Number(item.unit_cost).toLocaleString('en-IN')} 
                    <span style={{color: '#64748b', fontSize: '0.75rem', marginLeft: '6px'}}>
                        ({itemWeight}kg, {itemVolLiters.toFixed(1)}L)
                    </span>
                  </span>
                  <div className="equipment-stock" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    {stockQty === 0 ? (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>Out of stock</span>
                    ) : (
                      <span style={{ color: '#4b5563' }}>{stockQty} in stock</span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={handleRemoveLast}
                    disabled={isMinReached}
                    title={isMinReached ? "Minimum limit reached (compulsory)" : "Remove one"}
                    style={{
                      width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #d1d5db',
                      background: isMinReached ? '#f3f4f6' : 'white', cursor: isMinReached ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}
                  >
                    -
                  </button>
                  
                  <span style={{ minWidth: '16px', textAlign: 'center', fontWeight: 600 }}>{count}</span>
                  
                  <button 
                    onClick={handleAdd}
                    title={addBtnTitle}
                    disabled={isAddDisabled}
                    style={{
                      width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #d1d5db',
                      background: isAddDisabled ? '#fee2e2' : 'white', cursor: isAddDisabled ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Certifications row */}
              {item.certifications && item.certifications.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {item.certifications.map((cert) => (
                    <span 
                      key={cert.id} 
                      title={cert.authority || "Certification"}
                      style={{
                        fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px',
                        background: '#e0f2fe', color: '#0369a1', fontWeight: 500
                      }}
                    >
                      {cert.name}
                    </span>
                  ))}
                </div>
              )}

              {count > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {itemInstances.map((instance, index) => {
                    const isRequiredInstance = index < minLimit;
                    return (
                      <div key={instance.instanceId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4b5563' }}>
                        <span>
                          {item.name} #{index + 1} 
                          {isRequiredInstance && <span style={{fontSize: '0.7rem', color: '#8b5cf6', marginLeft: '4px'}}>(Required)</span>}
                        </span>
                        
                        {!isRequiredInstance && (
                          <button 
                            onClick={() => onRemoveInstance(instance.instanceId)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                          >
                            [Remove]
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentPanel;
