using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

class Program
{
    static void Main()
    {
        Directory.CreateDirectory(@"d:\vapes\assets\footer");

        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\footer_reference.jpg"))
        {
            Console.WriteLine("Footer reference: " + bmp.Width + "x" + bmp.Height);

            // 1. Bottom-right 3D vapes on rock:
            // X: ~800 to 1024, Y: ~220 to 420
            Crop(bmp, 800, 220, 224, 200, @"d:\vapes\assets\footer\footer_vapes_rock.png");

            // 2. Just the two vape devices if needed:
            Crop(bmp, 825, 235, 145, 180, @"d:\vapes\assets\footer\footer_vapes_only.png");

            // 3. Payment badges strip:
            Crop(bmp, 430, 375, 140, 35, @"d:\vapes\assets\footer\payment_badges.png");

            // 4. Logo:
            Crop(bmp, 55, 80, 155, 55, @"d:\vapes\assets\footer\noxi_logo.png");
        }

        Console.WriteLine("Cropped footer assets successfully!");
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
