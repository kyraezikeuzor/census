import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '@core/store';
import * as THREE from 'three';
import type { ColorRepresentation } from 'three';

type Props = {
    theme: 'dark' | 'light';
};

export const MainScene: React.FC<Props> = ({ theme }) => {
    const mode = useStore(state => state.visualMode);
    const spectrum = useStore(state => state.audioSpectrum);
    const instancedRef = useRef<THREE.InstancedMesh>(null);
    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const palette = useMemo<ColorRepresentation[]>(
        () => [
            '#1d4ed8',
            '#4338ca',
            '#6d28d9',
            '#8b5cf6',
            '#c026d3',
            '#e11d48',
            '#f97316',
            '#facc15',
        ],
        []
    );
    const { gl } = useThree();

    useEffect(() => {
        gl.setClearColor(theme === 'light' ? '#f8fafc' : '#000000', 1);
    }, [gl, theme]);

    useFrame((state, delta) => {
        if (!instancedRef.current) return;
        const bins = spectrum.length > 0 ? spectrum : new Array(96).fill(0);
        const count = Math.min(bins.length, 96);
        const width = 12;
        const spacing = width / count;
        for (let i = 0; i < count; i += 1) {
            const value = bins[i] ?? 0;
            const height = 0.2 + value * 3.2;
            const x = -width / 2 + i * spacing + spacing / 2;
            // Centered waveform (no flat bottom)
            tempObject.position.set(x, 0, 0);
            tempObject.scale.set(spacing * 0.6, height, 0.4);
            tempObject.updateMatrix();
            instancedRef.current.setMatrixAt(i, tempObject.matrix);
        }
        instancedRef.current.instanceMatrix.needsUpdate = true;
    });

    const colors = useMemo(() => {
        const count = 96;
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i += 1) {
            const t = i / (count - 1);
            const idx = Math.floor(t * (palette.length - 1));
            const color = new THREE.Color(palette[idx]);
            arr[i * 3] = color.r;
            arr[i * 3 + 1] = color.g;
            arr[i * 3 + 2] = color.b;
        }
        return arr;
    }, [palette]);

    return (
        <group>
            <ambientLight intensity={0.7} />
            <pointLight position={[3, 5, 4]} intensity={1.1} />
            <pointLight position={[-3, 3, -4]} intensity={0.6} />

            <instancedMesh ref={instancedRef} args={[undefined, undefined, 96]}>
                <boxGeometry args={[1, 1, 1]}>
                    <instancedBufferAttribute
                        attach="attributes-color"
                        args={[colors, 3]}
                    />
                </boxGeometry>
                <meshStandardMaterial
                    vertexColors
                    emissive={mode === 'ALERT' ? new THREE.Color('#ff3355') : new THREE.Color('#0b0b0f')}
                    emissiveIntensity={mode === 'ALERT' ? 0.6 : 0.25}
                    roughness={0.4}
                    metalness={0.2}
                />
            </instancedMesh>
        </group>
    );
};
