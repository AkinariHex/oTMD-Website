import AuthContext from '@/components/AuthContext/AuthContext';
import MobileNavbar from '@/components/MobileNavbar/MobileNavbar';
import Navbar from '@/components/Navbar/Navbar';
import NProgressBar from '@/components/NProgressBar/NProgressBar';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-Poppins',
  preload: true,
});

export const metadata = {
  title: {
    default: 'osu! Tourney Match Displayer | o!TMD',
    template: '%s | o!TMD',
  },
  description: '',
  /* icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  }, */
  themeColor: 'hsl(219, 28%, 16%)',
  manifest: '/manifest.json',
  viewport: {
    viewportFit: 'cover',
    initialScale: 1,
  },
  appleWebApp: {
    title: 'osu! Tourney Match Displayer',
    startupImage: [
      '/icons/splashscreens/iphonexsmax_splash.png',
      /* IPHONE X */
      {
        url: '/icons/splashscreens/iphonex_splash.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      /* IPHONE 8, 7, 6s, 6 */
      {
        url: '/icons/splashscreens/iphone6_splash.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      /* IPHONE 8 Plus, 7 Plus, 6s Plus, 6 Plus */
      {
        url: '/icons/splashscreens/iphoneplus_splash.png',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      /* IPHONE 5 */
      {
        url: '/icons/splashscreens/iphone5_splash.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      /* iPad Mini, Air */
      {
        url: '/icons/splashscreens/ipad_splash.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head />
      <body>
        <AuthContext>
          <NProgressBar />
          <Navbar />
          {children}
          <MobileNavbar />
        </AuthContext>
      </body>
    </html>
  );
}
