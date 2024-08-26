---
translated: true
---

# Documentación de ReadTheDocs

>[Read the Docs](https://readthedocs.org/) es una plataforma de alojamiento de documentación de software de código abierto y gratuita. Genera documentación escrita con el generador de documentación `Sphinx`.

Este cuaderno cubre cómo cargar contenido de HTML que se generó como parte de una compilación de `Read-The-Docs`.

Para un ejemplo de esto en vivo, consulta [aquí](https://github.com/langchain-ai/chat-langchain).

Esto asume que el HTML ya se ha raspado en una carpeta. Esto se puede hacer descomentando y ejecutando el siguiente comando:

```python
%pip install --upgrade --quiet  beautifulsoup4
```

```python
#!wget -r -A.html -P rtdocs https://python.langchain.com/en/latest/
```

```python
from langchain_community.document_loaders import ReadTheDocsLoader
```

```python
loader = ReadTheDocsLoader("rtdocs", features="html.parser")
```

```python
docs = loader.load()
```
