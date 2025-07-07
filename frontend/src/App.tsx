import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import AssetsPage from './pages/AssetsPage'
import CategoriesPage from './pages/CategoriesPage'
import DashboardPage from './pages/DashboardPage'
import DebugPage from './pages/DebugPage'
import AssetForm from './pages/AssetForm'
import AssetDetailsPage from './pages/AssetDetailsPage'
import CategoryForm from './pages/CategoryForm'
import LocationsPage from './pages/LocationsPage'
import LocationForm from './pages/LocationForm'
import AuditLogPage from './pages/AuditLogPage'
import TemplateManagementPage from './pages/TemplateManagementPage'
import ReportsPage from './pages/ReportsPage'
import TestPage from './pages/TestPage'
import WatermarkDemo from './pages/WatermarkDemo'
import { NotificationProvider } from './context/NotificationContext'
import ToastContainer from './components/ToastContainer'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  console.log('App component rendering...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              
              {/* Asset routes */}
              <Route path="assets" element={<AssetsPage />} />
              <Route path="assets/new" element={<AssetForm />} />
              <Route path="assets/edit/:id" element={<AssetForm />} />
              <Route path="assets/:id" element={<AssetDetailsPage />} />
              
              {/* Category routes */}
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/new" element={<CategoryForm />} />
              <Route path="categories/edit/:id" element={<CategoryForm />} />
              
              {/* Location routes */}
              <Route path="locations" element={<LocationsPage />} />
              <Route path="locations/new" element={<LocationForm />} />
              <Route path="locations/edit/:id" element={<LocationForm />} />

              {/* Audit Log route */}
              <Route path="audit-logs" element={<AuditLogPage />} />

              {/* Reports route */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Template Management route */}
              <Route path="template-management" element={<TemplateManagementPage />} />

              {/* Debug route */}
              <Route path="debug" element={<DebugPage />} />
              
              {/* Test route */}
              <Route path="test" element={<TestPage />} />
              
              {/* Watermark Demo route */}
              <Route path="watermark-demo" element={<WatermarkDemo />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  )
}

export default App
