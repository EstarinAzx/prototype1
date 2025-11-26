import React, { Suspense, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX, Stage } from '@react-three/drei';
import { X } from 'lucide-react';
import * as THREE from 'three';

interface Model3DViewerProps {
    modelPath: string;
    itemName: string;
    onClose: () => void;
}

const Model: React.FC<{ modelPath: string }> = ({ modelPath }) => {
    const fbx = useFBX(modelPath);

    useLayoutEffect(() => {
        fbx.traverse((child: any) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // Apply metallic black material to match the sample image
                child.material = new THREE.MeshStandardMaterial({
                    color: '#1a1a1a', // Dark grey/black
                    roughness: 0.3,
                    metalness: 0.8,
                    side: THREE.DoubleSide
                });
            }
        });
    }, [fbx]);

    return <primitive object={fbx} />;
};

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelPath, itemName, onClose }) => {
    return createPortal(
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
                borderBottom: '1px solid #4ade80',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 243, 255, 0.05)'
            }}>
                <div>
                    <h2 style={{
                        fontFamily: 'Orbitron',
                        color: '#4ade80',
                        fontSize: '1.5rem',
                        marginBottom: '5px'
                    }}>
                        3D MODEL VIEWER
                    </h2>
                    <p style={{
                        fontFamily: 'Orbitron',
                        color: '#666',
                        fontSize: '1rem'
                    }}>
                        {itemName}
                    </p>
                </div>
                <button onClick={onClose} style={{
                    background: 'transparent',
                    border: '1px solid #f59e0b',
                    color: '#f59e0b',
                    padding: '8px',
                    cursor: 'pointer'
                }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }} style={{ background: '#0a0a0a' }}>
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6} adjustCamera={true}>
                            <Model modelPath={modelPath} />
                        </Stage>
                        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
                    </Suspense>
                </Canvas>

                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 243, 255, 0.1)',
                    border: '1px solid #4ade80',
                    padding: '15px 30px',
                    fontFamily: 'Orbitron',
                    color: '#4ade80',
                    fontSize: '0.9rem',
                    display: 'flex',
                    gap: '30px',
                    pointerEvents: 'none'
                }}>
                    <span>🖱️ DRAG TO ROTATE</span>
                    <span>🔍 SCROLL TO ZOOM</span>
                </div>
            </div>
        </div>,
        document.body
    );
};
