import React from 'react';
import Image from 'next/image';

const Profile = () => {
  // Placeholder data for the user profile
  const userProfile = {
    name: 'Bill Gate',
    avatar: '/placeholder-avatar.jpg',
    coverPhoto: '/placeholder-cover.jpg',
    bio: 'Building the future, one line of code at a time.',
    friends: 1500,
    // Add more profile details as needed
  };

  // Placeholder for navigation tabs
  const profileTabs = ['Posts', 'Friends', 'Photos', 'More'];

  return (
    <div className="w-full">
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gray-300 rounded-b-lg overflow-hidden">
         <Image
          src={userProfile.coverPhoto}
          alt={`${userProfile.name}'s cover photo`}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Profile Info Section */}
      <div className="flex flex-col items-center -mt-20 z-10 relative">
         {/* Profile Picture */}
         <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <Image
             src={userProfile.avatar || '/avatars/default-avatar.png'}
             alt={`${userProfile.name}'s avatar`}
             width={160}
             height={160}
             style={{ objectFit: 'cover' }}
           />
         </div>

        {/* User Name and Bio */}
        <h1 className="text-3xl font-bold text-gray-800 mt-4">{userProfile.name}</h1>
        <p className="text-gray-600 mt-1">{userProfile.bio}</p>
        {/* Placeholder for Friends count, etc. */}
        <p className="text-gray-500 text-sm mt-2">{userProfile.friends} Friends</p>

        {/* Action Buttons (Add Friend, Message, etc.) */}
        <div className="flex space-x-2 mt-4">
           <button className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700">+ Add to Story</button>
           <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300">Edit Profile</button>
           {/* More options */}
           <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300">...</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-gray-200 mt-6">
         <div className="max-w-3xl mx-auto flex space-x-6">
            {profileTabs.map(tab => (
               <button key={tab} className="py-3 border-b-2 border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-600 font-semibold text-sm">
                 {tab}
               </button>
            ))}
         </div>
      </div>

      {/* Content Area (Placeholder for Posts, About, etc.) */}
      <div className="max-w-3xl mx-auto mt-6">
         {/* We can potentially render the NewsFeed component here for the Posts tab */}
         <p className="text-gray-700">Profile content goes here (e.g., Posts, Friends, etc.)</p>
      </div>

    </div>
  );
};

 