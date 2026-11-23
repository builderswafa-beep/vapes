using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

class Program
{
    static void Main()
    {
        Directory.CreateDirectory(@"d:\vapes\assets\promo_trust");

        // 1. Process promo_banners_reference.jpg (1024x341)
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\promo_banners_reference.jpg"))
        {
            Console.WriteLine("Promo banner size: " + bmp.Width + "x" + bmp.Height);

            // Left banner full card
            Crop(bmp, 20, 58, 485, 230, @"d:\vapes\assets\promo_trust\banner_disposable_full.png");

            // Left banner 3D vape render + pedestal (right portion of left card)
            Crop(bmp, 260, 50, 240, 240, @"d:\vapes\assets\promo_trust\banner_disposable_render.png");

            // Right banner full card
            Crop(bmp, 520, 58, 485, 230, @"d:\vapes\assets\promo_trust\banner_kits_full.png");

            // Right banner 3D vape render + pedestal (right portion of right card)
            Crop(bmp, 740, 50, 260, 240, @"d:\vapes\assets\promo_trust\banner_kits_render.png");
        }

        // 2. Process trust_brands_reference.jpg (1024x421)
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\trust_brands_reference.jpg"))
        {
            Console.WriteLine("Trust brands size: " + bmp.Width + "x" + bmp.Height);

            // 4 trust cards in "Why Shop With Us?":
            // Y is around 70 to 150
            // Card 1: X: ~25 to ~255
            // Card 2: X: ~268 to ~498
            // Card 3: X: ~510 to ~740
            // Card 4: X: ~752 to ~982
            Crop(bmp, 25, 75, 232, 75, @"d:\vapes\assets\promo_trust\trust_card_1.png");
            Crop(bmp, 268, 75, 232, 75, @"d:\vapes\assets\promo_trust\trust_card_2.png");
            Crop(bmp, 510, 75, 232, 75, @"d:\vapes\assets\promo_trust\trust_card_3.png");
            Crop(bmp, 752, 75, 232, 75, @"d:\vapes\assets\promo_trust\trust_card_4.png");

            // Top Vape Brands Banner (Dark pill container)
            // Y is around 225 to 395
            Crop(bmp, 25, 226, 974, 168, @"d:\vapes\assets\promo_trust\brands_banner_full.png");

            // Individual brand pills:
            // Y: ~312 to ~368 (height ~56)
            // Brand 1 ELFBAR: X: ~60 to ~200
            // Brand 2 iGET: X: ~212 to ~352
            // Brand 3 NASTY: X: ~364 to ~504
            // Brand 4 LOST MARY: X: ~516 to ~656
            // Brand 5 OXVA: X: ~668 to ~808
            // Brand 6 VOOPOO: X: ~820 to ~960
            Crop(bmp, 60, 312, 142, 56, @"d:\vapes\assets\promo_trust\brand_elfbar.png");
            Crop(bmp, 212, 312, 142, 56, @"d:\vapes\assets\promo_trust\brand_iget.png");
            Crop(bmp, 364, 312, 142, 56, @"d:\vapes\assets\promo_trust\brand_nasty.png");
            Crop(bmp, 516, 312, 142, 56, @"d:\vapes\assets\promo_trust\brand_lostmary.png");
            Crop(bmp, 668, 312, 142, 56, @"d:\vapes\assets\promo_trust\brand_oxva.png");
            Crop(bmp, 820, 312, 142, 56, @"d:\vapes\assets\promo_trust\brand_voopoo.png");
        }

        Console.WriteLine("All assets sliced successfully!");
    }

    static void Crop(Bitmap src, int x, int y, int w, int h, string outPath)
    {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
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
    }
}
