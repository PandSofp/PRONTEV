import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Inventory from './pages/Inventory'
import Services from './pages/Services'
import BranchMgmt from './pages/BranchMgmt'
import UserMgmt from './pages/UserMgmt'
import Categories from './pages/Categories'
import Products from './pages/Products'
import OfflineNotice from './components/OfflineNotice'
import SyncManager from './components/SyncManager'

import { useAuth } from './context/AuthContext'

function App() {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const userRole = user?.user_metadata?.role || 'BRANCH_USER' // Default or fetch from user metadata

  return (
    <Router>
      <OfflineNotice />
      <SyncManager />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/sales" element={isAuthenticated ? <Sales /> : <Navigate to="/login" />} />
        <Route path="/inventory" element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />} />
        <Route path="/services" element={isAuthenticated ? <Services /> : <Navigate to="/login" />} />
        <Route path="/categories" element={isAuthenticated ? <Categories /> : <Navigate to="/login" />} />
        <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/login" />} />

        {/* HQ Admin Only */}
        <Route
          path="/branches"
          element={isAuthenticated && userRole === 'HQ_ADMIN' ? <BranchMgmt /> : <Navigate to="/" />}
        />
        <Route
          path="/users"
          element={isAuthenticated && userRole === 'HQ_ADMIN' ? <UserMgmt /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  )
}

export default App
