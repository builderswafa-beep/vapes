using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        string refPath = @"C:\Users\Administrator\.gemini\antigravity\brain\9532c926-388f-4ca4-b247-734d29972624\.user_uploaded\uploaded_media_1794816370712.jpg";
        string outPath = @"d:\vapes\assets\mossy-rock-exact-clean.png";

        using (Bitmap src = new Bitmap(refPath))
        {
            // Reference: 1024x512
            // Rock bounding box in reference:
            // X: 420 to 970 (width: 550)
            // Y: 335 to 445 (height: 110)
            int rx = 420;
            int ry = 335;
            int rw = 550;
            int rh = 110;

            Bitmap rock = new Bitmap(rw, rh, PixelFormat.Format32bppArgb);

            // Pseudo-random noise for natural rock texture synthesis
            Random rnd = new Random(42);

            for (int y = 0; y < rh; y++)
            {
                int srcY = ry + y;
                for (int x = 0; x < rw; x++)
                {
                    int srcX = rx + x;
                    Color c = src.GetPixel(srcX, srcY);

                    // Determine if this pixel is inside the old bottles area
                    // Old bottles: srcX 525 to 845
                    // Top profile of rock in center should be around srcY = 380..388
                    bool inCenterZone = (srcX >= 525 && srcX <= 845);

                    // Check if it's the old bottles (above stone surface or containing bottle colors)
                    bool isOldBottle = false;
                    if (inCenterZone)
                    {
                        if (srcY < 382)
                        {
                            isOldBottle = true;
                        }
                        else if (srcY <= 406)
                        {
                            // Check if color is bottle paint (lime green, purple, yellow, high brightness)
                            bool isGreen = (c.G > 95 && c.G > c.B * 1.4 && c.G > c.R * 0.9);
                            bool isPurple = (c.B > 80 && c.R > 70 && c.G < 65);
                            bool isBrightText = (c.R > 180 && c.G > 180 && c.B > 180);
                            bool isScreenYellow = (c.R > 140 && c.G > 120 && c.B < 60);
                            if (isGreen || isPurple || isBrightText || isScreenYellow || (srcY < 386))
                            {
                                isOldBottle = true;
                            }
                        }
                    }

                    if (isOldBottle)
                    {
                        if (srcY < 380)
                        {
                            // Sky / transparent above the stone platform
                            rock.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                            continue;
                        }
                        else
                        {
                            // Synthesize real rock texture!
                            // Blend texture from left rock (X 470..510) and right rock (X 850..880)
                            float blendRight = (float)(srcX - 525) / (845f - 525f);
                            int sampleY = Math.Min(src.Height - 1, 386 + (srcY - 380) % 25);
                            
                            int leftSampleX = 475 + (srcX % 35);
                            int rightSampleX = 850 + (srcX % 30);

                            Color cLeft = src.GetPixel(leftSampleX, sampleY);
                            Color cRight = src.GetPixel(rightSampleX, sampleY);

                            int rSyn = (int)(cLeft.R * (1f - blendRight) + cRight.R * blendRight);
                            int gSyn = (int)(cLeft.G * (1f - blendRight) + cRight.G * blendRight);
                            int bSyn = (int)(cLeft.B * (1f - blendRight) + cRight.B * blendRight);

                            // Add subtle contact shadow darkening (bottles resting on it)
                            float shadowFactor = (srcY <= 388) ? 0.65f : 0.85f;
                            rSyn = (int)(rSyn * shadowFactor);
                            gSyn = (int)(gSyn * shadowFactor);
                            bSyn = (int)(bSyn * shadowFactor);

                            c = Color.FromArgb(255, Math.Min(255, rSyn), Math.Min(255, gSyn), Math.Min(255, bSyn));
                        }
                    }

                    // Check if it's the sky above the rock wings
                    bool isSky = false;
                    if (srcX < 525)
                    {
                        // Left moss rock slope
                        int topRock = (int)(382 - (srcX - 420) * (42.0 / 105.0));
                        if (srcY < topRock - 3 && (c.R + c.G + c.B) < 55) isSky = true;
                    }
                    else if (srcX > 845)
                    {
                        // Right jagged rock peak
                        int topRock = (int)(362 + Math.Abs(srcX - 885) * (45.0 / 85.0));
                        if (srcY < topRock - 4 && (c.R + c.G + c.B) < 55) isSky = true;
                    }

                    if (isSky)
                    {
                        rock.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        continue;
                    }

                    // Calculate smooth edge alpha transitions:
                    float alpha = 1.0f;

                    // Fade left wing into background
                    if (x < 50)
                    {
                        alpha *= (float)x / 50f;
                    }

                    // Fade right wing into background
                    if (x > rw - 60)
                    {
                        alpha *= (float)(rw - x) / 60f;
                    }

                    // Fade bottom into dark smoke and white dock
                    if (y > rh - 25)
                    {
                        alpha *= (float)(rh - y) / 25f;
                    }

                    // Soft background darkness fade (melt near-black into transparent)
                    int lum = (int)(0.299 * c.R + 0.587 * c.G + 0.114 * c.B);
                    if (lum < 20)
                    {
                        alpha *= Math.Max(0f, (lum - 5f) / 15f);
                    }

                    int a = Math.Max(0, Math.Min(255, (int)(alpha * 255)));
                    rock.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));
                }
            }

            rock.Save(outPath, ImageFormat.Png);
            Console.WriteLine(string.Format("Saved clean synthesized rock pedestal to {0} ({1}x{2})", outPath, rw, rh));
        }
    }
}
