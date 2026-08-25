/** Light-theme overrides and lightweight welcome animations. */
export const WELCOME_THEME_CSS = `
        .welcome-light { background: #f5f6fb !important; color: #0b0b1a !important; }
        .welcome-light .bg-\\[\\#070713\\],
        .welcome-light .bg-\\[\\#070713\\]\\/80,
        .welcome-light .bg-\\[\\#070713\\]\\/95,
        .welcome-light .bg-\\[\\#06060f\\] { background-color: rgba(245,246,251,0.95) !important; }
        .welcome-light .bg-\\[\\#10101f\\],
        .welcome-light .bg-\\[\\#10101f\\]\\/80 { background-color: rgba(255,255,255,0.92) !important; }
        .welcome-light .text-white { color: #0b0b1a !important; }
        .welcome-light .text-white\\/90 { color: rgba(11,11,26,0.9) !important; }
        .welcome-light .text-white\\/85 { color: rgba(11,11,26,0.86) !important; }
        .welcome-light .text-white\\/80 { color: rgba(11,11,26,0.82) !important; }
        .welcome-light .text-white\\/70 { color: rgba(11,11,26,0.74) !important; }
        .welcome-light .text-white\\/65 { color: rgba(11,11,26,0.7) !important; }
        .welcome-light .text-white\\/60 { color: rgba(11,11,26,0.66) !important; }
        .welcome-light .text-white\\/55 { color: rgba(11,11,26,0.62) !important; }
        .welcome-light .text-white\\/50 { color: rgba(11,11,26,0.6) !important; }
        .welcome-light .text-white\\/45 { color: rgba(11,11,26,0.58) !important; }
        .welcome-light .text-white\\/40 { color: rgba(11,11,26,0.55) !important; }
        .welcome-light .text-white\\/30 { color: rgba(11,11,26,0.5) !important; }
        .welcome-light .border-white\\/5 { border-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .border-white\\/10 { border-color: rgba(11,11,26,0.12) !important; }
        .welcome-light .border-white\\/15 { border-color: rgba(11,11,26,0.16) !important; }
        .welcome-light .border-white\\/\\[0\\.07\\] { border-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .bg-white\\/5,
        .welcome-light .bg-white\\/10,
        .welcome-light .bg-white\\/15,
        .welcome-light .bg-white\\/\\[0\\.03\\],
        .welcome-light .bg-white\\/\\[0\\.04\\],
        .welcome-light .bg-white\\/\\[0\\.06\\],
        .welcome-light .bg-white\\/\\[0\\.08\\] { background-color: rgba(11,11,26,0.05) !important; }
        .welcome-light .hover\\:bg-white\\/5:hover,
        .welcome-light .hover\\:bg-white\\/10:hover,
        .welcome-light .hover\\:bg-white\\/\\[0\\.08\\]:hover { background-color: rgba(11,11,26,0.08) !important; }
        .welcome-light .hover\\:text-white:hover { color: #0b0b1a !important; }
        .welcome-light .text-purple-300 { color: #6d28d9 !important; }
        .welcome-light .text-purple-200 { color: #5b21b6 !important; }
        .welcome-light .hover\\:text-purple-200:hover { color: #4c1d95 !important; }
        .welcome-light .stat-value {
          background-image: none !important;
          -webkit-text-fill-color: #0b0b1a !important;
          color: #0b0b1a !important;
        }
        .welcome-light .stat-tile {
          background: linear-gradient(135deg, color-mix(in oklab, var(--stat-tint) 30%, #ffffff), color-mix(in oklab, var(--stat-tint) 14%, #ffffff)) !important;
          box-shadow: 0 8px 20px -10px color-mix(in oklab, var(--stat-tint) 65%, transparent), inset 0 1px 0 rgba(255,255,255,0.6) !important;
          --tw-ring-color: color-mix(in oklab, var(--stat-tint) 35%, transparent) !important;
        }
        .welcome-light .stat-icon { color: color-mix(in oklab, var(--stat-tint) 75%, #0b0b1a) !important; }
        .welcome-light .stat-cell::after { background-color: rgba(11,11,26,0.14) !important; }
        .welcome-light .stat-cell:hover { background-color: rgba(11,11,26,0.04) !important; }
        .welcome-light .hero-dark-preview .text-white { color: #ffffff !important; }
        .welcome-light .hero-dark-preview .text-white\/90 { color: rgba(255,255,255,0.9) !important; }
        .welcome-light .hero-dark-preview .text-white\/85 { color: rgba(255,255,255,0.86) !important; }
        .welcome-light .hero-dark-preview .text-white\/80 { color: rgba(255,255,255,0.82) !important; }
        .welcome-light .hero-dark-preview .text-white\/70 { color: rgba(255,255,255,0.72) !important; }
        .welcome-light .hero-dark-preview .text-white\/60 { color: rgba(255,255,255,0.62) !important; }
        .welcome-light .hero-dark-preview .text-white\/55 { color: rgba(255,255,255,0.56) !important; }
        .welcome-light .hero-dark-preview .text-white\/50 { color: rgba(255,255,255,0.52) !important; }
        .welcome-light .hero-dark-preview .text-white\/45 { color: rgba(255,255,255,0.46) !important; }
        .welcome-light .hero-dark-preview .text-white\/40 { color: rgba(255,255,255,0.42) !important; }
        .welcome-light .hero-dark-preview .text-white\/35 { color: rgba(255,255,255,0.38) !important; }
        .welcome-light .hero-dark-preview .border-white\/10 { border-color: rgba(255,255,255,0.1) !important; }
        .welcome-light .hero-dark-preview .border-white\/15 { border-color: rgba(255,255,255,0.15) !important; }
        .welcome-light .hero-dark-preview .bg-white\/15 { background-color: rgba(255,255,255,0.15) !important; }
        .welcome-light .hero-dark-preview .bg-white\/\[0\.04\] { background-color: rgba(255,255,255,0.04) !important; }
        @keyframes welcome-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce-slow { animation: welcome-float 4s ease-in-out infinite; }
      `;
