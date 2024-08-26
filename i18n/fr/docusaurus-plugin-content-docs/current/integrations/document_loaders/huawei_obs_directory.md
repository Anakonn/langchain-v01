---
translated: true
---

# Répertoire Huawei OBS

Le code suivant montre comment charger des objets à partir du service de stockage d'objets (OBS) Huawei en tant que documents.

```python
# Install the required package
# pip install esdk-obs-python
```

```python
from langchain_community.document_loaders import OBSDirectoryLoader
```

```python
endpoint = "your-endpoint"
```

```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## Spécifier un préfixe pour le chargement

Si vous voulez charger des objets avec un préfixe spécifique à partir du compartiment, vous pouvez utiliser le code suivant :

```python
loader = OBSDirectoryLoader(
    "your-bucket-name", endpoint=endpoint, config=config, prefix="test_prefix"
)
```

```python
loader.load()
```

## Obtenir les informations d'authentification à partir d'ECS

Si votre langchain est déployé sur Huawei Cloud ECS et que [l'agence est configurée](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7), le chargeur peut directement obtenir le jeton de sécurité à partir d'ECS sans avoir besoin de la clé d'accès et de la clé secrète.

```python
config = {"get_token_from_ecs": True}
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint, config=config)
```

```python
loader.load()
```

## Utiliser un compartiment public

Si la politique de votre compartiment permet l'accès anonyme (les utilisateurs anonymes ont les autorisations `listBucket` et `GetObject`), vous pouvez charger directement les objets sans configurer le paramètre `config`.

```python
loader = OBSDirectoryLoader("your-bucket-name", endpoint=endpoint)
```

```python
loader.load()
```
