---
translated: true
---

# Cuantificación de peso único de Intel

## Cuantificación de peso único para modelos de Huggingface con la extensión Intel para tuberías de transformadores

Los modelos de Hugging Face se pueden ejecutar localmente con cuantificación de peso único a través de la clase `WeightOnlyQuantPipeline`.

El [Hugging Face Model Hub](https://huggingface.co/models) alberga más de 120k modelos, 20k conjuntos de datos y 50k aplicaciones de demostración (Spaces), todos de código abierto y de acceso público, en una plataforma en línea donde las personas pueden colaborar y construir ML juntas.

Estos se pueden llamar desde LangChain a través de esta clase de envoltura de tubería local.

Para usar, debe tener el paquete de python `transformers` [instalado](https://pypi.org/project/transformers/), así como [pytorch](https://pytorch.org/get-started/locally/), [intel-extension-for-transformers](https://github.com/intel/intel-extension-for-transformers).

```python
%pip install transformers --quiet
%pip install intel-extension-for-transformers
```

### Carga de modelos

Los modelos se pueden cargar especificando los parámetros del modelo usando el método `from_model_id`. Los parámetros del modelo incluyen la clase `WeightOnlyQuantConfig` en intel_extension_for_transformers.

```python
from intel_extension_for_transformers.transformers import WeightOnlyQuantConfig
from langchain_community.llms.weight_only_quantization import WeightOnlyQuantPipeline

conf = WeightOnlyQuantConfig(weight_dtype="nf4")
hf = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)
```

También se pueden cargar pasando directamente una tubería `transformers` existente.

```python
from intel_extension_for_transformers.transformers import AutoModelForSeq2SeqLM
from langchain_community.llms.huggingface_pipeline import HuggingFacePipeline
from transformers import AutoTokenizer, pipeline

model_id = "google/flan-t5-large"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)
pipe = pipeline(
    "text2text-generation", model=model, tokenizer=tokenizer, max_new_tokens=10
)
hf = WeightOnlyQuantPipeline(pipeline=pipe)
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

### Inferencia de CPU

Ahora intel-extension-for-transformers solo admite inferencia en dispositivos CPU. Admitirá la GPU de Intel pronto. Cuando se ejecuta en una máquina con CPU, puede especificar el parámetro `device="cpu"` o `device=-1` para colocar el modelo en el dispositivo CPU.
Por defecto es `-1` para inferencia de CPU.

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

template = """Question: {question}

Answer: Let's think step by step."""
prompt = PromptTemplate.from_template(template)

chain = prompt | llm

question = "What is electroencephalography?"

print(chain.invoke({"question": question}))
```

### Inferencia por lotes de CPU

También puede ejecutar la inferencia en la CPU en modo por lotes.

```python
conf = WeightOnlyQuantConfig(weight_dtype="nf4")
llm = WeightOnlyQuantPipeline.from_model_id(
    model_id="google/flan-t5-large",
    task="text2text-generation",
    quantization_config=conf,
    pipeline_kwargs={"max_new_tokens": 10},
)

chain = prompt | llm.bind(stop=["\n\n"])

questions = []
for i in range(4):
    questions.append({"question": f"What is the number {i} in french?"})

answers = chain.batch(questions)
for answer in answers:
    print(answer)
```

### Tipos de datos compatibles con Intel-extension-for-transformers

Admitimos cuantificar los pesos en los siguientes tipos de datos para almacenar (weight_dtype en WeightOnlyQuantConfig):

* **int8**: Usa el tipo de datos de 8 bits.
* **int4_fullrange**: Usa el valor -8 del rango int4 en comparación con el rango int4 normal [-7,7].
* **int4_clip**: Recorta y retiene los valores dentro del rango int4, estableciendo otros en cero.
* **nf4**: Usa el tipo de datos de punto flotante normalizado de 4 bits.
* **fp4_e2m1**: Usa el tipo de datos de punto flotante regular de 4 bits. "e2" significa que se usan 2 bits para el exponente y "m1" significa que se usa 1 bit para la mantisa.

Si bien estas técnicas almacenan los pesos en 4 u 8 bits, el cálculo aún se realiza en float32, bfloat16 o int8 (compute_dtype en WeightOnlyQuantConfig):
* **fp32**: Usa el tipo de datos float32 para calcular.
* **bf16**: Usa el tipo de datos bfloat16 para calcular.
* **int8**: Usa el tipo de datos de 8 bits para calcular.

### Matriz de algoritmos compatibles

Algoritmos de cuantificación compatibles en intel-extension-for-transformers (algorithm en WeightOnlyQuantConfig):

| Algoritmos |   PyTorch  |    LLM Runtime    |
|:--------------:|:----------:|:----------:|
|       RTN      |  &#10004;  |  &#10004;  |
|       AWQ      |  &#10004;  | stay tuned |
|      TEQ      | &#10004; | stay tuned |
> **RTN:** Un método de cuantificación que podemos pensar de manera muy intuitiva. No requiere conjuntos de datos adicionales y es un método de cuantificación muy rápido. En general, RTN convertirá el peso en un tipo de datos entero uniformemente distribuido, pero algunos algoritmos, como Qlora, proponen un tipo de datos NF4 no uniforme y demuestran su optimalidad teórica.

> **AWQ:** Se demostró que proteger solo el 1% de los pesos relevantes puede reducir en gran medida el error de cuantificación. Los canales de pesos relevantes se seleccionan observando la distribución de activación y peso por canal. Los pesos relevantes también se cuantifican después de multiplicar un factor de escala grande antes de la cuantificación para preservar.

> **TEQ:** Una transformación equivalente entrenable que preserva la precisión FP32 en la cuantificación de peso único. Se inspira en AWQ mientras proporciona una nueva solución para buscar el factor de escala óptimo por canal entre activaciones y pesos.
