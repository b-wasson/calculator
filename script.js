let ce = null;

// Load CE in the background — init() runs immediately without waiting
(async () => {
    try {
        const { ComputeEngine } = await import('https://unpkg.com/@cortex-js/compute-engine?module');
        ce = new ComputeEngine();
        reevaluateAll();
    } catch (e) {
        console.warn('ComputeEngine failed to load:', e);
    }
})();

const assignedVars = new Set();

function evalLatex(latex) {
    if (!ce || !latex) return null;
    try {
        const result = ce.parse(latex).N();
        const val = result.numericValue;
        if (val === null || val === undefined) return null;
        // Plain JS number
        if (typeof val === 'number') {
            if (!isFinite(val)) return null;
            return parseFloat(val.toPrecision(10)).toString();
        }
        // Decimal.js bignum (has .toNumber())
        if (typeof val.toNumber === 'function') {
            const n = val.toNumber();
            if (!isFinite(n)) return null;
            return parseFloat(n.toPrecision(10)).toString();
        }
        return val.toString();
    } catch {
        return null;
    }
}

function updateScope() {
    for (const name of assignedVars) {
        try { ce.assign(name, undefined); } catch {}
    }
    assignedVars.clear();

    const rows = [...document.querySelectorAll(".var-row")];
    for (let pass = 0; pass < 2; pass++) {
        rows.forEach(row => {
            const mf = row.querySelector(".var-input");
            const ascii = mf.getValue("ascii-math");
            const latex = mf.getValue("latex");
            const aIdx = ascii.indexOf("=");
            const lIdx = latex.indexOf("=");
            if (aIdx === -1 || lIdx === -1) return;
            const name = ascii.slice(0, aIdx).trim();
            const valLatex = latex.slice(lIdx + 1).trim();
            if (!name || !valLatex) return;
            try {
                ce.assign(name, ce.parse(valLatex).N());
                assignedVars.add(name);
            } catch {}
        });
    }
    reevaluateAll();
}

function reevaluateAll() {
    document.querySelectorAll(".expr-row").forEach(row => {
        const mf = row.querySelector("math-field");
        const result = row.querySelector(".result");
        const val = evalLatex(mf.getValue("latex"));
        result.textContent = val !== null ? "= " + val : "";
    });
}

function createVarRow() {
    const row = document.createElement("div");
    row.className = "var-row";

    const mf = document.createElement("math-field");
    mf.className = "var-input";

    const del = document.createElement("button");
    del.className = "var-delete";
    del.textContent = "×";
    del.addEventListener("click", () => { row.remove(); updateScope(); });

    row.append(mf, del);
    document.getElementById("var-list").appendChild(row);

    mf.mathVirtualKeyboardPolicy = "manual";
    mf.menuItems = [];
    mf.addEventListener("input", updateScope);
    mf.focus();
}

function createRow() {
    const row = document.createElement("div");
    row.className = "expr-row";

    const mf = document.createElement("math-field");
    const result = document.createElement("span");
    result.className = "result";

    row.appendChild(mf);
    row.appendChild(result);
    document.getElementById("expressions").appendChild(row);

    mf.mathVirtualKeyboardPolicy = "manual";
    mf.menuItems = [];

    mf.addEventListener("input", () => {
        const val = evalLatex(mf.getValue("latex"));
        result.textContent = val !== null ? "= " + val : "";
    });

    mf.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            createRow();
        }
        if (event.key === "Backspace" && mf.getValue("ascii-math") === "") {
            const rows = document.querySelectorAll(".expr-row");
            if (rows.length > 1) {
                event.preventDefault();
                const prev = row.previousElementSibling;
                row.remove();
                prev.querySelector("math-field").focus();
            }
        }
    });

    mf.focus();
}

function init() {
    mathVirtualKeyboard.layouts = ["minimalist"];
    mathVirtualKeyboard.hide();
    createRow();
    document.getElementById("add-var").addEventListener("click", createVarRow);

    const overlay = document.getElementById("settings-overlay");
    document.getElementById("settings-btn").addEventListener("click", () => overlay.classList.add("open"));
    document.getElementById("settings-close").addEventListener("click", () => overlay.classList.remove("open"));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });

    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            if (ce) {
                try { ce.angularUnit = btn.dataset.value; } catch {}
                reevaluateAll();
            }
        });
    });
}

init();
