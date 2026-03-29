#!/usr/bin/env node
/**
 * Mood Space Template Delete Tool
 * Usage: node scripts/delete-template.js <templateName>
 *
 * Environment variables:
 *   RS_ADMIN_KEY   — Admin secret key (required)
 *   RS_WORKER_URL  — Worker URL (default: https://api.moodspace.xyz)
 */

const WORKER_URL = process.env.RS_WORKER_URL ?? 'https://api.moodspace.xyz';

async function main() {
    const args = process.argv.slice(2);
    const templateName = args.find(a => !a.startsWith('-'));
    const isForce = args.includes('--force') || args.includes('-f');

    if (!templateName) {
        console.error('Usage: node scripts/delete-template.js <templateName> [--force]');
        console.error('  RS_ADMIN_KEY must be set as an environment variable.');
        return;
    }

    // Validate admin key
    const adminKey = process.env.RS_ADMIN_KEY;
    if (!adminKey) {
        console.error('Error: RS_ADMIN_KEY environment variable is not set.');
        return;
    }

    const url = new URL(`${WORKER_URL}/api/template/${templateName}`);
    if (isForce) {
        url.searchParams.append('force', 'true');
        console.log(`⚠️  Force mode enabled. Overriding usage checks...`);
    }

    console.log(`[Delete] Requesting deletion of '${templateName}' from ${WORKER_URL} ...`);

    let res;
    try {
        res = await fetch(url.toString(), {
            method: 'DELETE',
            headers: { 'X-Admin-Key': adminKey },
        });
    } catch (err) {
        console.error('Network error:', err.message);
        return;
    }

    const json = await res.json().catch(() => null);

    if (res.status === 404) {
        console.log(`⚠️ Template '${templateName}' not found on server. It might have been deleted already. Skipping.`);
        return;
    }

    if (!res.ok || !json?.success) {
        console.error(`Delete failed (HTTP ${res.status}): ${json?.error ?? 'Unknown error'}`);
        if (json?.message) console.error(`Message: ${json.message}`);
        return;
    }

    console.log(`✅ Template '${templateName}' deleted clean.`);
    if (json.usageCount > 0) {
        console.log(`   Note: This template was being used by ${json.usageCount} projects.`);
    }
}

main().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
