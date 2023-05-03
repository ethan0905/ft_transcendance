import CSS from 'csstype';

interface TableProps {
	data: {
	  name: string;
	  status: string;
	}[];
  }

const FriendList = (props: TableProps) => {
	const { data } = props;

	
	return (
		<div style={{ overflowY: 'auto', minWidth: '35%', height: '100%', borderRadius: '10px'}}>
		<table style={{borderCollapse: 'collapse', width: '100%', height:'20%' }}>
			
			<thead style={{ position: 'sticky', top: '0' }}>
				<tr><th colSpan={3} style={titleTable}>Friends</th></tr>
				<tr>
					<th style={titleCol}>#</th>
					<th style={titleCol}>Name</th>
					<th style={titleCol}>Status</th>
				</tr>
			</thead>

			<tbody>
			{data.length > 0 ? (
				data.map((item, index) => (
				<tr style={lineTable} key={index}>
					<td>{index + 1}</td>
					<td>{item.name}</td>
					<td>{item.status}</td>
				</tr>
				))
			) : (
			<tr style={lineTable}><td colSpan={6}>Any friend</td></tr>
			)}
			</tbody>
			
		</table>
	</div>
	);
};

const titleTable: CSS.Properties = {
	backgroundColor: 'black', 
	color: 'white', 
	textAlign: 'center', 
	padding: '10px 0' ,
	fontFamily: 'Kocak',
	fontSize: '30px',
}

const titleCol: CSS.Properties = {
	backgroundColor: 'black',
	color: 'white', 
	borderBottom: '1px solid #ddd', 
	textAlign: 'center',
}

const lineTable: CSS.Properties = {
	borderBottom: '1px solid #ddd',
	backgroundColor: '#fff9f932',
	height: '50px',
	textAlign: 'center',
	justifyContent: 'center',
	fontWeight: 'bold',
	color: 'white',
	textShadow: '1px 1px 1px black',
}

export default FriendList;