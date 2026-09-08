'use client';

import React, { useRef, useState, useEffect, Suspense, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Abstract 3D Floating Geometry with Monochromatic Red Shader & Silhouette Effect
 * Reads state.pointer from R3F frame loop directly to eliminate React component re-renders.
 */
const AbstractRedObject = memo(function AbstractRedObject() {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Slow cinematic rotation for silhouette depth
    meshRef.current.rotation.x += delta * 0.18;
    meshRef.current.rotation.y += delta * 0.28;
    meshRef.current.rotation.z += delta * 0.08;

    // Subtle interactive mouse parallax via zero-overhead internal state.pointer
    if (state && state.pointer) {
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        state.pointer.x * 0.6,
        0.05
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        state.pointer.y * 0.6,
        0.05
      );
    }

    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.22;
      innerRef.current.rotation.y -= delta * 0.35;
    }
  });

  return (
    <Float
      speed={2.2}
      rotationIntensity={0.8}
      floatIntensity={1.4}
      floatingRange={[-0.2, 0.2]}
    >
      <group ref={meshRef}>
        {/* Outer Abstract Distorted Geometry */}
        <mesh castShadow receiveShadow>
          <torusKnotGeometry args={[1.3, 0.42, 180, 40, 2, 3]} />
          <MeshDistortMaterial
            color="#140203"
            emissive="#ff002b"
            emissiveIntensity={0.65}
            roughness={0.12}
            metalness={0.92}
            distort={0.28}
            speed={1.6}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            wireframe={false}
          />
        </mesh>

        {/* Inner Luminous Core */}
        <mesh ref={innerRef} scale={0.75}>
          <icosahedronGeometry args={[0.9, 2]} />
          <meshStandardMaterial
            color="#ff0033"
            emissive="#ff0040"
            emissiveIntensity={2.5}
            roughness={0.2}
            metalness={0.8}
            wireframe={true}
          />
        </mesh>
      </group>
    </Float>
  );
});

/**
 * Dramatic Monochromatic Red Lighting Rig & Backlight
 */
const RedCinematicLighting = memo(function RedCinematicLighting() {
  return (
    <>
      {/* Deep Dark Ambient Base */}
      <ambientLight intensity={0.15} color="#330005" />

      {/* Primary Intense Monochromatic Key Red Light */}
      <directionalLight
        position={[4, 5, 3]}
        intensity={3.8}
        color="#ff0838"
        castShadow
      />

      {/* Strong Saturated Red Backlight / Rim Light for Dramatic Silhouette */}
      <spotLight
        position={[0, -2, -4]}
        target-position={[0, 0, 0]}
        intensity={9.5}
        color="#ff002f"
        angle={0.7}
        penumbra={0.9}
        distance={12}
      />

      {/* Secondary Edge Glow */}
      <pointLight position={[-4, 3, -2]} intensity={4.2} color="#ff0055" />
      <pointLight position={[3, -3, 2]} intensity={2.5} color="#990018" />
    </>
  );
});

/**
 * Background Canvas Scene (Heavy WebGL Scene - Memoized)
 */
const SceneCanvas = memo(function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#040102',
      }}
    >
      <color attach="background" args={['#040102']} />
      <fog attach="fog" args={['#040102', 4, 9]} />

      <RedCinematicLighting />

      <Suspense fallback={null}>
        <AbstractRedObject />
      </Suspense>
    </Canvas>
  );
});

/**
 * ThreeScene Main Export (Strictly Client-Side Safe & Performance-Optimized)
 */
function ThreeScene({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === 'undefined') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#040102',
          zIndex: 0,
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100%', overflowX: 'hidden', overflowY: 'visible' }}>
      {/* 3D Background Canvas (Zero React state overhead) */}
      <SceneCanvas />

      {/* UI Overlay Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          minHeight: '100%',
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default memo(ThreeScene);
