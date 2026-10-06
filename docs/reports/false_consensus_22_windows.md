# Full Window Inspection for 22 Apparent False Consensus Facts

**Date:** 2026-10-06  
**Scope:** All 22 facts where Tesseract and Windows OCR extracted identical erroneous candidates under localized span-anchored candidate selection.  
**Window Width:** ±120 characters centered at the anchor keywords location.  

---

### 1. Fact ID #37 — Page: sankalia_p025-025 (Class B, date)

- **Ground Truth Value:** 1947
- **Fact Description:** Bibliography publication year item 66
- **Extracted Candidate:** 10,000 (Tesseract) | 10,000 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (10,000), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Scorer picked adjacent 10,000 because anchor center fell near "brain surgery". Note: while Tesseract cleanly transcribed the date as `14.6.1947`, Windows OCR corrupted that specific token as `14.6.!917` (though it also transcribed the item year `66. 1947` earlier in the window). Clean target presence holds cleanly for Tesseract and only approximately for Windows.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
e from the Sabarmati Valley,” Journal al the University of Bombay, Vol. TV, Pr IV, (Jan. 1946}, ipp: 810,  “They used brain surgery 10,000 years ago"”, Continental Daily Mail, Paris, 14.6.1947.  “Life in the Stone Age in India". The Hindu, 
```
**GT in Tesseract Window:** PRESENT — Continental Daily Mail, Paris, 14.6.[1947]

#### Windows OCR Anchor Window (±120 chars)
```text
 the Sabarmati Valley," Journal oi the Unrrersity oi Bombay, Vol. TV. Pt. TV, (Jan, 1946). jpp. 8-10. 66. 1947 ••ney• brain surgery 10.000 years ago". Continental Daily Mail, 14.6.!917. 67. "Life in the Age in trxiia••. The sept. 1947. 68. 
```
**GT in Windows Window:** PRESENT (approximate / split) — 66. [1947] at start; [14.6.!917] at end (OCR error)


---

### 2. Fact ID #51 — Page: sankalia_p150-150 (Class B, measurement)

- **Ground Truth Value:** 6 m
- **Fact Description:** Depth of yellow kankary silt below modern bed
- **Extracted Candidate:** 6 (Tesseract) | 6 (Windows OCR)
- **Audited Category:** UNIT_LOST
- **Router Auto-Accept Behavior:** Both engines emit identical string (6), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "6 m" cleanly. Scorer stripped unit "m" and extracted bare number "6". Not a transcription error.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
yhum(hdim‘wmiﬁumbullndmmﬁll  are common.  Further, the bore-hole data collected at Belan Bri site Indicates that the yellow kankary silt of the Pleistocene i resting over the rock at & depth of about 6 m  i  i iiht iy  i B : i i 17  g i : :
```
**GT in Tesseract Window:** PRESENT — depth of about [6 m]

#### Windows OCR Anchor Window (±120 chars)
```text
nd fill siructurrg are common, Further, the bore-hole data collected at nearby Belan Bridge Site- indicates that the yellow kankaty silt ot the Pleistocene age directly resting over thc rock at g depth of ab)ut 6 m below the IOVI 01 the Bel
```
**GT in Windows Window:** PRESENT — depth of ab)ut [6 m] below

---

### 3. Fact ID #55 — Page: sankalia_p210-210 (Class B, date)

- **Ground Truth Value:** 415 A.D.
- **Fact Description:** Death year of Rudrasena II
- **Extracted Candidate:** 5 (Tesseract) | 5 (Windows OCR)
- **Audited Category:** AGREED_WRONG_CANDIDATE_GT_ABSENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (5), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Anchor context words located narrative discussion of a 5-year reign length. The absolute date 415 A.D. is absent from this paragraph.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
NEALOGY AND CHRONOLOGY  Rudrasens 11 is assigned a period of 5 yeans by Mirashi with the view that #t the time of his death his elder son Divikarasena was # minor. Similar was the case with Pravarasena 11 and his son of the Basim branch, bu
```
**GT in Tesseract Window:** ABSENT

#### Windows OCR Anchor Window (±120 chars)
```text
lso have ruled a period, Rudra:æna II is assigned a peruxl oi 5 Fars by Mitashi with the view that at the time of his death his elder son I)iväkatasetüi was a minor. Similar wa» the with Prasarasena and his; son ot the Basim branch. but tor
```
**GT in Windows Window:** ABSENT

---

### 4. Fact ID #56 — Page: sankalia_p210-210 (Class B, date)

- **Ground Truth Value:** 428 A.D.
- **Fact Description:** Death year of Divakarasena
- **Extracted Candidate:** 5 (Tesseract) | 5 (Windows OCR)
- **Audited Category:** AGREED_WRONG_CANDIDATE_GT_ABSENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (5), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Anchor context words located same narrative paragraph as #55. GT 428 A.D. is absent from the window.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
NEALOGY AND CHRONOLOGY  Rudrasens 11 is assigned a period of 5 yeans by Mirashi with the view that #t the time of his death his elder son Divikarasena was # minor. Similar was the case with Pravarasena 11 and his son of the Basim branch, bu
```
**GT in Tesseract Window:** ABSENT

#### Windows OCR Anchor Window (±120 chars)
```text
lso have ruled a period, Rudra:æna II is assigned a peruxl oi 5 Fars by Mitashi with the view that at the time of his death his elder son I)iväkatasetüi was a minor. Similar wa» the with Prasarasena and his; son ot the Basim branch. but tor
```
**GT in Windows Window:** ABSENT

---

### 5. Fact ID #65 — Page: chakrabarti_p015-015 (Class A, date)

- **Ground Truth Value:** 1545-48
- **Fact Description:** Viceroy of Goa term
- **Extracted Candidate:** 1538 (Tesseract) | 1538 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1538), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "1545-48" verbatim. Scorer picked arrival date 1538 because anchor center was placed closer to arrival clause.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
ceived fuller treatment at the hands of another Portuguese, Dom Joao de Castro who came to India in 1538 and was the viceroy of Goa during 1545-48. His attitude was one of unabashed admiration. Regarding Elephanta he writes:  All the works,
```
**GT in Tesseract Window:** PRESENT — who came to India in 1538 and was the viceroy of Goa during [1545-48]

#### Windows OCR Anchor Window (±120 chars)
```text
ri received fuller treatment at the hands of another Portuguese, Dom Joao de Castro who to India in 1538 and was the viceroy ofGoa during 1545-48. His attitude was one ofunabashed admiration. Elephanta he writes: All the works, images, colu
```
**GT in Windows Window:** PRESENT — who to India in 1538 and was the viceroy ofGoa during [1545-48]

---

### 6. Fact ID #73 — Page: chakrabarti_p018-018 (Class A, date)

- **Ground Truth Value:** 1712
- **Fact Description:** Captain Pyke journal date in Bombay harbour
- **Extracted Candidate:** 323-32 (Tesseract) | 323-32 (Windows OCR)
- **Audited Category:** AGREED_WRONG_CANDIDATE_GT_ABSENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (323-32), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Anchor context matched journal citation heading. The letter date 1712 appears on the next line of the page text (`...in Bombay harbour [in 1712]`) and is cut off by the ±120 character window limit; this is a window-width boundary limit of the scorer, not an OCR engine failure.


#### Tesseract 5.4 Anchor Window (±120 chars)
```text
in Arckaeologia, 7 (1785): 323-32 under the following heading:  Account of a curious pagoda near Bombay, drawn up by Captain Pyke, who was afterwards governor of St. Helena. It is dated from on board the stringer East-Indiaman in Bombay har
```
**GT in Tesseract Window:** ABSENT

#### Windows OCR Anchor Window (±120 chars)
```text
m in Archaeologia, 7 (1785): 323-32 under the following heading: Account Ofa curious pagoda near Bombay, drawn up by Captain Pyke, who was afterwards governor of St. Helena. It is dated from on board the stringer East-Indiaman in Bombay har
```
**GT in Windows Window:** ABSENT

---

### 7. Fact ID #84 — Page: chakrabarti_p021-021 (Class A, date)

- **Ground Truth Value:** 1780
- **Fact Description:** Voyage en Arabie publication in Amsterdam
- **Extracted Candidate:** 1763 (Tesseract) | 1763 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1763), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "in 1780" verbatim. Scorer picked arrival date 1763 because anchor keywords centered near Bombay arrival.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
e service of the king of Denmark, came to Bombay from Mokha in Arabia on 13 September 1763. The second volume of his Voyage en Arabie and en d’autres Pays Circonvoisins published in Amsterdam in 1780 contains nine illustrations of Elephanta
```
**GT in Tesseract Window:** PRESENT — Arabia on 13 September 1763... published in Amsterdam in [1780]

#### Windows OCR Anchor Window (±120 chars)
```text
e service of the king of Denmark, came to Bombay from Mokha in Arabia on 13 September 1763. The second volume of his Voyage en Arabie and en d'autres Pays Circonvoisins published in Amsterdaxn in 1780 contains nine illustrations of Elephant
```
**GT in Windows Window:** PRESENT — Arabia on 13 September 1763... published in Amsterdaxn in [1780]

---

### 8. Fact ID #93 — Page: chakrabarti_p215-215 (Class A, measurement)

- **Ground Truth Value:** 40 miles
- **Fact Description:** Distance north-west of Gwadar in miles
- **Extracted Candidate:** 40 (Tesseract) | 40 (Windows OCR)
- **Audited Category:** UNIT_LOST
- **Router Auto-Accept Behavior:** Both engines emit identical string (40), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "40 miles" verbatim. Scorer candidate normalizer dropped the unit "miles" and extracted bare "40".

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
agendor what must be considered Harappan material now.  Amongst the specimens on the table from Sutkagendor, 40 miles north- west of Gwadar, are some very well shaped flint knives, precisely such as we might expect to have been split off fr
```
**GT in Tesseract Window:** PRESENT — Sutkagendor, [40 miles] north- west of Gwadar

#### Windows OCR Anchor Window (±120 chars)
```text
tkagendorwhat must be considered Harappan material now. Amongst the specimens on the table from Sutkagendor, 40 miles north- west ofGwadar, are some very well shaped flint knives, precisely such as we might expect to have been split off fro
```
**GT in Windows Window:** PRESENT — Sutkagendor, [40 miles] north- west ofGwadar

---

### 9. Fact ID #95 — Page: chakrabarti_p215-215 (Class A, date)

- **Ground Truth Value:** 1927
- **Fact Description:** Panchanan Mitra second edition year
- **Extracted Candidate:** 1923 (Tesseract) | 1923 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1923), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "second edition in 1927" verbatim. Scorer picked 1923 because anchor centered on book title.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
lithic discoveries continued to be made till the 1920s but the most important publication of the period was Panchanan Mitra’s Prehistoric India which was first published in 1923 but underwent a second edition in 1927. This was very much a g
```
**GT in Tesseract Window:** PRESENT — first published in 1923 but underwent a second edition in [1927]

#### Windows OCR Anchor Window (±120 chars)
```text
lithic discoveries continued to be made till the 1920s but the most important publication of the period was Panchanan Mitra's Prehistoric India which was first published in 1923 but underwent a second edition in 1927. This was very much a g
```
**GT in Windows Window:** PRESENT — first published in 1923 but underwent a second edition in [1927]

---

### 10. Fact ID #97 — Page: rajan_p019-019 (Class A, date)

- **Ground Truth Value:** 5199 BC
- **Fact Description:** Pope Clement VIII creation date
- **Extracted Candidate:** 3700 BC (Tesseract) | 3700 BC (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (3700 BC), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "5199 BC" verbatim. Scorer picked adjacent Rabbinical estimate 3700 BC due to window center position.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
he world was very recent. Rabbinical authorities estimated that the world had been created about 3700 BC, while Pope Clement VIII dated the creation to 5199 BC and ‘finally the 17" cen Archbishop James Ussher was to set it at 4004 BC. They 
```
**GT in Tesseract Window:** PRESENT — created about 3700 BC, while Pope Clement VIII dated the creation to [5199 BC]

#### Windows OCR Anchor Window (±120 chars)
```text
e world was very recent. Rabbinical authorities estimated that the vvorld had been created about 3700 BC, while Pope Clement VIII dated the creation to 5199 BC and finally the 1 7th century Archbishop James Ussher was to set it at 4004 BC. 
```
**GT in Windows Window:** PRESENT — created about 3700 BC, while Pope Clement VIII dated the creation to [5199 BC]

---

### 11. Fact ID #117 — Page: rajan_p022-022 (Class A, date)

- **Ground Truth Value:** 1816
- **Fact Description:** Thomsen Royal Commission invitation year
- **Extracted Candidate:** 1788-1865 (Tesseract) | 1788-1865 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1788-1865), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "in 1816" verbatim. Scorer picked biographical lifespan 1788-1865 immediately adjacent to scholar name.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
igin of the human led to the hitherto unknown depths of human history.  The Three Age System  The Danish scholar C.J.Thomsen (1788-1865) was invited in 1816 by the Danish Royal Commission for the Preservation and  . Collection of Antiquitie
```
**GT in Tesseract Window:** PRESENT — C.J.Thomsen (1788-1865) was invited in [1816] by the Danish Royal Commission

#### Windows OCR Anchor Window (±120 chars)
```text
origin of the human led to the hitherto unknown depths of human history. The Three Age System The Danish scholar C.J.Thomsen (1788-1865) was invited in 1816 by the Danish Royal Commission for the Preservation and Collection of Antiquities t
```
**GT in Windows Window:** PRESENT — C.J.Thomsen (1788-1865) was invited in [1816] by the Danish Royal Commission

---

### 12. Fact ID #119 — Page: rajan_p022-022 (Class A, date)

- **Ground Truth Value:** 1839
- **Fact Description:** Ledetraad publication year
- **Extracted Candidate:** 1819 (Tesseract) | 1819 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1819), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "appeared only in 1839" verbatim. Scorer picked opening year 1819 closer to start of clause.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
rial within the specific period. Though his arrangements were opened to the public as early as 1819, his guide book Ledetraad til Nordisk Oldkyndighed (Guide Book to Seandinavian Antiquity) appeared only in 1839 which later appeared in Engl
```
**GT in Tesseract Window:** PRESENT — public as early as 1819, his guide book... appeared only in [1839]

#### Windows OCR Anchor Window (±120 chars)
```text
rial within the specific period. Though his arrangements were opened to the public as early as 1819, his guide book Ledetraad til Nordisk Oldkyndighed (Guide Book to Scandinavian Antiquity) appeared only in 1839 which later appeared in Engl
```
**GT in Windows Window:** PRESENT — public as early as 1819, his guide book... appeared only in [1839]

---

### 13. Fact ID #124 — Page: rajan_p023-023 (Class A, date)

- **Ground Truth Value:** 1820-1903
- **Fact Description:** Herbert Spencer lifespan dates
- **Extracted Candidate:** 1859 (Tesseract) | 1859 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1859), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "(1820-1903)" verbatim. Scorer picked Darwin publication year 1859.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
 Charles Lyell’s (1797-1875) Principles of Geology, Charles Darwins’s On the Origin of Species published in 1859 and Herbert Spencer’s (1820-1903) evolutionary approach to scientific and philosophical problems revolutionised the thinking of
```
**GT in Tesseract Window:** PRESENT — Origin of Species published in 1859 and Herbert Spencer’s ([1820-1903]) evolutionary approach

#### Windows OCR Anchor Window (±120 chars)
```text
 Charles Lyell's (1797-1875) Principles of Geology, Charles Darwins's On lhe Origin of Species published in 1859 and Herbert Spencer's ( 1820-1903) evolutionary approach to scientific and philosophical problems revolutionised the thinking o
```
**GT in Windows Window:** PRESENT — Origin of Species published in 1859 and Herbert Spencer's ( [1820-1903]) evolutionary approach

---

### 14. Fact ID #135 — Page: rajan_p024-024 (Class A, date)

- **Ground Truth Value:** 1870
- **Fact Description:** Origin of Civilisation publication year
- **Extracted Candidate:** 1865 (Tesseract) | 1865 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1865), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "(1870)" verbatim. Scorer picked first book year 1865.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
imes, as Hlustrated by Ancient Remains, and the Manners and Customs of Modern Savages (1865) and the second book The Origin of Cuvilisation and the Primitive Condition of Man (1870) went through several editions. He advocated that as a resu
```
**GT in Tesseract Window:** PRESENT — Modern Savages (1865) and the second book The Origin of Civilisation... ([1870]) went

#### Windows OCR Anchor Window (±120 chars)
```text
mes. as Illustrated by Ancient Remains, and the Manners and Customs of Modern Savages (1865) and the second book The Origin of Civilisation and the Primitive Condition of Man (1870) went through several editions. He advocated that as a resu
```
**GT in Windows Window:** PRESENT — Modern Savages (1865) and the second book The Origin of Civilisation... ([1870]) went

---

### 15. Fact ID #139 — Page: rajan_p025-025 (Class A, date)

- **Ground Truth Value:** 1542
- **Fact Description:** Arrival in Goa year
- **Extracted Candidate:** 1506-1552 (Tesseract) | 1506-1552 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (1506-1552), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "arrived in Goa in 1542" verbatim. Scorer picked lifespan dates 1506-1552 adjacent to Xavier name.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
t the existence of Sanskrit from the correspondence of the first Jesuit in India, St Francis Xavier (1506-1552), who arrived in Goa in 1542, In a letter written in 1544, he quoted the Sanskrit invocation Om Srii naraina nama and translated 
```
**GT in Tesseract Window:** PRESENT — St Francis Xavier (1506-1552), who arrived in Goa in [1542], In a letter

#### Windows OCR Anchor Window (±120 chars)
```text
t the existence of Sanskrit from the correspondence of the first Jesuit in India, St Francis Xavier (1506-1552), who arrived in Goa in 1542. In a letter written in 1544, he quoted the Sanskrit invocation Om Srii naraina nama and translated 
```
**GT in Windows Window:** PRESENT — St Francis Xavier (1506-1552), who arrived in Goa in [1542]. In a letter

---

### 16. Fact ID #143 — Page: rajan_p025-025 (Class A, date)

- **Ground Truth Value:** 1631 to 1641
- **Fact Description:** Pulicat chaplain settlement date range
- **Extracted Candidate:** 1631 (Tesseract) | 1631 (Windows OCR)
- **Audited Category:** PARTIAL_READ
- **Router Auto-Accept Behavior:** Both engines emit identical string (1631), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "from 1631 to 1641" verbatim. Single-number candidate extractor captured only initial date 1631.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
n 1606, is acknowledged as the first European Sanskrit scholar. Abraham Roger, a chaplain at the Dutch settlement of Pulicat in south India from 1631 to 1641 translated some of the proverbs of poet Bhartrhari into Dutch and thereby introduc
```
**GT in Tesseract Window:** PRESENT — settlement of Pulicat in south India [from 1631 to 1641] translated

#### Windows OCR Anchor Window (±120 chars)
```text
n 1606, is acknowledged as the first European Sanskrit scholar. Abraham Roger, a chaplain at the Dutch settlement of Pulicat in south India from 1631 to 1641 translated some of the proverbs of poet Bhartrhari into Dutch and thereby introduc
```
**GT in Windows Window:** PRESENT — settlement of Pulicat in south India [from 1631 to 1641] translated

---

### 17. Fact ID #144 — Page: rajan_p050-050 (Class A, date)

- **Ground Truth Value:** 1956:81
- **Fact Description:** Mortimer Wheeler citation year and page
- **Extracted Candidate:** 1956 (Tesseract) | 1956 (Windows OCR)
- **Audited Category:** BIBLIO_CITATION_REJECTION
- **Router Auto-Accept Behavior:** Both engines emit identical string (1956), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed citation "(1956:81)" verbatim. The position picker seized year 1956. Under Step 4 Rule 2, parenthetical author-date-page citations are non-finding noise and must be rejected (`REJECTED_NON_FINDING`). In the benchmark denominator, this relabels #144 from a partial range truncation to a bibliographical citation rejection, reducing partial compound reads from 2 to 1 (1.25%).

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
logical excavation remains with the archaeologist who has a flexibility and open-mindedness in his approach. As Sir Mortimer Wheeler (1956:81) said “The experienced excavator, who thinks before digs, succeeds in reaching his objective in a 
```
**GT in Tesseract Window:** PRESENT — Sir Mortimer Wheeler ([1956:81]) said “The experienced excavator

#### Windows OCR Anchor Window (±120 chars)
```text
logical excavation remains with the archaeologist who has a flexibility and open-mindedness in his approach. As Sir Mortimer Wheeler (1956:81) said "The experienced excavator, who thinks before digs, succeeds in reaching his objective in a 
```
**GT in Windows Window:** PRESENT — Sir Mortimer Wheeler ([1956:81]) said "The experienced excavator

---

### 18. Fact ID #148 — Page: rajan_p075-075 (Class A, date)

- **Ground Truth Value:** 1952
- **Fact Description:** Beginning in Archaeology publication year
- **Extracted Candidate:** 1954 (Tesseract) | 1954 (Windows OCR)
- **Audited Category:** AMBIGUOUS_MULTI_CANDIDATE
- **Router Auto-Accept Behavior:** Both engines emit identical string (1954), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both 1954 and 1952 appear in the same sentence (`Wheeler’s Archaeology from the Earth (1954) and Kenyon's Beginning in Archaeology (1952)`). The ground truth sought Kenyon's publication year (1952), but the position picker grabbed Wheeler's year (1954). Under Step 4 Spec §3.4, when two valid candidates of the same dimension occur in a single clausal segment, this is an `AMBIGUOUS_MULTI_CANDIDATE` condition that must be routed to the human verification queue for disambiguation.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
numbering of layers. These concepts have been expressed in Wheeler’s Archaeology from the Earth (1954) and Kenyon's Beginning in Archaeology (1952). This becomes the backbone of stratigraphy and it is popularly known as Wheeler-Kenyon syste
```
**GT in Tesseract Window:** PRESENT — Archaeology from the Earth (1954) and Kenyon's Beginning in Archaeology ([1952])

#### Windows OCR Anchor Window (±120 chars)
```text
numbering of layers. These concepts have been expressed in Wheeler's Archaeology from the Earth (1954) and Kenyon's Beginning in Archaeology (1952). This becomes the backbone of stratigraphy and it is popularly known as Wheeler-Kenyon syste
```
**GT in Windows Window:** PRESENT — Archaeology from the Earth (1954) and Kenyon's Beginning in Archaeology ([1952])

---

### 19. Fact ID #151 — Page: rajan_p100-100 (Class A, measurement)

- **Ground Truth Value:** 30%
- **Fact Description:** Formic acid solution percentage for bronze
- **Extracted Candidate:** 30 (Tesseract) | 30 (Windows OCR)
- **Audited Category:** UNIT_LOST
- **Router Auto-Accept Behavior:** Both engines emit identical string (30), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "30%" cleanly. Candidate extractor stripped "%" symbol, yielding "30". Not an optical misread.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
e site.  Bronze s - If the bronze artifact is impoundgd wi?h incrustahor). lmmcLseurlmei object in a 30% solution of formic agtd and allow it tg soa g solution become coloured. The object also \{vrapped up g aluminium foil and immersed. Wat
```
**GT in Tesseract Window:** PRESENT — immerse the object in a [30%] solution of formic agtd

#### Windows OCR Anchor Window (±120 chars)
```text
e to the site. Bronze If the bronze artifact is impounded with incrustation, immerse the object in a 30% solution of formic acid and allow it to soak until solution become coloured. The object also wrapped up in an aluminium foil and immers
```
**GT in Windows Window:** PRESENT — immerse the object in a [30%] solution of formic acid

---

### 20. Fact ID #152 — Page: rajan_p100-100 (Class A, measurement)

- **Ground Truth Value:** 2 hours
- **Fact Description:** Immersion duration for copper chlorides
- **Extracted Candidate:** 181 (Tesseract) | 181 (Windows OCR)
- **Audited Category:** SCORER_TOKEN_DISPLACEMENT
- **Router Auto-Accept Behavior:** Both engines emit identical string (181), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "2 hours" verbatim. Scorer picked running page header number 181.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
n of a bronze helmet (First — before conservation, ! second — after conservation)  Field Conservation 181  If active copper chlorides found, the object may be immersed for 2 hours in a mix containing 10% benzotriazole in distilled water (or
```
**GT in Tesseract Window:** PRESENT — Field Conservation 181... immersed for [2 hours] in a mix

#### Windows OCR Anchor Window (±120 chars)
```text
vation ofa bronze helmet (First — before conservation, second — after conservation) Field Conservation 181 If active copper chlorides found. the object may be immersed for 2 hours in a mix containing 10% benzotriazole in distilled water (or
```
**GT in Windows Window:** PRESENT — Field Conservation 181... immersed for [2 hours] in a mix

---

### 21. Fact ID #153 — Page: rajan_p100-100 (Class A, measurement)

- **Ground Truth Value:** 10%
- **Fact Description:** Benzotriazole concentration in distilled water
- **Extracted Candidate:** 10 (Tesseract) | 10 (Windows OCR)
- **Audited Category:** UNIT_LOST
- **Router Auto-Accept Behavior:** Both engines emit identical string (10), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "10%" verbatim. Candidate extractor stripped "%" symbol, yielding "10".

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
onservation 181  If active copper chlorides found, the object may be immersed for 2 hours in a mix containing 10% benzotriazole in distilled water (or 3% in alcohol). Then remove the oObject, bathe and rinse in distilled water and allow it 
```
**GT in Tesseract Window:** PRESENT — mix containing [10%] benzotriazole in distilled water

#### Windows OCR Anchor Window (±120 chars)
```text
Conservation 181 If active copper chlorides found. the object may be immersed for 2 hours in a mix containing 10% benzotriazole in distilled water (or 3% in alcohol). Then remove the object, bathe and rinse in distilled water and allow it t
```
**GT in Windows Window:** PRESENT — mix containing [10%] benzotriazole in distilled water

---

### 22. Fact ID #154 — Page: rajan_p100-100 (Class A, measurement)

- **Ground Truth Value:** 3%
- **Fact Description:** Benzotriazole concentration in alcohol
- **Extracted Candidate:** 10 (Tesseract) | 10 (Windows OCR)
- **Audited Category:** AMBIGUOUS_MULTI_CANDIDATE
- **Router Auto-Accept Behavior:** Both engines emit identical string (10), so the production router auto-accepts this as consensus (AUTO_ACCEPTED_CONSENSUS).
- **Analysis:** Both engines transcribed "10%" and "3%" verbatim in the same sentence (`10% benzotriazole in distilled water (or 3% in alcohol)`). The ground truth sought the alcohol concentration (`3%`), but the position picker seized the earlier concentration `10%` (and dropped `%`). Under Step 4 Spec §3.4, this two-candidate clausal competition requires `AMBIGUOUS_MULTI_CANDIDATE` classification and routing to the human verification queue.

#### Tesseract 5.4 Anchor Window (±120 chars)
```text
onservation 181  If active copper chlorides found, the object may be immersed for 2 hours in a mix containing 10% benzotriazole in distilled water (or 3% in alcohol). Then remove the oObject, bathe and rinse in distilled water and allow it 
```
**GT in Tesseract Window:** PRESENT — 10% benzotriazole in distilled water (or [3%] in alcohol)

#### Windows OCR Anchor Window (±120 chars)
```text
Conservation 181 If active copper chlorides found. the object may be immersed for 2 hours in a mix containing 10% benzotriazole in distilled water (or 3% in alcohol). Then remove the object, bathe and rinse in distilled water and allow it t
```
**GT in Windows Window:** PRESENT — 10% benzotriazole in distilled water (or [3%] in alcohol)

---

