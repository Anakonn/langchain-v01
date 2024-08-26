---
translated: true
---

# Embedchain

>[Embedchain](https://github.com/embedchain/embedchain) est un cadre RAG pour créer des pipelines de données. Il charge, indexe, récupère et synchronise toutes les données.
>
>Il est disponible en tant que [package open source](https://github.com/embedchain/embedchain) et en tant que [solution de plateforme hébergée](https://app.embedchain.ai/).

Ce notebook montre comment utiliser un récupérateur qui utilise `Embedchain`.

# Installation

Vous devrez d'abord installer le [`package embedchain`](https://pypi.org/project/embedchain/).

Vous pouvez installer le package en exécutant

```python
%pip install --upgrade --quiet  embedchain
```

# Créer un nouveau récupérateur

`EmbedchainRetriever` a une méthode de fabrique statique `.create()` qui prend les arguments suivants :

* `yaml_path: string` facultatif -- Chemin du fichier de configuration YAML. S'il n'est pas fourni, une configuration par défaut est utilisée. Vous pouvez parcourir la [documentation](https://docs.embedchain.ai/) pour explorer diverses options de personnalisation.

```python
# Setup API Key

import os
from getpass import getpass

os.environ["OPENAI_API_KEY"] = getpass()
```

```output
 ········
```

```python
from langchain_community.retrievers import EmbedchainRetriever

# create a retriever with default options
retriever = EmbedchainRetriever.create()

# or if you want to customize, pass the yaml config path
# retriever = EmbedchainRetiever.create(yaml_path="config.yaml")
```

# Ajouter des données

Dans embedchain, vous pouvez ajouter autant de types de données pris en charge que possible. Vous pouvez parcourir notre [documentation](https://docs.embedchain.ai/) pour voir les types de données pris en charge.

Embedchain déduit automatiquement les types des données. Vous pouvez donc ajouter une chaîne, une URL ou un chemin de fichier local.

```python
retriever.add_texts(
    [
        "https://en.wikipedia.org/wiki/Elon_Musk",
        "https://www.forbes.com/profile/elon-musk",
        "https://www.youtube.com/watch?v=RcYjXbSJBN8",
    ]
)
```

```output
Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 4/4 [00:08<00:00,  2.22s/it]

Successfully saved https://en.wikipedia.org/wiki/Elon_Musk (DataType.WEB_PAGE). New chunks count: 378

Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:01<00:00,  1.17s/it]

Successfully saved https://www.forbes.com/profile/elon-musk (DataType.WEB_PAGE). New chunks count: 13

Inserting batches in chromadb: 100%|████████████████████████████████████████████████████████████████████████████████████████████████████████████████| 1/1 [00:02<00:00,  2.25s/it]

Successfully saved https://www.youtube.com/watch?v=RcYjXbSJBN8 (DataType.YOUTUBE_VIDEO). New chunks count: 53


```

```output
['1eab8dd1ffa92906f7fc839862871ca5',
 '8cf46026cabf9b05394a2658bd1fe890',
 'da3227cdbcedb018e05c47b774d625f6']
```

# Utiliser le récupérateur

Vous pouvez maintenant utiliser le récupérateur pour trouver les documents pertinents en fonction d'une requête

```python
result = retriever.invoke("How many companies does Elon Musk run and name those?")
```

```python
result
```

```output
[Document(page_content='Views Filmography Companies Zip2 X.com PayPal SpaceX Starlink Tesla, Inc. Energycriticismlitigation OpenAI Neuralink The Boring Company Thud X Corp. Twitteracquisitiontenure as CEO xAI In popular culture Elon Musk (Isaacson) Elon Musk (Vance) Ludicrous Power Play "Members Only" "The Platonic Permutation" "The Musk Who Fell to Earth" "One Crew over the Crewcoo\'s Morty" Elon Musk\'s Crash Course Related Boring Test Tunnel Hyperloop Musk family Musk vs. Zuckerberg SolarCity Tesla Roadster in space', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'}),
 Document(page_content='Elon Musk PROFILEElon MuskCEO, Tesla$241.2B$508M (0.21%)Real Time Net Worthas of 11/18/23Reflects change since 5 pm ET of prior trading day. 1 in the world todayPhoto by Martin Schoeller for ForbesAbout Elon MuskElon Musk cofounded six companies, including electric car maker Tesla, rocket producer SpaceX and tunneling startup Boring Company.He owns about 21% of Tesla between stock and options, but has pledged more than half his shares as collateral for personal loans of up to $3.5', metadata={'source': 'https://www.forbes.com/profile/elon-musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3c8573134c575fafc025e9211413723e1f7a725b5936e8ee297fb7fb63bdd01a'}),
 Document(page_content='to form PayPal. In October 2002, eBay acquired PayPal for $1.5 billion, and that same year, with $100 million of the money he made, Musk founded SpaceX, a spaceflight services company. In 2004, he became an early investor in electric vehicle manufacturer Tesla Motors, Inc. (now Tesla, Inc.). He became its chairman and product architect, assuming the position of CEO in 2008. In 2006, Musk helped create SolarCity, a solar-energy company that was acquired by Tesla in 2016 and became Tesla Energy.', metadata={'source': 'https://en.wikipedia.org/wiki/Elon_Musk', 'document_id': 'c33c05d0-5028-498b-b5e3-c43a4f9e8bf8--3342161a0fbc19e91f6bf387204aa30fbb2cea05abc81882502476bde37b9392'})]
```
