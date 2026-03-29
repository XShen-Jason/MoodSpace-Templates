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
    const [, , templateName] = process.argv;

    if (!templateName) {
        console.error('Usage: node scripts/delete-template.js <templateName>');
        console.error('  RS_ADMIN_KEY must be set as an environment variable.');
        process.exit(1);
    }

    // Validate admin key
    const adminKey = process.env.RS_ADMIN_KEY;
    if (!adminKey) {
        console.error('Error: RS_ADMIN_KEY environment variable is not set.');
        process.exit(1);
    }

    console.log(`[Delete] Requesting deletion of '${templateName}' from ${WORKER_URL} ...`);

    let res;
    try {
        // We do NOT use ?force=true by default to prevent accidental data loss
        // of existing user projects. If force is needed, it should be done via Admin UI.
        res = await fetch(`${WORKER_URL}/api/template/${templateName}`, {
            method: 'DELETE',
            headers: { 'X-Admin-Key': adminKey },
        });
    } catch (err) {
        console.error('Network error:', err.message);
        process.exit(1);
    }

    const json = await res.json().catch(() => null);

    if (res.status === 404) {
        console.log(`⚠️ Template '${templateName}' not found on server. It might have been deleted already. Skipping.`);
        return;
    }

    if (!res.ok || !json?.success) {
        console.error(`Delete failed (HTTP ${res.status}): ${json?.error ?? 'Unknown error'}`);
        if (json?.message) console.error(`Message: ${json.message}`);
        process.exit(1);
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
