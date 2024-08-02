import { IUser } from '@/interfaces/user';
import { useEffect, useState, useRef, RefObject } from 'react';

const UserStream: React.FC<{ user: IUser, videoReference: RefObject<HTMLVideoElement> }> = ({ user, videoReference }) => {
  return (
    <div className="">
      <h3 className="">{user.name}</h3>
      {videoReference != null && (
        <video
          autoPlay
          ref={videoReference}
          style={{ width: '100%', maxWidth: '600px' }}
        />
      )}

    </div>
  );
};

export default UserStream;