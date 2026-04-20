/**
 * useSerialPort.js
 * Hook untuk mengelola koneksi Web Serial API dan Video Stream.
 * Menangani mode simulasi (webcam) dan mode real (hardware serial + MJPEG stream).
 */

import { useState, useRef, useEffect } from 'react';

export function useSerialPort({ droneMode, setAlertPopup, setCockpitWarning }) {
  // Telemetry / Serial
  const [telemBaud, setTelemBaud] = useState('57600');
  const [isTelemConnected, setIsTelemConnected] = useState(false);
  const serialPortRef = useRef(null);
  const serialReaderRef = useRef(null);

  // Video Stream
  const [videoIp, setVideoIp] = useState('192.168.1.100');
  const [isVideoConnected, setIsVideoConnected] = useState(false);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = useRef(null);

  // --- WEB SERIAL API ---
  const handleConnectTelemetry = async () => {
    if (isTelemConnected) {
      try {
        if (serialReaderRef.current) await serialReaderRef.current.cancel();
        if (serialPortRef.current) await serialPortRef.current.close();
      } catch (e) {
        console.error(e);
      } finally {
        serialPortRef.current = null;
        serialReaderRef.current = null;
        setIsTelemConnected(false);
        setCockpitWarning('Telemetri Terputus');
        setTimeout(() => setCockpitWarning(''), 3000);
      }
    } else {
      if (droneMode === 'simulasi') {
        setIsTelemConnected(true);
        setCockpitWarning('Simulasi Telemetri Aktif!');
        setTimeout(() => setCockpitWarning(''), 3000);
      } else if (droneMode === 'real') {
        try {
          if (!('serial' in navigator)) {
            setAlertPopup({ title: 'Tidak Didukung', message: 'Browser ini tidak mendukung Web Serial API.' });
            return;
          }
          const port = await navigator.serial.requestPort();
          await port.open({ baudRate: parseInt(telemBaud) });
          serialPortRef.current = port;
          setIsTelemConnected(true);
          setCockpitWarning('Hardware Serial Terhubung!');
          setTimeout(() => setCockpitWarning(''), 3000);
        } catch (error) {
          let msg = error.message || 'Gagal mengakses perangkat serial.';
          if (error.name === 'SecurityError') {
            msg = 'Akses diblokir. Beralih ke mode simulasi.';
            setIsTelemConnected(true);
          } else if (error.name === 'NotFoundError') {
            msg = 'Tidak ada perangkat USB/Serial yang dipilih.';
          }
          setAlertPopup({ title: 'Info Koneksi', message: msg });
        }
      } else {
        setCockpitWarning('Pilih Mode Sistem Dahulu!');
        setTimeout(() => setCockpitWarning(''), 3000);
      }
    }
  };

  // --- VIDEO STREAM ---
  const handleConnectVideo = () => {
    if (isVideoConnected) {
      setIsVideoConnected(false);
      setLiveStreamUrl('');
      if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
        setWebcamStream(null);
      }
    } else {
      if (droneMode === 'simulasi') {
        setIsVideoConnected(true);
      } else if (droneMode === 'real') {
        setLiveStreamUrl(`http://${videoIp}:81/stream`);
        setIsVideoConnected(true);
      } else {
        setCockpitWarning('Pilih Mode Sistem Dahulu!');
        setTimeout(() => setCockpitWarning(''), 3000);
      }
    }
  };

  // Webcam laptop sebagai dummy kamera simulasi
  useEffect(() => {
    if (droneMode === 'simulasi' && isVideoConnected) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => setWebcamStream(s))
        .catch(() => {
          setAlertPopup({ title: 'Webcam Tidak Terdeteksi', message: 'Gagal mengakses webcam. Pastikan tidak digunakan aplikasi lain.' });
          setIsVideoConnected(false);
        });
    }
    if (!isVideoConnected && webcamStream) {
      webcamStream.getTracks().forEach(t => t.stop());
      setWebcamStream(null);
    }
  }, [droneMode, isVideoConnected]);

  // Sync webcam stream ke video element
  useEffect(() => {
    if (videoRef.current && webcamStream) videoRef.current.srcObject = webcamStream;
  }, [webcamStream]);

  return {
    // Telemetry
    telemBaud, setTelemBaud,
    isTelemConnected, setIsTelemConnected,
    serialPortRef, serialReaderRef,
    handleConnectTelemetry,
    // Video
    videoIp, setVideoIp,
    isVideoConnected, setIsVideoConnected,
    liveStreamUrl, setLiveStreamUrl,
    webcamStream, videoRef,
    handleConnectVideo,
  };
}
