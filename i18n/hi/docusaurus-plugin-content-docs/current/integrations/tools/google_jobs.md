---
translated: true
---

# गूगल नौकरियां

यह नोटबुक गूगल नौकरी उपकरण का उपयोग करके वर्तमान नौकरी पोस्टिंग को प्राप्त करने के बारे में चर्चा करता है।

सबसे पहले, आपको https://serpapi.com/users/sign-up पर एक `SerpApi कुंजी` कुंजी के लिए साइन अप करना होगा।

फिर आपको `google-search-results` को कमांड `pip install google-search-results` के साथ स्थापित करना होगा।

फिर आपको `SERPAPI_API_KEY` पर्यावरण चर को अपने `SerpApi कुंजी` पर सेट करना होगा।

यदि आपके पास कोई नहीं है, तो आप https://serpapi.com/users/sign-up पर एक मुफ्त खाता पंजीकृत कर सकते हैं और अपनी एपीआई कुंजी यहां प्राप्त कर सकते हैं: https://serpapi.com/manage-api-key

यदि आप conda environment का उपयोग कर रहे हैं, तो आप कर्नल में निम्नलिखित कमांडों का उपयोग करके सेट अप कर सकते हैं:
conda activate [your env name]
conda env confiv vars SERPAPI_API_KEY='[your serp api key]'

## उपकरण का उपयोग करें

```python
%pip install --upgrade --quiet  google-search-results
```

```output
Requirement already satisfied: google-search-results in /opt/anaconda3/envs/langchain/lib/python3.10/site-packages (2.4.2)
Requirement already satisfied: requests in /opt/anaconda3/envs/langchain/lib/python3.10/site-packages (from google-search-results) (2.31.0)
Requirement already satisfied: charset-normalizer<4,>=2 in /opt/anaconda3/envs/langchain/lib/python3.10/site-packages (from requests->google-search-results) (3.3.2)
Requirement already satisfied: idna<4,>=2.5 in /opt/anaconda3/envs/langchain/lib/python3.10/site-packages (from requests->google-search-results) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /opt/anaconda3/envs/langchain/lib/python3.10/site-packages (from requests->google-search-results) (2.1.0)
Requirement already satisfied: certifi>=2017.4.17 in /opt/anaconda3/envs/langchain/lib/python3.10/site-packages (from requests->google-search-results) (2023.11.17)
```

```python
import os

from langchain_community.tools.google_jobs import GoogleJobsQueryRun
from langchain_community.utilities.google_jobs import GoogleJobsAPIWrapper

os.environ["SERPAPI_API_KEY"] = "[your serpapi key]"
tool = GoogleJobsQueryRun(api_wrapper=GoogleJobsAPIWrapper())
```

```python
tool.run("Can I get an entry level job posting related to physics")
```

```output
"\n_______________________________________________\nJob Title: Applied Physicist (Experienced or Senior)\nCompany Name: Boeing\nLocation:   Huntington Beach, CA   \nDescription: Job Description\n\nAt Boeing, we innovate and collaborate to make the world a better place. From the seabed to outer space, you can contribute to work that matters with a company where diversity, equity and inclusion are shared values. We’re committed to fostering an environment for every teammate that’s welcoming, respectful and inclusive, with great opportunity for professional growth. Find your... future with us.\n\nWe are Boeing Research & Technology (BR&T): Boeing's global research and development team creating and implementing innovative technologies that make the impossible possible and enabling the future of aerospace. We are engineers and technicians, skilled scientists and bold innovators; Join us and put your passion, determination, and skill to work building the future!\n\nCome join a growing team harnessing emerging technology into innovative products and services. Boeing is at the forefront of re-imagining the future of the design, manufacture, and operation of aerospace platforms for commercial and government markets.\n\nThis position will sit in Huntington Beach, CA.\n\nPosition Responsibilities:\n• Develop and validate requirements for various complex communication, sensor, electronic warfare and other electromagnetic systems and components.\n• Develop and validate electromagnetic requirements for electrical\\electronic systems, mechanical systems, interconnects and structures.\n• Develop architectures to integrate complex systems and components into higher level systems and platforms.\n• Perform complicated trade studies, modeling, simulation and other forms of analysis to predict component, interconnects and system performance and to optimize design around established requirements.\n• Define and conducts critical tests of various kinds to validate performance of designs to requirements. Manage appropriate aspects of critical supplier and partner performance to ensure compliance to requirements.\n• Provide support to products throughout their lifecycle from manufacturing to customer use by providing guidance and support to resolve complex issues.\n• Support project management by providing coordinating development of work statement, budget, schedule and other required inputs and conducting appropriate reviews.\n• Generates major sections of proposals to support development of new business.\n• Works under minimal direction.\n\nApplied Physicist (Experienced or Senior), BR&T/Advanced Computing Technology – Candidates will apply their knowledge of quantum physics to build a comprehensive suite of capabilities in experimental quantum sensing or quantum networking. Successful candidates will have a deep understanding of both theory and laboratory practices in at least one of the following areas:\n• optical clocks\n• optical time transfer\n• optical frequency comb-based metrology\n• quantum network-based entanglement of quantum systems (e.g., atomic, ionic, or quantum dot systems)\n\nSuccessful candidates shall develop\n• A vibrant research and development program supported by both intramural and extramural funding\n• Write project proposals\n• Develop future product concepts\n• Assist with the integration of quantum technologies into future products and services for Boeing’s commercial and defense businesses\n\nThis position allows telecommuting. The selected candidate will be required to perform some work onsite at one of the listed location options.\n\nThis position requires the ability to obtain a U.S. Security Clearance for which the U.S. Government requires U.S. Citizenship. An interim and/or final U.S. Secret Clearance Post-Start is required.\n\nBasic Qualifications (Required Skills/Experience)\n• PhD in physics, chemistry, electrical engineering, or other field related to quantum sensing and/or quantum information science\n• Authored and published Research papers and projects (Academia or Professional)\n• University Studies and laboratory practice in one of the following areas: optical clocks, optical time transfer, atom interferometry, or quantum network-based entanglement of quantum systems (e.g., atomic, ionic, or quantum dot systems)\n\nPreferred Qualifications (Desired Skills/Experience)\n• 9+ years' related work experience or an equivalent combination of education and experience\n• Active U.S. security clearance\n\nTypical Education/Experience:\n\nExperienced: Education/experience typically acquired through advanced technical education from an accredited course of study in engineering, computer science, mathematics, physics or chemistry (e.g. Bachelor) and typically 9 or more years' related work experience or an equivalent combination of technical education and experience (e.g. PhD+4 years' related work experience, Master+7 years' related work experience). In the USA, ABET accreditation is the preferred, although not required, accreditation standard\n\nSenior: Education/experience typically acquired through advanced technical education from an accredited course of study in engineering, computer science, mathematics, physics or chemistry (e.g. Bachelor) and typically 14 or more years' related work experience or an equivalent combination of technical education and experience (e.g. PhD+9 years' related work experience, Master+12 years' related work experience). In the USA, ABET accreditation is the preferred, although not required, accreditation standard.\n\nRelocation: This position offers relocation based on candidate eligibility\n\nBoeing is a Drug Free Workplace where post offer applicants and employees are subject to testing for marijuana, cocaine, opioids, amphetamines, PCP, and alcohol when criteria is met as outlined in our policies.\n\nShift: This position is for first shift.\n\nAt Boeing, we strive to deliver a Total Rewards package that will attract, engage and retain the top talent. Elements of the Total Rewards package include competitive base pay and variable compensation opportunities.\n\nThe Boeing Company also provides eligible employees with an opportunity to enroll in a variety of benefit programs, generally including health insurance, flexible spending accounts, health savings accounts, retirement savings plans, life and disability insurance programs, and a number of programs that provide for both paid and unpaid time away from work.\n\nThe specific programs and options available to any given employee may vary depending on eligibility factors such as geographic location, date of hire, and the applicability of collective bargaining agreements.\n\nPlease note that the salary information shown below is a general guideline only. Salaries are based upon candidate experience and qualifications, as well as market and business considerations.\n\nSummary pay range Experienced: $126,000 – $171,000\n\nSummary pay range Senior: $155,000 - $210,00\n\nExport Control Requirements: U.S. Government Export Control Status: This position must meet export control compliance requirements. To meet export control compliance requirements, a “U.S. Person” as defined by 22 C.F.R. §120.15 is required. “U.S. Person” includes U.S. Citizen, lawful permanent resident, refugee, or asylee.\n\nExport Control Details: US based job, US Person required\n\nEqual Opportunity Employer:\n\nBoeing is an Equal Opportunity Employer. Employment decisions are made without regard to race, color, religion, national origin, gender, sexual orientation, gender identity, age, physical or mental disability, genetic factors, military/veteran status or other characteristics protected by law\n_______________________________________________\n\n"
```

# langchain के साथ इसका उपयोग करें

```python
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

OpenAI.api_key = os.environ["OPENAI_API_KEY"]
llm = OpenAI()
tools = load_tools(["google-jobs"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
agent.run("give me an entry level job posting related to physics")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should use a tool to search for job postings related to physics
Action: google_jobs
Action Input: entry level physics[0m
Observation: [36;1m[1;3m
_______________________________________________
Job Title: Entry-level Calibration Technician (great for new Physics or EE grads)
Company Name: Modis Engineering
Location:   Everett, WA
Description: An Electronics Calibration Technician Contract-to-Hire position is available in Everett, WA courtesy of Akkodis.

This is a great opportunity for Entry-level Physics, BSEET, BSEE, Mechatronics or other grads who like hands-on work. Or for a technician with 1-5 years of experience...

Shift : Evening Shift or Night Shift

Rate: $28 - $32/hour, D.O.E.

It is possible, with strong performance, of increasing your rate by $2/hour once position converts to Full Time/Salaried/Direct Hire position.
• **FULL TRAINING WILL BE PROVIDED***

Job Responsibilities include:

- Calibration and testing of fiber optic test equipment.

- Record data gathered during calibration.

- Identify out of tolerance conditions.

- Interact with other technicians, customer service reps and customers.

Qualifications:

- BS in Physics or Electrical Engineering -- OR -- - A.S. degree in electronics (or similar discipline) -- OR -- Electronics experience.

- Must possess good written and oral, communications skills.

- Basic circuit testing/troubleshooting experience from school lab work or elsewhere.

- Must have basic computer skills.

- Prior experience in calibration is a plus.

- Experience with fiber optics and metrology equipment a plus.

- This position does not involve troubleshooting as a repair tech though experience in this area is acceptable and helpful.

- This position does require a good work ethic and willingness to learn and succeed.

Equal Opportunity Employer/Veterans/Disabled

Benefit offerings include medical, dental, vision, FSA, HSA, and short-term and long term disability insurance, and 401K plan. It also includes a comprehensive paid time off program.

Disclaimer: These benefit offerings do not apply to client-recruited jobs and jobs which are direct hire to a client.

To read our Candidate Privacy Information Statement, which explains how we will use your information, please visit https://www.modis.com/en-us/candidate-privacy
_______________________________________________

[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: The entry-level job posting related to physics is for a Calibration Technician at Modis Engineering in Everett, WA. This job offers a competitive rate of $28 - $32/hour, and full training will be provided. Qualifications include a BS in Physics or Electrical Engineering, or A.S. degree in Electronics or similar discipline, and benefits include medical, dental, vision, and more.[0m

[1m> Finished chain.[0m
```

```output
'The entry-level job posting related to physics is for a Calibration Technician at Modis Engineering in Everett, WA. This job offers a competitive rate of $28 - $32/hour, and full training will be provided. Qualifications include a BS in Physics or Electrical Engineering, or A.S. degree in Electronics or similar discipline, and benefits include medical, dental, vision, and more.'
```
