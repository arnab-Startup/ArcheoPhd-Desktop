import os
os.environ["HF_HOME"] = "/data/.cache/huggingface"
import sys
import time
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText

MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct"
print(f"=== INITIALIZING VLM: {MODEL_ID} FOR TARGETED QA ===")

processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    _attn_implementation="eager"
)

# Test 1: Full page question on p052
img = Image.open("images/sankalia_p052-052.png")
max_dim = 1024
scale = max_dim / max(img.size)
img_resized = img.resize((int(img.size[0] * scale), int(img.size[1] * scale)))

prompt1 = "What year was the Chirki site discovered? Read the text on the page and answer with just the four-digit year."
messages1 = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": prompt1}]}]
text1 = processor.apply_chat_template(messages1, add_generation_prompt=True)
inputs1 = processor(text=text1, images=[img_resized], return_tensors="pt")

t0 = time.time()
with torch.no_grad():
    out1 = model.generate(**inputs1, max_new_tokens=64)
print(f"p052 QA result in {time.time() - t0:.2f}s:")
print(processor.batch_decode(out1, skip_special_tokens=True)[0])

# Test 2: Cropped paragraph on p053 (Early Stone Age tools recovered: 694)
# In p053, lines 18-22 contain "74 mtrs ... 694 ... 20-40 cm"
# Let's crop the middle section of p053
w, h = img.size
crop_p053 = Image.open("images/sankalia_p053-053.png").crop((0, int(h * 0.25), w, int(h * 0.55)))

prompt2 = "How many Early Stone Age tools were recovered from Trench VII? What is the thickness of the rubble horizon in cm?"
messages2 = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": prompt2}]}]
text2 = processor.apply_chat_template(messages2, add_generation_prompt=True)
inputs2 = processor(text=text2, images=[crop_p053], return_tensors="pt")

t1 = time.time()
with torch.no_grad():
    out2 = model.generate(**inputs2, max_new_tokens=64)
print(f"\np053 Crop QA result in {time.time() - t1:.2f}s:")
print(processor.batch_decode(out2, skip_special_tokens=True)[0])
