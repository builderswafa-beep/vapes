using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // Crop top half (Y: 0 to 260) and bottom half (Y: 250 to 512)
            Crop(bmp, 0, 0, 1024, 260, @"d:\vapes\assets\category_trending\half_top.png");
            Crop(bmp, 0, 250, 1024, 262, @"d:\vapes\assets\category_trending\half_bottom.png");
            Console.WriteLine("Cropped halves successfully");
        }
    }

    static void Crop(Bitmap src, int x, int y, int w, int h, string outPath)
    {
        using (Bitmap crop = new Bitmap(w, h))
        {
            using (Graphics g = Graphics.FromImage(crop))
            {
                g.DrawImage(src, new Rectangle(0, 0, w, h), new Rectangle(x, y, w, h), GraphicsUnit.Pixel);
            }
            crop.Save(outPath, ImageFormat.Png);
        }
    }
}
