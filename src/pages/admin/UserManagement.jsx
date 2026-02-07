import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  Filter,
  Shield,
  Lock,
  Unlock,
  Trash2,
  Eye,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

/**
 * UserManagement Component
 * Admin interface for managing users - suspend, ban, restore
 * View user details, activity, and status
 */
export default function UserManagement() {
  const { users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserActions, setShowUserActions] = useState(null);
  const [userStatuses, setUserStatuses] = useState({});

  // Initialize user statuses (active by default)
  const getInitialStatuses = () => {
    const statuses = {};
    users.forEach((user) => {
      if (!userStatuses[user.id]) {
        statuses[user.id] = 'active';
      }
    });
    return { ...userStatuses, ...statuses };
  };

  React.useEffect(() => {
    setUserStatuses(getInitialStatuses());
  }, [users.length]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((user) => {
        const status = userStatuses[user.id] || 'active';
        return status === filterStatus;
      });
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [users, searchTerm, filterRole, filterStatus, userStatuses]);

  // Mock user statistics
  const getUserStats = (userId) => ({
    coursesEnrolled: Math.floor(Math.random() * 10) + 1,
    pointsEarned: Math.floor(Math.random() * 2000) + 100,
    coursesCompleted: Math.floor(Math.random() * 5),
    joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
  });

  // Handle status change
  const handleStatusChange = (userId, newStatus) => {
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: newStatus,
    }));
    setShowUserActions(null);
  };

  // Stats cards
  const stats = useMemo(() => {
    const total = users.length;
    const active = Object.values(userStatuses).filter((s) => s === 'active').length;
    const suspended = Object.values(userStatuses).filter((s) => s === 'suspended').length;
    const banned = Object.values(userStatuses).filter((s) => s === 'banned').length;

    return { total, active, suspended, banned };
  }, [users, userStatuses]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'banned':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4" />;
      case 'banned':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary-600" />
          User Management
        </h1>
        <p className="text-gray-600 text-lg">
          Manage user accounts, suspend, ban, or restore users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {[
          {
            label: 'Total Users',
            value: stats.total,
            icon: Users,
            color: 'bg-primary-500',
          },
          {
            label: 'Active',
            value: stats.active,
            icon: CheckCircle,
            color: 'bg-emerald-500',
          },
          {
            label: 'Suspended',
            value: stats.suspended,
            icon: AlertCircle,
            color: 'bg-yellow-500',
          },
          {
            label: 'Banned',
            value: stats.banned,
            icon: XCircle,
            color: 'bg-red-500',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.color} rounded-xl p-6 shadow-lg text-white`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <Icon className="w-8 h-8 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              User Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="learner">Learner</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              User Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const status = userStatuses[user.id] || 'active';
              const userStats = getUserStats(user.id);

              return (
                <div
                  key={user.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                >
                  {/* User Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-primary-200"
                      />

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {user.name}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <span className="px-3 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 border border-gray-300 capitalize">
                            {user.role}
                          </span>
                        </div>

                        {/* Email and Join Date */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Joined {userStats.joinDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserActions(
                            showUserActions === user.id ? null : user.id
                          );
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {/* Actions Dropdown */}
                      {showUserActions === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                          {/* View Details */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setShowUserActions(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition text-left border-b border-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>

                          {/* Status Actions */}
                          {status === 'active' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, 'suspended');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-yellow-600 hover:bg-yellow-50 transition text-left border-b border-gray-100"
                              >
                                <AlertCircle className="w-4 h-4" />
                                Suspend User
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, 'banned');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Ban User
                              </button>
                            </>
                          )}

                          {status === 'suspended' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, 'active');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 transition text-left border-b border-gray-100"
                              >
                                <Unlock className="w-4 h-4" />
                                Restore User
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(user.id, 'banned');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Ban User
                              </button>
                            </>
                          )}

                          {status === 'banned' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(user.id, 'active');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-emerald-600 hover:bg-emerald-50 transition text-left"
                            >
                              <Unlock className="w-4 h-4" />
                              Restore User
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Courses',
                        value: userStats.coursesEnrolled,
                        icon: BookOpen,
                      },
                      {
                        label: 'Points',
                        value: userStats.pointsEarned,
                        icon: Award,
                      },
                      {
                        label: 'Completed',
                        value: userStats.coursesCompleted,
                        icon: CheckCircle,
                      },
                      {
                        label: 'Joined',
                        value: new Date().getFullYear() - userStats.joinDate.getFullYear() + ' years',
                        icon: TrendingUp,
                      },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Details */}
                  {selectedUser?.id === user.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      <h4 className="font-bold text-primary-600 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        User Details
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: 'User ID', value: user.id },
                          {
                            label: 'Email',
                            value: user.email,
                          },
                          {
                            label: 'Role',
                            value: user.role.charAt(0).toUpperCase() + user.role.slice(1),
                          },
                          {
                            label: 'Status',
                            value: status.charAt(0).toUpperCase() + status.slice(1),
                          },
                          {
                            label: 'Join Date',
                            value: userStats.joinDate.toLocaleDateString(),
                          },
                          {
                            label: 'Points Earned',
                            value: userStats.pointsEarned.toLocaleString(),
                          },
                          {
                            label: 'Courses Enrolled',
                            value: userStats.coursesEnrolled,
                          },
                          {
                            label: 'Courses Completed',
                            value: userStats.coursesCompleted,
                          },
                        ].map((detail, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <p className="text-xs text-gray-500 mb-1">{detail.label}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {detail.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Status Change Section */}
                      {status !== 'active' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800 mb-3">
                            This user is currently <strong>{status}</strong>
                          </p>
                          {status === 'suspended' && (
                            <p className="text-xs text-yellow-700 mb-3">
                              Suspended users cannot access courses or participate in learning activities.
                            </p>
                          )}
                          {status === 'banned' && (
                            <p className="text-xs text-red-700 mb-3">
                              Banned users are permanently denied access to the platform.
                            </p>
                          )}
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold whitespace-nowrap rounded-lg transition flex items-center gap-2"
                          >
                            <Unlock className="w-4 h-4" />
                            Restore User
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" />
          User Status Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Active',
              icon: CheckCircle,
              bgColor: 'bg-emerald-50',
              borderColor: 'border-emerald-200',
              iconColor: 'text-emerald-500',
              textColor: 'text-emerald-800',
              description: 'User can access all courses and participate in learning',
            },
            {
              title: 'Suspended',
              icon: AlertCircle,
              bgColor: 'bg-yellow-50',
              borderColor: 'border-yellow-200',
              iconColor: 'text-yellow-500',
              textColor: 'text-yellow-800',
              description: 'User is temporarily restricted from accessing courses',
            },
            {
              title: 'Banned',
              icon: XCircle,
              bgColor: 'bg-red-50',
              borderColor: 'border-red-200',
              iconColor: 'text-red-500',
              textColor: 'text-red-800',
              description: 'User is permanently denied access to the platform',
            },
          ].map((status, idx) => {
            const Icon = status.icon;
            return (
              <div
                key={idx}
                className={`p-4 ${status.bgColor} border ${status.borderColor} rounded-lg`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${status.iconColor} mt-0.5`} />
                  <h4 className={`font-bold ${status.textColor}`}>{status.title}</h4>
                </div>
                <p className={`text-sm ${status.textColor}`}>
                  {status.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
