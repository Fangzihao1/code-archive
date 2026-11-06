"use client";

import { useEffect, useRef } from "react";

type Glow = {
  x: number; y: number; vx: number; vy: number; radius: number;
  hue: number; phase: number; strength: number;
};

export default function HeroGlowField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastTime = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerInside = false;
    let mainX = 0;
    let mainY = 0;
    let ripple = 0;
    let previousNear = new Set<number>();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const glows: Glow[] = [
      { x: .23, y: .24, vx: .000075, vy: .000052, radius: 760, hue: 210, phase: .3, strength: .78 },
      { x: .69, y: .25, vx: -.000062, vy: .000068, radius: 680, hue: 278, phase: 1.7, strength: .72 },
      { x: .82, y: .68, vx: -.00007, vy: -.000052, radius: 820, hue: 174, phase: 2.8, strength: .68 },
      { x: .43, y: .76, vx: .000058, vy: -.000068, radius: 650, hue: 330, phase: 4.2, strength: .64 },
      { x: .56, y: .48, vx: -.000052, vy: .00006, radius: 620, hue: 42, phase: 5.1, strength: .58 },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!mainX || !mainY) {
        mainX = width * .5;
        mainY = height * .45;
        pointerX = mainX;
        pointerY = mainY;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerInside = pointerX >= 0 && pointerY >= 0 && pointerX <= rect.width && pointerY <= rect.height;
    };

    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) pointerInside = false;
    };

    const paintGlow = (x: number, y: number, radius: number, hue: number, alpha: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `hsla(${hue}, 94%, 70%, ${alpha})`);
      gradient.addColorStop(.28, `hsla(${hue}, 92%, 73%, ${alpha * .48})`);
      gradient.addColorStop(1, `hsla(${hue}, 90%, 75%, 0)`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    };

    const draw = (time: number) => {
      const delta = Math.min(32, lastTime ? time - lastTime : 16);
      lastTime = time;
      context.clearRect(0, 0, width, height);

      const targetX = pointerInside ? pointerX : width * .5;
      const targetY = pointerInside ? pointerY : height * .45;
      const ease = reduceMotion ? 1 : .095;
      mainX += (targetX - mainX) * ease;
      mainY += (targetY - mainY) * ease;

      const activeCollisions = new Set<number>();
      if (!reduceMotion) {
        glows.forEach((glow, index) => {
          glow.phase += delta * .00045;
          glow.x += glow.vx * delta + Math.sin(glow.phase) * .00032 * delta;
          glow.y += glow.vy * delta + Math.cos(glow.phase * .83) * .00028 * delta;
          if (glow.x < .08 || glow.x > .92) glow.vx *= -1;
          if (glow.y < .12 || glow.y > .88) glow.vy *= -1;

          const gx = glow.x * width;
          const gy = glow.y * height;
          const dx = gx - mainX;
          const dy = gy - mainY;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const collisionRange = glow.radius * .52 + 52;
          if (pointerInside && distance < collisionRange) {
            activeCollisions.add(index);
            const force = (collisionRange - distance) / collisionRange;
            // Gentle repulsion: nearby glows drift apart instead of shooting away.
            glow.vx += (dx / distance) * force * .000035;
            glow.vy += (dy / distance) * force * .000035;
            glow.vx = Math.max(-.00008, Math.min(.00008, glow.vx));
            glow.vy = Math.max(-.00008, Math.min(.00008, glow.vy));
          }
          glow.vx *= .9992;
          glow.vy *= .9992;
        });
      }

      glows.forEach((glow, index) => {
        const colliding = activeCollisions.has(index);
        const pulse = reduceMotion ? 1 : 1 + Math.sin(time * .00055 + glow.phase) * .055;
        paintGlow(glow.x * width, glow.y * height, glow.radius * pulse * (colliding ? 1.1 : 1), glow.hue, glow.strength * (colliding ? .46 : .36));
      });

      if (pointerInside) {
        paintGlow(mainX, mainY, 560, 211, .34);
        paintGlow(mainX, mainY, 285, 205, .25);
        context.beginPath();
        context.arc(mainX, mainY, 17, 0, Math.PI * 2);
        context.strokeStyle = "rgba(74, 139, 232, .22)";
        context.lineWidth = 1;
        context.stroke();
      }

      if (activeCollisions.size && !reduceMotion) {
        if (!previousNear.size) ripple = 1;
        context.beginPath();
        context.arc(mainX, mainY, 26 + (1 - ripple) * 64, 0, Math.PI * 2);
        context.strokeStyle = `rgba(91, 157, 245, ${.2 * ripple})`;
        context.lineWidth = 1.2;
        context.stroke();
        ripple = Math.max(0, ripple - delta * .0018);
      }
      previousNear = activeCollisions;
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerOut);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-glow-field" aria-hidden="true" />;
}
