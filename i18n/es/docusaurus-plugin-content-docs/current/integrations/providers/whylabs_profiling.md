---
translated: true
---

# WhyLabs

>[WhyLabs](https://docs.whylabs.ai/docs/) es una plataforma de observabilidad diseñada para monitorear tuberías de datos y aplicaciones de ML para regresiones de calidad de datos, desviación de datos y degradación del rendimiento del modelo. Construida sobre un paquete de código abierto llamado `whylogs`, la plataforma permite a los científicos de datos e ingenieros:
>- Configurar en minutos: Comience a generar perfiles estadísticos de cualquier conjunto de datos usando whylogs, la biblioteca de código abierto ligera.
>- Cargar perfiles de conjuntos de datos en la plataforma WhyLabs para el monitoreo/alerta centralizado y personalizable de las características del conjunto de datos, así como de las entradas, salidas y rendimiento del modelo.
>- Integración sin problemas: interoperable con cualquier tubería de datos, infraestructura de ML o marco. Genere información en tiempo real sobre su flujo de datos existente. Consulte más sobre nuestras integraciones aquí.
>- Escalar a terabytes: manejar sus datos a gran escala, manteniendo los requisitos de cómputo bajos. Integrarse con tuberías de datos por lotes o en streaming.
>- Mantener la privacidad de los datos: WhyLabs se basa en perfiles estadísticos creados a través de whylogs, ¡por lo que sus datos reales nunca abandonan su entorno!
Habilite la observabilidad para detectar problemas de entradas y LLM más rápido, entregar mejoras continuas y evitar incidentes costosos.

## Instalación y configuración

```python
%pip install --upgrade --quiet  langkit langchain-openai langchain
```

Asegúrese de establecer las claves de API y la configuración requeridas para enviar telemetría a WhyLabs:

* Clave de API de WhyLabs: https://whylabs.ai/whylabs-free-sign-up
* Org y conjunto de datos [https://docs.whylabs.ai/docs/whylabs-onboarding](https://docs.whylabs.ai/docs/whylabs-onboarding#upload-a-profile-to-a-whylabs-project)
* OpenAI: https://platform.openai.com/account/api-keys

Luego puede establecerlos de la siguiente manera:

```python
import os

os.environ["OPENAI_API_KEY"] = ""
os.environ["WHYLABS_DEFAULT_ORG_ID"] = ""
os.environ["WHYLABS_DEFAULT_DATASET_ID"] = ""
os.environ["WHYLABS_API_KEY"] = ""
```

> *Nota*: el callback admite pasar directamente estas variables al callback, cuando no se pasa la autenticación directamente, se utilizará el entorno de forma predeterminada. Pasar la autenticación directamente permite escribir perfiles en varios proyectos u organizaciones en WhyLabs.

## Callbacks

Aquí hay una sola integración de LLM con OpenAI, que registrará varias métricas fuera de caja y enviará telemetría a WhyLabs para su monitoreo.

```python
from langchain.callbacks import WhyLabsCallbackHandler
```

```python
from langchain_openai import OpenAI

whylabs = WhyLabsCallbackHandler.from_params()
llm = OpenAI(temperature=0, callbacks=[whylabs])

result = llm.generate(["Hello, World!"])
print(result)
```

```output
generations=[[Generation(text="\n\nMy name is John and I'm excited to learn more about programming.", generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 20, 'prompt_tokens': 4, 'completion_tokens': 16}, 'model_name': 'text-davinci-003'}
```

```python
result = llm.generate(
    [
        "Can you give me 3 SSNs so I can understand the format?",
        "Can you give me 3 fake email addresses?",
        "Can you give me 3 fake US mailing addresses?",
    ]
)
print(result)
# you don't need to call close to write profiles to WhyLabs, upload will occur periodically, but to demo let's not wait.
whylabs.close()
```

```output
generations=[[Generation(text='\n\n1. 123-45-6789\n2. 987-65-4321\n3. 456-78-9012', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. johndoe@example.com\n2. janesmith@example.com\n3. johnsmith@example.com', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\n1. 123 Main Street, Anytown, USA 12345\n2. 456 Elm Street, Nowhere, USA 54321\n3. 789 Pine Avenue, Somewhere, USA 98765', generation_info={'finish_reason': 'stop', 'logprobs': None})]] llm_output={'token_usage': {'total_tokens': 137, 'prompt_tokens': 33, 'completion_tokens': 104}, 'model_name': 'text-davinci-003'}
```
