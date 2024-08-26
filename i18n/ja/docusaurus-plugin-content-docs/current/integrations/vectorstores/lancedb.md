---
translated: true
---

# LanceDB

>[LanceDB](https://lancedb.com/)は、永続的なストレージを備えたベクトル検索用のオープンソースデータベースで、エンベディングの検索、フィルタリング、管理を大幅に簡素化します。完全にオープンソースです。

このノートブックでは、Lance データ形式に基づく `LanceDB` ベクトルデータベースの機能の使用方法を示します。

```python
! pip install -U langchain-openai
```

```python
! pip install lancedb
```

OpenAIEmbeddingsを使用したいので、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.document_loaders import TextLoader
from langchain.vectorstores import LanceDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter().split_documents(documents)
embeddings = OpenAIEmbeddings()
```

##### LanceDB クラウドの場合、ベクトルストアは次のように呼び出すことができます:

```python
db_url = "db://lang_test" # url of db you created
api_key = "xxxxx" # your API key
region="us-east-1-dev"  # your selected region

vector_store = LanceDB(
    uri=db_url,
    api_key=api_key,
    region=region,
    embedding=embeddings,
    table_name='langchain_test'
    )
```

```python
docsearch = LanceDB.from_documents(documents, embeddings)
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

さらに、テーブルを探索するには、dfにロードするか、csvファイルに保存することができます:

```python
tbl = docsearch.get_table()
print("tbl:", tbl)
pd_df = tbl.to_pandas()
# pd_df.to_csv("docsearch.csv", index=False)

# you can also create a new vector store object using an older connection object:
vector_store = LanceDB(connection=tbl, embedding=embeddings)
```

```python
print(docs[0].page_content)
```

```output
They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

So let’s not abandon our streets. Or choose between safety and equal justice.

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable.

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers.

That’s why the American Rescue Plan provided $350 Billion that cities, states, and counties can use to hire more police and invest in proven strategies like community violence interruption—trusted messengers breaking the cycle of violence and trauma and giving young people hope.

We should all agree: The answer is not to Defund the police. The answer is to FUND the police with the resources and training they need to protect our communities.

I ask Democrats and Republicans alike: Pass my budget and keep our neighborhoods safe.

And I will keep doing everything in my power to crack down on gun trafficking and ghost guns you can buy online and make at home—they have no serial numbers and can’t be traced.

And I ask Congress to pass proven measures to reduce gun violence. Pass universal background checks. Why should anyone on a terrorist list be able to purchase a weapon?

Ban assault weapons and high-capacity magazines.

Repeal the liability shield that makes gun manufacturers the only industry in America that can’t be sued.

These laws don’t infringe on the Second Amendment. They save lives.

The most fundamental right in America is the right to vote – and to have it counted. And it’s under assault.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.
```

```python
print(docs[0].page_content)
```

```output
They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.

So let’s not abandon our streets. Or choose between safety and equal justice.

Let’s come together to protect our communities, restore trust, and hold law enforcement accountable.

That’s why the Justice Department required body cameras, banned chokeholds, and restricted no-knock warrants for its officers.

That’s why the American Rescue Plan provided $350 Billion that cities, states, and counties can use to hire more police and invest in proven strategies like community violence interruption—trusted messengers breaking the cycle of violence and trauma and giving young people hope.

We should all agree: The answer is not to Defund the police. The answer is to FUND the police with the resources and training they need to protect our communities.

I ask Democrats and Republicans alike: Pass my budget and keep our neighborhoods safe.

And I will keep doing everything in my power to crack down on gun trafficking and ghost guns you can buy online and make at home—they have no serial numbers and can’t be traced.

And I ask Congress to pass proven measures to reduce gun violence. Pass universal background checks. Why should anyone on a terrorist list be able to purchase a weapon?

Ban assault weapons and high-capacity magazines.

Repeal the liability shield that makes gun manufacturers the only industry in America that can’t be sued.

These laws don’t infringe on the Second Amendment. They save lives.

The most fundamental right in America is the right to vote – and to have it counted. And it’s under assault.

In state after state, new laws have been passed, not only to suppress the vote, but to subvert entire elections.

We cannot let this happen.

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.
```

```python
print(docs[0].metadata)
```
