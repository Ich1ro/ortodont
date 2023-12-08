import React from 'react'
import './Discounts.scss'

import { Table, Checkbox } from 'rsuite';
import { discounts } from '../../data';

const { Column, HeaderCell, Cell } = Table;

const Discounts = () => {
  const [checkedKeys, setCheckedKeys] = React.useState([]);
	let checked = false;
	let indeterminate = false;

	if (checkedKeys.length === discounts.length) {
		checked = true;
	} else if (checkedKeys.length === 0) {
		checked = false;
	} else if (checkedKeys.length > 0 && checkedKeys.length < discounts.length) {
		indeterminate = true;
	}

	const handleCheckAll = (value, checked) => {
		const keys = checked ? discounts.map(item => item.practiceId) : [];
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
    <div className='info-container'>
      <div className="info-header">Discounts</div>
      <Table data={discounts} autoHeight>
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
				<Column flexGrow={1} align="start" verticalAlign='middle' height={50}>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Discounts</HeaderCell>
					<Cell dataKey="name" />
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Percentages</HeaderCell>
					<Cell>{rowData => `${rowData.percentage}%`}</Cell>
				</Column>
			</Table>
    </div>
  )
}

export default Discounts