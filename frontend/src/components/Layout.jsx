import React from 'react'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
    return (
        <div className="d-flex">
            <Sidebar />
            <main className="main-content flex-grow-1">
                {children}
            </main>
        </div>
    )
}

export default Layout
