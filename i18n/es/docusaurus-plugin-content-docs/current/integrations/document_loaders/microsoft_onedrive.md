---
translated: true
---

# Microsoft OneDrive

>[Microsoft OneDrive](https://en.wikipedia.org/wiki/OneDrive) (anteriormente `SkyDrive`) es un servicio de alojamiento de archivos operado por Microsoft.

Este cuaderno cubre cómo cargar documentos desde `OneDrive`. Actualmente, solo se admiten archivos docx, doc y pdf.

## Requisitos previos

1. Registre una aplicación con las instrucciones de la [plataforma de identidad de Microsoft](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
2. Cuando finalice el registro, el portal de Azure muestra el panel de información general de la aplicación registrada. Verás el ID de la aplicación (cliente). También se le llama `client ID`, este valor identifica de manera única a tu aplicación en la plataforma de identidad de Microsoft.
3. Durante los pasos que seguirás en **elemento 1**, puedes establecer el URI de redireccionamiento como `http://localhost:8000/callback`.
4. Durante los pasos que seguirás en **elemento 1**, genera una nueva contraseña (`client_secret`) en la sección Secretos de la aplicación.
5. Sigue las instrucciones de este [documento](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) para agregar los siguientes `SCOPES` (`offline_access` y `Files.Read.All`) a tu aplicación.
6. Visita el [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) para obtener tu `ID de OneDrive`. El primer paso es asegurarte de que has iniciado sesión con la cuenta asociada a tu cuenta de OneDrive. Luego debes hacer una solicitud a `https://graph.microsoft.com/v1.0/me/drive` y la respuesta devolverá una carga útil con un campo `id` que contiene el ID de tu cuenta de OneDrive.
7. Debes instalar el paquete o365 usando el comando `pip install o365`.
8. Al final de los pasos, debes tener los siguientes valores:
- `CLIENT_ID`
- `CLIENT_SECRET`
- `DRIVE_ID`

## 🧑 Instrucciones para ingerir tus documentos desde OneDrive

### 🔑 Autenticación

De forma predeterminada, el `OneDriveLoader` espera que los valores de `CLIENT_ID` y `CLIENT_SECRET` se almacenen como variables de entorno llamadas `O365_CLIENT_ID` y `O365_CLIENT_SECRET` respectivamente. Podrías pasar esas variables de entorno a través de un archivo `.env` en la raíz de tu aplicación o usando el siguiente comando en tu script.

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

Este cargador utiliza una autenticación llamada [*en nombre de un usuario*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0). Es una autenticación de 2 pasos con consentimiento del usuario. Cuando instancies el cargador, imprimirá una URL que el usuario debe visitar para dar su consentimiento a la aplicación en los permisos requeridos. El usuario debe visitar esta URL y dar su consentimiento a la aplicación. Luego, el usuario debe copiar la URL de la página resultante y pegarla de vuelta en la consola. El método devolverá True si el intento de inicio de sesión fue exitoso.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID")
```

Una vez que se haya realizado la autenticación, el cargador almacenará un token (`o365_token.txt`) en la carpeta `~/.credentials/`. Este token se puede usar más tarde para autenticarse sin los pasos de copia/pegado explicados anteriormente. Para usar este token para la autenticación, debes cambiar el parámetro `auth_with_token` a True en la instanciación del cargador.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", auth_with_token=True)
```

### 🗂️ Cargador de documentos

#### 📑 Carga de documentos desde un directorio de OneDrive

`OneDriveLoader` puede cargar documentos desde una carpeta específica dentro de tu OneDrive. Por ejemplo, si quieres cargar todos los documentos almacenados en la carpeta `Documents/clients` dentro de tu OneDrive.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", folder_path="Documents/clients", auth_with_token=True)
documents = loader.load()
```

#### 📑 Carga de documentos desde una lista de ID de documentos

Otra posibilidad es proporcionar una lista de `object_id` para cada documento que desees cargar. Para eso, necesitarás consultar la [API de Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) para encontrar todos los ID de documentos que te interesen. Este [enlace](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources) proporciona una lista de puntos finales que serán útiles para recuperar los ID de los documentos.

Por ejemplo, para recuperar información sobre todos los objetos almacenados en la raíz de la carpeta Documentos, debes hacer una solicitud a: `https://graph.microsoft.com/v1.0/drives/{TU ID DE UNIDAD}/root/children`. Una vez que tengas la lista de ID que te interesen, entonces puedes instanciar el cargador con los siguientes parámetros.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
