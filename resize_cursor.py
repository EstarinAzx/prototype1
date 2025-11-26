
import sys
import subprocess
import os

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

try:
    from PIL import Image
except ImportError:
    print("Pillow not found, installing...")
    install("Pillow")
    from PIL import Image

def resize_image(input_path, output_path):
    try:
        img = Image.open(input_path)
        # Resize to 32x32, using LANCZOS for quality
        img = img.resize((32, 32), Image.Resampling.LANCZOS)
        img.save(output_path)
        print(f"Image resized successfully: {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Resize Cursor (already done, but good to keep)
resize_image("D:/eweew/AG/Dirs/proj1/images/cyberpunk-2077-chipware-cursor.png", "D:/eweew/AG/Dirs/proj1/public/cursor_small.png")

# Resize Pointer
resize_image("D:/eweew/AG/Dirs/proj1/images/cyberpunk-2077-chipware-pointer.png", "D:/eweew/AG/Dirs/proj1/public/pointer_small.png")
