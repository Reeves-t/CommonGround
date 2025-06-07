import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const GlobeCanvas = ({ 
  countries, 
  zoom,
  onCountryClick,
  processedCountries 
}) => {
  const globeEl = useRef();
  const [globeReady, setGlobeReady] = useState(false);

  useEffect(() => {
    if (globeEl.current && !globeReady) {
      setGlobeReady(true);
      
      // Smooth controls
      const controls = globeEl.current.controls();
      controls.enableZoom = true;
      controls.enablePan = true;
      controls.enableRotate = true;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.3;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.4;
      controls.zoomSpeed = 0.6;
      controls.minDistance = 200;
      controls.maxDistance = 800;
      
      // Add zoom event listener
      controls.addEventListener('change', () => {
        if (globeEl.current) {
          const distance = globeEl.current.camera().position.distanceTo(controls.target);
          const newZoom = Math.max(0.5, 2.5 - (distance / 500));
        }
      });

      // === Enhanced Lighting Setup for Metallic Look ===
      const scene = globeEl.current.scene();
      
      // Clear existing lights
      const existingLights = scene.children.filter(child => child.type.includes('Light'));
      existingLights.forEach(light => scene.remove(light));

      // Main directional light (creates strong metallic shine)
      const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
      mainLight.position.set(8, 5, 8);
      mainLight.castShadow = true;
      scene.add(mainLight);

      // Soft ambient light for overall illumination
      const ambientLight = new THREE.AmbientLight(0x2a2a2a, 0.4);
      scene.add(ambientLight);

      // Secondary light for metallic highlights
      const fillLight = new THREE.DirectionalLight(0xc0c0c0, 1.2);
      fillLight.position.set(-5, 3, -5);
      scene.add(fillLight);

      // Rim light for edge definition
      const rimLight = new THREE.DirectionalLight(0x808080, 0.8);
      rimLight.position.set(-3, -2, 4);
      scene.add(rimLight);

      // === Add Ocean Shine Effect ===
      const glowGeometry = new THREE.SphereGeometry(100.5, 64, 64);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          c: { type: 'f', value: 0.8 },
          p: { type: 'f', value: 2.5 },
          glowColor: { type: 'c', value: new THREE.Color(0x333333) },
          viewVector: { type: 'v3', value: globeEl.current.camera().position }
        },
        vertexShader: `
          uniform vec3 viewVector;
          uniform float c;
          uniform float p;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(c - dot(vNormal, vNormel), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4(glow, intensity * 0.6);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      
      const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
      scene.add(glowMesh);

      // === Animate the glow ===
      const animate = () => {
        if (glowMaterial.uniforms.viewVector) {
          glowMaterial.uniforms.viewVector.value = globeEl.current.camera().position;
        }
        requestAnimationFrame(animate);
      };
      animate();
    }
  }, [globeReady]);

  // Enhanced label sizing based on zoom and importance
  const getLabelSize = (country) => {
    const baseSize = country.baseSize || 0.4;
    const importance = country.importance || 1;
    const zoomFactor = Math.max(0.8, Math.min(2.5, zoom || 1));
    return baseSize * importance * zoomFactor;
  };

  // Better label visibility
  const shouldShowLabel = (country) => {
    if (!country.shouldShow) return false;
    const distance = globeEl.current?.camera()?.position?.distanceTo(new THREE.Vector3(0, 0, 0)) || 300;
    const importance = country.importance || 1;
    return distance < 500 || importance > 1.2;
  };

  // Handle polygon hover
  const handlePolygonHover = (polygon) => {
    if (!globeEl.current) return;
    
    const altitude = polygon ? 0.025 : 0.012;
    globeEl.current.scene().children.forEach(child => {
      if (child.type === 'Mesh' && child.__globeObjType === 'polygon') {
        child.scale.z = altitude + (child.__data?.properties?.importance || 1) * 0.006;
      }
    });
  };

  return (
    <Globe
      ref={globeEl}
      // Dark black ocean with shine
      globeImageUrl="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMDI0IDUxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMjQiIGhlaWdodD0iNTEyIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo="
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl={null}
      
      // Metallic grey countries with elevation
      polygonsData={countries}
      polygonCapColor={() => '#8A8A8A'} // Metallic grey top surface
      polygonSideColor={() => '#5A5A5A'} // Darker grey for sides
      polygonStrokeColor={() => 'rgba(200, 200, 200, 0.8)'} // Light grey borders
      polygonAltitude={0.012}
      onPolygonClick={onCountryClick}
      onPolygonHover={handlePolygonHover}
      
      // Enhanced labels for metallic theme
      labelsData={processedCountries?.filter(shouldShowLabel) || []}
      labelLat={d => d.centroid?.[1] || 0}
      labelLng={d => d.centroid?.[0] || 0}
      labelText={d => d.properties?.name || ''}
      labelSize={getLabelSize}
      labelColor={() => '#E0E0E0'} // Light grey text for contrast
      labelResolution={4}
      labelAltitude={0.025}
      labelRotation={0}
      labelIncludeDot={false}
      labelTypeFace={{
        family: 'Inter, Segoe UI, Arial, sans-serif',
        weight: 'normal'
      }}
      
      // Dark atmosphere
      backgroundColor="rgba(0,0,0,0)"
      atmosphereColor="#1A1A1A" // Very dark grey atmosphere
      atmosphereAltitude={0.08}
      
      // Performance and display
      width={window.innerWidth}
      height={window.innerHeight}
      rendererConfig={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }}
      
      enablePointerInteraction={true}
      pointerEventsFilter={() => true}
    />
  );
};

export default GlobeCanvas; 