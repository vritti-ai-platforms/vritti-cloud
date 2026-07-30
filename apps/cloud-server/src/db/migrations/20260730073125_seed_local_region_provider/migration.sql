INSERT INTO "cloud"."regions" ("id", "name", "code", "country", "state", "city", "is_active")
VALUES ('00000000-0000-4000-8000-000000000001', 'Local', 'local', 'Local', 'Local', 'Local', true)
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "cloud"."cloud_providers" ("id", "name", "code")
VALUES ('00000000-0000-4000-8000-000000000002', 'Local', 'local')
ON CONFLICT ("code") DO NOTHING;