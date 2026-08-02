# Peloton Chronicle v0.9 — deterministic balance pass

The simulation was tested with fixed seeds so the same universe could be rerun after each tuning change.

## Long-run checks performed

- 12-season deterministic universe before tuning.
- 8-season deterministic universe after the first balance correction.
- Existing five-season structural regression test.
- Full event, save migration, UCI ranking, year-end and profile rendering suite.

## Problems found and corrected

- Grand Tour runner-up gaps clustered at the old six-minute ceiling.
- A small number of sub-78 riders could win a Grand Tour classification.
- Short generated careers could target retirement in the mid-twenties.
- Classics specialists could accumulate wins too quickly.
- Generational riders could remain too narrowly confined to one program.
- Rider target events were stored by priority rather than chronology.

## Post-tuning benchmark snapshot

In the fixed eight-season benchmark:

- No Common or Uncommon rider won a Grand Tour.
- Median Grand Tour runner-up gap was approximately 2 minutes 12 seconds.
- A generational rider reached five Grand Tour victories within eight seasons.
- A generational classics specialist reached seven Monuments and eighteen classics.
- Rare riders could still build major classics careers, but seasonal repeat-win penalties now reduce runaway totals.

These are distribution checks, not hard scripted outcomes. Different seeds can still produce weaker eras, dominant dynasties, late bloomers and occasional one-day upsets.
