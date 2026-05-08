function Toast({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type}`} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default Toast
