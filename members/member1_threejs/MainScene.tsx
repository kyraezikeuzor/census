import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '@core/store';

export const MainScene: React.FC = () => {
    const meshRef = useRef<any>(null);
    const mode = useStore(state => state.visualMode);

    useFrame((state, delta) => {
        if (meshRef.current) {
            const speed = mode === 'AD' ? 2 : (mode === 'ALERT' ? 10 : 0.5);
            meshRef.current.rotation.x += delta * speed;
            meshRef.current.rotation.y += delta * speed;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={mode === 'ALERT' ? '#ff0000' : (mode === 'AD' ? '#4f46e5' : '#hotpink')}
                emissive={mode === 'ALERT' ? '#330000' : '#000000'}
            />
        </mesh>
    );
};
