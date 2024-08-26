---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) indexe automatiquement vos données non structurées provenant de toutes les sources internes et externes, en fournissant des résultats de recherche optimisés et des réponses génératives. Il peut gérer la transcription vidéo et audio, l'extraction de contenu d'image et l'analyse de documents.

>L'`API Nuclia Understanding` prend en charge le traitement de données non structurées, y compris le texte, les pages Web, les documents et le contenu audio/vidéo. Il extrait tous les textes où qu'ils se trouvent (en utilisant la reconnaissance vocale ou l'OCR si nécessaire), il extrait également les métadonnées, les fichiers intégrés (comme les images dans un PDF) et les liens Web. Si l'apprentissage automatique est activé, il identifie les entités, fournit un résumé du contenu et génère des embeddings pour toutes les phrases.

## Configuration

Pour utiliser l'`API Nuclia Understanding`, vous devez avoir un compte Nuclia. Vous pouvez en créer un gratuitement sur [https://nuclia.cloud](https://nuclia.cloud), puis [créer une clé NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

## Exemple

Pour utiliser le chargeur de documents Nuclia, vous devez instancier un outil `NucliaUnderstandingAPI` :

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

```python
from langchain_community.document_loaders.nuclia import NucliaLoader

loader = NucliaLoader("./interview.mp4", nua)
```

Vous pouvez maintenant appeler le `load` du document dans une boucle jusqu'à ce que vous obteniez le document.

```python
import time

pending = True
while pending:
    time.sleep(15)
    docs = loader.load()
    if len(docs) > 0:
        print(docs[0].page_content)
        print(docs[0].metadata)
        pending = False
    else:
        print("waiting...")
```

## Informations récupérées

Nuclia renvoie les informations suivantes :

- métadonnées du fichier
- texte extrait
- texte imbriqué (comme le texte dans une image intégrée)
- fractionnement des paragraphes et des phrases (défini par la position de leur premier et dernier caractère, plus l'heure de début et de fin pour un fichier vidéo ou audio)
- liens
- une miniature
- fichiers intégrés

Remarque :

  Les fichiers générés (miniature, fichiers intégrés extraits, etc.) sont fournis sous forme de jeton. Vous pouvez les télécharger avec l'[endpoint `/processing/download`](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get).

  De plus, à n'importe quel niveau, si un attribut dépasse une certaine taille, il sera placé dans un fichier téléchargeable et sera remplacé dans le document par un pointeur de fichier. Cela se présentera sous la forme `{"file": {"uri": "JWT_TOKEN"}}`. La règle est que si la taille du message est supérieure à 1 000 000 caractères, les plus grandes parties seront déplacées vers des fichiers téléchargeables. Tout d'abord, le processus de compression ciblera les vecteurs. Si cela ne suffit pas, il ciblera les métadonnées de champ volumineuses, et enfin il ciblera le texte extrait.
