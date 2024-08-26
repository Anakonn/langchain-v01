---
translated: true
---

# Sous-titre

>[Le format de fichier SubRip](https://en.wikipedia.org/wiki/SubRip#SubRip_file_format) est décrit sur le site Web du format de conteneur multimédia `Matroska` comme "peut-être le plus basique de tous les formats de sous-titres". Les fichiers `SubRip (SubRip Text)` sont nommés avec l'extension `.srt` et contiennent des lignes de texte brut formatées en groupes séparés par un espace vide. Les sous-titres sont numérotés séquentiellement, en commençant par 1. Le format de code temporel utilisé est heures:minutes:secondes,millisecondes avec les unités de temps fixées à deux chiffres zéro-remplis et les fractions fixées à trois chiffres zéro-remplis (00:00:00,000). Le séparateur de fraction utilisé est la virgule, car le programme a été écrit en France.

Comment charger des données à partir de fichiers de sous-titres (`.srt`)

Veuillez télécharger le [fichier .srt d'exemple ici](https://www.opensubtitles.org/en/subtitles/5575150/star-wars-the-clone-wars-crisis-at-the-heart-en).

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
