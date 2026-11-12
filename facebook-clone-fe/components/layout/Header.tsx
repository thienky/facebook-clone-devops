"use client";

import { API_BASE } from '@/lib/apiBase';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import NotificationDropdown from './NotificationDropdown';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import UserDropdown from './UserDropdown';
import { useAuth } from '@/components/auth/AuthContext';
import { Bell, UsersRound } from 'lucide-react';
import { useSearch } from '@/context/SearchContext';


const Header = () => {
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isNotifOpen, setIsNotifOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const notifRef = useRef<HTMLDivElement>(null);
   const router = useRouter();
   const pathname = usePathname();
   const { user, avatarVersion } = useAuth();
   const { setSearchQuery } = useSearch();
   const [localSearch, setLocalSearch] = useState('');
   const [showMobileSearch, setShowMobileSearch] = useState(false);
   const [unreadCount, setUnreadCount] = useState(0);

   const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
   };
   const toggleNotif = () => {
      setIsNotifOpen(!isNotifOpen);
   };

   const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSearchQuery(localSearch);
      router.push('/dashboard');
   };

   useEffect(() => {
      const fetchUnreadCount = async () => {
         try {
            const accessToken = sessionStorage.getItem('accessToken');
            const res = await fetch(`${API_BASE}/backend/notify/news`, {
               headers: {
                  'Authorization': `Bearer ${accessToken}`,
               },
            });
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const data = await res.json();
            const arr = Array.isArray(data.data) ? data.data : [];
            const unread = arr.filter((item: any) => !item.read).length;
            setUnreadCount(unread);
         } catch (err) {
            setUnreadCount(0);
         }
      };
      fetchUnreadCount();
   }, [user]);

   // Close dropdowns when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
         }
         if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
            setIsNotifOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [dropdownRef, notifRef]);

   return (
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md p-2 flex items-center justify-between z-40 h-14 relative">
         {/* Left section: Search Bar and Facebook Logo */}
         <div className="flex items-center flex-grow-0 mr-4">
            {/* Facebook Logo (Circular Blue) */}
            <Link href="/dashboard" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm min-w-[40px] mr-2">
               FB
            </Link>
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative items-center hidden md:flex">
               <svg className="absolute left-3 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               <input
                  type="text"
                  placeholder="Search Facebook"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="bg-gray-100 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                  style={{ minWidth: '180px' }}
               />
            </form>
            {/* Mobile search icon */}
            <button
               type="button"
               className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-200 focus:outline-none"
               onClick={() => setShowMobileSearch((v) => !v)}
               aria-label="Open search"
            >
               <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            {/* Mobile floating search input */}
            {showMobileSearch && (
               <div className="fixed top-0 left-0 w-full z-50 bg-white flex items-center p-2 shadow-md md:hidden">
                  <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
                     <svg className="w-7 h-7 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                     <input
                        type="text"
                        placeholder="Search Facebook"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="bg-gray-100 rounded-full py-2 px-4 ml-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm"
                        autoFocus
                     />
                     <button type="button" className="ml-2 text-gray-500" onClick={() => setShowMobileSearch(false)} aria-label="Close search">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                  </form>
               </div>
            )}
         </div>

         {/* Center section: Navigation Icons */}
         <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-between xl:w-full">
               {/* Navigation Tabs */}
               <Link href="/dashboard"
                 className={`flex items-center justify-center px-2 md:px-9 py-2 md:py-1 rounded-lg cursor-pointer h-[55px] border-b-2 transition-colors duration-200
                   ${pathname === '/dashboard' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}`}
               >
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
               </Link>
               <Link href="/watch"
                 className={`flex items-center justify-center px-2 md:px-9 py-2 md:py-1 rounded-lg cursor-pointer h-[55px] border-b-2 transition-colors duration-200
                   ${pathname === '/watch' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}`}
               >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M6.75 23.25C6.336 23.25 6 22.914 6 22.5C6 22.086 6.336 21.75 6.75 21.75H17.25C17.664 21.75 18 22.086 18 22.5C18 22.914 17.664 23.25 17.25 23.25H6.75ZM15.163 10.846L10.055 13.923C9.591 14.202 9 13.869 9 13.327V7.172C9 6.631 9.591 6.297 10.055 6.576L15.163 9.654C15.612 9.924 15.612 10.575 15.163 10.846ZM19.75 18.25C20.992 18.25 22 17.242 22 16V4.5C22 3.258 20.992 2.25 19.75 2.25H4.25C3.008 2.25 2 3.258 2 4.5V16C2 17.242 3.008 18.25 4.25 18.25H19.75ZM19.75 19.75H4.25C2.179 19.75 0.5 18.071 0.5 16V4.5C0.5 2.429 2.179 0.75 4.25 0.75H19.75C21.821 0.75 23.5 2.429 23.5 4.5V16C23.5 18.071 21.821 19.75 19.75 19.75Z" fill="currentColor" />
                 </svg>
               </Link>
               <Link href="/pages"
                 className={`flex items-center justify-center px-2 md:px-9 py-2 md:py-1 rounded-lg cursor-pointer h-[55px] border-b-2 transition-colors duration-200
                   ${pathname === '/pages' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}`}
               >
                 {/* Orange flag icon */}
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <rect x="3" y="3" width="3" height="18" rx="1.5" fill="#2196F3"/>
                   <rect x="7" y="5" width="10" height="6" rx="2" fill="#FF6D1B"/>
                   <rect x="9" y="11" width="10" height="6" rx="2" fill="#FF9139"/>
                 </svg>
               </Link>
               <Link href="/friends"
                 className={`flex items-center justify-center px-2 md:px-9 py-2 md:py-1 rounded-lg cursor-pointer h-[55px] border-b-2 transition-colors duration-200
                   ${pathname === '/friends' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'}`}
               >
                 <UsersRound />
               </Link>
            </div>
         </div>

         {/* Right section: User Icons and Menu */}
         <div className="flex items-center space-x-2 md:space-x-1 flex-grow-0 ml-4 md:gap-4">
            
            {/* Menu Icon */}
            {/* Notifications Icon */}
            <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-gray-200 cursor-pointer flex items-center justify-center" ref={notifRef}>
               <div onClick={toggleNotif}>
               <Bell className="w-6 h-6 hover:text-blue-600 fill-current text-green-500" />
               </div>
               {isNotifOpen && <NotificationDropdown />}
               <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                 {unreadCount}
               </span>
            </div>
            {/* User Avatar with Dropdown */}
            {user && <UserDropdown />}
         </div>
      </header>
   );
};

export default Header; 