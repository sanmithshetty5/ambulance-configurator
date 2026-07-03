import React, { Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Html, Clone } from '@react-three/drei';

// Individual Equipment Component locked to a specific position
const EquipmentFixed = ({ modelFile, position, rotation }) => {
  const { scene } = useGLTF(`/models/${modelFile}`);
  
  // Applies the exact rotation set on the Empty object in Blender.
  // Scale is set to [1, 1, 1] assuming all models are exported at 1:1 real-world scale.
  return (
    <Clone 
      object={scene} 
      position={position} 
      rotation={rotation || [0, 0, 0]} 
      scale={[1, 1, 1]} 
    />
  );
};

// Ambulance Shell + Mounts Component
const AmbulanceScene = ({ instances, onMountLimitsUpdate }) => {
  const { scene } = useGLTF('/models/ambulance_shell.glb');
  const [mounts, setMounts] = useState({});

  useEffect(() => {
    const extractedMounts = {};
    const limits = {};

    // Force update of the scene matrix to ensure world coordinates are accurate
    scene.updateMatrixWorld(true);

    scene.traverse((node) => {
      // Find objects starting with 'mount_'
      if (node.name && node.name.startsWith('mount_')) {
        const prefixMatch = node.name.match(/^(mount_.*?)_\d+$/);
        const prefix = prefixMatch ? prefixMatch[1] : node.name;

        if (!extractedMounts[prefix]) {
          extractedMounts[prefix] = [];
          limits[prefix] = 0;
        }

        // Extract WORLD position and rotation (ignores how Blender nests the nodes)
        const worldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        const worldEuler = new THREE.Euler();
        
        node.getWorldPosition(worldPos);
        node.getWorldQuaternion(worldQuat);
        worldEuler.setFromQuaternion(worldQuat);

        extractedMounts[prefix].push({
          position: worldPos.toArray(),
          rotation: worldEuler.toArray().slice(0, 3)
        });
        limits[prefix] += 1;
      }
    });

    setMounts(extractedMounts);
    if (onMountLimitsUpdate) {
      onMountLimitsUpdate(limits);
    }
  }, [scene, onMountLimitsUpdate]);

  // Group instances by prefix
  const groupedInstances = {};
  instances.forEach(inst => {
    if (!groupedInstances[inst.mountPoint]) groupedInstances[inst.mountPoint] = [];
    groupedInstances[inst.mountPoint].push(inst);
  });

  return (
    // Your model is already upright under identity scale/rotation
    <group rotation={[0, 0, 0]} scale={[1, 1, 1]}>
      {/* Base Ambulance Shell */}
      <Clone object={scene} />

      {/* Render equipment instances snapped to slots */}
      {Object.entries(groupedInstances).map(([prefix, items]) => {
        const availableSlots = mounts[prefix] || [];
        return items.map((item, index) => {
          const slot = availableSlots[index];
          if (!slot) return null; // Exceeds physical slots

          return (
            <Suspense key={item.instanceId} fallback={null}>
              <EquipmentFixed
                modelFile={item.modelFile}
                position={slot.position}
                rotation={slot.rotation}
              />
            </Suspense>
          );
        });
      })}
    </group>
  );
};

// Loader overlay for React Suspense fallback
const CanvasLoader = () => {
  return (
    <Html center>
      <div className="loading-overlay">
        <div className="spinner"></div>
        <div className="loading-text">LOADING 3D SCENE...</div>
      </div>
    </Html>
  );
};

// Error Boundary for the 3D Viewer
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("3D Viewer Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: '#ffebee', borderRadius: '8px', margin: '20px', border: '1px solid #ef5350' }}>
          <h3>Error loading 3D scene</h3>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Viewer3D = ({ instances, onMountLimitsUpdate }) => {
  return (
    <ErrorBoundary>
      <div className="viewer-container">
        <Canvas
          camera={{ position: [0, 2.5, 5], fov: 50 }}
          shadows
          gl={{ antialias: true }}
        >
          <Suspense fallback={<CanvasLoader />}>
            {/* Ambient Lighting for soft base lighting */}
            <ambientLight intensity={0.4} />
            
            {/* Main Key Directional Light */}
            <directionalLight
              position={[5, 10, 3]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            
            {/* Fill Point Light inside/near the cabin */}
            <pointLight position={[0, 1.5, 0]} intensity={0.8} distance={6} />
            
            {/* Ground Grid Helper */}
            <gridHelper 
              args={[16, 16, '#3b82f6', '#1f2937']} 
              position={[0, 0, 0]} 
            />

            <Center>
              <AmbulanceScene 
                instances={instances} 
                onMountLimitsUpdate={onMountLimitsUpdate}
              />
            </Center>

            {/* User controls to Rotate, Pan, Zoom */}
            <OrbitControls 
              makeDefault
              enablePan={true}
              enableZoom={true}
              minDistance={2}
              maxDistance={12}
              maxPolarAngle={Math.PI / 2 - 0.05}  // Prevent going below ground
              target={[0, 0.5, 0]}
            />
          </Suspense>
        </Canvas>

        <div className="viewer-controls-hint">
          <span>🖱️ Left Click BG + Drag to Rotate</span>
          <span>🖱️ Right Click BG + Drag to Pan</span>
          <span>📜 Scroll to Zoom</span>
          <br/>
          <span>(Objects are automatically snapped to fixed slots)</span>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Preload the core shell model to improve loading speed
useGLTF.preload('/models/ambulance_shell.glb');

export default Viewer3D;
