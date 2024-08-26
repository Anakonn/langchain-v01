---
translated: true
---

# Huawei OBS File

El siguiente código demuestra cómo cargar un objeto del Servicio de Almacenamiento de Objetos (OBS) de Huawei como documento.

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

## Cada cargador con información de autenticación separada

Si no necesita reutilizar las conexiones OBS entre diferentes cargadores, puede configurar directamente el `config`. El cargador utilizará la información de configuración para inicializar su propio cliente OBS.

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

## Obtener información de autenticación de ECS

Si su langchain se implementa en Huawei Cloud ECS y [se ha configurado Agency](https://support.huaweicloud.com/intl/en-us/usermanual-ecs/ecs_03_0166.html#section7), el cargador puede obtener directamente el token de seguridad de ECS sin necesidad de una clave de acceso y una clave secreta.

```python
config = {"get_token_from_ecs": True}
loader = OBSFileLoader(
    "your-bucket-name", "your-object-key", endpoint=endpoint, config=config
)
```

```python
loader.load()
```

## Acceder a un objeto de acceso público

Si el objeto al que desea acceder permite el acceso de usuarios anónimos (los usuarios anónimos tienen permiso `GetObject`), puede cargar directamente el objeto sin configurar el parámetro `config`.

```python
loader = OBSFileLoader("your-bucket-name", "your-object-key", endpoint=endpoint)
```

```python
loader.load()
```
