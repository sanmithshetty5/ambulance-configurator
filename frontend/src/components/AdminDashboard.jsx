import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [catalog, setCatalog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Form states
  // 1. Vehicle Form
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleManufId, setVehicleManufId] = useState('');
  const [vehicleCost, setVehicleCost] = useState('');
  const [vehicleLen, setVehicleLen] = useState('');
  const [vehicleWid, setVehicleWid] = useState('');
  const [vehicleHei, setVehicleHei] = useState('');

  // 2. Equipment Form
  const [eqName, setEqName] = useState('');
  const [eqCatId, setEqCatId] = useState('');
  const [eqBrandId, setEqBrandId] = useState('');
  const [eqSku, setEqSku] = useState('');
  const [eqHsn, setEqHsn] = useState('');
  const [eqCost, setEqCost] = useState('');
  const [eqGst, setEqGst] = useState('18');
  const [eqMandatory, setEqMandatory] = useState(false);
  const [eqWarranty, setEqWarranty] = useState('12');
  const [eqStockStatus, setEqStockStatus] = useState('in_stock');
  const [eqStockQty, setEqStockQty] = useState('0');
  const [eqLeadTime, setEqLeadTime] = useState('0');
  const [eqMount, setEqMount] = useState('');
  const [eqModel, setEqModel] = useState('');
  const [eqWidth, setEqWidth] = useState('');
  const [eqHeight, setEqHeight] = useState('');
  const [eqDepth, setEqDepth] = useState('');
  const [eqPosX, setEqPosX] = useState('0.0');
  const [eqPosY, setEqPosY] = useState('0.0');
  const [eqPosZ, setEqPosZ] = useState('0.0');
  const [eqRotX, setEqRotX] = useState('0.0');
  const [eqRotY, setEqRotY] = useState('0.0');
  const [eqRotZ, setEqRotZ] = useState('0.0');
  const [eqCertIds, setEqCertIds] = useState([]);

  // 3. Ambulance Type Form
  const [pkgName, setPkgName] = useState('');
  const [pkgCode, setPkgCode] = useState('');
  const [pkgDesc, setPkgDesc] = useState('');

  // 4. Conversion Spec Form
  const [specVehicleId, setSpecVehicleId] = useState('');
  const [specPackageId, setSpecPackageId] = useState('');
  const [specLen, setSpecLen] = useState('');
  const [specWid, setSpecWid] = useState('');
  const [specHei, setSpecHei] = useState('');
  const [specVol, setSpecVol] = useState('');
  const [specCost, setSpecCost] = useState('');
  const [specPayload, setSpecPayload] = useState('');
  const [specElec, setSpecElec] = useState('');
  const [specOxy, setSpecOxy] = useState('');
  const [specHvac, setSpecHvac] = useState('');
  const [specDesc, setSpecDesc] = useState('');
  const [specEqIds, setSpecEqIds] = useState([]);
  const [specFeatureIds, setSpecFeatureIds] = useState([]);

  const triggerNotification = (message, isError = false) => {
    setNotification({ text: message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/admin/catalog-summary`);
      setCatalog(res.data);
      
      // Auto-set selects defaults if lists are loaded
      if (res.data.manufacturers?.length > 0) setVehicleManufId(res.data.manufacturers[0].id.toString());
      if (res.data.categories?.length > 0) setEqCatId(res.data.categories[0].id.toString());
      if (res.data.brands?.length > 0) setEqBrandId(res.data.brands[0].id.toString());
      if (res.data.vehicles?.length > 0) setSpecVehicleId(res.data.vehicles[0].id.toString());
      if (res.data.packages?.length > 0) setSpecPackageId(res.data.packages[0].id.toString());

    } catch (err) {
      console.error('Error fetching catalog data:', err);
      triggerNotification('Failed to load catalog summary.', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/vehicles`, {
        name: vehicleName,
        manufacturer_id: parseInt(vehicleManufId),
        base_cost: parseFloat(vehicleCost),
        length_mm: vehicleLen ? parseFloat(vehicleLen) : null,
        width_mm: vehicleWid ? parseFloat(vehicleWid) : null,
        height_mm: vehicleHei ? parseFloat(vehicleHei) : null
      });
      triggerNotification(`Vehicle chassis '${vehicleName}' created successfully!`);
      setVehicleName('');
      setVehicleCost('');
      setVehicleLen('');
      setVehicleWid('');
      setVehicleHei('');
      fetchCatalog();
    } catch (err) {
      console.error(err);
      triggerNotification('Error creating vehicle.', true);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: eqName,
        category_id: parseInt(eqCatId),
        brand_id: parseInt(eqBrandId),
        sku: eqSku,
        hsn_code: eqHsn,
        unit_cost: parseFloat(eqCost),
        gst_rate: parseFloat(eqGst || 18),
        is_mandatory: eqMandatory,
        warranty_months: parseInt(eqWarranty || 12),
        stock_status: eqStockStatus,
        stock_quantity: parseInt(eqStockQty || 0),
        lead_time_days: parseInt(eqLeadTime || 0),
        mount_point: eqMount || `mount_${eqName.toLowerCase().replace(/\s+/g, '_')}`,
        model_url: eqModel || `${eqName.toLowerCase().replace(/\s+/g, '_')}.glb`,
        width_mm: eqWidth ? parseFloat(eqWidth) : null,
        height_mm: eqHeight ? parseFloat(eqHeight) : null,
        depth_mm: eqDepth ? parseFloat(eqDepth) : null,
        position_x: parseFloat(eqPosX || 0.0),
        position_y: parseFloat(eqPosY || 0.0),
        position_z: parseFloat(eqPosZ || 0.0),
        rotation_x: parseFloat(eqRotX || 0.0),
        rotation_y: parseFloat(eqRotY || 0.0),
        rotation_z: parseFloat(eqRotZ || 0.0),
        certification_ids: eqCertIds
      };

      await axios.post(`${API_BASE}/admin/equipment`, payload);
      triggerNotification(`Equipment catalog item '${eqName}' added successfully!`);
      setEqName('');
      setEqSku('');
      setEqHsn('');
      setEqCost('');
      setEqMount('');
      setEqModel('');
      setEqWidth('');
      setEqHeight('');
      setEqDepth('');
      setEqPosX('0.0');
      setEqPosY('0.0');
      setEqPosZ('0.0');
      setEqRotX('0.0');
      setEqRotY('0.0');
      setEqRotZ('0.0');
      setEqCertIds([]);
      setEqMandatory(false);
      fetchCatalog();
    } catch (err) {
      console.error(err);
      triggerNotification('Error creating equipment item.', true);
    }
  };

  const handleAddAmbulanceType = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/ambulance-types`, {
        name: pkgName,
        code: pkgCode,
        description: pkgDesc || null
      });
      triggerNotification(`Ambulance package type '${pkgName}' created successfully!`);
      setPkgName('');
      setPkgCode('');
      setPkgDesc('');
      fetchCatalog();
    } catch (err) {
      console.error(err);
      triggerNotification('Error creating package type.', true);
    }
  };

  const handleAddConversionSpec = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vehicle_id: parseInt(specVehicleId),
        ambulance_type_id: parseInt(specPackageId),
        patient_length_mm: parseFloat(specLen),
        patient_width_mm: parseFloat(specWid),
        patient_height_mm: parseFloat(specHei),
        patient_volume_liters: specVol ? parseFloat(specVol) : null,
        conversion_cost: parseFloat(specCost),
        payload_capacity_kg: specPayload ? parseFloat(specPayload) : null,
        electrical_capacity_ah: specElec ? parseFloat(specElec) : null,
        oxygen_mounting_capacity_liters: specOxy ? parseFloat(specOxy) : null,
        hvac_type: specHvac || null,
        description: specDesc || null,
        default_equipment_ids: specEqIds,
        feature_ids: specFeatureIds
      };

      await axios.post(`${API_BASE}/admin/conversion-specs`, payload);
      triggerNotification('Ambulance Build Specification created successfully!');
      setSpecLen('');
      setSpecWid('');
      setSpecHei('');
      setSpecVol('');
      setSpecCost('');
      setSpecPayload('');
      setSpecElec('');
      setSpecOxy('');
      setSpecHvac('');
      setSpecDesc('');
      setSpecEqIds([]);
      setSpecFeatureIds([]);
      fetchCatalog();
    } catch (err) {
      console.error(err);
      triggerNotification('Error creating conversion spec.', true);
    }
  };

  const handleCertCheckboxChange = (certId) => {
    setEqCertIds(prev => 
      prev.includes(certId) ? prev.filter(id => id !== certId) : [...prev, certId]
    );
  };

  const handleDefaultEqCheckboxChange = (eqId) => {
    setSpecEqIds(prev => 
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  const handleFeatureCheckboxChange = (featureId) => {
    setSpecFeatureIds(prev => 
      prev.includes(featureId) ? prev.filter(id => id !== featureId) : [...prev, featureId]
    );
  };

  return (
    <div className="app-container" style={{ overflowY: 'auto' }}>
      {notification && (
        <div 
          className="notification-banner" 
          style={{ 
            background: notification.isError ? '#ef4444' : 'var(--color-accent)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {notification.text}
        </div>
      )}

      <header className="app-header" style={{ justifyContent: 'space-between', padding: '15px 30px' }}>
        <div className="brand-container">
          <div className="brand-icon" style={{ background: 'var(--color-primary)' }}>A</div>
          <span className="brand-title">Ambulance Configurator</span>
          <span className="brand-badge" style={{ background: '#374151' }}>ADMIN DASHBOARD</span>
        </div>
        <button 
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      <main className="app-content" style={{ display: 'flex', flexDirection: 'column', padding: '30px', gap: '20px', height: 'auto', overflowY: 'visible' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          {[
            { id: 'summary', name: 'Current Catalog' },
            { id: 'vehicle', name: 'Add Vehicle' },
            { id: 'equipment', name: 'Add Equipment' },
            { id: 'package', name: 'Add Package Type' },
            { id: 'spec', name: 'Add Conversion Spec' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', margin: '40px auto' }}>
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading dashboard components...</p>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* 1. CURRENT CATALOG SUMMARY TAB */}
            {activeTab === 'summary' && catalog && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                <div className="config-card">
                  <div className="config-card-title">🚙 Registered Vehicle Chassis</div>
                  <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px' }}>ID</th>
                          <th style={{ padding: '10px' }}>Name</th>
                          <th style={{ padding: '10px' }}>Base Cost</th>
                          <th style={{ padding: '10px' }}>Dimensions (LxWxH)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalog.vehicles.map(v => (
                          <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{v.id}</td>
                            <td style={{ padding: '10px', fontWeight: 500 }}>{v.name}</td>
                            <td style={{ padding: '10px' }}>₹{Number(v.base_cost).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px' }}>{v.length_mm} x {v.width_mm} x {v.height_mm} mm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="config-card">
                  <div className="config-card-title">📦 Ambulance Package Types</div>
                  <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px' }}>ID</th>
                          <th style={{ padding: '10px' }}>Name</th>
                          <th style={{ padding: '10px' }}>Code</th>
                          <th style={{ padding: '10px' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalog.packages.map(p => (
                          <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{p.id}</td>
                            <td style={{ padding: '10px', fontWeight: 500 }}>{p.name}</td>
                            <td style={{ padding: '10px', color: 'var(--color-primary)' }}>{p.code}</td>
                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{p.description || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="config-card">
                  <div className="config-card-title">🩺 Medical Equipment Catalog</div>
                  <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px' }}>ID</th>
                          <th style={{ padding: '10px' }}>Name</th>
                          <th style={{ padding: '10px' }}>SKU</th>
                          <th style={{ padding: '10px' }}>Unit Cost</th>
                          <th style={{ padding: '10px' }}>Stock</th>
                          <th style={{ padding: '10px' }}>Certifications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalog.equipment.map(eq => (
                          <tr key={eq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{eq.id}</td>
                            <td style={{ padding: '10px', fontWeight: 500 }}>{eq.name}</td>
                            <td style={{ padding: '10px', fontFamily: 'monospace' }}>{eq.sku}</td>
                            <td style={{ padding: '10px' }}>₹{Number(eq.unit_cost).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ color: eq.stock_quantity === 0 ? '#ef4444' : 'inherit' }}>
                                {eq.stock_quantity} ({eq.stock_status})
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {eq.certifications?.map(c => (
                                  <span key={c.id} title={c.authority} style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px' }}>
                                    {c.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="config-card">
                  <div className="config-card-title">🚑 Conversion Build Specifications</div>
                  <div style={{ overflowX: 'auto', marginTop: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '10px' }}>ID</th>
                          <th style={{ padding: '10px' }}>Vehicle Chassis</th>
                          <th style={{ padding: '10px' }}>Package Type</th>
                          <th style={{ padding: '10px' }}>Conversion Cost</th>
                          <th style={{ padding: '10px' }}>Payload / HVAC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catalog.conversions.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{c.id}</td>
                            <td style={{ padding: '10px', fontWeight: 500 }}>{c.vehicle?.name}</td>
                            <td style={{ padding: '10px', color: 'var(--color-primary)' }}>{c.ambulance_type?.name}</td>
                            <td style={{ padding: '10px' }}>₹{Number(c.conversion_cost).toLocaleString('en-IN')}</td>
                            <td style={{ padding: '10px' }}>{c.payload_capacity_kg}kg / {c.hvac_type || 'None'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ADD VEHICLE TAB */}
            {activeTab === 'vehicle' && (
              <div className="config-card">
                <div className="config-card-title">🚙 Add New Vehicle Chassis</div>
                <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Vehicle Model Name *</label>
                      <input type="text" required value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="e.g. Force Traveller 3350" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Manufacturer *</label>
                      <select required value={vehicleManufId} onChange={e => setVehicleManufId(e.target.value)} style={inputStyle}>
                        {catalog?.manufacturers.map(m => (
                          <option key={m.id} value={m.id} style={{color: '#000'}}>{m.name} ({m.country})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Base Cost (Rs.) *</label>
                      <input type="number" required value={vehicleCost} onChange={e => setVehicleCost(e.target.value)} placeholder="e.g. 750000" style={inputStyle} />
                    </div>
                  </div>
                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Exterior Length (mm)</label>
                      <input type="number" value={vehicleLen} onChange={e => setVehicleLen(e.target.value)} placeholder="e.g. 4900" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Exterior Width (mm)</label>
                      <input type="number" value={vehicleWid} onChange={e => setVehicleWid(e.target.value)} placeholder="e.g. 1900" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Exterior Height (mm)</label>
                      <input type="number" value={vehicleHei} onChange={e => setVehicleHei(e.target.value)} placeholder="e.g. 2550" style={inputStyle} />
                    </div>
                  </div>
                  <button type="submit" className="save-btn" style={{ cursor: 'pointer', marginTop: '10px' }}>Create Chassis</button>
                </form>
              </div>
            )}

            {/* 3. ADD EQUIPMENT TAB */}
            {activeTab === 'equipment' && (
              <div className="config-card">
                <div className="config-card-title">🩺 Add New Equipment Item</div>
                <form onSubmit={handleAddEquipment} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Equipment Name *</label>
                      <input type="text" required value={eqName} onChange={e => setEqName(e.target.value)} placeholder="e.g. ECG Machine" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Category *</label>
                      <select required value={eqCatId} onChange={e => setEqCatId(e.target.value)} style={inputStyle}>
                        {catalog?.categories.map(c => (
                          <option key={c.id} value={c.id} style={{color: '#000'}}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Brand *</label>
                      <select required value={eqBrandId} onChange={e => setEqBrandId(e.target.value)} style={inputStyle}>
                        {catalog?.brands.map(b => (
                          <option key={b.id} value={b.id} style={{color: '#000'}}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>SKU *</label>
                      <input type="text" required value={eqSku} onChange={e => setEqSku(e.target.value)} placeholder="e.g. BPL-ECG-101" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>HSN Code *</label>
                      <input type="text" required value={eqHsn} onChange={e => setEqHsn(e.target.value)} placeholder="e.g. 90181100" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Unit Cost (Rs.) *</label>
                      <input type="number" required value={eqCost} onChange={e => setEqCost(e.target.value)} placeholder="e.g. 60000" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>GST Rate (%) *</label>
                      <select required value={eqGst} onChange={e => setEqGst(e.target.value)} style={inputStyle}>
                        <option value="12" style={{color: '#000'}}>12% (Medical Devices)</option>
                        <option value="18" style={{color: '#000'}}>18% (Furniture/Lighting)</option>
                        <option value="5" style={{color: '#000'}}>5%</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Warranty (Months)</label>
                      <input type="number" value={eqWarranty} onChange={e => setEqWarranty(e.target.value)} placeholder="12" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Stock Status</label>
                      <select value={eqStockStatus} onChange={e => setEqStockStatus(e.target.value)} style={inputStyle}>
                        <option value="in_stock" style={{color: '#000'}}>In Stock</option>
                        <option value="out_of_stock" style={{color: '#000'}}>Out of Stock</option>
                        <option value="lead_time" style={{color: '#000'}}>Lead Time Required</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Stock Quantity</label>
                      <input type="number" value={eqStockQty} onChange={e => setEqStockQty(e.target.value)} placeholder="5" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Lead Time (Days)</label>
                      <input type="number" value={eqLeadTime} onChange={e => setEqLeadTime(e.target.value)} placeholder="0" style={inputStyle} />
                    </div>
                  </div>

                  {/* 3D Placement parameters */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px dashed var(--border-color)', paddingBottom: '8px', marginTop: '10px' }}>3D View Layout Placement</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Mount Point Key</label>
                      <input type="text" value={eqMount} onChange={e => setEqMount(e.target.value)} placeholder="e.g. mount_monitor" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>GLB File Name</label>
                      <input type="text" value={eqModel} onChange={e => setEqModel(e.target.value)} placeholder="e.g. defibrillator.glb" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Pos X (m)</label>
                      <input type="number" step="0.01" value={eqPosX} onChange={e => setEqPosX(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Pos Y (m)</label>
                      <input type="number" step="0.01" value={eqPosY} onChange={e => setEqPosY(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Pos Z (m)</label>
                      <input type="number" step="0.01" value={eqPosZ} onChange={e => setEqPosZ(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Rot X (rad)</label>
                      <input type="number" step="0.01" value={eqRotX} onChange={e => setEqRotX(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Rot Y (rad)</label>
                      <input type="number" step="0.01" value={eqRotY} onChange={e => setEqRotY(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Rot Z (rad)</label>
                      <input type="number" step="0.01" value={eqRotZ} onChange={e => setEqRotZ(e.target.value)} style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Width (mm)</label>
                      <input type="number" value={eqWidth} onChange={e => setEqWidth(e.target.value)} placeholder="e.g. 300" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Height (mm)</label>
                      <input type="number" value={eqHeight} onChange={e => setEqHeight(e.target.value)} placeholder="e.g. 200" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Depth (mm)</label>
                      <input type="number" value={eqDepth} onChange={e => setEqDepth(e.target.value)} placeholder="e.g. 150" style={inputStyle} />
                    </div>
                  </div>

                  {/* Certifications multi select */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Link Certifications</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {catalog?.certifications.map(cert => (
                        <label key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={eqCertIds.includes(cert.id)}
                            onChange={() => handleCertCheckboxChange(cert.id)}
                          />
                          <span>{cert.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({cert.authority})</span></span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={eqMandatory} onChange={e => setEqMandatory(e.target.checked)} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Is AIS-125 Mandatory Item (Locked)?</span>
                    </label>
                  </div>

                  <button type="submit" className="save-btn" style={{ cursor: 'pointer' }}>Create Catalog Item</button>
                </form>
              </div>
            )}

            {/* 4. ADD AMBULANCE PACKAGE TYPE TAB */}
            {activeTab === 'package' && (
              <div className="config-card">
                <div className="config-card-title">📦 Add New Ambulance Package / Type</div>
                <form onSubmit={handleAddAmbulanceType} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Package Name *</label>
                      <input type="text" required value={pkgName} onChange={e => setPkgName(e.target.value)} placeholder="e.g. Coronary Care Unit" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Package Code *</label>
                      <input type="text" required value={pkgCode} onChange={e => setPkgCode(e.target.value)} placeholder="e.g. CCU" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Description</label>
                    <textarea value={pkgDesc} onChange={e => setPkgDesc(e.target.value)} placeholder="Enter details..." style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
                  </div>
                  <button type="submit" className="save-btn" style={{ cursor: 'pointer', marginTop: '10px' }}>Create Package</button>
                </form>
              </div>
            )}

            {/* 5. ADD CONVERSION SPEC TAB */}
            {activeTab === 'spec' && (
              <div className="config-card">
                <div className="config-card-title">🚑 Add Conversion Specification</div>
                <form onSubmit={handleAddConversionSpec} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Select Vehicle Chassis *</label>
                      <select required value={specVehicleId} onChange={e => setSpecVehicleId(e.target.value)} style={inputStyle}>
                        {catalog?.vehicles.map(v => (
                          <option key={v.id} value={v.id} style={{color: '#000'}}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Select Package Type *</label>
                      <select required value={specPackageId} onChange={e => setSpecPackageId(e.target.value)} style={inputStyle}>
                        {catalog?.packages.map(p => (
                          <option key={p.id} value={p.id} style={{color: '#000'}}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Conversion Cost (Rs.) *</label>
                      <input type="number" required value={specCost} onChange={e => setSpecCost(e.target.value)} placeholder="e.g. 200000" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Patient Cabin Length (mm) *</label>
                      <input type="number" required value={specLen} onChange={e => setSpecLen(e.target.value)} placeholder="e.g. 2800" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Patient Cabin Width (mm) *</label>
                      <input type="number" required value={specWid} onChange={e => setSpecWid(e.target.value)} placeholder="e.g. 1600" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Patient Cabin Height (mm) *</label>
                      <input type="number" required value={specHei} onChange={e => setSpecHei(e.target.value)} placeholder="e.g. 1750" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Compartment Volume (L)</label>
                      <input type="number" value={specVol} onChange={e => setSpecVol(e.target.value)} placeholder="e.g. 7800" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Payload Capacity (kg)</label>
                      <input type="number" value={specPayload} onChange={e => setSpecPayload(e.target.value)} placeholder="e.g. 800" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Aux Battery Capacity (Ah)</label>
                      <input type="number" value={specElec} onChange={e => setSpecElec(e.target.value)} placeholder="e.g. 100" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Oxygen Mounting Vol. (L)</label>
                      <input type="number" value={specOxy} onChange={e => setSpecOxy(e.target.value)} placeholder="e.g. 90" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Cabin HVAC Unit Type</label>
                      <input type="text" value={specHvac} onChange={e => setSpecHvac(e.target.value)} placeholder="e.g. Dual Zone Climate AC" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Build Specifications Memo</label>
                      <input type="text" value={specDesc} onChange={e => setSpecDesc(e.target.value)} placeholder="e.g. Standard Winger BLS build Spec" style={inputStyle} />
                    </div>
                  </div>

                  {/* Spec Features multiselect */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Cabin Shell Features</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {catalog?.features.map(f => (
                        <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={specFeatureIds.includes(f.id)}
                            onChange={() => handleFeatureCheckboxChange(f.id)}
                          />
                          <span>{f.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Spec default equipment multiselect */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Bundled Default Equipment</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {catalog?.equipment.map(eq => (
                        <label key={eq.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={specEqIds.includes(eq.id)}
                            onChange={() => handleDefaultEqCheckboxChange(eq.id)}
                          />
                          <span>{eq.name} <span style={{ color: 'var(--text-muted)' }}>(SKU: {eq.sku} | Cost: Included in package)</span></span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="save-btn" style={{ cursor: 'pointer', marginTop: '10px' }}>Create Specification</button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-color)',
  color: '#fff',
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  outline: 'none',
  marginTop: '4px'
};

export default AdminDashboard;
