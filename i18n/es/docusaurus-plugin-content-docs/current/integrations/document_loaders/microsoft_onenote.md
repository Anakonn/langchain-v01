---
translated: true
---

# Microsoft OneNote

Este cuaderno cubre cómo cargar documentos desde `OneNote`.

## Requisitos previos

1. Registre una aplicación con las [instrucciones de la plataforma de identidad de Microsoft](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
2. Cuando finalice el registro, el portal de Azure muestra el panel de información general de la aplicación registrada. Verá el ID de la aplicación (cliente). También llamado `client ID`, este valor identifica de forma única a su aplicación en la plataforma de identidad de Microsoft.
3. Durante los pasos que seguirá en **elemento 1**, puede establecer el URI de redireccionamiento como `http://localhost:8000/callback`.
4. Durante los pasos que seguirá en **elemento 1**, genere una nueva contraseña (`client_secret`) en la sección Secretos de la aplicación.
5. Siga las instrucciones de este [documento](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) para agregar los siguientes `SCOPES` (`Notes.Read`) a su aplicación.
6. Debe instalar los paquetes msal y bs4 usando los comandos `pip install msal` y `pip install beautifulsoup4`.
7. Al final de los pasos, debe tener los siguientes valores:
- `CLIENT_ID`
- `CLIENT_SECRET`

## 🧑 Instrucciones para ingerir sus documentos desde OneNote

### 🔑 Autenticación

De forma predeterminada, el `OneNoteLoader` espera que los valores de `CLIENT_ID` y `CLIENT_SECRET` se almacenen como variables de entorno llamadas `MS_GRAPH_CLIENT_ID` y `MS_GRAPH_CLIENT_SECRET` respectivamente. Puede pasar esas variables de entorno a través de un archivo `.env` en la raíz de su aplicación o usando el siguiente comando en su script.

```python
os.environ['MS_GRAPH_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['MS_GRAPH_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

Este cargador utiliza una autenticación llamada [*en nombre de un usuario*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0). Es una autenticación de 2 pasos con consentimiento del usuario. Cuando instancie el cargador, imprimirá una URL que el usuario debe visitar para dar su consentimiento a la aplicación en los permisos requeridos. El usuario debe visitar esta URL y dar su consentimiento a la aplicación. Luego, el usuario debe copiar la URL de la página resultante y pegarla de vuelta en la consola. El método devolverá True si el intento de inicio de sesión fue exitoso.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE")
```

Una vez que se haya realizado la autenticación, el cargador almacenará un token (`onenote_graph_token.txt`) en la carpeta `~/.credentials/`. Este token se puede usar más tarde para autenticarse sin los pasos de copia/pegado explicados anteriormente. Para usar este token para la autenticación, debe cambiar el parámetro `auth_with_token` a True en la instanciación del cargador.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", auth_with_token=True)
```

Alternativamente, también puede pasar el token directamente al cargador. Esto es útil cuando desea autenticarse con un token que fue generado por otra aplicación. Por ejemplo, puede usar el [Explorador de Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) para generar un token y luego pasarlo al cargador.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", access_token="TOKEN")
```

### 🗂️ Cargador de documentos

#### 📑 Carga de páginas desde un cuaderno de OneNote

`OneNoteLoader` puede cargar páginas desde cuadernos de OneNote almacenados en OneDrive. Puede especificar cualquier combinación de `notebook_name`, `section_name`, `page_title` para filtrar las páginas bajo un cuaderno específico, bajo una sección específica o con un título específico, respectivamente. Por ejemplo, desea cargar todas las páginas que se almacenan en una sección llamada `Recetas` dentro de cualquiera de sus cuadernos de OneDrive.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(section_name="Recipes", auth_with_token=True)
documents = loader.load()
```

#### 📑 Carga de páginas a partir de una lista de ID de página

Otra posibilidad es proporcionar una lista de `object_ids` para cada página que desee cargar. Para eso, deberá consultar la [API de Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) para encontrar todos los ID de documentos que le interesen. Este [enlace](https://learn.microsoft.com/en-us/graph/onenote-get-content#page-collection) proporciona una lista de puntos finales que serán útiles para recuperar los ID de los documentos.

Por ejemplo, para recuperar información sobre todas las páginas que se almacenan en sus cuadernos, debe hacer una solicitud a: `https://graph.microsoft.com/v1.0/me/onenote/pages`. Una vez que tenga la lista de ID que le interesen, puede instanciar el cargador con los siguientes parámetros.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
