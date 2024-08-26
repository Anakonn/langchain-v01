---
translated: true
---

# RELLM

[RELLM](https://github.com/r2d4/rellm) est une bibliothèque qui enveloppe les modèles de pipeline locaux Hugging Face pour le décodage structuré.

Elle fonctionne en générant des jetons un par un. À chaque étape, elle masque les jetons qui ne se conforment pas à l'expression régulière partielle fournie.

**Attention - ce module est encore expérimental**

```python
%pip install --upgrade --quiet  rellm > /dev/null
```

### Référence Hugging Face

Tout d'abord, établissons une référence qualitative en vérifiant la sortie du modèle sans décodage structuré.

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

***Ce n'est pas si impressionnant, n'est-ce pas ? Il n'a pas répondu à la question et il n'a pas du tout suivi le format JSON ! Essayons avec le décodeur structuré.***

## Wrapper RELLM LLM

Essayons à nouveau, en fournissant maintenant une expression régulière pour correspondre au format structuré JSON.

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

**Voilà ! Exempt d'erreurs d'analyse.**
