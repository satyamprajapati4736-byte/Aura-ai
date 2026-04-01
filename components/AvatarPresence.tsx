
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AvatarPresenceProps {
  isSpeaking: boolean;
  isProcessing: boolean;
  avatarUrl: string;
}

const AvatarPresence: React.FC<AvatarPresenceProps> = ({ isSpeaking, isProcessing }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let scene: THREE.Scene | null = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Anti-Crash: Robust Renderer Initialization
    let renderer: THREE.WebGLRenderer | null = null;
    try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        if (containerRef.current) {
            containerRef.current.appendChild(renderer.domElement);
        }
        rendererRef.current = renderer;
    } catch (e) {
        console.error("WebGL Initialization Failed", e);
        return;
    }

    // --- JARVIS STYLE HOLOGRAPHIC CONSTRUCTION ---

    const nucleusGeo = new THREE.IcosahedronGeometry(0.8, 2);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.9 });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    scene.add(nucleus);

    const innerShellGeo = new THREE.IcosahedronGeometry(2.0, 1);
    const innerShellMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.1 });
    const innerShell = new THREE.Mesh(innerShellGeo, innerShellMat);
    scene.add(innerShell);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createRing = (radius: number, tube: number, radialSegments: number, tubularSegments: number, arc: number) => {
      const geo = new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
      const mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      return new THREE.Mesh(geo, mat);
    };

    const ring1 = createRing(3.5, 0.03, 2, 100, Math.PI * 2);
    ring1.rotation.x = Math.PI / 1.8;
    ringGroup.add(ring1);

    const ring2 = createRing(3.2, 0.04, 2, 80, Math.PI * 1.7);
    ring2.rotation.y = Math.PI / 2;
    ringGroup.add(ring2);

    const ring3 = createRing(2.8, 0.02, 2, 100, Math.PI * 2);
    ring3.rotation.x = Math.PI / 4;
    ringGroup.add(ring3);

    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 250;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
        const r = 4 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        posArray[i] = r * Math.sin(phi) * Math.cos(theta);
        posArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
        posArray[i+2] = r * Math.cos(phi);
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.06, color: 0x10b981, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const particleSystem = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleSystem);

    camera.position.z = 12;

    const clock = new THREE.Clock();

    const animate = () => {
      if (!renderer || !scene) return;
      const time = clock.getElapsedTime();
      
      nucleus.rotation.y = time * 0.5;
      nucleus.rotation.z = time * 0.2;
      innerShell.rotation.y = -time * 0.4;
      innerShell.rotation.x = Math.sin(time * 0.2) * 0.2;

      ring1.rotation.z = time * 0.15;
      ring1.rotation.x = Math.PI / 1.8 + Math.sin(time * 0.5) * 0.1;
      
      ring2.rotation.x = time * 0.3;
      ring2.rotation.z = Math.cos(time * 0.2) * 0.2;
      
      ring3.rotation.y = time * 0.4;
      ring3.rotation.x = Math.PI / 4 + Math.sin(time) * 0.2;

      particleSystem.rotation.y = time * 0.05;

      let energyColor = new THREE.Color(0x10b981);
      let targetScale = 1;
      let targetOpacity = 0.5;

      if (isProcessing) {
        energyColor.setHex(0x0ea5e9);
        nucleus.rotation.y += 0.3; innerShell.rotation.z += 0.2;
        ring1.rotation.z += 0.05; ring2.rotation.x += 0.1;
        targetScale = 1.1; targetOpacity = 0.8;
      } else if (isSpeaking) {
        energyColor.setHex(0x34d399);
        const pulse = Math.sin(time * 15) * 0.15;
        targetScale = 1.2 + pulse;
        nucleus.scale.setScalar(1 + pulse * 2);
        ringGroup.scale.setScalar(1 + Math.sin(time * 8) * 0.05);
        targetOpacity = 0.9;
      } else {
        targetScale = 1 + Math.sin(time * 2) * 0.02;
        nucleus.scale.setScalar(1);
        ringGroup.scale.setScalar(1);
      }

      const lerpFactor = 0.1;
      nucleusMat.color.lerp(energyColor, lerpFactor);
      innerShellMat.color.lerp(energyColor, lerpFactor);
      (ring1.material as THREE.MeshBasicMaterial).color.lerp(energyColor, lerpFactor);
      (ring2.material as THREE.MeshBasicMaterial).color.lerp(energyColor, lerpFactor);
      (ring3.material as THREE.MeshBasicMaterial).color.lerp(energyColor, lerpFactor);
      particleMat.color.lerp(energyColor, lerpFactor);
      (ring1.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp((ring1.material as THREE.MeshBasicMaterial).opacity, targetOpacity, lerpFactor);

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      
      try {
        if (scene) {
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) object.material.forEach((m: THREE.Material) => m.dispose());
                        else object.material.dispose();
                    }
                }
            });
            scene = null;
        }

        if (rendererRef.current) {
            const canvas = rendererRef.current.domElement;
            if (canvas && containerRef.current && containerRef.current.contains(canvas)) {
                containerRef.current.removeChild(canvas);
            }
            rendererRef.current.dispose();
            rendererRef.current = null;
        }
      } catch (e) {
          console.warn("Cleanup warning:", e);
      }
    };
  }, [isSpeaking, isProcessing]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#000d0a]/20 via-transparent to-[#000d0a] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-emerald-500/5 rounded-full pointer-events-none" />
    </div>
  );
};

export default AvatarPresence;
