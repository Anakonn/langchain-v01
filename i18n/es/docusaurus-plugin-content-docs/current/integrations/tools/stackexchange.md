---
translated: true
---

# StackExchange

>[Stack Exchange](https://stackexchange.com/) es una red de sitios web de preguntas y respuestas (P+R) sobre temas en diversos campos, cada sitio cubre un tema específico, donde las preguntas, respuestas y usuarios están sujetos a un proceso de otorgamiento de reputación. El sistema de reputación permite que los sitios se autorregulen.

El componente ``StackExchange`` integra la API de StackExchange en LangChain, lo que permite el acceso al sitio [StackOverflow](https://stackoverflow.com/) de la red Stack Excchange. Stack Overflow se enfoca en la programación informática.

Este cuaderno explica cómo usar el componente ``StackExchange``.

Primero tenemos que instalar el paquete de Python stackapi, que implementa la API de Stack Exchange.

```python
pip install --upgrade stackapi
```

```python
from langchain_community.utilities import StackExchangeAPIWrapper

stackexchange = StackExchangeAPIWrapper()

stackexchange.run("zsh: command not found: python")
```
