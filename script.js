const mf = document.getElementById("currEq");

function init() {
    mf.mathVirtualKeyboardPolicy = "manual";
    mathVirtualKeyboard.layouts = ["minimalist"];
    mathVirtualKeyboard.hide();
    mf.menuItems = [];
    mf.focus();
}

const result = document.getElementById("result");

mf.addEventListener("input", () => {
    try {
        const value = math.evaluate(mf.getValue("ascii-math"));
        result.textContent = "= " + value;
    } catch {
        result.textContent = "";
    }
});

init();
