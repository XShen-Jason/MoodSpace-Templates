#!/usr/bin/env node
/**
 * Mood Space Template Upload Tool
 * Usage: node scripts/upload-template.js <templateName> <templateDir>
 *
 * Environment variables:
 *   RS_ADMIN_KEY   — Admin secret key (required)
 *   RS_WORKER_URL  — Worker URL (default: https://api.moodspace.xyz)
 */

const fs = require('fs');
const path = require('path');

const WORKER_URL = process.env.RS_WORKER_URL ?? 'https://api.moodspace.xyz';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Recursively collect all files under a directory as { relativePath, fullPath }. */
function readDirRecursive(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...readDirRecursive(full, rel));
        } else {
            files.push({ relativePath: rel, fullPath: full });
        }
    }
    return files;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    const [, , templateName, templateDir] = process.argv;

    if (!templateName || !templateDir) {
        console.error('Usage: node scripts/upload-template.js <templateName> <templateDir>');
        console.error('  RS_ADMIN_KEY must be set as an environment variable.');
        process.exit(1);
    }

    // Validate template name
    if (!/^[a-z0-9_]+$/.test(templateName)) {
        console.error('Error: templateName must contain only lowercase letters, numbers, or underscores.');
        process.exit(1);
    }

    // Validate admin key
    const adminKey = process.env.RS_ADMIN_KEY;
    if (!adminKey) {
        console.error('Error: RS_ADMIN_KEY environment variable is not set.');
        process.exit(1);
    }

    // Validate source directory
    const resolvedDir = path.resolve(templateDir);
    if (!fs.existsSync(resolvedDir)) {
        console.error(`Error: Directory not found: ${resolvedDir}`);
        process.exit(1);
    }

    // Check for required index.html
    if (!fs.existsSync(path.join(resolvedDir, 'index.html'))) {
        console.error('Error: index.html is required in the template directory.');
        process.exit(1);
    }

    // Collect all files
    const files = readDirRecursive(resolvedDir);
    console.log(`[Upload] Found ${files.length} file(s) in ${resolvedDir}:`);
    files.forEach(f => console.log(`  · ${f.relativePath}`));
    console.log('');

    // Build FormData
    const formData = new FormData();
    formData.append('templateName', templateName);

    for (const { relativePath, fullPath } of files) {
        const buffer = fs.readFileSync(fullPath);
        const blob = new Blob([buffer]);
        formData.append(relativePath, blob, relativePath);
    }

    // Upload
    console.log(`[Upload] Uploading '${templateName}' to ${WORKER_URL} ...`);

    let res;
    try {
        res = await fetch(`${WORKER_URL}/api/template/upload`, {
            method: 'POST',
            headers: { 'X-Admin-Key': adminKey },
            body: formData,
        });
    } catch (err) {
        console.error('Network error:', err.message);
        process.exit(1);
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
        console.error(`Upload failed (HTTP ${res.status}): ${json?.error ?? 'Unknown error'}`);
        process.exit(1);
    }

    console.log('');
    console.log('✅ Template uploaded successfully!');
    console.log(`   Name    : ${json.templateName}`);
    console.log(`   Version : ${json.version}`);
    console.log(`   Static  : ${json.static}`);
    console.log(`   Fields  : ${json.fields?.join(', ') || '(none)'}`);
    console.log(`   Files   : ${json.filesUploaded?.join(', ')}`);
    console.log(`   Preview : ${json.previewUrl}`);
    if (json.reRenderingUsers > 0) {
        console.log(`   Re-rendering ${json.reRenderingUsers} existing user page(s) in background...`);
    }
}

main().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
});
