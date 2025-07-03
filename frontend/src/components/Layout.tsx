import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition, Menu } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  CubeIcon, 
  TagIcon, 
  ArrowTrendingUpIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import BackToTopButton from './BackToTopButton'

// Enhanced navigation items with subtle animations
const navigation = [  
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Aset', href: '/assets', icon: CubeIcon },
  { name: 'Kategori', href: '/categories', icon: TagIcon },
  { name: 'Lokasi', href: '/locations', icon: MapPinIcon },
  { name: 'Laporan', href: '/reports', icon: ChartBarIcon },
  { name: 'Template Laporan', href: '/template-management', icon: DocumentTextIcon },
  { name: 'Riwayat Aktivitas', href: '/audit-logs', icon: ClockIcon },
  { name: 'Analitik', href: '#', icon: ArrowTrendingUpIcon, soon: true },
]

// Function to get dynamic header content based on current pathname
function getHeaderContent(pathname: string) {
  if (pathname === '/') {
    return {
      title: 'Dashboard',
      description: 'Gambaran umum sistem inventaris'
    }
  } else if (pathname.startsWith('/assets')) {
    if (pathname.includes('/new')) {
      return {
        title: 'Tambah Aset',
        description: 'Tambahkan aset baru ke dalam sistem'
      }
    } else if (pathname.includes('/edit/')) {
      return {
        title: 'Edit Aset',
        description: 'Ubah informasi aset yang ada'
      }
    } else if (pathname.match(/\/assets\/\d+$/)) {
      return {
        title: 'Detail Aset',
        description: 'Informasi lengkap aset'
      }
    } else {
      return {
        title: 'Aset',
        description: 'Kelola semua aset inventaris STTPU dengan mudah dan efisien'
      }
    }
  } else if (pathname.startsWith('/categories')) {
    if (pathname.includes('/new')) {
      return {
        title: 'Tambah Kategori',
        description: 'Tambahkan kategori baru untuk mengorganisir aset'
      }
    } else if (pathname.includes('/edit/')) {
      return {
        title: 'Edit Kategori',
        description: 'Ubah informasi kategori yang ada'
      }
    } else {
      return {
        title: 'Kategori',
        description: 'Kelola kategori untuk mengorganisir aset inventaris'
      }
    }
  } else if (pathname.startsWith('/locations')) {
    if (pathname.includes('/new')) {
      return {
        title: 'Tambah Lokasi',
        description: 'Tambahkan lokasi baru untuk penempatan aset'
      }
    } else if (pathname.includes('/edit/')) {
      return {
        title: 'Edit Lokasi',
        description: 'Ubah informasi lokasi yang ada'
      }
    } else {
      return {
        title: 'Lokasi',
        description: 'Kelola lokasi penempatan aset inventaris'
      }
    }
  } else if (pathname === '/reports') {
    return {
      title: 'Laporan',
      description: 'Generate dan kelola laporan inventaris'
    }
  } else if (pathname === '/template-management') {
    return {
      title: 'Template Laporan',
      description: 'Kelola template untuk laporan inventaris'
    }
  } else if (pathname === '/audit-logs') {
    return {
      title: 'Riwayat Aktivitas',
      description: 'Pantau semua aktivitas dan perubahan dalam sistem'
    }
  } else if (pathname === '/debug') {
    return {
      title: 'Debug',
      description: 'Halaman debug untuk pengembangan'
    }
  } else if (pathname === '/test') {
    return {
      title: 'Test Page',
      description: 'Halaman test untuk pengembangan'
    }
  }
  
  // Default fallback
  return {
    title: 'Manajemen Inventaris',
    description: 'Sistem manajemen inventaris STTPU'
  }
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Effect for page load animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get dynamic header content based on current route
  const headerContent = getHeaderContent(location.pathname);

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
                    {/* Logo section - Full size */}
                    <div className="flex h-48 shrink-0 items-center justify-center py-10">
                      <img
                        className="h-44 w-auto"
                        src="/sttpu-logo.png"
                        alt="STTPU Logo"
                      />
                    </div>

                    {/* User info section - like reference */}
                    <Menu as="div" className="relative">
                      <Menu.Button className="w-full bg-blue-600 rounded-lg p-3 hover:bg-blue-700 transition-colors">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full bg-white/20 object-cover ring-2 ring-white/30"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">Farhan</p>
                                <p className="text-xs text-blue-100">Operator</p>
                              </div>
                              <ChevronDownIcon className="h-4 w-4 text-white/70" />
                            </div>
                          </div>
                        </div>
                      </Menu.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute left-0 right-0 mt-2 origin-top rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="#"
                                  className={classNames(
                                    active ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                  )}
                                >
                                  <UserIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                                  Profil Saya
                                </a>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="#"
                                  className={classNames(
                                    active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                  )}
                                >
                                  <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                                  Logout
                                </a>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  to={item.soon ? '#' : item.href}
                                  className={({ isActive }) => classNames(
                                    isActive && !item.soon
                                      ? 'bg-blue-50 text-blue-700 scale-105 font-semibold'
                                      : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-all duration-200 ease-in-out transform hover:scale-[1.02] w-full'
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-56 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 backdrop-blur-md border-r border-gray-200/50 px-6">
            {/* Logo section - Full size */}
            <div className="flex h-48 shrink-0 items-center justify-center py-10">
              <img
                className="h-44 w-auto"
                src="/sttpu-logo.png"
                alt="STTPU Logo"
              />
            </div>

            {/* User info section - like reference */}
            <Menu as="div" className="relative">
              <Menu.Button className="w-full bg-blue-600 rounded-lg p-3 hover:bg-blue-700 transition-colors">
                <div className="flex items-center">
                  <img
                    className="h-10 w-10 rounded-full bg-white/20 object-cover ring-2 ring-white/30"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Farhan</p>
                        <p className="text-xs text-blue-100">Operator</p>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-white/70" />
                    </div>
                  </div>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 right-0 mt-2 origin-top rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-blue-50 text-blue-700' : 'text-gray-700',
                            'group flex items-center px-4 py-2 text-sm'
                          )}
                        >
                          <UserIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                          Profil Saya
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? 'bg-red-50 text-red-700' : 'text-gray-700',
                            'group flex items-center px-4 py-2 text-sm'
                          )}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" aria-hidden="true" />
                          Logout
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.soon ? '#' : item.href}
                          className={({ isActive }) => classNames(
                            isActive && !item.soon
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold'
                              : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 transition-all duration-150 ease-in-out hover:translate-x-1 w-full'
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
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:pl-56">
          {/* Floating hamburger menu for mobile */}
          <button
            type="button"
            className="fixed top-4 left-4 z-50 lg:hidden bg-white/90 backdrop-blur-md rounded-lg p-2 shadow-lg border border-gray-200/50 transition-all duration-300 hover:bg-white"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Buka sidebar</span>
            <Bars3Icon className="h-6 w-6 text-gray-700" aria-hidden="true" />
          </button>

          <main className="min-h-screen">
            {/* Header with title like the reference */}
            <div className="mb-3 flex justify-between items-start px-4 sm:px-6 lg:px-8 pt-6">
              <div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                  {headerContent.title}
                </h1>
                <p className="mt-0.5 text-xs text-gray-500">{headerContent.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <div className="text-xs font-logo font-semibold text-gray-700 leading-tight tracking-wide uppercase">
                    Manajemen
                  </div>
                  <div className="text-base font-logo font-bold text-blue-600 leading-tight tracking-tight">
                    Inventaris
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <CubeIcon className="h-5 w-5 text-blue-500" />
                  <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 h-full">
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
