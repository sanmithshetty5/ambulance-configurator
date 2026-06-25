import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';

// Individual Equipment Component
const EquipmentModel = ({ modelFile, position, rotation }) => {
  const { scene } = useGLTF(`/models/${modelFile}`);
  
  // Clone the scene so that each equipment piece has its own unique instance in the Three.js tree
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={rotation} 
    />
  );
};

// Ambulance Shell + Mounts Component
const AmbulanceScene = ({ activeEquipmentMap, equipment }) => {
  const { scene } = useGLTF('/models/ambulance_shell.glb');
  const [mounts, setMounts] = useState({});

  useEffect(() => {
    const extractedMounts = {};
    scene.traverse((node) => {
      // Find objects starting with 'mount_'
      if (node.name && node.name.startsWith('mount_')) {
        extractedMounts[node.name] = {
          position: node.position.clone(),
          rotation: node.rotation.clone()
        };
      }
    });
    setMounts(extractedMounts);
  }, [scene]);

  return (
    <group>
      {/* Base Ambulance Shell */}
      <primitive object={scene} />

      {/* Conditionally rendered equipment models at extracted mount coordinates */}
      {equipment.map((item) => {
        const isActive = activeEquipmentMap[item.mount_point];
        const mount = mounts[item.mount_point];
        
        if (!isActive || !mount) return null;
        
        return (
          <EquipmentModel
            key={item.id}
            modelFile={item.model_file}
            position={mount.position}
            rotation={mount.rotation}
          />
        );
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

const Viewer3D = ({ activeEquipmentMap, equipment }) => {
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
                activeEquipmentMap={activeEquipmentMap} 
                equipment={equipment} 
              />
            </Center>

            {/* User controls to Rotate, Pan, Zoom */}
            <OrbitControls 
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
          <span>🖱️ Left Click + Drag to Rotate</span>
          <span>🖱️ Right Click + Drag to Pan</span>
          <span>📜 Scroll to Zoom</span>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Preload the core shell model to improve loading speed
useGLTF.preload('/models/ambulance_shell.glb');

export default Viewer3D;
