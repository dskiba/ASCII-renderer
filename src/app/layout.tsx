import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'ASCII Renderer',
	description: 'Try to render any image or camera stream with ASCII',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
