---
translated: true
---

# बीम

बीम एपीआई रैपर को कॉल करता है ताकि एक क्लाउड तैनाती में gpt2 एलएलएम के एक उदाहरण को तैनात और उसके बाद कॉल किया जा सके। बीम लाइब्रेरी के इंस्टॉलेशन और बीम क्लाइंट आईडी और क्लाइंट सीक्रेट के पंजीकरण की आवश्यकता होती है। रैपर को कॉल करके एक मॉडल का उदाहरण बनाया और चलाया जाता है, जिसका लौटाया गया पाठ प्रॉम्प्ट से संबंधित होता है। इसके बाद बीम एपीआई को सीधे कॉल करके अतिरिक्त कॉल किए जा सकते हैं।

[एक खाता बनाएं](https://www.beam.cloud/), यदि आपके पास पहले से नहीं है। अपने एपीआई कुंजी को [डैशबोर्ड](https://www.beam.cloud/dashboard/settings/api-keys) से प्राप्त करें।

बीम CLI इंस्टॉल करें

```python
!curl https://raw.githubusercontent.com/slai-labs/get-beam/main/get-beam.sh -sSfL | sh
```

एपीआई कुंजी पंजीकृत करें और अपने बीम क्लाइंट आईडी और सीक्रेट पर्यावरण चर सेट करें:

```python
import os

beam_client_id = "<Your beam client id>"
beam_client_secret = "<Your beam client secret>"

# Set the environment variables
os.environ["BEAM_CLIENT_ID"] = beam_client_id
os.environ["BEAM_CLIENT_SECRET"] = beam_client_secret

# Run the beam configure command
!beam configure --clientId={beam_client_id} --clientSecret={beam_client_secret}
```

बीम एसडीके इंस्टॉल करें:

```python
%pip install --upgrade --quiet  beam-sdk
```

**बीम को सीधे langchain से तैनात और कॉल करें!**

ध्यान रखें कि प्रतिक्रिया देने में कुछ मिनट का समय लग सकता है, लेकिन बाद के कॉल तेज होंगे!

```python
from langchain_community.llms.beam import Beam

llm = Beam(
    model_name="gpt2",
    name="langchain-gpt2-test",
    cpu=8,
    memory="32Gi",
    gpu="A10G",
    python_version="python3.8",
    python_packages=[
        "diffusers[torch]>=0.10",
        "transformers",
        "torch",
        "pillow",
        "accelerate",
        "safetensors",
        "xformers",
    ],
    max_length="50",
    verbose=False,
)

llm._deploy()

response = llm._call("Running machine learning on a remote GPU")

print(response)
```
