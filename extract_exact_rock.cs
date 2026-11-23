using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        string refPath = @"C:\Users\Administrator\.gemini\antigravity\brain\9532c926-388f-4ca4-b247-734d29972624\.user_uploaded\uploaded_media_1794816370712.jpg";
        string outPath = @"d:\vapes\assets\mossy-rock-pedestal.png";

        using (Bitmap src = new Bitmap(refPath))
        {
            // The rock region in src (1024x512):
            // X: 420 to 980 (width = 560)
            // Y: 330 to 450 (height = 120)
            int rx = 425;
            int ry = 330;
            int rw = 555;
            int rh = 120;

            // Let's create an output bitmap 2x resolution or exact
            Bitmap rock = new Bitmap(rw, rh, PixelFormat.Format32bppArgb);

            // Let's copy the pixels and process them
            for (int y = 0; y < rh; y++)
            {
                int srcY = ry + y;
                for (int x = 0; x < rw; x++)
                {
                    int srcX = rx + x;
                    Color c = src.GetPixel(srcX, srcY);

                    // Check if this pixel is part of the old bottles in the center
                    // Old bottles span roughly srcX 535 to 845, srcY 330 to 395
                    bool isOldBottleZone = (srcX >= 540 && srcX <= 840 && srcY < 396);

                    // Also check for lime green NASTY bottle color (high G, low B)
                    bool isNastyGreen = (c.G > 140 && c.R > 80 && c.B < 60 && srcX > 730 && srcY < 400);
                    // Check for iGET purple (high R and B, low G)
                    bool isIgetPurple = (c.R > 80 && c.B > 120 && c.G < 70 && srcX < 620 && srcY < 400);
                    // Check for ELFBAR screen/body (black/gold/dots) in old bottle zone
                    bool isElfbarCenter = (srcX >= 615 && srcX <= 750 && srcY < 390);

                    if (isOldBottleZone && (isNastyGreen || isIgetPurple || isElfbarCenter || srcY < 388))
                    {
                        // In the bottle zone above the stone surface, make it transparent
                        // so ONLY the stone ledge beneath them remains!
                        // If it's near the stone line (Y 385-395), replace with deep dark contact stone/shadow!
                        if (srcY >= 386)
                        {
                            // Deep stone contact occlusion (dark charcoal with purple/green rim nuance)
                            float t = (srcY - 386f) / 10f; // 0 to 1
                            int r = (int)(15 + t * 25);
                            int g = (int)(18 + t * 25);
                            int b = (int)(24 + t * 30);
                            int a = (int)(t * 255);
                            rock.SetPixel(x, y, Color.FromArgb(Math.Min(255, a), r, g, b));
                        }
                        else
                        {
                            // Completely clear the old bottles!
                            rock.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        }
                        continue;
                    }

                    // For pixels in the rock and surrounding fog:
                    // Check if pixel is in the dark background above the rock
                    // On the left: rock top slopes from srcX 425 (Y ~385) up to peak at srcX 520 (Y ~345)
                    // On the right: rock peak is at srcX 885 (Y ~365) and slopes down to 980 (Y ~430)
                    bool isSky = false;
                    if (srcX < 520)
                    {
                        // Left slope
                        int expectedTop = (int)(385 - (srcX - 425) * (40.0 / 95.0));
                        if (srcY < expectedTop - 5 && (c.R + c.G + c.B) < 55) isSky = true;
                    }
                    else if (srcX > 840)
                    {
                        // Right slope
                        int expectedTop = (int)(365 + (srcX - 885) * (65.0 / 95.0));
                        if (srcX <= 885) expectedTop = (int)(385 - (srcX - 840) * (20.0 / 45.0));
                        if (srcY < expectedTop - 6 && (c.R + c.G + c.B) < 55) isSky = true;
                    }

                    if (isSky)
                    {
                        rock.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        continue;
                    }

                    // Now calculate smooth alpha feathering for seamless blending:
                    float alpha = 1.0f;

                    // 1. Left fade (from x = 0 to 65)
                    if (x < 65)
                    {
                        alpha *= (float)x / 65f;
                    }

                    // 2. Right fade (from x = rw - 75 to rw)
                    if (x > rw - 75)
                    {
                        alpha *= (float)(rw - x) / 75f;
                    }

                    // 3. Bottom fade (from y = rh - 30 to rh)
                    if (y > rh - 30)
                    {
                        alpha *= (float)(rh - y) / 30f;
                    }

                    // 4. Background darkness soft blend
                    // In dark areas (where R, G, B are all low and close to background charcoal 11, 13, 18),
                    // fade alpha smoothly so there are zero hard edges against #0B0D12!
                    int lum = (int)(0.299 * c.R + 0.587 * c.G + 0.114 * c.B);
                    if (lum < 22)
                    {
                        alpha *= Math.Max(0f, (lum - 6f) / 16f);
                    }

                    int finalA = Math.Max(0, Math.Min(255, (int)(alpha * 255)));
                    rock.SetPixel(x, y, Color.FromArgb(finalA, c.R, c.G, c.B));
                }
            }

            rock.Save(outPath, ImageFormat.Png);
            Console.WriteLine(string.Format("Saved pristine rock pedestal to {0} ({1}x{2})", outPath, rw, rh));
        }
    }
}
