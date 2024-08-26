---
translated: true
---

# OpenVINO

[OpenVINO™](https://github.com/openvinotoolkit/openvino) es un conjunto de herramientas de código abierto para optimizar y desplegar inferencia de IA. OpenVINO™ Runtime puede permitir ejecutar el mismo modelo optimizado a través de varios [dispositivos](https://github.com/openvinotoolkit/openvino?tab=readme-ov-file#supported-hardware-matrix) de hardware. Acelera el rendimiento de tu aprendizaje profundo a través de casos de uso como: lenguaje + LLM, visión por computadora, reconocimiento automático del habla y más.

Los modelos de OpenVINO se pueden ejecutar localmente a través de la [clase](https://python.langchain.com/docs/integrations/llms/huggingface_pipeline) `HuggingFacePipeline`. Para implementar un modelo con OpenVINO, puedes especificar el parámetro `backend="openvino"` para activar OpenVINO como marco de inferencia de backend.

Para usar, debes tener el paquete de Python [`optimum-intel`](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#installation) con el Acelerador OpenVINO instalado.

```python
%pip install --upgrade-strategy eager "optimum[openvino,nncf]" --quiet
```

### Carga de modelos

Los modelos se pueden cargar especificando los parámetros del modelo usando el método `from_model_id`.

Si tienes una GPU de Intel, puedes especificar `model_kwargs={"device": "GPU"}` para ejecutar la inferencia en ella.

```python
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline

ov_config = {"PERFORMANCE_HINT": "LATENCY", "NUM_STREAMS": "1", "CACHE_DIR": ""}

ov_llm = HuggingFacePipeline.from_model_id(
    model_id="gpt2",
    task="text-generation",
    backend="openvino",
    model_kwargs={"device": "CPU", "ov_config": ov_config},
    pipeline_kwargs={"max_new_tokens": 10},
)
```

También se pueden cargar pasando directamente una [canalización `optimum-intel`](https://huggingface.co/docs/optimum/main/en/intel/inference)

```python
from optimum.intel.openvino import OVModelForCausalLM
from transformers import AutoTokenizer, pipeline

model_id = "gpt2"
device = "CPU"
tokenizer = AutoTokenizer.from_pretrained(model_id)
ov_model = OVModelForCausalLM.from_pretrained(
    model_id, export=True, device=device, ov_config=ov_config
)
ov_pipe = pipeline(
    "text-generation", model=ov_model, tokenizer=tokenizer, max_new_tokens=10
)
ov_llm = HuggingFacePipeline(pipeline=ov_pipe)
```

### Crear cadena

Con el modelo cargado en la memoria, puedes componerlo con un mensaje para formar una cadena.

```python
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inferencia con modelo OpenVINO local

Es posible [exportar tu modelo](https://github.com/huggingface/optimum-intel?tab=readme-ov-file#export) al formato IR de OpenVINO con la CLI y cargar el modelo desde una carpeta local.

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

chain = prompt | ov_llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

Puedes obtener una mejora adicional en la velocidad de inferencia con la cuantización dinámica de activaciones y la cuantización de la caché KV. Estas opciones se pueden habilitar con `ov_config` de la siguiente manera:

```python
ov_config = {
    "KV_CACHE_PRECISION": "u8",
    "DYNAMIC_QUANTIZATION_GROUP_SIZE": "32",
    "PERFORMANCE_HINT": "LATENCY",
    "NUM_STREAMS": "1",
    "CACHE_DIR": "",
}
```

Para más información, consulta:

* [Guía de LLM de OpenVINO](https://docs.openvino.ai/2024/learn-openvino/llm_inference_guide.html).

* [Documentación de OpenVINO](https://docs.openvino.ai/2024/home.html).

* [Guía de inicio de OpenVINO](https://www.intel.com/content/www/us/en/content-details/819067/openvino-get-started-guide.html).

* [Cuaderno de RAG con LangChain](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/llm-rag-langchain).
