---
sidebar_label: Upstage
translated: true
---

# Comprobación de la solidez de Upstage

Este cuaderno abarca cómo empezar con los modelos de comprobación de solidez de Upstage.

## Instalación

Instalar el paquete `langchain-upstage`.

```bash
pip install -U langchain-upstage
```

## Configuración del entorno

Asegúrese de establecer las siguientes variables de entorno:

- `UPSTAGE_API_KEY`: Su clave de API de Upstage desde [documento de desarrolladores de Upstage](https://developers.upstage.ai/docs/getting-started/quick-start).

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## Uso

Inicializar la clase `UpstageGroundednessCheck`.

```python
from langchain_upstage import UpstageGroundednessCheck

groundedness_check = UpstageGroundednessCheck()
```

Utilice el método `run` para comprobar la solidez del texto de entrada.

```python
request_input = {
    "context": "Mauna Kea is an inactive volcano on the island of Hawai'i. Its peak is 4,207.3 m above sea level, making it the highest point in Hawaii and second-highest peak of an island on Earth.",
    "answer": "Mauna Kea is 5,207.3 meters tall.",
}

response = groundedness_check.invoke(request_input)
print(response)
```
