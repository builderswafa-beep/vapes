using System;
using System.Drawing;

class Program
{
    static void Main()
    {
        string refPath = @"C:\Users\Administrator\.gemini\antigravity\brain\9532c926-388f-4ca4-b247-734d29972624\.user_uploaded\uploaded_media_1794816370712.jpg";
        using (Bitmap bmp = new Bitmap(refPath))
        {
            Console.WriteLine(string.Format("Reference image dimensions: {0}x{1}", bmp.Width, bmp.Height));
        }
    }
}
