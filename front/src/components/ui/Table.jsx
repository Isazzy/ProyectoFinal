// ========================================
// src/components/ui/Table.jsx
// ========================================
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from '../../styles/Table.module.css';

export const Table = ({ children, className = '' }) => (
  <div className={classNames(styles.tableWrapper, className)}>
    <table className={styles.table}>{children}</table>
  </div>
);

export const Thead = ({ children }) => <thead className={styles.thead}>{children}</thead>;
export const Tbody = ({ children }) => <tbody className={styles.tbody}>{children}</tbody>;
export const Tr = ({ children, onClick, className = '' }) => (
  <motion.tr
    className={classNames(styles.tr, { [styles.clickable]: onClick }, className)}
    onClick={onClick}
    whileHover={{ backgroundColor: '#F9FAFB' }}
  >
    {children}
  </motion.tr>
);
export const Th = ({ children, className = '', align = 'left' }) => (
  <th className={classNames(styles.th, styles[`align-${align}`], className)}>{children}</th>
);
export const Td = ({ children, className = '', align = 'left' }) => (
  <td className={classNames(styles.td, styles[`align-${align}`], className)}>{children}</td>
);

Table.Head = Thead;
Table.Body = Tbody;
Table.Row = Tr;
Table.Header = Th;
Table.Cell = Td;