---
translated: true
---

# vLLM

[vLLM](https://vllm.readthedocs.io/en/latest/index.html) es una biblioteca rápida y fácil de usar para la inferencia y el servicio de LLM, que ofrece:

* Rendimiento de servicio de vanguardia
* Gestión eficiente de la memoria de claves y valores de atención con PagedAttention
* Procesamiento por lotes continuo de las solicitudes entrantes
* Kernels CUDA optimizados

Este cuaderno explica cómo usar un LLM con langchain y vLLM.

Para usar, debe tener instalado el paquete de Python `vllm`.

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

## Integrar el modelo en una LLMChain

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

## Inferencia distribuida

vLLM admite la inferencia y el servicio en paralelo de tensores distribuidos.

Para ejecutar la inferencia de varios GPU con la clase LLM, establezca el argumento `tensor_parallel_size` en el número de GPU que desea usar. Por ejemplo, para ejecutar la inferencia en 4 GPU

```python
from langchain_community.llms import VLLM

llm = VLLM(
    model="mosaicml/mpt-30b",
    tensor_parallel_size=4,
    trust_remote_code=True,  # mandatory for hf models
)

llm.invoke("What is the future of AI?")
```

## Cuantificación

vLLM admite la cuantificación `awq`. Para habilitarla, pase `quantization` a `vllm_kwargs`.

```python
llm_q = VLLM(
    model="TheBloke/Llama-2-7b-Chat-AWQ",
    trust_remote_code=True,
    max_new_tokens=512,
    vllm_kwargs={"quantization": "awq"},
)
```

## Servidor compatible con OpenAI

vLLM se puede implementar como un servidor que imita el protocolo de la API de OpenAI. Esto permite que vLLM se use como un reemplazo instantáneo para las aplicaciones que utilizan la API de OpenAI.

Este servidor se puede consultar en el mismo formato que la API de OpenAI.

### Finalización compatible con OpenAI

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
