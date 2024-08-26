---
translated: true
---

# Airtable

>[Airtable](https://en.wikipedia.org/wiki/Airtable) es un servicio de colaboración en la nube.
`Airtable` es un híbrido entre una hoja de cálculo y una base de datos, con las características de una base de datos pero aplicadas a una hoja de cálculo.
> Los campos en una tabla de Airtable son similares a las celdas de una hoja de cálculo, pero tienen tipos como 'casilla de verificación',
> 'número de teléfono' y 'lista desplegable', y pueden hacer referencia a archivos adjuntos como imágenes.

>Los usuarios pueden crear una base de datos, configurar los tipos de columna, agregar registros, vincular tablas entre sí, colaborar, ordenar registros
> y publicar vistas en sitios web externos.

## Instalación y configuración

```bash
pip install pyairtable
```

* Obtén tu [clave API](https://support.airtable.com/docs/creating-and-using-api-keys-and-access-tokens).
* Obtén el [ID de tu base](https://airtable.com/developers/web/api/introduction).
* Obtén el [ID de la tabla de la URL de la tabla](https://www.highviewapps.com/kb/where-can-i-find-the-airtable-base-id-and-table-id/#:~:text=Both%20the%20Airtable%20Base%20ID,URL%20that%20begins%20with%20tbl).

## Cargador de documentos

```python
<!--IMPORTS:[{"imported": "AirtableLoader", "source": "langchain_community.document_loaders", "docs": "https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.airtable.AirtableLoader.html", "title": "Airtable"}]-->
from langchain_community.document_loaders import AirtableLoader
```

Consulta un [ejemplo](/docs/integrations/document_loaders/airtable).
