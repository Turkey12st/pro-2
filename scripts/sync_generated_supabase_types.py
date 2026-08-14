import json
from pathlib import Path

source = Path("/home/ubuntu/.mcp/tool-results/2026-08-14_00-22-59.701648406_supabase_generate_typescript_types_37e1ead1.json")
target = Path("/home/ubuntu/pro-2/src/integrations/supabase/types.ts")

payload = json.loads(source.read_text(encoding="utf-8"))
types = payload["types"]
if not isinstance(types, str) or "export type Database" not in types:
    raise ValueError("Generated Supabase types are incomplete")
target.write_text(types + "\n", encoding="utf-8")
