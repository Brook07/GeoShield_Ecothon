'use client';

import Link from 'next/link';
import { MapPin, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Animated background terrain */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 terrain-gradient animate-pulse" />
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <pattern id="terrain" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 0 15 Q 5 10 10 15 T 20 15" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#terrain)" />
        </svg>
      </div>

      {/* Animated rainfall effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-12 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 1}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing map markers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-400 rounded-full opacity-50 animate-ping" />
        
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-orange-400 rounded-full opacity-50 animate-ping" />
        
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full opacity-50 animate-ping" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-bold tracking-wider">GeoShield AI</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Decoding Nature
              </span>
              {' '}
              <span className="text-white">
                for a Safer Tomorrow
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Real-time landslide risk prediction powered by satellite intelligence, AI-driven analysis, and environmental data integration. Protecting communities before disaster strikes.
          </p>

          {/* Risk Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6 sm:py-8 px-4 sm:px-0">
            <div className="glass-card p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">214</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">km² At Risk</div>
            </div>
            <div className="glass-card p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-orange-400">18</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Critical Zones</div>
            </div>
            <div className="glass-card p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold text-red-400">13.5K</div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">Exposed People</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 sm:pt-8">
            <Link
              href="/dashboard"
              className="group relative px-8 py-3 sm:py-4 bg-gradient-green text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <MapPin className="w-5 h-5" />
              Explore Risk Map
              <div className="absolute inset-0 rounded-lg glow-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/simulation"
              className="px-8 py-3 sm:py-4 border-2 border-blue-400 text-blue-400 font-semibold rounded-lg hover:bg-blue-400/10 transition-colors duration-300 flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <Zap className="w-5 h-5" />
              Run Simulation
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="pt-12 animate-bounce">
            <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex items-center justify-center mx-auto">
              <div className="w-1 h-2 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
