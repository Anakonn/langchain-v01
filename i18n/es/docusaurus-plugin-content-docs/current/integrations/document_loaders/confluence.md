---
traducido: falso
translated: true
---

# Confluence

>[Confluence](https://www.atlassian.com/software/confluence) es una plataforma de colaboración wiki que guarda y organiza todo el material relacionado con el proyecto. `Confluence` es una base de conocimiento que maneja principalmente actividades de gestión de contenido.

Un cargador para páginas `Confluence`.

Esto actualmente admite `username/api_key`, `Oauth2 login`. Además, las instalaciones locales también admiten autenticación `token`.

Especifique una lista de `page_id`-s y/o `space_key` para cargar las páginas correspondientes en objetos Document, si se especifican ambos, se devolverá la unión de ambos conjuntos.

También puede especificar un booleano `include_attachments` para incluir archivos adjuntos, esto se establece en False de forma predeterminada, si se establece en True, se descargarán todos los archivos adjuntos y ConfluenceReader extraerá el texto de los archivos adjuntos y lo agregará al objeto Document. Los tipos de archivos adjuntos admitidos actualmente son: `PDF`, `PNG`, `JPEG/JPG`, `SVG`, `Word` y `Excel`.

Sugerencia: `space_key` y `page_id` se pueden encontrar en la URL de una página en Confluence: https://yoursite.atlassian.com/wiki/spaces/<space_key>/pages/<page_id>

Antes de usar ConfluenceLoader, asegúrese de tener la última versión del paquete atlassian-python-api instalado:

```python
%pip install --upgrade --quiet  atlassian-python-api
```

## Ejemplos

### Nombre de usuario y contraseña o nombre de usuario y token API (solo Atlassian Cloud)

Este ejemplo se autentica usando ya sea un nombre de usuario y contraseña o, si se está conectando a una versión alojada de Atlassian Cloud de Confluence, un nombre de usuario y un token API.
Puede generar un token API en: https://id.atlassian.com/manage-profile/security/api-tokens.

El parámetro `limit` especifica cuántos documentos se recuperarán en una sola llamada, no cuántos documentos se recuperarán en total.
De forma predeterminada, el código devolverá hasta 1000 documentos en lotes de 50 documentos. Para controlar el número total de documentos, use el parámetro `max_pages`.
Tenga en cuenta que el valor máximo para el parámetro `limit` en el paquete atlassian-python-api actualmente es 100.

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(
    url="https://yoursite.atlassian.com/wiki", username="me", api_key="12345"
)
documents = loader.load(space_key="SPACE", include_attachments=True, limit=50)
```

### Token de acceso personal (solo Server/On-Prem)

Este método es válido solo para la edición Data Center/Server local.
Para obtener más información sobre cómo generar un token de acceso personal (PAT), consulte la documentación oficial de Confluence en: https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html.
Al usar un PAT, solo proporciona el valor del token, no puede proporcionar un nombre de usuario.
Tenga en cuenta que ConfluenceLoader se ejecutará con los permisos del usuario que generó el PAT y solo podrá cargar documentos a los que dicho usuario tenga acceso.

```python
from langchain_community.document_loaders import ConfluenceLoader

loader = ConfluenceLoader(url="https://yoursite.atlassian.com/wiki", token="12345")
documents = loader.load(
    space_key="SPACE", include_attachments=True, limit=50, max_pages=50
)
```
