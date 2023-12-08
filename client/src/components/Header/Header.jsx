import React from 'react';
import './Header.scss';
import { NavLink } from 'react-router-dom';

const Header = () => {
	return (
		<div className="main-header">
			<NavLink
				to={'/info'}
				className={({ isActive, isPending }) =>
					isPending ? 'header-nav-item' : isActive ? 'header-active header-nav-item' : 'header-nav-item'
				}>
				<div className="header-nav-item-info">Practice Info</div>
			</NavLink>
			<NavLink
				to={'/consultations'}
				className={({ isActive, isPending }) =>
					isPending ? 'header-nav-item' : isActive ? 'header-active header-nav-item' : 'header-nav-item'
				}>
				<div className="header-nav-item-info">Consultations</div>
			</NavLink>
			<NavLink
				to={'/profile'}
				className={({ isActive, isPending }) =>
					isPending ? 'header-nav-item' : isActive ? 'header-active header-nav-item' : 'header-nav-item'
				}>
				<div className="header-nav-item-info">My Profile</div>
			</NavLink>
		</div>
	);
};

export default Header;
