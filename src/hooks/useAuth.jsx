import { useState, useEffect } from 'react';

export const useAuth = (data, setData) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('erpCurrentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erpCurrentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('erpCurrentUser');
    }
  }, [currentUser]);

  const registerUser = (name, email, password) => {
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return false;
    }
    const newUser = { id: Date.now(), name, email, password, role: 'user' };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return true;
  };

  const loginUser = (email, password) => {
    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (name, email) => {
    if (!currentUser) return false;

    const emailExists = data.users.some(user => user.email === email && user.id !== currentUser.id);
    if (emailExists) {
      return false;
    }

    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id ? { ...user, name, email } : user
      ),
    }));
    setCurrentUser(prev => ({ ...prev, name, email }));
    return true;
  };

  const changeUserPassword = (currentPassword, newPassword) => {
    if (!currentUser || currentUser.password !== currentPassword) {
      return false;
    }
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id ? { ...user, password: newPassword } : user
      ),
    }));
    setCurrentUser(prev => ({ ...prev, password: newPassword }));
    return true;
  };

  const requestPasswordReset = (email) => {
    const user = data.users.find(u => u.email === email);
    if (user) {
      console.log(`[DEV ONLY] Password reset requested for ${email}. Password is: ${user.password}`);
      return true;
    }
    return false;
  };

  return {
    currentUser,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    requestPasswordReset,
  };
};