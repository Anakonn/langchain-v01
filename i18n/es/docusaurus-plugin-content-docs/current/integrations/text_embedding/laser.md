---
traducido: falso
translated: true
---

# LASER Representaciones de Frases Independientes del Idioma Incrustaciones por Meta AI

>[LASER](https://github.com/facebookresearch/LASER/) es una biblioteca de Python desarrollada por el equipo de investigación de Meta AI y se utiliza para crear incrustaciones de frases multilingües para más de 147 idiomas a partir del 25/2/2024.
>- Lista de idiomas compatibles en https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200

## Dependencias

Para usar LaserEmbed con LangChain, instala el paquete de Python `laser_encoders`.

```python
%pip install laser_encoders
```

## Importaciones

```python
from langchain_community.embeddings.laser import LaserEmbeddings
```

## Instanciando Laser

### Parámetros

- `lang: Optional[str]`
    >Si está vacío, se utilizará de forma predeterminada
    un modelo de codificador LASER multilingüe (llamado "laser2").
    Puede encontrar la lista de idiomas y códigos de idioma compatibles [aquí](https://github.com/facebookresearch/flores/blob/main/flores200/README.md#languages-in-flores-200)
    y [aquí](https://github.com/facebookresearch/LASER/blob/main/laser_encoders/language_list.py)
.

```python
# Ex Instantiationz
embeddings = LaserEmbeddings(lang="eng_Latn")
```

## Uso

### Generando incrustaciones de documentos

```python
document_embeddings = embeddings.embed_documents(
    ["This is a sentence", "This is some other sentence"]
)
```

### Generando incrustaciones de consultas

```python
query_embeddings = embeddings.embed_query("This is a query")
```
