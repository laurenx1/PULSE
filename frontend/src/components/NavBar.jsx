import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = ({ user, setViewInteracted }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const handleGoFeatured = () => {
    navigate(`/${user.id}/featured`);
  };

  const handleGoPulseCheck = () => {
    navigate(`/${user.id}/pulsecheck`);
  };

  const handleViewLiked = () => {
    setViewInteracted('liked');
    navigate(`/${user.id}/seeYourContent`);
  };

  const handleViewSaved = () => {
    setViewInteracted('saved');
    navigate(`/${user.id}/seeYourContent`);
  };

  const handleGoUserProfile = () => {
    navigate(`/profile/${user.id}`);
  };

  const handleSignOut = () => {
    setIsModalOpen(true);
  };

  const confirmSignOut = () => {
    setIsModalOpen(false);
    navigate(`/`);
  };

  const handleClickAway = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickAway);
    } else {
      document.removeEventListener('mousedown', handleClickAway);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [isModalOpen]);

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">PULSE</h1>
        <nav className="space-x-1 bg-transparent">
          <button
            className="btn text-pink-500 text-2xl hover:text-pink-700 bg-transparent"
            onClick={handleViewLiked}
          >
            ♥
          </button>
          <button
            className="btn text-purple-500 text-2xl hover:text-purple-700 bg-transparent hover:bg-transparent"
            onClick={handleViewSaved}
          >
            ★
          </button>
          <button
            className="btn text-white text-xl hover:text-gray-300 bg-transparent hover:bg-transparent"
            onClick={handleGoFeatured}
          >
            Featured Stories
          </button>
          <button
            className="btn text-white text-xl hover:text-gray-300 bg-transparent hover:bg-transparent"
            onClick={handleGoPulseCheck}
          >
            PULSECHECK
          </button>
          <button
            className="btn text-[#00FA9A] text-xl hover:text-[#32CD32] bg-transparent hover:bg-transparent"
            onClick={handleGoUserProfile}
          >
            {user.username}
          </button>
          <button className="btn text-white text-xl hover:text-gray-300 bg-transparent hover:bg-transparent">
            About Us
          </button>
          <button
            className="btn text-white hover:text-gray-300 bg-transparent hover:bg-transparent"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </nav>
      </header>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Sign Out</h2>
            <p className="mb-4">Are you sure you want to sign out?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="btn btn-primary"
                onClick={confirmSignOut}
              >
                Yes, Sign Out
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;




