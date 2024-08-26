---
translated: true
---

# UpTrain

>[UpTrain](https://uptrain.ai/) es una plataforma unificada de código abierto para evaluar y
>mejorar las aplicaciones de Inteligencia Artificial Generativa. Proporciona calificaciones para más de 20 evaluaciones preconfiguradas
>(que cubren casos de uso de lenguaje, código, incrustación),
>realiza un análisis de las causas fundamentales de los casos de fallo
>y brinda información sobre cómo resolverlos.

## Instalación y configuración

```bash
pip install uptrain
```

## Callbacks

```python
<!--IMPORTS:[{"imported": "UpTrainCallbackHandler", "source": "langchain_community.callbacks.uptrain_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.uptrain_callback.UpTrainCallbackHandler.html", "title": "UpTrain"}]-->
from langchain_community.callbacks.uptrain_callback import UpTrainCallbackHandler
```

Consulta un [ejemplo](/docs/integrations/callbacks/uptrain).
