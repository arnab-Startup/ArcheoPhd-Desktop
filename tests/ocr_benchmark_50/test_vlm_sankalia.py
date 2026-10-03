import os
os.environ["HF_HOME"] = "/data/.cache/huggingface"
import sys
import time
import json
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText

MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct"
print(f"=== INITIALIZING VLM: {MODEL_ID} ON LOCAL CPU ===")

start_load = time.time()
processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    _attn_implementation="eager"
)
print(f"Model loaded in {time.time() - start_load:.2f}s")

# Test on Sankalia p052 and p053
test_pages = ["sankalia_p052-052.png", "sankalia_p053-053.png"]

for img_name in test_pages:
    img_path = os.path.join("images", img_name)
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        continue

    print(f"\n--- Processing {img_name} ---")
    image = Image.open(img_path)
    
    # Resize slightly if too large to ensure fast CPU inference
    max_dim = 1024
    if max(image.size) > max_dim:
        scale = max_dim / max(image.size)
        image = image.resize((int(image.size[0] * scale), int(image.size[1] * scale)))
    
    prompt = (
        "Transcribe all numbers, calendar dates, stratum measurements, and artifact counts "
        "printed on this archaeological excavation report page. Return exact verbatim values."
    )
    
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image"},
                {"type": "text", "text": prompt}
            ]
        }
    ]
    
    prompt_text = processor.apply_chat_template(messages, add_generation_prompt=True)
    inputs = processor(text=prompt_text, images=[image], return_tensors="pt")
    
    start_infer = time.time()
    with torch.no_grad():
        generated_ids = model.generate(**inputs, max_new_tokens=256)
    
    duration = time.time() - start_infer
    output_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    
    print(f"Inference Time: {duration:.2f}s")
    print("VLM Output:")
    print(output_text)
