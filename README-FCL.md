# FCL — Funesterie Config Language
Official Specification — Version 1.0

FCL is a human-friendly configuration language designed for orchestrators,
multi-service stacks, automation pipelines and modern application tooling.

It is owned and maintained by Funesterie™.

### Quick Example

@project
  name = my-project
  version = 1.0

@service api
  path = apps/api
  start = "pnpm dev"

@pipeline dev
  steps = ["api"]

### Syntax Overview

- Blocks start with @keyword or @keyword name
- Key-value syntax uses: key = value
- Strings may use "quotes"
- Lists use: [ item1, item2, item3 ]
- Comments: # or //

### Purpose

FCL is designed to be:
- Lightweight
- Easy to write
- Easy to parse
- Tool-agnostic
- Human-readable

### License

Personal usage is free.  
Commercial usage requires a Funesterie™ Commercial License.

To purchase a commercial license for FCL:
https://cellaurojeff.gumroad.com/l/jxktq?_gl=1*ahliwi*_ga*OTM1MTQyNTMwLjE3NjM0MTA1MDc.*_ga_6LJN6D94N6*czE3NjM0MTA1MDYkbzEkZzEkdDE3NjM0MTM4OTkkajMzJGwwJGgw

See:
- LICENSE-FUNESTERIE.txt
- LICENSE-NON-COMMERCIAL.md
- LICENSE-COMMERCIAL.md
- TRADEMARK.md

### Badge (text)

[ FUNESTERIE™ LICENSED FORMAT ]
       FCL – Official Format
---------------------------------
This project uses the Funesterie™
config language under license.
