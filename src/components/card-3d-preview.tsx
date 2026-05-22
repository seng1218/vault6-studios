"use client";

import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

// Preload models for card previews
useGLTF.preload("/models/hero-figurine.glb");
useGLTF.preload("/models/toy-car.glb");

function ModelPreview({ 
  url, 
  color = "#3b82f6" 
}: { 
  url: string; 
  color?: string; 
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  
  // Clone scene so changes don't leak
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        // Futuristic holographic wireframe style
        child.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          wireframe: true,
          transparent: true,
          opacity: 0.8,
        });
      }
    });
  }, [clonedScene, color]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate constantly
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={url.includes("car") ? 1.0 : 1.3} />
    </group>
  );
}

export function Card3DPreview({ 
  category 
}: { 
  category: string 
}) {
  // Select model based on product category
  const modelUrl = useMemo(() => {
    const cat = (category || "").toUpperCase();
    if (cat.includes("FULL CUSTOM") || cat.includes("VEHICLE") || cat.includes("TOY")) {
      return "/models/toy-car.glb";
    }
    return "/models/hero-figurine.glb";
  }, [category]);

  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none select-none">
      {/* Glow highlight behind model */}
      <div className="absolute w-36 h-36 rounded-full bg-v6-accent/10 blur-[30px] animate-pulse" />
      
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-6 h-6 border border-dashed border-v6-accent rounded-full animate-spin" />
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 40 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <Center>
            <ModelPreview url={modelUrl} />
          </Center>
        </Canvas>
      </Suspense>
    </div>
  );
}
export default Card3DPreview;
