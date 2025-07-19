import { useState, useRef, useEffect } from 'react';
import { useTracking } from '../Context/Tracking';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    profile: {
      name: '',
      address: '',
      company: '',
      phone: '',
      bio: ''
    },
    companyProfile: {
      companyName: '',
      industry: '',
      companySize: '',
      businessType: ''
    },
    email: '',
    username: ''
  });

  const dropdownRef = useRef(null);
  const { currentUser, userProfile } = useTracking();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        profile: {
          name: userProfile.profile?.name || '',
          address: userProfile.profile?.address || '',
          company: userProfile.profile?.company || '',
          phone: userProfile.profile?.phone || '',
          bio: userProfile.profile?.bio || ''
        },
        companyProfile: {
          companyName: userProfile.companyProfile?.companyName || '',
          industry: userProfile.companyProfile?.industry || '',
          companySize: userProfile.companyProfile?.companySize || '',
          businessType: userProfile.companyProfile?.businessType || ''
        },
        email: userProfile.email || '',
        username: userProfile.username || ''
      });
    }
  }, [userProfile]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/user/profile?userId=${currentUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (result.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        // Optionally refresh user profile in context
      } else {
        alert('Failed to update profile: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDirectInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = () => {
    const name = userProfile?.profile?.name || userProfile?.username || 'User';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = () => {
    switch (userProfile?.role) {
      case 'supplier': return 'bg-green-500';
      case 'producer': return 'bg-blue-500';
      case 'customer': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = () => {
    switch (userProfile?.role) {
      case 'supplier': return '📦';
      case 'producer': return '🏭';
      case 'customer': return '🛒';
      default: return '👤';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full ${getRoleColor()} text-white font-bold text-sm flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg`}
        title={`${userProfile?.profile?.name || userProfile?.username || 'User'} (${userProfile?.role || 'User'})`}
      >
        {getInitials()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {!isEditing ? (
            // View Mode
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4 pb-3 border-b">
                <div className={`w-12 h-12 rounded-full ${getRoleColor()} text-white font-bold text-lg flex items-center justify-center`}>
                  {getInitials()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {userProfile?.profile?.name || userProfile?.username || 'User'}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="mr-1">{getRoleIcon()}</span>
                    {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1) || 'User'}
                  </p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                  <p className="text-sm text-gray-800">{userProfile?.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Username</label>
                  <p className="text-sm text-gray-800">{userProfile?.username || 'Not provided'}</p>
                </div>

                {userProfile?.profile?.phone && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                    <p className="text-sm text-gray-800">{userProfile.profile.phone}</p>
                  </div>
                )}

                {userProfile?.profile?.address && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                    <p className="text-sm text-gray-800">{userProfile.profile.address}</p>
                  </div>
                )}

                {userProfile?.companyProfile?.companyName && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Company</label>
                    <p className="text-sm text-gray-800">{userProfile.companyProfile.companyName}</p>
                  </div>
                )}

                {userProfile?.companyProfile?.industry && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</label>
                    <p className="text-sm text-gray-800">{userProfile.companyProfile.industry}</p>
                  </div>
                )}
              </div>

              {/* Wallet Address */}
              <div className="mb-4 p-2 bg-gray-50 rounded">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wallet Address</label>
                <p className="text-xs text-gray-600 font-mono break-all">{currentUser}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-semibold text-gray-800">Edit Profile</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Basic Information */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.profile.name}
                    onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleDirectInputChange('email', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleDirectInputChange('username', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profileData.profile.phone}
                    onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={profileData.profile.address}
                    onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
                    rows="2"
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={profileData.companyProfile.companyName}
                    onChange={(e) => handleInputChange('companyProfile', 'companyName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={profileData.companyProfile.industry}
                    onChange={(e) => handleInputChange('companyProfile', 'industry', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Industry</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Technology">Technology</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Food">Food</option>
                    <option value="Construction">Construction</option>
                    <option value="Education">Education</option>
                    <option value="Government">Government</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 pt-3 border-t">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
