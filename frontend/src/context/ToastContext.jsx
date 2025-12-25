import { createContext, useContext } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }) => {
    const showSuccess = (message) => {
        toast.success(message, {
            duration: 3000,
            position: 'top-right',
            style: {
                background: '#10b981',
                color: '#fff',
                fontWeight: '500',
            },
        })
    }

    const showError = (message) => {
        toast.error(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#ef4444',
                color: '#fff',
                fontWeight: '500',
            },
        })
    }

    const showInfo = (message) => {
        toast(message, {
            duration: 3000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#3b82f6',
                color: '#fff',
                fontWeight: '500',
            },
        })
    }

    const showLoading = (message) => {
        return toast.loading(message, {
            position: 'top-right',
        })
    }

    const dismiss = (toastId) => {
        toast.dismiss(toastId)
    }

    const value = {
        showSuccess,
        showError,
        showInfo,
        showLoading,
        dismiss,
        toast, // Export raw toast for custom usage
    }

    return (
        <ToastContext.Provider value={value}>
            <Toaster />
            {children}
        </ToastContext.Provider>
    )
}
