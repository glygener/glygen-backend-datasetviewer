#!/usr/bin/env node

/**
 * build_stats.js
 *
 * Aggregates statistics for the ArgosDB overview page.
 * - Reads TSVs from /data/shared/argosdb/generated/datasets/reviewed (production)
 *   and falls back to local files if present.
 * - Dedupes assemblies by genome_assembly_id.
 * - Emits JSON expected by the React page:
 *   {
 *     kingdom:      [{key, value}],
 *     genus_family: [{key, value, category}],   // new for the bar chart
 *     location:     [{key, value}],
 *     host:         [{key, value}],
 *     sample_type:  [{key, value}]
 *   }
 */

const fs = require('fs');
const path = require('path');

// Always resolve relative to the repository root (two ways that both work):
const REPO_ROOT = path.resolve(__dirname, '..');

// ----------- config / inputs ------------
const SRC_DIR = '/data/shared/argosdb/generated/datasets/reviewed';

// Prefer production paths; fall back to cwd if needed.
const assemblyFiles = [
  path.join(SRC_DIR, 'assemblyQC_ARGOS.tsv'),
  path.join(SRC_DIR, 'assemblyQC_ARGOS_extended.tsv'),
  'assemblyQC_ARGOS.tsv',
  'assemblyQC_ARGOS_extended.tsv'
].filter(p => fs.existsSync(p));

const biosampleFiles = [
  path.join(SRC_DIR, 'biosampleMeta_ARGOS.tsv'),
  path.join(SRC_DIR, 'biosampleMeta_ARGOS_extended.tsv'),
  'biosampleMeta_ARGOS.tsv',
  'biosampleMeta_ARGOS_extended.tsv'
].filter(p => fs.existsSync(p));

// Output file (must be under CRA app directory (cwd = app/)
const OUT = path.join(REPO_ROOT, 'app', 'public', 'static', 'data', 'statistics_summary.json');

// ----------- small TSV helper -----------
function parseTSV(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  // normalize header: trim + lowercase
  const rawHeader = lines[0].split('\t');
  const header = rawHeader.map(h =>
    h.replace(/^\uFEFF/, '').trim().toLowerCase()
  );
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = cols[j] === undefined ? '' : cols[j];
    }
    rows.push(obj);
  }
  return rows;
}
// get a field by any of the candidate names (trim/case-insensitive)
function getField(row, candidates) {
  for (const key of candidates) {
    const k = String(key).trim().toLowerCase();
    if (k in row) return row[k];
  }
  return '';
}

// ----------- lineage helpers ------------
function splitLineage(s) {
  if (!s) return [];
  return String(s)
    .split(';')
    .map(x => x.trim())
    .filter(Boolean);
}

function firstTerm(lineage) {
  const parts = splitLineage(lineage);
  return parts.length ? parts[0] : 'Unknown';
}

function secondToLastTerm(lineage) {
  const parts = splitLineage(lineage);
  if (parts.length >= 2) return parts[parts.length - 2];
  return 'Unknown';
}

function topCategoryFromFirstTerm(first) {
  // Collapse top-level categories into the three buckets the chart needs.
  // Everything else -> “Other”
  const f = (first || '').toLowerCase();
  if (f === 'bacteria') return 'Bacteria';
  if (f === 'viruses' || f === 'virus') return 'Viruses';
  if (f === 'eukaryota' || f === 'eukaryote' || f === 'eukarya') return 'Eukaryota';
  return 'Other';
}

// ----------- geo normalization ----------
const EMPTY = new Set(['', 'unknown', 'missing', 'not applicable', 'n/a', 'na', 'null', 'none', '-', '.']);

const COUNTRY_MAP = new Map([
  // USA variants
  ['usa', 'United States'],
  ['us', 'United States'],
  ['u.s.a.', 'United States'],
  ['united states', 'United States'],

  // UK variants
  ['uk', 'United Kingdom'],
  ['u.k.', 'United Kingdom'],
  ['england', 'United Kingdom'],
  ['scotland', 'United Kingdom'],
  ['wales', 'United Kingdom'],
  ['northern ireland', 'United Kingdom'],

  // Russia variants
  ['russia', 'Russia'],
  ['russian federation', 'Russia'],
  ['ussr', 'Russia'],

  // Korea variants
  ['korea, republic of', 'South Korea'],
  ['south korea', 'South Korea'],
  ['republic of korea', 'South Korea'],
  ['korea', 'South Korea'],
  ['korea, democratic people\'s republic of', 'North Korea'],
  ['north korea', 'North Korea'],

  // Common “official” names -> colloquial
  ['czechia', 'Czech Republic'],
  ['czech republic', 'Czech Republic'],
  ['viet nam', 'Vietnam'],
  ['iran, islamic republic of', 'Iran'],
  ['democratic republic of the congo', 'DR Congo'],
  ['congo, democratic republic of the', 'DR Congo'],
  ['congo', 'Republic of the Congo'],
]);

function normalizeCountry(geo) {
  if (!geo) return 'Unknown';
  let s = String(geo).trim();
  if (EMPTY.has(s.toLowerCase())) return 'Unknown';

  // keep only the part before the first colon (e.g. “USA: MD” → “USA”)
  const first = s.split(':', 1)[0].trim().replace(/,+/g, ' ');
  const key = first.toLowerCase();

  if (COUNTRY_MAP.has(key)) return COUNTRY_MAP.get(key);

  // If someone typed "USA " with case weirdness
  if (key === 'usa' || key === 'us' || key === 'u.s.a.') return 'United States';

  // Otherwise return the cleaned token — it’s usually a country name already.
  return first;
}

// ----------- host bucketing -------------
function bucketHost(host) {
  const t = String(host || '').trim().toLowerCase();
  if (!t || EMPTY.has(t)) return 'Not Specified';

  const has = (arr) => arr.some(k => t.includes(k));

  if (has(['homo sapiens', 'human', 'patient', 'male', 'female'])) return 'Human';
  if (has(['gallus gallus', 'chicken', 'turkey', 'meleagris'])) return 'Poultry';
  if (has(['bos taurus', 'bovine', 'cow', 'cattle'])) return 'Bovine';
  if (has(['mus musculus', 'mouse', 'mice', 'rat', 'rattus', 'rodent'])) return 'Rodent';
  if (has(['rabbit', 'oryctolagus'])) return 'Rabbit';
  if (has(['arabidopsis', 'zea mays', 'plant', 'glycine max', 'oryza', 'solanum', 'nicotiana'])) return 'Plant';
  if (has(['bat','canis','dog','feline','cat','primate','monkey','macaca','macaque','gorilla','pan troglodytes','avian','bird','wild','boar','sus scrofa'])) return 'Wildlife';
  if (has(['synthetic','reference','control','mock'])) return 'Synthetic/Reference Strain';
  if (has(['environmental','environment','sewage','wastewater','soil','water','air','surface','fomite','dust'])) return 'Environmental';
  return 'Other';
}

// ----------- isolation_source buckets ---
function bucketIsolation(src) {
  const t = String(src || '').trim().toLowerCase();
  if (!t || EMPTY.has(t)) return 'Unknown';

  const has = (arr) => arr.some(k => t.includes(k));

  if (has(['blood', 'plasma', 'serum'])) return 'Blood';
  if (has(['stool','feces','faeces','rectal','gut','gastro','intestinal'])) return 'Gastrointestinal';
  if (has(['wound','skin','abscess','lesion','swab','dermal'])) return 'Wound/Skin';
  if (has(['nasal','nasopharyngeal','oropharyngeal','respiratory','sputum','bronch','throat'])) return 'Respiratory';
  if (has(['urine','urinary'])) return 'Urinary';
  if (has(['tissue','biopsy','liver','kidney','lung','spleen','brain','heart','muscle'])) return 'Tissue/Biopsy';
  if (has(['meat','milk','poultry','chicken','beef','pork','egg','animal product','food'])) return 'Food/Animal Product';
  if (has(['environment','environmental','soil','water','wastewater','sewage','surface','air','fomite','dust'])) return 'Environmental';
  if (has(['reference','synthetic','control','mock'])) return 'Reference/Synthetic';
  if (t.includes('clinical isolate')) return 'Unknown'; // too unspecific
  return 'Other';
}

// ----------- counting helper ------------
function toKVArray(counterMap) {
  return Array.from(counterMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, value }));
}

// ----------- main -----------------------
function main() {
  if (assemblyFiles.length === 0 || biosampleFiles.length === 0) {
    console.error('No input TSVs found. Looked for assemblyQC_* and biosampleMeta_* in:\n', SRC_DIR, '\nand in the current directory.');
    process.exit(1);
  }

  // 1) Assemblies: dedupe and collect lineage-based plots
  const seen = new Set();
  const uniqueAssemblies = [];

  for (const f of assemblyFiles) {
    const rows = parseTSV(f);
    for (const r of rows) {
      const id = r['genome_assembly_id'];
      if (!id || seen.has(id)) continue;
      seen.add(id);
      uniqueAssemblies.push({ id, lineage: r['lineage'] });
    }
  }

  const kingdomCounts = new Map();
  const genusFamilyCounts = new Map(); // key = `${secondToLast}|||${category}`

  for (const u of uniqueAssemblies) {
    const first = firstTerm(u.lineage);
    const category = topCategoryFromFirstTerm(first);
    kingdomCounts.set(first, (kingdomCounts.get(first) || 0) + 1);

    const s2l = secondToLastTerm(u.lineage);
    const gfKey = `${s2l}|||${category}`;
    genusFamilyCounts.set(gfKey, (genusFamilyCounts.get(gfKey) || 0) + 1);
  }

  const genus_family = Array.from(genusFamilyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => {
      const [name, category] = key.split('|||');
      return { key: name, value, category };
    });

  // 2) Biosamples: location/host/isolation_source
  const locations = new Map();
  const hosts = new Map();
  const sampleTypes = new Map();

  for (const f of biosampleFiles) {
    const rows = parseTSV(f);
    for (const r of rows) {
      const country = normalizeCountry(getField(r, ['geo_loc_name']));
      locations.set(country, (locations.get(country) || 0) + 1);

      const hostBucket = bucketHost(getField(r, ['host']));
      hosts.set(hostBucket, (hosts.get(hostBucket) || 0) + 1);

      const isoBucket = bucketIsolation(getField(r, ['isolation_source']));
      sampleTypes.set(isoBucket, (sampleTypes.get(isoBucket) || 0) + 1);
    }
  }

  const payload = {
    schema_version: 2,
    kingdom:      toKVArray(kingdomCounts),     // circular “Genomes in ArgosDB”
    genus_family,                                // bar chart (color using .category)
    location:     toKVArray(locations),         // circular “Geographic Location”
    host:         toKVArray(hosts),             // circular “Host Info”
    sample_type:  toKVArray(sampleTypes)        // circular “Sample Type”
  };

  // Ensure output dir exists
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${OUT} with ${uniqueAssemblies.length} unique assemblies.`);
}

console.log('Example geo_loc_name values:',
	parseTSV(biosampleFiles[0]).slice(0,5).map(r => getField(r, ['geo_loc_name']))
);

main();
