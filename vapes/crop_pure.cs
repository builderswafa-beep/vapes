using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // Category Products (right side only):
            Crop(bmp, 145, 68, 129, 158, @"d:\vapes\assets\category_trending\cat_prod_1_pure.png");
            Crop(bmp, 385, 68, 120, 158, @"d:\vapes\assets\category_trending\cat_prod_2_pure.png");
            Crop(bmp, 605, 68, 131, 158, @"d:\vapes\assets\category_trending\cat_prod_3_pure.png");
            // Cat 4: shift left boundary from 845 to 860 (+15px)
            Crop(bmp, 860, 68, 115, 158, @"d:\vapes\assets\category_trending\cat_prod_4_pure.png");

            // Trending Products: shift top from Y=330 to Y=340 (+10px) to clear the "Sale" badge sliver
            Crop(bmp, 60, 340, 160, 90, @"d:\vapes\assets\category_trending\trend_prod_1_pure.png");
            Crop(bmp, 248, 340, 160, 90, @"d:\vapes\assets\category_trending\trend_prod_2_pure.png");
            Crop(bmp, 436, 340, 160, 90, @"d:\vapes\assets\category_trending\trend_prod_3_pure.png");
            Crop(bmp, 624, 340, 160, 90, @"d:\vapes\assets\category_trending\trend_prod_4_pure.png");
            Crop(bmp, 812, 340, 160, 90, @"d:\vapes\assets\category_trending\trend_prod_5_pure.png");

            Console.WriteLine("Cropped refined pure product renders!");
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
