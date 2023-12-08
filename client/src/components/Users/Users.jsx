import React from 'react'
import './Users.scss'

import { Table, Checkbox } from 'rsuite';
import { users } from '../../data';
import Icon from '../../Icon';

const { Column, HeaderCell, Cell } = Table;

const Users = () => {
  const [checkedKeys, setCheckedKeys] = React.useState([]);
	let checked = false;
	let indeterminate = false;

	if (checkedKeys.length === users.length) {
		checked = true;
	} else if (checkedKeys.length === 0) {
		checked = false;
	} else if (checkedKeys.length > 0 && checkedKeys.length < users.length) {
		indeterminate = true;
	}

	const handleCheckAll = (value, checked) => {
		const keys = checked ? users.map(item => item.practiceId) : [];
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
      <div className="info-header">
        Users
      </div>
      <Table data={users} autoHeight>
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
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Name</HeaderCell>
					<Cell dataKey="name" />
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Email</HeaderCell>
					<Cell dataKey='email' />
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Role</HeaderCell>
					<Cell dataKey='role' />
				</Column>
				<Column flexGrow={2} align="center" verticalAlign='middle'>
					<HeaderCell style={{ backgroundColor: '#26A4ED', color: 'white', fontWeight: 'bold', fontSize: 16}}>Active</HeaderCell>
					<Cell>{rowData => rowData.active ? (
            <Icon name='active' styles={{width: 20, fill: '#26A4ED'}} />
          ) : (
            <Icon name='inactive' styles={{width: 20, fill: 'black'}} />
          )}</Cell>
				</Column>
			</Table>
    </div>
  )
}

export default Users