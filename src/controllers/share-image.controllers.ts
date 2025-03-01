import { createCanvas } from "canvas";
import { Request, Response } from "express"

export const shareImage = async (req: Request, res: Response) => {
    try {
        const { username = 'Player', correct = '0', incorrect = '0' } = req.query;

        const correctCount = parseInt(correct as string, 10);
        const incorrectCount = parseInt(incorrect as string, 10);

        const canvas = createCanvas(600, 315);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 600, 315);

        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, 580, 295);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Globetrotter Challenge', 300, 80);

        ctx.font = '24px Arial';
        ctx.fillText(`${username}'s Score`, 300, 130);

        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#16a34a';
        ctx.fillText(`${correctCount}`, 250, 200);

        ctx.font = '30px Arial';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('/', 300, 200);

        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#dc2626';
        ctx.fillText(`${incorrectCount}`, 350, 200);

        ctx.font = '18px Arial';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Can you beat this score?', 300, 260);

        const buffer = canvas.toBuffer('image/png');

        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable'
        });

        res.send(buffer);
    } catch (error) {
        console.error('Error generating share image:', error);
        res.status(500).json({ error: 'Failed to generate share image' });
    }
}