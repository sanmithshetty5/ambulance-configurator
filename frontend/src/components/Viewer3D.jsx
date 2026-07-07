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
const AmbulanceScene = ({ instances, selectedVehicle, onMountLimitsUpdate }) => {
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

  // Base dimensions of the 3D model (Tata Winger real-world exterior dims)
  const BASE_LENGTH = 4940; // Blender X
  const BASE_WIDTH = 1950;  // Blender Y (Three Z)
  const BASE_HEIGHT = 2670; // Blender Z (Three Y)
  
  // Calculate scale factors based on the user's explicit Blender mapping:
  // Three.js X = Blender X (Length)
  // Three.js Y = Blender Z (Height)
  // Three.js Z = Blender Y (Width)
  const scaleX = selectedVehicle?.length_mm ? selectedVehicle.length_mm / BASE_LENGTH : 1;
  const scaleY = selectedVehicle?.height_mm ? selectedVehicle.height_mm / BASE_HEIGHT : 1;
  const scaleZ = selectedVehicle?.width_mm ? selectedVehicle.width_mm / BASE_WIDTH : 1;

  return (
    // Your model is already upright under identity scale/rotation
    <group rotation={[0, 0, 0]} scale={[1, 1, 1]}>
      {/* Base Ambulance Shell scaled dynamically to match physical DB specs */}
      <Clone object={scene} scale={[scaleX, scaleY, scaleZ]} />

      {/* Render equipment instances using DB coordinates or Blender empties */}
      {Object.entries(groupedInstances).map(([prefix, items]) => {
        const availableSlots = mounts[prefix] || [];
        
        return items.map((item, index) => {
          let pos, rot;
          
          const slot = availableSlots[index];
          if (slot) {
            // Priority: Mount to exact empty nodes from Blender if they exist.
            // We scale the empty's position by the dynamic vehicle scale factors.
            pos = [
              slot.position[0] * scaleX,
              slot.position[1] * scaleY,
              slot.position[2] * scaleZ
            ];
            // Do not override the empty's rotation, keep it as defined in Blender
            rot = slot.rotation;
          } else {
            // Fallback: Use DB offset logic
            const spacing = item.depth_mm ? (item.depth_mm / 1000) + 0.1 : 0.4;
            const instanceOffset = index * spacing;
            
            pos = [
              (item.position_x || 0) * scaleX,
              (item.position_y || 0) * scaleY,
              ((item.position_z || 0) + instanceOffset) * scaleZ
            ];
            
            rot = [
              item.rotation_x || 0,
              item.rotation_y || 0,
              item.rotation_z || 0
            ];
          }

          return (
            <Suspense key={item.instanceId} fallback={null}>
              <EquipmentFixed
                modelFile={item.modelFile}
                position={pos}
                rotation={rot}
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

const Viewer3D = ({ instances, selectedVehicle, onMountLimitsUpdate }) => {
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
                selectedVehicle={selectedVehicle}
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
