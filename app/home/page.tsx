import UserStream from '@/components/userStream/userStream';
import React from 'react';

const Home: React.FC = () => {












  
  return (
    <>

      <div className='flex h-[50vh] items-stretch'>
        {/* <WebcamComponent /> */}
        <div className="w-1/2  bg-red-500">
          <UserStream user={{ name: "Luke" }}></UserStream>
        </div>

        <div className="w-1/2   bg-green-500">
          <UserStream user={{ name: "Alex" }}></UserStream>
        </div>
      </div>

      <div className='flex h-[50vh] items-stretch'>
        {/* <WebcamComponent /> */}
        <div className="w-1/2  bg-red-500">
          <UserStream user={{ name: "Luke" }}></UserStream>
        </div>

        <div className="w-1/2   bg-green-500">
          <UserStream user={{ name: "Alex" }}></UserStream>
        </div>
      </div>

      

      {/* <div className='flex'>
        <div className="w-1/2  bg-blue-500">
          <UserStream user={{ name: "Marty" }}></UserStream>
        </div>

        <div className="w-1/2  bg-yellow-500">
          <UserStream user={{ name: "Nate" }}></UserStream>
        </div>
      </div> */}
    </>
  );
};

export default Home;