using System;
using System.Drawing;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // Scan across Y=80 to 180 to find where card 1 top border is:
            for (int y = 50; y < 160; y += 2)
            {
                Color c = bmp.GetPixel(100, y);
                Console.WriteLine(string.Format("Y={0}: R={1}, G={2}, B={3}", y, c.R, c.G, c.B));
            }
        }
    }
}
