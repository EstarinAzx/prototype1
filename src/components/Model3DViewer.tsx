import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX } from '@react-three/drei';
import { X } from 'lucide-react';
import * as THREE from 'three';

interface Model3DViewerProps {
    modelPath: string;
    itemName: string;
    onClose: () => void;
}

const Model: React.FC<{ modelPath: string; setDebugInfo: (info: string) => void }> = ({ modelPath, setDebugInfo }) => {
    const fbx = useFBX(modelPath);

    useEffect(() => {
        if (fbx) {
            try {
                // Calculate bounding box
                const box = new THREE.Box3().setFromObject(fbx);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                setDebugInfo(`Loaded! Size: ${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}`);

                // Auto-center
                fbx.position.x = -center.x;
                fbx.position.y = -center.y;
                fbx.position.z = -center.z;

                // Auto-scale to fit in a 5x5x5 box
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                    const scale = 5 / maxDim;
                    fbx.scale.set(scale, scale, scale);
                }

                // Force bright material for debugging
                const debugMaterial = new THREE.MeshStandardMaterial({
                    color: 0x00ff00, // Bright Green
                    side: THREE.DoubleSide,
                    roughness: 0.5,
                    metalness: 0.5
                });

                fbx.traverse((child: any) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = debugMaterial; // OVERRIDE MATERIAL
                    }
                });
            } catch (e: any) {
                setDebugInfo(`Error processing model: ${e.message}`);
            }
        }
    }, [fbx, setDebugInfo]);

    return <primitive object={fbx} />;
};

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelPath, itemName, onClose }) => {
    const [debugInfo, setDebugInfo] = useState<string>("Loading...");

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{
                padding: '20px 30px',
                borderBottom: '1px solid #00f3ff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 243, 255, 0.05)'
            }}>
                <div>
                    <h2 style={{
                        fontFamily: 'Orbitron',
                        color: '#00f3ff',
                        fontSize: '1.5rem',
                        marginBottom: '5px'
                    }}>
                        3D MODEL VIEWER
                    </h2>
                    <p style={{
                        fontFamily: 'Rajdhani',
                        color: '#666',
                        fontSize: '1rem'
                    }}>
                        {itemName}
                    </p>
                    <p style={{ color: 'yellow', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        DEBUG: {debugInfo}
                    </p>
                </div>
                <button onClick={onClose} style={{
                    background: 'transparent',
                    border: '1px solid #ff0055',
                    color: '#ff0055',
                    padding: '8px',
                }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <Canvas camera={{ position: [5, 5, 5], fov: 45 }} style={{ background: '#0a0a0a' }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={1} />
                        <directionalLight position={[10, 10, 10]} intensity={2} />
                        <directionalLight position={[-10, -10, -10]} intensity={1} />
                        <pointLight position={[0, 10, 0]} intensity={1} />

                        <Model modelPath={modelPath} setDebugInfo={setDebugInfo} />

                        <OrbitControls
                            enableZoom={true}
                            enablePan={true}
                            minDistance={2}
                            maxDistance={20}
                            target={[0, 0, 0]}
                        />

                        <gridHelper args={[20, 20, '#00f3ff', '#333']} position={[0, -2.5, 0]} />
                    </Suspense>
                </Canvas>

                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 243, 255, 0.1)',
                    border: '1px solid #00f3ff',
                    padding: '15px 30px',
                    fontFamily: 'Rajdhani',
                    color: '#00f3ff',
                    fontSize: '0.9rem',
                    display: 'flex',
                    gap: '30px'
                }}>
                    <span>🖱️ DRAG TO ROTATE</span>
                    <span>🔍 SCROLL TO ZOOM</span>
                </div>
            </div>
        </div>
    );
};
