---
translated: true
---

# Répertoire Tencent COS

>[Tencent Cloud Object Storage (COS)](https://www.tencentcloud.com/products/cos) est un service de stockage distribué qui vous permet de stocker n'importe quelle quantité de données depuis n'importe où via les protocoles HTTP/HTTPS.
> `COS` n'a pas de restrictions sur la structure ou le format des données. Il n'a également pas de limite de taille de compartiment et de gestion des partitions, le rendant adapté à pratiquement tous les cas d'utilisation, tels que la livraison de données, le traitement des données et les lacs de données. `COS` fournit une console Web, des kits de développement logiciel (SDK) et des API multilingues, un outil de ligne de commande et des outils graphiques. Il fonctionne bien avec les API Amazon S3, vous permettant d'accéder rapidement aux outils et plugins de la communauté.

Cela couvre comment charger des objets de document à partir d'un `Répertoire Tencent COS`.

```python
%pip install --upgrade --quiet  cos-python-sdk-v5
```

```python
from langchain_community.document_loaders import TencentCOSDirectoryLoader
from qcloud_cos import CosConfig
```

```python
conf = CosConfig(
    Region="your cos region",
    SecretId="your cos secret_id",
    SecretKey="your cos secret_key",
)
loader = TencentCOSDirectoryLoader(conf=conf, bucket="you_cos_bucket")
```

```python
loader.load()
```

## Spécification d'un préfixe

Vous pouvez également spécifier un préfixe pour un contrôle plus fin sur les fichiers à charger.

```python
loader = TencentCOSDirectoryLoader(conf=conf, bucket="you_cos_bucket", prefix="fake")
```

```python
loader.load()
```
