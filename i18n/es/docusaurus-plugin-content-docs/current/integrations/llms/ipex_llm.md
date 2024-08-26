---
translated: true
---

# IPEX-LLM

> [IPEX-LLM](https://github.com/intel-analytics/ipex-llm/) es una biblioteca de PyTorch para ejecutar LLM en CPU y GPU de Intel (por ejemplo, PC local con iGPU, GPU discreta como Arc, Flex y Max) con muy baja latencia.

Este ejemplo explica cómo usar LangChain para interactuar con `ipex-llm` para la generación de texto.

## Configuración

```python
# Update Langchain

%pip install -qU langchain langchain-community
```

Instala IEPX-LLM para ejecutar LLMs localmente en la CPU de Intel.

```python
%pip install --pre --upgrade ipex-llm[all]
```

## Uso básico

```python
import warnings

from langchain.chains import LLMChain
from langchain_community.llms import IpexLLM
from langchain_core.prompts import PromptTemplate

warnings.filterwarnings("ignore", category=UserWarning, message=".*padding_mask.*")
```

Especifica la plantilla de solicitud para tu modelo. En este ejemplo, usamos el modelo [vicuna-1.5](https://huggingface.co/lmsys/vicuna-7b-v1.5). Si estás trabajando con un modelo diferente, elige una plantilla adecuada.

```python
template = "USER: {question}\nASSISTANT:"
prompt = PromptTemplate(template=template, input_variables=["question"])
```

Carga el modelo localmente usando IpexLLM con `IpexLLM.from_model_id`. Cargará el modelo directamente en su formato Huggingface y lo convertirá automáticamente a formato de bits bajos para la inferencia.

```python
llm = IpexLLM.from_model_id(
    model_id="lmsys/vicuna-7b-v1.5",
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

Úsalo en Chains:

```python
llm_chain = prompt | llm

question = "What is AI?"
output = llm_chain.invoke(question)
```

## Guardar/Cargar modelo de bits bajos

Alternativamente, puedes guardar el modelo de bits bajos en el disco y usar `from_model_id_low_bit` en lugar de `from_model_id` para volver a cargarlo para su uso posterior, incluso en diferentes máquinas. Es eficiente en cuanto al espacio, ya que el modelo de bits bajos requiere mucho menos espacio en disco que el modelo original. Y `from_model_id_low_bit` también es más eficiente en términos de velocidad y uso de memoria, ya que omite el paso de conversión del modelo.

Para guardar el modelo de bits bajos, usa `save_low_bit` como se indica a continuación.

```python
saved_lowbit_model_path = "./vicuna-7b-1.5-low-bit"  # path to save low-bit model
llm.model.save_low_bit(saved_lowbit_model_path)
del llm
```

Carga el modelo desde la ruta del modelo de bits bajos guardado como se indica a continuación.
> Tenga en cuenta que la ruta guardada para el modelo de bits bajos solo incluye el modelo en sí, pero no los tokenizadores. Si desea tener todo en un solo lugar, deberá descargar o copiar manualmente los archivos del tokenizador desde el directorio del modelo original a la ubicación donde se guarda el modelo de bits bajos.

```python
llm_lowbit = IpexLLM.from_model_id_low_bit(
    model_id=saved_lowbit_model_path,
    tokenizer_id="lmsys/vicuna-7b-v1.5",
    # tokenizer_name=saved_lowbit_model_path,  # copy the tokenizers to saved path if you want to use it this way
    model_kwargs={"temperature": 0, "max_length": 64, "trust_remote_code": True},
)
```

Usa el modelo cargado en Chains:

```python
llm_chain = prompt | llm_lowbit


question = "What is AI?"
output = llm_chain.invoke(question)
```
