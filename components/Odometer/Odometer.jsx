'use client';
import dynamic from 'next/dynamic';
import './odometer-theme.css';

export const Odometer = dynamic(() => import('react-odometerjs'), {
  ssr: false,
});
