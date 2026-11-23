using System;
using System.Drawing;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // In the top section:
            // "SHOP BY" at x: ~54, y: ~33
            // "Category" at x: ~54, y: ~75
            // "View All Categories >" button at top right: x: ~820 to 970, y: ~42 to 92
            
            // Where do the 4 Category cards actually start and end?
            // Let's find top and bottom edge of category cards:
            // Scan around x=150, y=50 to 250
            // Look for card top border highlight (white/semi-transparent) or shadow
            for (int y = 50; y < 200; y++)
            {
                Color c = bmp.GetPixel(150, y);
                if (c.R > 240 && c.G > 240 && c.B > 240)
                {
                    Console.WriteLine("Possible card top at Y=" + y + ": " + c);
                }
            }

            // Let's find the exact bounding boxes of the 4 Category cards:
            // Card 1:
            // Let's sample colors around y=100..250
        }
    }
}
