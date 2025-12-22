'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { Menu, X, User, LogOut, Settings, ListOrdered } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Albert_Sans, Inria_Serif } from 'next/font/google';
import SignIn from '@/src/components/forms/signin';
import { useAuth, logout } from '@/src/context/authProvider';
import { useCart } from '@/src/context/CartContext';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCategoryStorage } from '@/src/hooks/useCategoryStorage';
import { toast } from 'react-hot-toast';
import { fetchUserData, isUserAdmin } from '@/src/server/services/user.service';
import AnnouncementBar from './announcement';

const albertSans = Albert_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });
const inriaSerif = Inria_Serif({ subsets: ['latin'], weight: ['400', '700'] });

function NavbarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showProductsPopup, setShowProductsPopup] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toggleCart, cartItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');
  const { categories, isLoading } = useCategoryStorage();

  const handleProductsEnter = () => setShowProductsPopup(true);
  const handleProductsLeave = () => setShowProductsPopup(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isCheckoutPage = pathname === '/checkout';
  const isAdmin = isUserAdmin(userRole);
  const showNavLinks = !isCheckoutPage;

  useEffect(() => {
    if (user) {
      fetchUserData(user.uid, user.email).then((data) => {
        setUserName(data.name);
        setUserRole(data.role);
      });
    } else {
      setUserName(null);
      setUserRole(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && userName && !loading && !isSignInOpen) {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn === 'true') {
        setTimeout(() => toast.success(`Welcome, ${userName}!`), 400, { style: { borderRadius: 0 } });
        sessionStorage.removeItem('justLoggedIn');
      }
    }
  }, [user, userName, loading, isSignInOpen]);

  const openSignInModal = () => { setIsSignInOpen(true); setIsOpen(false); };
  const closeSignInModal = () => setIsSignInOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      setUserName(null);
      setUserRole(null);
      toast.success('Logged out!', { style: { borderRadius: 0 } });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  };

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-100 bg-white ${albertSans.className}`}>
        <div className="w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-14 sm:h-16">

            {/* Left Navigation */}
            {showNavLinks && (
              <div className="hidden md:flex items-center space-x-10 text-gray-700 text-sm font-medium">
                <Link href="/about" className={`hover:text-black transition-colors ${pathname === '/about' ? 'underline underline-offset-6 decoration-2 decoration-black' : ''}`}>About</Link>

                <div className="relative inline-block" onMouseEnter={handleProductsEnter} onMouseLeave={handleProductsLeave}>
                  <button onClick={() => { sessionStorage.removeItem('productFilters'); sessionStorage.removeItem('productSort'); router.push('/products'); }} className={`hover:text-black transition-colors ${pathname === '/products' ? 'underline underline-offset-6 decoration-2 cursor-pointer decoration-black' : ''}`}>Products</button>

                  {showProductsPopup && !isLoading && categories.length > 0 && (
                    <div className="absolute left-1 -translate-x-1/6 top-full mt-0 min-w-[220px] bg-white shadow-xl border border-gray-200 text-gray-800 z-100 flex flex-col pointer-events-auto" onMouseEnter={handleProductsEnter} onMouseLeave={handleProductsLeave}>
                      {categories.map((cat) => (
                        <Link key={cat.id || cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`} className={`px-8 py-4 text-sm text-gray-700 hover:bg-gray-100 transition whitespace-nowrap ${activeCategory === cat.name ? 'underline decoration-1 decoration-black underline-offset-4' : ''}`}>{cat.name}</Link>
                      ))}
                    </div>
                  )}
                </div>

                <Link href="/contact" className={`hover:text-black transition-colors ${pathname === '/contact' ? 'underline underline-offset-6 decoration-2 decoration-black' : ''}`}>Contact</Link>
              </div>
            )}

            {/* Center Logo */}
            <Link href="/" className={`text-lg sm:text-2xl tracking-wide text-gray-900 md:absolute md:left-1/2 md:-translate-x-1/2 ${inriaSerif.className}`}>COGA</Link>

            {/* Right side */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6 ml-auto">
              {!loading && isAdmin && !isCheckoutPage && (
                <Link href="/admin"><button className="hidden md:flex text-sm cursor-pointer items-center justify-center px-2 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors" title="Admin">Admin</button></Link>
              )}

              {!isCheckoutPage && (
                <button onClick={toggleCart} className="cursor-pointer mt-1.25 relative">
                  <Image src="/cartIcon.svg" alt="Cart" width={25} height={25} />
                  {!loading && user && cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">{cartItemCount > 99 ? '99+' : cartItemCount}</span>
                  )}
                </button>
              )}

              {loading ? null : user ? (
                <div className="hidden md:block relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex cursor-pointer items-center justify-center w-9 h-9 rounded-full bg-black text-white hover:bg-gray-800 transition-colors" title={user.email || 'User Profile'}><User size={18} /></button>

                  {isProfileOpen && (
                    <>
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border border-gray-200 z-100">
                        <div className="p-4 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {isAdmin && <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs">Admin</span>}
                        </div>
                        <Link href="/my-profile"><button onClick={() => setIsProfileOpen(false)} className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"><User size={16} />My Profile</button></Link>
                        <Link href="/my-orders"><button onClick={() => setIsOpen(false)} className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"><ListOrdered size={16} />My Orders</button></Link>
                        <button onClick={handleLogout} className="w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-gray-200"><LogOut size={16} />Logout</button>
                      </div>
                      <div className="fixed inset-0 z-90" onClick={() => setIsProfileOpen(false)} />
                    </>
                  )}
                </div>
              ) : (
                <button onClick={openSignInModal} className="hidden md:block text-white bg-black py-1.5 px-4 cursor-pointer hover:bg-gray-800 transition">Sign In</button>
              )}

              {showNavLinks && <button className="md:hidden p-1 text-gray-700 focus:outline-none" onClick={() => setIsOpen(true)}><Menu size={26} /></button>}
            </div>
          </div>
        </div>

        {/* Add AnnouncementBar here - inside the nav, at the bottom */}
        {pathname === "/" && (
          <AnnouncementBar />
        )}

      </nav>

      {/* Mobile overlay */}
      {isOpen && showNavLinks && <div className="fixed inset-0 backdrop-blur-xs bg-black/20 z-80 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Mobile Drawer - keeping same structure, just cleaner */}
      {showNavLinks && (
        <aside className={`fixed top-0 right-0 h-full w-full max-w-xs sm:max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-100 md:hidden ${albertSans.className} ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-3 sm:p-5 flex flex-col space-y-4 sm:space-y-6 text-gray-800 font-medium h-full">
            <div className="flex justify-end mb-6"><button onClick={() => { setIsOpen(false); setMobileProductsOpen(false); }}><X size={26} /></button></div>

            {user && (
              <div className="mb-4 pb-6 border-b border-gray-200 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white"><User size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {isAdmin && <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs">Admin</span>}
                </div>
              </div>
            )}

            <Link href="/about" className={`hover:text-black transition-colors ${pathname === '/about' ? 'underline underline-offset-6 decoration-2 decoration-black' : ''}`} onClick={() => setIsOpen(false)}>About</Link>

            <div className="flex flex-col">
              <button onClick={() => { if (!mobileProductsOpen) { setMobileProductsOpen(true); } else if (pathname !== '/products') { sessionStorage.removeItem('productFilters'); sessionStorage.removeItem('productSort'); router.push('/products'); setIsOpen(false); } else { setMobileProductsOpen(false); } }} className={`text-left hover:text-black transition-colors flex items-center justify-between ${pathname === '/products' ? 'underline underline-offset-6 decoration-2 decoration-black' : ''}`}>
                Products
                <Image src={mobileProductsOpen ? '/upIcon.svg' : '/downIcon.svg'} alt="Toggle" width={16} height={16} className="ml-2 inline-block" />
              </button>
              {mobileProductsOpen && !isLoading && categories.length > 0 && (
                <div className="mt-4 flex flex-col space-y-4 pl-4">
                  {categories.map((cat) => (<Link key={cat.id || cat.name} href={`/products?category=${encodeURIComponent(cat.name)}`} className={`text-sm text-gray-700 hover:text-black ${activeCategory === cat.name ? 'underline decoration-1 decoration-black underline-offset-4' : ''}`} onClick={() => setIsOpen(false)}>{cat.name}</Link>))}
                </div>
              )}
            </div>

            <Link href="/contact" className={`hover:text-black transition-colors ${pathname === '/contact' ? 'underline underline-offset-6 decoration-2 decoration-black' : ''}`} onClick={() => setIsOpen(false)}>Contact</Link>

            <div className="mt-auto pt-4 space-y-2">
              {user ? (
                <>
                  <Link href="/my-profile"><button onClick={() => setIsOpen(false)} className="w-full justify-center text-center py-2 text-black bg-white border border-black flex items-center gap-2 mb-2"><User size={16} />My Profile</button></Link>
                  <Link href="/my-orders"><button onClick={() => setIsOpen(false)} className="w-full justify-center text-center py-2 text-black bg-white border border-black flex items-center gap-2 mb-2"><ListOrdered size={16} />My Orders</button></Link>
                  {isAdmin && (<Link href="/admin"><button onClick={() => setIsOpen(false)} className="w-full justify-center text-center py-2 text-white bg-purple-600 hover:bg-purple-700 transition-colors flex items-center gap-2 mb-2"><Settings size={16} />Admin</button></Link>)}
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full justify-center text-center py-2 text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"><LogOut size={16} />Logout</button>
                </>
              ) : (
                <button onClick={openSignInModal} className="w-full text-white bg-black py-1.5 px-4 hover:bg-gray-800 transition">Sign In</button>
              )}
            </div>
          </div>
        </aside>
      )}

      <SignIn isOpen={isSignInOpen} onClose={closeSignInModal} />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<nav className="fixed top-0 left-0 w-full h-16 bg-white" />}>
      <NavbarContent />
    </Suspense>
  );
}