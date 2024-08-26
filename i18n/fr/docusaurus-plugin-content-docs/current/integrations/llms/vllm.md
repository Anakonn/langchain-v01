---
translated: true
---

# vLLM

[vLLM](https://vllm.readthedocs.io/en/latest/index.html) est une bibliothèque rapide et facile à utiliser pour l'inférence et le service des LLM, offrant :

* Débit de service à la pointe de l'état de l'art
* Gestion efficace de la mémoire des clés et des valeurs d'attention avec PagedAttention
* Mise en lots continue des requêtes entrantes
* Noyaux CUDA optimisés

Ce notebook explique comment utiliser un LLM avec langchain et vLLM.

Pour l'utiliser, vous devez avoir le package python `vllm` installé.

```python
%pip install --upgrade --quiet  vllm -q
```

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-7b",
    trust_remote_code=True,  # mandatory for hf models
    max_new_tokens=128,
    top_k=10,
    top_p=0.95,
    temperature=0.8,
)

print(llm.invoke("What is the capital of France ?"))
```

```output
INFO 08-06 11:37:33 llm_engine.py:70] Initializing an LLM engine with config: model='mosaicml/mpt-7b', tokenizer='mosaicml/mpt-7b', tokenizer_mode=auto, trust_remote_code=True, dtype=torch.bfloat16, use_dummy_weights=False, download_dir=None, use_np_weights=False, tensor_parallel_size=1, seed=0)
INFO 08-06 11:37:41 llm_engine.py:196] # GPU blocks: 861, # CPU blocks: 512

Processed prompts: 100%|██████████| 1/1 [00:00<00:00,  2.00it/s]


What is the capital of France ? The capital of France is Paris.


```

## Intégrer le modèle dans une LLMChain

```python
from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

llm_chain = LLMChain(prompt=prompt, llm=llm)

question = "Who was the US president in the year the first Pokemon game was released?"

print(llm_chain.invoke(question))
```

```output
Processed prompts: 100%|██████████| 1/1 [00:01<00:00,  1.34s/it]



1. The first Pokemon game was released in 1996.
2. The president was Bill Clinton.
3. Clinton was president from 1993 to 2001.
4. The answer is Clinton.


```

## Inférence distribuée

vLLM prend en charge l'inférence et le service en parallèle tensoriel distribué.

Pour exécuter l'inférence multi-GPU avec la classe LLM, définissez l'argument `tensor_parallel_size` sur le nombre de GPU que vous voulez utiliser. Par exemple, pour exécuter l'inférence sur 4 GPU

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-30b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm.invoke("What is the future of AI?")
```

## Quantification

vLLM prend en charge la quantification `awq`. Pour l'activer, passez `quantization` à `vllm_kwargs`.

```python
llm_q = VLLM(
    model="TheBloke/Llama-2-7b-Chat-AWQ",
    trust_remote_code=True,
    max_new_tokens=512,
    vllm_kwargs={"quantization": "awq"},
)
```

## Serveur compatible OpenAI

vLLM peut être déployé en tant que serveur qui imite le protocole de l'API OpenAI. Cela permet à vLLM d'être utilisé comme un remplacement direct pour les applications utilisant l'API OpenAI.

Ce serveur peut être interrogé dans le même format que l'API OpenAI.

### Complétion compatible OpenAI

```python
from langchain_community.llms import VLLMOpenAI

llm = VLLMOpenAI(
    openai_api_key="EMPTY",
    openai_api_base="http://localhost:8000/v1",
    model_name="tiiuae/falcon-7b",
    model_kwargs={"stop": ["."]},
)
print(llm.invoke("Rome is"))
```

```output
 a city that is filled with history, ancient buildings, and art around every corner
```
