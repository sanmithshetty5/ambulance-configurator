import React from 'react';

const EquipmentPanel = ({ equipment, instances, mountLimits, activeConversion, onAddInstance, onRemoveInstance }) => {
  // Determine minimum limits based on default_equipment
  const rules = {};
  if (activeConversion && activeConversion.default_equipment) {
      activeConversion.default_equipment.forEach(item => {
          rules[item.id] = (rules[item.id] || 0) + 1;
      });
  }

  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🛠️</span> Interior Equipment
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

          const handleRemoveLast = () => {
            if (!isMinReached) {
              onRemoveInstance(itemInstances[count - 1].instanceId);
            }
          };
          
          const handleAdd = () => {
            if (count >= effectiveMaxLimit) {
              if (stockQty < spaceLimit && count >= stockQty) {
                alert(`Cannot add more ${item.name}. Out of stock. The inventory stock limit (${stockQty} units) has been reached.`);
              } else {
                alert(`Cannot add more ${item.name}. The physical capacity limit for this ambulance model has been reached.`);
              }
              return;
            }
            onAddInstance(item);
          };

          let addBtnTitle = "Add one";
          if (isMaxReached) {
            if (stockQty < spaceLimit && count >= stockQty) {
              addBtnTitle = "Out of stock / Maximum stock reached";
            } else {
              addBtnTitle = "Maximum physical slots reached";
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
                  <span className="equipment-cost">₹{Number(item.unit_cost).toLocaleString('en-IN')}</span>
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
                    style={{
                      width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #d1d5db',
                      background: isMaxReached ? '#fee2e2' : 'white', cursor: isMaxReached ? 'not-allowed' : 'pointer',
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
