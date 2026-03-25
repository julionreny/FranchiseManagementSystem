const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// UPDATED PATHS as we are now in scripts/ directory
const POSTMAN_DIR = path.join(__dirname, '..', '..', 'postman');
const COLLECTIONS_DIR = path.join(POSTMAN_DIR, 'collections', 'Franchise Management System API');
const ENV_FILE = path.join(POSTMAN_DIR, 'environments', 'local.environment.yaml');
const LOG_FILE = path.join(__dirname, '..', 'test-results.txt'); // Outputs to backend root

let env = {};
let logData = "";

function log(msg) {
    console.log(msg);
    logData += msg + "\n";
}

function loadEnv() {
    try {
        const envData = yaml.load(fs.readFileSync(ENV_FILE, 'utf8'));
        envData.values.forEach(item => {
            env[item.key] = item.value;
        });
        log("Environment loaded: " + Object.keys(env).join(", "));
    } catch (e) {
        log("Failed to load environment: " + e.message);
    }
}

function replaceVars(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{\{(.*?)\}\}/g, (match, key) => env[key] || match);
}

let currentResponse = null;

const pm = {
    test: (name, fn) => {
        try {
            fn();
            log("   PASS: " + name);
        } catch (e) {
            log("   FAIL: " + name + " (" + e.message + ")");
        }
    },
    expect: (val) => {
        const createHandler = (v) => {
            const fn = function(t) {
                if (typeof t === 'string') {
                    if (t === 'array' && !Array.isArray(v)) throw new Error(`Expected array`);
                    if (t === 'object' && (typeof v !== 'object' || v === null)) throw new Error(`Expected object`);
                    if (typeof v !== t && t !== 'array' && t !== 'object') throw new Error(`Expected ${t}`);
                }
                return createHandler(v);
            };

            return new Proxy(fn, {
                get: (target, prop) => {
                    const chainables = ['to', 'be', 'have', 'an', 'a', 'at', 'is', 'that', 'and', 'which', 'members', 'length', 'include'];
                    if (chainables.includes(prop)) {
                         if (prop === 'length') return createHandler(v ? v.length : 0);
                         return createHandler(v);
                    }

                    if (prop === 'oneOf') return (arr) => { if (!arr.includes(v)) throw new Error(`Not in [${arr}]`); return createHandler(v); };
                    if (prop === 'status') return (s) => { if (v !== s) throw new Error(`Expected ${s} got ${v}`); return createHandler(v); };
                    if (prop === 'property') return (p) => { 
                        if (!v || typeof v !== 'object' || !(p in v)) throw new Error(`Prop ${p} missing`);
                        return createHandler(v[p]);
                    };
                    if (prop === 'keys') return (...k) => { const ak = Object.keys(v || {}); k.flat().forEach(x => { if (!ak.includes(x)) throw new Error(`Key ${x} missing`); }); return createHandler(v); };
                    if (prop === 'least') return (n) => { if (v < n) throw new Error(`At least ${n} required`); return createHandler(v); };
                    if (prop === 'match') return (r) => { if (typeof v !== 'string' || !r.test(v)) throw new Error(`Regex mismatch`); return createHandler(v); };
                    if (prop === 'satisfy') return (f) => { if (!f(v)) throw new Error(`Condition failed`); return createHandler(v); };
                    if (prop === 'include') return (s) => { if (typeof v !== 'string' || !v.includes(s)) throw new Error(`Missing ${s}`); return createHandler(v); };
                    if (prop === 'equal') return (o) => { if (v !== o) throw new Error(`Expected ${o} got ${v}`); return createHandler(v); };
                    if (prop === 'members') return (m) => { m.forEach(x => { if (!v.includes(x)) throw new Error(`Missing member ${x}`); }); return createHandler(v); };
                    
                    if (prop === 'array') { if (!Array.isArray(v)) throw new Error(`Expected array`); return createHandler(v); }
                    if (prop === 'object') { if (typeof v !== 'object' || v === null) throw new Error(`Expected object`); return createHandler(v); }

                    return target[prop];
                }
            });
        };
        return createHandler(val);
    },
    response: {
        get code() { return currentResponse ? currentResponse.status : 0; },
        json: () => currentResponse ? currentResponse.data : {},
        get to() { return pm.expect(this.code).to; },
        headers: {
            get: (name) => currentResponse?.headers?.[name.toLowerCase()]
        }
    },
    environment: {
        set: (key, val) => {
            env[key] = val;
            log(`      [Env Set] ${key} = ${val}`);
        },
        get: (key) => env[key]
    }
};

async function runRequest(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const reqData = yaml.load(fileContent);
        
        if (reqData.name === "Delete Branch" || reqData.name === "Delete Employee" || reqData.name === "Delete Inventory Item") {
             log(`\nSKIPPING: [${reqData.method}] ${reqData.name}`);
             return true;
        }

        const method = reqData.method || 'GET';
        const url = replaceVars(reqData.url);
        
        let axiosConfig = {
            method: method,
            url: url,
            validateStatus: () => true,
            timeout: 10000, // INCREASED TIMEOUT
            headers: {}
        };

        if (reqData.headers) {
            reqData.headers.forEach(h => {
                axiosConfig.headers[h.key] = replaceVars(h.value);
            });
        }

        if (reqData.body && reqData.body.content) {
            try {
                const bodyStr = replaceVars(reqData.body.content);
                axiosConfig.data = JSON.parse(bodyStr);
            } catch (e) {
                axiosConfig.data = replaceVars(reqData.body.content);
            }
        }

        log(`\nREQUEST: [${method}] ${reqData.name} -> ${url}`);
        
        const response = await axios(axiosConfig);
        currentResponse = response;
        log(`   Status: ${response.status}`);

        if (response.status >= 500) {
            log(`      Error Response: ${JSON.stringify(response.data)}`);
        }

        if (reqData.scripts) {
            reqData.scripts.forEach(s => {
                if (s.type === 'afterResponse' && s.code) {
                    try {
                        const scriptFn = new Function('pm', s.code);
                        scriptFn(pm);
                    } catch (e) {
                        log(`   Script Execution Error: ${e.message}`);
                    }
                }
            });
        }
        return true;
    } catch (e) {
        log(`   Request Error: ${e.message}`);
        return false;
    }
}

async function runFolder(folderName) {
    const folderPath = path.join(COLLECTIONS_DIR, folderName);
    if (!fs.existsSync(folderPath)) {
        log(`Folder ${folderName} not found.`);
        return;
    }

    log(`\n--- FOLDER: ${folderName} ---`);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.yaml')).sort();
    for (const file of files) {
        await runRequest(path.join(folderPath, file));
    }
}

async function main() {
    loadEnv();
    const folders = ['Auth', 'Franchises', 'Branches', 'Employees', 'Inventory', 'Sales', 'Expenses', 'Owner Views', 'Notifications', 'Dashboard', 'Reports'];
    for (const folder of folders) {
        await runFolder(folder);
    }
    log("\nAll tests completed.");
    fs.writeFileSync(LOG_FILE, logData, 'utf8');
}

main();
