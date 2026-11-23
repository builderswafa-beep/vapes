using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        string inputPath = @"C:\Users\Administrator\.gemini\antigravity\brain\9532c926-388f-4ca4-b247-734d29972624\rock_pedestal_stage_1794844036381.jpg";
        string outputPath = @"d:\vapes\assets\mossy-rock-pedestal.png";

        using (Bitmap src = new Bitmap(inputPath))
        {
            int w = src.Width;
            int h = src.Height;
            Console.WriteLine(string.Format("Source image size: {0}x{1}", w, h));

            Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);

            // Step 1: Detect the top skyline of the rock for each column x
            // A pixel is rock if max(R,G,B) > 22 and not pure dark noise
            int[] topY = new int[w];
            for (int x = 0; x < w; x++)
            {
                topY[x] = h; // default: bottom
                for (int y = 0; y < h; y++)
                {
                    Color c = src.GetPixel(x, y);
                    int maxC = Math.Max(c.R, Math.Max(c.G, c.B));
                    if (maxC > 28)
                    {
                        topY[x] = y;
                        break;
                    }
                }
            }

            // Clean any single-pixel spikes in topY with a small median/min filter
            int[] cleanTopY = new int[w];
            for (int x = 0; x < w; x++)
            {
                int minNear = h;
                int start = Math.Max(0, x - 2);
                int end = Math.Min(w - 1, x + 2);
                for (int i = start; i <= end; i++)
                {
                    if (topY[i] < minNear) minNear = topY[i];
                }
                cleanTopY[x] = minNear;
            }

            // Step 2: Render dst with transparent sky, 100% solid rock, and soft blended edges
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    Color c = src.GetPixel(x, y);
                    int rockTop = cleanTopY[x];

                    if (y < rockTop - 2)
                    {
                        // Completely above the rock: transparent sky
                        dst.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                    }
                    else if (y < rockTop + 3)
                    {
                        // Sub-pixel anti-aliasing on the rock rim
                        float t = (float)(y - (rockTop - 2)) / 5.0f;
                        int a = Math.Max(0, Math.Min(255, (int)(t * 255)));
                        dst.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));
                    }
                    else
                    {
                        // Inside the rock: fully opaque solid rock!
                        float alpha = 1.0f;

                        // Soft left edge fade
                        if (x < w * 0.04f)
                        {
                            alpha *= (float)x / (w * 0.04f);
                        }

                        // Soft right edge fade
                        if (x > w * 0.96f)
                        {
                            alpha *= (float)(w - x) / (w * 0.04f);
                        }

                        // Soft bottom fade (melts into #0B0D12 ground)
                        if (y > h * 0.80f)
                        {
                            alpha *= 1.0f - ((y - h * 0.80f) / (h * 0.20f));
                        }

                        int a = Math.Max(0, Math.Min(255, (int)(alpha * 255)));
                        dst.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));
                    }
                }
            }

            // Find tight bounding box of visible content
            int minX = w, maxX = 0, minY = h, maxY = 0;
            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    if (dst.GetPixel(x, y).A > 20)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            int cropW = maxX - minX + 1;
            int cropH = maxY - minY + 1;
            Console.WriteLine(string.Format("Cropped bounds: X[{0}..{1}], Y[{2}..{3}] -> {4}x{5}", minX, maxX, minY, maxY, cropW, cropH));

            using (Bitmap cropped = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(cropped))
                {
                    g.DrawImage(dst, new Rectangle(0, 0, cropW, cropH), new Rectangle(minX, minY, cropW, cropH), GraphicsUnit.Pixel);
                }

                cropped.Save(outputPath, ImageFormat.Png);
                Console.WriteLine(string.Format("Successfully saved pristine rock pedestal to {0}", outputPath));
            }
        }
    }
}
