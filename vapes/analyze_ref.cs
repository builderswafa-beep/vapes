using System;
using System.Drawing;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            Console.WriteLine("Width: " + bmp.Width + ", Height: " + bmp.Height);
            
            // Check row averages or scan for card edges:
            // Let's sample along Y = 180 (middle of category cards)
            Console.WriteLine("Scanning Y=180 across X=0..1023:");
            int prevWhite = 0;
            for (int x = 20; x < bmp.Width - 20; x += 5)
            {
                Color c = bmp.GetPixel(x, 180);
                // Print noticeable color transitions
                if (x % 50 == 0)
                {
                    Console.WriteLine(string.Format("x={0}: R={1}, G={2}, B={3}", x, c.R, c.G, c.B));
                }
            }

            // Let's check card boundaries in Category row
            // Category row Y range:
            // Top of card 1 is around Y = 135
            // Bottom of card 1 is around Y = 295
            for (int y = 120; y <= 310; y += 10)
            {
                Color c = bmp.GetPixel(150, y);
                Console.WriteLine(string.Format("Y={0} at X=150: R={1}, G={2}, B={3}", y, c.R, c.G, c.B));
            }
        }
    }
}
