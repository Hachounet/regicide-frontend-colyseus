import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button'
}) => {
  const baseClasses = `
    inline-flex
    items-center
    justify-center
    font-semibold
    rounded-lg
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variantClasses = {
    primary: `
      bg-blue-600
      hover:bg-blue-700
      text-white
      focus:ring-blue-500
    `,
    secondary: `
      bg-gray-600
      hover:bg-gray-700
      text-white
      focus:ring-gray-500
    `,
    success: `
      bg-green-600
      hover:bg-green-700
      text-white
      focus:ring-green-500
    `,
    danger: `
      bg-red-600
      hover:bg-red-700
      text-white
      focus:ring-red-500
    `,
    warning: `
      bg-yellow-600
      hover:bg-yellow-700
      text-white
      focus:ring-yellow-500
    `
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    disabled: { scale: 1, opacity: 0.5 }
  };

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      animate={disabled || loading ? "disabled" : "initial"}
    >
      {loading && (
        <motion.div
          className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
};

export default Button;
