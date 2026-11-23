using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\footer_reference.jpg"))
        {
            // Crop the vape area from footer_reference.jpg
            int cropX = 810;
            int cropY = 220;
            int cropW = 214;
            int cropH = 200;

            using (Bitmap crop = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
            {
                for (int y = 0; y < cropH; y++)
                {
                    for (int x = 0; x < cropW; x++)
                    {
                        Color c = bmp.GetPixel(cropX + x, cropY + y);
                        
                        // Check if it's the light/white background of the footer
                        // The background in the reference is light grey/white (R>210, G>210, B>210)
                        float brightness = (c.R + c.G + c.B) / 3f;
                        
                        // Distance from top-left corner of the crop box to feather any stray edge:
                        // Top and Left edges should fade cleanly
                        float fade = 1.0f;
                        if (x < 15) fade = Math.Min(fade, x / 15f);
                        if (y < 15) fade = Math.Min(fade, y / 15f);

                        if (brightness >= 225)
                        {
                            // Completely transparent
                            crop.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        }
                        else if (brightness > 185 && c.R > 180 && c.B > 180)
                        {
                            // Near-white background transition
                            float t = (225f - brightness) / 40f;
                            int a = (int)(Math.Max(0, Math.Min(255, t * 255 * fade)));
                            crop.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));
                        }
                        else
                        {
                            int a = (int)(255 * fade);
                            crop.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));
                        }
                    }
                }

                crop.Save(@"d:\vapes\assets\footer\footer_vapes_blended.png", ImageFormat.Png);
                Console.WriteLine("Saved refined footer_vapes_blended.png");
            }
        }
    }
}
