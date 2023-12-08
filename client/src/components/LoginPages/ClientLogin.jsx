import React from 'react';
import './Login.scss'
import Icon from '../../Icon';

const ClientLogin = () => {
	return (
		<form action="" className="login-form">
			<h2 className="login-form-title">LOGIN</h2>
			<input type="text" className="login-form-input" placeholder='Patient Last Name' />
			<input type="text" className="login-form-input" placeholder='Patient ID' />
			<button type='submit' className='login-form-button'>
				<div className="empty"></div>
				<span>Sign In</span>
				<Icon name="sign-in" styles={{fill: '#26A4ED', width: '40'}} />
			</button>
		</form>
	);
};

export default ClientLogin;
