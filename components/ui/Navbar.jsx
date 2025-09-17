"use client";

import Link from "next/link";
import { useRef } from "react";
import { useMusic } from "./MusicProvider";
import { usePathname } from "next/navigation";
import "./Navbar.css";

// normalize helper to compare routes safely
const normalize = (p) => (p || "/").replace(/\/+$/, "") || "/";

export default function Navbar() {
  const { isMuted } = useMusic();
  const navBtnHoverRef = useRef(null);
  const navBtnClickRef = useRef(null);
  const pathname = usePathname();

  const handleNavBtnMouseEnter = () => {
    if (isMuted) return;
    const audio = navBtnHoverRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const handleNavBtnClickSound = () => {
    if (isMuted) return;
    const audio = navBtnClickRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  // prevent re-navigation when already on that route (stops Canvas remount/zoom jumps)
  const handleSamePageClick = (e, href) => {
    if (normalize(pathname) === normalize(href)) {
      e.preventDefault(); // do nothing if you're already there
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about-us/", label: "About Chitra Lane" },
    { href: "/donate/", label: "Donate Here" },
    { href: "/what-we-do/", label: "What We Do" },
    { href: "/online-education/", label: "Online Education Program" },
    { href: "/shop/", label: "Shop" },
    { href: "/contact/", label: "Contact Us" },
  ];

  const isActive = (href) => {
    if (href === "/") return normalize(pathname) === "/";
    return normalize(pathname) === normalize(href);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onMouseEnter={handleNavBtnMouseEnter}>
        <Link
          href="/"
          onClick={(e) => {
            handleNavBtnClickSound();
            handleSamePageClick(e, "/");
          }}
          scroll={false}
          className="navbar-logo-link"
          aria-label="Go to Home"
        >
          <img
            src="/assets/images/logo.png"
            alt="Chitra Lane Logo"
            className="navbar-logo"
            draggable="false"
          />
        </Link>
      </div>

      <ul className="navbar-links">
        {navLinks.map((link) => (
          <li key={link.href} className="navbar-item">
            <Link
              href={link.href}
              scroll={false}
              onMouseEnter={handleNavBtnMouseEnter}
              onClick={(e) => {
                handleNavBtnClickSound();
                handleSamePageClick(e, link.href);
              }}
              className={`navbar-link${isActive(link.href) ? " active" : ""}`}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {/* Search button gets the same clickable box styling */}
        <li className="navbar-item">
          <button
            type="button"
            className="navbar-link navbar-search-btn"
            onMouseEnter={handleNavBtnMouseEnter}
            onClick={handleNavBtnClickSound}
            aria-label="Search"
          >
            🔍
          </button>
        </li>
      </ul>

      {/* sounds */}
      <audio
        ref={navBtnHoverRef}
        src="/assets/button-hover-click.wav"
        preload="auto"
      />
      <audio
        ref={navBtnClickRef}
        src="/assets/old-computer-click.mp3"
        preload="auto"
      />
    </nav>
  );
}
