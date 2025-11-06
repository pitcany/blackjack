import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ rank, suit, hidden = false, delay = 0 }) => {
  const isRed = suit === '♥' || suit === '♦';
  
  return (
    <motion.div
      className={`card ${hidden ? 'card-hidden' : ''}`}
      initial={{ scale: 0, rotateY: 180 }}
      animate={{ scale: 1, rotateY: hidden ? 180 : 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {!hidden ? (
        <>
          <div className="card-content">
            <div className="card-corner top-left">
              <div className={`rank ${isRed ? 'red' : 'black'}`}>{rank}</div>
              <div className={`suit ${isRed ? 'red' : 'black'}`}>{suit}</div>
            </div>
            <div className="card-center">
              <div className={`suit-large ${isRed ? 'red' : 'black'}`}>{suit}</div>
            </div>
            <div className="card-corner bottom-right">
              <div className={`rank ${isRed ? 'red' : 'black'}`}>{rank}</div>
              <div className={`suit ${isRed ? 'red' : 'black'}`}>{suit}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="card-back">
          <div className="card-back-pattern"></div>
        </div>
      )}
    </motion.div>
  );
};

export default Card;
