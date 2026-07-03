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
          const maxLimit = mountLimits && mountLimits[item.mount_point] ? mountLimits[item.mount_point] : 10;
          const isMinReached = count <= minLimit;
          const isMaxReached = count >= maxLimit;

          const handleRemoveLast = () => {
            if (!isMinReached) {
              onRemoveInstance(itemInstances[count - 1].instanceId);
            }
          };
          
          const handleAdd = () => {
            if (isMaxReached) {
              alert(`Cannot add more ${item.name}. The physical capacity limit for this ambulance model has been reached.`);
              return;
            }
            onAddInstance(item);
          };

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
                    title={isMaxReached ? "Maximum physical slots reached" : "Add one"}
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
