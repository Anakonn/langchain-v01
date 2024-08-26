---
translated: true
---

# Baseten

>[Baseten](https://baseten.co) es un proveedor de toda la infraestructura que necesitas para desplegar y servir
> modelos de ML de manera eficiente en rendimiento, escalabilidad y costo.

>Como una plataforma de inferencia de modelos, `Baseten` es un `Proveedor` en el ecosistema de LangChain.
La integración de `Baseten` actualmente implementa un solo `Componente`, LLMs, ¡pero se planean más!

>`Baseten` te permite ejecutar tanto modelos de código abierto como Llama 2 o Mistral y ejecutar modelos propietarios o
ajustados en GPUs dedicadas. Si estás acostumbrado a un proveedor como OpenAI, usar Baseten tiene algunas diferencias:

>* En lugar de pagar por token, pagas por minuto de GPU utilizada.
>* Cada modelo en Baseten utiliza [Truss](https://truss.baseten.co/welcome), nuestro marco de empaquetado de modelos de código abierto, para la máxima personalización.
>* Aunque tenemos algunos [modelos compatibles con OpenAI ChatCompletions](https://docs.baseten.co/api-reference/openai), puedes definir tu propia especificación de E/S con `Truss`.

>[Aprende más](https://docs.baseten.co/deploy/lifecycle) sobre IDs y despliegues de modelos.

>Aprende más sobre Baseten en [la documentación de Baseten](https://docs.baseten.co/).

## Instalación y Configuración

Necesitarás dos cosas para usar modelos Baseten con LangChain:

- Una [cuenta Baseten](https://baseten.co)
- Una [clave API](https://docs.baseten.co/observability/api-keys)

Exporta tu clave API a tu como una variable de entorno llamada `BASETEN_API_KEY`.

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

## LLMs

Consulta un [ejemplo de uso](/docs/integrations/llms/baseten).

```python
<!--IMPORTS:[{"imported": "Baseten", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.baseten.Baseten.html", "title": "Baseten"}]-->
from langchain_community.llms import Baseten
```
