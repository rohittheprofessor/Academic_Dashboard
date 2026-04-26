import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  // Parse value to float if it contains decimals, else int
  const numValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isFloat = String(value).includes('.');

  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => {
    return isFloat ? current.toFixed(1) : Math.round(current);
  });

  useEffect(() => {
    spring.set(numValue);
  }, [spring, numValue]);

  return (
    <span className="flex items-baseline">
      {prefix && <span>{prefix}</span>}
      <motion.span>{display}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};
