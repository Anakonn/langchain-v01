---
translated: true
---

# Notion DB 1/2

>[Notion](https://www.notion.so/) es una plataforma de colaboración con soporte de Markdown modificado que integra tableros de kanban, tareas, wikis y bases de datos. Es un espacio de trabajo integral para la toma de notas, la gestión del conocimiento y los datos, y la gestión de proyectos y tareas.

Este cuaderno cubre cómo cargar documentos desde un volcado de base de datos de Notion.

Para obtener este volcado de Notion, siga estas instrucciones:

## 🧑 Instrucciones para ingerir su propio conjunto de datos

Exporte su conjunto de datos de Notion. Puede hacer esto haciendo clic en los tres puntos de la esquina superior derecha y luego haciendo clic en `Exportar`.

Al exportar, asegúrese de seleccionar la opción de formato `Markdown y CSV`.

Esto producirá un archivo `.zip` en su carpeta de Descargas. Mueva el archivo `.zip` a este repositorio.

Ejecute el siguiente comando para descomprimir el archivo zip (reemplace `Export...` con el nombre de su propio archivo según sea necesario).

```shell
unzip Export-d3adfe0f-3131-4bf3-8987-a52017fc1bae.zip -d Notion_DB
```

Ejecute el siguiente comando para ingerir los datos.

```python
from langchain_community.document_loaders import NotionDirectoryLoader
```

```python
loader = NotionDirectoryLoader("Notion_DB")
```

```python
docs = loader.load()
```
