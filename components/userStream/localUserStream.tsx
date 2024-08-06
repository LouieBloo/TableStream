import React, { useEffect, useRef } from 'react';
import { webrtcService } from '../../services/webRTCService';

const LocalUserStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    webrtcService.initLocalStream().then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });
  }, []);

  return <video ref={videoRef} autoPlay muted style={{ width: '100%', height: '100%' }} />;
};

export default LocalUserStream;
