import './globals.css'

export const metadata = {
  title: 'Waatcher | Premium Video Streaming',
  description: 'Upload and stream videos seamlessly with Cloudflare R2',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
