import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX, Stage } from '@react-three/drei';
import { X } from 'lucide-react';

interface Model3DViewerProps {
    modelPath: string;
    itemName: string;
    onClose: () => void;
}

const Model: React.FC<{ modelPath: string }> = ({ modelPath }) => {
    const fbx = useFBX(modelPath);
    return <primitive object={fbx} />;
};

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelPath, itemName, onClose }) => {
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
                </div>
                <button onClick={onClose} style={{
                    background: 'transparent',
                    border: '1px solid #ff0055',
                    color: '#ff0055',
                    padding: '8px',
                    cursor: 'pointer'
                }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }} style={{ background: '#0a0a0a' }}>
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6}>
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
                    border: '1px solid #00f3ff',
                    padding: '15px 30px',
                    fontFamily: 'Rajdhani',
                    color: '#00f3ff',
                    fontSize: '0.9rem',
                    display: 'flex',
                    gap: '30px',
                    pointerEvents: 'none'
                }}>
                    <span>🖱️ DRAG TO ROTATE</span>
                    <span>🔍 SCROLL TO ZOOM</span>
                </div>
            </div>
        </div>
    );
};
