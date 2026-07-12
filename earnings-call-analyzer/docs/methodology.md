# Methodology & Literature Grounding

> **Framing.** None of the sentiment/NLP techniques here are novel. They are the
> established baseline for text analysis in asset management. This document exists to
> show the work is grounded in that literature — and that the edge is *engineering
> discipline* (grounding, evaluation, reproducibility), not a claimed research break-
> through. RBC GAM has quant teams for whom this is table stakes; the tool respects that.

## 1. Where this sits in the literature

**Lexicon-based sentiment — Loughran & McDonald (2011),** *"When Is a Liability Not a
Liability? Textual Analysis, Dictionaries, and 10-Ks,"* Journal of Finance. Showed that
general-purpose sentiment word lists (e.g. Harvard GI) misclassify finance text —
words like "liability," "cost," "tax" are negative in general English but neutral in
filings. They built finance-specific positive/negative/uncertainty/litigious word lists.
- **In this tool:** `eca/analyze.py` ships a compact LM-style positive/negative lexicon
  used by the mock backend's tone read. A production build would load the full LM master
  dictionary. The tone signal is reported as a *baseline lean*, never as a verdict.

**Contextual embeddings — FinBERT (Araci, 2019; Yang, Uy & Huang, 2020).** A BERT model
fine-tuned on financial text, outperforming lexicon methods on sentiment classification
because it captures negation and context ("not weak") that bag-of-words methods miss.
- **In this tool:** the real backend (Claude) is a modern LLM that captures context and
  negation directly, superseding a bolt-on FinBERT stage for this use case. FinBERT is
  cited as the reason we trust an LLM's contextual read over a raw lexicon count.

**Earnings-call–specific work.** Price & Doran (2012) and Mayew & Venkatachalam (2012)
link call *tone* (and vocal cues) to subsequent returns; the broad finding is that
prepared-remark vs. Q&A tone divergence carries signal. This motivates the tool's
separate **Management Tone** and **Q&A Highlights** sections.

## 2. Why grounding is the core design choice

The dominant failure mode of LLMs on financial text is **hallucinated figures** — a
confident, wrong number. On an investment desk that single failure kills adoption of the
whole tool. So the design treats *verifiability* as a first-class output, not a footnote:

- Ingest assigns a stable `[Ln]` to every content line.
- The prompt (`eca/prompts.py`) requires every claim to cite the line(s) it came from and
  forbids including anything that can't be cited.
- The grounding layer (`eca/ground.py`) independently re-checks: does each citation
  resolve, and does each **financial figure** in a claim actually appear on a cited line?
- Coverage and numeric-verification rates print on the report header, and any claim that
  fails is **surfaced in a "Grounding Flags" section, not hidden.**

This is deliberately conservative: the tool would rather show a flag than smuggle an
unverifiable number into an analyst's workflow.

## 3. Why evaluation is the second design choice

The job description lists LLM/agent evaluation methodology as a nice-to-have. The eval
harness (`eca/evaluate.py`) scores three things against a golden set with known ground
truth:

| Metric | What it asks | How it's measured |
| --- | --- | --- |
| **Extraction accuracy** | Did we surface the facts that matter? | Expected metrics in `*.expected.json` matched against produced metrics + cited evidence. |
| **Grounding coverage** | Is every claim cited and figure-verified? | From the grounding layer, aggregated. |
| **Consistency** | Do repeated runs agree? | Fingerprint of extracted metrics across N runs. Deterministic in mock; the real signal is run-to-run stability of the Claude backend. |

**Why the golden set is synthetic.** An evaluation set needs *known* ground truth. Real
transcripts don't come with a verified answer key, and copying them into a repo raises
copyright issues. Synthetic, clearly-labelled transcripts give perfect ground truth and
are safe to distribute. Real, recognizable transcripts are for the *live demo*, supplied
at run time — not baked into the eval.

## 4. Honest limitations

- The mock backend is a regex/lexicon heuristic. It is a deterministic *baseline* for
  testing the pipeline and evals offline — not the analytical product. The product is the
  Claude backend.
- The compact lexicon is illustrative; production would use the full LM dictionary and
  likely a fine-tuned contextual model for tone.
- Numeric verification checks that a claimed figure *appears on a cited line*. It does not
  yet check unit consistency (e.g. billion vs. million) — a known next step (§ build log).
- Grounding raises confidence; it does not guarantee interpretation is correct. Judgment
  claims are framed as hypotheses for correction by design.

## References

- Loughran, T., & McDonald, B. (2011). When Is a Liability Not a Liability? Textual
  Analysis, Dictionaries, and 10-Ks. *Journal of Finance*, 66(1), 35–65.
- Araci, D. (2019). FinBERT: Financial Sentiment Analysis with Pre-trained Language
  Models. *arXiv:1908.10063*.
- Yang, Y., Uy, M. C. S., & Huang, A. (2020). FinBERT: A Pretrained Language Model for
  Financial Communications. *arXiv:2006.08097*.
- Mayew, W. J., & Venkatachalam, M. (2012). The Power of Voice: Managerial Affective
  States and Future Firm Performance. *Journal of Finance*, 67(1), 1–43.
- Price, S. M., Doran, J. S., Peterson, D. R., & Bliss, B. A. (2012). Earnings conference
  calls and stock returns: The incremental informativeness of textual tone. *Journal of
  Banking & Finance*, 36(4), 992–1011.
