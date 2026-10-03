import os
os.environ["HF_HOME"] = "/data/.cache/huggingface"
import time
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForImageTextToText

MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct"
print(f"=== BENCHMARKING TARGETED SINGLE-FACT QA ON CLASS B SCANS ===")

processor = AutoProcessor.from_pretrained(MODEL_ID)
model = AutoModelForImageTextToText.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    _attn_implementation="eager"
)

test_cases = [
    {
        "page": "sankalia_p052-052.png",
        "question": "What year did Corvinus decide to excavate? Answer with just the four-digit year.",
        "gt": "1966"
    },
    {
        "page": "sankalia_p053-053.png",
        "question": "What is the thickness in cm of the rubble horizon overlying the trap basalt? Answer with the exact number or range in cm.",
        "gt": "20-40 cm"
    },
    {
        "page": "sankalia_p053-053.png",
        "question": "How many Early Stone Age tools were recovered from the rubble layer? Answer with just the count number.",
        "gt": "694"
    },
    {
        "page": "sankalia_p054-054.png",
        "question": "What is the bedrock depth in meters below the present river bed? Answer with the number in meters.",
        "gt": "7 m."
    },
    {
        "page": "sankalia_p055-055.png",
        "question": "How many large cores were found in Trench B? Answer with the number of pieces.",
        "gt": "6 pieces"
    },
    {
        "page": "sankalia_p056-056.png",
        "question": "What is the total assemblage count of the Acheulian industry? Answer with just the count number.",
        "gt": "2050"
    }
]

results = []

for idx, tc in enumerate(test_cases):
    img_path = os.path.join("images", tc["page"])
    img = Image.open(img_path)
    
    # Scale max dimension to 1024
    max_dim = 1024
    if max(img.size) > max_dim:
        scale = max_dim / max(img.size)
        img = img.resize((int(img.size[0] * scale), int(img.size[1] * scale)))
        
    messages = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": tc["question"]}]}]
    prompt_text = processor.apply_chat_template(messages, add_generation_prompt=True)
    inputs = processor(text=prompt_text, images=[img], return_tensors="pt")
    
    t0 = time.time()
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=32)
    duration = time.time() - t0
    
    raw = processor.batch_decode(out, skip_special_tokens=True)[0]
    # Extract assistant reply
    reply = raw.split("Assistant:")[-1].strip() if "Assistant:" in raw else raw.strip()
    
    print(f"[{idx+1}/{len(test_cases)}] {tc['page']} ({duration:.2f}s)")
    print(f"   Q: {tc['question']}")
    print(f"   GT: {tc['gt']}")
    print(f"   VLM: {reply}")
    
    match = tc["gt"].lower() in reply.lower() or reply.lower() in tc["gt"].lower()
    results.append({
        "page": tc["page"],
        "gt": tc["gt"],
        "reply": reply,
        "duration": duration,
        "match": match
    })

print("\n=== SUMMARY ===")
correct = sum(1 for r in results if r["match"])
total = len(results)
print(f"Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
