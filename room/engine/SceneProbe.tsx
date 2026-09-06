"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
  Temporary diagnostic. Reports the real world-space size of the loaded scene on
  `window.__roomProbe` so the headless screenshotter can read it, because the
  pack's FBX scale is not documented anywhere and guessing at it wastes a cycle
  per guess. Removed once placement is calibrated.
*/
export function SceneProbe() {
  const { scene, camera } = useThree();

  useEffect(() => {
    const report = () => {
      const box = new THREE.Box3();
      const sizes: Record<string, string> = {};
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        box.expandByObject(child);
      });
      // A couple of individual props, to separate "wrong scale" from "wrong place".
      for (const name of ["projects:desk", "wall:back"]) {
        const obj = scene.getObjectByName(name);
        if (obj) {
          const s = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
          sizes[name] = `${s.x.toFixed(2)} x ${s.y.toFixed(2)} x ${s.z.toFixed(2)}`;
        }
      }
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      (window as unknown as { __roomProbe: unknown }).__roomProbe = {
        meshes: scene.children.length,
        size: `${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`,
        center: `${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`,
        camera: `${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}`,
        sizes,
      };
    };
    const timer = window.setInterval(report, 1000);
    return () => window.clearInterval(timer);
  }, [scene, camera]);

  return null;
}
