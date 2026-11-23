using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // Category Cards actual Y range:
            // Top of card: around Y = 68
            // Bottom of card: around Y = 226 (or 230)
            // Height = ~160px
            // Card 1: X = 38 to 275 (width = 237)
            // Card 2: X = 280 to 506 (width = 226)
            // Card 3: X = 512 to 738 (width = 226)
            // Card 4: X = 744 to 978 (width = 234)

            Crop(bmp, 38, 68, 238, 160, @"d:\vapes\assets\category_trending\cat_card_1_full.png");
            Crop(bmp, 280, 68, 228, 160, @"d:\vapes\assets\category_trending\cat_card_2_full.png");
            Crop(bmp, 512, 68, 228, 160, @"d:\vapes\assets\category_trending\cat_card_3_full.png");
            Crop(bmp, 744, 68, 235, 160, @"d:\vapes\assets\category_trending\cat_card_4_full.png");

            // Category Products (just the 3D renders with pedestals):
            // Card 1 product (ELFBAR disposable): X: 110-275, Y: 70-226
            Crop(bmp, 115, 70, 160, 156, @"d:\vapes\assets\category_trending\cat_prod_1_isolated.png");
            // Card 2 product (Box mod): X: 350-505, Y: 68-226
            Crop(bmp, 355, 68, 152, 158, @"d:\vapes\assets\category_trending\cat_prod_2_isolated.png");
            // Card 3 product (NASTY 3-pack): X: 580-738, Y: 70-226
            Crop(bmp, 580, 70, 158, 156, @"d:\vapes\assets\category_trending\cat_prod_3_isolated.png");
            // Card 4 product (Pods): X: 830-978, Y: 70-226
            Crop(bmp, 835, 70, 142, 156, @"d:\vapes\assets\category_trending\cat_prod_4_isolated.png");

            // Trending Products section:
            // Header is around Y = 260 to 290
            // Product cards start at Y = 300 to 495 (Height = 195px)
            // 5 cards:
            // Card 1: X = 48 to 230 (width = 182)
            // Card 2: X = 236 to 418 (width = 182)
            // Card 3: X = 424 to 606 (width = 182)
            // Card 4: X = 612 to 794 (width = 182)
            // Card 5: X = 800 to 982 (width = 182)

            Crop(bmp, 48, 300, 182, 195, @"d:\vapes\assets\category_trending\trend_card_1_full.png");
            Crop(bmp, 236, 300, 182, 195, @"d:\vapes\assets\category_trending\trend_card_2_full.png");
            Crop(bmp, 424, 300, 182, 195, @"d:\vapes\assets\category_trending\trend_card_3_full.png");
            Crop(bmp, 612, 300, 182, 195, @"d:\vapes\assets\category_trending\trend_card_4_full.png");
            Crop(bmp, 800, 300, 182, 195, @"d:\vapes\assets\category_trending\trend_card_5_full.png");

            // Individual product images inside Trending cards:
            // Image area inside card: Y = 315 to 425 (Height = 110px)
            Crop(bmp, 62, 315, 154, 110, @"d:\vapes\assets\category_trending\trend_prod_1_clean.png");
            Crop(bmp, 250, 315, 154, 110, @"d:\vapes\assets\category_trending\trend_prod_2_clean.png");
            Crop(bmp, 438, 315, 154, 110, @"d:\vapes\assets\category_trending\trend_prod_3_clean.png");
            Crop(bmp, 626, 315, 154, 110, @"d:\vapes\assets\category_trending\trend_prod_4_clean.png");
            Crop(bmp, 814, 315, 154, 110, @"d:\vapes\assets\category_trending\trend_prod_5_clean.png");

            Console.WriteLine("Cropped all cards and isolated images with pixel precision!");
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
