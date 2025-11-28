import React, { useState } from 'react';
import { 
  MapPin, Users, Calendar, DollarSign, CheckSquare, 
  ArrowRight, Heart, Menu, X
} from 'lucide-react';
import LoginAuth from './LoginAuth';

export default function HomePage({ onGetStarted }) {
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (showLogin) {
      return <LoginAuth onLoginSuccess={onGetStarted} onBackToHome={() => setShowLogin(false)} />;

  }
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">TripSync</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                How It Works
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
              >
                Login
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Features
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block w-full text-left py-2 text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                How It Works
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="w-full px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 leading-tight">
                Plan Your Group Trips{' '}
                <span className="text-indigo-600">Together</span>,{' '}
                <span className="text-indigo-600">Effortlessly</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Collaborate with friends and family to create unforgettable travel experiences. 
                Manage routes, tasks, expenses, and itineraries all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Start Planning Free
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Right Content - Hero Image/Illustration */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  {/* Mock Trip Card */}
                  <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <MapPin className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Summer Road Trip</h3>
                        <p className="text-sm text-gray-600">San Francisco → Las Vegas</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-600">
                        👤 You
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-600">
                        👥 Sarah
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-indigo-600">
                        👥 Mike
                      </span>
                    </div>
                  </div>

                  {/* Mock Features */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <MapPin className="text-blue-600 mx-auto mb-2" size={24} />
                      <div className="text-sm font-semibold text-gray-800">5 Stops</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <CheckSquare className="text-green-600 mx-auto mb-2" size={24} />
                      <div className="text-sm font-semibold text-gray-800">8 Tasks</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 text-center">
                      <DollarSign className="text-amber-600 mx-auto mb-2" size={24} />
                      <div className="text-sm font-semibold text-gray-800">$2,450</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <Calendar className="text-purple-600 mx-auto mb-2" size={24} />
                      <div className="text-sm font-semibold text-gray-800">7 Days</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-indigo-400 rounded-full opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need for Group Travel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make planning group trips simple and enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Interactive Maps</h3>
              <p className="text-gray-600">
                Plan your route visually with custom pins, drag-and-drop reordering, and collaborative voting on destinations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckSquare className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Task Management</h3>
              <p className="text-gray-600">
                Kanban-style task board to assign responsibilities, track progress, and ensure nothing falls through the cracks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-amber-200 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Expense Tracking</h3>
              <p className="text-gray-600">
                Split bills fairly, track who paid what, and settle up easily with automatic calculation of who owes whom.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Itinerary Builder</h3>
              <p className="text-gray-600">
                Create detailed day-by-day schedules with times, locations, and activities that everyone can access.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Real-time Collaboration</h3>
              <p className="text-gray-600">
                Invite friends via email or share link, vote on places, and see updates instantly as your group plans together.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-red-200 hover:shadow-xl transition">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Like & Dislike System</h3>
              <p className="text-gray-600">
                Vote on suggested destinations with likes and dislikes to democratically decide where your group should go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Create Your Trip</h3>
                <p className="text-gray-600">
                  Enter your trip name, starting point, and destination. Our autocomplete makes it easy to find any location.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="text-indigo-300" size={32} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Invite Your Group</h3>
                <p className="text-gray-600">
                  Share via email or link. Everyone can add stops, create tasks, log expenses, and build the itinerary together.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <ArrowRight className="text-indigo-300" size={32} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Enjoy Your Adventure</h3>
              <p className="text-gray-600">
                With everything organized and everyone on the same page, focus on making memories instead of logistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Plan Your Next Adventure?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Start organizing your group trips with ease
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-2xl inline-flex items-center gap-3"
          >
            Get Started Now
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <MapPin className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-white">TripSync</span>
            </div>

            {/* Links */}
            <div className="flex gap-6 text-sm">
              <p>TripSync. All rights reserved.</p>
            </div>
          </div>

        
        </div>
      </footer>
    </div>
  );
}