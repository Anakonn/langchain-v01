---
translated: true
---

# Compréhension de Nuclia

>[Nuclia](https://nuclia.com) indexe automatiquement vos données non structurées provenant de toute source interne et externe, en fournissant des résultats de recherche optimisés et des réponses génératives. Il peut gérer la transcription vidéo et audio, l'extraction de contenu d'image et l'analyse de documents.

L'`API de compréhension de Nuclia` prend en charge le traitement de données non structurées, y compris le texte, les pages Web, les documents et le contenu audio/vidéo. Il extrait tous les textes où qu'ils se trouvent (en utilisant la reconnaissance vocale ou l'OCR si nécessaire), il identifie les entités, il extrait également les métadonnées, les fichiers intégrés (comme les images dans un PDF) et les liens Web. Il fournit également un résumé du contenu.

Pour utiliser l'`API de compréhension de Nuclia`, vous devez avoir un compte `Nuclia`. Vous pouvez en créer un gratuitement sur [https://nuclia.cloud](https://nuclia.cloud), puis [créer une clé NUA](https://docs.nuclia.dev/docs/docs/using/understanding/intro).

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

Vous pouvez envoyer des fichiers à l'`API de compréhension de Nuclia` en utilisant l'action `push`. Comme le traitement est effectué de manière asynchrone, les résultats peuvent être renvoyés dans un ordre différent de celui dans lequel les fichiers ont été envoyés. C'est pourquoi vous devez fournir un `id` pour faire correspondre les résultats au fichier correspondant.

```python
nua.run({"action": "push", "id": "1", "path": "./report.docx"})
nua.run({"action": "push", "id": "2", "path": "./interview.mp4"})
```

Vous pouvez maintenant appeler l'action `pull` en boucle jusqu'à ce que vous obteniez le résultat au format JSON.

```python
import time

pending = True
data = None
while pending:
    time.sleep(15)
    data = nua.run({"action": "pull", "id": "1", "path": None})
    if data:
        print(data)
        pending = False
    else:
        print("waiting...")
```

Vous pouvez également le faire en une seule étape en mode `async`, vous n'avez qu'à faire un push, et il attendra que les résultats soient récupérés :

```python
import asyncio


async def process():
    data = await nua.arun(
        {"action": "push", "id": "1", "path": "./talk.mp4", "text": None}
    )
    print(data)


asyncio.run(process())
```

## Informations récupérées

Nuclia renvoie les informations suivantes :

- métadonnées de fichier
- texte extrait
- texte imbriqué (comme le texte dans une image intégrée)
- un résumé (uniquement lorsque `enable_ml` est défini sur `True`)
- fractionnement en paragraphes et phrases (défini par la position de leur premier et dernier caractère, plus l'heure de début et de fin pour un fichier vidéo ou audio)
- entités nommées : personnes, dates, lieux, organisations, etc. (uniquement lorsque `enable_ml` est défini sur `True`)
- liens
- une miniature
- fichiers intégrés
- les représentations vectorielles du texte (uniquement lorsque `enable_ml` est défini sur `True`)

Remarque :

  Les fichiers générés (miniature, fichiers intégrés extraits, etc.) sont fournis sous forme de jeton. Vous pouvez les télécharger avec l'endpoint [`/processing/download`](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get).

  De plus, à n'importe quel niveau, si un attribut dépasse une certaine taille, il sera placé dans un fichier téléchargeable et sera remplacé dans le document par un pointeur de fichier. Cela se présentera sous la forme `{"file": {"uri": "JWT_TOKEN"}}`. La règle est que si la taille du message est supérieure à 1 000 000 caractères, les plus grandes parties seront déplacées vers des fichiers téléchargeables. Tout d'abord, le processus de compression ciblera les vecteurs. Si cela ne suffit pas, il ciblera les métadonnées de champ volumineuses, et enfin il ciblera le texte extrait.
