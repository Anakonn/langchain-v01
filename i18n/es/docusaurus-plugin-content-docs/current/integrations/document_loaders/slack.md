---
translated: true
---

# Slack

>[Slack](https://slack.com/) es un programa de mensajería instantánea.

Este cuaderno cubre cómo cargar documentos desde un archivo Zipfile generado a partir de una exportación de `Slack`.

Para obtener esta exportación de `Slack`, siga estas instrucciones:

## 🧑 Instrucciones para ingerir su propio conjunto de datos

Exporte sus datos de Slack. Puede hacer esto yendo a la página de Administración de su Espacio de trabajo y haciendo clic en la opción Importar/Exportar ({your_slack_domain}.slack.com/services/export). Luego, elija el rango de fechas adecuado y haga clic en `Iniciar exportación`. Slack le enviará un correo electrónico y un mensaje directo cuando la exportación esté lista.

La descarga producirá un archivo `.zip` en su carpeta de Descargas (o donde se puedan encontrar sus descargas, dependiendo de la configuración de su sistema operativo).

Copie la ruta al archivo `.zip` y asígnelo como `LOCAL_ZIPFILE` a continuación.

```python
from langchain_community.document_loaders import SlackDirectoryLoader
```

```python
# Optionally set your Slack URL. This will give you proper URLs in the docs sources.
SLACK_WORKSPACE_URL = "https://xxx.slack.com"
LOCAL_ZIPFILE = ""  # Paste the local paty to your Slack zip file here.

loader = SlackDirectoryLoader(LOCAL_ZIPFILE, SLACK_WORKSPACE_URL)
```

```python
docs = loader.load()
docs
```
