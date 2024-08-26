---
translated: true
---

# Infinispan

Infinispan est une grille de données clé-valeur open-source, elle peut fonctionner à la fois en tant que nœud unique et en tant que système distribué.

La recherche vectorielle est prise en charge depuis la version 15.x
Pour plus d'informations : [Infinispan Home](https://infinispan.org)

```python
# Ensure that all we need is installed
# You may want to skip this
%pip install sentence-transformers
%pip install langchain
%pip install langchain_core
%pip install langchain_community
```

# Configuration

Pour exécuter cette démonstration, nous avons besoin d'une instance Infinispan en cours d'exécution sans authentification et d'un fichier de données.
Dans les trois prochaines cellules, nous allons :
- télécharger le fichier de données
- créer la configuration
- exécuter Infinispan dans docker

```bash
%%bash
#get an archive of news
wget https://raw.githubusercontent.com/rigazilla/infinispan-vector/main/bbc_news.csv.gz
```

```bash
%%bash
#create infinispan configuration file
echo 'infinispan:
  cache-container:
    name: default
    transport:
      cluster: cluster
      stack: tcp
  server:
    interfaces:
      interface:
        name: public
        inet-address:
          value: 0.0.0.0
    socket-bindings:
      default-interface: public
      port-offset: 0
      socket-binding:
        name: default
        port: 11222
    endpoints:
      endpoint:
        socket-binding: default
        rest-connector:
' > infinispan-noauth.yaml
```

```python
!docker rm --force infinispanvs-demo
!docker run -d --name infinispanvs-demo -v $(pwd):/user-config  -p 11222:11222 infinispan/server:15.0 -c /user-config/infinispan-noauth.yaml
```

# Le code

## Choisir un modèle d'intégration

Dans cette démonstration, nous utilisons
un modèle d'intégration HuggingFace.

```python
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_core.embeddings import Embeddings

model_name = "sentence-transformers/all-MiniLM-L12-v2"
hf = HuggingFaceEmbeddings(model_name=model_name)
```

## Configuration du cache Infinispan

Infinispan est un magasin clé-valeur très flexible, il peut stocker des bits bruts ainsi que des types de données complexes.
L'utilisateur a une liberté totale dans la configuration de la grille de données, mais pour les types de données simples, tout est automatiquement
configuré par la couche python. Nous tirons parti de cette fonctionnalité afin de nous concentrer sur notre application.

## Préparer les données

Dans cette démonstration, nous nous appuyons sur la configuration par défaut, donc les textes, les métadonnées et les vecteurs sont dans le même cache, mais d'autres options sont possibles : par exemple, le contenu peut être stocké ailleurs et le magasin de vecteurs ne contiendrait qu'une référence au contenu réel.

```python
import csv
import gzip
import time

# Open the news file and process it as a csv
with gzip.open("bbc_news.csv.gz", "rt", newline="") as csvfile:
    spamreader = csv.reader(csvfile, delimiter=",", quotechar='"')
    i = 0
    texts = []
    metas = []
    embeds = []
    for row in spamreader:
        # first and fifth values are joined to form the content
        # to be processed
        text = row[0] + "." + row[4]
        texts.append(text)
        # Store text and title as metadata
        meta = {"text": row[4], "title": row[0]}
        metas.append(meta)
        i = i + 1
        # Change this to change the number of news you want to load
        if i >= 5000:
            break
```

# Remplir le magasin de vecteurs

```python
# add texts and fill vector db

from langchain_community.vectorstores import InfinispanVS

ispnvs = InfinispanVS.from_texts(texts, hf, metas)
```

# Une fonction d'assistance qui affiche les documents résultants

Par défaut, InfinispanVS renvoie le champ `text` protobuf dans `Document.page_content`
et tous les autres champs protobuf (à l'exception du vecteur) dans `metadata`. Ce comportement est
configurable via des fonctions lambda lors de la configuration.

```python
def print_docs(docs):
    for res, i in zip(docs, range(len(docs))):
        print("----" + str(i + 1) + "----")
        print("TITLE: " + res.metadata["title"])
        print(res.page_content)
```

# Essayez-le !

Voici quelques requêtes d'exemple

```python
docs = ispnvs.similarity_search("European nations", 5)
print_docs(docs)
```

```python
print_docs(ispnvs.similarity_search("Milan fashion week begins", 2))
```

```python
print_docs(ispnvs.similarity_search("Stock market is rising today", 4))
```

```python
print_docs(ispnvs.similarity_search("Why cats are so viral?", 2))
```

```python
print_docs(ispnvs.similarity_search("How to stay young", 5))
```

```python
!docker rm --force infinispanvs-demo
```
