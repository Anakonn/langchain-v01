---
translated: true
---

# Subtítulo

>[El formato de archivo SubRip](https://en.wikipedia.org/wiki/SubRip#SubRip_file_format) se describe en el sitio web del formato de contenedor multimedia `Matroska` como "tal vez el más básico de todos los formatos de subtítulos". Los archivos `SubRip (SubRip Text)` se nombran con la extensión `.srt` y contienen líneas de texto sin formato con formato en grupos separados por una línea en blanco. Los subtítulos se numeran secuencialmente, comenzando desde 1. El formato de código de tiempo utilizado es horas:minutos:segundos,milisegundos con unidades de tiempo fijas a dos dígitos con relleno de ceros y fracciones fijas a tres dígitos con relleno de ceros (00:00:00,000). El separador fraccionario utilizado es la coma, ya que el programa se escribió en Francia.

Cómo cargar datos de archivos de subtítulos (`.srt`)

Por favor, descargue el [archivo .srt de ejemplo desde aquí](https://www.opensubtitles.org/en/subtitles/5575150/star-wars-the-clone-wars-crisis-at-the-heart-en).

```python
%pip install --upgrade --quiet  pysrt
```

```python
from langchain_community.document_loaders import SRTLoader
```

```python
loader = SRTLoader(
    "example_data/Star_Wars_The_Clone_Wars_S06E07_Crisis_at_the_Heart.srt"
)
```

```python
docs = loader.load()
```

```python
docs[0].page_content[:100]
```

```output
'<i>Corruption discovered\nat the core of the Banking Clan!</i> <i>Reunited, Rush Clovis\nand Senator A'
```
