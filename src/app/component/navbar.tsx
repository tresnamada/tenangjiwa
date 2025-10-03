'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getCurrentUser, isAuthenticated } from '../service/loginservice';
import { User } from 'firebase/auth';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSiTenangMenu, setShowSiTenangMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const pathname = usePathname();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const siTenangMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
      if (siTenangMenuRef.current && !siTenangMenuRef.current.contains(event.target as Node)) {
        setShowSiTenangMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      const authenticated = isAuthenticated();
      setUser(currentUser);
      setIsUserAuthenticated(authenticated);
    };
    checkAuth();
    // Listen for auth state changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/', label: 'Beranda' },
  ];

  const siTenangItems = [
    { href: '/page/aipage', label: 'Deteksi AI', icon: '🤖' },
    { href: '/page/suaratenjin', label: 'Suara TenJin', icon: '🎤' },
    { href: '/page/ceritatenjin', label: 'Cerita TenJin', icon: '💬' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? '' : 'bg-transparent'}`}>
      <nav className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">

          <div className="leading-tight">
            <span className="text-[#1E498E] font-semibold">Tenang Jiwa</span>
            <span className="block text-[11px] text-[#1E498E] mt-0.5">Kenali Perasaan Jiwa Kamu</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`text-sm px-3 py-2 rounded-full transition-all duration-200 ${active ? 'text-[#1E498E] bg-[#1E498E]/10' : 'text-black/70 hover:text-[#1E498E] hover:bg-black/5'}`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* SiTenang Dropdown */}
          <div className="relative" ref={siTenangMenuRef}>
            <button
              onClick={() => setShowSiTenangMenu(!showSiTenangMenu)}
              className={`text-sm px-3 py-2 rounded-full transition-all duration-200 flex items-center gap-1 ${
                siTenangItems.some(item => pathname === item.href)
                  ? 'text-[#1E498E] bg-[#1E498E]/10'
                  : 'text-black/70 hover:text-[#1E498E] hover:bg-black/5'
              }`}
            >
              SiTenang
              <svg className={`w-4 h-4 transition-transform duration-200 ${showSiTenangMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSiTenangMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white/90 backdrop-blur-md rounded-xl border border-black/10 shadow-lg py-2 z-50">
                {siTenangItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowSiTenangMenu(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? 'text-[#1E498E] bg-[#1E498E]/10 font-medium'
                        : 'text-black/70 hover:text-[#1E498E] hover:bg-[#1E498E]/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Account Dropdown */}
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="text-sm px-3 py-2 rounded-full transition-all duration-200 text-black/70 hover:text-[#1E498E] hover:bg-black/5 flex items-center gap-1"
            >
              {isUserAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-[#1E498E]/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#1E498E]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                  <span className="hidden md:block">{user.displayName || 'Profil'}</span>
                </div>
              ) : (
                'Akun'
              )}
              <svg className={`w-4 h-4 transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl border border-black/10 shadow-lg py-2 z-50">
                {isUserAuthenticated && user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user.displayName || 'Pengguna'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/page/profile"
                      onClick={() => setShowAccountMenu(false)}
                      className="block px-4 py-2 text-sm text-black/70 hover:text-[#1E498E] hover:bg-[#1E498E]/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profil Saya
                      </div>
                    </Link>
                    <Link
                      href="/page/settings"
                      onClick={() => setShowAccountMenu(false)}
                      className="block px-4 py-2 text-sm text-black/70 hover:text-[#1E498E] hover:bg-[#1E498E]/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Pengaturan
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        // Logout will be handled by the profile page
                        window.location.href = '/page/profile';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/page/login"
                      onClick={() => setShowAccountMenu(false)}
                      className="block px-4 py-2 text-sm text-black/70 hover:text-[#1E498E] hover:bg-[#1E498E]/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Masuk
                      </div>
                    </Link>
                    <Link
                      href="/page/signup"
                      onClick={() => setShowAccountMenu(false)}
                      className="block px-4 py-2 text-sm text-black/70 hover:text-[#1E498E] hover:bg-[#1E498E]/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Daftar
                      </div>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Link href="/konsultasi" className="ml-2 text-sm text-white bg-[#1E498E] px-4 py-2 rounded-full hover:shadow-[0_8px_24px_rgba(30,73,142,0.35)] transition-shadow">
            Konsultasi
          </Link>
        </div>
      </nav>

      {/* Bottom navigation for mobile - Redesigned */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Main Bottom Bar */}
        <div className="relative bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-8px_32px_rgba(0,0,0,0.12)]">
          <div className="max-w-[1280px] mx-auto px-4 pb-2 pt-1">
            <div className="flex items-center justify-around relative">
              {/* Home */}
              <Link 
                href="/" 
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                  pathname === '/' 
                    ? 'text-[#1E498E] scale-105' 
                    : 'text-gray-500 hover:text-[#1E498E]'
                }`}
              >
                <div className={`relative ${pathname === '/' ? 'animate-bounce' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                    <path d="M11.47 3.84a.75.75 0 011.06 0l8.25 8.25a.75.75 0 01-1.06 1.06l-.72-.72V20.5A2.5 2.5 0 0116.5 23h-9A2.5 2.5 0 015 20.5v-8.07l-.72.72a.75.75 0 01-1.06-1.06l8.25-8.25z"/>
                  </svg>
                  {pathname === '/' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1E498E] rounded-full"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${pathname === '/' ? 'text-[#1E498E]' : ''}`}>
                  Home
                </span>
              </Link>

              {/* TenJin */}
              <button 
                onClick={() => setShowSiTenangMenu(!showSiTenangMenu)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                  (pathname === '/page/suaratenjin' || pathname === '/page/ceritatenjin')
                    ? 'text-[#1E498E] scale-105' 
                    : 'text-gray-500 hover:text-[#1E498E]'
                }`}
              >
                <div className="relative">
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br from-[#1E498E] to-[#2563eb] flex items-center justify-center ${
                    (pathname === '/page/suaratenjin' || pathname === '/page/ceritatenjin') ? 'shadow-lg shadow-[#1E498E]/30' : ''
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${
                  (pathname === '/page/suaratenjin' || pathname === '/page/ceritatenjin') ? 'text-[#1E498E]' : ''
                }`}>
                  TenJin
                </span>
              </button>

              {/* Konsul - Center FAB */}
              <Link 
                href={isUserAuthenticated ? "/konsultasi" : "/page/login"}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                  (pathname === '/konsultasi' || pathname === '/page/login')
                    ? 'text-[#1E498E] scale-105' 
                    : 'text-gray-500 hover:text-[#1E498E]'
                }`}
              >
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                    <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v6.75a.75.75 0 01-.492.7 60.147 60.147 0 01-4.75 1.527.75.75 0 01-.557-.021A.75.75 0 011.5 20.25V8.25a.75.75 0 01.372-.648 60.116 60.116 0 0110.328-4.797zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9z"/>
                    <path d="M12.75 2.25a.75.75 0 00-.75.75v6.75a.75.75 0 001.5 0V3a.75.75 0 00-.75-.75zM16.5 6.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H16.5z"/>
                    <path d="M12 12.75a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm2.25 4.5a.75.75 0 00-.75-.75h-3a.75.75 0 000 1.5h3a.75.75 0 00.75-.75z"/>
                  </svg>
                  {(pathname === '/konsultasi' || pathname === '/page/login') && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1E498E] rounded-full"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${
                  (pathname === '/konsultasi' || pathname === '/page/login') ? 'text-[#1E498E]' : ''
                }`}>
                  Konsultasi
                </span>
              </Link>


              {/* Profile */}
              <Link 
                href={isUserAuthenticated ? "/page/profile" : "/page/login"}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                  (pathname === '/page/profile' || pathname === '/page/login')
                    ? 'text-[#1E498E] scale-105' 
                    : 'text-gray-500 hover:text-[#1E498E]'
                }`}
              >
                <div className="relative">
                  {isUserAuthenticated && user ? (
                    user.photoURL ? (
                      <div className={`w-7 h-7 rounded-full ring-2 ${
                        (pathname === '/page/profile' || pathname === '/page/login') 
                          ? 'ring-[#1E498E] ring-offset-2' 
                          : 'ring-gray-300'
                      }`}>
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={28}
                          height={28}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                      </svg>
                    )
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                    </svg>
                  )}
                  {(pathname === '/page/profile' || pathname === '/page/login') && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1E498E] rounded-full"></span>
                  )}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${
                  (pathname === '/page/profile' || pathname === '/page/login') ? 'text-[#1E498E]' : ''
                }`}>
                  {isUserAuthenticated ? 'Profil' : 'Masuk'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TenJin Modal */}
      {showSiTenangMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-fadeIn"
            onClick={() => setShowSiTenangMenu(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="sm:hidden fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none">
            <div className="w-full max-w-sm pointer-events-auto animate-scaleIn">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-[#1E498E] via-[#2563eb] to-[#1E498E] p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold">Pilih TenJin</h3>
                    <p className="text-sm text-white/90 mt-1">Cerita atau suara? Pilih sesuai keinginanmu</p>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <Link
                    href="/page/ceritatenjin"
                    onClick={() => setShowSiTenangMenu(false)}
                    className="block group"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
                        💬
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base">Cerita TenJin</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Tulis dan bagikan ceritamu</p>
                      </div>
                      <svg className="w-6 h-6 text-purple-600 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>

                  <Link
                    href="/page/suaratenjin"
                    onClick={() => setShowSiTenangMenu(false)}
                    className="block group"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg">
                        🎤
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base">Suara TenJin</h4>
                        <p className="text-xs text-gray-600 mt-0.5">Rekam dan dengarkan suaramu</p>
                      </div>
                      <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => setShowSiTenangMenu(false)}
                    className="w-full py-3.5 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}


