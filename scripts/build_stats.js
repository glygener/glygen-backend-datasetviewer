// scripts/build_stats.js
// Node script to scan TSVs and produce statistics JSON for the frontend.
// Usage: node scripts/build_stats.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = '/data/shared/argosdb/generated/datasets/reviewed';
const OUT_DIR = path.join(__dirname, '..', 'app', 'static', 'data');
const OUT_FILE = path.join(OUT_DIR, 'statistics.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Helpers
function splitLineage(lineage) {
  if (!lineage) return { kingdom: 'Unknown', genus: 'Unknown' };
  const parts = lineage.split(';').map(s => s.trim()).filter(Boolean);
  const kingdom = parts[0] || 'Unknown';
  let genus = parts[parts.length - 1] || 'Unknown';
  genus = genus.split('/')[0].split(' ')[0]; // clean genus
  return { kingdom, genus };
}
function normalizeLocation(loc) {
  if (!loc) return 'Unknown';
  const p = loc.split(/[:,]/)[0].trim();
  return p || loc || 'Unknown';
}
function normalizeHost(h) {
  if (!h) return 'Unknown';
  return h.split(';')[0].split(',')[0].trim() || 'Unknown';
}
function categorizeIsolationSource(s) {
  if (!s) return 'Other';
  const s0 = s.toLowerCase();
  if (/soil|compost|rhiz|peat/.test(s0)) return 'Soil';
  if (/water|seawater|marine|river|lake|stream|ocean/.test(s0)) return 'Water';
  if (/feces|stool|gut|intestinal|colon|fecal/.test(s0)) return 'Feces/Stool';
  if (/blood|serum|plasma|sputum|urine|saliva|tissue|biopsy|csf|cerebro/.test(s0)) return 'Clinical';
  if (/plant|leaf|root|stem|seed|fruit|rhizo/.test(s0)) return 'Plant';
  if (/skin|swab|nasal|throat|oral|mucosa|wound/.test(s0)) return 'Swab/Skin';
  if (/air|aerosol/.test(s0)) return 'Air';
  if (/culture|isolate|broth|agar|colony/.test(s0)) return 'Culture';
  return 'Other';
}

// Aggregation containers
const genusCounts = {};
const kingdomCounts = {};
const locationCounts = {};
const hostCounts = {};
const sampleTypeCounts = {};

const seenBiosampleIds = new Set();
const seenAssemblyIds = new Set();

// ----- NEW FILE DISCOVERY LOGIC -----
function listRelevantTSVs(dir) {
  // only match biosampleMeta_*.tsv or assemblyQC_*.tsv files
  const files = fs.readdirSync(dir)
    .filter(f =>
      f.endsWith('.tsv') &&
      (f.startsWith('biosampleMeta_') || f.startsWith('assemblyQC_'))
    )
    .map(f => path.join(dir, f));
  return files;
}
// ------------------------------------

async function processTSV(filePath) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity
    });

    let headers = null;
    rl.on('line', line => {
      if (!headers) {
        headers = line.split('\t').map(h => h.trim());
        return;
      }
      const cols = line.split('\t');
      const row = {};
      headers.forEach((h, i) => (row[h] = (cols[i] !== undefined ? cols[i] : '').trim()));

      // Detect file type
      const isBiosampleMeta =
        headers.includes('isolation_source') || headers.includes('biosample');
      const isAssemblyQC =
        headers.includes('assembled_genome_acc') ||
        headers.includes('assembly_level') ||
        headers.includes('assembly_gc_content');

      if (isBiosampleMeta) {
        const id =
          row['biosample'] ||
          row['biosample_accession'] ||
          row['sample_name'] ||
          row['sample'] ||
          (row['bioproject']
            ? row['bioproject'] + '|' + (row['biosample'] || '')
            : null) ||
          null;
        if (id && seenBiosampleIds.has(id)) return;
        if (id) seenBiosampleIds.add(id);

        const lineage = row['lineage'] || row['taxonomy'] || row['organism_name'] || '';
        const { kingdom, genus } = splitLineage(lineage);
        genusCounts[genus] = (genusCounts[genus] || 0) + 1;
        kingdomCounts[kingdom] = (kingdomCounts[kingdom] || 0) + 1;

        const iso = row['isolation_source'] || row['isolation source'] || '';
        const cat = categorizeIsolationSource(iso);
        sampleTypeCounts[cat] = (sampleTypeCounts[cat] || 0) + 1;
      }

      if (isAssemblyQC) {
        const id =
          row['genome_assembly_id'] ||
          row['assembled_genome_acc'] ||
          row['assembly_accession'] ||
          row['analysis_platform_object_id'] ||
          null;
        if (id && seenAssemblyIds.has(id)) return;
        if (id) seenAssemblyIds.add(id);

        const loc = row['geo_loc_name'] || row['location'] || '';
        const country = normalizeLocation(loc);
        locationCounts[country] = (locationCounts[country] || 0) + 1;

        const hostFieldCandidates = [
          'host',
          'host_description',
          'host_host',
          'hosthost_age',
          'hosthost',
          'isolation_host',
          'isolate'
        ];
        let hostVal = '';
        for (const c of hostFieldCandidates) {
          if (row[c]) {
            hostVal = row[c];
            break;
          }
        }
        if (!hostVal) {
          for (const h of Object.keys(row))
            if (/host/i.test(h) && row[h]) {
              hostVal = row[h];
              break;
            }
        }
        const hostNorm = normalizeHost(hostVal);
        hostCounts[hostNorm] = (hostCounts[hostNorm] || 0) + 1;
      }
    });

    rl.on('close', () => resolve());
    rl.on('error', reject);
  });
}

(async function main() {
  console.log('Scanning TSVs under', DATA_DIR);

  const tsvFiles = listRelevantTSVs(DATA_DIR);
  if (tsvFiles.length === 0) {
    console.warn('⚠️  No biosampleMeta_*.tsv or assemblyQC_*.tsv files found in', DATA_DIR);
  }

  for (const file of tsvFiles) {
    console.log('Processing', path.basename(file));
    try {
      await processTSV(file);
    } catch (err) {
      console.error('Error processing', file, err);
    }
  }

  const toArray = m =>
    Object.keys(m)
      .map(k => ({ key: k, value: m[k] }))
      .sort((a, b) => b.value - a.value);

  const out = {
    generated_at: new Date().toISOString(),
    genus: toArray(genusCounts),
    kingdom: toArray(kingdomCounts),
    location: toArray(locationCounts),
    host: toArray(hostCounts),
    sample_type: toArray(sampleTypeCounts)
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
  console.log('✅ Wrote', OUT_FILE);
})();

