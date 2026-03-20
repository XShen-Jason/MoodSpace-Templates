#!/usr/bin/env node
/**
 * RomanceSpace Template Validator
 * 
 * Checks:
 * 1. Template name (folder name): lowercase letters, numbers, and underscores only.
 * 2. Required files: index.html must exist.
 * 3. File size: No single file > 5MB.
 * 4. Content sanity: index.html should contain {{ or [[ for data injection.
 */

const fs = require('fs');
const path = require('path');

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const NAME_REGEX = /^[a-z0-9_]+$/;

function validate(tmplName, tmplDir) {
    console.log(`\n🔍 Validating template: [${tmplName}] ...`);
    let errors = [];

    // 1. Name Check
    if (!NAME_REGEX.test(tmplName)) {
        errors.push(`命名不符合规范: "${tmplName}"。只能包含小写字母、数字下划线（如: city_trace_map）。不允许空格或中文字符。`);
    }

    const resolvedPath = path.resolve(tmplDir);
    if (!fs.existsSync(resolvedPath)) {
        errors.push(`目录不存在: ${tmplDir}`);
        return errors;
    }

    // 2. Required Files Check
    const indexPath = path.join(resolvedPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
        errors.push(`缺少核心文件: index.html 是必需的。`);
    } else {
        // 4. Content sanity check
        const content = fs.readFileSync(indexPath, 'utf-8');
        if (!content.includes('{{') && !content.includes('[[')) {
            console.warn(`⚠️  警告: index.html 中未发现 {{ }} 或 [[ ]] 变量标签，请确保这不是上传错了库。`);
        }
    }

    // 3. File Size Check
    function checkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                checkDir(full);
            } else {
                const stats = fs.statSync(full);
                if (stats.size > MAX_FILE_SIZE_BYTES) {
                    errors.push(`文件过大: ${entry.name} (${(stats.size / 1024 / 1024).toFixed(2)}MB)。上限为 5MB。`);
                }
            }
        }
    }
    checkDir(resolvedPath);

    return errors;
}

// ── Main CLI ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node scripts/validate-template.js <templateName> <templateDir>');
    process.exit(1);
}

const name = args[0];
const dir = args[1];

const errs = validate(name, dir);

if (errs.length > 0) {
    console.error(`❌ 校验失败 [${name}]:`);
    errs.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
} else {
    console.log(`✅ [${name}] 校验通过！`);
    process.exit(0);
}
