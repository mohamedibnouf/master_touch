import { unstable_cache } from "next/cache";
import { createClient } from "@/infrastructure/supabase/server";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import type { AppLocale } from "@/types/cms";
import { DatabaseError } from "@/domain/shared/errors";
import { logger } from "@/infrastructure/logging/logger";

export type MessageTree = Record<string, unknown>;

function setNested(target: MessageTree, key: string, value: string) {
  const parts = key.split(".");
  let cursor: MessageTree = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!;
    if (typeof cursor[part] !== "object" || cursor[part] === null) {
      cursor[part] = {};
    }
    cursor = cursor[part] as MessageTree;
  }
  cursor[parts[parts.length - 1]!] = value;
}

async function fetchTranslationsFromDb(locale: AppLocale): Promise<MessageTree> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("translations")
    .select("key, value, translation_namespaces(slug)")
    .eq("locale", locale);

  if (error) throw new DatabaseError(error.message, error);

  const tree: MessageTree = {};
  for (const row of data ?? []) {
    const nsRelation = row.translation_namespaces as unknown as { slug: string } | { slug: string }[] | null;
    const ns = Array.isArray(nsRelation) ? nsRelation[0]?.slug : nsRelation?.slug;
    setNested(tree, `${ns ?? "common"}.${row.key}`, row.value);
  }

  // Merge bootstrap file as deep fallback for missing keys
  try {
    const bootstrap = (await import(`../../../messages/${locale}.json`)).default as MessageTree;
    return deepMerge(bootstrap, tree);
  } catch {
    return tree;
  }
}

function deepMerge(base: MessageTree, overlay: MessageTree): MessageTree {
  const out: MessageTree = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof out[key] === "object" &&
      out[key] !== null
    ) {
      out[key] = deepMerge(out[key] as MessageTree, value as MessageTree);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export async function getCachedMessages(locale: AppLocale): Promise<MessageTree> {
  const cached = unstable_cache(
    async () => {
      logger.debug("translations.cache.miss", { locale });
      return fetchTranslationsFromDb(locale);
    },
    [`translations-${locale}`],
    { tags: [`translations`, `translations:${locale}`], revalidate: 300 },
  );
  return cached();
}

export async function listTranslationRows() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("translations")
    .select("id, key, locale, value, namespace_id, translation_namespaces(slug)")
    .order("key");
  if (error) throw new DatabaseError(error.message, error);
  return data ?? [];
}

export async function upsertTranslation(input: {
  namespaceSlug: string;
  key: string;
  locale: AppLocale;
  value: string;
}) {
  const admin = createAdminClient();
  const { data: ns, error: nsError } = await admin
    .from("translation_namespaces")
    .select("id")
    .eq("slug", input.namespaceSlug)
    .maybeSingle();
  if (nsError) throw new DatabaseError(nsError.message, nsError);
  if (!ns) throw new DatabaseError(`Namespace not found: ${input.namespaceSlug}`);

  const { error } = await admin.from("translations").upsert(
    {
      namespace_id: ns.id,
      key: input.key,
      locale: input.locale,
      value: input.value,
    },
    { onConflict: "namespace_id,key,locale" },
  );
  if (error) throw new DatabaseError(error.message, error);
}
