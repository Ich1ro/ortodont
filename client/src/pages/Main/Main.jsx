import React, {useEffect} from 'react'
import './Main.scss'

import { Outlet, useNavigate } from 'react-router-dom'
import { Header } from '../../components'

const Main = () => {
  const navigate = useNavigate()
	const user = JSON.parse(localStorage.getItem('user'));
	console.log(user);

	useEffect(() => {
		if (!user) {
      navigate('/login/admin')
		} else {
      navigate('/info/practice-information')
    }
	}, []);

  return (
    <div className='main-container'>
        <Header />
        <div className="main-content">
            <Outlet />
        </div>
    </div>
  )
}

export default Main