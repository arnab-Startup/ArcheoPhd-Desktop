import os
os.environ["HF_HOME"] = "/data/.cache/huggingface"
import sys
import time
import json
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText

MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct"
print(f"=== INITIALIZING VLM FOR STRUCTURED EXTRACTION ===")

processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    _attn_implementation="eager"
)

# Test page p053 (5 ground truth facts: 1966 to 1969, 8 m., 74 mtrs, 694, 20-40 cm)
img = Image.open("images/sankalia_p053-053.png")
max_dim = 1024
scale = max_dim / max(img.size)
img_resized = img.resize((int(img.size[0] * scale), int(img.size[1] * scale)))

prompt = (
    "Carefully inspect this archaeological excavation report page. "
    "Extract the exact printed numbers for the following items:\n"
    "1. Excavation season year range (years from ... to ...):\n"
    "2. Thickness of alluvium over rock (in meters):\n"
    "3. Exposed horizon area in meters (mtrs):\n"
    "4. Number of Early Stone Age tools recovered:\n"
    "5. Thickness of rubble horizon overlying trap basalt (in cm):\n"
    "Answer with the exact verbatim numbers printed on the page."
)

messages = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": prompt}]}]
text = processor.apply_chat_template(messages, add_generation_prompt=True)
inputs = processor(text=text, images=[img_resized], return_tensors="pt")

t0 = time.time()
with torch.no_grad():
    out = model.generate(**inputs, max_new_tokens=256)
duration = time.time() - t0

print(f"\np053 extraction took {duration:.2f}s:")
print(processor.batch_decode(out, skip_special_tokens=True)[0])
