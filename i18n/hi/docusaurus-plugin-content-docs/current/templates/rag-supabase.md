---
translated: true
---

यह टेम्पलेट Supabase के साथ RAG को करता है।

[Supabase](https://supabase.com/docs) एक ओपन-सोर्स Firebase विकल्प है। यह [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL) पर निर्मित है, जो एक मुक्त और ओपन-सोर्स रिलेशनल डेटाबेस मैनेजमेंट सिस्टम (RDBMS) है और [pgvector](https://github.com/pgvector/pgvector) का उपयोग करता है ताकि आप अपने टेबल्स में embeddings को स्टोर कर सकें।

## वातावरण सेटअप

OpenAI मॉडल्स तक पहुंच प्राप्त करने के लिए `OPENAI_API_KEY` पर्यावरण चर सेट करें।

अपना `OPENAI_API_KEY` प्राप्त करने के लिए, अपने OpenAI खाते पर [API keys](https://platform.openai.com/account/api-keys) पर जाएं और एक नया गोपनीय कुंजी बनाएं।

अपना `SUPABASE_URL` और `SUPABASE_SERVICE_KEY` प्राप्त करने के लिए, अपने Supabase प्रोजेक्ट के [API settings](https://supabase.com/dashboard/project/_/settings/api) पर जाएं।

- `SUPABASE_URL` प्रोजेक्ट URL के बराबर है
- `SUPABASE_SERVICE_KEY` `service_role` API कुंजी के बराबर है

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Supabase डेटाबेस सेटअप

अगर आप पहले से ही अपना Supabase डेटाबेस सेट नहीं कर चुके हैं, तो इन चरणों का उपयोग करें।

1. https://database.new पर जाकर अपना Supabase डेटाबेस प्रोविजन करें।
2. स्टूडियो में, [SQL editor](https://supabase.com/dashboard/project/_/sql/new) पर जाएं और अपने डेटाबेस को vector स्टोर के रूप में सेट करने के लिए निम्नलिखित स्क्रिप्ट चलाएं:

   ```sql
   -- pgvector एक्सटेंशन को enable करें ताकि embedding vectors के साथ काम कर सकें
   create extension if not exists vector;

   -- अपने दस्तावेजों को स्टोर करने के लिए एक टेबल बनाएं
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContent के बराबर
       metadata jsonb, -- Document.metadata के बराबर
       embedding vector (1536) -- OpenAI embeddings के लिए 1536 काम करता है, आवश्यकतानुसार बदलें
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

## वातावरण चर सेटअप

हम [`SupabaseVectorStore`](https://python.langchain.com/docs/integrations/vectorstores/supabase) और [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai) का उपयोग कर रहे हैं, इसलिए हमें उनके API कुंजी लोड करने की आवश्यकता है।

## उपयोग

पहले, LangChain CLI इंस्टॉल करें:

```shell
pip install -U langchain-cli
```

एक नया LangChain प्रोजेक्ट बनाने और इसे एकमात्र पैकेज के रूप में इंस्टॉल करने के लिए, आप ऐसा कर सकते हैं:

```shell
langchain app new my-app --package rag-supabase
```

और अगर आप किसी मौजूदा प्रोजेक्ट में इसे जोड़ना चाहते हैं, तो आप बस यह चला सकते हैं:

```shell
langchain app add rag-supabase
```

और अपने `server.py` फ़ाइल में निम्नलिखित कोड जोड़ें:

```python
from rag_supabase.chain import chain as rag_supabase_chain

add_routes(app, rag_supabase_chain, path="/rag-supabase")
```

(वैकल्पिक) अब LangSmith कॉन्फ़िगर करते हैं।
LangSmith हमें LangChain एप्लिकेशन को ट्रेस, मॉनिटर और डीबग करने में मदद करेगा।
आप [यहां](https://smith.langchain.com/) LangSmith के लिए साइन अप कर सकते हैं।
अगर आपके पास पहुंच नहीं है, तो आप इस खंड को छोड़ सकते हैं।

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

अगर आप इसी निर्देशिका में हैं, तो आप सीधे एक LangServe इंस्टेंस चला सकते हैं:

```shell
langchain serve
```

यह FastAPI ऐप को चालू करेगा और सर्वर [http://localhost:8000](http://localhost:8000) पर स्थानीय रूप से चल रहा होगा।

हम [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) पर सभी टेम्पलेट देख सकते हैं।
हम [http://127.0.0.1:8000/rag-supabase/playground](http://127.0.0.1:8000/rag-supabase/playground) पर प्लेग्राउंड तक पहुंच सकते हैं।

हम कोड से टेम्पलेट तक पहुंच सकते हैं:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-supabase")
```

TODO: Supabase डेटाबेस सेटअप के बारे में विवरण जोड़ें
