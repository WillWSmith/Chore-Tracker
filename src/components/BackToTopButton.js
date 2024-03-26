import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const BackToTopButton = ({ theme }) => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      window.scrollY > 20 ? setShowTopBtn(true) : setShowTopBtn(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    showTopBtn && (
      <button
        className={`top-btn ${theme}`}
        onClick={scrollToTop}
        aria-label="Back to Top"
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    )
  );
};

export default BackToTopButton;