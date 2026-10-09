import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, ChevronRight, ArrowLeft, Lock, Unlock, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar({ currentAppName, onSignIn }) {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    setMobileMenuOpen(false);
    onSignIn();
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <nav className="apple-global-nav" role="navigation" aria-label="Main Navigation">
      <div className="nav-container">

        {/* Left — Brand + Breadcrumb */}
        <div className="nav-left">
          <Link to="/" className="nav-brand" aria-label="3D Apps Directory Home">
            <div className="nav-logo-icon">
              <Box size={18} strokeWidth={2.2} />
            </div>
            <span className="nav-brand-title">3D Apps</span>
          </Link>

          {!isHome && currentAppName && (
            <div className="nav-breadcrumbs">
              <ChevronRight size={14} className="crumb-separator" />
              <span className="crumb-current">{currentAppName}</span>
            </div>
          )}
        </div>

        {/* Right — Desktop */}
        <div className="nav-right nav-right--desktop">
          {!isHome ? (
            <Link to="/" className="nav-back-link">
              <ArrowLeft size={15} />
              <span>Back to Directory</span>
            </Link>
          ) : isAuthenticated ? (
            <div className="nav-auth-group">
              <div className="nav-auth-pill nav-auth-pill--active">
                <Unlock size={13} />
                <span>Admin</span>
              </div>
              <button
                className="nav-signout-btn"
                onClick={handleSignOut}
                aria-label="Sign out"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              className="nav-signin-btn"
              onClick={handleSignIn}
              aria-label="Sign in as admin"
            >
              <Lock size={13} />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="nav-mobile-menu">
          {!isHome && (
            <Link
              to="/"
              className="nav-mobile-item"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ArrowLeft size={15} />
              <span>Back to Directory</span>
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <div className="nav-mobile-item nav-mobile-auth">
                <Unlock size={14} />
                <span>Signed in as Admin</span>
              </div>
              <button
                className="nav-mobile-item nav-mobile-signout"
                onClick={handleSignOut}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <button
              className="nav-mobile-item nav-mobile-signin"
              onClick={handleSignIn}
            >
              <Lock size={14} />
              <span>Sign In as Admin</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
