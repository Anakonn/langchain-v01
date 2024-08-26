---
translated: true
---

# Quip

>[Quip](https://quip.com) es un conjunto de software de productividad colaborativa para móviles y web. Permite a grupos de personas crear y editar documentos y hojas de cálculo en grupo, generalmente con fines empresariales.

Un cargador para documentos `Quip`.

Consulte [aquí](https://quip.com/dev/automation/documentation/current#section/Authentication/Get-Access-to-Quip's-APIs) para saber cómo obtener un token de acceso personal.

Especifique una lista `folder_ids` y/o `thread_ids` para cargar los documentos correspondientes en objetos Document, si se especifican ambos, el cargador obtendrá todos los `thread_ids` que pertenecen a esta carpeta en función de `folder_ids`, combinará con los `thread_ids` pasados, y se devolverá la unión de ambos conjuntos.

* ¿Cómo saber folder_id?
  Vaya a la carpeta de quip, haga clic derecho en la carpeta y copie el enlace, extraiga el sufijo del enlace como folder_id. Pista: `https://example.quip.com/<folder_id>`
* ¿Cómo saber thread_id?
  `thread_id` es el id del documento. Vaya al documento de quip, haga clic derecho en el documento y copie el enlace, extraiga el sufijo del enlace como `thread_id`. Pista: `https://exmaple.quip.com/<thread_id>`

También puede establecer `include_all_folders` como `True` para obtener `group_folder_ids` y
También puede especificar un booleano `include_attachments` para incluir archivos adjuntos, esto está establecido en `False` de forma predeterminada, si se establece en `True`, se descargarán todos los archivos adjuntos y `QuipLoader` extraerá el texto de los archivos adjuntos y lo agregará al objeto `Document`. Los tipos de archivos adjuntos admitidos actualmente son: `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` y `Excel`. También puede especificar un booleano `include_comments` para incluir comentarios en el documento, esto está establecido en `False` de forma predeterminada, si se establece en `True`, se obtendrán todos los comentarios del documento y `QuipLoader` los agregará al objeto `Document`.

Antes de usar `QuipLoader`, asegúrese de tener la última versión del paquete `quip-api` instalado:

```python
%pip install --upgrade --quiet  quip-api
```

## Ejemplos

### Token de acceso personal

```python
from langchain_community.document_loaders.quip import QuipLoader

loader = QuipLoader(
    api_url="https://platform.quip.com", access_token="change_me", request_timeout=60
)
documents = loader.load(
    folder_ids={"123", "456"},
    thread_ids={"abc", "efg"},
    include_attachments=False,
    include_comments=False,
)
```
