import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button.jsx';

const CreateOrJoinRandom = ({
  onClick,
  disabled,
  loading,
  className = '',
  children
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        variant="primary"
        className="w-full text-sm sm:text-base py-2.5 sm:py-3"
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default CreateOrJoinRandom;
