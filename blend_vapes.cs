using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        // Let's inspect footer_reference.jpg in the bottom right area
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\footer_reference.jpg"))
        {
            // The whole image is 1024 x 436
            // The black wave starts around X: 750 at Y: 360, curves UP to X: 850, Y: 220, and then goes to X: 1024, Y: 230
            // Let's create a transparent PNG of the vapes + smoke + rock with smooth alpha feathering!
            
            int cropX = 800;
            int cropY = 220;
            int cropW = 224;
            int cropH = 200;
            
            using (Bitmap crop = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
            {
                for (int y = 0; y < cropH; y++)
                {
                    for (int x = 0; x < cropW; x++)
                    {
                        Color c = bmp.GetPixel(cropX + x, cropY + y);
                        
                        // In the reference, the area OUTSIDE the black wave (top-left) is white/light-gray (R>220, G>220, B>220).
                        // The area INSIDE the wave is black (#000000 to #1A1A1A) or vape device colors or green vapor.
                        // Let's check if the pixel belongs to the white background:
                        bool isWhiteBackground = (c.R > 230 && c.G > 230 && c.B > 230);
                        
                        // If it's near white, make it transparent!
                        if (isWhiteBackground)
                        {
                            crop.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                        }
                        else if (c.R > 200 && c.G > 200 && c.B > 200)
                        {
                            // Soft feathering between 200 and 230
                            float alphaRatio = (230f - (c.R + c.G + c.B) / 3f) / 30f;
                            if (alphaRatio < 0) alphaRatio = 0;
                            if (alphaRatio > 1) alphaRatio = 1;
                            int a = (int)(alphaRatio * 255);
                            crop.SetPixel(x, y, Color.FromArgb(a, c.R, c.G, c.B));
                        }
                        else
                        {
                            crop.SetPixel(x, y, c);
                        }
                    }
                }
                
                crop.Save(@"d:\vapes\assets\footer\footer_vapes_blended.png", ImageFormat.Png);
                Console.WriteLine("Saved transparent blended vape image!");
            }
        }
    }
}
