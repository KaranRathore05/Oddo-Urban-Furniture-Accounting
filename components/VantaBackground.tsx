"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function VantaBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  const initVanta = () => {
    if (!vantaEffect && vantaRef.current && (window as any).VANTA) {
      try {
        const effect = (window as any).VANTA.FOG({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0x11ff,
          midtoneColor: 0xd25cc,
          lowlightColor: 0x6c39ed,
          baseColor: 0xffffff,
        });
        setVantaEffect(effect);
      } catch (e) {
        console.error("Vanta error:", e);
      }
    }
  };

  useEffect(() => {
    // Attempt initialization periodically in case Script takes a bit
    const interval = setInterval(() => {
      if ((window as any).VANTA && !vantaEffect) {
        initVanta();
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"
        strategy="afterInteractive"
        onLoad={initVanta}
      />
      <div
        ref={vantaRef}
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        {children}
      </div>
    </>
  );
}
