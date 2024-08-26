---
translated: true
---

# Oracle AI Vector Search : Générer des Embeddings

Oracle AI Vector Search est conçu pour les charges de travail d'Intelligence Artificielle (IA) qui vous permettent d'interroger les données en fonction de la sémantique, plutôt que des mots-clés. L'un des plus grands avantages d'Oracle AI Vector Search est que la recherche sémantique sur les données non structurées peut être combinée avec la recherche relationnelle sur les données d'entreprise dans un seul et même système. Cela n'est pas seulement puissant, mais aussi beaucoup plus efficace car vous n'avez pas besoin d'ajouter une base de données vectorielle spécialisée, éliminant ainsi les problèmes de fragmentation des données entre plusieurs systèmes.

Le guide montre comment utiliser les capacités d'embedding dans Oracle AI Vector Search pour générer des embeddings pour vos documents à l'aide d'OracleEmbeddings.

### Prérequis

Veuillez installer le pilote client Python Oracle pour utiliser Langchain avec Oracle AI Vector Search.

```python
# pip install oracledb
```

### Se connecter à la base de données Oracle

Le code d'exemple suivant montrera comment se connecter à la base de données Oracle.

```python
import sys

import oracledb

# please update with your username, password, hostname and service_name
username = "<username>"
password = "<password>"
dsn = "<hostname>/<service_name>"

try:
    conn = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
    sys.exit(1)
```

Pour l'embedding, nous avons quelques options de fournisseurs que les utilisateurs peuvent choisir, comme la base de données, les fournisseurs tiers comme ocigenai, huggingface, openai, etc. Si les utilisateurs choisissent d'utiliser un fournisseur tiers, ils doivent créer des informations d'identification avec les informations d'authentification correspondantes. D'un autre côté, si les utilisateurs choisissent d'utiliser le fournisseur 'database', ils doivent charger un modèle onnx dans la base de données Oracle pour les embeddings.

### Charger le modèle ONNX

Pour générer des embeddings, Oracle fournit quelques options de fournisseurs pour que les utilisateurs puissent choisir. Les utilisateurs peuvent choisir le fournisseur 'database' ou certains fournisseurs tiers comme OCIGENAI, HuggingFace, etc.

***Remarque*** Si les utilisateurs choisissent l'option de base de données, ils doivent charger un modèle ONNX dans la base de données Oracle. Les utilisateurs n'ont pas besoin de charger un modèle ONNX dans la base de données Oracle s'ils choisissent d'utiliser un fournisseur tiers pour générer les embeddings.

L'un des principaux avantages de l'utilisation d'un modèle ONNX est que les utilisateurs n'ont pas besoin de transférer leurs données à un tiers pour générer des embeddings. De plus, comme il n'implique pas d'appels réseau ou d'API REST, il peut offrir de meilleures performances.

Voici un exemple de code pour charger un modèle ONNX dans la base de données Oracle :

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings

# please update with your related information
# make sure that you have onnx file in the system
onnx_dir = "DEMO_DIR"
onnx_file = "tinybert.onnx"
model_name = "demo_model"

try:
    OracleEmbeddings.load_onnx_model(conn, onnx_dir, onnx_file, model_name)
    print("ONNX model loaded.")
except Exception as e:
    print("ONNX model loading failed!")
    sys.exit(1)
```

### Créer des informations d'identification

D'un autre côté, si les utilisateurs choisissent d'utiliser un fournisseur tiers pour générer des embeddings, ils doivent créer des informations d'identification pour accéder aux points de terminaison du fournisseur tiers.

***Remarque :*** Les utilisateurs n'ont pas besoin de créer d'informations d'identification s'ils choisissent d'utiliser le fournisseur 'database' pour générer des embeddings. Si les utilisateurs choisissent un fournisseur tiers, ils doivent créer des informations d'identification pour le fournisseur tiers qu'ils souhaitent utiliser.

Voici un exemple :

```python
try:
    cursor = conn.cursor()
    cursor.execute(
        """
       declare
           jo json_object_t;
       begin
           -- HuggingFace
           dbms_vector_chain.drop_credential(credential_name  => 'HF_CRED');
           jo := json_object_t();
           jo.put('access_token', '<access_token>');
           dbms_vector_chain.create_credential(
               credential_name   =>  'HF_CRED',
               params            => json(jo.to_string));

           -- OCIGENAI
           dbms_vector_chain.drop_credential(credential_name  => 'OCI_CRED');
           jo := json_object_t();
           jo.put('user_ocid','<user_ocid>');
           jo.put('tenancy_ocid','<tenancy_ocid>');
           jo.put('compartment_ocid','<compartment_ocid>');
           jo.put('private_key','<private_key>');
           jo.put('fingerprint','<fingerprint>');
           dbms_vector_chain.create_credential(
               credential_name   => 'OCI_CRED',
               params            => json(jo.to_string));
       end;
       """
    )
    cursor.close()
    print("Credentials created.")
except Exception as ex:
    cursor.close()
    raise
```

### Générer des Embeddings

Oracle AI Vector Search fournit plusieurs moyens de générer des embeddings. Les utilisateurs peuvent charger un modèle d'embedding ONNX dans la base de données Oracle et l'utiliser pour générer des embeddings ou utiliser les points de terminaison d'API de certains fournisseurs tiers pour générer des embeddings. Veuillez vous référer au guide d'Oracle AI Vector Search pour obtenir des informations complètes sur ces paramètres.

***Remarque :*** Les utilisateurs peuvent avoir besoin de définir un proxy s'ils veulent utiliser certains fournisseurs de génération d'embeddings tiers autres que le fournisseur 'database' (c'est-à-dire en utilisant un modèle ONNX).

```python
# proxy to be used when we instantiate summary and embedder object
proxy = "<proxy>"
```

Le code d'exemple suivant montrera comment générer des embeddings :

```python
from langchain_community.embeddings.oracleai import OracleEmbeddings
from langchain_core.documents import Document

"""
# using ocigenai
embedder_params = {
    "provider": "ocigenai",
    "credential_name": "OCI_CRED",
    "url": "https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/embedText",
    "model": "cohere.embed-english-light-v3.0",
}

# using huggingface
embedder_params = {
    "provider": "huggingface",
    "credential_name": "HF_CRED",
    "url": "https://api-inference.huggingface.co/pipeline/feature-extraction/",
    "model": "sentence-transformers/all-MiniLM-L6-v2",
    "wait_for_model": "true"
}
"""

# using ONNX model loaded to Oracle Database
embedder_params = {"provider": "database", "model": "demo_model"}

# Remove proxy if not required
embedder = OracleEmbeddings(conn=conn, params=embedder_params, proxy=proxy)
embed = embedder.embed_query("Hello World!")

""" verify """
print(f"Embedding generated by OracleEmbeddings: {embed}")
```

### Démonstration de bout en bout

Veuillez vous référer à notre guide de démonstration complète [Guide de démonstration de bout en bout d'Oracle AI Vector Search](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) pour construire un pipeline RAG de bout en bout avec l'aide d'Oracle AI Vector Search.
