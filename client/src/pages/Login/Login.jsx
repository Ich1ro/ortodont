import React from 'react'
import { Outlet } from 'react-router-dom'
import './Login.scss'

const Login = () => {
  return (
    <div className='login-container'>
        <div className="login-form-container">
            <Outlet />
        </div>
            <img src="/img/login.png" alt="" className='login-img'/>
        {/* <div className="login-img">
        </div> */}
    </div>
  )
}

export default Login