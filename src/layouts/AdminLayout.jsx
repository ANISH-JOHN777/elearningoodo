import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, BookOpen, BarChart3, LogOut, Home, TrendingUp, PieChart } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/reporting', label: 'Reports', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 animate-slide-in-down">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 group">
              <LayoutDashboard className="w-8 h-8 text-primary-600 group-hover:animate-wiggle transition-transform" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LearnSphere</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-10 h-10 rounded-full border-2 border-primary-500 hover:scale-110 transition-transform avatar-online"
              />
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all hover:rotate-12 btn-press"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] animate-slide-in-left">
          <nav className="p-4 space-y-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:translate-x-1 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium shadow-sm border-l-4 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse-soft' : 'group-hover:scale-110 transition-transform'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            
            {/* Back to Courses */}
            <Link
              to="/courses"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 hover:translate-x-1 group text-gray-700 hover:bg-gray-50"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Back to Courses</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
