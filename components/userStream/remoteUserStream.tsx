import React, { useEffect, useState } from 'react';
import { webrtcService } from '../../services/webRTCService';

interface RemoteUserStreamProps {
  socketId: string;
}

const RemoteUserStream: React.FC<RemoteUserStreamProps> = ({ socketId }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    webrtcService.subscribeToStreamAdd(streamAdded);

    webrtcService.setOnStreamRemoved((id) => {
      if (id === socketId) {
        setStream(null);
      }
    });

    let stream = webrtcService.getStream(socketId);
    if(stream){
      setStream(stream);
    }
    
    return () => {
      webrtcService.unSubscribeToStreamAdd(streamAdded);
    };
  }, []);

  const streamAdded = (id:string, newStream: MediaStream) => {
    console.log("remote stream added: ", id)
    if (id === socketId) {
      setStream(newStream);
    }
  } 


  return (
    <video
      autoPlay
      style={{ width: '100%', height: '100%' }}
      ref={(video) => {
        if (video && stream) {
          console.log("Setting remote stream")
          video.srcObject = stream;
        }
      }}
    />
  );
};

export default RemoteUserStream;
