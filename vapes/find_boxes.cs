using System;
using System.Drawing;
using System.Drawing.Imaging;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // Category Row:
            // Y starts around 130 to 235
            // Let's check card 1: x ~ 40 to 275 (width ~ 235)
            // Card 2: x ~ 285 to 505
            // Card 3: x ~ 515 to 735
            // Card 4: x ~ 745 to 975
            // Let's test these:
            Crop(bmp, 38, 134, 237, 160, "cat_card_1.png");
            Crop(bmp, 280, 134, 226, 160, "cat_card_2.png");
            Crop(bmp, 513, 134, 226, 160, "cat_card_3.png");
            Crop(bmp, 744, 134, 234, 160, "cat_card_4.png");

            // Also let's crop just the products inside category cards with their glass pedestals:
            // Card 1 product: x: 120-275, y: 140-290
            Crop(bmp, 115, 145, 160, 150, "cat_prod_1.png");
            // Card 2 product: x: 360-505, y: 135-290
            Crop(bmp, 355, 136, 150, 155, "cat_prod_2.png");
            // Card 3 product: x: 585-735, y: 145-290
            Crop(bmp, 580, 145, 158, 146, "cat_prod_3.png");
            // Card 4 product: x: 835-975, y: 145-290
            Crop(bmp, 835, 145, 143, 146, "cat_prod_4.png");

            // Trending Row (5 cards):
            // Y starts around 300 to 485
            // 5 cards across ~ 1024 width:
            // Card 1: x ~ 50 to 230
            // Card 2: x ~ 238 to 418
            // Card 3: x ~ 426 to 606
            // Card 4: x ~ 614 to 794
            // Card 5: x ~ 802 to 982
            Crop(bmp, 50, 305, 180, 190, "trend_card_1.png");
            Crop(bmp, 238, 305, 180, 190, "trend_card_2.png");
            Crop(bmp, 426, 305, 180, 190, "trend_card_3.png");
            Crop(bmp, 614, 305, 180, 190, "trend_card_4.png");
            Crop(bmp, 802, 305, 180, 190, "trend_card_5.png");

            // And also crop the individual product image areas in trending cards:
            // Trending product 1 image:
            Crop(bmp, 65, 320, 150, 115, "trend_prod_1.png");
            // Trending product 2 image:
            Crop(bmp, 255, 320, 150, 115, "trend_prod_2.png");
            // Trending product 3 image:
            Crop(bmp, 440, 320, 150, 115, "trend_prod_3.png");
            // Trending product 4 image:
            Crop(bmp, 630, 320, 150, 115, "trend_prod_4.png");
            // Trending product 5 image:
            Crop(bmp, 815, 320, 150, 115, "trend_prod_5.png");
        }
    }

    static void Crop(Bitmap src, int x, int y, int w, int h, string name)
    {
        string outPath = @"d:\vapes\assets\category_trending\" + name;
        using (Bitmap crop = new Bitmap(w, h))
        {
            using (Graphics g = Graphics.FromImage(crop))
            {
                g.DrawImage(src, new Rectangle(0, 0, w, h), new Rectangle(x, y, w, h), GraphicsUnit.Pixel);
            }
            crop.Save(outPath, ImageFormat.Png);
        }
        Console.WriteLine("Saved: " + name);
    }
}
