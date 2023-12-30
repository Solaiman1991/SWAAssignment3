import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, registerSuccess, registerFailure } from '../redux/userSlice';
import { resetGame } from '../redux/gameSlice'; 
import './LoginPage.css';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State for create user form
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  const handleCreateUser = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(user => user.username === createUsername);

    if (userExists) {
      alert('User already exists');
      return;
    }

    const newUser = { username: createUsername, password: createPassword };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    dispatch(registerSuccess({ username: createUsername, email: '', name: '', password: createPassword }));

    alert('User created successfully');
  };

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(user => user.username === loginUsername && user.password === loginPassword);

    if (user) {
      dispatch(login({ username: user.username, email: '' })); 
      dispatch(resetGame()); 
      navigate('/game'); 
    } else {
      alert('Invalid username or password');
    }
  };

  return (
    <div className="user-page">
      <div className="login-container">
        <div className="form-title">Login</div>
        <input 
          className="input-field"
          type="text"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          placeholder="Username"
        />
        <input 
          className="input-field"
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="button" onClick={handleLogin}>Login</button>
      </div>
      
      <div className="createUser-container">
        <div className="form-title">Create User</div>
        <input 
          className="input-field"
          type="text"
          value={createUsername}
          onChange={(e) => setCreateUsername(e.target.value)}
          placeholder="New Username"
        />
        <input 
          className="input-field"
          type="password"
          value={createPassword}
          onChange={(e) => setCreatePassword(e.target.value)}
          placeholder="New Password"
        />
        <button className="button" onClick={handleCreateUser}>Create User</button>
      </div>
    </div>
  );
};

export default LoginPage;
