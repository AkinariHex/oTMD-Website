export default function Home({ release }) {
	return (
		<div className='homeContent'>
			<div className='container appContext'>
				<div className='appHeader'>
					<object type='image/svg+xml' data='/img/otmdLOGO.svg' className='logoAppHeader' />
				</div>
				<div className='appText'>Display easily your osu! Tournament Matches while streaming on Twitch.</div>
				<div className='appButtons'>
					<button id='downloadEXE' onClick={() => window.open(`https://github.com/AkinariHex/oTMD/releases/download/${release[0].tag_name}/otmd_${release[0].tag_name}_installer.exe`, '_blank')}>
						<div className='icon'>
							<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
								<path d='M0 12v-8.646l10-1.355v10.001h-10zm11 0h13v-12l-13 1.807v10.193zm-1 1h-10v7.646l10 1.355v-9.001zm1 0v9.194l13 1.806v-11h-13z' />
							</svg>
						</div>
						<div className='text'>
							Download <span id='app_ver'>{release[0].tag_name}</span>
						</div>
						<div className='file'>
							<span className='btn_text_below'>installer.exe</span>
						</div>
					</button>
					<button id='downloadZIP' onClick={() => window.open(`https://github.com/AkinariHex/oTMD/releases/download/${release[0].tag_name}/otmd_${release[0].tag_name}_x64.zip`, '_blank')}>
						<div className='icon'>
							<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
								<path d='M10.997 19.06c0 1.277-2.996 1.268-2.996.003 0-1.314 2.996-1.344 2.996-.003zm11.003-8.06v13h-20v-24h8.409c4.857 0 3.335 8 3.335 8 3.009-.745 8.256-.419 8.256 3zm-14-4h3v-1h-3v1zm0-2h3v-1h-3v1zm0-2h3v-1h-3v1zm0 6h3v-1h-3v1zm0 2h3v-1h-3v1zm0 2h3v-1h-3v1zm3.925 5.5l-.925-4.5h-3l-.925 4.5c-.393 1.578.801 2.5 2.425 2.5 1.626 0 2.817-.924 2.425-2.5zm3.984-12.723c2.047-.478 4.805.279 6.091 1.179-1.494-1.998-5.23-5.708-7.432-6.881 1.156 1.168 1.563 4.234 1.341 5.702z' />
							</svg>
						</div>
						<div className='text'>
							Download <span id='app_ver'>{release[0].tag_name}</span>
						</div>
						<div className='file'>
							<span className='btn_text_below'>Zip Archive</span>
						</div>
					</button>
					<button id='discordServer' onClick={() => window.open('https://discord.com/invite/gf7rWj942q', '_blank')}>
						<div className='icon'>
							<svg width='24' height='24' xmlns='http://www.w3.org/2000/svg'>
								<path d='M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z' />
							</svg>
						</div>
						<div className='text'>Official</div>
						<div className='file'>Discord Server</div>
					</button>
					<button id='githubRep' onClick={() => window.open('https://github.com/AkinariHex/oTMD', '_blank')}>
						<div className='icon'>
							<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
								<path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
							</svg>
						</div>
						<div className='text'>Github</div>
						<div className='file'>Repository</div>
					</button>
				</div>
				<div className='appImage'>
					<object type='image/svg+xml' data='/img/otmdappV1.svg' className='app' />
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
