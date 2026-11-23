using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        string inputPath = @"C:\Users\Administrator\.gemini\antigravity\brain\9532c926-388f-4ca4-b247-734d29972624\mossy_rock_pedestal_1794843080742.jpg";
        string outputPath = @"d:\vapes\assets\mossy-rock-pedestal.png";

        using (Bitmap src = new Bitmap(inputPath))
        {
            Console.WriteLine(string.Format("Source size: {0}x{1}", src.Width, src.Height));

            // Find bounds of rock
            // In the top area, background is dark black.
            // Let's create an RGBA 32-bit bitmap
            int w = src.Width;
            int h = src.Height;

            Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);

            // First, let's detect the rock top profile:
            // For each X from 0 to w-1, find the first Y where pixel brightness > threshold or color is rock/moss/glow.
            int[] topY = new int[w];
            for (int x = 0; x < w; x++)
            {
                topY[x] = h; // default
                for (int y = 0; y < h; y++)
                {
                    Color c = src.GetPixel(x, y);
                    // If brightness or any channel is significant
                    if (c.R > 25 || c.G > 25 || c.B > 25)
                    {
                        topY[x] = y;
                        break;
                    }
                }
            }

            // Smooth the top profile slightly or keep exact
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    Color c = src.GetPixel(x, y);
                    int r = c.R;
                    int g = c.G;
                    int b = c.B;
                    int maxChan = Math.Max(r, Math.Max(g, b));

                    // If it's above the rock top, it's black background -> alpha 0
                    if (y < topY[x] - 2)
                    {
                        dst.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                    }
                    else if (y < topY[x] + 4)
                    {
                        // Feather transition at the top
                        float factor = (float)(y - (topY[x] - 2)) / 6f;
                        int a = (int)(Math.Min(1f, Math.Max(0f, factor)) * Math.Min(255, maxChan * 3));
                        dst.SetPixel(x, y, Color.FromArgb(Math.Min(255, a), r, g, b));
                    }
                    else
                    {
                        // Inside rock or bottom fog
                        // In dark areas (black void), blend alpha based on brightness
                        // Bottom fade: from y = h * 0.75 down to h, fade alpha to 0
                        float bottomFade = 1.0f;
                        if (y > h * 0.72f)
                        {
                            bottomFade = 1.0f - ((y - h * 0.72f) / (h * 0.28f));
                            if (bottomFade < 0) bottomFade = 0;
                        }

                        // Left and right edge fade:
                        float sideFade = 1.0f;
                        int marginX = (int)(w * 0.08f);
                        if (x < marginX)
                        {
                            sideFade = (float)x / marginX;
                        }
                        else if (x > w - marginX)
                        {
                            sideFade = (float)(w - x) / marginX;
                        }

                        // Alpha calculation based on brightness in deep black areas
                        int alpha = 255;
                        if (maxChan < 20)
                        {
                            alpha = (int)(maxChan / 20.0f * 255);
                        }

                        alpha = (int)(alpha * bottomFade * sideFade);
                        alpha = Math.Max(0, Math.Min(255, alpha));

                        dst.SetPixel(x, y, Color.FromArgb(alpha, r, g, b));
                    }
                }
            }

            // Crop tightly around the rock
            // Find non-transparent bounds
            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (dst.GetPixel(x, y).A > 15)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            Console.WriteLine(string.Format("Rock bounds: X[{0}..{1}], Y[{2}..{3}]", minX, maxX, minY, maxY));
            int cropW = maxX - minX + 1;
            int cropH = maxY - minY + 1;

            using (Bitmap cropped = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(cropped))
                {
                    g.DrawImage(dst, new Rectangle(0, 0, cropW, cropH), new Rectangle(minX, minY, cropW, cropH), GraphicsUnit.Pixel);
                }

                cropped.Save(outputPath, ImageFormat.Png);
                Console.WriteLine(string.Format("Saved cropped rock to {0}: {1}x{2}", outputPath, cropW, cropH));
            }
        }
    }
}
