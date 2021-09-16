import { signIn, signOut } from 'next-auth/client'
import NavLink from '../NavLink/NavLink'

export default function Navbar({ session, userStatus }) {
	let statusColor = {
		Server: 'rgb(197, 56, 56)',
		'Tourney Manager': '',
		'Tournaments Host': '',
		User: 'transparent',
	}

	return (
		<div className='navbar'>
			<object type='image/svg+xml' data='/img/otmdLOGO.svg' className='logoNavbar' />
			<div className='navLinks'>
				<NavLink activeClassName='active' aria-current='page' href={'/'}>
					<a className='navLinks_link'>Home</a>
				</NavLink>
				<NavLink activeClassName='active' aria-current='page' href={'/tournaments'}>
					<a className='navLinks_link'>Tournaments</a>
				</NavLink>
				<NavLink activeClassName='active' aria-current='page' href={'/documentation'}>
					<a className='navLinks_link'>Documentation</a>
				</NavLink>
			</div>
			<div className='userInfo'>
				{session !== null ? (
					<div className='userBackground' style={{ background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)) center center / cover no-repeat, url('${session.cover_url}') center center / cover no-repeat` }}>
						<div className='userContent'>
							<button className='userLogout' onClick={() => signOut()}>
								<i className='bx bx-log-out-circle'></i>
							</button>
							<span className='userInfo_name'>
								<span style={{ backgroundColor: statusColor[userStatus.Permissions] }} id='userPermissions'></span>
								{session.username}
							</span>
							<img className='userInfo_image' src={session.avatar_url} alt='user image' />
						</div>
					</div>
				) : (
					<div className='userLogin'>
						<button style={{ display: 'flex', alignContent: 'center', color: '#fff', backgroundColor: '#404B69', fill: '#fff', fontWeight: 400 }} onClick={() => signIn('osu')}>
							<img style={{ width: '25px', filter: 'contrast(0) brightness(2)' }} src='https://img.icons8.com/ios/50/000000/osu.png' alt='osu! logo' /> <span style={{ margin: 'auto', fontFamily: 'Poppins' }}>Login</span>
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
