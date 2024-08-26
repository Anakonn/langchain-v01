---
translated: true
---

# Microsoft SharePoint

> [Microsoft SharePoint](https://en.wikipedia.org/wiki/SharePoint) es un sistema de colaboración basado en sitios web que utiliza aplicaciones de flujo de trabajo, bases de datos "lista" y otros componentes web y características de seguridad para empoderar a los equipos empresariales a trabajar juntos, desarrollado por Microsoft.

Este cuaderno cubre cómo cargar documentos desde la [Biblioteca de documentos de SharePoint](https://support.microsoft.com/en-us/office/what-is-a-document-library-3b5976dd-65cf-4c9e-bf5a-713c10ca2872). Actualmente, solo se admiten archivos docx, doc y pdf.

## Requisitos previos

1. Registre una aplicación con las instrucciones de la [plataforma de identidad de Microsoft](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
2. Cuando finalice el registro, el portal de Azure muestra el panel de información general de la aplicación registrada. Verá el ID de aplicación (cliente). También se le llama `client ID`, este valor identifica de manera única a su aplicación en la plataforma de identidad de Microsoft.
3. Durante los pasos que seguirá en **elemento 1**, puede establecer el URI de redireccionamiento como `https://login.microsoftonline.com/common/oauth2/nativeclient`
4. Durante los pasos que seguirá en **elemento 1**, genere una nueva contraseña (`client_secret`) en la sección Secretos de aplicación.
5. Siga las instrucciones de este [documento](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) para agregar los siguientes `SCOPES` (`offline_access` y `Sites.Read.All`) a su aplicación.
6. Para recuperar archivos de su **Biblioteca de documentos**, necesitará su ID. Para obtenerlo, necesitará los valores de `Nombre de inquilino`, `ID de colección` e `ID de subsite`.
7. Para encontrar su `Nombre de inquilino`, siga las instrucciones de este [documento](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tenant-management-read-tenant-name). Una vez que lo tenga, simplemente elimine `.onmicrosoft.com` del valor y mantenga el resto como su `Nombre de inquilino`.
8. Para obtener su `ID de colección` e `ID de subsite`, necesitará el `nombre del sitio` de su **SharePoint**. La URL de su sitio `SharePoint` tiene el siguiente formato `https://<nombre-inquilino>.sharepoint.com/sites/<nombre-sitio>`. La última parte de esta URL es el `nombre del sitio`.
9. Para obtener el `ID de colección` del sitio, acceda a esta URL en el navegador: `https://<inquilino>.sharepoint.com/sites/<nombre-sitio>/_api/site/id` y copie el valor de la propiedad `Edm.Guid`.
10. Para obtener el `ID de subsite` (o ID de web) use: `https://<inquilino>.sharepoint.com/sites/<nombre-sitio>/_api/web/id` y copie el valor de la propiedad `Edm.Guid`.
11. El `ID del sitio de SharePoint` tiene el siguiente formato: `<nombre-inquilino>.sharepoint.com,<ID de colección>,<ID de subsite>`. Puede mantener ese valor para usarlo en el siguiente paso.
12. Visite el [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) para obtener el `ID de la Biblioteca de documentos`. El primer paso es asegurarse de que ha iniciado sesión con la cuenta asociada a su sitio **SharePoint**. Luego necesita hacer una solicitud a `https://graph.microsoft.com/v1.0/sites/<ID del sitio de SharePoint>/drive` y la respuesta devolverá una carga útil con un campo `id` que contiene el ID de su `ID de la Biblioteca de documentos`.

## 🧑 Instrucciones para ingerir sus documentos desde la Biblioteca de documentos de SharePoint

### 🔑 Autenticación

De forma predeterminada, el `SharePointLoader` espera que los valores de `CLIENT_ID` y `CLIENT_SECRET` se almacenen como variables de entorno denominadas `O365_CLIENT_ID` y `O365_CLIENT_SECRET` respectivamente. Puede pasar esas variables de entorno a través de un archivo `.env` en la raíz de su aplicación o usando el siguiente comando en su script.

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

Este cargador utiliza una autenticación llamada [*en nombre de un usuario*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0). Es una autenticación de 2 pasos con consentimiento del usuario. Cuando instancie el cargador, imprimirá una URL que el usuario debe visitar para dar su consentimiento a la aplicación en los permisos requeridos. El usuario debe visitar esta URL y dar su consentimiento a la aplicación. Luego, el usuario debe copiar la URL de la página resultante y pegarla de vuelta en la consola. El método devolverá True si el intento de inicio de sesión fue exitoso.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID")
```

Una vez que se haya realizado la autenticación, el cargador almacenará un token (`o365_token.txt`) en la carpeta `~/.credentials/`. Este token se puede usar más tarde para autenticarse sin los pasos de copia/pegado explicados anteriormente. Para usar este token para la autenticación, debe cambiar el parámetro `auth_with_token` a True en la instanciación del cargador.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
```

### 🗂️ Cargador de documentos

#### 📑 Carga de documentos desde un directorio de la Biblioteca de documentos

`SharePointLoader` puede cargar documentos desde una carpeta específica dentro de su Biblioteca de documentos. Por ejemplo, si desea cargar todos los documentos almacenados en la carpeta `Documents/marketing` dentro de su Biblioteca de documentos.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", folder_path="Documents/marketing", auth_with_token=True)
documents = loader.load()
```

Si recibe el error `Resource not found for the segment`, intente usar el `folder_id` en lugar de la ruta de la carpeta, que se puede obtener de la [API de Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer)

```python
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True
                          folder_id="<folder-id>")
documents = loader.load()
```

Si desea cargar documentos desde el directorio raíz, puede omitir `folder_id`, `folder_path` y `documents_ids` y el cargador cargará el directorio raíz.

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
documents = loader.load()
```

Combinado con `recursive=True`, puede cargar todos los documentos de todo SharePoint:

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID",
                          recursive=True,
                          auth_with_token=True)
documents = loader.load()
```

#### 📑 Carga de documentos a partir de una lista de ID de documentos

Otra posibilidad es proporcionar una lista de `object_id` para cada documento que desee cargar. Para ello, deberá consultar la [API de Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) para encontrar todos los ID de documentos que le interesen. Este [enlace](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources) proporciona una lista de puntos de conexión que serán útiles para recuperar los ID de los documentos.

Por ejemplo, para recuperar información sobre todos los objetos almacenados en la carpeta `data/finance/`, debe realizar una solicitud a: `https://graph.microsoft.com/v1.0/drives/<document-library-id>/root:/data/finance:/children`. Una vez que tenga la lista de ID que le interesen, puede instanciar el cargador con los siguientes parámetros.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
