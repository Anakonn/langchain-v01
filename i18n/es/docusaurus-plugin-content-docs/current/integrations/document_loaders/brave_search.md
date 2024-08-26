---
translated: true
---

# Brave Search

>[Brave Search](https://en.wikipedia.org/wiki/Brave_Search) es un motor de búsqueda desarrollado por Brave Software.
> - `Brave Search` utiliza su propio índice web. A partir de mayo de 2022, cubría más de 10 mil millones de páginas y se utilizaba para servir el 92% de los resultados de búsqueda sin depender de terceros, y el resto se recuperaba del lado del servidor desde la API de Bing o (de forma opt-in) del lado del cliente desde Google. Según Brave, el índice se mantuvo "intencionalmente más pequeño que el de Google o Bing" para ayudar a evitar el spam y otro contenido de baja calidad, con la desventaja de que "Brave Search aún no es tan bueno como Google en la recuperación de consultas de cola larga".
>- `Brave Search Premium`: A partir de abril de 2023, Brave Search es un sitio web sin anuncios, pero eventualmente cambiará a un nuevo modelo que incluirá anuncios y los usuarios premium obtendrán una experiencia sin anuncios. Los datos de los usuarios, incluidas las direcciones IP, no se recopilarán de sus usuarios de forma predeterminada. Se requerirá una cuenta premium para la recopilación de datos opt-in.

## Instalación y configuración

Para obtener acceso a la API de Brave Search, necesitas [crear una cuenta y obtener una clave API](https://api.search.brave.com/app/dashboard).

```python
api_key = "..."
```

```python
from langchain_community.document_loaders import BraveSearchLoader
```

## Ejemplo

```python
loader = BraveSearchLoader(
    query="obama middle name", api_key=api_key, search_kwargs={"count": 3}
)
docs = loader.load()
len(docs)
```

```output
3
```

```python
[doc.metadata for doc in docs]
```

```output
[{'title': "Obama's Middle Name -- My Last Name -- is 'Hussein.' So?",
  'link': 'https://www.cair.com/cair_in_the_news/obamas-middle-name-my-last-name-is-hussein-so/'},
 {'title': "What's up with Obama's middle name? - Quora",
  'link': 'https://www.quora.com/Whats-up-with-Obamas-middle-name'},
 {'title': 'Barack Obama | Biography, Parents, Education, Presidency, Books, ...',
  'link': 'https://www.britannica.com/biography/Barack-Obama'}]
```

```python
[doc.page_content for doc in docs]
```

```output
['I wasn’t sure whether to laugh or cry a few days back listening to radio talk show host Bill Cunningham repeatedly scream Barack <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong> — my last <strong>name</strong> — as if he had anti-Muslim Tourette’s. “Hussein,” Cunningham hissed like he was beckoning Satan when shouting the ...',
 'Answer (1 of 15): A better question would be, “What’s up with <strong>Obama</strong>’s first <strong>name</strong>?” President Barack Hussein <strong>Obama</strong>’s father’s <strong>name</strong> was Barack Hussein <strong>Obama</strong>. He was <strong>named</strong> after his father. Hussein, <strong>Obama</strong>’<strong>s</strong> <strong>middle</strong> <strong>name</strong>, is a very common Arabic <strong>name</strong>, meaning &quot;good,&quot; &quot;handsome,&quot; or ...',
 'Barack <strong>Obama</strong>, in full Barack Hussein <strong>Obama</strong> II, (born August 4, 1961, Honolulu, Hawaii, U.S.), 44th president of the United States (2009–17) and the first African American to hold the office. Before winning the presidency, <strong>Obama</strong> represented Illinois in the U.S.']
```
