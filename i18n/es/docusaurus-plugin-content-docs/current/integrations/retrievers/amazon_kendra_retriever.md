---
translated: true
---

# Amazon Kendra

> [Amazon Kendra](https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html) es un servicio de búsqueda inteligente proporcionado por `Amazon Web Services` (`AWS`). Utiliza algoritmos avanzados de procesamiento del lenguaje natural (NLP) y aprendizaje automático para habilitar potentes capacidades de búsqueda en diversas fuentes de datos dentro de una organización. `Kendra` está diseñado para ayudar a los usuarios a encontrar la información que necesitan de manera rápida y precisa, mejorando la productividad y la toma de decisiones.

> Con `Kendra`, los usuarios pueden buscar en una amplia gama de tipos de contenido, incluyendo documentos, preguntas frecuentes, bases de conocimiento, manuales y sitios web. Admite varios idiomas y puede entender consultas complejas, sinónimos y significados contextuales para proporcionar resultados de búsqueda altamente relevantes.

## Uso del Amazon Kendra Index Retriever

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKendraRetriever
```

Crear nuevo Retriever

```python
retriever = AmazonKendraRetriever(index_id="c0806df7-e76b-4bce-9b5c-d5582f6b1a03")
```

Ahora puedes usar los documentos recuperados del índice de Kendra

```python
retriever.invoke("what is langchain")
```
