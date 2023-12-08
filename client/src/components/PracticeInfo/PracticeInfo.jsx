import React from 'react';
import './PracticeInfo.scss';
import Icon from '../../Icon';

const PracticeInfo = () => {
	return (
		<div className="info-container">
			<div className="info-header">Practice Info</div>
			<div className="clinic-title">
				<img src="/img/avatar.png" alt="avatar" width={150} />
				<div className="clinic-title-info">
					<h3>FMY ORTHODONTICS</h3>
					<p>
						<b>Offices in Jackson, Martin, Dyersburg, Henderson and Paris</b>
					</p>
				</div>
			</div>
			<div className="cards-list">
				<b className="cards-list-title">List of Credit Cards Accepted:</b>
				<div className="cards-list-list">
					<Icon name="visa" />
					<Icon name="mastercard" />
					<Icon name="amex" />
					<Icon name="discover" />
				</div>
			</div>
			<div className="clinic-info-string">
				<b className="clinic-info-string-title">List of Credit Cards Accepted:</b>
				<p className="clinic-info-string-list">of00001439</p>
			</div>
			<div className="clinic-info-string">
				<b className="clinic-info-string-title">Phone Numbers:</b>
				<div className="clinic-info-string-details-container">
					<p className="clinic-info-string-phone">(731) 668-8922</p>
					<p className="clinic-info-string-phone">(731) 668-8922</p>
				</div>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Web-Site:</b>
				<a className="clinic-info-string-details">www.fmyortho.com</a>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Maximum Payout Discount:</b>
				<p className="clinic-info-string-details"><p>5% &nbsp;</p> of Net Patient Investment</p>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Payout Discount Begins at:</b>
				<p className="clinic-info-string-details"><p>25% &nbsp;</p> of Net Patient Investment</p>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Payout Discount Begins at:</b>
				<p className="clinic-info-string-details"><p>7% &nbsp;</p> of Net Patient Investment</p>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Maximum Extended Payout Time:</b>
				<p className="clinic-info-string-details"><p>25% &nbsp;</p> past BP Months</p>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Credit from Previous Contract:</b>
				<p className="clinic-info-string-details"><p>100% &nbsp;</p> of Previous Contract</p>
			</div>
      <div className="clinic-info-string">
				<b className="clinic-info-string-title">Last Updated:</b>
				<p className="clinic-info-string-date">9/27/2023</p>
			</div>
		</div>
	);
};

export default PracticeInfo;
