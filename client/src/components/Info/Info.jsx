import React from 'react';
import './Info.scss';

import Sidebar from '../Sidebar/Sidebar';

import { Outlet } from 'react-router-dom';

const Info = () => { 
	return (
		<div>
			<Sidebar />
			<Outlet />
		</div>
	);
};

export default Info;
