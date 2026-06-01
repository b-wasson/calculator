const scope = {};

function updateScope() {
    for (const key of Object.keys(scope)) delete scope[key];
    document.querySelectorAll(".var-row").forEach(row => {
        const raw = row.querySelector(".var-input").getValue("ascii-math");
        const idx = raw.indexOf("=");
        if (idx === -1) return;
        const name = raw.slice(0, idx).trim();
        const val = raw.slice(idx + 1).trim();
        if (name && val) {
            try { scope[name] = math.evaluate(val); } catch {}
        }
    });
    reevaluateAll();
}

function reevaluateAll() {
    document.querySelectorAll(".expr-row").forEach(row => {
        const mf = row.querySelector("math-field");
        const result = row.querySelector(".result");
        try {
            result.textContent = "= " + math.evaluate(mf.getValue("ascii-math"), { ...scope });
        } catch {
            result.textContent = "";
        }
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
        try {
            result.textContent = "= " + math.evaluate(mf.getValue("ascii-math"), { ...scope });
        } catch {
            result.textContent = "";
        }
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
}

init();
