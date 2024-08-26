---
translated: true
---

# DuckDuckGo Search

Este cuaderno analiza cómo usar el componente de búsqueda de duck-duck-go.

```python
%pip install --upgrade --quiet  duckduckgo-search
```

```python
from langchain_community.tools import DuckDuckGoSearchRun
```

```python
search = DuckDuckGoSearchRun()
```

```python
search.run("Obama's first name?")
```

```output
"Life After the Presidency How Tall is Obama? Books and Grammy Hobbies Movies About Obama Quotes 1961-present Who Is Barack Obama? Barack Obama was the 44 th president of the United States... facts you never knew about Barack Obama is that his immediate family spread out across three continents. Barack, who led America from 2009 to 2017, comes from a large family of seven living half-siblings. His father, Barack Obama Sr., met his mother, Ann Dunham, in 1960 and married her a year after. With a tear running from his eye, President Barack Obama recalls the 20 first-graders killed in 2012 at Sandy Hook Elementary School, while speaking in the East Room of the White House in ... Former first Lady Rosalynn Carter was laid to rest at her family's home in Plains, Ga. on Nov. 29 following three days of memorials across her home state. She passed away on Nov. 19, aged 96 ... Here are 28 of President Obama's biggest accomplishments as President of the United States. 1 - Rescued the country from the Great Recession, cutting the unemployment rate from 10% to 4.7% over ..."
```

Para obtener más información adicional (p. ej. enlace, fuente) use `DuckDuckGoSearchResults()`

```python
from langchain_community.tools import DuckDuckGoSearchResults
```

```python
search = DuckDuckGoSearchResults()
```

```python
search.run("Obama")
```

```output
'[snippet: 1:12. Former President Barack Obama, in a CNN interview that aired Thursday night, said he does not believe President Joe Biden will face a serious primary challenge during his 2024 reelection ..., title: Five takeaways from Barack Obama\'s CNN interview on Biden ... - Yahoo, link: https://www.usatoday.com/story/news/politics/2023/06/23/five-takeaways-from-barack-obama-cnn-interview/70349112007/], [snippet: Democratic institutions in the United States and around the world have grown "creaky," former President Barack Obama warned in an exclusive CNN interview Thursday, and it remains incumbent on ..., title: Obama warns democratic institutions are \'creaky\' but Trump ... - CNN, link: https://www.cnn.com/2023/06/22/politics/barack-obama-interview-cnntv/index.html], [snippet: Barack Obama was the 44 th president of the United States and the first Black commander-in-chief. He served two terms, from 2009 until 2017. The son of parents from Kenya and Kansas, Obama was ..., title: Barack Obama: Biography, 44th U.S. President, Politician, link: https://www.biography.com/political-figures/barack-obama], [snippet: Aug. 2, 2023, 5:00 PM PDT. By Mike Memoli and Kristen Welker. WASHINGTON — During a trip to the White House in June, former President Barack Obama made it clear to his former running mate that ..., title: Obama privately told Biden he would do whatever it takes to help in 2024, link: https://www.nbcnews.com/politics/white-house/obama-privately-told-biden-whatever-takes-help-2024-rcna97865], [snippet: Natalie Bookey-Baker, a vice president at the Obama Foundation who worked for then-first lady Michelle Obama in the White House, said about 2,500 alumni are expected. They are veterans of Obama ..., title: Barack Obama team reunion this week in Chicago; 2,500 alumni expected ..., link: https://chicago.suntimes.com/politics/2023/10/29/23937504/barack-obama-michelle-obama-david-axelrod-pod-save-america-jon-batiste-jen-psaki-reunion-obamaworld]'
```

También puedes buscar artículos de noticias. Usa la palabra clave ``backend="news"``

```python
search = DuckDuckGoSearchResults(backend="news")
```

```python
search.run("Obama")
```

```output
'[snippet: 1:12. Former President Barack Obama, in a CNN interview that aired Thursday night, said he does not believe President Joe Biden will face a serious primary challenge during his 2024 reelection ..., title: Five takeaways from Barack Obama\'s CNN interview on Biden ... - Yahoo, link: https://www.usatoday.com/story/news/politics/2023/06/23/five-takeaways-from-barack-obama-cnn-interview/70349112007/], [snippet: Democratic institutions in the United States and around the world have grown "creaky," former President Barack Obama warned in an exclusive CNN interview Thursday, and it remains incumbent on ..., title: Obama warns democratic institutions are \'creaky\' but Trump ... - CNN, link: https://www.cnn.com/2023/06/22/politics/barack-obama-interview-cnntv/index.html], [snippet: Barack Obama was the 44 th president of the United States and the first Black commander-in-chief. He served two terms, from 2009 until 2017. The son of parents from Kenya and Kansas, Obama was ..., title: Barack Obama: Biography, 44th U.S. President, Politician, link: https://www.biography.com/political-figures/barack-obama], [snippet: Natalie Bookey-Baker, a vice president at the Obama Foundation who worked for then-first lady Michelle Obama in the White House, said about 2,500 alumni are expected. They are veterans of Obama ..., title: Barack Obama team reunion this week in Chicago; 2,500 alumni expected ..., link: https://chicago.suntimes.com/politics/2023/10/29/23937504/barack-obama-michelle-obama-david-axelrod-pod-save-america-jon-batiste-jen-psaki-reunion-obamaworld], [snippet: Aug. 2, 2023, 5:00 PM PDT. By Mike Memoli and Kristen Welker. WASHINGTON — During a trip to the White House in June, former President Barack Obama made it clear to his former running mate that ..., title: Obama privately told Biden he would do whatever it takes to help in 2024, link: https://www.nbcnews.com/politics/white-house/obama-privately-told-biden-whatever-takes-help-2024-rcna97865]'
```

También puedes pasar directamente un `DuckDuckGoSearchAPIWrapper` personalizado a `DuckDuckGoSearchResults`. Por lo tanto, tienes mucho más control sobre los resultados de búsqueda.

```python
from langchain_community.utilities import DuckDuckGoSearchAPIWrapper

wrapper = DuckDuckGoSearchAPIWrapper(region="de-de", time="d", max_results=2)
```

```python
search = DuckDuckGoSearchResults(api_wrapper=wrapper, source="news")
```

```python
search.run("Obama")
```

```output
'[snippet: When Obama left office in January 2017, a CNN poll showed him with a 60% approval rating, landing him near the top of the list of presidential approval ratings upon leaving office., title: Opinion: The real reason Trump is attacking Obamacare | CNN, link: https://www.cnn.com/2023/12/04/opinions/trump-obamacare-obama-repeal-health-care-obeidallah/index.html], [snippet: Buchempfehlung von Barack Obama. Der gut zweistündige Netflix-Film basiert auf dem gleichnamigen Roman "Leave the World Behind" des hochgelobten US-Autors Rumaan Alam. 2020 landete er damit unter den Finalisten des "National Book Awards". In Deutschland ist das Buch, das auch Barack Obama auf seiner einflussreichen Lese-Empfehlungsliste hatte ..., title: Neu bei Netflix "Leave The World Behind": Kritik zum ... - Prisma, link: https://www.prisma.de/news/filme/Neu-bei-Netflix-Leave-The-World-Behind-Kritik-zum-ungewoehnlichen-Endzeit-Film-mit-Julia-Roberts,46563944]'
```
