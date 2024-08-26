---
translated: true
---

# 위키데이터

>[위키데이터](https://wikidata.org/)는 사람과 기계가 모두 읽고 편집할 수 있는 무료 오픈 지식베이스입니다. 위키데이터는 세계에서 가장 큰 오픈 지식베이스 중 하나입니다.

먼저 `wikibase-rest-api-client`와 `mediawikiapi` Python 패키지를 설치해야 합니다.

```python
%pip install --upgrade --quiet  wikibase-rest-api-client mediawikiapi
```

```python
from langchain_community.tools.wikidata.tool import WikidataAPIWrapper, WikidataQueryRun

wikidata = WikidataQueryRun(api_wrapper=WikidataAPIWrapper())
```

```python
print(wikidata.run("Alan Turing"))
```

```output
Result Q7251:
Label: Alan Turing
Description: English computer scientist (1912–1954)
Aliases: Alan M. Turing, Alan Mathieson Turing, Turing, Alan Mathison Turing
instance of: human
country of citizenship: United Kingdom
occupation: computer scientist, mathematician, university teacher, cryptographer, logician, statistician, marathon runner, artificial intelligence researcher
sex or gender: male
date of birth: 1912-06-23
date of death: 1954-06-07
sport: athletics
place of birth: Maida Vale, Warrington Lodge
educated at: King's College, Princeton University, Sherborne School, Hazlehurst Community Primary School
employer: Victoria University of Manchester, Government Communications Headquarters, University of Cambridge, National Physical Laboratory
place of death: Wilmslow
field of work: cryptanalysis, computer science, mathematics, logic, cryptography
cause of death: cyanide poisoning
notable work: On Computable Numbers, with an Application to the Entscheidungsproblem, Computing Machinery and Intelligence, Intelligent Machinery, halting problem, Turing machine, Turing test, Turing completeness, Church-Turing thesis, universal Turing machine, Symmetric Turing machine, non-deterministic Turing machine, Bombe, probabilistic Turing machine, Turing degree
religion or worldview: atheism
mother: Ethel Sara Stoney
father: Julius Mathison Turing
doctoral student: Robin Gandy, Beatrice Helen Worsley
student: Robin Gandy

Result Q28846012:
Label: Alan Turing
Description: fictional analogon of Alan Turing (1912-1954)
Aliases: Alan Mathison Turing
instance of: fictional human
sex or gender: male
```
