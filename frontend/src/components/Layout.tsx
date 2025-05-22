import { Fragment, useState, useEffect } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  CubeIcon, 
  TagIcon, 
  UserCircleIcon,   
  BellIcon,
  ArrowTrendingUpIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import BackToTopButton from './BackToTopButton'

// Enhanced navigation items with subtle animations
const navigation = [  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Aset', href: '/assets', icon: CubeIcon },
  { name: 'Kategori', href: '/categories', icon: TagIcon },
  { name: 'Lokasi', href: '/locations', icon: MapPinIcon },
  { name: 'Analitik', href: '#', icon: ArrowTrendingUpIcon, soon: true },
]

const userNavigation = [
  { name: 'Profil Anda', href: '#' },
  { name: 'Pengaturan', href: '#' },
  { name: 'Keluar', href: '#' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
    
    // Handle scroll for navbar transformation
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  // Function to get page title based on current path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/assets')) {
      if (path.includes('/new')) return 'Tambah Aset Baru';
      if (path.includes('/edit')) return 'Ubah Aset';
      return 'Manajemen Aset';
    }
    if (path.startsWith('/categories')) {
      if (path.includes('/new')) return 'Tambah Kategori Baru';
      if (path.includes('/edit')) return 'Ubah Kategori';
      return 'Kategori';
    }
    return 'Sistem Inventaris';
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Mobile sidebar with enhanced animations */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Tutup sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  
                  {/* Glass morphism sidebar for mobile */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 backdrop-blur-md border-r border-gray-200/50 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center">                      <img
                        className="h-8 w-auto"
                        src="/inventory-icon.svg"
                        alt="Sistem Inventaris"
                      />
                      <span className="ml-3 text-lg font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                        Sistem Inventaris
                      </span>
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  to={item.soon ? '#' : item.href}
                                  className={({ isActive }) => classNames(
                                    isActive && !item.soon
                                      ? 'bg-blue-50 text-blue-700 scale-105 font-semibold'
                                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-all duration-200 ease-in-out transform hover:scale-[1.02]'
                                  )}
                                  onClick={e => item.soon && e.preventDefault()}
                                >
                                  <item.icon
                                    className={classNames(
                                      'h-6 w-6 shrink-0 transition-all duration-300',
                                      location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                  {item.soon && (
                                    <span className="ml-auto inline-flex items-center rounded-full bg-blue-100/80 px-2 py-0.5 text-xs font-medium text-blue-800">
                                      Soon
                                    </span>
                                  )}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop with glass morphism effect */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 backdrop-blur-md border-r border-gray-200/50 px-6">            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="/inventory-icon.svg"
                alt="Sistem Inventaris"
              />
              <span className="ml-3 text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                Sistem Inventaris
              </span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.soon ? '#' : item.href}
                          className={({ isActive }) => classNames(
                            isActive && !item.soon
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold'
                              : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-all duration-150 ease-in-out hover:translate-x-1'
                          )}
                          onClick={e => item.soon && e.preventDefault()}
                        >
                          <item.icon
                            className={classNames(
                              'h-6 w-6 shrink-0',
                              location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                            )}
                            aria-hidden="true"                          />                          {item.name}
                          {item.soon && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-blue-100/80 px-2 py-0.5 text-xs font-medium text-blue-800">
                              Segera
                            </span>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="mt-auto">
                  <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >                    <UserCircleIcon
                      className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-blue-600"
                      aria-hidden="true"
                    />
                    Akun Anda
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:pl-72">
          {/* Topbar with glass morphism effect on scroll */}
          <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 px-4 transition-all duration-300 ease-in-out
            ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white/0'} 
            sm:gap-x-6 sm:px-6 lg:px-8`}
          >            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Buka sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-300 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center flex-1">
                <h1 className="text-xl font-semibold leading-7 text-gray-900 bg-clip-text">{getPageTitle()}</h1>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative transition-all duration-300 hover:rotate-12"
                >
                  <span className="sr-only">Lihat notifikasi</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Buka menu pengguna</span>
                    <img
                      className="h-8 w-8 rounded-full bg-gray-50 object-cover transition-transform duration-300 hover:scale-110"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                        Admin Pengguna
                      </span>
                      <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Menu.Button>                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >                    <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white/90 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">                      <div className="px-4 py-3">
                        <p className="text-sm">Masuk sebagai</p>
                        <p className="truncate text-sm font-medium text-gray-900">admin@example.com</p>
                      </div>
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                                  'block px-4 py-2 text-sm transition-colors duration-150'
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const newTheme = theme === 'light' ? 'dark' : 'light';
                                setTheme(newTheme);
                                localStorage.setItem('theme', newTheme);
                                
                                if (newTheme === 'dark') {
                                  document.documentElement.classList.add('dark');
                                } else {
                                  document.documentElement.classList.remove('dark');
                                }
                              }}
                              className={classNames(
                                active ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                                'flex w-full items-center px-4 py-2 text-sm transition-colors duration-150'
                              )}
                            >
                              {theme === 'light' ? (
                                <>
                                  <MoonIcon className="h-4 w-4 mr-2" />
                                  <span>Mode Gelap</span>
                                </>
                              ) : (
                                <>
                                  <SunIcon className="h-4 w-4 mr-2" />
                                  <span>Mode Terang</span>
                                </>
                              )}
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
          
          {/* Back to top button */}
          <BackToTopButton />
        </div>
      </div>
    </>
  );
}
