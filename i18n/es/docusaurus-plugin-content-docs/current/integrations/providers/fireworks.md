---
translated: true
---

# Fuegos artificiales

Esta página cubre cómo usar los modelos [Fireworks](https://fireworks.ai/) dentro de
Langchain.

## Instalación y configuración

- Instala el paquete de integración de Fireworks.

  ```
  pip install langchain-fireworks
  ```

- Obtén una clave API de Fireworks registrándote en [fireworks.ai](https://fireworks.ai).
- Autentícate estableciendo la variable de entorno FIREWORKS_API_KEY.

## Autenticación

Hay dos formas de autenticarse usando tu clave API de Fireworks:

1.  Estableciendo la variable de entorno `FIREWORKS_API_KEY`.

    ```python
    os.environ["FIREWORKS_API_KEY"] = "<KEY>"
    ```

2.  Estableciendo el campo `api_key` en el módulo LLM de Fireworks.

    ```python
    llm = Fireworks(api_key="<KEY>")
    ```

## Usando el módulo LLM de Fireworks

Fireworks se integra con Langchain a través del módulo LLM. En este ejemplo, trabajaremos con el modelo mixtral-8x7b-instruct.

```python
<!--IMPORTS:[{"imported": "Fireworks", "source": "langchain_fireworks", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_fireworks.llms.Fireworks.html", "title": "Fireworks"}]-->
from langchain_fireworks import Fireworks

llm = Fireworks(
    api_key="<KEY>",
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    max_tokens=256)
llm("Name 3 sports.")
```

Para una guía más detallada, consulta [aquí](/docs/integrations/llms/Fireworks).
