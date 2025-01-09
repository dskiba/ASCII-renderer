'use client';
import fillASCII from '../src/textures/fillASCII.png';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ASCII, setASCII] = useState<HTMLImageElement | null>(null);

    // Initialize webcam
    useEffect(() => {
        if (videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoRef.current!.srcObject = stream;
                    videoRef.current!.play();
                })
                .catch(err => console.error("Error accessing webcam:", err));
        }
    }, []);

    // Process video stream
    useEffect(() => {
        if (!videoRef.current || !canvasRef.current || !ASCII) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        let animationFrameId: number;

        const processFrame = () => {
            // Check if video is ready
            if (video.readyState === video.HAVE_ENOUGH_DATA &&
                video.videoWidth > 0 &&
                video.videoHeight > 0) {

                // Set canvas size to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;

                // Clear canvas with black background
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw current video frame to temp canvas
                tempCtx.drawImage(video, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

                // Process video frame
                const blockSize = 8; // Size of each ASCII character
                for (let y = 0; y < canvas.height; y += blockSize) {
                    for (let x = 0; x < canvas.width; x += blockSize) {
                        // Get the average luminance for this block
                        const pixelIndex = (y * canvas.width + x) * 4;
                        const r = imageData.data[pixelIndex];
                        const g = imageData.data[pixelIndex + 1];
                        const b = imageData.data[pixelIndex + 2];
                        const luminance = Math.floor(((0.299 * r + 0.587 * g + 0.114 * b) / 255) * 9);

                        // Draw corresponding ASCII character
                        ctx.drawImage(
                            ASCII,
                            luminance * blockSize, 0, blockSize, blockSize,
                            x, y, blockSize, blockSize
                        );
                    }
                }
            }

            animationFrameId = requestAnimationFrame(processFrame);
        };

        // Wait for video to be ready
        video.addEventListener('loadedmetadata', () => {
            processFrame();
        });

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (video.srcObject) {
                const stream = video.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [ASCII]);

    return (
        <main className="flex min-h-screen flex-col items-center p-24">
            <h1 className={'font-mono'}>ASCII Video Filter</h1>
            <div className="relative">
                <video
                    ref={videoRef}
                    style={{
                        width: '640px',
                        display: 'none' // Hide the video element
                    }}
                />
                <img
                    src={fillASCII.src}
                    alt={'ASCII texture'}
                    ref={(ref) => setASCII(ref)}
                    style={{ display: 'none' }}
                />
                <canvas
                    ref={canvasRef}
                    style={{ width: '640px' }}
                />
            </div>
        </main>
    );
}
