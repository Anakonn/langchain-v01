---
translated: true
---

# Runhouse

El [Runhouse](https://github.com/run-house/runhouse) permite el cómputo y los datos remotos a través de entornos y usuarios. Consulta la [documentación de Runhouse](https://runhouse-docs.readthedocs-hosted.com/en/latest/).

Este ejemplo explica cómo usar LangChain y [Runhouse](https://github.com/run-house/runhouse) para interactuar con modelos alojados en tu propia GPU o en GPUs bajo demanda en AWS, GCP, AWS o Lambda.

**Nota**: El código usa el nombre `SelfHosted` en lugar de `Runhouse`.

```python
%pip install --upgrade --quiet  runhouse
```

```python
import runhouse as rh
from langchain.chains import LLMChain
from langchain_community.llms import SelfHostedHuggingFaceLLM, SelfHostedPipeline
from langchain_core.prompts import PromptTemplate
```

```output
INFO | 2023-04-17 16:47:36,173 | No auth token provided, so not using RNS API to save and load configs
```

```python
# For an on-demand A100 with GCP, Azure, or Lambda
gpu = rh.cluster(name="rh-a10x", instance_type="A100:1", use_spot=False)

# For an on-demand A10G with AWS (no single A100s on AWS)
# gpu = rh.cluster(name='rh-a10x', instance_type='g5.2xlarge', provider='aws')

# For an existing cluster
# gpu = rh.cluster(ips=['<ip of the cluster>'],
#                  ssh_creds={'ssh_user': '...', 'ssh_private_key':'<path_to_key>'},
#                  name='rh-a10x')
```

```python
template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

```python
llm = SelfHostedHuggingFaceLLM(
    model_id="gpt2", hardware=gpu, model_reqs=["pip:./", "transformers", "torch"]
)
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"

llm_chain.run(question)
```

```output
INFO | 2023-02-17 05:42:23,537 | Running _generate_text via gRPC
INFO | 2023-02-17 05:42:24,016 | Time to send message: 0.48 seconds
```

```output
"\n\nLet's say we're talking sports teams who won the Super Bowl in the year Justin Beiber"
```

También puedes cargar más modelos personalizados a través de la interfaz SelfHostedHuggingFaceLLM:

```python
llm = SelfHostedHuggingFaceLLM(
    model_id="google/flan-t5-small",
    task="text2text-generation",
    hardware=gpu,
)
```

```python
llm("What is the capital of Germany?")
```

```output
INFO | 2023-02-17 05:54:21,681 | Running _generate_text via gRPC
INFO | 2023-02-17 05:54:21,937 | Time to send message: 0.25 seconds
```

```output
'berlin'
```

Usando una función de carga personalizada, podemos cargar una canalización personalizada directamente en el hardware remoto:

```python
def load_pipeline():
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        pipeline,
    )

    model_id = "gpt2"
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(model_id)
    pipe = pipeline(
        "text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
    )
    return pipe


def inference_fn(pipeline, prompt, stop=None):
    return pipeline(prompt)[0]["generated_text"][len(prompt) :]
```

```python
llm = SelfHostedHuggingFaceLLM(
    model_load_fn=load_pipeline, hardware=gpu, inference_fn=inference_fn
)
```

```python
llm("Who is the current US president?")
```

```output
INFO | 2023-02-17 05:42:59,219 | Running _generate_text via gRPC
INFO | 2023-02-17 05:42:59,522 | Time to send message: 0.3 seconds
```

```output
'john w. bush'
```

Puedes enviar tu canalización directamente a través del cable a tu modelo, pero esto solo funcionará para modelos pequeños (<2 Gb) y será bastante lento:

```python
pipeline = load_pipeline()
llm = SelfHostedPipeline.from_pipeline(
    pipeline=pipeline, hardware=gpu, model_reqs=["pip:./", "transformers", "torch"]
)
```

En su lugar, también podemos enviarla al sistema de archivos del hardware, lo que será mucho más rápido.

```python
import pickle

rh.blob(pickle.dumps(pipeline), path="models/pipeline.pkl").save().to(
    gpu, path="models"
)

llm = SelfHostedPipeline.from_pipeline(pipeline="models/pipeline.pkl", hardware=gpu)
```
