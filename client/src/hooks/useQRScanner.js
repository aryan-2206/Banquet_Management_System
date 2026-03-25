import { useEffect } from 'react';

/**
 * useQRScanner — stub for QR scanning functionality
 * In production this would use a library like html5-qrcode
 */
export default function useQRScanner({ onScan } = {}) {
  // In a real implementation, this would initialize a camera QR scanner
  const startScan = () => {
    console.log('[QR Scanner] Start scanning...');
  };

  const stopScan = () => {
    console.log('[QR Scanner] Stop scanning...');
  };

  // Simulate a scan for demo purposes
  const simulateScan = (guestId) => {
    if (onScan) onScan(guestId);
  };

  return { startScan, stopScan, simulateScan };
}
