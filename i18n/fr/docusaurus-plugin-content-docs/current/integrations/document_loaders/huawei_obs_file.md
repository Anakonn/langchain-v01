---
translated: true
---

# Fichier Huawei OBS

Le code suivant montre comment charger un objet à partir du service de stockage d'objets (OBS) Huawei en tant que document.

```python
# Install the required package
# pip install esdk-obs-python
```

```python
from langchain_community.document_loaders.obs_file import OBSFileLoader
```

```python
endpoint = "your-endpoint"
```

```python
from obs import ObsClient

obs_client = ObsClient(
    access_key_id="your-access-key",
    secret_access_key="your-secret-key",
    server=endpoint,
)
loader = OBSFileLoader("your-bucket-name", "your-object-key", client=obs_client)
```

```python
loader.load()
```

## Chaque chargeur avec des informations d'authentification séparées

Si vous n'avez pas besoin de réutiliser les connexions OBS entre différents chargeurs, vous pouvez configurer directement le `config`. Le chargeur utilisera les informations de configuration pour initialiser son propre client OBS.

```python
# Configure your access credentials\n
config = {"ak": "your-access-key", "sk": "your-secret-key"}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## Obtenir des informations d'authentification à partir d'ECS

Si votre langchain est déployé sur Huawei Cloud ECS et que [l'agence est configurée](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7), le chargeur peut directement obtenir le jeton de sécurité d'ECS sans avoir besoin de la clé d'accès et de la clé secrète.

```python
config = {"get_token_from_ecs": True}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## Accéder à un objet accessible au public

Si l'objet auquel vous voulez accéder permet l'accès aux utilisateurs anonymes (les utilisateurs anonymes ont l'autorisation `GetObject`), vous pouvez le charger directement sans configurer le paramètre `config`.

```python
loader = OBSFileLoader("your-bucket-name", "your-object-key", endpoint=endpoint)
```

```python
loader.load()
```
