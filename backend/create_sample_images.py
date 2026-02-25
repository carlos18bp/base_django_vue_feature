"""
Script to create colorful sample images for products and blogs
Run: python create_sample_images.py
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_product_images():
    """Create 4 colorful product sample images"""
    
    # Create directory if it doesn't exist
    os.makedirs('media/temp/product', exist_ok=True)
    
    # Color schemes for products
    colors = [
        ('#FF6B6B', '#4ECDC4', 'Product 1'),  # Red/Teal
        ('#95E1D3', '#F38181', 'Product 2'),  # Mint/Pink
        ('#AA96DA', '#FCBAD3', 'Product 3'),  # Purple/Pink
        ('#A8E6CF', '#FFD3B6', 'Product 4'),  # Green/Peach
    ]
    
    for idx, (color1, color2, text) in enumerate(colors, 1):
        # Create image with gradient-like effect
        img = Image.new('RGB', (800, 600), color1)
        draw = ImageDraw.Draw(img)
        
        # Draw some decorative shapes
        draw.rectangle([100, 100, 700, 500], fill=color2, outline='white', width=5)
        draw.ellipse([200, 200, 600, 500], fill=color1, outline='white', width=3)
        
        # Add text
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position to center it
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (800 - text_width) // 2
        y = (600 - text_height) // 2
        
        # Draw text with shadow
        draw.text((x+3, y+3), text, fill='#00000066', font=font)
        draw.text((x, y), text, fill='white', font=font)
        
        # Save image
        img.save(f'media/temp/product/image_temp{idx}.webp', 'WEBP', quality=85)
        print(f'✅ Created: media/temp/product/image_temp{idx}.webp')

def create_blog_images():
    """Create 4 colorful blog sample images"""
    
    # Create directory if it doesn't exist
    os.makedirs('media/temp/blog', exist_ok=True)
    
    # Color schemes for blogs
    colors = [
        ('#667EEA', '#764BA2', 'Blog Post 1'),  # Purple gradient
        ('#F093FB', '#F5576C', 'Blog Post 2'),  # Pink gradient
        ('#4FACFE', '#00F2FE', 'Blog Post 3'),  # Blue gradient
        ('#43E97B', '#38F9D7', 'Blog Post 4'),  # Green gradient
    ]
    
    for idx, (color1, color2, text) in enumerate(colors, 1):
        # Create image
        img = Image.new('RGB', (1200, 630), color1)
        draw = ImageDraw.Draw(img)
        
        # Create gradient effect with horizontal bands
        for i in range(630):
            # Interpolate between colors
            r1, g1, b1 = int(color1[1:3], 16), int(color1[3:5], 16), int(color1[5:7], 16)
            r2, g2, b2 = int(color2[1:3], 16), int(color2[3:5], 16), int(color2[5:7], 16)
            
            ratio = i / 630
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            
            draw.line([(0, i), (1200, i)], fill=(r, g, b))
        
        # Draw decorative elements
        draw.rectangle([50, 50, 1150, 580], outline='white', width=5)
        
        # Add text
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Main title
        bbox = draw.textbbox((0, 0), text, font=font_large)
        text_width = bbox[2] - bbox[0]
        x = (1200 - text_width) // 2
        y = 220
        
        draw.text((x+3, y+3), text, fill='#00000066', font=font_large)
        draw.text((x, y), text, fill='white', font=font_large)
        
        # Subtitle
        subtitle = "Sample Blog Image"
        bbox = draw.textbbox((0, 0), subtitle, font=font_small)
        text_width = bbox[2] - bbox[0]
        x = (1200 - text_width) // 2
        y = 350
        
        draw.text((x+2, y+2), subtitle, fill='#00000044', font=font_small)
        draw.text((x, y), subtitle, fill='white', font=font_small)
        
        # Save image
        img.save(f'media/temp/blog/image_temp{idx}.webp', 'WEBP', quality=85)
        print(f'✅ Created: media/temp/blog/image_temp{idx}.webp')

if __name__ == '__main__':
    print("🎨 Creating sample images...")
    print("\n📦 Creating product images:")
    create_product_images()
    print("\n📝 Creating blog images:")
    create_blog_images()
    print("\n✨ Done! Sample images created successfully!")
    print("\nYou can now run:")
    print("  python manage.py delete_fake_data --confirm")
    print("  python manage.py create_fake_data")
