using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

class Program
{
    static void Main()
    {
        string refPath = @"d:\vapes\assets\category-trending-reference.jpg";
        using (Bitmap bmp = new Bitmap(refPath))
        {
            Console.WriteLine("Image dimensions: " + bmp.Width + "x" + bmp.Height);
            
            // Let's inspect approximate coordinates:
            // Top section: y around 20 to 240
            // Bottom section: y around 250 to 500
            
            // Category row cards (4 cards)
            // Total width 1024, cards are spaced across roughly x: 40 to 980
            // Card width ~ 220-230, height ~ 150-160
            
            // Let's create an output dir for sliced assets
            Directory.CreateDirectory(@"d:\vapes\assets\category_trending");

            // Crop category products / illustrations:
            // Let's save slices to verify
            CropAndSave(bmp, 160, 135, 120, 150, @"d:\vapes\assets\category_trending\cat_prod_1_test.png");
        }
    }

    static void CropAndSave(Bitmap src, int x, int y, int w, int h, string outPath)
    {
        if (x + w > src.Width) w = src.Width - x;
        if (y + h > src.Height) h = src.Height - y;
        using (Bitmap crop = new Bitmap(w, h))
        {
            using (Graphics g = Graphics.FromImage(crop))
            {
                g.DrawImage(src, new Rectangle(0, 0, w, h), new Rectangle(x, y, w, h), GraphicsUnit.Pixel);
            }
            crop.Save(outPath, ImageFormat.Png);
        }
        Console.WriteLine("Saved: " + outPath);
    }
}
