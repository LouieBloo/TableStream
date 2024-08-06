"use client";

import UserStream from '@/components/userStream/userStream';
import React, { useEffect, useState } from 'react';
import LocalUserStream from '../../components/userStream/localUserStream';
import { webrtcService } from '../../services/webRTCService';
import RemoteUserStream from '../../components/userStream/remoteUserStream';

const Home: React.FC = () => {

  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('')
  const [joined, setJoined] = useState(false);
  const [remoteUserIds, setRemoteUserIds] = useState<string[]>([]);


  const joinRoom = () => {
    if (roomName) {
      webrtcService.joinRoom(roomName, playerName);
      setJoined(true);
    }
  };

  const streamAdded = (id) => {
    console.log("page added: ", id)
    setRemoteUserIds((prevIds) => [...prevIds, id]);
  }

  useEffect(() => {
    webrtcService.subscribeToStreamAdd(streamAdded);

    webrtcService.setOnStreamRemoved((id) => {
      setRemoteUserIds((prevIds) => prevIds.filter((userId) => userId !== id));
    });

    return () => {
      webrtcService.unSubscribeToStreamAdd(streamAdded);
    }; 
  }, []);

  console.log(remoteUserIds)

  return (
    <>
      <div>
        {!joined ? (
          <div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name"
            />
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
            />
            <button onClick={joinRoom}>Join Room</button>
          </div>
        ) : (


          <div className="w-screen h-screen flex flex-wrap">
            <div className="w-1/2  bg-red-500">
              <LocalUserStream></LocalUserStream>
            </div>
            {remoteUserIds.map((id) => (
              <div key={id} className="w-1/2   bg-green-500">
                <RemoteUserStream socketId={id} />
              </div>
            ))}
          </div>



        )}
      </div>

      {/* <div className='flex h-[50vh] items-stretch'>
        <div className="w-1/2  bg-red-500">
          <LocalUserStream></LocalUserStream>
        </div>

        <div className="w-1/2   bg-green-500">
          <UserStream user={{ name: "Alex" }}></UserStream>
        </div>
      </div> */}

      {/* <div className='flex h-[50vh] items-stretch'>
        <div className="w-1/2  bg-red-500">
          <UserStream user={{ name: "Luke" }}></UserStream>
        </div>

        <div className="w-1/2   bg-green-500">
          <UserStream user={{ name: "Alex" }}></UserStream>
        </div>
      </div> */}




    </>
  );
};

export default Home;