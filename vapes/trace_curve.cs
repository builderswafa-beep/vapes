using System;
using System.Drawing;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\footer_reference.jpg"))
        {
            // Trace the boundary where background changes from light to dark in the right half:
            // For X from 700 to 1023:
            Console.WriteLine("Tracing black curve boundary (X, Y):");
            for (int x = 700; x < bmp.Width; x += 25)
            {
                int boundaryY = -1;
                for (int y = 150; y < bmp.Height; y++)
                {
                    Color c = bmp.GetPixel(x, y);
                    // Check when color becomes dark (black/dark-charcoal wave)
                    // The neon green edge line has high green and lower blue/red, or it transitions into dark
                    if ((c.R < 100 && c.G > 120 && c.B < 100) || (c.R < 60 && c.G < 60 && c.B < 60))
                    {
                        boundaryY = y;
                        break;
                    }
                }
                Console.WriteLine(string.Format("X={0} -> Y={1}", x, boundaryY));
            }
        }
    }
}
