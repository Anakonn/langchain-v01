---
translated: true
---

यह टेम्पलेट सुपाबेस के लिए प्राकृतिक भाषा संरचित क्वेरी करने की अनुमति देता है।

[सुपाबेस](https://supabase.com/docs) एक ओपन-सोर्स वैकल्पिक है जो [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) पर बनाया गया है।

यह [pgvector](https://github.com/pgvector/pgvector) का उपयोग करता है ताकि आपके टेबल में एम्बेडिंग को संग्रहीत किया जा सके।

## वातावरण सेटअप

`OPENAI_API_KEY` पर्यावरण चर को सेट करें ताकि OpenAI मॉडल का उपयोग किया जा सके।

अपना `OPENAI_API_KEY` प्राप्त करने के लिए, अपने OpenAI खाते पर [API कुंजियाँ](https://platform.openai.com/account/api-keys) पर जाएं और एक नया गोपनीय कुंजी बनाएं।

अपना `SUPABASE_URL` और `SUPABASE_SERVICE_KEY` प्राप्त करने के लिए, अपने Supabase प्रोजेक्ट के [API सेटिंग्स](https://supabase.com/dashboard/project/_/settings/api) पर जाएं।

- `SUPABASE_URL` प्रोजेक्ट URL के बराबर है
- `SUPABASE_SERVICE_KEY` `service_role` API कुंजी के बराबर है

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## सुपाबेस डेटाबेस सेटअप

अगर आप पहले से ही सुपाबेस डेटाबेस सेट नहीं कर चुके हैं, तो इन चरणों का उपयोग करें।

1. https://database.new पर जाकर अपना Supabase डेटाबेस प्रोविजन करें।
2. स्टूडियो में, [SQL एडिटर](https://supabase.com/dashboard/project/_/sql/new) पर जाएं और अपने डेटाबेस को वेक्टर स्टोर के रूप में सेट करने के लिए निम्नलिखित स्क्रिप्ट चलाएं:

   ```sql
   -- एम्बेडिंग वेक्टर के साथ काम करने के लिए pgvector एक्सटेंशन को सक्षम करें
   create extension if not exists vector;

   -- आपके दस्तावेजों को संग्रहीत करने के लिए एक टेबल बनाएं
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContent के बराबर
       metadata jsonb, -- Document.metadata के बराबर
       embedding vector (1536) -- OpenAI एम्बेडिंग के लिए 1536 काम करता है, आवश्यकतानुसार बदलें
     );

   -- दस्तावेजों को खोजने के लिए एक फ़ंक्शन बनाएं
   create function match_documents (
     query_embedding vector (1536),
     filter jsonb default '{}'
   ) returns table (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   ) language plpgsql as $$
   #variable_conflict use_column
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding;
   end;
   $$;
   ```

## उपयोग

इस पैकेज का उपयोग करने के लिए, पहले LangChain CLI स्थापित करें:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाएं और इस पैकेज को एकमात्र पैकेज के रूप में स्थापित करें:

```shell
langchain app new my-app --package self-query-supabase
```

किसी मौजूदा प्रोजेक्ट में जोड़ने के लिए, निम्नलिखित चलाएं:

```shell
langchain app add self-query-supabase
```

अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from self_query_supabase.chain import chain as self_query_supabase_chain

add_routes(app, self_query_supabase_chain, path="/self-query-supabase")
```

(वैकल्पिक) यदि आपके पास LangSmith का एक्सेस है, तो LangChain अनुप्रयोगों को ट्रेस, मॉनिटर और डीबग करने में मदद करने के लिए इसे कॉन्फ़िगर करें। यदि आपके पास एक्सेस नहीं है, तो इस खंड को छोड़ दें।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

यदि आप इस निर्देशिका के अंदर हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से एक FastAPI ऐप को चलाना शुरू करेगा।

आप सभी टेम्पलेट को [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर देख सकते हैं
[http://127.0.0.1:8000/self-query-supabase/playground](http://127.0.0.1:8000/self-query-supabase/playground) पर प्लेग्राउंड तक पहुंच

कोड से टेम्पलेट का उपयोग करने के लिए:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-supabase")
```

TODO: सुपाबेस डेटाबेस सेट करने और पैकेज स्थापित करने के निर्देश।
