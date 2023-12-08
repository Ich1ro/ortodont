import React from 'react';
import './Sidebar.scss';

import { NavLink } from 'react-router-dom';
import Icon from '../../Icon';

const Sidebar = () => {
	return (
		<div className="sidebar-container">
			<NavLink
				to={'/info/practice-information'}
				className={({ isActive, isPending }) =>
					isPending ? 'nav-item' : isActive ? 'sidebar-active nav-item' : 'nav-item'
				}>
				{({ isActive, isPending, isTransitioning }) => (
					<div className="nav-item-info">
						<Icon
							name="practice-info"
							styles={{ fill: `#${isActive ? '26A4ED' : '7D8485'}`, width: '45' }}
						/>
						Practice Information
					</div>
				)}
			</NavLink>
			<NavLink
				to={'/info/treatments'}
				className={({ isActive, isPending }) =>
					isPending ? 'nav-item' : isActive ? 'sidebar-active nav-item' : 'nav-item'
				}>
				{({ isActive, isPending, isTransitioning }) => (
					<div className="nav-item-info">
						<Icon name="treatments" styles={{ fill: `#${isActive ? '26A4ED' : '7D8485'}`, width: '45' }} />
						Treatment Types
					</div>
				)}
			</NavLink>
			<NavLink
				to={'/info/add-ons'}
				className={({ isActive, isPending }) =>
					isPending ? 'nav-item' : isActive ? 'sidebar-active nav-item' : 'nav-item'
				}>
				{({ isActive, isPending, isTransitioning }) => (
					<div className="nav-item-info">
						<Icon name="add-ons" styles={{ fill: `#${isActive ? '26A4ED' : '7D8485'}`, width: '45' }} />
						Add-Ons
					</div>
				)}
			</NavLink>
			<NavLink
				to={'/info/discounts'}
				className={({ isActive, isPending }) =>
					isPending ? 'nav-item' : isActive ? 'sidebar-active nav-item' : 'nav-item'
				}>
				{({ isActive, isPending, isTransitioning }) => (
					<div className="nav-item-info">
						<Icon name="discount" styles={{ fill: `#${isActive ? '26A4ED' : '7D8485'}`, width: '45' }} />
						Discounts
					</div>
				)}
			</NavLink>
			<NavLink
				to={'/info/locations'}
				className={({ isActive, isPending }) =>
					isPending ? 'nav-item' : isActive ? 'sidebar-active nav-item' : 'nav-item'
				}>
				{({ isActive, isPending, isTransitioning }) => (
					<div className="nav-item-info">
						<Icon name="location" styles={{ fill: `#${isActive ? '26A4ED' : '7D8485'}`, width: '45' }} />
						Locations
					</div>
				)}
			</NavLink>
			<NavLink
				to={'/info/users'}
				className={({ isActive, isPending }) =>
					isPending ? 'nav-item' : isActive ? 'sidebar-active nav-item' : 'nav-item'
				}>
				{({ isActive, isPending, isTransitioning }) => (
					<div className="nav-item-info">
						<Icon name="users" styles={{ fill: `#${isActive ? '26A4ED' : '7D8485'}`, width: '45' }} />
						Users
					</div>
				)}
			</NavLink>
		</div>
	);
};

export default Sidebar;
