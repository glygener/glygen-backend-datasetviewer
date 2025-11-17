// scripts/build_stats.js
//
// Scans TSV datasets and writes summarized statistics as JSON
//

//import Papa from 'papaparse';

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse'); // for safe TSV parsing

// Directories
 const ASSEMBLY_DIR = '/data/shared/argosdb/generated/datasets/reviewed/assemblyQC';
 const BIOSAMPLE_DIR = '/data/shared/argosdb/generated/datasets/reviewed/biosampleMeta';
 const OUTFILE = path.join(__dirname, '../public/statistics_summary.json');

 function readTSV(filePath) {
   const content = fs.readFileSync(filePath, 'utf8');
     return Papa.parse(content, { header: true, delimiter: '\t' }).data;
     }
     
function getLastTwoFromLineage(lineage) {
	  if (!lineage) return { kingdom: null, genus: null };
	  const parts = lineage.split(';').map(p => p.trim()).filter(Boolean);
	  return {
		      kingdom: parts[0] || null,
		      genus: parts[parts.length - 1] || null,
		    };
}

function summarize() {
	  const stats = {
		      genusCounts: {},
		      kingdomCounts: {},
		      hosts: {},
		      locations: {},
		      sampleTypes: {}
		    };

  // Read biosampleMeta files

  fs.readdirSync(BIOSAMPLE_DIR)
	    .filter(f => f.endsWith('.tsv'))
	    .forEach(file => {
		          const rows = readTSV(path.join(BIOSAMPLE_DIR, file));
		          rows.forEach(r => {
				          const { kingdom, genus } = getLastTwoFromLineage(r.lineage);
				          if (genus) stats.genusCounts[genus] = (stats.genusCounts[genus] || 0) + 1;
				          if (kingdom) stats.kingdomCounts[kingdom] = (stats.kingdomCounts[kingdom] || 0) + 1;
				          if (r.isolation_source) stats.sampleTypes[r.isolation_source] = (stats.sampleTypes[r.isolation_source] || 0) + 1;
				        });
		        });


  // Read assemblyQC files
  fs.readdirSync(ASSEMBLY_DIR)
	    .filter(f => f.endsWith('.tsv'))
	    .forEach(file => {
		          const rows = readTSV(path.join(ASSEMBLY_DIR, file));
		          rows.forEach(r => {
				          if (r.host) stats.hosts[r.host] = (stats.hosts[r.host] || 0) + 1;
				          if (r.geo_loc_name) stats.locations[r.geo_loc_name] = (stats.locations[r.geo_loc_name] || 0) + 1;
				        });
		        });

	  fs.writeFileSync(OUTFILE, JSON.stringify(stats, null, 2));
	  console.log(`Wrote summary to ${OUTFILE}`);
}

summarize();

