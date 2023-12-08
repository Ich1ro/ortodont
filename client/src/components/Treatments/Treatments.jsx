import React from 'react';
import './Treatments.scss';

import { Table, Checkbox } from 'rsuite';
import { treatmentTypes } from '../../data';

const { Column, HeaderCell, Cell } = Table;

const Treatments = () => {
	const [checkedKeys, setCheckedKeys] = React.useState([]);
	let checked = false;
	let indeterminate = false;

	if (checkedKeys.length === treatmentTypes.length) {
		checked = true;
	} else if (checkedKeys.length === 0) {
		checked = false;
	} else if (checkedKeys.length > 0 && checkedKeys.length < treatmentTypes.length) {
		indeterminate = true;
	}

	const handleCheckAll = (value, checked) => {
		const keys = checked ? treatmentTypes.map(item => item.practiceId) : [];
		setCheckedKeys(keys);
	};
	const handleCheck = (value, checked) => {
		const keys = checked ? [...checkedKeys, value] : checkedKeys.filter(item => item !== value);
		setCheckedKeys(keys);
	};

	const CheckCell = ({ rowData, onChange, checkedKeys, dataKey, ...props }) => (
		<Cell {...props} style={{ padding: 0 }}>
			<div>
				<Checkbox
					value={rowData[dataKey]}
					inline
					verticalAlign="middle"
					onChange={onChange}
					checked={checkedKeys.some(item => item === rowData[dataKey])}
				/>
			</div>
		</Cell>
	);

	return (
		<div className="info-container">
			<div className="info-header">Treatments</div>
			<Table data={treatmentTypes} autoHeight>
				<Column width={50} align='center'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>
						<div>
							<Checkbox
								inline
								checked={checked}
								verticalAlign="middle"
								indeterminate={indeterminate}
								onChange={handleCheckAll}
							/>
						</div>
					</HeaderCell>
					<CheckCell dataKey="practiceId" checkedKeys={checkedKeys} onChange={handleCheck} />
				</Column>
				<Column flexGrow={2} align="start" verticalAlign='middle' height={50}>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Treatment Type</HeaderCell>
					<Cell dataKey="name" />
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Fee</HeaderCell>
					<Cell>{rowData => `$${rowData.fee}`}</Cell>
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>BP Mos</HeaderCell>
					<Cell dataKey="mos" />
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Range</HeaderCell>
					<Cell>{rowData => `${rowData.range[0]} to ${rowData.range[1]}`}</Cell>
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>INS Mos</HeaderCell>
					<Cell dataKey="insMos" />
				</Column>
				<Column width={125} align="center" verticalAlign='middle' fixed='right'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Add-Ons</HeaderCell>
					<Cell dataKey="addOnsNumber" />
				</Column>
			</Table>
		</div>
	);
};

export default Treatments;
