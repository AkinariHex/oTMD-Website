export default function Documentation({ release }) {
	return (
		<div className='homeContent'>
			<div className='documentationContainer'>
				<span id='header'>Documentation</span>
				<div className='installation'>
					<h1>How to install</h1>
					<p>
						The current documentation is valid for the <span className='string'>v1.9.0</span> of osu! Tourney Match Displayer.
						<br />
						You have two methods to install it, using the installer or just unzipping the .zip file.
					</p>
					<h2>Installer</h2>
					<p>
						First of all you need to download the{' '}
						<a style={{ fontWeight: 600 }} href={`https://github.com/AkinariHex/oTMD/releases/download/${release[0].tag_name}/otmd_${release[0].tag_name}_installer.exe`} target='_blank' rel='noreferrer'>
							installer
						</a>
						!<br />
						Once downloaded, run the installer and continue installing it!
						<br />
						The installer runs with Administrator Privileges.
						<br />
						If Microsoft Defender SmartScreen alert you, don&apos;t worry about it and click Run anyway.
						<br />
						<span style={{ fontWeight: 600 }}>
							(Make sure you have downloaded it from <a href='https://otmd.vercel.app'>otmd.vercel.app</a> to avoid malicius softwares!).
						</span>
					</p>
					<p>
						The default installation folder is <span className='string'>C:\Program Files\osu-tourney-match-displayer</span>!
					</p>
					<p>At first run it will ask you to allow the .exe for the firewall, check only for private networks and allow access.</p>
					<h2>Zip Archive</h2>
					<p>
						First of all you need to download the{' '}
						<a style={{ fontWeight: 600 }} href={`https://github.com/AkinariHex/oTMD/releases/download/${release[0].tag_name}/otmd_${release[0].tag_name}_x64.zip`} target='_blank' rel='noreferrer'>
							zip archive
						</a>
						!<br />
						Once downloaded, extract the .zip file wherever you want and you&apos;re done!
					</p>
					<p>
						Now you can open the folder and run <span style={{ fontWeight: 600 }}>osu! Tourney Match Displayer.exe</span>!
					</p>
				</div>
				<div className='divider' />
				<div className='fields'>
					<h1 style={{ marginBottom: '2px' }}>Change the fields</h1>
					<h2>Match section</h2>
					<ul style={{ lineHeight: '27px' }}>
						<li>
							<span className='string'>APIkey</span> : Put your apikey of osu! |{' '}
							<a style={{ fontWeight: 600 }} href='https://osu.ppy.sh/p/api'>
								Where can I find the apikey?
							</a>
						</li>
						<li>
							<span className='string'>UserID</span> : Put your userid |{' '}
							<span style={{ fontWeight: 600 }}>
								Your userid will be used only if you want to display a 1vs1 match but it&apos;s required to have it always saved for next times.
								<br />
								You can find your userid at the end of your profile link{' '}
								<span className='string link'>
									https://osu.ppy.sh/users/<span>4001304</span>
								</span>
							</span>
						</li>
						<li>
							<span className='string'>MatchID</span> : Put the ID of the match you want to display. | <span style={{ fontWeight: 600 }}>You can find the matchid at the end of an mp link</span>
							<br />
							<span className='string link'>
								https://osu.ppy.sh/community/matches/<span>69509292</span>
							</span>
						</li>
						<li>
							<span className='string'>Match Type</span> : Select the type of the match between <span style={{ fontWeight: 600 }}>1vs1</span> and <span style={{ fontWeight: 600 }}>TeamVS</span>.
						</li>
						<li>
							<span className='string'>Stage</span> : Select the current stage of the tournament. | <span style={{ fontWeight: 600 }}>Friendly is meant to be used if you want to display a match that&apos;s not a tournament</span>
						</li>
						<li>
							<span className='string'>N. of maps</span> : Put the number of maps of the Qualifiers Pool | <span style={{ fontWeight: 600 }}>You&apos;ll see and use this field only if you select Qualifiers as Stage</span>
						</li>
						<li>
							<span className='string'>Best of</span> : Select the BO of the match.
						</li>
						<li>
							<span className='string'>Warmups</span> : Put the number of warmups. In the most of cases it&apos;s 2.
						</li>
						<li>
							<span className='string'>Score Reverse</span> : Check it only if the first team of the lobby has the colour red. |{' '}
							<span style={{ fontWeight: 600 }}>
								For example let&apos;s see this lobby: <span className='string'>5WC: (Indonesia A) vs (Italy A)</span>, Indonesia A should be the blue team as blue teams are always the first team for the api.
								<br />
								If a referee make this, you can fix it checking the box of score reverse.
							</span>
						</li>
					</ul>
					<h2>Displayer Settings section</h2>
					<ul id='Displayer_Settings_section' style={{ lineHeight: '27px' }}>
						<li>
							<span className='string'>APIkey</span> : Put your apikey of osu! |{' '}
							<a style={{ fontWeight: 600 }} href='https://osu.ppy.sh/p/api'>
								Where can I find the apikey?
							</a>
						</li>
						<li>
							<span className='string'>UserID</span> : Put your userid |{' '}
							<span style={{ fontWeight: 600 }}>
								Your userid will be used only if you want to display a 1vs1 match but it&apos;s required to have it always saved for next times.
								<br />
								You can find your userid at the end of your profile link{' '}
								<span className='string link'>
									https://osu.ppy.sh/users/<span>4001304</span>
								</span>
							</span>
						</li>
						<li>
							<span className='string'>Old Colors</span> : Enable the old colors that matches the old osu! stable colors. |{' '}
							<span className='string'>
								(First team = <span style={{ color: '#3a57ff' }}>blue</span> / Second team = <span style={{ color: '#fd7070' }}>red</span>)
							</span>
						</li>
						<li>
							<span className='string'>Small Displayer</span> : Enable the small displayer that have less height.
						</li>
						<li>
							<span className='string'>Visualizer Style</span> : You can choose from 4 different styles:
							<ul>
								<li>
									<span className='string'>Default</span> : No rounded corners
									<br />
									<img src='https://akinariosu.s-ul.eu/PMSB7638' style={{ marginTop: '2px' }} />
								</li>
								<li>
									<span className='string'>Rounded</span> : All 4 corners rounded
									<br />
									<img src='https://akinariosu.s-ul.eu/7j4nClSu' style={{ borderRadius: '15px', marginTop: '2px' }} />
								</li>
								<li>
									<span className='string'>Top-Rounded</span> : Top 2 corners rounded
									<br />
									<img src='https://akinariosu.s-ul.eu/6GWWbzZ4' style={{ borderRadius: '15px 15px 0px 0px', marginTop: '2px' }} />
								</li>
								<li>
									<span className='string'>Bottom-Rounded</span> : Bottom 2 corners rounded
									<br />
									<img src='https://akinariosu.s-ul.eu/gU7hWChk' style={{ borderRadius: '0px 0px 15px 15px', marginTop: '2px' }} />
								</li>
							</ul>
						</li>
						<li>
							<span className='string'>Width</span> : Shows the current width of the displayer | This value will be used in OBS
						</li>
						<li>
							<span className='string'>Height</span> : Shows the current height of the displayer | This value will be used in OBS
						</li>
					</ul>
					<h2>App Settings section</h2>
					<ul style={{ lineHeight: '27px' }}>
						<li>
							<span className='string'>User Interface</span> : Enable compact UI
						</li>
						<li>
							<span className='string'>System Tray</span> : Enable minimize to system tray
						</li>
					</ul>
				</div>
				<div className='divider' />
				<div className='obs'>
					<h1>Display on OBS/SLOBS</h1>
					<p>
						On SLOBS add a new <span className='string'>source &gt; browser source</span>, name it and put these settings:
						<ul style={{ lineHeight: '27px' }}>
							<li>Uncheck &apos;Local File box&apos;</li>
							<li>
								<span className='string'>URL</span> : <span className='string link'>http://localhost:3000/visualizer</span> <span style={{ fontWeight: 600 }}>(the app copy automatically the url when you save the settings so you can just paste it inside obs)</span>
							</li>
							<li>
								<span className='string'>Width</span> : <span className='string'>400</span>
							</li>
							<li>
								<span className='string'>Height</span> : <span className='string'>130</span> or <span className='string'>80</span> if you&apos;re using the small displayer)
							</li>
							<li>Check &apos;Refresh browser when scene becomes active&apos; box</li>
						</ul>
						<img src='https://drive.google.com/uc?export=view&id=1BTEAz996uFtjzTXmIORPMMHJX6pOXOsV' style={{ width: '898px' }} />
						<img src='https://akinariosu.s-ul.eu/m6JOryPe' />
					</p>
				</div>
			</div>
		</div>
	)
}

export async function getServerSideProps() {
	const release = await fetch('https://api.github.com/repos/AkinariHex/oTMD/releases')

	return {
		props: {
			release: await release.json(),
		},
	}
}
