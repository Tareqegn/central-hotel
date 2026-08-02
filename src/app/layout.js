import "./globals.css";

export const metadata = {
  title: "Central Hotel",
  description: "Hotel guest services - order food, request taxi, laundry, and more",
};

// This tells mobile browsers how to render the screen cleanly as an app frame
export const viewport = {
  themeColor: '#090b11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents input forms from zooming and breaking layouts on mobile screens
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* iOS Apple specific tags to make the top bar blend smoothly */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}