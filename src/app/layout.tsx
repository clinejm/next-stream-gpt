export const metadata = {
  title: 'OpenAI Streaming demo',
  description: 'Simple playground for OpenAI Streaming API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
