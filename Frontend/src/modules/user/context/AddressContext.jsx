import React, { createContext, useContext, useState, useEffect } from 'react';

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

const initialDefaultAddresses = [
  {
    id: 1,
    type: 'Home',
    name: 'John Doe',
    address: '123, Palm Grove Apartment, Sector 45',
    city: 'Noida',
    state: 'Uttar Pradesh',
    zip: '201301',
    phone: '+91 98765 43210',
    isDefault: true
  },
  {
    id: 2,
    type: 'Work',
    name: 'John Doe',
    address: 'Tech Park, Building 5, 8th Floor',
    city: 'Gurugram',
    state: 'Haryana',
    zip: '122001',
    phone: '+91 98765 43210',
    isDefault: false
  }
];

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('shippnex_user_addresses');
      return saved ? JSON.parse(saved) : initialDefaultAddresses;
    } catch {
      return initialDefaultAddresses;
    }
  });

  const [activeAddressId, setActiveAddressId] = useState(() => {
    try {
      const savedId = localStorage.getItem('shippnex_active_address_id');
      if (savedId) return Number(savedId);
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      return defaultAddr ? defaultAddr.id : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    localStorage.setItem('shippnex_user_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('shippnex_active_address_id', String(activeAddressId));
  }, [activeAddressId]);

  const activeAddress = addresses.find(a => a.id === activeAddressId) || addresses[0] || initialDefaultAddresses[0];

  const selectAddress = (id) => {
    setActiveAddressId(id);
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const addAddress = (newAddr) => {
    const created = {
      id: Date.now(),
      type: newAddr.type || 'Home',
      name: newAddr.name || '',
      address: newAddr.address || '',
      city: newAddr.city || '',
      state: newAddr.state || '',
      zip: newAddr.zip || '',
      phone: newAddr.phone || '',
      isDefault: true
    };
    setAddresses(prev => [created, ...prev.map(a => ({ ...a, isDefault: false }))]);
    setActiveAddressId(created.id);
    return created;
  };

  const updateAddress = (id, updatedData) => {
    setAddresses(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const deleteAddress = (id) => {
    setAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (activeAddressId === id && filtered.length > 0) {
        setActiveAddressId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <AddressContext.Provider value={{
      addresses,
      activeAddress,
      activeAddressId,
      selectAddress,
      addAddress,
      updateAddress,
      deleteAddress
    }}>
      {children}
    </AddressContext.Provider>
  );
};
