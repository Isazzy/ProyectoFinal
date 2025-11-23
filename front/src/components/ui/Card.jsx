// ========================================
// src/components/ui/Card.jsx
// ========================================
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from '../../styles/Card.module.css';

export const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  onClick,
  as: Component = 'div',
  ...props
}) => {
  const paddings = { none: '', sm: styles.paddingSm, md: styles.paddingMd, lg: styles.paddingLg };
  const cardClasses = classNames(
    styles.card,
    paddings[padding],
    { [styles.hoverable]: hover, [styles.clickable]: onClick },
    className
  );

  const MotionComponent = motion[Component] || motion.div;

  return (
    <MotionComponent
      className={cardClasses}
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } : {}}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
