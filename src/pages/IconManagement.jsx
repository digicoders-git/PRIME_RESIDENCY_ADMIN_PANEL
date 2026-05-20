import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/api';

const IconManagement = () => {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newIcon, setNewIcon] = useState({ name: '', iconName: '', category: 'basic' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [iconSearch, setIconSearch] = useState('');
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const iconDropdownRef = useRef(null);

  const categories = [
    { value: 'all', label: 'All Icons' },
    { value: 'basic', label: 'Basic Amenities' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'services', label: 'Services' },
    { value: 'facilities', label: 'Facilities' },
    { value: 'security', label: 'Security' },
    { value: 'safety', label: 'Safety' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'policies', label: 'Policies' },
    { value: 'room-type', label: 'Room Types' }
  ];

  // Searchable icon list with friendly keywords
  const iconLibrary = [
    { value: 'FaWifi', keywords: 'wifi internet wireless network' },
    { value: 'FaSnowflake', keywords: 'ac air conditioner cooling cold' },
    { value: 'FaTv', keywords: 'tv television screen monitor' },
    { value: 'FaFire', keywords: 'geyser heater fire hot water' },
    { value: 'FaBatteryFull', keywords: 'power backup battery electricity' },
    { value: 'FaCube', keywords: 'mini fridge refrigerator cube' },
    { value: 'FaShieldAlt', keywords: 'safe locker security shield' },
    { value: 'FaDesktop', keywords: 'work desk computer desktop' },
    { value: 'FaBed', keywords: 'bed bedroom sleep' },
    { value: 'FaHome', keywords: 'home room house' },
    { value: 'FaBath', keywords: 'bath bathtub tub' },
    { value: 'FaShower', keywords: 'shower bathroom wash' },
    { value: 'FaChair', keywords: 'chair seat furniture' },
    { value: 'FaCouch', keywords: 'sofa couch lounge' },
    { value: 'FaDoorOpen', keywords: 'door entrance exit open' },
    { value: 'FaUtensils', keywords: 'utensils food dining kitchen cutlery' },
    { value: 'FaCoffee', keywords: 'coffee tea kettle maker drink' },
    { value: 'FaConciergeBell', keywords: 'concierge bell service reception' },
    { value: 'FaBalanceScale', keywords: 'balcony scale view' },
    { value: 'FaCar', keywords: 'car vehicle transport rental' },
    { value: 'FaParking', keywords: 'parking garage vehicle' },
    { value: 'FaDumbbell', keywords: 'gym fitness exercise dumbbell workout' },
    { value: 'FaTree', keywords: 'garden tree nature outdoor green' },
    { value: 'FaLock', keywords: 'lock security safe' },
    { value: 'FaKey', keywords: 'key access room entry' },
    { value: 'FaFirstAid', keywords: 'first aid medical health kit' },
    { value: 'FaSmokingBan', keywords: 'no smoking ban smoke free' },
    { value: 'FaFan', keywords: 'fan air ventilation cool' },
    { value: 'FaLightbulb', keywords: 'light bulb lamp lighting' },
    { value: 'FaBroom', keywords: 'cleaning broom housekeeping sweep' },
    { value: 'FaPaw', keywords: 'pet friendly dog cat animal paw' },
    { value: 'FaWheelchair', keywords: 'wheelchair accessible disability' },
    { value: 'FaBaby', keywords: 'baby child infant friendly' },
    { value: 'FaUserFriends', keywords: 'family friends group people' },
    { value: 'FaUser', keywords: 'single person user guest' },
    { value: 'FaPhone', keywords: 'phone telephone call' },
    { value: 'FaMapMarkerAlt', keywords: 'location map marker place' },
    { value: 'FaSwimmingPool', keywords: 'swimming pool water swim' },
    { value: 'FaHotTub', keywords: 'hot tub jacuzzi spa' },
    { value: 'FaUmbrellaBeach', keywords: 'beach umbrella sea ocean' },
    { value: 'FaMusic', keywords: 'music audio sound entertainment' },
    { value: 'FaGlassCheers', keywords: 'bar drinks party event banquet' },
    { value: 'FaCamera', keywords: 'camera cctv security photo' },
    { value: 'FaMicrophone', keywords: 'microphone mic audio sound' },
    { value: 'FaLeaf', keywords: 'leaf nature eco green lawn' },
    { value: 'FaStar', keywords: 'star rating premium luxury' },
    { value: 'FaHotel', keywords: 'hotel building property' },
    { value: 'FaElevator', keywords: 'elevator lift floor' },
    { value: 'FaRestroom', keywords: 'restroom toilet washroom' },
    { value: 'FaWind', keywords: 'wind air ventilation breeze' },
    { value: 'FaSpa', keywords: 'spa massage wellness relax' },
    { value: 'FaUmbrella', keywords: 'umbrella rain weather' },
    { value: 'FaBicycle', keywords: 'bicycle bike cycle rental' },
    { value: 'FaPlane', keywords: 'airport shuttle transport travel' },
    { value: 'FaBus', keywords: 'bus transport shuttle pickup' },
    { value: 'FaUtensils', keywords: 'restaurant food dining' },
    { value: 'FaWineGlass', keywords: 'wine bar drinks alcohol' },
    { value: 'FaPizzaSlice', keywords: 'pizza food snack' },
    { value: 'FaIceCream', keywords: 'ice cream dessert sweet' },
    { value: 'FaGamepad', keywords: 'gaming gamepad entertainment play' },
    { value: 'FaBook', keywords: 'book library reading' },
    { value: 'FaPrint', keywords: 'printer print business' },
    { value: 'FaBluetoothB', keywords: 'bluetooth wireless speaker' },
    { value: 'FaVolumeUp', keywords: 'speaker sound volume audio' },
    { value: 'FaThermometerHalf', keywords: 'temperature thermostat climate' },
    { value: 'FaTshirt', keywords: 'laundry clothes washing' },
    { value: 'FaSoap', keywords: 'soap wash hygiene clean' },
    { value: 'FaToiletPaper', keywords: 'toilet paper bathroom' },
    { value: 'FaHandsWash', keywords: 'handwash sanitizer hygiene' },
    { value: 'FaFireExtinguisher', keywords: 'fire extinguisher safety emergency' },
    { value: 'FaExclamationTriangle', keywords: 'warning alert safety' },
    { value: 'FaCheckCircle', keywords: 'check done available tick' },
    { value: 'FaClock', keywords: 'clock time checkin checkout' },
    { value: 'FaCalendarAlt', keywords: 'calendar booking date schedule' },
    { value: 'FaRupeeSign', keywords: 'rupee price cost money payment' },
    { value: 'FaPercent', keywords: 'discount offer percent deal' },
    { value: 'FaTag', keywords: 'tag price label offer' },
    { value: 'FaGift', keywords: 'gift complimentary free bonus' },
    { value: 'FaHeart', keywords: 'heart love honeymoon couple' },
    { value: 'FaMoon', keywords: 'night moon sleep rest' },
    { value: 'FaSun', keywords: 'sun morning daylight bright' },
    { value: 'FaSnowman', keywords: 'snow winter cold season' },
    { value: 'FaMountain', keywords: 'mountain view hill nature' },
    { value: 'FaCity', keywords: 'city view urban skyline' },
    { value: 'FaWater', keywords: 'water river lake view' },
  ];

  const filteredAvailableIcons = iconSearch.trim().length === 0
    ? iconLibrary.slice(0, 40)
    : iconLibrary.filter(icon =>
        icon.keywords.toLowerCase().includes(iconSearch.toLowerCase()) ||
        icon.value.toLowerCase().includes(iconSearch.toLowerCase())
      );

  const selectedAvailableIcon = iconLibrary.find(i => i.value === newIcon.iconName);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (iconDropdownRef.current && !iconDropdownRef.current.contains(e.target)) {
        setIconDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const { data } = await api.get('/icons');
      setIcons(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch icons');
    }
  };

  const handleAddIcon = async (e) => {
    e.preventDefault();
    if (!newIcon.name.trim() || !newIcon.iconName) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/icons', newIcon);
      toast.success('Icon added successfully!');
      setNewIcon({ name: '', iconName: '', category: 'basic' });
      fetchIcons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add icon');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIcon = async (id) => {
    if (!window.confirm('Delete this icon?')) return;

    try {
      await api.delete(`/icons/${id}`);
      toast.success('Icon deleted successfully!');
      fetchIcons();
    } catch (error) {
      toast.error('Failed to delete icon');
    }
  };

  const getIconComponent = (iconName) => {
    return FaIcons[iconName] || FaIcons.FaHome;
  };

  const filteredIcons = selectedCategory === 'all' 
    ? icons 
    : icons.filter(icon => icon.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Icon Management</h1>
        <p className="text-yellow-100 text-sm mt-1">Add and manage icons for amenities</p>
      </div>

      {/* Add Icon Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Icon</h2>
        <form onSubmit={handleAddIcon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={newIcon.name}
              onChange={(e) => setNewIcon({ ...newIcon, name: e.target.value })}
              placeholder="Icon display name (e.g., Swimming Pool)"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
            />
            <div className="relative" ref={iconDropdownRef}>
              {/* Trigger */}
              <button
                type="button"
                onClick={() => setIconDropdownOpen(prev => !prev)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] bg-white text-left"
              >
                {newIcon.iconName ? (
                  <>
                    {React.createElement(FaIcons[newIcon.iconName] || FaIcons.FaHome, { className: 'text-[#D4AF37] text-lg shrink-0' })}
                    <span className="text-gray-800 text-sm">{selectedAvailableIcon?.keywords.split(' ')[0] || newIcon.iconName}</span>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">Search icon (e.g. wifi, bed, parking...)</span>
                )}
                <FaIcons.FaChevronDown className="ml-auto text-gray-400 text-xs" />
              </button>

              {/* Dropdown */}
              {iconDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl">
                  <div className="p-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <FaIcons.FaSearch className="text-gray-400 text-xs shrink-0" />
                      <input
                        type="text"
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        placeholder="Search icons..."
                        className="bg-transparent text-sm outline-none w-full"
                        autoFocus
                      />
                    </div>
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filteredAvailableIcons.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-gray-400 text-center">No icons found</li>
                    ) : (
                      filteredAvailableIcons.map(icon => {
                        const Icon = FaIcons[icon.value] || FaIcons.FaHome;
                        const label = icon.keywords.split(' ')[0].charAt(0).toUpperCase() + icon.keywords.split(' ')[0].slice(1);
                        return (
                          <li
                            key={icon.value}
                            onClick={() => {
                              setNewIcon({ ...newIcon, iconName: icon.value });
                              setIconDropdownOpen(false);
                              setIconSearch('');
                            }}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-yellow-50 transition-colors ${
                              newIcon.iconName === icon.value ? 'bg-yellow-50 font-semibold' : ''
                            }`}
                          >
                            <Icon className="text-[#D4AF37] text-lg shrink-0" />
                            <span className="text-sm text-gray-700">{label}</span>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={newIcon.category}
              onChange={(e) => setNewIcon({ ...newIcon, category: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              {categories.slice(1).map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {newIcon.iconName && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-600 text-sm">Preview:</span>
                {React.createElement(getIconComponent(newIcon.iconName), { className: 'text-2xl text-[#D4AF37]' })}
                <span className="text-sm text-gray-700 font-medium">
                  {selectedAvailableIcon ? selectedAvailableIcon.keywords.split(' ')[0].charAt(0).toUpperCase() + selectedAvailableIcon.keywords.split(' ')[0].slice(1) : newIcon.iconName}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:from-[#B8860B] hover:to-[#D4AF37] transition-all font-medium disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Icon'}
          </button>
        </form>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#D4AF37] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icons List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Icons List ({filteredIcons.length})</h2>
        {filteredIcons.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No icons added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIcons.map((icon) => {
              const IconComponent = getIconComponent(icon.iconName);
              return (
                <div
                  key={icon._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {React.createElement(IconComponent, {
                      className: 'text-2xl text-[#D4AF37]'
                    })}
                    <div>
                      <p className="font-medium text-gray-800">{icon.name}</p>
                      <p className="text-xs text-gray-500">{icon.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteIcon(icon._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaIcons.FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default IconManagement;
