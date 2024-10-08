---
translated: true
---

# Kinetica

Este cuaderno repasa cómo cargar documentos desde Kinetica

```python
%pip install gpudb==7.2.0.1
```

```python
from langchain_community.document_loaders.kinetica_loader import KineticaLoader
```

```python
## Loading Environment Variables
import os

from dotenv import load_dotenv
from langchain_community.vectorstores import (
    KineticaSettings,
)

load_dotenv()
```

```python
# Kinetica needs the connection to the database.
# This is how to set it up.
HOST = os.getenv("KINETICA_HOST", "http://127.0.0.1:9191")
USERNAME = os.getenv("KINETICA_USERNAME", "")
PASSWORD = os.getenv("KINETICA_PASSWORD", "")


def create_config() -> KineticaSettings:
    return KineticaSettings(host=HOST, username=USERNAME, password=PASSWORD)
```

```python
from langchain_community.document_loaders.kinetica_loader import KineticaLoader

# The following `QUERY` is an example which will not run; this
# needs to be substituted with a valid `QUERY` that will return
# data and the `SCHEMA.TABLE` combination must exist in Kinetica.

QUERY = "select text, survey_id from SCHEMA.TABLE limit 10"
kinetica_loader = KineticaLoader(
    QUERY,
    HOST,
    USERNAME,
    PASSWORD,
)
kinetica_documents = kinetica_loader.load()
print(kinetica_documents)
```

```python
from langchain_community.document_loaders.kinetica_loader import KineticaLoader

# The following `QUERY` is an example which will not run; this
# needs to be substituted with a valid `QUERY` that will return
# data and the `SCHEMA.TABLE` combination must exist in Kinetica.

QUERY = "select text, survey_id as source from SCHEMA.TABLE limit 10"
snowflake_loader = KineticaLoader(
    query=QUERY,
    host=HOST,
    username=USERNAME,
    password=PASSWORD,
    metadata_columns=["source"],
)
kinetica_documents = snowflake_loader.load()
print(kinetica_documents)
```
