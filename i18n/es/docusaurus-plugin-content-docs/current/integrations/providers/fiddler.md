---
translated: true
---

# Fiddler

>[Fiddler](https://www.fiddler.ai/) proporciona una plataforma unificada para monitorear, explicar, analizar y mejorar los despliegues de ML a escala empresarial.

## Instalación y configuración

Configura tu modelo [con Fiddler](https://demo.fiddler.ai):

* La URL que estás usando para conectarte a Fiddler
* Tu ID de organización
* Tu token de autorización

Instala el paquete de Python:

```bash
pip install fiddler-client
```

## Callbacks

```python
<!--IMPORTS:[{"imported": "FiddlerCallbackHandler", "source": "langchain_community.callbacks.fiddler_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.fiddler_callback.FiddlerCallbackHandler.html", "title": "Fiddler"}]-->
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler
```

Consulta un [ejemplo](/docs/integrations/callbacks/fiddler).
