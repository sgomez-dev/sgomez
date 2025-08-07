import { Html, useProgress } from "@react-three/drei";
import React from "react";

export const Loader = () => {
  const { progress } = useProgress();
  return <Html center>{Math.floor(progress)}% loaded</Html>;
};
