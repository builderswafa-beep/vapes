using System;
using System.Drawing;

class Program
{
    static void Main()
    {
        using (Bitmap bmp = new Bitmap(@"d:\vapes\assets\category-trending-reference.jpg"))
        {
            // Find text "SHOP BY" near top-left:
            // Let's sample X: 40-200, Y: 10-100
            // Find pixels that are significantly dark (text) or bright lime
            int shopByTop = -1, shopByBottom = -1;
            for (int y = 0; y < 140; y++)
            {
                for (int x = 30; x < 250; x++)
                {
                    Color c = bmp.GetPixel(x, y);
                    if (c.R < 80 && c.G < 80 && c.B < 80) // dark text
                    {
                        if (shopByTop == -1) shopByTop = y;
                        shopByBottom = y;
                    }
                }
            }
            Console.WriteLine(string.Format("Category header text Y range: {0} to {1}", shopByTop, shopByBottom));

            // Trending header text
            int trendTop = -1, trendBottom = -1;
            for (int y = 240; y < 320; y++)
            {
                for (int x = 30; x < 350; x++)
                {
                    Color c = bmp.GetPixel(x, y);
                    if (c.R < 80 && c.G < 80 && c.B < 80) // dark text
                    {
                        if (trendTop == -1) trendTop = y;
                        trendBottom = y;
                    }
                }
            }
            Console.WriteLine(string.Format("Trending header text Y range: {0} to {1}", trendTop, trendBottom));
        }
    }
}
