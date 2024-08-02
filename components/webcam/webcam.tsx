import { useEffect, useState, useRef } from 'react';

interface DeviceInfo {
  deviceId: string;
  label: string;
}

const WebcamComponent: React.FC = () => {
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices)
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput') as MediaDeviceInfo[];
        const formattedDevices = videoInputDevices.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${videoDevices.length + 1}`,
        }));
        setVideoDevices(formattedDevices);
        if (formattedDevices.length > 0) {
          setSelectedDeviceId(formattedDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    };

    getVideoDevices();
  }, []);

  useEffect(() => {
    const getVideoStream = async () => {
      if (selectedDeviceId && videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: selectedDeviceId } },
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error('Error accessing the camera.', error);
        }
      }
    };

    getVideoStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId]);

  const handleDeviceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
  };

  return (
    <div>
      <h2>Webcam Component</h2>
      {videoDevices.length > 0 ? (
        <div>
          <select onChange={handleDeviceChange} value={selectedDeviceId}>
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
          <div>
            <video
              autoPlay
              ref={videoRef}
              style={{ width: '100%', maxWidth: '600px' }}
            />
          </div>
        </div>
      ) : (
        <p>No video devices found.</p>
      )}
    </div>
  );
};

export default WebcamComponent;
