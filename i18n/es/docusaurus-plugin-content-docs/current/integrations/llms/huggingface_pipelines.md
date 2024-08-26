---
translated: true
---

# Tuberías locales de Hugging Face

Los modelos de Hugging Face se pueden ejecutar localmente a través de la clase `HuggingFacePipeline`.

El [Hugging Face Model Hub](https://huggingface.co/models) alberga más de 120k modelos, 20k conjuntos de datos y 50k aplicaciones de demostración (Spaces), todos de código abierto y de acceso público, en una plataforma en línea donde las personas pueden colaborar y construir ML juntas.

Estos se pueden llamar desde LangChain ya sea a través de este envoltorio de tubería local o llamando a sus puntos finales de inferencia alojados a través de la clase HuggingFaceHub.

Para usar, debe tener el paquete de python ``transformers`` [instalado](https://pypi.org/project/transformers/), así como [pytorch](https://pytorch.org/get-started/locally/). También puede instalar `xformer` para una implementación de atención más eficiente en términos de memoria.

```python
%pip install --upgrade --quiet  transformers --quiet
```

### Carga de modelos

Los modelos se pueden cargar especificando los parámetros del modelo usando el método `from_model_id`.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

hf = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    pipeline_kwargs={"max_new_tokens": 10},
)
```

También se pueden cargar pasando directamente una canalización `transformers` existente

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

model_id = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10)
hf = HuggingFacePipeline(pipeline=pipe)
```

### Crear cadena

Con el modelo cargado en la memoria, puede componerlo con un mensaje para formar una cadena.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | hf

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inferencia de GPU

Cuando se ejecuta en una máquina con GPU, puede especificar el parámetro `device=n` para colocar el modelo en el dispositivo especificado.
Por defecto es `-1` para inferencia de CPU.

Si tiene múltiples GPU y/o el modelo es demasiado grande para una sola GPU, puede especificar `device_map="auto"`, que requiere y usa la biblioteca [Accelerate](https://huggingface.co/docs/accelerate/index) para determinar automáticamente cómo cargar los pesos del modelo.

*Nota*: tanto `device` como `device_map` no deben especificarse juntos y pueden provocar un comportamiento inesperado.

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    device=0,  # replace with device_map="auto" to use the accelerate library.
    pipeline_kwargs={"max_new_tokens": 10},
)

gpu_chain = prompt | gpu_llm

question = "What is electroencephalography?"

print(gpu_chain.invoke({"question": question}))
```

### Inferencia por lotes en GPU

Si se ejecuta en un dispositivo con GPU, también puede ejecutar la inferencia en la GPU en modo por lotes.

```python
gpu_llm = HuggingFacePipeline.from_model_id(
    model_id="bigscience/bloom-1b7",
    task="text-generation",
    device=0,  # -1 for CPU
    batch_size=2,  # adjust as needed based on GPU map and model size.
    model_kwargs={"temperature": 0, "max_length": 64},
)

gpu_chain = prompt | gpu_llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = gpu_chain.batch(questions)
for answer in answers:
    print(answer)
```

### Inferencia con el backend OpenVINO

Para implementar un modelo con OpenVINO, puede especificar el parámetro `backend="openvino"` para activar OpenVINO como marco de inferencia de backend.

Si tiene una GPU Intel, puede especificar `model_kwargs={"device": "GPU"}` para ejecutar la inferencia en ella.

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

```python
ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

### Inferencia con modelo OpenVINO local

Es posible [exportar su modelo](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) al formato IR de OpenVINO con la CLI y cargar el modelo desde una carpeta local.

```python
!optimum-cli export openvino --model gpt2 ov_model_dir
```

Se recomienda aplicar cuantización de pesos de 8 o 4 bits para reducir la latencia de inferencia y el tamaño del modelo usando `--weight-format`:

```python
!optimum-cli export openvino --model gpt2  --weight-format int8 ov_model_dir # for 8-bit quantization

!optimum-cli export openvino --model gpt2  --weight-format int4 ov_model_dir # for 4-bit quantization
```

```python
ov_llm = HuggingFacePipeline.from_model_id(
    model_id="ov_model_dir",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)

ov_chain = prompt | ov_llm

question = "What is electroencephalography?"

print(ov_chain.invoke({"question": question}))
```

Puede obtener una mejora adicional de la velocidad de inferencia con la cuantización dinámica de activaciones y la cuantización de la caché KV. Estas opciones se pueden habilitar con `ov_config` de la siguiente manera:

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

Para obtener más información, consulte la [guía de OpenVINO LLM](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html) y el [cuaderno de OpenVINO Local Pipelines](/docs/integrations/llms/openvino/).
