import React from 'react'

const Modal = ({ show, title, children, onClose, onSave }) => {
  if (!show) return null

  return (
    <div className="modal-backdrop show" style={{ position: 'fixed', inset: 0, zIndex: 1050 }}>
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">{children}</div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              {onSave && <button className="btn btn-primary" onClick={onSave}>Guardar</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
