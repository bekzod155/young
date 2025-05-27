import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <video autoPlay loop muted className="background-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="top-left-button">
        <Link to="/login" className="btn btn-success">
          <i className="bi bi-person"></i> Kirish
        </Link>
      </div>
      <div className="content">
        <div className="row">
          <div className="col-12 col-md-8 d-flex align-items-center">
            <motion.h1
              className="animated-title"
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 ,duration: 1.5}}
            >
              Welcome to the Inventory Management System Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio, maxime!
            </motion.h1>
          </div>
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <motion.img
              src="/Shavkat_Mirziyoyev.jpg"
              alt="Shavkat Mirziyoyev"
              className="rounded-image img-fluid animated-image"
              initial={{ x: 1000 }}
              animate={{ x: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 ,duration: 1.5}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;