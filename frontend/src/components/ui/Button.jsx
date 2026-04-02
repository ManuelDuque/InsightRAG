import { forwardRef } from 'react'

const Button = forwardRef(function Button(
  {
    children,
    variant = 'secondary',
    size = 'md',
    className = '',
    ...props
  },
  ref,
) {
  const sizeClass = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm'
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'danger'
        ? 'btn-danger'
        : 'btn-secondary'

  return (
    <button
      ref={ref}
      className={`btn inline-flex items-center justify-center gap-2 leading-none ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
