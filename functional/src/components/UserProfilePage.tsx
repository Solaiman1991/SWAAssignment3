import React, { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { deleteUserProfile, updateProfile } from '../redux/userSlice';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.userSlice.profile);

  const [username, setUsername] = useState(userProfile?.username || '');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...userProfile,
      username,        // Updated username
      password         // Updated password
    };
  
    dispatch(updateProfile(updatedProfile));
  
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.username === userProfile.username);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedProfile };
      localStorage.setItem('users', JSON.stringify(users));
    }
    alert("your credintial have been updated");
  };
  

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(user => user.username !== userProfile.username);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      dispatch(deleteUserProfile());
      
    }
  };
  
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setPassword('');
      console.log('Updated user profile:', userProfile);

    }
  }, [userProfile]);

  return (
    <div className="user-profile-container">
      <form onSubmit={handleSubmit} className="user-profile-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Username"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="New Password"
            className="form-control"
          />
        </div>

        <button type="submit" className="btn btn-primary">Update Profile</button>
        <button onClick={handleDeleteAccount} className="btn btn-danger">
          Delete Account
        </button>
      </form>
    </div>
  );
};

export default UserProfilePage;
