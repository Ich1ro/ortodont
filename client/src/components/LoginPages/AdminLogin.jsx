import React from 'react';
import './Login.scss';

import Icon from '../../Icon';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
	const navigate = useNavigate();

	const onFormSubmit = () => {
		localStorage.setItem('user', JSON.stringify(true));
		navigate('/info/practice-information');
	};

	return (
		<form action="" className="login-form" onSubmit={onFormSubmit}>
			<h2 className="login-form-title">LOGIN</h2>
			<input type="email" className="login-form-input" placeholder="Email" />
			<input type="password" className="login-form-input" placeholder="Password" />
			<button type="submit" className="login-form-button">
				<div className="empty"></div>
				<span>Sign In</span>
				<Icon name="sign-in" styles={{ fill: '#26A4ED', width: '40' }} />
			</button>
		</form>
	);
};

export default AdminLogin;
