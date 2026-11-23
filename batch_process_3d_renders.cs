using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

class BatchProcessor {
    static void Main() {
        string brainDir = @"C:\Users\Administrator\.gemini\antigravity\brain\cd2d2772-460b-498e-a886-08990c928f8a";
        string outDir = @"d:\vapes\assets\category_trending";

        var tasks = new[] {
            new {
                Input = Path.Combine(brainDir, "elfbar_luxury_vape_render_1794908664326.jpg"),
                Output = Path.Combine(outDir, "cat_prod_1_hd.png"),
                Name = "Category 1: Disposable Vapes"
            },
            new {
                Input = Path.Combine(brainDir, "luxury_box_mod_vape_render_1794909044279.jpg"),
                Output = Path.Combine(outDir, "cat_prod_2_hd.png"),
                Name = "Category 2: Reusable Kits"
            },
            new {
                Input = Path.Combine(brainDir, "luxury_vape_bottles_render_1794909063746.jpg"),
                Output = Path.Combine(outDir, "cat_prod_3_hd.png"),
                Name = "Category 3: Nicotine Salts"
            },
            new {
                Input = Path.Combine(brainDir, "magnetic_vape_replacement_pods_1794909072168.jpg"),
                Output = Path.Combine(outDir, "cat_prod_4_hd.png"),
                Name = "Category 4: Replacement Pods"
            },
            new {
                Input = Path.Combine(brainDir, "vape_collection_trio_render_1794909086983.jpg"),
                Output = Path.Combine(outDir, "trend_prod_1_hd.png"),
                Name = "Trending 1: Disposable Trio"
            },
            new {
                Input = Path.Combine(brainDir, "luxury_reusable_vape_kit_1794909098575.jpg"),
                Output = Path.Combine(outDir, "trend_prod_2_hd.png"),
                Name = "Trending 2: Reusable Duo"
            },
            new {
                Input = Path.Combine(brainDir, "luxury_vape_bottles_render_1794909063746.jpg"),
                Output = Path.Combine(outDir, "trend_prod_3_hd.png"),
                Name = "Trending 3: Nicotine Salts"
            },
            new {
                Input = Path.Combine(brainDir, "magnetic_vape_replacement_pods_1794909072168.jpg"),
                Output = Path.Combine(outDir, "trend_prod_4_hd.png"),
                Name = "Trending 4: Replacement Pods"
            },
            new {
                Input = Path.Combine(brainDir, "elfbar_40000_puffs_render_1794909082373.jpg"),
                Output = Path.Combine(outDir, "trend_prod_5_hd.png"),
                Name = "Trending 5: Elfbar 40000"
            }
        };

        foreach (var task in tasks) {
            Console.WriteLine("Processing: " + task.Name);
            if (!File.Exists(task.Input)) {
                Console.WriteLine("  Error: file not found: " + task.Input);
                continue;
            }
            ProcessSingleImage(task.Input, task.Output);
        }
        Console.WriteLine("ALL IMAGES PROCESSED SUCCESSFULLY!");
    }

    static void ProcessSingleImage(string inPath, string outPath) {
        using (Bitmap src = new Bitmap(inPath)) {
            int w = src.Width;
            int h = src.Height;
            Bitmap dst = new Bitmap(w, h, PixelFormat.Format32bppArgb);

            bool[,] isBg = new bool[w, h];
            Queue<Point> q = new Queue<Point>();

            // Enqueue all perimeter pixels that are light/neutral background
            for (int x = 0; x < w; x++) {
                TryEnqueue(src, isBg, q, x, 0);
                TryEnqueue(src, isBg, q, x, h - 1);
            }
            for (int y = 0; y < h; y++) {
                TryEnqueue(src, isBg, q, 0, y);
                TryEnqueue(src, isBg, q, w - 1, y);
            }

            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };

            while (q.Count > 0) {
                Point p = q.Dequeue();
                for (int i = 0; i < 4; i++) {
                    int nx = p.X + dx[i];
                    int ny = p.Y + dy[i];
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h && !isBg[nx, ny]) {
                        Color c = src.GetPixel(nx, ny);
                        int lum = (c.R * 299 + c.G * 587 + c.B * 114) / 1000;
                        int diff = Math.Max(Math.Abs(c.R - c.G), Math.Max(Math.Abs(c.R - c.B), Math.Abs(c.G - c.B)));
                        // Flood fill if it's near-white or light grey studio background (lum > 200, low saturation)
                        if (lum > 200 && diff < 28) {
                            isBg[nx, ny] = true;
                            q.Enqueue(new Point(nx, ny));
                        }
                    }
                }
            }

            int minX = w, maxX = 0, minY = h, maxY = 0;

            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    Color c = src.GetPixel(x, y);
                    if (isBg[x, y]) {
                        dst.SetPixel(x, y, Color.FromArgb(0, 0, 0, 0));
                    } else {
                        int lum = (c.R * 299 + c.G * 587 + c.B * 114) / 1000;
                        int diff = Math.Max(Math.Abs(c.R - c.G), Math.Max(Math.Abs(c.R - c.B), Math.Abs(c.G - c.B)));
                        int alpha = 255;
                        if (lum > 195 && diff < 28) {
                            // Soft feathering for edge transitions
                            float factor = (220f - lum) / 25f;
                            if (factor < 0f) factor = 0f;
                            if (factor > 1f) factor = 1f;
                            alpha = (int)(255 * factor);
                        }
                        dst.SetPixel(x, y, Color.FromArgb(alpha, c.R, c.G, c.B));

                        if (alpha > 20) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
            }

            int pad = 14;
            int cropX = Math.Max(0, minX - pad);
            int cropY = Math.Max(0, minY - pad);
            int cropW = Math.Min(w - cropX, (maxX - minX + 1) + pad * 2);
            int cropH = Math.Min(h - cropY, (maxY - minY + 1) + pad * 2);

            using (Bitmap cropped = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(cropped)) {
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                    g.DrawImage(dst, new Rectangle(0, 0, cropW, cropH), new Rectangle(cropX, cropY, cropW, cropH), GraphicsUnit.Pixel);
                }
                cropped.Save(outPath, ImageFormat.Png);
                Console.WriteLine("  -> Saved " + Path.GetFileName(outPath) + " (" + cropW + "x" + cropH + ")");
            }
        }
    }

    static void TryEnqueue(Bitmap src, bool[,] isBg, Queue<Point> q, int x, int y) {
        if (!isBg[x, y]) {
            Color c = src.GetPixel(x, y);
            int lum = (c.R * 299 + c.G * 587 + c.B * 114) / 1000;
            int diff = Math.Max(Math.Abs(c.R - c.G), Math.Max(Math.Abs(c.R - c.B), Math.Abs(c.G - c.B)));
            if (lum > 195 && diff < 30) {
                isBg[x, y] = true;
                q.Enqueue(new Point(x, y));
            }
        }
    }
}
