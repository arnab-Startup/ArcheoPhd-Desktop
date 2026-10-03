import sys
import time
from PIL import Image

print("Testing VLM import...")
import torch
import transformers
print(f"PyTorch: {torch.__version__}, Transformers: {transformers.__version__}")

# Check available lightweight models
# 1. SmolVLM-256M-Instruct is ~500MB and specifically designed for document / VQA tasks
model_id = "HuggingFaceTB/SmolVLM-256M-Instruct"
print(f"Loading {model_id}...")
start_time = time.time()

try:
    from transformers import AutoProcessor, AutoModelForVision2Seq
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForVision2Seq.from_pretrained(
        model_id,
        torch_dtype=torch.float32,
        _attn_implementation="eager"
    )
    print(f"Loaded {model_id} in {time.time() - start_time:.2f}s")
    print("VLM model successfully initialized on CPU.")
except Exception as e:
    print(f"Error loading {model_id}: {e}")
    sys.exit(1)
