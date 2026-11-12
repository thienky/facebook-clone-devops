"use client";
import React from 'react';

const SentRequestsPlaceholder = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Sent Requests</h2>
      <p className="text-gray-500 text-sm">
        This feature is not yet available. The API for sent friend requests is pending.
      </p>
      {/* You can add a disabled or static list view here if you want */}
      <div className="space-y-3 mt-4 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex gap-2 mt-2">
              <div className="h-6 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentRequestsPlaceholder; 