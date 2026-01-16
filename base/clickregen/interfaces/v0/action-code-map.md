# v0 Action Code Map (Portal u32)

Portal uses `uint32 action` for cheap indexing.
Off-chain envelopes use string enums. Relayer maps between them.

| String action | u32 |
|--------------|-----|
| CLICK        | 1   |
| INFER        | 2   |
| RETIRE       | 3   |
| TASK         | 4   |
