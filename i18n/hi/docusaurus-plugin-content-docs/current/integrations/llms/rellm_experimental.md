---
translated: true
---

# RELLM

[RELLM](https://github.com/r2d4/rellm) एक ऐसी लाइब्रेरी है जो स्ट्रक्चर्ड डिकोडिंग के लिए स्थानीय Hugging Face पाइपलाइन मॉडल को राप करती है।

यह टोकन को एक-एक करके जनरेट करके काम करता है। प्रत्येक चरण में, यह उन टोकन को मास्क करता है जो प्रदान की गई आंशिक नियमित अभिव्यक्ति के अनुरूप नहीं हैं।

**चेतावनी - यह मॉड्यूल अभी भी प्रयोगात्मक है**

```python
%pip install --upgrade --quiet  rellm > /dev/null
```

### Hugging Face आधारभूत

पहले, हम संरचित डिकोडिंग के बिना मॉडल के आउटपुट की गुणात्मक आधार स्थापित करते हैं।

```python
import logging

logging.basicConfig(level=logging.ERROR)
prompt = """Human: "What's the capital of the United States?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of the United States is Washington D.C."
}
Human: "What's the capital of Pennsylvania?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "The capital of Pennsylvania is Harrisburg."
}
Human: "What 2 + 5?"
AI Assistant:{
  "action": "Final Answer",
  "action_input": "2 + 5 = 7."
}
Human: 'What's the capital of Maryland?'
AI Assistant:"""
```

```python
from langchain_community.llms import HuggingFacePipeline
from transformers import pipeline

hf_model = pipeline(
    "text-generation", model="cerebras/Cerebras-GPT-590M", max_new_tokens=200
)

original_model = HuggingFacePipeline(pipeline=hf_model)

generated = original_model.generate([prompt], stop=["Human:"])
print(generated)
```

```output
Setting `pad_token_id` to `eos_token_id`:50256 for open-end generation.

generations=[[Generation(text=' "What\'s the capital of Maryland?"\n', generation_info=None)]] llm_output=None
```

***यह इतना प्रभावशाली नहीं है, है ना? इसने सवाल का जवाब नहीं दिया और JSON प्रारूप का भी पालन नहीं किया! चलो, संरचित डिकोडर के साथ प्रयास करते हैं।***

## RELLM LLM रैपर

चलो, अब JSON संरचित प्रारूप से मेल खाने वाली रेगेक्स प्रदान करके यह फिर से करते हैं।

```python
import regex  # Note this is the regex library NOT python's re stdlib module

# We'll choose a regex that matches to a structured json string that looks like:
# {
#  "action": "Final Answer",
# "action_input": string or dict
# }
pattern = regex.compile(
    r'\{\s*"action":\s*"Final Answer",\s*"action_input":\s*(\{.*\}|"[^"]*")\s*\}\nHuman:'
)
```

```python
from langchain_experimental.llms import RELLM

model = RELLM(pipeline=hf_model, regex=pattern, max_new_tokens=200)

generated = model.predict(prompt, stop=["Human:"])
print(generated)
```

```output
{"action": "Final Answer",
  "action_input": "The capital of Maryland is Baltimore."
}
```

**वाह! पार्सिंग त्रुटियों से मुक्त।**
