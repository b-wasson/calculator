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
            result.textContent = "= " + math.evaluate(mf.getValue("ascii-math"));
        } catch {
            result.textContent = "";
        }
    });

    mf.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            createRow().focus();
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
    return mf;
}

function init() {
    mathVirtualKeyboard.layouts = ["minimalist"];
    mathVirtualKeyboard.hide();
    createRow();
}

init();
