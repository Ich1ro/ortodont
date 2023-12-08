import React from 'react'
import './Login.scss'
import Icon from '../../Icon'

const ResetPassword = () => {
  return (
    <form action="" className="login-form">
			<h2 className="login-form-title">LOGIN</h2>
			<input type="email" className="login-form-input" placeholder='Email' />
			<input type="password" className="login-form-input" placeholder='Old Password' />
			<input type="password" className="login-form-input" placeholder='Patient ID' />
			<button type='submit' className='login-form-button'>
				<div className="empty"></div>
				<span>Sign In</span>
				<Icon name="sign-in" styles={{fill: '#26A4ED', width: '40'}} />
			</button>
		</form>
  )
}

export default ResetPassword